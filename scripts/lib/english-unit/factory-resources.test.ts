import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildCrucibleActQuestionSets,
  buildDraculaActQuestionSets,
  buildMacbethActQuestionSets,
  buildMerchantActQuestionSets,
  buildQuestionSetsFromResources,
  englishFactoryResourceInternals
} from "./factory-resources.js";

test("source page ranges retain only approved PDF extraction pages", () => {
  const scoped = englishFactoryResourceInternals.scopeExtractedPdfText({
    method: "native",
    text: "all pages",
    pages: Array.from({ length: 6 }, (_value, index) => ({ page: index + 1, text: `Page ${index + 1}` })),
    pageCount: 6,
    issue: null
  }, [{ start: 2, end: 2 }, { start: 4, end: 5 }], "packet.pdf");

  assert.deepEqual(scoped.pages.map((page) => page.page), [2, 4, 5]);
  assert.equal(scoped.text, "Page 2\n\nPage 4\n\nPage 5");
  assert.equal(englishFactoryResourceInternals.formatSourcePageRanges([{ start: 2, end: 2 }, { start: 4, end: 5 }]), "2, 4-5");
  assert.throws(
    () => englishFactoryResourceInternals.scopeExtractedPdfText({
      method: "native",
      text: "one page",
      pages: [{ page: 1, text: "Page 1" }],
      pageCount: 1,
      issue: null
    }, [{ start: 2, end: 2 }], "packet.pdf"),
    /exceeds the 1-page PDF/
  );
});

test("Dracula source mapping creates 4, 5, and 3 unanswered questions for Acts I-III", () => {
  const numbered = (count: number, label: string) => Array.from(
    { length: count },
    (_value, index) => `${index + 1}. ${label} question ${index + 1}?`
  ).join("\n");
  const sets = buildDraculaActQuestionSets({
    id: "dracula-assignments",
    title: "Dracula Questions and Assignment Sources",
    role: "question-set",
    source: "Dracula Assignments.pdf",
    reviewRequired: false,
    text: "Scoped clean source pages",
    pages: [
      { page: 15, text: numbered(5, "Film comparison") },
      { page: 17, text: numbered(3, "Assignment criteria") },
      { page: 18, text: numbered(4, "Act 1") },
      { page: 19, text: numbered(5, "Act 2") },
      { page: 20, text: numbered(3, "Act 3") },
      { page: 25, text: numbered(2, "Character analysis") }
    ]
  });

  assert.deepEqual(sets.map((set) => set.id), ["act-1", "act-2", "act-3"]);
  assert.deepEqual(sets.map((set) => set.questions.length), [4, 5, 3]);
  assert.equal(sets.flatMap((set) => set.questions).length, 12);
  assert.equal(sets.flatMap((set) => set.questions).every((question) => question.provenance === "teacher-supplied"), true);
  assert.equal(sets.some((set) => set.questions.some((question) => /Film comparison|Assignment criteria|Character analysis/.test(String(question.prompt)))), false);
});

test("Macbeth OCR cleanup removes stray punctuation and joins fused words", () => {
  const prompts = englishFactoryResourceInternals.promptsFromPage({
    page: 1,
    text: "Macbeth Act Questions\n\n1 . The act done, how does Macbeth feel?\n\n2. What possible advice, ifany, could you offer Macbeth at this stage?"
  });

  assert.deepEqual(prompts, [
    "The act done, how does Macbeth feel?",
    "What possible advice, if any, could you offer Macbeth at this stage?"
  ]);
});

test("very long multipart teacher prompts become readable response chunks", () => {
  const prompt = "Lines 21-30 have become famous because writers frequently quote them. How do you interpret the central line? What does Macbeth say about time? What happened to bring him to this awareness? What would time look like as an image? How would you explain Macbeth's state of mind? Which image is most powerful, and why?";
  const chunks = englishFactoryResourceInternals.splitCompoundPrompt(prompt);

  assert.ok(chunks.length >= 3);
  assert.ok(chunks.every((chunk) => chunk.length <= 420));
  assert.equal(chunks.join(" ").replace(/\s+/g, " "), prompt);
});

test("ELA 10-1 quotation worksheets apply shared directions to each quotation", () => {
  const [set] = buildQuestionSetsFromResources([{
    id: "merchant-act-two",
    title: "M of V Act 2 questions",
    role: "question-set",
    source: "M of V Act 2 questions.docx",
    reviewRequired: false,
    text: [
      "Quotations. List the speaker, situation and significance.",
      "All that glitters is not gold.",
      "For I did dream of money bags tonight.",
      "Answer the following questions.",
      "Why does Morocco choose the gold casket?"
    ].join("\n\n")
  }], {
    idPrefix: "merchant",
    titlePrefix: "Merchant Questions",
    hint: "Return to the play.",
    normalizeSharedQuotationDirections: true
  });

  assert.deepEqual(set.questions.map((question) => question.prompt), [
    "For the quotation \u201cAll that glitters is not gold\u201d, identify the speaker, situation, and significance.",
    "For the quotation \u201cFor I did dream of money bags tonight\u201d, identify the speaker, situation, and significance.",
    "Why does Morocco choose the gold casket?"
  ]);
});

test("Merchant source mapping produces five acts and exactly 86 unique teacher questions", () => {
  const questions = (count: number, prefix: string) => Array.from({ length: count }, (_item, index) => `${index + 1}. ${prefix} teacher question ${index + 1}?`).join("\n\n");
  const primary = {
    id: "mov-act-questions",
    title: "MOV Act Questions",
    role: "question-set" as const,
    source: "UNIT 2 Shakespeare/MOV Act Questions.pdf",
    reviewRequired: false,
    pages: [
      { page: 1, text: `SCENE 1\n${questions(6, "Act 1 Scene 1")}\nSCENE 2\n${questions(6, "Act 1 Scene 2")}\nSCENE 3\n${questions(6, "Act 1 Scene 3")}` },
      { page: 2, text: `SCENE 1\n${questions(2, "Act 2 Scene 1")}\nSCENE 2\n${questions(2, "Act 2 Scene 2")}\nSCENE 3\n${questions(1, "Act 2 Scene 3")}\nSCENE 4\n${questions(1, "Act 2 Scene 4")}\nSCENE 5\n${questions(1, "Act 2 Scene 5")}\nSCENE 6\n${questions(1, "Act 2 Scene 6")}\nSCENE 7\n${questions(1, "Act 2 Scene 7")}\nSCENE 8\n${questions(1, "Act 2 Scene 8")}\nSCENE 9\n${questions(1, "Act 2 Scene 9")}` },
      { page: 3, text: questions(10, "Act 3 Scene 1") },
      { page: 4, text: `SCENE 2\n${questions(10, "Act 3 Scene 2")}` },
      { page: 5, text: questions(13, "Act 4 Scene 1") },
      { page: 6, text: `SCENE 1\n${questions(5, "Act 5 Scene 1")}` }
    ]
  };
  const supplementalResources = [
    { id: "mov-act-2-questions", title: "Act 2", source: "M of V Act 2 questions.docx" },
    { id: "mov-act-3-text", title: "Act 3", source: "The Merchant of Venice3.docx" },
    { id: "mov-act-4-text", title: "Act 4", source: "The Merchant of Venice.4x.docx" },
    { id: "mov-act-5-text", title: "Act 5", source: "The Merchant of Venice V.docx" }
  ].map((resource) => ({ ...resource, role: "question-set" as const, reviewRequired: false, text: "Teacher worksheet preserved as a source artifact." }));

  const sets = buildMerchantActQuestionSets([primary, ...supplementalResources]);
  assert.deepEqual(sets.map((set) => set.id), ["act-1", "act-2", "act-3", "act-4", "act-5"]);
  assert.deepEqual(sets.map((set) => set.questions.length), [18, 20, 24, 17, 7]);
  assert.equal(sets.flatMap((set) => set.questions).length, 86);
  assert.equal(new Set(sets.flatMap((set) => set.questions.map((question) => `${set.id}:${question.id}`))).size, 86);
  assert.equal(sets.flatMap((set) => set.questions).every((question) => question.provenance === "teacher-supplied"), true);
});

test("ELA 10-1 scanned novel questions preserve each numbered worksheet item", () => {
  const [set] = buildQuestionSetsFromResources([{
    id: "tkamb-chapter-questions",
    title: "TKAMB-Chapter Questions",
    role: "question-set",
    source: "TKAMB-Chapter Questions.pdf",
    reviewRequired: false,
    text: "OCR text",
    pages: [{
      page: 1,
      text: [
        "CHAPTER 1 (7-19)",
        "1. What is the function of relating the Finch family history at the outset of the novel?",
        "By relating the Finch family history, the exemplar continues for many sentences. ".repeat(20),
        "2, How is a feeling of mystery established in the first chapter?",
        "3. Explain the manner of narration.",
        "Teaching MOCKINGBIRD 143"
      ].join("\n")
    }]
  }], {
    idPrefix: "tkamb",
    titlePrefix: "Mockingbird Questions",
    hint: "Return to the chapter.",
    preserveNumberedItems: true
  });

  assert.equal(set.questions.length, 3);
  assert.equal(set.questions[0].prompt, "What is the function of relating the Finch family history at the outset of the novel?");
  assert.equal(set.questions[1].prompt, "How is a feeling of mystery established in the first chapter?");
  assert.equal(set.questions[2].prompt, "Explain the manner of narration.");
});

test("Macbeth act questions cover all 28 scenes while preserving teacher and profile provenance", () => {
  const sets = buildMacbethActQuestionSets({
    id: "macbeth-act-questions",
    title: "Macbeth Act Questions",
    role: "question-set",
    source: "MACBETH Act Questions.pdf",
    reviewRequired: false,
    pages: Array.from({ length: 20 }, (_value, index) => ({
      page: index + 1,
      text: `Macbeth page ${index + 1}\n\n1. What important change occurs in this scene, and how does Shakespeare make it significant?`
    }))
  });
  const questions = sets.flatMap((set) => set.questions);
  const locators = new Set(questions.map((question) => {
    const match = `${question.prompt ?? ""} ${question.label}`.match(/Act\s+(\d+)\s*,\s*Scene\s+(\d+)/i);
    return match ? `${match[1]}.${match[2]}` : "";
  }));

  assert.equal(sets.length, 5);
  assert.equal(locators.size, 28);
  assert.equal(questions.filter((question) => question.provenance === "teacher-supplied").length, 20);
  assert.equal(questions.filter((question) => question.provenance === "profile-supplied").length, 16);
  assert.deepEqual(
    [...locators].filter((locator) => Object.hasOwn(englishFactoryResourceInternals.MACBETH_PROFILE_SCENE_QUESTIONS, locator)).sort(),
    ["1.2", "1.6", "3.2", "3.3", "3.6", "4.3", "5.4", "5.7"]
  );
});

test("Crucible unit-guide questions layer onto stable teacher worksheet response ids", () => {
  const resources = [1, 2, 3, 4].map((act) => ({
    id: `crucible-act-${act}`,
    title: `Crucible Act ${act}`,
    role: "question-set" as const,
    source: `Crucible Act ${act}.pdf`,
    reviewRequired: false,
    text: "1. What changes in this act?\n\n2. Which evidence best proves that change?"
  }));
  resources.push({
    id: "crucible-next-step-unit-guide-docx",
    title: "The Crucible Learner Guide",
    role: "question-set",
    source: "supplemental://derived/guide.docx",
    reviewRequired: false,
    text: "Act One\nRead Act One.\n\n1. What begins the conflict?\n\n2. Which quotation matters?\n\nAct Two\n1. What pressure increases?\n\nAct Three\n1. How does the court change?\n\nAct Four\n1. Why does Proctor decide as he does?\n\nEnd of The Crucible"
  });

  const sets = buildCrucibleActQuestionSets(resources);
  assert.equal(sets.length, 4);
  assert.equal(sets[0].questions[0].id, "question-1");
  assert.equal(sets[0].questions[0].section, "Teacher Act Worksheet");
  assert.equal(sets[0].questions[2].id, "next-step-unit-guide-question-1");
  assert.equal(sets[0].questions[2].section, "Next Step Unit Guide");
  assert.equal(sets[0].questions.length, 4);
  assert.deepEqual(sets.slice(1).map((set) => set.questions.length), [3, 3, 3]);
});

test("Crucible Act 2 omits the declined cruelty prompt without renumbering later teacher responses", () => {
  const resources = [1, 3, 4].map((act) => ({
    id: `crucible-act-${act}`,
    title: `Crucible Act ${act}`,
    role: "question-set" as const,
    source: `Crucible Act ${act}.pdf`,
    reviewRequired: false,
    text: "1. What changes in this act?"
  }));
  resources.push({
    id: "crucible-act-2",
    title: "Crucible Act 2",
    role: "question-set",
    source: "Crucible Act 2.pdf",
    reviewRequired: false,
    text: [
      "1. What changes in Act Two?",
      "2. The theme of human cruelty versus righteousness is particularly important in this act. Go through Act Two and select three quotes.",
      "3. What is learned about Mary Warren's motives?"
    ].join("\n\n")
  });

  const actTwo = buildCrucibleActQuestionSets(resources).find((set) => set.id === "act-2");
  assert.deepEqual(actTwo?.questions.map((question) => question.id), ["question-1", "question-3"]);
  assert.equal(
    actTwo?.questions.some((question) => String(question.prompt ?? "").includes("human cruelty versus righteousness")),
    false
  );
});

test("Crucible Act 3 omits the declined Hale activity without renumbering earlier responses", () => {
  const resources = [1, 2, 4].map((act) => ({
    id: `crucible-act-${act}`,
    title: `Crucible Act ${act}`,
    role: "question-set" as const,
    source: `Crucible Act ${act}.pdf`,
    reviewRequired: false,
    text: "1. What changes in this act?"
  }));
  resources.push({
    id: "crucible-act-3",
    title: "Crucible Act 3",
    role: "question-set",
    source: "Crucible Act 3.pdf",
    reviewRequired: false,
    text: [
      "1. First question?",
      "2. Second question?",
      "3. Third question?",
      "4. Fourth question?",
      "5. Fifth question?",
      "6. Sixth question?",
      "7. Seventh question?",
      "8. Ongoing Activity (II) As promised, the Reverend Hale continues to develop. Why does Hale suggest Proctor have a lawyer? b."
    ].join("\n\n")
  });

  const actThree = buildCrucibleActQuestionSets(resources).find((set) => set.id === "act-3");
  assert.deepEqual(
    actThree?.questions.map((question) => question.id),
    ["question-1", "question-2", "question-3", "question-4", "question-5", "question-6", "question-7"]
  );
  assert.equal(
    actThree?.questions.some((question) => /Ongoing Activity \(II\)|Proctor.*lawyer/i.test(String(question.prompt ?? ""))),
    false
  );
});

test("Crucible Act 4 rewrites the flattened character list as a journal prompt", () => {
  const resources = [1, 2, 3].map((act) => ({
    id: `crucible-act-${act}`,
    title: `Crucible Act ${act}`,
    role: "question-set" as const,
    source: `Crucible Act ${act}.pdf`,
    reviewRequired: false,
    text: "1. What changes in this act?"
  }));
  resources.push({
    id: "crucible-act-4",
    title: "Crucible Act 4",
    role: "question-set",
    source: "Crucible Act 4.pdf",
    reviewRequired: false,
    text: [
      "1. First question?",
      "2. Second question?",
      "3. Third question?",
      "4. Fourth question?",
      "5. Fifth question?",
      "6. Several characters are particularly well developed in The Crucible’s final act: a. Danforth b. Parris c. Elizabeth Proctor d. John Proctor Write a journal as one of them."
    ].join("\n\n")
  });

  const question = buildCrucibleActQuestionSets(resources)
    .find((set) => set.id === "act-4")
    ?.questions.find((candidate) => candidate.id === "question-6");
  assert.equal(
    question?.prompt,
    "Choose Danforth, Parris, Elizabeth Proctor, or John Proctor. Write a journal entry from that character’s perspective that explains the character’s actions and motivations in Act Four."
  );
});

test("supplemental resources resolve only inside the canonical project source root", async () => {
  const resourceDir = await mkdtemp(path.join(tmpdir(), "english-supplemental-"));
  const sourceDir = path.join(resourceDir, "_sources", "supplemental", "derived");
  await mkdir(sourceDir, { recursive: true });
  await writeFile(path.join(sourceDir, "guide.pdf"), "pdf fixture");

  const resolved = await englishFactoryResourceInternals.resolveSupplementalSource(resourceDir, "supplemental://derived/guide.pdf");
  assert.equal(resolved.relativePath, "derived/guide.pdf");
  await assert.rejects(
    englishFactoryResourceInternals.resolveSupplementalSource(resourceDir, "supplemental://../outside.pdf"),
    /Unsafe supplemental English resource source/
  );
});

test("project-workspace resources resolve only inside the named canonical workspace", async () => {
  const repoRoot = await mkdtemp(path.join(tmpdir(), "english-project-workspace-"));
  const sourceDir = path.join(repoRoot, "projects", "ela30-1-donor", "workspace", "assets", "source");
  await mkdir(sourceDir, { recursive: true });
  await writeFile(path.join(sourceDir, "reading.pdf"), "pdf fixture");

  const resolved = await englishFactoryResourceInternals.resolveProjectWorkspaceSource(
    repoRoot,
    "project-workspace://ela30-1-donor/assets/source/reading.pdf"
  );
  assert.equal(resolved.relativePath, "assets/source/reading.pdf");
  await assert.rejects(
    englishFactoryResourceInternals.resolveProjectWorkspaceSource(
      repoRoot,
      "project-workspace://ela30-1-donor/../outside.pdf"
    ),
    /Unsafe project-workspace English resource source/
  );
});
