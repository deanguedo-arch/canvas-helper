import fs from "fs/promises";
import path from "path";
import process from "process";
import JSZip from "jszip";
import * as cheerio from "cheerio";
import { renderNextStepCourseShell } from "./lib/next-step-course-shell.js";

const ROOT = process.cwd();
const DEFAULT_SLUG = "ela20-1-novel-study-clean";
const COURSE_TITLE = "Novel Study";
const COURSE_CODE = "ELA 20-1";
const SOURCE_ZIP =
  "/Users/deanguedo/Downloads/D2LExport_6668_CBE System ELA 20-1 (Winter 2020)_202661808 (1).zip";
const NEXT_STEP_LOGO_SOURCE_PATH = path.join(
  ROOT,
  "docs",
  "design",
  "next-step",
  "assets",
  "nxt-ce-logo-white-with-ce.png"
);

const LESSON_SOURCES = [
  {
    id: "lesson-1-novel-unit-introduction",
    entry: "novel_study/novel_unit_introduction.html",
    title: "Novel Unit Introduction",
    summary: "Set the purpose for the unit and prepare to track how a novel builds meaning over time.",
  },
  {
    id: "lesson-3-characteristics-of-a-novel",
    entry: "Module 6/20-1characteristicsofanovel.html",
    title: "Characteristics of a Novel",
    summary: "Review the major features of novels: plot, character, point of view, setting, conflict, and theme.",
  },
  {
    id: "lesson-4-how-to-read-a-novel",
    entry: "Module 6/20-1howtoreadanovel.html",
    title: "How to Read a Novel",
    summary: "Use active reading routines to notice patterns, questions, character change, and important passages.",
  },
];

const NOVEL_QUESTION_SECTIONS = [
  {
    id: "section-1",
    title: "Section 1 Questions",
    subtitle: "Answer after reading the first third of your novel.",
    questions: [
      {
        id: "begin",
        text: "How does the novel begin?",
        hint: "Describe the opening situation, mood, setting, and any first conflict or question the author creates.",
      },
      {
        id: "major-characters",
        text: "Who are the major characters and what are their relationships to each other?",
        hint: "Name the central characters and explain how they are connected, not just who they are.",
      },
      {
        id: "initial-conflict",
        text: "What is the initial conflict?",
        hint: "Look for the problem, pressure, or tension that starts moving the story forward.",
      },
      {
        id: "suspense",
        text: "What method does the author use to create suspense?",
        hint: "Consider unanswered questions, danger, pacing, foreshadowing, withheld information, or unstable relationships.",
      },
      {
        id: "point-of-view",
        text: "What is the point of view? Who is telling the story?",
        hint: "Identify the narrator and explain how that perspective shapes what the reader knows or feels.",
      },
      {
        id: "minor-characters",
        text: "What minor characters are introduced in the novel?",
        hint: "Include characters who may not lead the plot but still affect conflict, setting, or the protagonist.",
      },
      {
        id: "like-dislike",
        text: "Are there any characters you particularly like or dislike? Explain.",
        hint: "Support your reaction with a specific action, decision, line of dialogue, or relationship.",
      },
      {
        id: "developing-themes",
        text: "What themes do you see being developed?",
        hint: "Move beyond one-word topics. Explain what the novel may be suggesting about people, choices, or society.",
      },
      {
        id: "prediction",
        text: "Make a prediction as to what you believe will happen in the next section of the book.",
        hint: "Base the prediction on evidence from conflict, character goals, or foreshadowing.",
      },
    ],
  },
  {
    id: "section-2",
    title: "Section 2 Questions",
    subtitle: "Answer after reading the middle third of your novel.",
    questions: [
      {
        id: "conflict-change",
        text: "Has the conflict changed? Explain.",
        hint: "Describe whether the original conflict has intensified, shifted, or revealed a deeper problem.",
      },
      {
        id: "shared-problem",
        text: "Are all the characters facing the same problem?",
        hint: "Compare at least two characters and explain how their pressures are similar or different.",
      },
      {
        id: "protagonist-decision",
        text: "Discuss one important decision the protagonist has made.",
        hint: "Name the decision, explain the motivation, and describe the consequence or likely consequence.",
      },
      {
        id: "author-style",
        text: "Discuss the author's style: foreshadowing, flashbacks, changing point of view, and other choices.",
        hint: "Choose one or two techniques and explain their effect on the reader.",
      },
      {
        id: "continuing-suspense",
        text: "Discuss how the author is continuing to create suspense.",
        hint: "Look for complications, uncertainty, secrets, delayed answers, or rising stakes.",
      },
      {
        id: "surprise",
        text: "Has anything happened to surprise you? Explain.",
        hint: "Describe the moment and explain why it challenged your expectations.",
      },
      {
        id: "character-development",
        text: "How is the author developing the characters? Is it by telling us about them, by telling us what others say about them, or by telling us what the characters say about themselves?",
        hint: "Use one character as an example and connect the technique to what you learn about that character.",
      },
      {
        id: "prediction-accuracy",
        text: "How accurate have your predictions been so far?",
        hint: "Compare your earlier prediction to what actually happened and explain what you learned about the author's direction.",
      },
      {
        id: "final-prediction",
        text: "Make a final prediction for the end of the book.",
        hint: "Use current conflict, character choices, and repeated patterns to make a defensible prediction.",
      },
    ],
  },
  {
    id: "section-3",
    title: "Section 3 Questions",
    subtitle: "Answer after finishing your novel.",
    questions: [
      {
        id: "setting-influence",
        text: "What overall influence did the setting have on the events of the novel and the characters?",
        hint: "Explain how time, place, social conditions, or atmosphere shaped choices and conflict.",
      },
      {
        id: "dynamic-static",
        text: "Were the characters dynamic or static? Explain.",
        hint: "Identify who changed or stayed the same and support your answer with specific evidence.",
      },
      {
        id: "elapsed-time",
        text: "Approximately how much time elapses in the book?",
        hint: "Estimate the story's timeline and mention any jumps, flashbacks, or compressed time.",
      },
      {
        id: "important-theme",
        text: "What themes were developed? Which one do you feel was the most important one?",
        hint: "Choose the strongest theme and explain how the novel develops it from beginning to end.",
      },
      {
        id: "takeaway",
        text: "What will you take away from your reading of the book?",
        hint: "Connect your takeaway to a character, conflict, theme, or repeated idea from the novel.",
      },
      {
        id: "criticism-recommendation",
        text: "Make a criticism or recommendation for the novel.",
        hint: "Evaluate the novel thoughtfully by naming a strength, limitation, audience, or reason for your recommendation.",
      },
    ],
  },
];

const MOTIF_OPTIONS = [
  { id: "Ambition & Greed", color: "#7a4a20" },
  { id: "Betrayal & Deception", color: "#7b2f35" },
  { id: "Dreams & Aspirations", color: "#5a5f22" },
  { id: "Fate vs. Free Will", color: "#335f66" },
  { id: "Gender Roles", color: "#674b67" },
  { id: "Illusion vs. Reality", color: "#4d5f3f" },
  { id: "Isolation & Belonging", color: "#695533" },
  { id: "Power & Control", color: "#544732" },
  { id: "Societal Pressure", color: "#365243" },
  { id: "Shifting Identity", color: "#4f566b" },
];

const AUTHOR_INTENT_PROMPTS = [
  {
    id: "choice",
    text: "What major choice did the character make in this chapter, and what was their conscious motivation?",
  },
  {
    id: "conflict",
    text: "What is the character's primary internal conflict in this specific scene?",
  },
  {
    id: "reaction",
    text: "How does the character react to the unexpected obstacle or revelation presented here?",
  },
  {
    id: "relationship",
    text: "What significant shift occurs in the character's relationship dynamics during this interaction?",
  },
  {
    id: "values",
    text: "What core belief or value does the character compromise or defend in this moment?",
  },
  {
    id: "deception",
    text: "How does the character justify their morally ambiguous actions to themselves?",
  },
  {
    id: "desire",
    text: "What explicit, tangible goal is the character actively pursuing right now?",
  },
  {
    id: "vulnerability",
    text: "What emotional or psychological vulnerability does the character expose in this scene?",
  },
];

const CRITICAL_WRITING_OUTCOMES = [
  "Read and respond critically to literary texts",
  "Develop and support an interpretation with textual evidence",
  "Organize ideas into a controlled critical/analytical form",
  "Use precise diction, sentence control, and formal voice",
  "Revise for correctness, clarity, and assignment purpose",
];

const CRITICAL_WRITING_SECTIONS = [
  {
    id: "critical-writing-topic-thesis",
    navLabel: "Topic and Thesis",
    title: "Topic Control and Thesis",
    focus: "Turn the assignment topic into a defensible controlling idea.",
    outcomes: ["Thought and Understanding", "Form and Structure"],
    lesson:
      "A critical/analytical essay has an introduction with a thesis, three body paragraphs, and a conclusion. The three body paragraphs should focus on character development and change: beginning, middle, and end. The thesis must answer the essay topic question by explaining what happens to a character, what actions they take, how they are affected, and what ultimate epiphany or path the character embraces.",
    modelLabel: "Model move",
    model:
      "Use the frame from the handout: The text creator's idea regarding the topic is that _____. This keeps the sentence focused on the author, director, or playwright's idea rather than on a personal reaction to the text.",
    exampleTitle: "Example",
    example:
      "Nora Helmer proves individuals who do not pursue long-term satisfaction through honest personal needs, and instead serve the desires of others, may use drastic measures to escape the regret of the life they have built. When adapting this example, remember that Nora is the character; the thesis should still name the text creator when answering the essay topic.",
    diplomaTip:
      "Diploma tip: It is recommended that the body paragraphs discuss one character's beginning, middle, and end. Some texts also need minor discussion of another strong character if that character affects the main character's journey or epiphany.",
    planningPurpose:
      "Use this planning space to separate the topic, the text, and the thesis before drafting. By the end, you should have one sentence that can guide the entire essay.",
    steps: [
      "Identify the two-part essay topic question you are being asked to answer.",
      "Name the text creator, the text, and the central character or characters you will use.",
      "Decide what character development and change will structure the beginning, middle, and end body paragraphs.",
      "State what the text creator suggests about the topic through the character's actions, effects, and epiphany or path.",
      "Avoid first person. Do not use I in the essay.",
    ],
    checkpoints: [
      "answer the assigned topic directly in my thesis.",
      "name the text creator instead of treating the character as the author.",
      "organize the argument around character development and change.",
    ],
    fields: [
      { id: "topic-two-parts", label: "Two parts of the essay topic", placeholder: "For example: ambition / competing demands..." },
      { id: "text-creator", label: "Text creator, text, and character focus", placeholder: "Author or director, title, and character(s)..." },
      { id: "character-route", label: "Character development route", placeholder: "One main character's beginning, middle, end, plus any minor character who affects the journey..." },
      { id: "thesis-draft", label: "Working thesis", placeholder: "The text creator suggests that..." },
    ],
  },
  {
    id: "critical-writing-introduction",
    navLabel: "Introduction",
    title: "Introduction Frame",
    focus: "Move from the human topic to the specific text and thesis.",
    outcomes: ["Thought and Understanding", "Form and Structure", "Matters of Choice"],
    lesson:
      "Always begin by discussing the topic generally in two or three sentences. Ask what can be said about the topic and how it relates to mankind. Then introduce the text, including the text creator, the name of the text, and the character or characters you will discuss to answer the essay topic. Name the basic conflict, connect it to both pieces of the topic question, and briefly point toward the character's change from the beginning to the end.",
    modelLabel: "Model move",
    model:
      "If the topic is ambition and competing demands, begin with the pressure people feel when desire conflicts with responsibility. Then introduce a text such as On the Rainy River or Sound of Metal, name the creator, name the character focus, describe the basic conflict, and land on the thesis.",
    exampleTitle: "Example",
    example:
      "People often want more than one life can reasonably hold. When personal desire begins to compete with duty, individuals may discover that every choice carries a cost. In the novel, the text creator develops this tension through a character who must decide what matters most before the thesis names the writer's larger idea.",
    diplomaTip:
      "Diploma tip: Keep the introduction purposeful. Do not spend the opening paragraph summarizing the whole text; move from topic, to text and conflict, to thesis.",
    planningPurpose:
      "Use this planning space to build the three moves of an introduction: general topic, text bridge, and thesis. These notes should become the order of your opening paragraph.",
    steps: [
      "Begin with two or three sentences about the topic in general human terms.",
      "Introduce the text creator, the title of the text, and the character or characters being discussed.",
      "Name the basic conflict and connect it to both pieces of the topic question.",
      "Briefly set up the character's movement from beginning to end before ending with the thesis.",
    ],
    checkpoints: [
      "begin generally enough to lead into the text.",
      "identify the text and creator clearly.",
      "place the thesis as the final sentence or controlling move of the introduction.",
    ],
    fields: [
      { id: "intro-general", label: "General topic opening", placeholder: "What can be said about this topic in human life?" },
      { id: "intro-text", label: "Text and conflict bridge", placeholder: "Introduce the text, creator, character, and basic conflict..." },
      { id: "intro-thesis", label: "Final thesis sentence", placeholder: "The text creator's idea regarding the topic is that..." },
    ],
  },
  {
    id: "critical-writing-body-beginning",
    navLabel: "Body 1: Beginning",
    title: "Body Paragraph 1 - The Beginning",
    focus: "Explain the character at the start of the text and connect that starting point to the topic.",
    outcomes: ["Supporting Evidence", "Thought and Understanding", "Form and Structure"],
    lesson:
      "Body Paragraph 1 discusses the initial character development as evidenced in the beginning of the text. Describe how the character can be understood from the onset, then give proof through a quotation or a very specific example. Always discuss the character in relation to the topic provided: what issue is arising, how the character is initially dealing with it, what actions are being taken, how the topic is coming into play, and what trouble is brewing.",
    modelLabel: "Model move",
    model:
      "A strong beginning paragraph might show that a character initially avoids responsibility, depends on approval, or misunderstands the cost of a choice. The evidence should prove the character's starting point and explain how the assigned topic is already creating pressure.",
    exampleTitle: "Example",
    example:
      "At the beginning, the character may appear confident, but the evidence reveals that confidence depends on avoiding difficult truths. A strong paragraph would quote or describe that early moment, then explain how the character's starting belief creates the pressure that the essay will trace.",
    diplomaTip:
      "Diploma tip: Think character development. Body 1 should answer the essay question, not summarize the opening chapters. Transition clearly toward Body Paragraph 2: the middle.",
    planningPurpose:
      "Use this planning space to collect the character's initial state, one strong opening detail, and the topic connection. These notes should become Body Paragraph 1.",
    steps: [
      "Describe the character from the onset of the text.",
      "Use a quotation or very specific example as proof.",
      "Explain the issue that is arising and how the character initially deals with it through action or avoidance.",
      "Show how the essay topic is coming into play and what trouble is brewing.",
      "Transition toward Body Paragraph 2: the middle.",
    ],
    checkpoints: [
      "focus the paragraph on character development, not plot summary alone.",
      "choose evidence specific enough to prove the interpretation.",
      "keep the explanation connected to the essay topic.",
    ],
    fields: [
      { id: "beginning-character", label: "Initial character description", placeholder: "At the beginning, the character is..." },
      { id: "beginning-evidence", label: "Beginning evidence", placeholder: "Quotation or specific moment with page/chapter..." },
      { id: "beginning-topic-link", label: "Topic connection", placeholder: "This matters to the essay topic because..." },
    ],
  },
  {
    id: "critical-writing-body-middle",
    navLabel: "Body 2: Middle",
    title: "Body Paragraph 2 - The Middle",
    focus: "Track the crisis, turning point, or pressure that pushes the character toward change.",
    outcomes: ["Supporting Evidence", "Thought and Understanding", "Matters of Choice"],
    lesson:
      "Body Paragraph 2 discusses what the character is grappling with and what conflict is causing their change. Consider whether the character goes through a crisis, experiences a major turning point, has a moment of self-discovery, or tries to hold onto the past instead of embracing something new. Begin exploring the changes the character makes, including actions or mistakes, and use proof from the text to support ideas that answer the essay topic question.",
    modelLabel: "Model move",
    model:
      "A strong middle paragraph might focus on a scene where the character's old belief stops working. The analysis should explain what pressure is acting on the character, who or what helps or hinders their progress, and how that pressure begins to reshape their choices.",
    exampleTitle: "Example",
    example:
      "In the middle of the text, a character who once avoided conflict might be forced to confront the consequences of that avoidance. The paragraph should explain what changes in this moment and why the old pattern no longer works.",
    diplomaTip:
      "Diploma tip: The middle paragraph usually earns marks through explanation. After evidence, spend enough time showing who or what is helping or standing in the way of epiphany or change.",
    planningPurpose:
      "Use this planning space to name the turning point, choose evidence from the middle of the text, and explain the change that is starting to happen. These notes should become Body Paragraph 2.",
    steps: [
      "Identify what the character is grappling with in the middle of the text.",
      "Explain the conflict, crisis, turning point, or self-discovery that causes change.",
      "Consider whether the character is holding onto the past or embracing something new.",
      "Show who or what helps, hinders, tempts, or pressures the character.",
      "Use evidence to show movement toward an epiphany, mistake, or altered path.",
      "Transition toward Body Paragraph 3: the end.",
    ],
    checkpoints: [
      "show change in progress.",
      "use evidence that proves pressure, conflict, or self-discovery.",
      "transition toward the final version of the character.",
    ],
    fields: [
      { id: "middle-conflict", label: "Middle conflict or turning point", placeholder: "The character is now struggling with..." },
      { id: "middle-evidence", label: "Middle evidence", placeholder: "Quotation or specific moment with page/chapter..." },
      { id: "middle-change", label: "Change in progress", placeholder: "This moment begins to change the character by..." },
    ],
  },
  {
    id: "critical-writing-body-end",
    navLabel: "Body 3: End",
    title: "Body Paragraph 3 - The End",
    focus: "Explain the changed character, resolution, and final insight.",
    outcomes: ["Supporting Evidence", "Thought and Understanding", "Form and Structure"],
    lesson:
      "Body Paragraph 3 discusses the changed character at the end of the text and the resolution. As a result of the middle paragraph, explain how the character can now be described in terms of character development or epiphany. What has the character learned, accepted, or changed for the better or worse? Are they embracing something new, even if they did not envision it for themselves or are not fully okay with the new situation?",
    modelLabel: "Model move",
    model:
      "A strong ending paragraph might show that the character now acts with honesty, accepts a painful truth, repeats a destructive pattern, or chooses a new path. The analysis should explain how this final state, resolution, or epiphany answers the assigned topic.",
    exampleTitle: "Example",
    example:
      "By the end, the character's final choice should reveal what the text creator wants readers to understand. If the character accepts responsibility, explain how that final action proves a changed awareness rather than simply reporting what happened last.",
    diplomaTip:
      "Diploma tip: Be specific and give examples, quotations, or proof to back up the exploration. Make sure the paragraph is still answering the essay topic question.",
    planningPurpose:
      "Use this planning space to define the character's final state, select final evidence, and connect the resolution back to the topic. These notes should become Body Paragraph 3.",
    steps: [
      "Describe the changed character at the end of the text and the resolution.",
      "Explain what the character has learned, accepted, changed, or failed to change.",
      "Consider whether the character is embracing something new, even if the new situation is difficult.",
      "Use examples, quotations, or proof to back up the exploration.",
      "Make the connection back to the essay topic unmistakable.",
    ],
    checkpoints: [
      "prove the character's endpoint, not just describe another event.",
      "support the conclusion about the character with evidence.",
      "answer the topic question through the character's final state.",
    ],
    fields: [
      { id: "end-character", label: "Changed character description", placeholder: "By the end, the character has become..." },
      { id: "end-evidence", label: "End evidence", placeholder: "Quotation or specific moment with page/chapter..." },
      { id: "end-topic-link", label: "Final topic connection", placeholder: "This answers the essay topic because..." },
    ],
  },
  {
    id: "critical-writing-conclusion-revision",
    navLabel: "Conclusion and Revision",
    title: "Conclusion and Final Check",
    focus: "Close by returning from the character's change to the broader human idea.",
    outcomes: ["Form and Structure", "Matters of Choice", "Matters of Correctness"],
    lesson:
      "The conclusion starts specifically with the character's change and epiphany in connection to the essay topic question. Then it moves back to a general discussion of the two-part essay topic question and the human condition. The final paragraph should help readers understand what we are supposed to learn from the text.",
    modelLabel: "Model move",
    model:
      "Begin with the character's final change or epiphany, then widen the idea: Through this change, the text suggests that people often recognize the cost of their choices only when they can no longer avoid the consequences.",
    exampleTitle: "Example",
    example:
      "If the essay has shown a character moving from denial to responsibility, the conclusion can return to the human idea: the text suggests that growth often begins when people stop defending comfortable illusions and accept the cost of honest choices.",
    diplomaTip:
      "Diploma tip: End by returning to the two-part essay topic and the awareness of the human condition. The conclusion should complete the argument rather than restart it.",
    planningPurpose:
      "Use this planning space to decide what final insight the essay leaves with the reader and what sentence-level issues need revision before submission.",
    steps: [
      "Begin specifically with the character's change or epiphany in relation to the essay topic.",
      "Move back to a general discussion of the two-part essay topic question.",
      "Explain the awareness of the human condition created by the text.",
      "Ask what readers are supposed to learn from the text.",
      "Revise for formal voice, sentence control, word choice, and correctness.",
    ],
    checkpoints: [
      "return to the two-part topic question in the conclusion.",
      "explain the final insight readers are meant to understand from the text.",
      "revise for formal critical voice and avoid first person.",
    ],
    fields: [
      { id: "conclusion-change", label: "Specific character change", placeholder: "The character's final change shows..." },
      { id: "conclusion-human-condition", label: "Human condition connection", placeholder: "The text suggests people..." },
      { id: "revision-priorities", label: "Revision priorities", placeholder: "Before submitting, I need to fix..." },
    ],
  },
];

type Args = {
  zipPath: string;
  slug: string;
};

type Lesson = {
  id: string;
  entry: string;
  title: string;
  summary: string;
  html: string;
  excerpt: string;
};

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const parsed: Args = { zipPath: SOURCE_ZIP, slug: DEFAULT_SLUG };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === "--zip" && next) {
      parsed.zipPath = next;
      i += 1;
    } else if (arg === "--slug" && next) {
      parsed.slug = next;
      i += 1;
    }
  }
  return parsed;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)));
}

function normalizeWhitespace(value: string): string {
  return decodeEntities(value).replace(/\s+/g, " ").trim();
}

function isSourceNoise(value: string): boolean {
  return (
    /^please continue to the next page/i.test(value) ||
    /^click next/i.test(value) ||
    /^content$/i.test(value) ||
    /^course resources$/i.test(value) ||
    /^@?\s*(?:©|&copy;)?\s*2019\s+CBe-learn(?:\s*-\s*Calgary Board of Education)?\.?$/i.test(value) ||
    /^@?\s*2019\s+CBe-learn(?:\s*-\s*Calgary Board of Education)?\.?$/i.test(value)
  );
}

function decodeBuffer(buffer: Buffer): string {
  let text = buffer.toString("utf8");
  const nullCount = (text.match(/\u0000/g) || []).length;
  if (nullCount > Math.max(5, text.length / 20)) text = buffer.toString("utf16le");
  return text.replace(/^\uFEFF/, "").replace(/\u0000/g, "").replace(/\uFFFD/g, "");
}

function resolveZipPath(entryName: string, rawSrc: string): string | null {
  const cleanSrc = rawSrc.split(/[?#]/)[0].replace(/^\.\//, "");
  if (!cleanSrc || /^(?:https?:|mailto:|data:|#)/i.test(cleanSrc)) return null;
  return path.posix.normalize(path.posix.join(path.posix.dirname(entryName), cleanSrc));
}

async function copyZipAsset(zip: JSZip, entryName: string, rawSrc: string, assetsDir: string): Promise<string | null> {
  const resolved = resolveZipPath(entryName, rawSrc);
  if (!resolved) return null;
  const file = zip.file(resolved) || zip.file(resolved.replace(/^\.\//, ""));
  if (!file) return null;
  const ext = path.posix.extname(resolved) || ".bin";
  const base = path.posix.basename(resolved, ext);
  const outName = `${slugify(path.posix.dirname(resolved))}-${slugify(base)}${ext.toLowerCase()}`;
  await fs.mkdir(assetsDir, { recursive: true });
  await fs.writeFile(path.join(assetsDir, outName), await file.async("nodebuffer"));
  return `assets/imported/${outName}`;
}

async function sanitizeContent(zip: JSZip, entryName: string, html: string, lessonTitle: string, assetsDir: string): Promise<string> {
  const $ = cheerio.load(html);
  $("script, style, link, meta, title, head, noscript").remove();
  $(".d2l-navigation, .d2l-page-header, .navbar, .nav, .breadcrumbs, .breadcrumb, .skip-link").remove();

  const root = $("#content").first().length ? $("#content").first() : $("body").first();
  const copyJobs: Array<Promise<void>> = [];
  root.find("img").each((_index, element) => {
    const img = $(element);
    const src = img.attr("src") || "";
    copyJobs.push(
      (async () => {
        const copied = await copyZipAsset(zip, entryName, src, assetsDir);
        if (copied) {
          img.attr("src", copied);
          img.attr("alt", img.attr("alt") || "Novel study image");
          img.addClass("source-image");
        } else if (!/^(?:https?:|data:)/i.test(src)) {
          img.remove();
        }
      })()
    );
  });
  await Promise.all(copyJobs);

  root.find("a").each((_index, element) => {
    const link = $(element);
    const href = (link.attr("href") || "").trim();
    if (!href) {
      link.replaceWith(`<span>${escapeHtml(link.text())}</span>`);
      return;
    }
    if (/^(?:https?:|mailto:|#)/i.test(href)) {
      link.attr("target", "_blank");
      link.attr("rel", "noopener");
      return;
    }
    if (/\.html?(?:$|[#?])/i.test(href)) {
      link.replaceWith(`<strong class="source-note">${escapeHtml(link.text())}</strong>`);
      return;
    }
  });

  root.find("font, center").each((_index, element) => {
    const el = $(element);
    el.replaceWith(el.html() || "");
  });

  root.find("blockquote").each((_index, element) => {
    const quote = $(element);
    quote.replaceWith(`<div class="source-callout">${quote.html() || ""}</div>`);
  });

  root.find("*").each((_index, element: any) => {
    const el = $(element);
    for (const attr of Object.keys(element.attribs || {})) {
      if (!["href", "src", "alt", "title", "target", "rel", "class"].includes(attr)) el.removeAttr(attr);
    }
  });

  root.find("h1, h2").each((index, element) => {
    const heading = $(element);
    const text = normalizeWhitespace(heading.text());
    if (index < 2 && text.toLowerCase() === lessonTitle.toLowerCase()) heading.remove();
  });

  root.find("p, div, span, li, td, th").each((_index, element) => {
    const el = $(element);
    const text = normalizeWhitespace(el.text());
    if (isSourceNoise(text)) el.remove();
  });

  root.find("p, div, span").each((_index, element) => {
    const el = $(element);
    if (normalizeWhitespace(el.text()) === "" && el.find("img, iframe, video, audio, table").length === 0) el.remove();
  });

  root.find("ul > ul, ol > ol").each((_index, element) => {
    const nested = $(element);
    nested.parent().append(nested.children());
    nested.remove();
  });

  root.find("table").each((_index, element) => {
    const table = $(element);
    table.addClass("source-table");
  });

  return root.html()?.trim() || `<p>${escapeHtml(normalizeWhitespace($.text()))}</p>`;
}

async function loadLessons(zip: JSZip, assetsDir: string): Promise<Lesson[]> {
  const lessons: Lesson[] = [];
  for (const source of LESSON_SOURCES) {
    const file = zip.file(source.entry);
    if (!file) throw new Error(`Missing Novel Study source file: ${source.entry}`);
    const raw = decodeBuffer(await file.async("nodebuffer"));
    const sanitized = await sanitizeContent(zip, source.entry, raw, source.title, assetsDir);
    const excerpt = normalizeWhitespace(cheerio.load(sanitized).text()).slice(0, 170);
    lessons.push({
      id: source.id,
      entry: source.entry,
      title: source.title,
      summary: source.summary,
      html: sanitized,
      excerpt,
    });
  }
  return lessons;
}

function renderTopbar(lessonCount = LESSON_SOURCES.length) {
  return `<header class="topbar">
    <button id="topbar-menu-toggle" class="icon-button mobile-only" type="button" aria-label="Toggle sidebar"><span class="material-symbols-rounded">dock_to_left</span></button>
    <img class="topbar-logo" src="assets/brand/nxt-ce-logo-white-with-ce.png" alt="Next Step Continuing Education">
    <div class="progress-widget" aria-label="Course progress">
      <span>Course progress</span>
      <strong><span data-progress-count-inline>0/${lessonCount}</span> lessons</strong>
      <div class="progress-track"><div data-progress-fill></div></div>
    </div>
  </header>`;
}

function renderSidebar(lessons: Lesson[]) {
  return `<aside class="course-sidebar">
    <div class="sidebar-header">
      <h1>Novel Study</h1>
      <p>${COURSE_CODE}</p>
      <button id="sidebar-toggle" class="icon-button" type="button" aria-label="Toggle sidebar"><span class="material-symbols-rounded">dock_to_left</span></button>
    </div>
    <nav aria-label="Course navigation">
      <a class="course-nav-link" href="#overview" data-page-target="overview"><span class="material-symbols-rounded">dashboard</span><span class="sidebar-label">Overview</span></a>
      <div class="lessons-nav">
        <a class="course-nav-link lessons-toggle" href="#lessons" data-page-target="lessons" data-lessons-toggle aria-expanded="false" aria-controls="lesson-subnav"><span class="material-symbols-rounded">menu_book</span><span class="sidebar-label">Lessons</span><span class="material-symbols-rounded lessons-toggle-icon">expand_more</span></a>
        <div id="lesson-subnav" class="lesson-subnav">
          ${lessons
            .map(
              (lesson, index) =>
                `<a href="#${lesson.id}" data-page-target="${lesson.id}"><span>${index + 1}.</span> ${escapeHtml(lesson.title)}</a>`
            )
            .join("")}
        </div>
      </div>
      <a class="course-nav-link" href="#reading-guide" data-page-target="reading-guide"><span class="material-symbols-rounded">auto_stories</span><span class="sidebar-label">Reading Guide</span></a>
      <a class="course-nav-link" href="#writing" data-page-target="writing"><span class="material-symbols-rounded">edit_note</span><span class="sidebar-label">Writing Studio</span></a>
      <a class="course-nav-link" href="#resources" data-page-target="resources"><span class="material-symbols-rounded">folder_open</span><span class="sidebar-label">Resources</span></a>
    </nav>
  </aside>`;
}

function renderOverview(lessons: Lesson[]) {
  return `<section id="overview" class="course-page">
    <p class="course-kicker">${COURSE_CODE} | Novel Study</p>
    <h2>Novel Study</h2>
    <p class="page-intro">Build a practical reading routine for a full-length novel: track characters, follow conflict, collect evidence, and prepare for analytical writing.</p>
    <div class="outcomes-block">
      <h3>I can...</h3>
      <div class="outcome-stack">
        <p>I can read a novel with purpose and track meaning as it develops.</p>
        <p>I can explain how character, conflict, setting, and symbols work as patterns.</p>
        <p>I can use notes and quotations from a novel to support stronger written responses.</p>
      </div>
    </div>
    <div class="overview-actions" aria-label="Novel Study progress and actions">
      <span class="completed-pill"><strong data-progress-count>0 / ${lessons.length}</strong> lessons complete</span>
      <span class="completed-pill">${lessons.length} source lessons</span>
      <a class="button primary" href="#${lessons[0]?.id}" data-page-target="${lessons[0]?.id}">Open Lesson Frame</a>
    </div>
  </section>`;
}

function renderLessonsIndex(lessons: Lesson[]) {
  return `<section id="lessons" class="course-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Lessons</p>
    <h2>Novel Study Lesson Sequence</h2>
    <div class="resource-stack">
      <details class="resource-lesson-group" open>
        <summary class="resource-lesson-summary">
          <span>
            <span class="resource-lesson-kicker">Lesson Group</span>
            <strong>Novel Study</strong>
          </span>
          <span class="resource-lesson-icon" aria-hidden="true">+</span>
        </summary>
        <div class="lesson-index">
          ${lessons
            .map(
              (lesson, index) => `<a class="lesson-card" href="#${lesson.id}" data-page-target="${lesson.id}">
                <span>Lesson ${index + 1}</span>
                <strong>${escapeHtml(lesson.title)}</strong>
                <p>${escapeHtml(lesson.summary)}</p>
                <em>Open lesson</em>
              </a>`
            )
            .join("")}
        </div>
      </details>
    </div>
  </section>`;
}

function renderLesson(lesson: Lesson, lessons: Lesson[], index: number) {
  const next = lessons[index + 1];
  return `<section id="${lesson.id}" class="course-page lesson-shell" hidden>
    <article class="lesson-document">
      <header class="lesson-header">
        <div>
          <p class="course-kicker">Lesson ${index + 1}</p>
          <h2>${escapeHtml(lesson.title)}</h2>
          <p>${escapeHtml(lesson.summary)}</p>
        </div>
      </header>
      <div class="lesson-reader-panel">
        <div class="lesson-body">${lesson.html}</div>
        <footer class="lesson-actions">
          <a class="button" href="#lessons" data-page-target="lessons">Lesson Library</a>
          ${next ? `<a class="button primary" href="#${next.id}" data-page-target="${next.id}">Next Lesson</a>` : `<a class="button primary" href="#reading-guide" data-page-target="reading-guide">Reading Guide</a>`}
          <button class="button primary mark-complete complete-action" type="button" data-complete-id="${lesson.id}">Complete</button>
        </footer>
      </div>
    </article>
  </section>`;
}

function renderReadingGuide() {
  return `<section id="reading-guide" class="course-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Reading Guide</p>
    <h2>Novel Reading Guide</h2>
    <p class="page-intro">Use this as a running evidence notebook while reading or rereading your selected novel. Save specific passages, then return to the bank when you need proof for questions or analytical writing.</p>
    <div class="reading-notebook" data-reading-notebook>
      <textarea class="evidence-store" data-response-id="reading-evidence-bank-json" data-reading-evidence-store hidden></textarea>
      <section class="notebook-setup">
        <label>Novel title
          <input data-response-id="reading-novel-title" data-reading-evidence-field="novelTitle" type="text" placeholder="Name the novel you are studying.">
        </label>
        <label>Reading pass
          <select data-response-id="reading-pass" data-reading-evidence-field="readingPass">
            <option value="">Choose a pass...</option>
            <option>Opening chapters</option>
            <option>Middle chapters</option>
            <option>Final chapters</option>
            <option>Reread</option>
            <option>Final evidence review</option>
          </select>
        </label>
        <label>Current focus
          <select data-response-id="reading-current-focus" data-reading-evidence-field="focus">
            <option value="">Choose a focus...</option>
            <option>Character</option>
            <option>Conflict</option>
            <option>Setting</option>
            <option>Symbol</option>
            <option>Motif</option>
            <option>Theme</option>
            <option>Narration</option>
            <option>Turning point</option>
          </select>
        </label>
      </section>

      <section class="notebook-baseline">
        <article>
          <h3>First reaction</h3>
          <label>What stands out first?
            <textarea data-response-id="reading-first-impression" placeholder="Describe one character choice, image, conflict, sentence, or passage that immediately shapes your reaction."></textarea>
          </label>
        </article>
        <article>
          <h3>Working pattern</h3>
          <label>What larger idea is developing?
            <textarea data-response-id="reading-theme" placeholder="Track a repeated image, conflict, character choice, symbol, or pattern that may become important."></textarea>
          </label>
        </article>
      </section>

      <section class="evidence-entry-panel">
        <div>
          <h3>Add passage evidence</h3>
          <p>Capture one useful passage at a time. Strong novel evidence connects what happens to the author's choices and the idea being developed.</p>
        </div>
        <div class="evidence-entry-grid">
          <label>Chapter and page
            <input data-reading-evidence-draft="location" type="text" placeholder="e.g. Chapter 4, p. 82">
          </label>
          <label>Evidence type
            <select data-response-id="reading-evidence-type" data-reading-evidence-draft="type">
              <option value="">Choose a type...</option>
              <option>Character</option>
              <option>Conflict</option>
              <option>Setting</option>
              <option>Symbol</option>
              <option>Motif</option>
              <option>Theme</option>
              <option>Narration</option>
              <option>Key quotation</option>
              <option>Turning point</option>
            </select>
          </label>
          <label class="evidence-wide">Quotation or important moment
            <textarea data-reading-evidence-draft="passage" placeholder="Copy a short quotation or summarize a precise moment from the novel."></textarea>
          </label>
          <label>Context
            <textarea data-reading-evidence-draft="context" placeholder="What is happening around this passage? Who is involved?"></textarea>
          </label>
          <label>Author's choice
            <textarea data-reading-evidence-draft="choice" placeholder="What does the author control here: diction, imagery, dialogue, contrast, narration, structure, or setting?"></textarea>
          </label>
          <label>Effect on the reader
            <textarea data-response-id="reading-technique-effect" data-reading-evidence-draft="effect" placeholder="How does this choice guide what the reader feels, notices, questions, or understands?"></textarea>
          </label>
          <label>Theme or character connection
            <textarea data-reading-evidence-draft="theme" placeholder="What larger idea, character change, conflict, or pattern does this passage help prove?"></textarea>
          </label>
          <label class="evidence-wide">Why this is useful evidence
            <textarea data-response-id="reading-evidence-use" data-reading-evidence-draft="use" placeholder="Explain how you might use this passage in a novel-study question, paragraph, or critical essay."></textarea>
          </label>
        </div>
        <div class="evidence-actions">
          <button class="lesson-jump primary" type="button" data-reading-evidence-save>Save passage</button>
          <button class="lesson-jump" type="button" data-reading-evidence-clear>Clear draft</button>
          <span class="save-status" data-reading-evidence-status>0 passages saved</span>
        </div>
      </section>

      <section class="evidence-bank-panel">
        <div class="evidence-bank-head">
          <div>
            <h3>Evidence bank</h3>
            <p data-reading-evidence-summary>No passages saved yet.</p>
          </div>
          <label>Filter by evidence type
            <select data-reading-evidence-filter>
              <option value="">All evidence</option>
              <option>Character</option>
              <option>Conflict</option>
              <option>Setting</option>
              <option>Symbol</option>
              <option>Motif</option>
              <option>Theme</option>
              <option>Narration</option>
              <option>Key quotation</option>
              <option>Turning point</option>
            </select>
          </label>
        </div>
        <div class="evidence-bank-list" data-reading-evidence-list></div>
      </section>

      <section class="evidence-synthesis-panel">
        <h3>Turn the bank into a response</h3>
        <div class="evidence-entry-grid">
          <label>What pattern is emerging across your evidence?
            <textarea data-response-id="reading-synthesis-pattern" placeholder="Name a recurring conflict, character shift, symbol, motif, or idea."></textarea>
          </label>
          <label>Which saved passage is your strongest evidence so far?
            <textarea data-response-id="reading-synthesis-strongest" placeholder="Choose one card from the evidence bank and explain why it is strong."></textarea>
          </label>
          <label class="evidence-wide">How could this evidence help answer a novel-study question?
            <textarea data-response-id="reading-synthesis-question-link" placeholder="Connect your evidence bank to a question about character, theme, conflict, setting, or author's craft."></textarea>
          </label>
        </div>
      </section>
    </div>
    <div class="lesson-bottom-bar">
      <button class="lesson-jump primary" type="button" data-print-writing>Print Reading Portfolio</button>
      <span class="save-status" data-save-status>Saved locally</span>
    </div>
    <script>
(() => {
  function escapeText(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }
  function getField(root, selector) {
    return root.querySelector(selector);
  }
  function readCards(root) {
    const store = getField(root, "[data-reading-evidence-store]");
    try {
      const parsed = JSON.parse(store?.value || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  function writeCards(root, cards) {
    const store = getField(root, "[data-reading-evidence-store]");
    if (!store) return;
    store.value = JSON.stringify(cards);
    store.dispatchEvent(new Event("input", { bubbles: true }));
    renderCards(root);
  }
  function setDraft(root, card) {
    root.dataset.editingReadingEvidenceId = card?.id || "";
    root.querySelectorAll("[data-reading-evidence-draft]").forEach((field) => {
      const nextValue = card?.[field.getAttribute("data-reading-evidence-draft")] || "";
      const didChange = field.value !== nextValue;
      field.value = nextValue;
      if (didChange && field.hasAttribute("data-response-id")) {
        field.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    const saveButton = getField(root, "[data-reading-evidence-save]");
    if (saveButton) saveButton.textContent = card ? "Update passage" : "Save passage";
  }
  function collectDraft(root) {
    const card = {
      id: root.dataset.editingReadingEvidenceId || "reading-evidence-" + Date.now(),
      novelTitle: getField(root, "[data-reading-evidence-field='novelTitle']")?.value || "",
      readingPass: getField(root, "[data-reading-evidence-field='readingPass']")?.value || "",
      focus: getField(root, "[data-reading-evidence-field='focus']")?.value || "",
      strongest: false
    };
    root.querySelectorAll("[data-reading-evidence-draft]").forEach((field) => {
      card[field.getAttribute("data-reading-evidence-draft")] = field.value || "";
    });
    return card;
  }
  function usefulCard(card) {
    return ["location", "type", "passage", "context", "choice", "effect", "theme", "use"].some((key) => String(card[key] || "").trim());
  }
  function updateSummary(root, cards) {
    const summary = getField(root, "[data-reading-evidence-summary]");
    const status = getField(root, "[data-reading-evidence-status]");
    const strongest = cards.filter((card) => card.strongest).length;
    const types = new Set(cards.map((card) => card.type).filter(Boolean)).size;
    const text = cards.length
      ? cards.length + " passage" + (cards.length === 1 ? "" : "s") + " saved · " + strongest + " marked strongest · " + types + " evidence type" + (types === 1 ? "" : "s")
      : "No passages saved yet.";
    if (summary) summary.textContent = text;
    if (status) status.textContent = cards.length + " passage" + (cards.length === 1 ? "" : "s") + " saved";
  }
  function renderCards(root) {
    const list = getField(root, "[data-reading-evidence-list]");
    if (!list) return;
    const cards = readCards(root);
    const filter = getField(root, "[data-reading-evidence-filter]")?.value || "";
    const visibleCards = filter ? cards.filter((card) => card.type === filter) : cards;
    updateSummary(root, cards);
    if (!visibleCards.length) {
      list.innerHTML = '<p class="evidence-empty">No saved passages match this view yet. Add a passage above, then mark the strongest ones as you read.</p>';
      return;
    }
    list.innerHTML = visibleCards
      .map((card) => '<article class="evidence-card' + (card.strongest ? " is-strongest" : "") + '">' +
        '<div class="evidence-card-top"><strong>Passage ' + (cards.indexOf(card) + 1) + '</strong><span>' + escapeText(card.type || "Type not set") + '</span></div>' +
        '<h4>' + escapeText(card.location || "Location not set") + '</h4>' +
        '<dl>' +
          '<div><dt>Quotation or moment</dt><dd>' + escapeText(card.passage || "Not recorded yet.") + '</dd></div>' +
          '<div><dt>Context</dt><dd>' + escapeText(card.context || "Not recorded yet.") + '</dd></div>' +
          '<div><dt>Author choice</dt><dd>' + escapeText(card.choice || "Not recorded yet.") + '</dd></div>' +
          '<div><dt>Effect</dt><dd>' + escapeText(card.effect || "Not recorded yet.") + '</dd></div>' +
          '<div><dt>Connection</dt><dd>' + escapeText(card.theme || "Not recorded yet.") + '</dd></div>' +
          '<div><dt>Use as evidence</dt><dd>' + escapeText(card.use || "Not recorded yet.") + '</dd></div>' +
        '</dl>' +
        '<div class="evidence-card-actions">' +
          '<button type="button" data-reading-evidence-strong="' + escapeText(card.id) + '">' + (card.strongest ? "Strong evidence" : "Mark strongest") + '</button>' +
          '<button type="button" data-reading-evidence-edit="' + escapeText(card.id) + '">Edit</button>' +
          '<button type="button" data-reading-evidence-delete="' + escapeText(card.id) + '">Delete</button>' +
        '</div>' +
      '</article>')
      .join("");
  }
  function initReadingNotebook() {
    document.querySelectorAll("[data-reading-notebook]").forEach((root) => {
      renderCards(root);
      root.addEventListener("click", (event) => {
        const save = event.target.closest("[data-reading-evidence-save]");
        const clear = event.target.closest("[data-reading-evidence-clear]");
        const edit = event.target.closest("[data-reading-evidence-edit]");
        const remove = event.target.closest("[data-reading-evidence-delete]");
        const strong = event.target.closest("[data-reading-evidence-strong]");
        if (save) {
          const card = collectDraft(root);
          if (!usefulCard(card)) {
            const status = getField(root, "[data-reading-evidence-status]");
            if (status) status.textContent = "Add at least one note before saving.";
            return;
          }
          const cards = readCards(root);
          const existingIndex = cards.findIndex((item) => item.id === card.id);
          if (existingIndex >= 0) {
            card.strongest = Boolean(cards[existingIndex].strongest);
            cards[existingIndex] = card;
          } else {
            cards.push(card);
          }
          writeCards(root, cards);
          setDraft(root, null);
        }
        if (clear) setDraft(root, null);
        if (edit) {
          const card = readCards(root).find((item) => item.id === edit.getAttribute("data-reading-evidence-edit"));
          if (card) setDraft(root, card);
        }
        if (remove) {
          writeCards(root, readCards(root).filter((item) => item.id !== remove.getAttribute("data-reading-evidence-delete")));
          if (root.dataset.editingReadingEvidenceId === remove.getAttribute("data-reading-evidence-delete")) setDraft(root, null);
        }
        if (strong) {
          const id = strong.getAttribute("data-reading-evidence-strong");
          writeCards(root, readCards(root).map((item) => item.id === id ? { ...item, strongest: !item.strongest } : item));
        }
      });
      root.addEventListener("change", (event) => {
        if (event.target.closest("[data-reading-evidence-filter]")) renderCards(root);
      });
      root.addEventListener("input", (event) => {
        if (event.target.closest("[data-reading-evidence-store]")) renderCards(root);
      });
      window.setTimeout(() => renderCards(root), 0);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initReadingNotebook);
  else initReadingNotebook();
})();
    </script>
  </section>`;
}

function renderNovelStudyQuestions(slug = DEFAULT_SLUG) {
  const defaultSection = NOVEL_QUESTION_SECTIONS[0];
  const sectionOptions = NOVEL_QUESTION_SECTIONS.map(
    (section) => `<option value="${escapeHtml(section.id)}">${escapeHtml(section.title)}</option>`
  ).join("");
  const questionPanels = NOVEL_QUESTION_SECTIONS.map(
    (section, sectionIndex) => `<article class="novel-question-panel" data-novel-question-panel="${escapeHtml(section.id)}" data-panel-title="${escapeHtml(section.title)}" data-panel-subtitle="${escapeHtml(section.subtitle)}" ${sectionIndex === 0 ? "" : "hidden"}>
      <header class="novel-question-document-header">
        <p>ELA 20-1 Formative Reading</p>
        <h3 data-novel-question-title>${escapeHtml(section.title)}</h3>
        <span data-novel-question-subtitle>${escapeHtml(section.subtitle)}</span>
        <div class="novel-question-progress">
          <div><span>Formative Progress</span><strong data-novel-question-progress-label>0 of ${section.questions.length} answered</strong></div>
          <div class="novel-question-progress-track"><div data-novel-question-progress-fill></div></div>
        </div>
      </header>
      <div class="novel-question-list">
        ${section.questions
          .map(
            (question, questionIndex) => `<div class="novel-question-item">
              <div class="novel-question-prompt">
                <strong>${questionIndex + 1}.</strong>
                <span>${escapeHtml(question.text)}</span>
              </div>
              <div class="novel-question-hint" data-novel-question-hint hidden><strong>Teacher Hint:</strong> ${escapeHtml(question.hint)}</div>
              <label class="novel-answer-field">
                <textarea rows="5" data-novel-question-answer="${escapeHtml(`${section.id}-${question.id}`)}" placeholder="Type your analytical response here..."></textarea>
                <span class="novel-word-count">0 words</span>
              </label>
            </div>`
          )
          .join("")}
      </div>
    </article>`
  ).join("");

  return `<section id="novel-study-questions" class="course-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Novel Study Questions</p>
    <h2>Novel Study Questions</h2>
    <p class="page-intro">Complete these formative questions after each third of your selected novel. Use specific evidence from the text whenever possible.</p>
    <div class="novel-question-studio" data-novel-question-studio>
      <div class="novel-question-controls">
        <label for="novel-question-section-select">Choose a section</label>
        <select id="novel-question-section-select" data-novel-question-section-select>
          ${sectionOptions}
        </select>
      </div>
      <div class="novel-question-toolbar">
        <span class="novel-question-save-status" data-novel-question-save-status></span>
        <button type="button" data-novel-question-toggle-hints><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button>
        <button type="button" data-novel-question-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
      </div>
      <div class="novel-question-document">
        ${questionPanels}
        <section class="novel-question-synthesis">
          <h3>Critical Analytical Essay Prep</h3>
          <p>After finishing the novel, use your section answers to prepare for the critical analytical essay.</p>
          <label class="novel-answer-field">
            <span>Working thesis</span>
            <textarea rows="5" data-novel-question-answer="essay-working-thesis" placeholder="Draft a thesis about the novel's most important idea..."></textarea>
            <span class="novel-word-count">0 words</span>
          </label>
          <label class="novel-answer-field">
            <span>Evidence plan</span>
            <textarea rows="6" data-novel-question-answer="essay-evidence-plan" placeholder="List 2-3 moments, quotations, or character choices you could use as evidence..."></textarea>
            <span class="novel-word-count">0 words</span>
          </label>
        </section>
      </div>
    </div>
    <script>
(() => {
  const root = document.querySelector("[data-novel-question-studio]");
  if (!root) return;
  const storageKey = "canvas-helper:${escapeHtml(slug)}:responses";
  const select = root.querySelector("[data-novel-question-section-select]");
  const saveStatus = root.querySelector("[data-novel-question-save-status]");
  let hintsVisible = false;
  let saveTimer = null;
  function readResponses(){
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { return {}; }
  }
  function writeResponses(values){
    localStorage.setItem(storageKey, JSON.stringify(values));
  }
  function wordCount(value){
    return String(value || "").trim().split(/\\s+/).filter(Boolean).length;
  }
  function updateFieldCount(field){
    const countNode = field.closest(".novel-answer-field")?.querySelector(".novel-word-count");
    if (countNode) countNode.textContent = wordCount(field.value) + " words";
  }
  function activePanel(){
    return root.querySelector('[data-novel-question-panel]:not([hidden])');
  }
  function updateProgress(){
    const panel = activePanel();
    if (!panel) return;
    const fields = Array.from(panel.querySelectorAll("[data-novel-question-answer]"));
    const answered = fields.filter((field) => String(field.value || "").trim()).length;
    const total = fields.length;
    const label = panel.querySelector("[data-novel-question-progress-label]");
    const fill = panel.querySelector("[data-novel-question-progress-fill]");
    if (label) label.textContent = answered + " of " + total + " answered";
    if (fill) fill.style.width = total ? Math.round((answered / total) * 100) + "%" : "0%";
  }
  function restoreResponses(){
    const responses = readResponses();
    root.querySelectorAll("[data-novel-question-answer]").forEach((field) => {
      const key = field.getAttribute("data-novel-question-answer");
      field.value = key ? responses[key] || "" : "";
      updateFieldCount(field);
    });
    updateProgress();
  }
  function setSection(sectionId){
    root.querySelectorAll("[data-novel-question-panel]").forEach((panel) => {
      panel.hidden = panel.getAttribute("data-novel-question-panel") !== sectionId;
    });
    root.querySelectorAll("[data-novel-question-hint]").forEach((hint) => {
      hint.hidden = !hintsVisible;
    });
    updateProgress();
  }
  select?.addEventListener("change", () => setSection(select.value));
  root.addEventListener("click", (event) => {
    const hintsButton = event.target.closest("[data-novel-question-toggle-hints]");
    if (hintsButton) {
      hintsVisible = !hintsVisible;
      hintsButton.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> ' + (hintsVisible ? "Hide Hints" : "Show Hints");
      root.querySelectorAll("[data-novel-question-hint]").forEach((hint) => { hint.hidden = !hintsVisible; });
    }
    if (event.target.closest("[data-novel-question-print]")) {
      const panel = root.querySelector("[data-novel-question-panel]:not([hidden])") || root;
      if (typeof window.printCourseSection === "function") window.printCourseSection(panel);
      else window.print();
    }
  });
  root.addEventListener("input", (event) => {
    const field = event.target.closest("[data-novel-question-answer]");
    if (!field) return;
    const key = field.getAttribute("data-novel-question-answer");
    if (!key) return;
    const responses = readResponses();
    responses[key] = field.value;
    writeResponses(responses);
    updateFieldCount(field);
    updateProgress();
    if (saveStatus) {
      saveStatus.textContent = "Saving...";
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => { saveStatus.textContent = "Saved locally"; }, 700);
    }
  });
  if (select) select.value = "${escapeHtml(defaultSection.id)}";
  restoreResponses();
  setSection(select?.value || "${escapeHtml(defaultSection.id)}");
})();
    </script>
  </section>`;
}

function renderWritingStudio(slug = DEFAULT_SLUG) {
  const motifOptions = MOTIF_OPTIONS.map(
    (motif) => `<option value="${escapeHtml(motif.id)}">${escapeHtml(motif.id)}</option>`
  ).join("");
  const authorIntentPromptButtons = AUTHOR_INTENT_PROMPTS.map(
    (prompt, index) => `<button type="button" role="option" aria-selected="${index === 0 ? "true" : "false"}" data-author-prompt-choice="${escapeHtml(prompt.id)}" class="${index === 0 ? "is-active" : ""}">${escapeHtml(prompt.text)}</button>`
  ).join("");
  const defaultAuthorPrompt = AUTHOR_INTENT_PROMPTS[0]?.text || "Choose a plot-level question";
  const activityOptions = [
    { value: "paragraph-builder", label: "Analytical Paragraph Builder" },
    { value: "motif-string-board", label: "Motif String Board" },
    { value: "author-intent-toggle", label: "Author's Intent Toggle" },
  ];
  return `<section id="writing" class="course-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Writing Studio</p>
    <h2>Novel Study Writing Studio</h2>
    <p class="page-intro">Turn reading notes into a clear analytical response. Build from claim to evidence to explanation, then check the paragraph for precision.</p>
    <div class="writing-activity-shell" data-writing-studio>
      <div class="writing-activity-picker">
        <div>
          <label for="writing-activity-select">Choose a workbook activity</label>
          <p>Switch between draft building and motif evidence tracking. Your work stays saved in this browser.</p>
        </div>
        <select id="writing-activity-select" data-writing-activity-select>
          ${activityOptions.map((option) => `<option value="${option.value}">${escapeHtml(option.label)}</option>`).join("")}
        </select>
      </div>

      <article class="writing-activity-panel" data-writing-activity-panel="paragraph-builder">
        <header class="writing-activity-header">
          <h3>Analytical Paragraph Builder</h3>
          <p>Build a controlling idea, connect evidence, draft the paragraph, and run a quick revision check.</p>
        </header>
        <div class="writing-activity-body paragraph-builder-tool" data-paragraph-builder>
          <section class="paragraph-builder-instructions">
            <h4>Using the builder</h4>
            <ol>
              <li>Draft a controlling idea that can be argued.</li>
              <li>Connect two pieces of evidence before writing the paragraph.</li>
              <li>Run the revision check, then save each attempt to the paragraph bank.</li>
            </ol>
          </section>

          <form class="paragraph-builder-form" data-paragraph-form>
            <section class="paragraph-builder-section">
              <h3>Controlling idea</h3>
              <p>Make a claim that can be argued, not just observed.</p>
              <label>What does the novel suggest about people, choices, conflict, or change?<textarea rows="5" data-response-id="controlling-idea" placeholder="Draft one arguable idea in a complete sentence..."></textarea></label>
            </section>
            <section class="paragraph-builder-section">
              <h3>Evidence bank</h3>
              <label>Quotation or moment 1<textarea rows="4" data-response-id="evidence-one" placeholder="Add quotation or moment, page number, speaker, and context..."></textarea></label>
              <label>Quotation or moment 2<textarea rows="4" data-response-id="evidence-two" placeholder="Add a second piece of evidence that develops or complicates the idea..."></textarea></label>
              <label>Why these details fit together<textarea rows="4" data-response-id="evidence-connection" placeholder="Explain the pattern these two details create..."></textarea></label>
            </section>
            <section class="paragraph-builder-section">
              <h3>Paragraph builder</h3>
              <label>Analytical paragraph<textarea rows="10" data-response-id="paragraph-builder" placeholder="Write a full paragraph: claim, evidence, explanation, second evidence, deeper explanation, concluding insight..."></textarea></label>
            </section>
            <section class="paragraph-builder-section">
              <h3>Revision check</h3>
              <label class="check-row"><input type="checkbox" data-response-id="revision-claim"> My claim is arguable and specific.</label>
              <label class="check-row"><input type="checkbox" data-response-id="revision-evidence"> My evidence includes page references or clear context.</label>
              <label class="check-row"><input type="checkbox" data-response-id="revision-analysis"> My explanation says how the evidence proves the claim.</label>
              <label class="check-row"><input type="checkbox" data-response-id="revision-polish"> I checked sentence clarity and formal tone.</label>
            </section>
            <div class="paragraph-builder-actions">
              <button class="button primary" type="submit">Save paragraph</button>
              <span data-paragraph-status>Saved locally</span>
            </div>
          </form>

          <section class="paragraph-bank-shell">
            <div class="paragraph-bank-header">
              <div>
                <h4>Paragraph bank</h4>
                <p>Saved attempts stay here so students can compare revisions and submit more than one version.</p>
              </div>
              <strong data-paragraph-count>0 saved paragraphs</strong>
            </div>
            <div class="paragraph-bank-list" data-paragraph-bank></div>
          </section>

          <div class="paragraph-bottom-actions">
            <button class="button primary" type="button" data-print-writing>Print / PDF</button>
          </div>
        </div>
      </article>

      <article class="writing-activity-panel motif-board-panel" data-writing-activity-panel="motif-string-board" hidden>
        <header class="writing-activity-header">
          <h3>Motif String Board</h3>
          <p>Track quotations and moments by recurring motif so patterns are visible before you write.</p>
        </header>
        <div class="writing-activity-body motif-board" data-motif-board>
          <section class="motif-instructions">
            <h4>Using the board</h4>
            <ol>
              <li>Choose a motif that keeps returning in the novel.</li>
              <li>Add a quotation or important moment with a chapter and page, then save it to the board.</li>
              <li>Use the filters to compare repeated evidence before drafting.</li>
            </ol>
          </section>
          <form class="motif-entry-form" data-motif-form>
            <label class="motif-quote-field">Quotation or important moment
              <textarea rows="4" data-motif-quote placeholder="Paste a quotation or summarize a moment from the novel..."></textarea>
            </label>
            <div class="motif-form-grid">
              <label>Motif
                <select data-motif-select>${motifOptions}</select>
              </label>
              <label>Chapter
                <input type="number" min="1" step="1" data-motif-chapter placeholder="1">
              </label>
              <label>Page
                <input type="text" data-motif-page placeholder="42">
              </label>
            </div>
            <div class="motif-save-line">
              <button class="button primary" type="submit">Save to board</button>
              <span data-motif-status>Saved locally</span>
            </div>
          </form>

          <div class="motif-board-tools">
            <div class="motif-filter-row" data-motif-filters></div>
            <button class="button" type="button" data-motif-sort>Sort: Chapter Asc</button>
          </div>

          <div class="motif-board-summary">
            <strong data-motif-count>0 quote cards</strong>
            <span>Use the filter buttons to compare one repeated idea across the full novel.</span>
          </div>
          <div class="motif-card-grid" data-motif-cards></div>
          <div class="motif-empty-state" data-motif-empty>
            <h4>No evidence saved yet</h4>
            <p>Add a quotation, motif, chapter, and page to start building a visible evidence pattern.</p>
          </div>
          <div class="motif-bottom-actions">
            <button class="button primary" type="button" data-print-writing>Print / PDF</button>
          </div>
        </div>
      </article>

      <article class="writing-activity-panel author-intent-panel" data-writing-activity-panel="author-intent-toggle" hidden>
        <header class="writing-activity-header">
          <h3>Author's Intent Toggle</h3>
          <p>Move from what the character experiences to why the author built that moment into the novel.</p>
        </header>
        <div class="writing-activity-body author-intent-tool" data-author-intent>
          <section class="author-intent-instructions">
            <h4>How it works</h4>
            <ol>
              <li>Answer a plot-level question from inside the character's reality.</li>
              <li>Pivot to the author level and explain what the writer is exposing or critiquing.</li>
              <li>Save the pair so your archive becomes evidence for later analytical writing.</li>
            </ol>
          </section>

          <div class="author-intent-tabs" role="tablist" aria-label="Author intent stages">
            <button type="button" data-author-view-button="plot" class="is-active">Plot Level</button>
            <button type="button" data-author-view-button="author">Author Level</button>
            <button type="button" data-author-view-button="archive">Saved Analyses <span data-author-archive-count>0</span></button>
          </div>

          <section class="author-intent-view" data-author-view="plot">
            <div class="author-intent-copy">
              <h4>Character's reality</h4>
              <p>Treat the character as a person making choices within the world of the novel.</p>
            </div>
            <div class="author-prompt-block">
              <span>Choose a plot-level question</span>
              <details class="author-prompt-dropdown" data-author-prompt-dropdown>
                <summary><span data-author-prompt-summary>${escapeHtml(defaultAuthorPrompt)}</span></summary>
                <div class="author-prompt-list" role="listbox" data-author-prompt-list>
                  ${authorIntentPromptButtons}
                </div>
              </details>
            </div>
            <label>Plot-level response
              <textarea rows="6" data-author-plot placeholder="Explain the character's choice, conflict, reaction, or motivation..."></textarea>
            </label>
            <div class="author-intent-actions">
              <button class="button primary" type="button" data-author-pivot>Pivot to author level</button>
              <span data-author-status>Saved locally</span>
            </div>
          </section>

          <section class="author-intent-view" data-author-view="author" hidden>
            <div class="author-intent-reference" data-author-reference>
              Complete the plot-level response first, then pivot here.
            </div>
            <div class="author-intent-copy">
              <h4>Author's construction</h4>
              <p>Step outside the plot. Explain why the author may have engineered this situation.</p>
            </div>
            <label>Author-level analysis
              <textarea rows="7" data-author-analysis placeholder="The author constructs this moment to reveal..."></textarea>
            </label>
            <div class="author-intent-actions">
              <button class="button" type="button" data-author-back>Back to plot level</button>
              <button class="button primary" type="button" data-author-save>Save analysis</button>
              <span data-author-status>Saved locally</span>
            </div>
          </section>

          <section class="author-intent-view" data-author-view="archive" hidden>
            <div class="author-intent-archive-header">
              <div>
                <h4>Saved analyses</h4>
                <p>Use this archive to compare plot-level evidence with author-level meaning.</p>
              </div>
              <button class="button" type="button" data-author-new>New analysis</button>
            </div>
            <div class="author-intent-archive" data-author-archive></div>
          </section>

          <div class="author-intent-bottom-actions">
            <button class="button primary" type="button" data-print-writing>Print / PDF</button>
          </div>
        </div>
      </article>
    </div>
    <script>
(() => {
  const root = document.querySelector("[data-writing-studio]");
  if (!root) return;
  const storageKey = "canvas-helper:${escapeHtml(slug)}:responses";
  const paragraphEntriesKey = "paragraph-builder:entries";
  const entriesKey = "motif-string-board:entries";
  const authorEntriesKey = "author-intent-toggle:entries";
  const authorDraftKey = "author-intent-toggle:draft";
  const motifs = ${scriptJson(MOTIF_OPTIONS)};
  const authorPrompts = ${scriptJson(AUTHOR_INTENT_PROMPTS)};
  let paragraphEntries = [];
  let entries = [];
  let authorEntries = [];
  let selectedAuthorPromptId = authorPrompts[0]?.id || "";
  let currentFilter = "All";
  let sortOrder = "asc";
  let statusTimer = null;
  let paragraphStatusTimer = null;
  let authorStatusTimer = null;
  const activitySelect = root.querySelector("[data-writing-activity-select]");
  const paragraphForm = root.querySelector("[data-paragraph-form]");
  const paragraphBankRoot = root.querySelector("[data-paragraph-bank]");
  const paragraphCountRoot = root.querySelector("[data-paragraph-count]");
  const paragraphStatusRoot = root.querySelector("[data-paragraph-status]");
  const form = root.querySelector("[data-motif-form]");
  const quoteField = root.querySelector("[data-motif-quote]");
  const motifField = root.querySelector("[data-motif-select]");
  const chapterField = root.querySelector("[data-motif-chapter]");
  const pageField = root.querySelector("[data-motif-page]");
  const cardsRoot = root.querySelector("[data-motif-cards]");
  const emptyRoot = root.querySelector("[data-motif-empty]");
  const filtersRoot = root.querySelector("[data-motif-filters]");
  const countRoot = root.querySelector("[data-motif-count]");
  const statusRoot = root.querySelector("[data-motif-status]");
  const sortButton = root.querySelector("[data-motif-sort]");
  const authorRoot = root.querySelector("[data-author-intent]");
  const authorPromptList = root.querySelector("[data-author-prompt-list]");
  const authorPromptDropdown = root.querySelector("[data-author-prompt-dropdown]");
  const authorPromptSummary = root.querySelector("[data-author-prompt-summary]");
  const authorPlotField = root.querySelector("[data-author-plot]");
  const authorAnalysisField = root.querySelector("[data-author-analysis]");
  const authorReference = root.querySelector("[data-author-reference]");
  const authorArchiveRoot = root.querySelector("[data-author-archive]");

  function readResponses(){
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { return {}; }
  }
  function writeResponses(values){
    localStorage.setItem(storageKey, JSON.stringify(values));
  }
  function escapeText(value){
    return String(value || "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[character]));
  }
  function normalizeEntry(entry){
    if (!entry || typeof entry !== "object") return null;
    const quote = String(entry.quote || "").trim();
    const motif = String(entry.motif || "").trim();
    const page = String(entry.page || "").trim();
    const chapter = Number.parseInt(String(entry.chapter || ""), 10);
    if (!quote || !motif || !page || !Number.isFinite(chapter) || chapter < 1) return null;
    return {
      id: String(entry.id || Math.random().toString(36).slice(2, 10)),
      quote,
      motif,
      page,
      chapter,
      createdAt: Number(entry.createdAt || Date.now())
    };
  }
  function loadEntries(){
    const stored = readResponses()[entriesKey];
    entries = Array.isArray(stored) ? stored.map(normalizeEntry).filter(Boolean) : [];
  }
  function normalizeParagraphEntry(entry){
    if (!entry || typeof entry !== "object") return null;
    const controllingIdea = String(entry.controllingIdea || "").trim();
    const paragraph = String(entry.paragraph || "").trim();
    if (!controllingIdea && !paragraph) return null;
    return {
      id: String(entry.id || Math.random().toString(36).slice(2, 10)),
      controllingIdea,
      evidenceOne: String(entry.evidenceOne || "").trim(),
      evidenceTwo: String(entry.evidenceTwo || "").trim(),
      evidenceConnection: String(entry.evidenceConnection || "").trim(),
      paragraph,
      checklist: {
        claim: Boolean(entry.checklist?.claim),
        evidence: Boolean(entry.checklist?.evidence),
        analysis: Boolean(entry.checklist?.analysis),
        polish: Boolean(entry.checklist?.polish),
      },
      createdAt: Number(entry.createdAt || Date.now())
    };
  }
  function loadParagraphEntries(){
    const stored = readResponses()[paragraphEntriesKey];
    paragraphEntries = Array.isArray(stored) ? stored.map(normalizeParagraphEntry).filter(Boolean) : [];
  }
  function normalizeAuthorEntry(entry){
    if (!entry || typeof entry !== "object") return null;
    const question = String(entry.question || "").trim();
    const plot = String(entry.plot || "").trim();
    const author = String(entry.author || "").trim();
    if (!question || !plot || !author) return null;
    return {
      id: String(entry.id || Math.random().toString(36).slice(2, 10)),
      question,
      promptId: String(entry.promptId || ""),
      plot,
      author,
      createdAt: Number(entry.createdAt || Date.now())
    };
  }
  function readAuthorDraft(){
    const draft = readResponses()[authorDraftKey];
    return draft && typeof draft === "object" ? draft : {};
  }
  function writeAuthorDraft(patch = {}){
    const responses = readResponses();
    responses[authorDraftKey] = { ...(responses[authorDraftKey] || {}), ...patch };
    writeResponses(responses);
  }
  function loadAuthorEntries(){
    const responses = readResponses();
    const stored = responses[authorEntriesKey];
    authorEntries = Array.isArray(stored) ? stored.map(normalizeAuthorEntry).filter(Boolean) : [];
    const draft = readAuthorDraft();
    if (typeof draft.promptId === "string" && draft.promptId && authorPrompts.some((prompt) => prompt.id === draft.promptId)) selectedAuthorPromptId = draft.promptId;
    if (authorPlotField && typeof draft.plot === "string") authorPlotField.value = draft.plot;
    if (authorAnalysisField && typeof draft.author === "string") authorAnalysisField.value = draft.author;
    renderAuthorPromptChoices();
  }
  function saveEntries(message = "Saved locally"){
    const responses = readResponses();
    responses[entriesKey] = entries;
    writeResponses(responses);
    if (statusRoot) {
      statusRoot.textContent = message;
      clearTimeout(statusTimer);
      statusTimer = setTimeout(() => { statusRoot.textContent = "Saved locally"; }, 1200);
    }
  }
  function setParagraphStatus(message){
    if (!paragraphStatusRoot) return;
    paragraphStatusRoot.textContent = message;
    clearTimeout(paragraphStatusTimer);
    paragraphStatusTimer = setTimeout(() => { paragraphStatusRoot.textContent = "Saved locally"; }, 1200);
  }
  function saveParagraphEntries(message = "Saved locally"){
    const responses = readResponses();
    responses[paragraphEntriesKey] = paragraphEntries;
    writeResponses(responses);
    setParagraphStatus(message);
  }
  function saveAuthorEntries(message = "Saved locally"){
    const responses = readResponses();
    responses[authorEntriesKey] = authorEntries;
    writeResponses(responses);
    setAuthorStatus(message);
  }
  function setAuthorStatus(message){
    root.querySelectorAll("[data-author-status]").forEach((status) => { status.textContent = message; });
    clearTimeout(authorStatusTimer);
    authorStatusTimer = setTimeout(() => {
      root.querySelectorAll("[data-author-status]").forEach((status) => { status.textContent = "Saved locally"; });
    }, 1200);
  }
  function setActivity(value){
    root.querySelectorAll("[data-writing-activity-panel]").forEach((panel) => {
      panel.hidden = panel.getAttribute("data-writing-activity-panel") !== value;
    });
  }
  function getMotifColor(motifId){
    const match = motifs.find((motif) => motif.id === motifId);
    return match ? match.color : "#4f5a4f";
  }
  function filteredEntries(){
    return entries
      .filter((entry) => currentFilter === "All" || entry.motif === currentFilter)
      .slice()
      .sort((a, b) => {
        if (a.chapter !== b.chapter) return sortOrder === "asc" ? a.chapter - b.chapter : b.chapter - a.chapter;
        return b.createdAt - a.createdAt;
      });
  }
  function renderFilters(){
    if (!filtersRoot) return;
    const options = ["All", ...motifs.map((motif) => motif.id)];
    filtersRoot.innerHTML = options.map((option) => {
      const selected = option === currentFilter ? " is-active" : "";
      const color = option === "All" ? "#154212" : getMotifColor(option);
      const label = option === "All" ? "All Motifs" : option;
      return '<button type="button" class="motif-filter' + selected + '" data-motif-filter="' + escapeText(option) + '" style="--motif-color: ' + escapeText(color) + '">' + escapeText(label) + '</button>';
    }).join("");
  }
  function renderBoard(){
    const visible = filteredEntries();
    if (countRoot) countRoot.textContent = entries.length + (entries.length === 1 ? " quote card" : " quote cards");
    if (sortButton) sortButton.textContent = "Sort: Chapter " + (sortOrder === "asc" ? "Asc" : "Desc");
    if (!cardsRoot || !emptyRoot) return;
    cardsRoot.hidden = visible.length === 0;
    emptyRoot.hidden = visible.length > 0;
    cardsRoot.innerHTML = visible.map((entry) => {
      const color = getMotifColor(entry.motif);
      return '<article class="motif-card" style="--motif-color: ' + escapeText(color) + '">' +
        '<div class="motif-card-top"><strong>' + escapeText(entry.motif) + '</strong></div>' +
        '<blockquote>' + escapeText(entry.quote) + '</blockquote>' +
        '<footer><span>Chapter ' + escapeText(entry.chapter) + '</span><span>Page ' + escapeText(entry.page) + '</span><button type="button" data-motif-delete="' + escapeText(entry.id) + '">Remove</button></footer>' +
      '</article>';
    }).join("");
  }
  function saveEntryFromFields(){
    const entry = normalizeEntry({
      quote: quoteField?.value,
      motif: motifField?.value,
      chapter: chapterField?.value,
      page: pageField?.value,
      createdAt: Date.now()
    });
    if (!entry) {
      if (statusRoot) statusRoot.textContent = "Complete the fields to save a card";
      return;
    }
    entries.push(entry);
    if (quoteField) quoteField.value = "";
    if (chapterField) chapterField.value = "";
    if (pageField) pageField.value = "";
    saveEntries("Saved to board");
    renderBoard();
  }
  function fieldValue(key){
    return String(root.querySelector('[data-response-id="' + key + '"]')?.value || "").trim();
  }
  function fieldChecked(key){
    return Boolean(root.querySelector('[data-response-id="' + key + '"]')?.checked);
  }
  function clearParagraphDraft(){
    const responses = readResponses();
    paragraphForm?.querySelectorAll("[data-response-id]").forEach((field) => {
      const key = field.getAttribute("data-response-id");
      if (!key) return;
      if (field.type === "checkbox") field.checked = false;
      else field.value = "";
      delete responses[key];
    });
    writeResponses(responses);
  }
  function renderParagraphBank(){
    if (paragraphCountRoot) paragraphCountRoot.textContent = paragraphEntries.length + (paragraphEntries.length === 1 ? " saved paragraph" : " saved paragraphs");
    if (!paragraphBankRoot) return;
    if (!paragraphEntries.length) {
      paragraphBankRoot.innerHTML = '<div class="paragraph-bank-empty"><h4>No paragraphs saved yet</h4><p>Complete the builder, then save each paragraph attempt here.</p></div>';
      return;
    }
    const sorted = paragraphEntries.slice().sort((a, b) => b.createdAt - a.createdAt);
    paragraphBankRoot.innerHTML = sorted.map((entry) => {
      const checked = Object.values(entry.checklist).filter(Boolean).length;
      return '<article class="paragraph-bank-card">' +
        '<div class="paragraph-bank-card-header"><strong>' + escapeText(entry.controllingIdea || "Untitled paragraph") + '</strong><button type="button" data-paragraph-delete="' + escapeText(entry.id) + '">Remove</button></div>' +
        '<div class="paragraph-bank-grid">' +
          '<section><h5>Evidence</h5><p>' + escapeText([entry.evidenceOne, entry.evidenceTwo, entry.evidenceConnection].filter(Boolean).join("\\n\\n")) + '</p></section>' +
          '<section><h5>Paragraph</h5><p>' + escapeText(entry.paragraph || "No paragraph text saved.") + '</p></section>' +
        '</div>' +
        '<footer><span>Revision checks: ' + checked + ' of 4</span><span>Saved ' + escapeText(new Date(entry.createdAt).toLocaleString()) + '</span></footer>' +
      '</article>';
    }).join("");
  }
  function saveParagraphDraft(){
    const entry = normalizeParagraphEntry({
      controllingIdea: fieldValue("controlling-idea"),
      evidenceOne: fieldValue("evidence-one"),
      evidenceTwo: fieldValue("evidence-two"),
      evidenceConnection: fieldValue("evidence-connection"),
      paragraph: fieldValue("paragraph-builder"),
      checklist: {
        claim: fieldChecked("revision-claim"),
        evidence: fieldChecked("revision-evidence"),
        analysis: fieldChecked("revision-analysis"),
        polish: fieldChecked("revision-polish"),
      },
      createdAt: Date.now()
    });
    if (!entry) {
      setParagraphStatus("Add a claim or paragraph before saving");
      return;
    }
    paragraphEntries.push(entry);
    saveParagraphEntries("Paragraph saved");
    renderParagraphBank();
    clearParagraphDraft();
  }
  function selectedAuthorPrompt(){
    return authorPrompts.find((prompt) => prompt.id === selectedAuthorPromptId) || authorPrompts[0];
  }
  function renderAuthorPromptChoices(){
    const prompt = selectedAuthorPrompt();
    if (authorPromptSummary) authorPromptSummary.textContent = prompt?.text || "Choose a plot-level question";
    if (!authorPromptList) return;
    authorPromptList.querySelectorAll("[data-author-prompt-choice]").forEach((button) => {
      const active = button.getAttribute("data-author-prompt-choice") === selectedAuthorPromptId;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
  }
  function setAuthorView(view){
    if (!authorRoot) return;
    authorRoot.querySelectorAll("[data-author-view]").forEach((panel) => {
      panel.hidden = panel.getAttribute("data-author-view") !== view;
    });
    authorRoot.querySelectorAll("[data-author-view-button]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-author-view-button") === view);
    });
  }
  function updateAuthorReference(){
    if (!authorReference) return;
    const prompt = selectedAuthorPrompt();
    const plot = String(authorPlotField?.value || "").trim();
    authorReference.innerHTML = plot
      ? '<strong>Plot-level question</strong><p>' + escapeText(prompt?.text || "") + '</p><strong>Character response</strong><blockquote>' + escapeText(plot) + '</blockquote>'
      : "Complete the plot-level response first, then pivot here.";
  }
  function renderAuthorArchive(){
    root.querySelectorAll("[data-author-archive-count]").forEach((node) => { node.textContent = String(authorEntries.length); });
    if (!authorArchiveRoot) return;
    if (!authorEntries.length) {
      authorArchiveRoot.innerHTML = '<div class="author-intent-empty"><h4>No analyses saved yet</h4><p>Complete the plot and author levels, then save the pair here.</p></div>';
      return;
    }
    const sorted = authorEntries.slice().sort((a, b) => b.createdAt - a.createdAt);
    authorArchiveRoot.innerHTML = sorted.map((entry) => (
      '<article class="author-intent-card">' +
        '<div class="author-intent-card-header"><strong>' + escapeText(entry.question) + '</strong><button type="button" data-author-delete="' + escapeText(entry.id) + '">Remove</button></div>' +
        '<div class="author-intent-card-grid">' +
          '<section><h5>Plot Level</h5><p>' + escapeText(entry.plot) + '</p></section>' +
          '<section><h5>Author Level</h5><p>' + escapeText(entry.author) + '</p></section>' +
        '</div>' +
        '<footer>Saved ' + escapeText(new Date(entry.createdAt).toLocaleString()) + '</footer>' +
      '</article>'
    )).join("");
  }
  function resetAuthorDraft(){
    selectedAuthorPromptId = authorPrompts[0]?.id || "";
    renderAuthorPromptChoices();
    if (authorPlotField) authorPlotField.value = "";
    if (authorAnalysisField) authorAnalysisField.value = "";
    writeAuthorDraft({ promptId: selectedAuthorPromptId, plot: "", author: "" });
    updateAuthorReference();
    setAuthorView("plot");
  }
  function saveAuthorAnalysis(){
    const prompt = selectedAuthorPrompt();
    const plot = String(authorPlotField?.value || "").trim();
    const author = String(authorAnalysisField?.value || "").trim();
    if (!plot || !author || !prompt) {
      setAuthorStatus("Complete both levels first");
      return;
    }
    authorEntries.push({
      id: Math.random().toString(36).slice(2, 10),
      question: prompt.text,
      promptId: prompt.id,
      plot,
      author,
      createdAt: Date.now()
    });
    saveAuthorEntries("Analysis saved");
    renderAuthorArchive();
    resetAuthorDraft();
    setAuthorView("archive");
  }

  activitySelect?.addEventListener("change", () => setActivity(activitySelect.value));
  paragraphForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveParagraphDraft();
  });
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveEntryFromFields();
  });
  authorPlotField?.addEventListener("input", () => {
    writeAuthorDraft({ plot: authorPlotField.value });
    updateAuthorReference();
  });
  authorAnalysisField?.addEventListener("input", () => {
    writeAuthorDraft({ author: authorAnalysisField.value });
  });
  root.addEventListener("click", (event) => {
    const filterButton = event.target.closest("[data-motif-filter]");
    if (filterButton) {
      currentFilter = filterButton.getAttribute("data-motif-filter") || "All";
      renderFilters();
      renderBoard();
      return;
    }
    const deleteButton = event.target.closest("[data-motif-delete]");
    if (deleteButton) {
      entries = entries.filter((entry) => entry.id !== deleteButton.getAttribute("data-motif-delete"));
      saveEntries("Removed quote");
      renderBoard();
      return;
    }
    if (event.target.closest("[data-motif-sort]")) {
      sortOrder = sortOrder === "asc" ? "desc" : "asc";
      renderBoard();
      return;
    }
    const paragraphDeleteButton = event.target.closest("[data-paragraph-delete]");
    if (paragraphDeleteButton) {
      paragraphEntries = paragraphEntries.filter((entry) => entry.id !== paragraphDeleteButton.getAttribute("data-paragraph-delete"));
      saveParagraphEntries("Removed paragraph");
      renderParagraphBank();
      return;
    }
    const authorPromptChoice = event.target.closest("[data-author-prompt-choice]");
    if (authorPromptChoice) {
      selectedAuthorPromptId = authorPromptChoice.getAttribute("data-author-prompt-choice") || selectedAuthorPromptId;
      renderAuthorPromptChoices();
      writeAuthorDraft({ promptId: selectedAuthorPromptId });
      updateAuthorReference();
      if (authorPromptDropdown) authorPromptDropdown.open = false;
      return;
    }
    const authorViewButton = event.target.closest("[data-author-view-button]");
    if (authorViewButton) {
      const view = authorViewButton.getAttribute("data-author-view-button");
      if (view) setAuthorView(view);
      return;
    }
    if (event.target.closest("[data-author-pivot]")) {
      const plot = String(authorPlotField?.value || "").trim();
      if (!plot) {
        setAuthorStatus("Complete the plot-level response first");
        return;
      }
      updateAuthorReference();
      setAuthorView("author");
      return;
    }
    if (event.target.closest("[data-author-back]")) {
      setAuthorView("plot");
      return;
    }
    if (event.target.closest("[data-author-save]")) {
      saveAuthorAnalysis();
      return;
    }
    if (event.target.closest("[data-author-new]")) {
      resetAuthorDraft();
      return;
    }
    const authorDeleteButton = event.target.closest("[data-author-delete]");
    if (authorDeleteButton) {
      authorEntries = authorEntries.filter((entry) => entry.id !== authorDeleteButton.getAttribute("data-author-delete"));
      saveAuthorEntries("Removed analysis");
      renderAuthorArchive();
      return;
    }
  });

  loadEntries();
  loadParagraphEntries();
  loadAuthorEntries();
  renderFilters();
  renderBoard();
  renderParagraphBank();
  updateAuthorReference();
  renderAuthorArchive();
  setActivity(activitySelect?.value || "paragraph-builder");
})();
    </script>
  </section>`;
}

function renderResources(lessons: Lesson[]) {
  return `<section id="resources" class="course-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Resources</p>
    <h2>Course Resources</h2>
    <p class="page-intro">Jump back to the imported lesson frames and source references without losing your reading or writing notes.</p>
    <div class="resource-panel">
      <label for="resource-select">Choose a source lesson</label>
      <select id="resource-select" data-resource-select>
        ${lessons.map((lesson) => `<option value="${lesson.id}">${escapeHtml(lesson.title)}</option>`).join("")}
      </select>
    </div>
    ${lessons
      .map(
        (lesson, index) => `<article class="resource-card" data-resource-panel="${lesson.id}" ${index === 0 ? "" : "hidden"}>
          <h3>${escapeHtml(lesson.title)}</h3>
          <p>${escapeHtml(lesson.summary)}</p>
          <p class="source-path">Imported from ${escapeHtml(lesson.entry)}</p>
          <a class="button" href="#${lesson.id}" data-page-target="${lesson.id}">Open lesson</a>
        </article>`
      )
      .join("")}
  </section>`;
}

function renderCriticalWritingIndex() {
  return `<section id="critical-writing" class="course-page" hidden>
    <p class="course-kicker">ELA 30-1 | Critical Analytical Writing</p>
    <h2>Critical Analytical Essay Guide</h2>
    <p class="page-intro">Use this guide to turn novel evidence into a controlled critical/analytical essay. The sequence follows the handout's structure: introduction and thesis, three body paragraphs focused on character development and change, then conclusion and revision.</p>

    <section class="critical-writing-panel">
      <h3>Alberta 30-1 assignment focus</h3>
      <p>The critical/analytical response asks students to choose relevant literary evidence, develop an interpretation, and connect that interpretation to the assigned topic. The pages in this section are built around the Alberta reporting categories used for this style of writing.</p>
      <div class="critical-category-grid">
        ${["Thought and Understanding", "Supporting Evidence", "Form and Structure", "Matters of Choice", "Matters of Correctness"]
          .map((category) => `<article><strong>${escapeHtml(category)}</strong><p>${escapeHtml(getCriticalCategoryDescription(category))}</p></article>`)
          .join("")}
      </div>
    </section>

    <section class="critical-writing-panel">
      <h3>Outcome coverage</h3>
      <ul class="critical-check-list">
        ${CRITICAL_WRITING_OUTCOMES.map((outcome) => `<li>${escapeHtml(outcome)}</li>`).join("")}
      </ul>
    </section>

    <div class="critical-writing-sequence">
      ${CRITICAL_WRITING_SECTIONS.map(
        (section, index) => `<a class="critical-sequence-card" href="#${escapeHtml(section.id)}" data-page-target="${escapeHtml(section.id)}">
          <span>Writing Lesson ${index + 1}</span>
          <strong>${escapeHtml(section.navLabel)}</strong>
          <p>${escapeHtml(section.focus)}</p>
        </a>`
      ).join("")}
    </div>
  </section>`;
}

function getCriticalCategoryDescription(category: string) {
  switch (category) {
    case "Thought and Understanding":
      return "Quality of interpretation, insight, and connection to the assigned topic.";
    case "Supporting Evidence":
      return "Selection and explanation of details that prove the interpretation.";
    case "Form and Structure":
      return "Essay organization, paragraph control, transitions, and unity.";
    case "Matters of Choice":
      return "Diction, syntax, voice, tone, and rhetorical control.";
    case "Matters of Correctness":
      return "Grammar, usage, punctuation, spelling, and sentence control.";
    default:
      return "";
  }
}

function renderCriticalWritingLesson(section: (typeof CRITICAL_WRITING_SECTIONS)[number], index: number) {
  return `<section id="${escapeHtml(section.id)}" class="course-page critical-writing-page" hidden>
    <p class="course-kicker">ELA 30-1 | Critical Analytical Writing</p>
    <h2>${escapeHtml(section.title)}</h2>
    <p class="page-intro">${escapeHtml(section.focus)}</p>

    <section class="unit-outcomes critical-lesson-outcomes" aria-label="Success criteria">
      <h3 class="unit-outcomes-lead">I can...</h3>
      <ul class="unit-focus-list">
        ${section.checkpoints.map((checkpoint) => `<li>${escapeHtml(checkpoint)}</li>`).join("")}
      </ul>
    </section>

    <article class="critical-writing-panel critical-lesson-panel">
      <h3>Lesson</h3>
      <p>${escapeHtml(section.lesson)}</p>
      <div class="critical-model-block">
        <strong>${escapeHtml(section.modelLabel)}</strong>
        <p>${escapeHtml(section.model)}</p>
      </div>
    </article>

    <div class="critical-support-grid">
      <article class="critical-writing-panel critical-example-panel">
        <h3>${escapeHtml(section.exampleTitle)}</h3>
        <p>${escapeHtml(section.example)}</p>
      </article>
      <article class="critical-writing-panel critical-diploma-panel">
        <h3>Diploma tip</h3>
        <p>${escapeHtml(section.diplomaTip.replace(/^Diploma tip:\s*/i, ""))}</p>
      </article>
    </div>

    <article class="critical-writing-panel">
      <h3>How to apply it</h3>
      <ol class="critical-step-list">
        ${section.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
      </ol>
    </article>

    <section class="critical-writing-panel critical-planner">
      <h3>Student planning space</h3>
      <p>${escapeHtml(section.planningPurpose)}</p>
      <div class="critical-field-grid">
        ${section.fields
          .map(
            (field) => `<label>${escapeHtml(field.label)}
              <textarea rows="5" data-response-id="critical-writing-${escapeHtml(field.id)}" placeholder="${escapeHtml(field.placeholder)}"></textarea>
            </label>`
          )
          .join("")}
      </div>
      <div class="critical-writing-actions">
        <a class="lesson-jump" href="#${index === 0 ? "critical-writing" : CRITICAL_WRITING_SECTIONS[index - 1].id}" data-page-target="${index === 0 ? "critical-writing" : CRITICAL_WRITING_SECTIONS[index - 1].id}">Previous</a>
        <a class="lesson-jump primary" href="#${CRITICAL_WRITING_SECTIONS[index + 1]?.id ?? "reading-guide"}" data-page-target="${CRITICAL_WRITING_SECTIONS[index + 1]?.id ?? "reading-guide"}">${CRITICAL_WRITING_SECTIONS[index + 1] ? "Next Writing Lesson" : "Reading Guide"}</a>
      </div>
    </section>
  </section>`;
}

function buildHtml(lessons: Lesson[], slug = DEFAULT_SLUG) {
  const criticalWritingNavItems = CRITICAL_WRITING_SECTIONS.map((section, index) => ({
    id: section.id,
    label: section.navLabel,
    icon: "article",
    html: renderCriticalWritingLesson(section, index),
  }));

  return renderNextStepCourseShell({
    slug,
    courseTitle: COURSE_TITLE,
    courseCode: COURSE_CODE,
    overviewIntro:
      "Build a practical reading routine for a full-length novel: track characters, follow conflict, collect evidence, and prepare for analytical writing.",
    outcomes: [
      "I can read a novel with purpose and track meaning as it develops.",
      "I can explain how character, conflict, setting, and symbols work as patterns.",
      "I can use notes and quotations from a novel to support stronger written responses.",
    ],
    lessons,
    lessonGroupTitle: "Novel Study",
    lessonSequenceTitle: "Novel Study Lesson Sequence",
    sourceLessonLabel: "source lessons",
    nextAfterLastLesson: { id: "critical-writing", label: "Critical Essay Guide" },
    navGroups: [
      {
        id: "critical-writing",
        label: "Critical Essay",
        icon: "assignment",
        html: renderCriticalWritingIndex(),
        items: criticalWritingNavItems,
      },
    ],
    navItems: [
      { id: "reading-guide", label: "Reading Guide", icon: "auto_stories", html: renderReadingGuide() },
      {
        id: "novel-study-questions",
        label: "Novel Study Questions",
        icon: "quiz",
        html: renderNovelStudyQuestions(slug),
      },
      { id: "writing", label: "Writing Studio", icon: "edit_note", html: renderWritingStudio(slug) },
      { id: "resources", label: "Resources", icon: "folder_open", html: renderResources(lessons) },
    ],
    extraCss: `
.source-callout {
  margin: 0 0 1.25rem;
  padding: 18px 20px;
  border-left: 3px solid var(--primary);
  background: #fff;
}
.source-callout > :first-child { margin-top: 0; }
.source-callout > :last-child { margin-bottom: 0; }
.source-content .CentreAlign { text-align: center; }
.source-content .Rounded { border-radius: 8px; }
.reading-notebook {
  display: grid;
  gap: 22px;
  margin-top: 30px;
}
.evidence-store[hidden] {
  display: none !important;
}
.notebook-setup,
.notebook-baseline article,
.evidence-entry-panel,
.evidence-bank-panel,
.evidence-synthesis-panel {
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  background: #fff;
}
.notebook-setup {
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 16px;
  padding: 18px;
  background: #f8f9f6;
}
.notebook-setup label:first-child {
  grid-column: 1 / -1;
}
.notebook-baseline {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}
.notebook-baseline article,
.evidence-entry-panel,
.evidence-bank-panel,
.evidence-synthesis-panel {
  padding: 22px;
}
.notebook-baseline h3,
.evidence-entry-panel h3,
.evidence-bank-panel h3,
.evidence-synthesis-panel h3 {
  margin: 0 0 10px;
  color: #191c1d;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: clamp(26px, 3vw, 34px);
  line-height: 1.08;
  font-weight: 800;
}
.evidence-entry-panel > div:first-child,
.evidence-bank-head,
.evidence-synthesis-panel > h3 {
  margin-bottom: 18px;
}
.evidence-entry-panel > div:first-child p,
.evidence-bank-head p {
  margin: 0;
  max-width: 760px;
  color: #42493e;
  font-size: 17px;
  line-height: 1.55;
}
.reading-notebook label {
  align-content: start;
}
.reading-notebook textarea {
  min-height: 132px;
}
.evidence-entry-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.evidence-wide {
  grid-column: 1 / -1;
}
.evidence-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #e4e6df;
}
.evidence-bank-head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-end;
}
.evidence-bank-head label {
  min-width: min(320px, 100%);
}
.evidence-bank-list {
  display: grid;
  gap: 14px;
}
.evidence-empty {
  margin: 0;
  padding: 18px;
  border: 1px dashed #cbd1c5;
  border-radius: 8px;
  background: #fafbf8;
  color: #42493e;
  font-size: 16px;
  line-height: 1.5;
}
.evidence-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #d8dfd1;
  border-left: 5px solid #b9c5b1;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
}
.evidence-card.is-strongest {
  border-left-color: var(--primary);
  background: #f8fbf4;
}
.evidence-card-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--primary);
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 13px;
  font-weight: 700;
}
.evidence-card h4 {
  margin: 10px 0 0;
  color: #191c1d;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: 23px;
  line-height: 1.18;
  font-weight: 800;
}
.evidence-card dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
  margin: 16px 0 0;
}
.evidence-card dt {
  color: var(--primary);
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 12px;
  font-weight: 700;
}
.evidence-card dd {
  margin: 4px 0 0;
  color: #42493e;
  font-size: 15px;
  line-height: 1.48;
  white-space: pre-wrap;
}
.evidence-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
.evidence-card-actions button {
  min-height: 38px;
  border: 1px solid #cbd1c5;
  border-radius: 8px;
  background: #fff;
  color: var(--primary);
  padding: 8px 12px;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-weight: 700;
  cursor: pointer;
}
.evidence-card.is-strongest [data-reading-evidence-strong] {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}
.critical-writing-panel {
  margin: 22px 0 0;
  padding: 20px 22px;
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  background: #fff;
}
.critical-writing-panel h3 {
  margin: 0 0 12px;
  color: #202520;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: 25px;
  line-height: 1.15;
}
.critical-writing-panel p {
  margin: 0;
  color: #4d554a;
  line-height: 1.6;
}
.critical-lesson-panel {
  border-left: 3px solid var(--primary);
}
.critical-model-block {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #dfe4da;
}
.critical-model-block strong {
  display: block;
  margin-bottom: 6px;
  color: var(--primary);
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
}
.critical-support-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.72fr);
  gap: 14px;
}
.critical-support-grid .critical-writing-panel {
  margin-top: 18px;
}
.critical-example-panel {
  background: #f8f9f6;
}
.critical-diploma-panel {
  border-left: 3px solid #8a6f2a;
  background: #fffaf0;
}
.critical-diploma-panel h3 {
  color: #5f4b18;
}
.critical-diploma-panel p {
  color: #514733;
}
.critical-category-grid,
.critical-writing-sequence {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.critical-category-grid {
  margin-top: 16px;
}
.critical-category-grid article,
.critical-sequence-card {
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  background: #f8f9f6;
  padding: 15px 16px;
}
.critical-category-grid strong,
.critical-sequence-card strong {
  display: block;
  color: var(--primary);
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
}
.critical-category-grid p,
.critical-sequence-card p {
  margin: 8px 0 0;
  color: #4d554a;
}
.critical-writing-sequence {
  margin-top: 22px;
}
.critical-sequence-card {
  color: inherit;
  text-decoration: none;
}
.critical-sequence-card:hover,
.critical-sequence-card:focus-visible {
  border-color: var(--primary);
}
.critical-sequence-card span {
  display: block;
  margin-bottom: 6px;
  color: #5d6359;
  font-size: 13px;
  font-weight: 700;
}
.critical-step-list,
.critical-check-list {
  margin: 0;
  padding-left: 22px;
  color: #3f473d;
  line-height: 1.65;
}
.critical-step-list li,
.critical-check-list li {
  margin: 7px 0;
}
.critical-planner {
  background: #f8f9f6;
}
.critical-field-grid {
  display: grid;
  gap: 14px;
  margin-top: 16px;
}
.critical-writing-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #dfe4da;
}
.check-row {
  display: flex;
  grid-template-columns: none;
  gap: 10px;
  align-items: flex-start;
  margin: 10px 0;
  color: #202520;
  font-family: "Work Sans", "Aptos", sans-serif;
  font-weight: 500;
}
.check-row input {
  width: 18px;
  height: 18px;
  margin-top: 3px;
  accent-color: var(--primary);
}
.writing-activity-shell {
  display: grid;
  gap: 18px;
  margin-top: 28px;
}
.writing-activity-picker {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
  gap: 18px;
  align-items: end;
  padding: 18px 20px;
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  background: #f8f9f6;
}
.writing-activity-picker label {
  display: block;
  margin: 0 0 8px;
  color: var(--primary);
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 14px;
  font-weight: 700;
}
.writing-activity-picker p {
  margin: 0;
  color: #4d554a;
  line-height: 1.55;
}
.writing-activity-picker select {
  width: 100%;
}
.writing-activity-panel {
  overflow: hidden;
  border: 1px solid var(--surface-muted);
  border-radius: 10px;
  background: #fff;
}
.writing-activity-header {
  padding: 24px 28px;
  background: #161a17;
  color: #fff;
}
.writing-activity-header h3 {
  margin: 0;
  color: #fff;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: clamp(30px, 4vw, 46px);
  line-height: 1.06;
  font-weight: 800;
}
.writing-activity-header p {
  max-width: 760px;
  margin: 10px 0 0;
  color: #d7ddd4;
  font-size: 17px;
  line-height: 1.55;
}
.writing-activity-body {
  padding: 24px 28px 28px;
}
.writing-activity-body .studio-layout {
  margin-top: 0;
}
.paragraph-builder-tool {
  display: grid;
  gap: 18px;
}
.paragraph-builder-instructions,
.paragraph-builder-form,
.paragraph-bank-shell {
  padding: 18px 20px;
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  background: #ffffff;
}
.paragraph-builder-instructions h4,
.paragraph-bank-header h4,
.paragraph-bank-empty h4 {
  margin: 0 0 10px;
  color: var(--primary);
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: 22px;
  line-height: 1.2;
}
.paragraph-builder-instructions ol {
  margin: 0;
  padding-left: 22px;
  color: #3f473d;
}
.paragraph-builder-instructions li {
  margin: 6px 0;
}
.paragraph-builder-form {
  display: grid;
  gap: 16px;
  background: #f8f9f6;
}
.paragraph-builder-section {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  background: #ffffff;
}
.paragraph-builder-section h3 {
  margin: 0;
  color: #202520;
  font-size: 24px;
  line-height: 1.15;
}
.paragraph-builder-section p {
  margin: 0;
  color: #4d554a;
}
.paragraph-builder-section label {
  margin: 0;
}
.paragraph-builder-actions,
.paragraph-bottom-actions,
.paragraph-bank-header {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}
.paragraph-builder-actions span {
  color: #5d6359;
  font-size: 14px;
}
.paragraph-bank-header p {
  margin: 0;
  color: #4d554a;
}
.paragraph-bank-header strong {
  color: var(--primary);
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
}
.paragraph-bank-list {
  display: grid;
  gap: 14px;
  margin-top: 16px;
}
.paragraph-bank-card {
  overflow: hidden;
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  background: #fff;
}
.paragraph-bank-card-header,
.paragraph-bank-card footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  background: #f8f9f6;
}
.paragraph-bank-card-header strong {
  color: var(--primary);
  line-height: 1.35;
}
.paragraph-bank-card-header button {
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  background: #fff;
  color: #4d554a;
  padding: 7px 10px;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.paragraph-bank-card-header button:hover,
.paragraph-bank-card-header button:focus-visible {
  border-color: var(--primary);
  color: var(--primary);
  outline: none;
}
.paragraph-bank-grid {
  display: grid;
  grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr);
  border-top: 1px solid #e4e6df;
  border-bottom: 1px solid #e4e6df;
}
.paragraph-bank-grid section {
  padding: 14px;
}
.paragraph-bank-grid section + section {
  border-left: 1px solid #e4e6df;
}
.paragraph-bank-grid h5 {
  margin: 0 0 8px;
  color: var(--primary);
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 13px;
}
.paragraph-bank-grid p {
  margin: 0;
  color: #202520;
  line-height: 1.55;
  white-space: pre-wrap;
}
.paragraph-bank-card footer {
  color: #5d6359;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 13px;
}
.paragraph-bank-empty {
  padding: 28px 18px;
  border: 1px dashed #cbd1c5;
  border-radius: 8px;
  background: #fafbf8;
  text-align: center;
}
.paragraph-bank-empty p {
  margin: 0;
  color: #5d6359;
}
.paragraph-bottom-actions {
  justify-content: flex-end;
  padding-top: 18px;
  border-top: 1px solid #e4e6df;
}
.motif-entry-form {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
  padding: 18px 20px;
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  background: #f8f9f6;
}
.motif-instructions {
  margin: 0 0 18px;
  padding: 18px 20px;
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  background: #ffffff;
}
.motif-instructions h4 {
  margin: 0 0 10px;
  color: var(--primary);
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: 22px;
  line-height: 1.2;
}
.motif-instructions ol {
  margin: 0;
  padding-left: 22px;
  color: #3f473d;
}
.motif-instructions li {
  margin: 6px 0;
}
.motif-form-grid {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(110px, 150px) minmax(110px, 150px);
  gap: 14px;
}
.motif-board textarea,
.motif-board input,
.motif-board select {
  width: 100%;
}
.motif-board-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.motif-save-line {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
  align-items: center;
}
.motif-save-line span {
  color: #5d6359;
  font-size: 14px;
}
.motif-board-tools {
  justify-content: space-between;
  margin: 0 0 16px;
}
.motif-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.motif-filter {
  border: 1px solid #d4d8ce;
  border-radius: 8px;
  background: #fff;
  color: #303730;
  padding: 8px 10px;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.motif-filter:hover,
.motif-filter:focus-visible {
  border-color: var(--motif-color);
  outline: none;
}
.motif-filter.is-active {
  border-color: var(--motif-color);
  background: color-mix(in srgb, var(--motif-color) 12%, #fff);
  color: #151b15;
}
.motif-board-summary {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 16px;
  padding: 12px 0;
  border-top: 1px solid #e4e6df;
  border-bottom: 1px solid #e4e6df;
  color: #4d554a;
}
.motif-board-summary strong {
  color: var(--primary);
}
.motif-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.motif-card {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid #d8dfd1;
  border-top: 4px solid var(--motif-color);
  border-radius: 8px;
  background: #fff;
}
.motif-card-top,
.motif-card footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}
.motif-card-top strong {
  color: var(--motif-color);
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
}
.motif-card-top button {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  background: #fff;
  color: #4d554a;
  cursor: pointer;
}
.motif-card blockquote {
  margin: 0;
  color: #202520;
  font-size: 17px;
  line-height: 1.55;
}
.motif-card footer {
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid #eceee8;
  color: #5d6359;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 13px;
  font-weight: 700;
}
.motif-card footer button {
  margin-left: auto;
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  background: #fff;
  color: #4d554a;
  padding: 7px 10px;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.motif-card footer button:hover,
.motif-card footer button:focus-visible {
  border-color: var(--motif-color);
  color: var(--motif-color);
  outline: none;
}
.motif-empty-state {
  padding: 32px 20px;
  border: 1px dashed #cbd1c5;
  border-radius: 8px;
  background: #fafbf8;
  text-align: center;
}
.motif-empty-state h4 {
  margin: 0 0 8px;
  color: var(--primary);
  font-size: 22px;
}
.motif-empty-state p {
  margin: 0;
  color: #5d6359;
}
.motif-bottom-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid #e4e6df;
}
.author-intent-tool {
  display: grid;
  gap: 18px;
}
.author-intent-instructions,
.author-intent-view {
  padding: 18px 20px;
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  background: #ffffff;
}
.author-intent-instructions h4,
.author-intent-copy h4,
.author-intent-archive-header h4,
.author-intent-empty h4 {
  margin: 0 0 10px;
  color: var(--primary);
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: 22px;
  line-height: 1.2;
}
.author-intent-instructions ol {
  margin: 0;
  padding-left: 22px;
  color: #3f473d;
}
.author-intent-instructions li {
  margin: 6px 0;
}
.author-intent-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.author-intent-tabs button {
  border: 1px solid #d4d8ce;
  border-radius: 8px;
  background: #fff;
  color: #303730;
  padding: 9px 12px;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.author-intent-tabs button.is-active,
.author-intent-tabs button:hover,
.author-intent-tabs button:focus-visible {
  border-color: var(--primary);
  background: #f2f6ef;
  color: var(--primary);
  outline: none;
}
.author-intent-tabs span {
  display: inline-block;
  min-width: 22px;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 8px;
  background: #e8eee4;
}
.author-intent-view {
  display: grid;
  gap: 16px;
  background: #f8f9f6;
}
.author-intent-view[hidden] {
  display: none;
}
.author-intent-copy p,
.author-intent-archive-header p {
  margin: 0;
  color: #4d554a;
  line-height: 1.55;
}
.author-intent-tool textarea,
.author-intent-tool select {
  width: 100%;
}
.author-prompt-block {
  display: grid;
  gap: 10px;
}
.author-prompt-block > span {
  color: var(--primary);
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 14px;
  font-weight: 700;
}
.author-prompt-dropdown {
  position: relative;
  width: 100%;
}
.author-prompt-dropdown summary {
  display: block;
  min-height: 56px;
  border: 1px solid #c9d1c4;
  border-radius: 8px;
  background: #fff;
  color: #263126;
  padding: 13px 42px 13px 14px;
  font-family: "Work Sans", "Aptos", sans-serif;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.45;
  cursor: pointer;
  list-style: none;
  white-space: normal;
}
.author-prompt-dropdown summary::-webkit-details-marker {
  display: none;
}
.author-prompt-dropdown summary::after {
  content: "expand_more";
  position: absolute;
  top: 14px;
  right: 12px;
  color: var(--primary);
  font-family: "Material Symbols Outlined";
  font-size: 22px;
  line-height: 1;
}
.author-prompt-dropdown[open] summary {
  border-color: var(--primary);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.author-prompt-dropdown summary:focus-visible {
  border-color: var(--primary);
  outline: 2px solid color-mix(in srgb, var(--primary) 28%, transparent);
  outline-offset: 2px;
}
.author-prompt-list {
  display: grid;
  max-height: 360px;
  overflow-y: auto;
  border: 1px solid var(--primary);
  border-top: 0;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  background: #fff;
}
.author-prompt-list button {
  width: 100%;
  border: 0;
  border-top: 1px solid #e4e6df;
  border-radius: 0;
  background: #fff;
  color: #303730;
  padding: 12px 14px;
  text-align: left;
  font-family: "Work Sans", "Aptos", sans-serif;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
  cursor: pointer;
}
.author-prompt-list button:hover,
.author-prompt-list button:focus-visible {
  background: #f2f6ef;
  color: var(--primary);
  outline: none;
}
.author-prompt-list button.is-active {
  background: #f2f6ef;
  color: var(--primary);
}
.author-intent-actions,
.author-intent-bottom-actions,
.author-intent-archive-header {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}
.author-intent-actions span {
  color: #5d6359;
  font-size: 14px;
}
.author-intent-reference {
  padding: 14px 16px;
  border-left: 3px solid var(--primary);
  background: #ffffff;
  color: #3f473d;
}
.author-intent-reference strong {
  display: block;
  margin: 0 0 6px;
  color: var(--primary);
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 13px;
}
.author-intent-reference p {
  margin: 0 0 12px;
}
.author-intent-reference blockquote {
  margin: 0;
  color: #202520;
  line-height: 1.55;
}
.author-intent-archive {
  display: grid;
  gap: 14px;
}
.author-intent-card {
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}
.author-intent-card-header,
.author-intent-card footer {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #f8f9f6;
}
.author-intent-card-header strong {
  color: var(--primary);
  line-height: 1.35;
}
.author-intent-card-header button,
.author-intent-card footer button {
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  background: #fff;
  color: #4d554a;
  padding: 7px 10px;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.author-intent-card-header button:hover,
.author-intent-card-header button:focus-visible {
  border-color: var(--primary);
  color: var(--primary);
  outline: none;
}
.author-intent-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid #e4e6df;
  border-bottom: 1px solid #e4e6df;
}
.author-intent-card-grid section {
  padding: 14px;
}
.author-intent-card-grid section + section {
  border-left: 1px solid #e4e6df;
}
.author-intent-card-grid h5 {
  margin: 0 0 8px;
  color: var(--primary);
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 13px;
}
.author-intent-card-grid p {
  margin: 0;
  color: #202520;
  line-height: 1.55;
  white-space: pre-wrap;
}
.author-intent-card footer {
  color: #5d6359;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 13px;
}
.author-intent-empty {
  padding: 28px 18px;
  border: 1px dashed #cbd1c5;
  border-radius: 8px;
  background: #fafbf8;
  text-align: center;
}
.author-intent-empty p {
  margin: 0;
  color: #5d6359;
}
.author-intent-bottom-actions {
  justify-content: flex-end;
  padding-top: 18px;
  border-top: 1px solid #e4e6df;
}
.novel-question-studio { margin-top: 28px; }
.novel-question-controls {
  display: grid;
  gap: 8px;
  max-width: 520px;
}
.novel-question-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin: 16px 0 12px;
}
.novel-question-toolbar button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #c5c9c1;
  border-radius: 8px;
  background: #fff;
  color: var(--primary);
  padding: 9px 12px;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-weight: 700;
  cursor: pointer;
}
.novel-question-save-status {
  min-width: 92px;
  color: #5d6359;
  font-size: 14px;
}
.novel-question-document {
  overflow: hidden;
  border: 1px solid var(--surface-muted);
  border-radius: 10px;
  background: #fff;
}
.novel-question-document-header {
  padding: 28px;
  background: #161a17;
  color: #fff;
}
.novel-question-document-header p {
  margin: 0 0 10px;
  color: #b9c3b2;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 13px;
  font-weight: 700;
}
.novel-question-document-header h3 {
  margin: 0;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1.05;
  font-weight: 800;
}
.novel-question-document-header > span {
  display: block;
  margin-top: 8px;
  color: #d7ddd4;
  font-size: 18px;
}
.novel-question-progress {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid rgba(255,255,255,.16);
}
.novel-question-progress > div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #d7ddd4;
  font-size: 14px;
}
.novel-question-progress-track {
  height: 8px;
  margin-top: 8px;
  border-radius: 999px;
  background: #293029;
  overflow: hidden;
}
.novel-question-progress-track div {
  width: 0;
  height: 100%;
  background: #9fcf93;
}
.novel-question-list { padding: 26px 28px 0; }
.novel-question-item { margin-bottom: 26px; }
.novel-question-prompt {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  margin-bottom: 10px;
  font-size: 17px;
  line-height: 1.55;
}
.novel-question-prompt strong { color: var(--primary); }
.novel-question-hint {
  margin: 0 0 12px 44px;
  padding: 12px;
  border: 1px solid #d5d8cc;
  border-radius: 8px;
  background: #fbfaf0;
  color: #514d33;
  font-size: 14px;
}
.novel-answer-field {
  display: grid;
  gap: 8px;
  margin-left: 44px;
}
.novel-answer-field span {
  color: var(--primary);
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 14px;
  font-weight: 700;
}
.novel-answer-field textarea {
  width: 100%;
  min-height: 118px;
  border: 1px solid #c5c9c1;
  border-radius: 8px;
  background: #f8f9fa;
  padding: 12px;
  font-family: "Work Sans", "Aptos", sans-serif;
  font-size: 15px;
  line-height: 1.55;
  resize: vertical;
}
.novel-answer-field textarea:focus {
  outline: 2px solid rgba(21,66,18,.18);
  border-color: var(--primary);
  background: #fff;
}
.novel-word-count {
  justify-self: end;
  color: #747a70;
  font-size: 12px;
}
.novel-question-synthesis {
  margin: 28px;
  padding: 24px;
  border-radius: 10px;
  background: #161a17;
  color: #fff;
}
.novel-question-synthesis h3 {
  margin: 0 0 8px;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: 26px;
  font-weight: 800;
}
.novel-question-synthesis p { color: #d7ddd4; }
.novel-question-synthesis .novel-answer-field {
  margin-left: 0;
  margin-top: 18px;
}
.novel-question-synthesis .novel-answer-field span { color: #cfe8c7; }
.novel-question-synthesis textarea {
  border-color: #3b4639;
  background: #222822;
  color: #fff;
}
@media (max-width: 680px) {
  .writing-activity-picker,
  .notebook-setup,
  .evidence-entry-grid,
  .evidence-card dl,
  .critical-category-grid,
  .critical-writing-sequence,
  .critical-support-grid,
  .paragraph-bank-grid,
  .motif-form-grid,
  .motif-card-grid,
  .author-intent-card-grid {
    grid-template-columns: 1fr;
  }
  .paragraph-bank-grid section + section {
    border-left: 0;
    border-top: 1px solid #e4e6df;
  }
  .author-intent-card-grid section + section {
    border-left: 0;
    border-top: 1px solid #e4e6df;
  }
  .writing-activity-body,
  .writing-activity-header {
    padding: 22px 18px;
  }
  .motif-board-tools,
  .motif-board-summary,
  .paragraph-builder-actions,
  .paragraph-bank-header,
  .evidence-bank-head,
  .author-intent-actions,
  .author-intent-archive-header {
    align-items: flex-start;
    flex-direction: column;
  }
  .evidence-bank-head label { min-width: 0; }
  .novel-question-toolbar { justify-content: flex-start; }
  .novel-question-list { padding: 22px 18px 0; }
  .novel-question-prompt { grid-template-columns: 28px minmax(0, 1fr); }
  .novel-answer-field,
  .novel-question-hint { margin-left: 38px; }
  .novel-question-synthesis { margin: 18px; }
}
`,
  });
}

function buildLegacyHtml(lessons: Lesson[]) {
  const lessonIds = lessons.map((lesson) => lesson.id);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${COURSE_CODE} | ${COURSE_TITLE}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded" rel="stylesheet">
  <style>
    :root { --ink:#171b17; --muted:#4f5a4f; --green:#154f1c; --green-2:#0f3d17; --line:#d7dfd1; --paper:#fbfbf7; --soft:#f4f6f0; --sidebar:#171b1b; --sidebar-soft:#2e3332; --white:#fff; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--white); font-family: "Atkinson Hyperlegible", ui-sans-serif, sans-serif; font-size: 17px; line-height: 1.55; }
    a { color: inherit; }
    .topbar { position: fixed; inset: 0 0 auto 0; z-index: 50; height: 72px; display: flex; align-items: center; justify-content: center; padding: 10px 24px; background: #171b1b; color: white; border-bottom: 1px solid rgba(255,255,255,.12); }
    .topbar-logo { position: absolute; left: 50%; transform: translateX(-50%); height: 43px; }
    .progress-widget { position: absolute; right: 24px; width: min(320px, 34vw); font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: .02em; }
    .progress-widget strong { display: block; text-align: right; color: #c8f5bc; }
    .progress-track { height: 9px; background: #223022; border: 1px solid #375a37; border-radius: 999px; overflow: hidden; }
    .progress-track div { width: 0; height: 100%; background: #75b86e; transition: width .15s ease; }
    .progress-track.large { height: 12px; margin: 12px 0 18px; }
    .course-sidebar { position: fixed; z-index: 40; top: 72px; bottom: 0; left: 0; width: 288px; overflow-y: auto; overflow-x: hidden; background: var(--sidebar); color: #f5f7f1; border-right: 1px solid rgba(0,0,0,.2); }
    .sidebar-header { position: relative; padding: 26px 22px 18px; border-bottom: 1px solid rgba(255,255,255,.08); }
    .sidebar-header h1 { margin: 0; font-size: 28px; line-height: 1.1; }
    .sidebar-header p { margin: 6px 0 0; color: #d5dbd2; }
    .icon-button { border: 0; border-radius: 8px; min-width: 42px; min-height: 42px; display: inline-grid; place-items: center; background: var(--sidebar-soft); color: white; cursor: pointer; }
    .sidebar-header .icon-button { position: absolute; right: 16px; top: 16px; }
    .mobile-only { display: none; }
    nav { display: grid; gap: 6px; padding: 14px 12px 28px; }
    .course-nav-link { display: flex; align-items: center; gap: 12px; min-height: 48px; padding: 10px 12px; border-radius: 8px; color: #f5f7f1; text-decoration: none; font-weight: 700; }
    .course-nav-link:hover, .course-nav-link.active { background: #303432; }
    .lessons-toggle-icon { margin-left: auto; }
    .lesson-subnav { display: none; padding: 8px 8px 8px 48px; }
    .lessons-nav.is-open .lesson-subnav { display: grid; gap: 6px; }
    .lesson-subnav a { display: block; color: #eef3eb; text-decoration: none; font-size: 14px; padding: 8px 0; }
    body.sidebar-collapsed .course-sidebar { width: 80px; }
    body.sidebar-collapsed .sidebar-label, body.sidebar-collapsed .sidebar-header h1, body.sidebar-collapsed .sidebar-header p, body.sidebar-collapsed .lesson-subnav, body.sidebar-collapsed .lessons-toggle-icon { display: none; }
    body.sidebar-collapsed .lessons-nav.is-open .lesson-subnav { display: none !important; }
    body.sidebar-collapsed .sidebar-header { padding: 14px; }
    body.sidebar-collapsed .sidebar-header .icon-button { position: static; }
    body.sidebar-collapsed .course-main { margin-left: 80px; }
    .course-main { margin: 72px 0 0 288px; min-height: calc(100vh - 72px); }
    .course-frame { width: min(1120px, calc(100vw - 360px)); margin: 0 auto; padding: 44px 28px 72px; }
    .course-page > h2, .lesson-header h2 { margin: 0; font-size: clamp(36px, 5vw, 54px); line-height: 1.03; letter-spacing: -.035em; }
    .course-kicker { margin: 0 0 8px; color: var(--muted); font-weight: 700; }
    .page-intro, .lesson-header p { max-width: 760px; margin: 12px 0 0; font-size: 21px; color: #3f473f; }
    .guide-grid, .studio-layout { display: grid; gap: 18px; margin-top: 28px; }
    .guide-grid, .studio-layout { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    article, .resource-panel, .work-card, .lesson-card, .resource-card, .resource-lesson-group { border: 1px solid var(--line); border-radius: 10px; background: var(--paper); }
    .work-card, .resource-card { padding: 22px; }
    .outcomes-block { margin-top: 28px; max-width: 760px; }
    .outcome-stack { display: grid; gap: 8px; margin-top: 16px; }
    .outcome-stack p { margin: 0; padding: 12px 16px; background: #f3f4f2; border-left: 3px solid var(--green); }
    .overview-actions { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; margin-top: 44px; }
    .completed-pill { display: inline-flex; align-items: center; min-height: 40px; padding: 8px 16px; border: 1px solid var(--line); border-radius: 8px; background: white; color: #344034; }
    .completed-pill strong { color: var(--green-2); }
    .completed-pill strong:not(:last-child) { margin-right: 4px; }
    h3 { margin: 0 0 10px; font-size: 25px; line-height: 1.15; }
    .clean-list { padding-left: 22px; margin: 10px 0 0; }
    .button { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 10px 16px; border: 1px solid #b8c5b3; border-radius: 8px; background: white; color: var(--green-2); font-weight: 700; text-decoration: none; cursor: pointer; }
    .button.primary { background: var(--green); border-color: var(--green); color: white; }
    .resource-stack { display: grid; gap: 16px; margin-top: 28px; }
    .resource-lesson-group { overflow: hidden; }
    .resource-lesson-summary { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 20px 24px; cursor: pointer; list-style: none; border-left: 3px solid var(--green); }
    .resource-lesson-summary::-webkit-details-marker { display: none; }
    .resource-lesson-summary strong { display: block; font-size: 21px; line-height: 1.2; }
    .resource-lesson-kicker { display: block; color: var(--muted); font-size: 13px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
    .resource-lesson-icon { color: var(--ink); font-size: 28px; font-weight: 800; line-height: 1; }
    .resource-lesson-group[open] .resource-lesson-icon { transform: rotate(45deg); }
    .lesson-index { display: grid; gap: 12px; padding: 0 24px 24px; }
    .lesson-card { display: grid; gap: 6px; padding: 18px; text-decoration: none; }
    .lesson-card span { color: var(--green); font-weight: 700; }
    .lesson-card strong { font-size: 21px; }
    .lesson-card p { margin: 0; color: var(--muted); }
    .lesson-card em { color: var(--green-2); font-style: normal; font-weight: 800; }
    .lesson-document { overflow: hidden; background: white; }
    .lesson-header { padding: 34px; background: white; border-top: 4px solid var(--green); }
    .lesson-reader-panel { background: #f1f2ef; padding: 44px 48px 36px; }
    .lesson-body { max-width: 820px; margin: 0 auto; }
    .lesson-body h1, .lesson-body h2, .lesson-body h3 { margin-top: 1.1em; }
    .lesson-body p { margin: 0 0 1em; }
    .lesson-body .source-image { max-width: 100%; height: auto; border-radius: 8px; border: 1px solid var(--line); }
    .source-table { width: 100%; border-collapse: collapse; margin: 18px 0; }
    .source-table td, .source-table th { border: 1px solid var(--line); padding: 10px; vertical-align: top; }
    .source-note, .source-path { color: var(--muted); }
    .lesson-actions { max-width: 820px; margin: 34px auto 0; display: grid; grid-template-columns: auto auto 1fr auto; gap: 12px; align-items: center; }
    .lesson-actions .complete-action { grid-column: 4; }
    label { display: grid; gap: 8px; color: var(--green-2); font-weight: 700; }
    textarea, select { width: 100%; border: 1px solid #b9c5b1; border-radius: 8px; background: white; color: var(--ink); font: inherit; padding: 12px 14px; }
    textarea:focus, select:focus, button:focus-visible, a:focus-visible { outline: 3px solid rgba(21,79,28,.22); outline-offset: 2px; }
    .work-card p { margin-top: 0; color: #465046; }
    .save-status { color: var(--muted); font-size: 14px; }
    .resource-panel { padding: 18px; margin: 24px 0 16px; max-width: 520px; }
    .resource-card { margin-top: 12px; }
    @media (max-width: 920px) {
      .topbar { justify-content: center; }
      #topbar-menu-toggle { position: absolute; left: 16px; }
      .mobile-only { display: inline-grid; }
      .progress-widget { width: 220px; }
      body.sidebar-collapsed .course-sidebar, .course-sidebar { display: none; }
      body:not(.sidebar-collapsed) .course-sidebar { display: block; width: 100%; top: 72px; bottom: auto; max-height: 58vh; }
      .course-main, body.sidebar-collapsed .course-main { margin-left: 0; }
      .course-frame { width: min(100%, 860px); padding: 34px 18px 56px; }
      .guide-grid, .studio-layout { grid-template-columns: 1fr; }
      .lesson-header { display: grid; padding: 26px; }
      .lesson-reader-panel { padding: 26px 22px 30px; }
      .lesson-actions { grid-template-columns: 1fr; }
      .lesson-actions .complete-action { grid-column: auto; }
    }
    @media print {
      .topbar, .course-sidebar, .lesson-actions, .button { display: none !important; }
      .course-main { margin: 0; }
      .course-frame { width: auto; padding: 0; }
      .course-page[hidden] { display: block !important; page-break-before: always; }
      body { font-size: 12pt; }
    }
  </style>
</head>
<body>
${renderTopbar()}
${renderSidebar(lessons)}
<main class="course-main">
  <div class="course-frame">
    ${renderOverview(lessons)}
    ${renderLessonsIndex(lessons)}
    ${lessons.map((lesson, index) => renderLesson(lesson, lessons, index)).join("")}
    ${renderReadingGuide()}
    ${renderWritingStudio()}
    ${renderResources(lessons)}
  </div>
</main>
<script>
const lessonIds = ${scriptJson(lessonIds)};
const STORAGE_KEY = "canvas-helper:ela20-1-novel-study-clean:complete";
const RESPONSE_STORAGE_KEY = "canvas-helper:ela20-1-novel-study-clean:responses";
const lessonsNav = document.querySelector(".lessons-nav");
let saveTimer = null;
function readComplete(){ try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch { return new Set(); } }
function writeComplete(values){ localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(values))); }
function readResponses(){ try { return JSON.parse(localStorage.getItem(RESPONSE_STORAGE_KEY) || "{}"); } catch { return {}; } }
function writeResponses(values){ localStorage.setItem(RESPONSE_STORAGE_KEY, JSON.stringify(values)); }
function setLessonsOpen(open){ lessonsNav?.classList.toggle("is-open", open); document.querySelector("[data-lessons-toggle]")?.setAttribute("aria-expanded", String(open)); }
function updateComplete(){
  const complete = readComplete();
  const count = lessonIds.filter((id) => complete.has(id)).length;
  const percent = lessonIds.length ? Math.round((count / lessonIds.length) * 100) : 0;
  document.querySelectorAll("[data-progress-count]").forEach((node) => node.textContent = count + " / " + lessonIds.length);
  document.querySelectorAll("[data-progress-count-inline]").forEach((node) => node.textContent = count + "/" + lessonIds.length);
  document.querySelectorAll("[data-progress-fill]").forEach((node) => node.style.width = percent + "%");
  document.querySelectorAll("[data-complete-id]").forEach((button) => {
    const done = complete.has(button.getAttribute("data-complete-id"));
    button.textContent = done ? "Completed" : "Complete";
  });
}
function showPage(id){
  const fallback = document.getElementById(id) ? id : "overview";
  document.querySelectorAll(".course-page").forEach((page) => page.hidden = page.id !== fallback);
  document.querySelectorAll("[data-page-target]").forEach((link) => {
    const target = link.getAttribute("data-page-target");
    link.classList.toggle("active", target === fallback || (lessonIds.includes(fallback) && target === "lessons"));
  });
}
function route(){
  const id = (location.hash || "#overview").slice(1);
  showPage(id);
  if (id === "lessons" || lessonIds.includes(id)) setLessonsOpen(true);
}
function toggleCourseMenu(){
  document.body.classList.toggle("sidebar-collapsed");
  document.querySelectorAll("#sidebar-toggle .material-symbols-rounded, #topbar-menu-toggle .material-symbols-rounded").forEach((icon) => {
    icon.textContent = document.body.classList.contains("sidebar-collapsed") ? "dock_to_right" : "dock_to_left";
  });
}
function setResourcePanel(id){
  document.querySelectorAll("[data-resource-panel]").forEach((panel) => panel.hidden = panel.getAttribute("data-resource-panel") !== id);
}
function restoreResponses(){
  const responses = readResponses();
  document.querySelectorAll("[data-response-id]").forEach((field) => {
    field.value = responses[field.getAttribute("data-response-id")] || "";
  });
}
document.addEventListener("click", (event) => {
  const lessonToggle = event.target.closest("[data-lessons-toggle]");
  if (lessonToggle) {
    event.preventDefault();
    const open = !lessonsNav?.classList.contains("is-open");
    if (open) { history.pushState(null, "", "#lessons"); showPage("lessons"); }
    setLessonsOpen(open);
    return;
  }
  const target = event.target.closest("[data-page-target]");
  if (target) {
    const id = target.getAttribute("data-page-target");
    if (id) showPage(id);
  }
  const completeButton = event.target.closest("[data-complete-id]");
  if (completeButton) {
    const complete = readComplete();
    complete.add(completeButton.getAttribute("data-complete-id"));
    writeComplete(complete);
    updateComplete();
  }
  if (event.target.closest("[data-print-writing]")) window.print();
});
document.addEventListener("input", (event) => {
  const field = event.target.closest("[data-response-id]");
  if (!field) return;
  const responses = readResponses();
  responses[field.getAttribute("data-response-id")] = field.value;
  writeResponses(responses);
  const saveStatus = document.querySelector("[data-save-status]");
  if (saveStatus) {
    saveStatus.textContent = "Saving...";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveStatus.textContent = "Saved locally", 500);
  }
});
document.addEventListener("change", (event) => {
  const resourceSelect = event.target.closest("[data-resource-select]");
  if (resourceSelect) setResourcePanel(resourceSelect.value);
});
document.getElementById("sidebar-toggle")?.addEventListener("click", toggleCourseMenu);
document.getElementById("topbar-menu-toggle")?.addEventListener("click", toggleCourseMenu);
window.addEventListener("hashchange", route);
restoreResponses();
document.querySelectorAll("[data-resource-select]").forEach((select) => setResourcePanel(select.value));
route();
updateComplete();
</script>
</body>
</html>`;
}

async function buildNovelStudyProject(options: Args) {
  const zipBuffer = await fs.readFile(options.zipPath);
  const zip = await JSZip.loadAsync(zipBuffer);
  const projectDir = path.join(ROOT, "projects", options.slug);
  const workspaceDir = path.join(projectDir, "workspace");
  const metaDir = path.join(projectDir, "meta");
  const projectJsonPath = path.join(metaDir, "project.json");
  const rawDir = path.join(projectDir, "raw");
  const assetsDir = path.join(workspaceDir, "assets", "imported");
  const brandDir = path.join(workspaceDir, "assets", "brand");
  let existingProjectJson: Record<string, any> | null = null;

  try {
    existingProjectJson = JSON.parse(await fs.readFile(projectJsonPath, "utf8"));
  } catch {
    existingProjectJson = null;
  }

  await fs.rm(projectDir, { recursive: true, force: true });
  await fs.mkdir(assetsDir, { recursive: true });
  await fs.mkdir(brandDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });
  await fs.mkdir(rawDir, { recursive: true });
  await fs.copyFile(options.zipPath, path.join(rawDir, path.basename(options.zipPath)));
  await fs.copyFile(NEXT_STEP_LOGO_SOURCE_PATH, path.join(brandDir, "nxt-ce-logo-white-with-ce.png"));

  const lessons = await loadLessons(zip, assetsDir);
  await fs.writeFile(path.join(workspaceDir, "index.html"), buildHtml(lessons, options.slug), "utf8");

  const now = new Date().toISOString();
  const projectJson = {
    id: options.slug,
    slug: options.slug,
    sourcePath: options.zipPath,
    inputKind: "brightspace-zip",
    brightspaceTarget: "scorm",
    previewModes: ["workspace"],
    workspaceEntrypoint: path.join(workspaceDir, "index.html"),
    rawEntrypoint: path.join(rawDir, path.basename(options.zipPath)),
    createdAt: existingProjectJson?.createdAt ?? now,
    updatedAt: now,
    migrationState: "migrated",
    projectType: "conversion",
    preferredWorkflows: ["conversion"],
    canonicalEntry: path.join(workspaceDir, "index.html"),
    canonicalSources: [
      path.join(workspaceDir, "index.html"),
      path.join(ROOT, "scripts", "build-ela20-novel-study-clean.ts"),
      path.join(ROOT, "scripts", "lib", "next-step-course-shell.ts"),
    ],
    generatedOutputs: [],
    regenerateCommand: `npx tsx scripts/build-ela20-novel-study-clean.ts --zip "${options.zipPath}" --slug ${options.slug}`,
    importedFirstPassOrigin: {
      sourceSystem: "brightspace",
      sourcePath: options.zipPath,
      importedAt: existingProjectJson?.importedFirstPassOrigin?.importedAt ?? now,
      notes: "Novel Study-only clean build from the supplied ELA 20-1 Brightspace export.",
    },
    exportTargets: [
      { target: "scorm", enabled: true, notes: "SCORM 2004 package for Brightspace upload." },
      { target: "html", enabled: true, notes: "Standalone workspace preview." },
    ],
    authoringStatus: "active",
    referenceOnly: [path.join(rawDir, path.basename(options.zipPath))],
    sourceOfTruthNotes:
      "This project is intentionally separate from the older ela20-1-novel-study project. Regenerate from scripts/build-ela20-novel-study-clean.ts; shared shell behavior lives in scripts/lib/next-step-course-shell.ts.",
  };
  await fs.writeFile(projectJsonPath, `${JSON.stringify(projectJson, null, 2)}\n`, "utf8");
  await fs.writeFile(
    path.join(metaDir, "conversion-notes.md"),
    `# ELA 20-1 Novel Study Clean Build\n\n- Source ZIP: ${options.zipPath}\n- Active source files: ${LESSON_SOURCES.map((source) => source.entry).join(", ")}\n- Lessons imported: ${lessons.length}\n- Canonical source: projects/${options.slug}/workspace/index.html\n- Shared shell renderer: scripts/lib/next-step-course-shell.ts\n- Reading Guide support: Novel Study Questions with Section 1, Section 2, and Section 3 response sets\n- Critical Essay support: dropdown section after Lessons built from /Users/deanguedo/Downloads/ELA 20-1 30-1 FORMAT Tips for Writing a Critical - Copy (1).pdf, split into topic/thesis, introduction, three body paragraph, and conclusion/revision pages\n- Writing Studio activities: Analytical Paragraph Builder, Motif String Board, and Author's Intent Toggle\n- Storage keys tracked by SCORM export: \`canvas-helper:${options.slug}:complete\`, \`canvas-helper:${options.slug}:responses\`\n\nThis is a Novel Study-only clean build from the uploaded Brightspace export. It does not reuse the older \`ela20-1-novel-study\` project.\n`,
    "utf8"
  );

  return {
    slug: options.slug,
    lessonCount: lessons.length,
    workspaceEntrypoint: path.join(workspaceDir, "index.html"),
  };
}

async function main() {
  const result = await buildNovelStudyProject(parseArgs());
  console.log(`Built ${result.slug}`);
  console.log(`Lessons: ${result.lessonCount}`);
  console.log(`Workspace: ${result.workspaceEntrypoint}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
