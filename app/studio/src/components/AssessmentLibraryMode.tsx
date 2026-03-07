import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";

import {
  deleteAssessmentProject,
  exportAssessmentProject,
  fetchAssessmentItem,
  fetchAssessmentSummaries,
  importAssessmentFiles,
  saveAssessmentProject
} from "../lib/assessments";
import type {
  AssessmentChoice,
  AssessmentExportResult,
  AssessmentLibraryItem,
  AssessmentLibrarySummary,
  AssessmentProject,
  AssessmentQuestion,
  AssessmentQuestionType
} from "../lib/assessment-types";

const QUESTION_TYPES: AssessmentQuestionType[] = [
  "multiple_choice",
  "true_false",
  "multi_select",
  "short_answer",
  "written_response",
  "matching",
  "ordering"
];

function createIdentifier(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultChoices(questionId: string, type: AssessmentQuestionType): AssessmentChoice[] {
  if (type === "multiple_choice" || type === "multi_select") {
    return ["A", "B", "C", "D"].map((label, index) => ({
      choiceId: `${questionId}_choice_${label.toLowerCase()}`,
      label,
      text: "",
      isCorrect: false,
      orderIndex: index,
      matchKey: null,
      fixedPosition: null,
      matchRole: null
    }));
  }
  if (type === "true_false") {
    return [
      {
        choiceId: `${questionId}_choice_true`,
        label: "T",
        text: "True",
        isCorrect: false,
        orderIndex: 0,
        matchKey: null,
        fixedPosition: null,
        matchRole: null
      },
      {
        choiceId: `${questionId}_choice_false`,
        label: "F",
        text: "False",
        isCorrect: false,
        orderIndex: 1,
        matchKey: null,
        fixedPosition: null,
        matchRole: null
      }
    ];
  }
  if (type === "matching") {
    return [
      {
        choiceId: `${questionId}_prompt_1`,
        label: "P1",
        text: "",
        isCorrect: false,
        orderIndex: 0,
        matchKey: "pair_1",
        fixedPosition: null,
        matchRole: "prompt"
      },
      {
        choiceId: `${questionId}_match_1`,
        label: "M1",
        text: "",
        isCorrect: false,
        orderIndex: 1,
        matchKey: "pair_1",
        fixedPosition: null,
        matchRole: "match"
      }
    ];
  }
  if (type === "ordering") {
    return [
      {
        choiceId: `${questionId}_step_1`,
        label: "1",
        text: "",
        isCorrect: false,
        orderIndex: 0,
        matchKey: null,
        fixedPosition: true,
        matchRole: null
      },
      {
        choiceId: `${questionId}_step_2`,
        label: "2",
        text: "",
        isCorrect: false,
        orderIndex: 1,
        matchKey: null,
        fixedPosition: null,
        matchRole: null
      }
    ];
  }
  return [];
}

function createDraftQuestion(type: AssessmentQuestionType): AssessmentQuestion {
  const questionId = createIdentifier("question");
  return {
    questionId,
    sectionId: null,
    type,
    prompt: "",
    stemRichText: null,
    choices: createDefaultChoices(questionId, type),
    correctAnswers: [],
    points: 1,
    feedbackCorrect: "",
    feedbackIncorrect: "",
    explanation: "",
    sourceReference: "",
    sourcePage: null,
    originText: "",
    confidenceScore: null,
    answerStatus: "missing",
    reviewStatus: "draft",
    exportNotes: "",
    metadataTags: []
  };
}

function toQuestionTypeLabel(type: AssessmentQuestionType) {
  return type.replaceAll("_", " ");
}

function parseTagInput(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function getStringAnswers(question: AssessmentQuestion) {
  return (question.correctAnswers as string[]).filter((value) => typeof value === "string");
}

function downloadCsv(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export function AssessmentLibraryMode() {
  const [summaries, setSummaries] = useState<AssessmentLibrarySummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [item, setItem] = useState<AssessmentLibraryItem | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [nextQuestionType, setNextQuestionType] = useState<AssessmentQuestionType>("multiple_choice");
  const [importSlug, setImportSlug] = useState("");
  const [importTitle, setImportTitle] = useState("");
  const [statusMessage, setStatusMessage] = useState("Assessment library ready.");
  const [isBusy, setIsBusy] = useState(false);
  const [exportResult, setExportResult] = useState<AssessmentExportResult | null>(null);
  const deferredItem = useDeferredValue(item);

  const selectedQuestion = useMemo(
    () => item?.project.questions.find((question) => question.questionId === selectedQuestionId) ?? null,
    [item, selectedQuestionId]
  );

  async function refreshSummaries(preferredSlug?: string) {
    const nextSummaries = await fetchAssessmentSummaries();
    setSummaries(nextSummaries);
    const fallbackSlug = preferredSlug ?? selectedSlug ?? nextSummaries[0]?.slug ?? "";
    setSelectedSlug(fallbackSlug);
    return nextSummaries;
  }

  async function loadItem(slug: string) {
    if (!slug) {
      setItem(null);
      setSelectedQuestionId(null);
      return;
    }
    const nextItem = await fetchAssessmentItem(slug);
    startTransition(() => {
      setItem(nextItem);
      setSelectedQuestionId(nextItem.project.questions[0]?.questionId ?? null);
    });
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await fetchAssessmentSummaries();
        if (cancelled) {
          return;
        }
        setSummaries(list);
        setSelectedSlug((current) => current || list[0]?.slug || "");
      } catch (error) {
        if (!cancelled) {
          setStatusMessage(error instanceof Error ? error.message : "Failed to load assessment library.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!selectedSlug) {
        setItem(null);
        setSelectedQuestionId(null);
        return;
      }
      try {
        const nextItem = await fetchAssessmentItem(selectedSlug);
        if (cancelled) {
          return;
        }
        setItem(nextItem);
        setSelectedQuestionId((current) => current && nextItem.project.questions.some((question) => question.questionId === current) ? current : nextItem.project.questions[0]?.questionId ?? null);
      } catch (error) {
        if (!cancelled) {
          setStatusMessage(error instanceof Error ? error.message : "Failed to load selected assessment.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedSlug]);

  function updateProject(updater: (project: AssessmentProject) => AssessmentProject) {
    setItem((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        project: updater(current.project)
      };
    });
  }

  function updateQuestion(questionId: string, updater: (question: AssessmentQuestion) => AssessmentQuestion) {
    updateProject((project) => ({
      ...project,
      questions: project.questions.map((question) => (question.questionId === questionId ? updater(question) : question))
    }));
  }

  function addQuestion() {
    const draft = createDraftQuestion(nextQuestionType);
    updateProject((project) => ({
      ...project,
      questions: [...project.questions, draft]
    }));
    setSelectedQuestionId(draft.questionId);
  }

  function deleteQuestion(questionId: string) {
    updateProject((project) => {
      const nextQuestions = project.questions.filter((question) => question.questionId !== questionId);
      return {
        ...project,
        questions: nextQuestions
      };
    });
    setSelectedQuestionId((current) => (current === questionId ? null : current));
  }

  function moveQuestion(questionId: string, direction: "up" | "down") {
    updateProject((project) => {
      const index = project.questions.findIndex((question) => question.questionId === questionId);
      if (index < 0) {
        return project;
      }
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= project.questions.length) {
        return project;
      }
      const nextQuestions = [...project.questions];
      const [target] = nextQuestions.splice(index, 1);
      nextQuestions.splice(nextIndex, 0, target);
      return {
        ...project,
        questions: nextQuestions
      };
    });
  }

  async function handleImport(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    setIsBusy(true);
    try {
      const nextItem = await importAssessmentFiles(files, {
        slug: importSlug.trim() || undefined,
        title: importTitle.trim() || undefined
      });
      await refreshSummaries(nextItem.slug);
      setItem(nextItem);
      setSelectedSlug(nextItem.slug);
      setSelectedQuestionId(nextItem.project.questions[0]?.questionId ?? null);
      setExportResult(null);
      setStatusMessage(`Imported ${files.length} source file(s) into "${nextItem.slug}".`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Assessment import failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSave() {
    if (!item) {
      return;
    }
    setIsBusy(true);
    try {
      const saved = await saveAssessmentProject(item.slug, item.project);
      setItem(saved);
      await refreshSummaries(saved.slug);
      setStatusMessage(`Saved assessment "${saved.slug}".`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Assessment save failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete() {
    if (!item) {
      return;
    }
    if (!window.confirm(`Delete assessment "${item.slug}"?`)) {
      return;
    }
    setIsBusy(true);
    try {
      await deleteAssessmentProject(item.slug);
      const list = await refreshSummaries();
      const nextSlug = list[0]?.slug ?? "";
      setSelectedSlug(nextSlug);
      setItem(null);
      setSelectedQuestionId(null);
      setExportResult(null);
      setStatusMessage(`Deleted "${item.slug}".`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleExport() {
    if (!item) {
      return;
    }
    setIsBusy(true);
    try {
      const result = await exportAssessmentProject(item.slug);
      setExportResult(result);
      if (result.status === "success" && result.content) {
        downloadCsv(result.fileName, result.content);
      }
      await loadItem(item.slug);
      setStatusMessage(result.status === "success" ? `Exported ${result.fileName}.` : "Export returned validation errors.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setIsBusy(false);
    }
  }

  function renderChoiceEditor(question: AssessmentQuestion) {
    if (question.type === "written_response") {
      return null;
    }

    if (question.type === "short_answer") {
      return (
        <div className="assessment-subsection">
          <h4>Accepted answers</h4>
          <textarea
            rows={4}
            value={getStringAnswers(question).join("\n")}
            onChange={(event) => {
              const answers = event.target.value
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length > 0);
              updateQuestion(question.questionId, (current) => ({ ...current, correctAnswers: answers }));
            }}
          />
        </div>
      );
    }

    if (question.type === "matching") {
      const promptChoices = question.choices.filter((choice) => choice.matchRole === "prompt").sort((a, b) => a.orderIndex - b.orderIndex);
      const matchChoices = question.choices.filter((choice) => choice.matchRole === "match").sort((a, b) => a.orderIndex - b.orderIndex);
      const pairCount = Math.max(promptChoices.length, matchChoices.length);

      return (
        <div className="assessment-subsection">
          <h4>Matching pairs</h4>
          {Array.from({ length: pairCount }).map((_, index) => {
            const promptChoice = promptChoices[index];
            const matchChoice = matchChoices[index];
            return (
              <div key={`pair-${index}`} className="assessment-matching-row">
                <input
                  value={promptChoice?.text ?? ""}
                  placeholder="Prompt"
                  onChange={(event) => {
                    if (!promptChoice) {
                      return;
                    }
                    updateQuestion(question.questionId, (current) => ({
                      ...current,
                      choices: current.choices.map((choice) =>
                        choice.choiceId === promptChoice.choiceId ? { ...choice, text: event.target.value } : choice
                      )
                    }));
                  }}
                />
                <input
                  value={matchChoice?.text ?? ""}
                  placeholder="Match"
                  onChange={(event) => {
                    if (!matchChoice) {
                      return;
                    }
                    updateQuestion(question.questionId, (current) => ({
                      ...current,
                      choices: current.choices.map((choice) =>
                        choice.choiceId === matchChoice.choiceId ? { ...choice, text: event.target.value } : choice
                      )
                    }));
                  }}
                />
              </div>
            );
          })}
          <button
            type="button"
            className="ghost-button compact"
            onClick={() => {
              updateQuestion(question.questionId, (current) => {
                const prompts = current.choices.filter((choice) => choice.matchRole === "prompt");
                const matches = current.choices.filter((choice) => choice.matchRole === "match");
                const nextIndex = Math.max(prompts.length, matches.length) + 1;
                const matchKey = `pair_${nextIndex}`;
                return {
                  ...current,
                  choices: [
                    ...current.choices,
                    {
                      choiceId: `${current.questionId}_prompt_${nextIndex}`,
                      label: `P${nextIndex}`,
                      text: "",
                      isCorrect: false,
                      orderIndex: nextIndex - 1,
                      matchKey,
                      fixedPosition: null,
                      matchRole: "prompt"
                    },
                    {
                      choiceId: `${current.questionId}_match_${nextIndex}`,
                      label: `M${nextIndex}`,
                      text: "",
                      isCorrect: false,
                      orderIndex: prompts.length + matches.length + 1,
                      matchKey,
                      fixedPosition: null,
                      matchRole: "match"
                    }
                  ]
                };
              });
            }}
          >
            Add pair
          </button>
        </div>
      );
    }

    return (
      <div className="assessment-subsection">
        <h4>Choices</h4>
        {question.choices
          .slice()
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((choice) => (
            <div key={choice.choiceId} className="assessment-choice-row">
              <span>{choice.label}</span>
              <input
                value={choice.text}
                onChange={(event) => {
                  updateQuestion(question.questionId, (current) => ({
                    ...current,
                    choices: current.choices.map((entry) => (entry.choiceId === choice.choiceId ? { ...entry, text: event.target.value } : entry))
                  }));
                }}
              />
              <label className="assessment-toggle">
                <input
                  type={question.type === "multi_select" ? "checkbox" : "radio"}
                  name={question.questionId}
                  checked={choice.isCorrect}
                  onChange={(event) => {
                    updateQuestion(question.questionId, (current) => ({
                      ...current,
                      choices: current.choices.map((entry) => {
                        if (entry.choiceId === choice.choiceId) {
                          return { ...entry, isCorrect: event.target.checked };
                        }
                        if (question.type === "multi_select") {
                          return entry;
                        }
                        return { ...entry, isCorrect: false };
                      })
                    }));
                  }}
                />
                correct
              </label>
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="assessment-mode">
      <div className="assessment-status">{statusMessage}</div>
      <div className="assessment-shell">
        <aside className="assessment-column">
          <div className="assessment-card">
            <h3>Assessment Library</h3>
            <button type="button" className="ghost-button compact" onClick={() => void refreshSummaries()}>
              Refresh
            </button>
            <div className="assessment-list">
              {summaries.map((summary) => (
                <button
                  type="button"
                  key={summary.slug}
                  className={`assessment-list-item ${summary.slug === selectedSlug ? "active" : ""}`}
                  onClick={() => setSelectedSlug(summary.slug)}
                >
                  <strong>{summary.title || summary.slug}</strong>
                  <span>{summary.questionCount} questions</span>
                </button>
              ))}
            </div>
          </div>
          <div className="assessment-card">
            <h3>Import PDF/DOCX</h3>
            <label>Slug (optional)</label>
            <input value={importSlug} onChange={(event) => setImportSlug(event.target.value)} placeholder="assessment-slug" />
            <label>Title (optional)</label>
            <input value={importTitle} onChange={(event) => setImportTitle(event.target.value)} placeholder="Assessment title" />
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple
              disabled={isBusy}
              onChange={(event) => {
                void handleImport(event.target.files);
                event.target.value = "";
              }}
            />
          </div>
        </aside>

        <section className="assessment-column assessment-editor-column">
          <div className="assessment-card">
            <div className="assessment-card-header">
              <h3>Project Metadata</h3>
              <div className="assessment-card-actions">
                <button type="button" className="ghost-button compact" onClick={() => void handleSave()} disabled={isBusy || !item}>
                  Save
                </button>
                <button type="button" className="ghost-button compact danger" onClick={() => void handleDelete()} disabled={isBusy || !item}>
                  Delete
                </button>
              </div>
            </div>
            {item ? (
              <>
                <label>Title</label>
                <input value={item.project.title} onChange={(event) => updateProject((project) => ({ ...project, title: event.target.value }))} />
                <label>Description</label>
                <textarea rows={3} value={item.project.description} onChange={(event) => updateProject((project) => ({ ...project, description: event.target.value }))} />
                <label>Course name</label>
                <input value={item.project.courseName} onChange={(event) => updateProject((project) => ({ ...project, courseName: event.target.value }))} />
                <label>Subject tags (comma separated)</label>
                <input
                  value={item.project.subjectTags.join(", ")}
                  onChange={(event) =>
                    updateProject((project) => ({
                      ...project,
                      subjectTags: parseTagInput(event.target.value)
                    }))
                  }
                />
              </>
            ) : (
              <p>No assessment selected. Import one or choose from the library list.</p>
            )}
          </div>

          {item ? (
            <div className="assessment-card">
              <div className="assessment-card-header">
                <h3>Question Outline</h3>
                <div className="assessment-card-actions">
                  <select value={nextQuestionType} onChange={(event) => setNextQuestionType(event.target.value as AssessmentQuestionType)}>
                    {QUESTION_TYPES.map((type) => (
                      <option value={type} key={type}>
                        {toQuestionTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="ghost-button compact" onClick={addQuestion}>
                    Add
                  </button>
                </div>
              </div>
              <div className="assessment-question-list">
                {item.project.questions.map((question, index) => (
                  <div key={question.questionId} className={`assessment-question-item ${question.questionId === selectedQuestionId ? "active" : ""}`}>
                    <button type="button" className="assessment-question-trigger" onClick={() => setSelectedQuestionId(question.questionId)}>
                      <strong>
                        {index + 1}. {question.prompt.trim() || "(untitled question)"}
                      </strong>
                      <span>{toQuestionTypeLabel(question.type)}</span>
                    </button>
                    <div className="assessment-item-actions">
                      <button type="button" className="ghost-button compact" onClick={() => moveQuestion(question.questionId, "up")}>
                        Up
                      </button>
                      <button type="button" className="ghost-button compact" onClick={() => moveQuestion(question.questionId, "down")}>
                        Down
                      </button>
                      <button type="button" className="ghost-button compact danger" onClick={() => deleteQuestion(question.questionId)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {selectedQuestion ? (
            <div className="assessment-card">
              <h3>Question Editor</h3>
              <label>Prompt</label>
              <textarea
                rows={4}
                value={selectedQuestion.prompt}
                onChange={(event) => updateQuestion(selectedQuestion.questionId, (question) => ({ ...question, prompt: event.target.value }))}
              />
              <label>Type</label>
              <select
                value={selectedQuestion.type}
                onChange={(event) => {
                  const nextType = event.target.value as AssessmentQuestionType;
                  updateQuestion(selectedQuestion.questionId, (question) => ({
                    ...question,
                    type: nextType,
                    choices: createDefaultChoices(question.questionId, nextType),
                    correctAnswers: []
                  }));
                }}
              >
                {QUESTION_TYPES.map((type) => (
                  <option value={type} key={type}>
                    {toQuestionTypeLabel(type)}
                  </option>
                ))}
              </select>
              <label>Points</label>
              <input
                type="number"
                min={0}
                step={1}
                value={selectedQuestion.points}
                onChange={(event) =>
                  updateQuestion(selectedQuestion.questionId, (question) => ({
                    ...question,
                    points: Number(event.target.value) || 0
                  }))
                }
              />
              {renderChoiceEditor(selectedQuestion)}
            </div>
          ) : null}
        </section>

        <aside className="assessment-column">
          <div className="assessment-card">
            <h3>Validation</h3>
            {deferredItem?.validation ? (
              <>
                <p>
                  {deferredItem.validation.errors.length} errors, {deferredItem.validation.warnings.length} warnings
                </p>
                <div className="assessment-issue-list">
                  {deferredItem.validation.issues.slice(0, 30).map((issue) => (
                    <div key={`${issue.code}-${issue.path.join(".")}`} className={`assessment-issue ${issue.severity}`}>
                      <strong>{issue.code}</strong>
                      <span>{issue.message}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>No validation data yet.</p>
            )}
          </div>
          <div className="assessment-card">
            <h3>Brightspace Export</h3>
            <button type="button" className="ghost-button compact" onClick={() => void handleExport()} disabled={isBusy || !item}>
              Export CSV
            </button>
            {exportResult ? (
              <>
                <p>
                  {exportResult.status} | rows: {exportResult.rows.length}
                </p>
                <div className="assessment-issue-list">
                  {exportResult.diagnostics.map((diag, index) => (
                    <div key={`${diag.code}-${index}`} className={`assessment-issue ${diag.severity === "error" ? "error" : "warning"}`}>
                      <strong>{diag.code}</strong>
                      <span>{diag.message}</span>
                    </div>
                  ))}
                </div>
                <textarea rows={12} value={exportResult.content ?? ""} readOnly />
              </>
            ) : null}
          </div>
          <div className="assessment-card">
            <h3>Last Import</h3>
            {item?.importResult ? (
              <div className="assessment-import-summary">
                <p>{item.importResult.mergedQuestionCount} merged questions</p>
                <ul>
                  {item.importResult.sourceResults.map((source) => (
                    <li key={source.sourcePath}>
                      {source.fileName} | {source.questionCount} q | {source.confidenceScore.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No import run recorded for this item.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
