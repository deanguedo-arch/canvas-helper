import { useState, type ChangeEvent } from 'react'
import type { AssessmentProject } from '../../core/schema/assessment'
import { questionTypes } from '../../core/schema/enums'
import type { Question } from '../../core/schema/question'
import type { StoredProjectSummary } from '../../storage/shared/repositoryTypes'
import { listMatchingPairs } from '../state/projectStore'

type ProjectEditorProps = {
  activeProjectId: string | null
  currentProject: AssessmentProject | null
  savedProjects: StoredProjectSummary[]
  selectedQuestionId: string | null
  selectedQuestion: Question | null
  onCreateProject: () => void
  onDeleteSavedProject: (projectId: string) => void
  onLoadProject: (projectId: string) => void
  onSaveProject: () => void
  onSelectQuestion: (questionId: string) => void
  onUpdateProjectMetadata: (
    updates: Partial<
      Pick<AssessmentProject, 'title' | 'description' | 'courseName'>
    > & {
      subjectTags?: string[]
    },
  ) => void
  onAddQuestion: (type: Question['type']) => void
  onChangeQuestionType: (questionId: string, type: Question['type']) => void
  onDeleteQuestion: (questionId: string) => void
  onMoveQuestion: (questionId: string, direction: 'up' | 'down') => void
  onUpdateQuestion: (
    questionId: string,
    updater: (question: Question) => Question,
  ) => void
  onAddChoice: (questionId: string) => void
  onMoveChoice: (questionId: string, choiceId: string, direction: 'up' | 'down') => void
  onRemoveChoice: (questionId: string, choiceId: string) => void
  onAddMatchingPair: (questionId: string) => void
  onRemoveMatchingPair: (questionId: string, matchKey: string) => void
  onImportSourceFiles: (files: FileList | null) => Promise<void>
  isImportingSources: boolean
}

const questionTypeLabels: Record<Question['type'], string> = {
  multiple_choice: 'Multiple choice',
  true_false: 'True / false',
  multi_select: 'Multi-select',
  short_answer: 'Short answer',
  written_response: 'Written response',
  matching: 'Matching',
  ordering: 'Ordering',
}

function parseTagInput(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

function parseLineInput(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString()
}

export function ProjectEditor({
  activeProjectId,
  currentProject,
  savedProjects,
  selectedQuestionId,
  selectedQuestion,
  onCreateProject,
  onDeleteSavedProject,
  onLoadProject,
  onSaveProject,
  onSelectQuestion,
  onUpdateProjectMetadata,
  onAddQuestion,
  onChangeQuestionType,
  onDeleteQuestion,
  onMoveQuestion,
  onUpdateQuestion,
  onAddChoice,
  onMoveChoice,
  onRemoveChoice,
  onAddMatchingPair,
  onRemoveMatchingPair,
  onImportSourceFiles,
  isImportingSources,
}: ProjectEditorProps) {
  const [nextQuestionType, setNextQuestionType] = useState<Question['type']>('multiple_choice')

  function handleSourceImport(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.target
    void onImportSourceFiles(files)
    event.target.value = ''
  }

  if (!currentProject) {
    return (
      <section className="workspace-panel">
        <h2>Project Editor</h2>
        <p>No project is loaded.</p>
      </section>
    )
  }

  return (
    <section className="workspace">
      <aside className="workspace-sidebar">
        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Saved Projects</p>
              <h2>Local Library</h2>
            </div>
            <button type="button" className="secondary-button" onClick={onCreateProject}>
              New
            </button>
          </div>
          {savedProjects.length === 0 ? (
            <p className="muted-text">No saved projects yet. Save the current draft to start a local library.</p>
          ) : (
            <div className="saved-project-list">
              {savedProjects.map((project) => (
                <article
                  key={project.projectId}
                  className={
                    project.projectId === activeProjectId
                      ? 'saved-project-card active'
                      : 'saved-project-card'
                  }
                >
                  <button
                    type="button"
                    className="saved-project-trigger"
                    onClick={() => onLoadProject(project.projectId)}
                  >
                    <strong>{project.title || 'Untitled Assessment'}</strong>
                    <span>{project.questionCount} questions</span>
                    <span>Updated {formatTimestamp(project.updatedAt)}</span>
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => onDeleteSavedProject(project.projectId)}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Question Outline</p>
              <h2>Draft Items</h2>
            </div>
          </div>
          <div className="inline-form">
            <select
              value={nextQuestionType}
              onChange={(event) => setNextQuestionType(event.target.value as Question['type'])}
            >
              {questionTypes.map((type) => (
                <option key={type} value={type}>
                  {questionTypeLabels[type]}
                </option>
              ))}
            </select>
            <button type="button" className="primary-button" onClick={() => onAddQuestion(nextQuestionType)}>
              Add
            </button>
          </div>
          {currentProject.questions.length === 0 ? (
            <p className="muted-text">Add a question type to start the draft.</p>
          ) : (
            <div className="question-list">
              {currentProject.questions.map((question, index) => (
                <article
                  key={question.questionId}
                  className={
                    question.questionId === selectedQuestionId
                      ? 'question-list-item active'
                      : 'question-list-item'
                  }
                >
                  <button
                    type="button"
                    className="question-list-trigger"
                    onClick={() => onSelectQuestion(question.questionId)}
                  >
                    <span className="question-order">{index + 1}</span>
                    <div>
                      <strong>{question.prompt.trim() || 'Untitled question'}</strong>
                      <p>{questionTypeLabels[question.type]}</p>
                    </div>
                  </button>
                  <div className="item-actions">
                    <button type="button" onClick={() => onMoveQuestion(question.questionId, 'up')}>
                      Up
                    </button>
                    <button type="button" onClick={() => onMoveQuestion(question.questionId, 'down')}>
                      Down
                    </button>
                    <button type="button" className="danger-button" onClick={() => onDeleteQuestion(question.questionId)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </aside>

      <div className="workspace-main">
        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Project Metadata</p>
              <h2>{currentProject.title}</h2>
            </div>
            <button type="button" className="secondary-button" onClick={onSaveProject}>
              Save locally
            </button>
          </div>
          <div className="import-strip">
            <label className="import-control">
              Import `.docx` / `.pdf`
              <input
                type="file"
                accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
                onChange={handleSourceImport}
                disabled={isImportingSources}
              />
            </label>
            <p className="muted-text">
              Imports create `written_response` draft questions marked `needs_review`.
            </p>
          </div>
          <div className="form-grid">
            <label>
              Title
              <input
                value={currentProject.title}
                onChange={(event) =>
                  onUpdateProjectMetadata({ title: event.target.value })
                }
              />
            </label>
            <label>
              Course name
              <input
                value={currentProject.courseName}
                onChange={(event) =>
                  onUpdateProjectMetadata({ courseName: event.target.value })
                }
              />
            </label>
            <label className="full-width">
              Description
              <textarea
                rows={3}
                value={currentProject.description}
                onChange={(event) =>
                  onUpdateProjectMetadata({ description: event.target.value })
                }
              />
            </label>
            <label className="full-width">
              Subject tags
              <input
                value={currentProject.subjectTags.join(', ')}
                onChange={(event) =>
                  onUpdateProjectMetadata({
                    subjectTags: parseTagInput(event.target.value),
                  })
                }
                placeholder="biology, ecosystems, unit-3"
              />
            </label>
          </div>
        </section>

        <section className="workspace-panel">
          {selectedQuestion ? (
            <>
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Question Detail</p>
                  <h2>{selectedQuestion.prompt.trim() || 'Untitled question'}</h2>
                </div>
                <span className="question-id">{selectedQuestion.questionId}</span>
              </div>

              <div className="form-grid">
                <label className="full-width">
                  Prompt
                  <textarea
                    rows={4}
                    value={selectedQuestion.prompt}
                    onChange={(event) =>
                      onUpdateQuestion(selectedQuestion.questionId, (question) => ({
                        ...question,
                        prompt: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Question type
                  <select
                    value={selectedQuestion.type}
                    onChange={(event) =>
                      onChangeQuestionType(
                        selectedQuestion.questionId,
                        event.target.value as Question['type'],
                      )
                    }
                  >
                    {questionTypes.map((type) => (
                      <option key={type} value={type}>
                        {questionTypeLabels[type]}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Points
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={selectedQuestion.points}
                    onChange={(event) =>
                      onUpdateQuestion(selectedQuestion.questionId, (question) => ({
                        ...question,
                        points: Number(event.target.value),
                      }))
                    }
                  />
                </label>

                <label>
                  Answer status
                  <select
                    value={selectedQuestion.answerStatus}
                    onChange={(event) =>
                      onUpdateQuestion(selectedQuestion.questionId, (question) => ({
                        ...question,
                        answerStatus: event.target.value as Question['answerStatus'],
                      }))
                    }
                  >
                    <option value="missing">Missing</option>
                    <option value="inferred">Inferred</option>
                    <option value="verified">Verified</option>
                  </select>
                </label>

                <label>
                  Review status
                  <select
                    value={selectedQuestion.reviewStatus}
                    onChange={(event) =>
                      onUpdateQuestion(selectedQuestion.questionId, (question) => ({
                        ...question,
                        reviewStatus: event.target.value as Question['reviewStatus'],
                      }))
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="needs_review">Needs review</option>
                    <option value="approved">Approved</option>
                  </select>
                </label>

                <label className="full-width">
                  Export notes
                  <textarea
                    rows={2}
                    value={selectedQuestion.exportNotes}
                    onChange={(event) =>
                      onUpdateQuestion(selectedQuestion.questionId, (question) => ({
                        ...question,
                        exportNotes: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              {(selectedQuestion.type === 'multiple_choice' ||
                selectedQuestion.type === 'multi_select') && (
                <section className="editor-section">
                  <div className="panel-heading">
                    <h3>Choices</h3>
                    <button type="button" className="secondary-button" onClick={() => onAddChoice(selectedQuestion.questionId)}>
                      Add choice
                    </button>
                  </div>
                  <div className="choice-list">
                    {selectedQuestion.choices.map((choice) => (
                      <div key={choice.choiceId} className="choice-row">
                        <label className="correct-toggle">
                          <input
                            type={selectedQuestion.type === 'multiple_choice' ? 'radio' : 'checkbox'}
                            name={`correct-${selectedQuestion.questionId}`}
                            checked={choice.isCorrect}
                            onChange={() =>
                              onUpdateQuestion(selectedQuestion.questionId, (question) => {
                                if (
                                  question.type !== 'multiple_choice' &&
                                  question.type !== 'multi_select'
                                ) {
                                  return question
                                }

                                return {
                                  ...question,
                                  choices: question.choices.map((currentChoice) => ({
                                    ...currentChoice,
                                    isCorrect:
                                      question.type === 'multiple_choice'
                                        ? currentChoice.choiceId === choice.choiceId
                                        : currentChoice.choiceId === choice.choiceId
                                          ? !currentChoice.isCorrect
                                          : currentChoice.isCorrect,
                                  })),
                                }
                              })
                            }
                          />
                          Correct
                        </label>
                        <span className="choice-label">{choice.label}</span>
                        <input
                          value={choice.text}
                          onChange={(event) =>
                            onUpdateQuestion(selectedQuestion.questionId, (question) => {
                              if (
                                question.type !== 'multiple_choice' &&
                                question.type !== 'multi_select'
                              ) {
                                return question
                              }

                              return {
                                ...question,
                                choices: question.choices.map((currentChoice) =>
                                  currentChoice.choiceId === choice.choiceId
                                    ? { ...currentChoice, text: event.target.value }
                                    : currentChoice,
                                ),
                              }
                            })
                          }
                        />
                        <div className="item-actions">
                          <button type="button" onClick={() => onMoveChoice(selectedQuestion.questionId, choice.choiceId, 'up')}>
                            Up
                          </button>
                          <button type="button" onClick={() => onMoveChoice(selectedQuestion.questionId, choice.choiceId, 'down')}>
                            Down
                          </button>
                          <button type="button" className="danger-button" onClick={() => onRemoveChoice(selectedQuestion.questionId, choice.choiceId)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {selectedQuestion.type === 'true_false' && (
                <section className="editor-section">
                  <div className="panel-heading">
                    <h3>Correct Answer</h3>
                  </div>
                  <div className="binary-choice-group">
                    {selectedQuestion.choices.map((choice) => (
                      <label key={choice.choiceId} className="binary-choice">
                        <input
                          type="radio"
                          name={`tf-${selectedQuestion.questionId}`}
                          checked={choice.isCorrect}
                          onChange={() =>
                            onUpdateQuestion(selectedQuestion.questionId, (question) => {
                              if (question.type !== 'true_false') {
                                return question
                              }

                              return {
                                ...question,
                                choices: question.choices.map((currentChoice) => ({
                                  ...currentChoice,
                                  isCorrect: currentChoice.choiceId === choice.choiceId,
                                })),
                              }
                            })
                          }
                        />
                        <span>{choice.text}</span>
                      </label>
                    ))}
                  </div>
                </section>
              )}

              {selectedQuestion.type === 'short_answer' && (
                <section className="editor-section">
                  <div className="panel-heading">
                    <h3>Accepted Answers</h3>
                  </div>
                  <label className="full-width">
                    One answer per line
                    <textarea
                      rows={5}
                      value={selectedQuestion.correctAnswers.join('\n')}
                      onChange={(event) =>
                        onUpdateQuestion(selectedQuestion.questionId, (question) => {
                          if (question.type !== 'short_answer') {
                            return question
                          }

                          return {
                            ...question,
                            correctAnswers: parseLineInput(event.target.value),
                          }
                        })
                      }
                    />
                  </label>
                </section>
              )}

              {selectedQuestion.type === 'written_response' && (
                <section className="editor-section">
                  <div className="panel-heading">
                    <h3>Response Guidance</h3>
                  </div>
                  <label className="full-width">
                    Optional guidance or rubric notes
                    <textarea
                      rows={5}
                      value={selectedQuestion.correctAnswers.join('\n')}
                      onChange={(event) =>
                        onUpdateQuestion(selectedQuestion.questionId, (question) => {
                          if (question.type !== 'written_response') {
                            return question
                          }

                          return {
                            ...question,
                            correctAnswers: parseLineInput(event.target.value),
                          }
                        })
                      }
                    />
                  </label>
                  <p className="muted-text">
                    Brightspace CSV does not export written response guidance.
                  </p>
                </section>
              )}

              {selectedQuestion.type === 'matching' && (
                <section className="editor-section">
                  <div className="panel-heading">
                    <h3>Pairs</h3>
                    <button type="button" className="secondary-button" onClick={() => onAddMatchingPair(selectedQuestion.questionId)}>
                      Add pair
                    </button>
                  </div>
                  <div className="matching-pair-list">
                    {listMatchingPairs(selectedQuestion).map((pair, index) => (
                      <div key={pair.matchKey} className="matching-pair-row">
                        <label>
                          Prompt {index + 1}
                          <input
                            value={pair.promptChoice.text}
                            onChange={(event) =>
                              onUpdateQuestion(selectedQuestion.questionId, (question) => {
                                if (question.type !== 'matching') {
                                  return question
                                }

                                return {
                                  ...question,
                                  choices: question.choices.map((choice) =>
                                    choice.choiceId === pair.promptChoice.choiceId
                                      ? { ...choice, text: event.target.value }
                                      : choice,
                                  ),
                                }
                              })
                            }
                          />
                        </label>
                        <label>
                          Match {index + 1}
                          <input
                            value={pair.matchChoice?.text ?? ''}
                            onChange={(event) =>
                              onUpdateQuestion(selectedQuestion.questionId, (question) => {
                                if (question.type !== 'matching' || !pair.matchChoice) {
                                  return question
                                }

                                return {
                                  ...question,
                                  choices: question.choices.map((choice) =>
                                    choice.choiceId === pair.matchChoice?.choiceId
                                      ? { ...choice, text: event.target.value }
                                      : choice,
                                  ),
                                }
                              })
                            }
                          />
                        </label>
                        <button type="button" className="danger-button" onClick={() => onRemoveMatchingPair(selectedQuestion.questionId, pair.matchKey)}>
                          Delete pair
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {selectedQuestion.type === 'ordering' && (
                <section className="editor-section">
                  <div className="panel-heading">
                    <h3>Ordered Items</h3>
                    <button type="button" className="secondary-button" onClick={() => onAddChoice(selectedQuestion.questionId)}>
                      Add item
                    </button>
                  </div>
                  <div className="choice-list">
                    {selectedQuestion.choices.map((choice) => (
                      <div key={choice.choiceId} className="choice-row">
                        <span className="choice-label">{choice.label}</span>
                        <input
                          value={choice.text}
                          onChange={(event) =>
                            onUpdateQuestion(selectedQuestion.questionId, (question) => {
                              if (question.type !== 'ordering') {
                                return question
                              }

                              return {
                                ...question,
                                choices: question.choices.map((currentChoice) =>
                                  currentChoice.choiceId === choice.choiceId
                                    ? { ...currentChoice, text: event.target.value }
                                    : currentChoice,
                                ),
                              }
                            })
                          }
                        />
                        <div className="item-actions">
                          <button type="button" onClick={() => onMoveChoice(selectedQuestion.questionId, choice.choiceId, 'up')}>
                            Up
                          </button>
                          <button type="button" onClick={() => onMoveChoice(selectedQuestion.questionId, choice.choiceId, 'down')}>
                            Down
                          </button>
                          <button type="button" className="danger-button" onClick={() => onRemoveChoice(selectedQuestion.questionId, choice.choiceId)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <>
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Question Detail</p>
                  <h2>Select a question</h2>
                </div>
              </div>
              <p className="muted-text">
                Choose a question from the outline or add a new one to start editing.
              </p>
            </>
          )}
        </section>
      </div>
    </section>
  )
}
