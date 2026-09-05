import { readFile } from "node:fs/promises";
import path from "node:path";

import { renderNextStepCourseShell } from "../../next-step-course-shell.js";
import { renderBiology30Gate1Runtime } from "./runtime.js";
import { BIOLOGY30_UNIT_A_V2_CSS } from "./styles.js";

type Gate1Activities = Parameters<typeof renderBiology30Gate1Runtime>[0]["activities"];
type Gate1Dataset = Parameters<typeof renderBiology30Gate1Runtime>[0]["dataset"];

const FRAGMENT_PATHS = {
  overview: "content/overview.html",
  lesson04: "content/lessons/lesson-04.html",
  lesson15: "content/lessons/lesson-15.html",
  modelLab: "content/hubs/model-lab.html",
  notebook: "content/hubs/investigation-notebook.html",
  practiceHub: "content/hubs/practice-hub.html"
} as const;

const FIGURE_PATHS = {
  "resting-membrane": "figures/resting-membrane.svg",
  "action-potential-graph": "figures/action-potential-graph.svg",
  "blood-glucose-loop": "figures/blood-glucose-loop.svg"
} as const;

async function readUtf8(resourceDir: string, relativePath: string) {
  return readFile(path.join(resourceDir, relativePath), "utf8");
}

function assertCanonicalFragment(name: string, html: string) {
  if (!/<h1(?:\s|>)/i.test(html)) throw new Error(`Gate 1 canonical fragment ${name} has no H1.`);
  if (/<script\b|<iframe\b|https?:\/\/|fonts\.googleapis|material-symbols|slide-source|slide viewer|primarily visual|coming soon|lorem ipsum/i.test(html)) {
    throw new Error(`Gate 1 canonical fragment ${name} contains a prohibited runtime dependency, slide treatment, or placeholder.`);
  }
}

function assertFigure(name: string, svg: string) {
  if (!/<title\b/i.test(svg) || !/<desc\b/i.test(svg) || !/role="img"/i.test(svg)) {
    throw new Error(`Gate 1 figure ${name} is missing its title, description, or image role.`);
  }
  if (/<image\b|https?:\/\//i.test(svg.replace("http://www.w3.org/2000/svg", ""))) {
    throw new Error(`Gate 1 figure ${name} contains a copied raster or remote dependency.`);
  }
}

function injectFigures(html: string, figures: Record<string, string>) {
  return html.replace(/\{\{figure:([a-z0-9-]+)\}\}/g, (_match, id: string) => {
    const figure = figures[id];
    if (!figure) throw new Error(`Unknown Gate 1 figure placeholder: ${id}`);
    return figure;
  });
}

export type Biology30Gate1RenderResult = {
  html: string;
  learnerRouteIds: string[];
  figureIds: string[];
  interactionIds: string[];
  practiceIds: string[];
  artifactIds: string[];
};

export async function renderBiology30UnitAGate1(resourceDir: string): Promise<Biology30Gate1RenderResult> {
  const fragmentEntries = await Promise.all(
    Object.entries(FRAGMENT_PATHS).map(async ([id, relativePath]) => [id, await readUtf8(resourceDir, relativePath)] as const)
  );
  const figureEntries = await Promise.all(
    Object.entries(FIGURE_PATHS).map(async ([id, relativePath]) => [id, await readUtf8(resourceDir, relativePath)] as const)
  );
  const [activitiesText, datasetText] = await Promise.all([
    readUtf8(resourceDir, "activities/gate-1-activities.json"),
    readUtf8(resourceDir, "datasets/lesson-15-synthetic.json")
  ]);
  const fragments = Object.fromEntries(fragmentEntries) as Record<keyof typeof FRAGMENT_PATHS, string>;
  const figures = Object.fromEntries(figureEntries) as Record<string, string>;
  const activities = JSON.parse(activitiesText) as Gate1Activities;
  const dataset = JSON.parse(datasetText) as Gate1Dataset;

  Object.entries(fragments).forEach(([name, html]) => assertCanonicalFragment(name, html));
  Object.entries(figures).forEach(([name, svg]) => assertFigure(name, svg));

  const overviewHtml = fragments.overview;
  const lesson04Html = injectFigures(fragments.lesson04, figures);
  const lesson15Html = injectFigures(fragments.lesson15, figures);
  if (/\{\{figure:/i.test(lesson04Html + lesson15Html)) throw new Error("A Gate 1 learner fragment retains an unresolved figure placeholder.");

  const html = renderNextStepCourseShell({
    slug: "biology30-unit-a",
    courseTitle: "Biology 30 — Unit A: Nervous and Endocrine Systems",
    courseCode: "BIO 30",
    overviewIntro: "",
    overviewHtml,
    outcomes: [],
    lessons: [
      {
        id: "lesson-04",
        sequenceNumber: 4,
        title: "Action Potentials: Ions into Information",
        summary: "Connect membrane voltage, ion channels, refractory periods, and stimulus intensity.",
        html: lesson04Html,
        group: "Neural Communication"
      },
      {
        id: "lesson-15",
        sequenceNumber: 15,
        title: "Pancreas, Blood Glucose, Diabetes, and Urinalysis",
        summary: "Trace insulin and glucagon, run a feedback model, and interpret synthetic evidence responsibly.",
        html: lesson15Html,
        group: "Endocrine Control"
      }
    ],
    completionIds: ["lesson-04", "lesson-15"],
    completionLabel: "lesson exits",
    lessonGroupTitle: "Unit A",
    lessonSequenceTitle: "Unit A lesson pathway",
    nextAfterLastLesson: { id: "practice-hub", label: "Open Practice Hub" },
    navItems: [
      { id: "model-lab", label: "Model Lab", icon: "science", html: fragments.modelLab },
      { id: "investigation-notebook", label: "Investigation Notebook", icon: "edit_note", html: fragments.notebook },
      { id: "practice-hub", label: "Practice Hub", icon: "quiz", html: fragments.practiceHub }
    ],
    logoPath: "assets/brand/nxt-ce-logo-white-with-ce.png",
    storageKeyBase: "biology30-unit-a",
    showLessonSubnavHeadings: false,
    showLessonCompletionButton: false,
    lessonPresentation: "authored",
    chromeAssets: "self-contained",
    extraHeadHtml: '<meta name="color-scheme" content="light">',
    extraCss: BIOLOGY30_UNIT_A_V2_CSS,
    extraBodyHtml: renderBiology30Gate1Runtime({ activities, dataset })
  });

  return {
    html,
    learnerRouteIds: ["overview", "lessons", "lesson-04", "lesson-15", "model-lab", "investigation-notebook", "practice-hub"],
    figureIds: Object.keys(figures),
    interactionIds: activities.interactions.map((interaction: { id: string }) => interaction.id),
    practiceIds: activities.practiceItems.map((item) => item.id),
    artifactIds: activities.artifacts.map((artifact) => artifact.id)
  };
}
