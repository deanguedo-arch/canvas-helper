import { randomUUID } from "node:crypto";
import { rename, rm } from "node:fs/promises";
import path from "node:path";

import { STUDIO_PROJECT_CHANGE_SIGNAL } from "../../app/shared/project-discovery.js";
import {
  STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
  STUDIO_ROUTINE_CONTENT_PROFILE_ID
} from "../../app/shared/course-editability.js";
import { inspectCourseAuthoringProject } from "./course-authoring/context.js";
import { ensureDir, fileExists, writeJsonFile, writeTextFile } from "./fs.js";
import { validateProjectManifestPolicy } from "./project-manifest-policy.js";
import type { ProjectManifest } from "./types.js";

export const CODEX_STUDIO_COURSE_CONTRACT = "codex-studio-direct-v1";

const RESERVED_PROJECT_SLUGS = new Set(["assessments", "incoming", "processed", "resources"]);
const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;

export type CreateCodexStudioCourseInput = {
  repoRoot: string;
  slug: string;
  title: string;
  courseCode?: string;
  summary?: string;
  now?: string;
};

export type CreatedCodexStudioCourse = {
  projectSlug: string;
  projectRoot: string;
  workspaceEntry: string;
  manifestPath: string;
  promptPackPath: string;
  readiness: "direct-ready";
};

function trimmedBounded(value: string | undefined, label: string, maximum: number, fallback = "") {
  const normalized = value?.replace(/\s+/g, " ").trim() ?? fallback;
  if (!normalized) throw new Error(`${label} is required.`);
  if (normalized.length > maximum) throw new Error(`${label} must be ${maximum} characters or fewer.`);
  return normalized;
}

function validateSlug(value: string) {
  if (!PROJECT_SLUG_PATTERN.test(value) || value.length > 80 || RESERVED_PROJECT_SLUGS.has(value)) {
    throw new Error("Course slug must be a lowercase project slug and cannot use a reserved projects directory.");
  }
  return value;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderCodexStudioCourseHtml(input: {
  slug: string;
  title: string;
  courseCode: string;
  summary: string;
}) {
  const slug = escapeHtml(input.slug);
  const title = escapeHtml(input.title);
  const courseCode = escapeHtml(input.courseCode);
  const summary = escapeHtml(input.summary);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title data-canvas-helper-course-title>${title}</title>
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body data-project-slug="${slug}">
    <a class="skip-link" href="#main-content">Skip to course content</a>
    <header class="site-header">
      <div class="site-header-inner">
        <a
          class="course-name"
          href="#overview"
          data-canvas-helper-course-title
          data-canvas-helper-edit-key="course-title-navigation"
        >${title}</a>
        <nav class="site-navigation" aria-label="Course sections">
          <a href="#overview" data-canvas-helper-edit-key="navigation-overview">Overview</a>
          <a href="#goals" data-canvas-helper-edit-key="navigation-goals">Learning goals</a>
          <a href="#modules" data-canvas-helper-edit-key="navigation-modules">Modules</a>
        </nav>
      </div>
    </header>

    <div class="course-layout">
      <aside class="course-index" aria-label="Course contents">
        <strong>Course contents</strong>
        <ol>
          <li><a href="#overview">Overview</a></li>
          <li><a href="#goals">Learning goals</a></li>
          <li><a href="#modules">Modules</a></li>
        </ol>
      </aside>

      <main id="main-content">
        <header class="course-introduction" id="overview">
          <p class="course-code" data-canvas-helper-edit-key="course-code">${courseCode}</p>
          <h1 data-canvas-helper-course-title data-canvas-helper-edit-key="course-title-main">${title}</h1>
          <p class="course-summary" data-canvas-helper-edit-key="course-summary">${summary}</p>
        </header>

        <figure class="course-cover">
          <img src="./assets/course-cover.svg" alt="Abstract course cover for ${title}" data-canvas-helper-edit-key="course-cover-image">
          <figcaption data-canvas-helper-edit-key="course-cover-caption">Replace this starter cover with a course-specific image and useful alt text.</figcaption>
        </figure>

        <section aria-labelledby="overview-title">
          <h2 id="overview-title" data-canvas-helper-edit-key="overview-title">Course overview</h2>
          <p data-canvas-helper-edit-key="overview-body">Replace this paragraph with the course purpose, learner audience, and what successful completion looks like.</p>
        </section>

        <section id="goals" aria-labelledby="goals-title">
          <h2 id="goals-title" data-canvas-helper-edit-key="goals-title">Learning goals</h2>
          <ul class="learning-goals">
            <li data-canvas-helper-edit-key="learning-goal-1">Describe the first observable outcome learners will demonstrate.</li>
            <li data-canvas-helper-edit-key="learning-goal-2">Apply course ideas in a meaningful task or decision.</li>
            <li data-canvas-helper-edit-key="learning-goal-3">Reflect on evidence of learning and identify a next step.</li>
          </ul>
        </section>

        <section id="modules" aria-labelledby="modules-title">
          <h2 id="modules-title" data-canvas-helper-edit-key="modules-title">Modules</h2>
          <div class="module-list">
            <article class="module" id="module-1" data-module-id="module-1">
              <p class="module-number" data-canvas-helper-edit-key="module-1-number">Module 1</p>
              <h3 data-canvas-helper-edit-key="module-1-title">Start here</h3>
              <p data-canvas-helper-edit-key="module-1-summary">Introduce the essential question, required resources, and the first learner action.</p>
              <a href="#module-1" data-canvas-helper-edit-key="module-1-link">Open module</a>
            </article>
          </div>
        </section>

        <section class="practice-card" aria-labelledby="practice-title" data-practice-card>
          <h2 id="practice-title" data-canvas-helper-edit-key="practice-title">Practice checkpoint</h2>
          <p data-canvas-helper-edit-key="practice-prompt">Identify one idea learners should explain before they move to the next module.</p>
          <button
            type="button"
            aria-pressed="false"
            data-practice-emphasis
            data-canvas-helper-studio-edit="annotation-only"
            data-canvas-helper-edit-key="practice-runtime-control"
          >Highlight this checkpoint</button>
        </section>
      </main>
    </div>
    <script src="./course.js" defer></script>
  </body>
</html>
`;
}

export function renderCodexStudioCourseScript() {
  return `document.querySelector("[data-practice-emphasis]")?.addEventListener("click", (event) => {
  const button = event.currentTarget;
  if (!(button instanceof HTMLButtonElement)) return;
  const card = button.closest("[data-practice-card]");
  const pressed = button.getAttribute("aria-pressed") !== "true";
  button.setAttribute("aria-pressed", String(pressed));
  card?.toggleAttribute("data-emphasized", pressed);
});
`;
}

export function renderCodexStudioCourseCoverSvg(title: string) {
  const label = escapeHtml(`${title} course cover`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img" aria-labelledby="title description">
  <title id="title">${label}</title>
  <desc id="description">An abstract layered landscape in forest green, cream, and warm gold.</desc>
  <rect width="1200" height="630" fill="#eef2e9"/>
  <path d="M0 430 245 210l190 155 180-230 215 206 165-122 205 188v223H0Z" fill="#154212"/>
  <path d="M0 510 290 330l196 112 205-151 205 130 152-81 152 104v186H0Z" fill="#d7a843" opacity=".9"/>
  <circle cx="1010" cy="126" r="62" fill="#ffffff" opacity=".9"/>
</svg>\n`;
}

export function renderCodexStudioCourseStyles() {
  return `:root {
  color-scheme: light;
  --ink: #191c1d;
  --muted: #4b554b;
  --primary: #154212;
  --primary-strong: #0e3510;
  --surface: #ffffff;
  --surface-soft: #f4f6f0;
  --border: #c5c9c1;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--surface);
  color: var(--ink);
  font-size: 16px;
  line-height: 1.65;
}

a { color: var(--primary); }
a:hover { color: var(--primary-strong); }
a:focus-visible, button:focus-visible { outline: 3px solid #7dbc72; outline-offset: 3px; }

.skip-link {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 10;
  padding: 8px 12px;
  background: var(--surface);
  border: 1px solid var(--primary);
  transform: translateY(-160%);
}

.skip-link:focus { transform: translateY(0); }

.site-header {
  background: #2b302f;
  color: #eef3eb;
  border-bottom: 1px solid #171b1b;
}

.site-header-inner {
  width: min(1120px, 100%);
  min-height: 64px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.course-name {
  color: #ffffff;
  font-weight: 750;
  text-decoration: none;
}

.course-name:hover { color: #ffffff; text-decoration: underline; }

.site-navigation { display: flex; align-items: center; gap: 20px; }
.site-navigation a { color: #eef3eb; font-size: 14px; text-underline-offset: 4px; }

.course-layout {
  width: min(1120px, 100%);
  margin: 0 auto;
  padding: 40px 24px 72px;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 48px;
}

.course-index {
  align-self: start;
  padding-right: 24px;
  border-right: 1px solid var(--border);
}

.course-index strong { display: block; margin-bottom: 10px; }
.course-index ol { margin: 0; padding-left: 20px; }
.course-index li + li { margin-top: 6px; }

main { min-width: 0; max-width: 760px; }

.course-introduction { padding-bottom: 32px; }
.course-code { margin: 0 0 8px; color: var(--muted); font-weight: 700; }
h1 { margin: 0; font-size: clamp(2rem, 5vw, 3rem); line-height: 1.08; letter-spacing: -0.035em; }
.course-summary { max-width: 64ch; margin: 20px 0 0; font-size: 1.125rem; color: var(--muted); }

.course-cover { margin: 0 0 32px; }
.course-cover img { display: block; width: 100%; height: auto; border: 1px solid var(--border); }
.course-cover figcaption { margin-top: 8px; color: var(--muted); font-size: 14px; }

section { padding: 32px 0; border-top: 1px solid var(--border); }
h2 { margin: 0 0 16px; font-size: 1.5rem; line-height: 1.2; }
h3 { margin: 4px 0 8px; font-size: 1.125rem; }
p { max-width: 68ch; }
.learning-goals { padding-left: 24px; }
.learning-goals li + li { margin-top: 10px; }

.module-list { border-top: 1px solid var(--border); }
.module { padding: 20px 0; border-bottom: 1px solid var(--border); }
.module-number { margin: 0; color: var(--muted); font-size: 14px; font-weight: 700; }
.module p { margin-top: 8px; }

.practice-card button { padding: 9px 13px; border: 1px solid var(--primary); border-radius: 6px; background: var(--surface); color: var(--primary); font: inherit; font-weight: 700; cursor: pointer; }
.practice-card[data-emphasized] { padding-inline: 20px; border: 2px solid #d7a843; background: #fffaf0; }

@media (max-width: 760px) {
  .site-header-inner { align-items: flex-start; flex-direction: column; gap: 8px; }
  .site-navigation { width: 100%; gap: 14px; overflow-x: auto; padding-bottom: 4px; }
  .course-layout { grid-template-columns: 1fr; gap: 28px; padding-top: 28px; }
  .course-index { padding: 0 0 24px; border-right: 0; border-bottom: 1px solid var(--border); }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
`;
}

export function renderCodexStudioPromptPack(input: { slug: string; title: string }) {
  return `# ${input.title} — Codex to Studio contract

- Workflow: generated-course
- Canonical learner page: projects/${input.slug}/workspace/index.html
- Canonical presentation styles: projects/${input.slug}/workspace/styles.css
- Studio authoring driver: direct-workspace-v1
- Studio editing: enabled
- Studio editability profile: studio-routine-content-v1

## Authoring rules

- Keep teacher-editable learner text, links, and image elements in canonical workspace HTML.
- JavaScript may attach behavior, but it must not replace routine content that teachers need to edit in Studio.
- Keep every synchronized visible course-name surface marked with \`data-canvas-helper-course-title\`.
- Give durable content \`data-canvas-helper-edit-key\` values before adding repeated or reorderable sections.
- Add assets under \`workspace/assets/\` or use Studio's validated image upload workflow.
- Never edit \`raw/\` or \`exports/\`; they are baseline and generated boundaries.
- Keep the versioned \`authoring.editabilityContract\`; CI remeasures this course whenever its governed project or resource boundary changes.

## Completion gate

- \`npm run course:doctor -- --project ${input.slug}\`
- \`npm run verify -- --project ${input.slug} --mode workspace\`
- The automatic new-course readiness gate must pass complete learner inventory, rendered 90% block/text coverage, promised category/capability floors, and one apply/reload/Undo lifecycle.
- Add a project-specific E2E contract when the course gains navigation, assessments, persistence, or other learner interactions.
`;
}

function buildManifest(input: {
  slug: string;
  title: string;
  now: string;
}): ProjectManifest {
  const projectRoot = `projects/${input.slug}`;
  return {
    id: randomUUID(),
    slug: input.slug,
    title: input.title,
    sourcePath: `${projectRoot}/raw/original.html`,
    inputKind: "html",
    brightspaceTarget: "course-page",
    previewModes: ["raw", "workspace"],
    workspaceEntrypoint: "workspace/index.html",
    rawEntrypoint: "raw/original.html",
    learningSource: "other",
    learningTrust: "curated",
    learningUpdatedAt: input.now,
    createdAt: input.now,
    updatedAt: input.now,
    migrationState: "migrated",
    projectType: "generated-course",
    preferredWorkflows: ["generated-course"],
    canonicalEntry: `${projectRoot}/workspace/index.html`,
    canonicalSources: [
      `${projectRoot}/workspace/index.html`,
      `${projectRoot}/workspace/styles.css`,
      `${projectRoot}/workspace/course.js`,
      `${projectRoot}/workspace/assets/course-cover.svg`
    ],
    generatedOutputs: [],
    authoring: {
      driverId: "direct-workspace-v1",
      familyId: CODEX_STUDIO_COURSE_CONTRACT,
      qualityProfile: "direct-rendered-course",
      learnerSurfaces: {
        schemaVersion: 1,
        mode: "static-pages-complete",
        pages: [{ htmlPath: "index.html", route: "" }]
      },
      studioEditing: {
        enabled: true,
        renameCourse: true,
        imageAssets: true
      },
      editabilityContract: {
        schemaVersion: STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
        profileId: STUDIO_ROUTINE_CONTENT_PROFILE_ID
      }
    },
    injectedComponents: [],
    authoringStatus: "active",
    exportTargets: [
      { target: "html", enabled: true, notes: "Default publishable artifact for a Codex-created Studio course." },
      { target: "scorm", enabled: false, notes: "Enable only after learner persistence and LMS acceptance are defined." }
    ],
    referenceOnly: [
      `${projectRoot}/raw/original.html`,
      `${projectRoot}/raw/styles.css`,
      `${projectRoot}/raw/course.js`,
      `${projectRoot}/raw/assets/course-cover.svg`
    ],
    sourceOfTruthNotes: "Codex authors the canonical workspace HTML and CSS. Studio edits those exact files through the declared Direct adapter; raw and exports remain protected."
  };
}

async function writeStagedCourse(input: {
  stageRepoRoot: string;
  slug: string;
  title: string;
  courseCode: string;
  summary: string;
  now: string;
}) {
  const projectRoot = path.join(input.stageRepoRoot, "projects", input.slug);
  const workspaceRoot = path.join(projectRoot, "workspace");
  const rawRoot = path.join(projectRoot, "raw");
  const metaRoot = path.join(projectRoot, "meta");
  const html = renderCodexStudioCourseHtml(input);
  const styles = renderCodexStudioCourseStyles();
  const script = renderCodexStudioCourseScript();
  const cover = renderCodexStudioCourseCoverSvg(input.title);
  const manifest = buildManifest(input);
  const policy = validateProjectManifestPolicy(manifest);
  if (policy.status !== "valid" || policy.errors.length) {
    throw new Error(`Codex course manifest is invalid: ${policy.errors.join(" ")}`);
  }

  await Promise.all([
    writeTextFile(path.join(workspaceRoot, "index.html"), html),
    writeTextFile(path.join(workspaceRoot, "styles.css"), styles),
    writeTextFile(path.join(workspaceRoot, "course.js"), script),
    writeTextFile(path.join(workspaceRoot, "assets", "course-cover.svg"), cover),
    writeTextFile(path.join(rawRoot, "original.html"), html),
    writeTextFile(path.join(rawRoot, "styles.css"), styles),
    writeTextFile(path.join(rawRoot, "course.js"), script),
    writeTextFile(path.join(rawRoot, "assets", "course-cover.svg"), cover),
    writeJsonFile(path.join(metaRoot, "project.json"), manifest),
    writeTextFile(path.join(metaRoot, "prompt-pack.md"), renderCodexStudioPromptPack(input))
  ]);

  const doctor = await inspectCourseAuthoringProject(input.slug, input.stageRepoRoot);
  if (doctor.status !== "pass" || doctor.project?.driverId !== "direct-workspace-v1" || !doctor.project.studioEditing.enabled) {
    throw new Error(`Codex course failed its Studio authoring contract: ${doctor.issues.map((issue) => issue.message).join(" ")}`);
  }
  return projectRoot;
}

export async function createCodexStudioCourse(input: CreateCodexStudioCourseInput): Promise<CreatedCodexStudioCourse> {
  const repoRoot = path.resolve(input.repoRoot);
  const slug = validateSlug(input.slug);
  const title = trimmedBounded(input.title, "Course title", 160);
  const courseCode = trimmedBounded(input.courseCode, "Course code", 48, "Course");
  const summary = trimmedBounded(
    input.summary,
    "Course summary",
    320,
    "Add a concise description of what learners will understand, practise, and produce in this course."
  );
  const now = input.now ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(now))) throw new Error("Course timestamp must be a valid ISO date.");

  const projectsRoot = path.join(repoRoot, "projects");
  const targetProjectRoot = path.join(projectsRoot, slug);
  if (await fileExists(targetProjectRoot)) {
    throw new Error(`Project already exists: projects/${slug}. Course creation never overwrites an existing project.`);
  }

  const stagingParent = path.join(repoRoot, ".runtime", "course-create");
  const stageRepoRoot = path.join(stagingParent, `${slug}-${randomUUID()}`);
  await ensureDir(stageRepoRoot);
  try {
    const stagedProjectRoot = await writeStagedCourse({ stageRepoRoot, slug, title, courseCode, summary, now });
    await ensureDir(projectsRoot);
    if (await fileExists(targetProjectRoot)) {
      throw new Error(`Project appeared while creating it: projects/${slug}. No existing files were changed.`);
    }
    await rename(stagedProjectRoot, targetProjectRoot);
    await writeJsonFile(path.join(repoRoot, STUDIO_PROJECT_CHANGE_SIGNAL), {
      projectSlug: slug,
      changedAt: now,
      nonce: randomUUID()
    });
  } catch (error) {
    await rm(stageRepoRoot, { recursive: true, force: true });
    throw error;
  }
  await rm(stageRepoRoot, { recursive: true, force: true });

  return {
    projectSlug: slug,
    projectRoot: targetProjectRoot,
    workspaceEntry: path.join(targetProjectRoot, "workspace", "index.html"),
    manifestPath: path.join(targetProjectRoot, "meta", "project.json"),
    promptPackPath: path.join(targetProjectRoot, "meta", "prompt-pack.md"),
    readiness: "direct-ready"
  };
}
