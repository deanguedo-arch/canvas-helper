/**
 * AB30 responsive + accessibility suite — T22 (UI01/UI02/UI04-auto halves,
 * ROUTE-announce support).
 *
 * Automated halves over the REAL shell/renderers: named controls across
 * consent/conflict/evidence renders, route announcements, dialog focus
 * wiring, and responsive CSS facts. Everything here is statically provable;
 * widths/keyboard/screen-reader/pixel checks are the human halves in
 * meta/ab30-parity/T22-manual-protocol.md — explicitly NOT claimed here.
 *
 * Runners: `node --test <this file>` (sandbox-usable, import-free) and
 * `npx tsx --test <this file>` (repo convention for lead/CI).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30", "workspace");
const mainPath = path.resolve(workspaceDir, "main.js");
const dataPath = path.resolve(workspaceDir, "course-data.js");
const adapterPath = path.resolve(workspaceDir, "learning-store.js");
const indexPath = path.resolve(workspaceDir, "index.html");
const cssPath = path.resolve(workspaceDir, "styles.css");

const mainSource = readFileSync(mainPath, "utf8");
const KEY_ACTIVITY = "aboriginal-studies-30.activityResponses";

function sliceTopLevel(kind: "const" | "function", name: string): string {
  const anchor = kind === "function" ? `function ${name}(` : `const ${name} =`;
  const start = mainSource.indexOf(anchor);
  assert.ok(start >= 0, `seam "${name}" missing (production drift?)`);
  const lineStart = mainSource.lastIndexOf("\n", start) + 1;
  const boundary = /^(?:function|const|let|var) [A-Za-z_$][\w$]*/gm;
  boundary.lastIndex = start + anchor.length;
  const next = boundary.exec(mainSource);
  return (next ? mainSource.slice(lineStart, next.index) : mainSource.slice(lineStart)).trim();
}

const SLICE_CONSTS = ["units", "assignments"];
const SLICE_FUNCTIONS = [
  "escapeHtml",
  "toEmbedUrl",
  "renderConsentEmbed",
  "conflictOriginLabel",
  "storeConflictsForKeys",
  "renderConflictPanelsForKeys",
  "evidenceStatusLabel",
  "renderEvidenceGroups",
  "renderEvidenceSubmissions",
  "renderEvidenceConflicts",
  "lessonTitleFor",
  "routeAnnouncementText",
];

type Seam = {
  renderConsentEmbed: (embedUrl: string, title: string) => string;
  renderConflictPanelsForKeys: (viewKeys: string[]) => string;
  renderEvidenceGroups: (evidence: unknown) => string;
  renderEvidenceConflicts: (evidence: unknown) => string;
  routeAnnouncementText: (state: unknown) => string;
};

function buildRuntime(options?: { flat?: Record<string, string> }): { seam: Seam } {
  const dataContext = { window: {} as { ABORIGINAL_STUDIES_30_DATA?: unknown } };
  vm.createContext(dataContext);
  vm.runInContext(readFileSync(dataPath, "utf8"), dataContext, { filename: "course-data.js" });
  const backing = new Map<string, string>();
  if (options?.flat) backing.set(KEY_ACTIVITY, JSON.stringify(options.flat));
  const context = {
    DATA: JSON.parse(JSON.stringify(dataContext.window.ABORIGINAL_STUDIES_30_DATA)),
    localStorage: {
      getItem: (key: string): string | null =>
        backing.has(String(key)) ? (backing.get(String(key)) as string) : null,
      setItem: (key: string, value: string): void => {
        backing.set(String(key), String(value));
      },
      removeItem: (key: string): void => {
        backing.delete(String(key));
      },
    },
    console,
    TextEncoder,
    URL,
    URLSearchParams,
  } as Record<string, unknown>;
  vm.createContext(context);
  const script = [
    readFileSync(adapterPath, "utf8"),
    ...SLICE_CONSTS.map((name) => sliceTopLevel("const", name)),
    ...SLICE_FUNCTIONS.map((name) => sliceTopLevel("function", name)),
    "AB30Store.init({ storage: localStorage });",
    `globalThis.__seam = {
      renderConsentEmbed, renderConflictPanelsForKeys, renderEvidenceGroups,
      renderEvidenceConflicts, routeAnnouncementText,
    };`,
  ].join("\n\n");
  vm.runInContext(script, context, { filename: "ab30-a11y-seam.js" });
  return { seam: (context as { __seam: Seam }).__seam };
}

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Accessible-name audit: every control must expose a name via text, label, or aria. */
function unnamedControls(html: string): string[] {
  const bad: string[] = [];
  const labels = new Map<string, string>();
  for (const match of html.matchAll(/<label\b([^>]*)>([\s\S]*?)<\/label>/gi)) {
    const forMatch = /for="([^"]+)"/i.exec(match[1]);
    if (forMatch) labels.set(forMatch[1], match[2].replace(/<[^>]+>/g, "").trim());
  }
  const labelledByControl = new Set<string>();
  for (const match of html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/(label)>/gi)) {
    const body = match[1];
    const wrapText = body.replace(/<[^>]+>/g, "").trim();
    if (!wrapText) continue;
    for (const control of body.matchAll(/<(input|textarea|select)\b[^>]*>/gi)) {
      labelledByControl.add(control[0]);
    }
  }
  const controlRe = /<(button|input|textarea|select|a)\b[^>]*>([^<]*)(?:<\/(?:button|textarea|select|a)>)?/gi;
  let found: RegExpExecArray | null;
  while ((found = controlRe.exec(html)) !== null) {
    const full = found[0];
    const tag = /<(button|input|textarea|select|a)\b/i.exec(full)?.[1].toLowerCase() as string;
    const attrs = /<(?:button|input|textarea|select|a)\b([^>]*)>/i.exec(full)?.[1] ?? "";
    const inner = (found[1] ?? "").trim();
    if (tag === "input") {
      const type = (/type="([^"]*)"/i.exec(attrs)?.[1] ?? "text").toLowerCase();
      if (["hidden", "submit", "button"].includes(type) && type !== "submit") {
        if (type === "hidden") continue;
      }
    }
    if (/aria-hidden="true"/i.test(attrs)) continue;
    const id = /id="([^"]+)"/i.exec(attrs)?.[1];
    const ariaLabel = /aria-label="([^"]*)"/i.exec(attrs)?.[1];
    const labelledBy = /aria-labelledby="([^"]+)"/i.exec(attrs)?.[1];
    const title = /title="([^"]*)"/i.exec(attrs)?.[1];
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const opening = /<(?:input|textarea|select)\b[^>]*>/i.exec(full)?.[0];
    const named =
      (ariaLabel ?? "").trim().length > 0 ||
      (labelledBy ?? "").trim().length > 0 ||
      (title ?? "").trim().length > 0 ||
      text.length > 0 ||
      (id !== undefined && labels.has(id)) ||
      (opening !== undefined && labelledByControl.has(opening));
    if (!named) bad.push(`<${tag} ${attrs.trim().slice(0, 80)}>`);
  }
  return bad;
}

test("A11Y01/UI02-ext: consent, conflict, and evidence controls all expose names", () => {
  const { seam } = buildRuntime({
    flat: {
      "theme-1-online-booklet::assignment-1-1": "SYNTH first telling",
      "written::oral-tradition": "SYNTH second telling",
    },
  });
  const conflictHtml = seam.renderConflictPanelsForKeys([
    "theme-1-online-booklet::assignment-1-1",
    "written::oral-tradition",
  ]);
  assert.ok(conflictHtml.includes("data-conflict-panel"), "real conflict panel rendered from migrated flat");
  const consentHtml = seam.renderConsentEmbed("https://www.youtube.com/embed/SYNTH123", "SYNTH video");
  const evidenceHtml = seam.renderEvidenceGroups({
    groups: [
      {
        lessonTitle: "SYNTH lesson",
        unitTitle: "SYNTH unit",
        href: "?section=lesson&unit=u&lesson=l",
        textbook: "SYNTH band",
        items: [
          {
            title: "Q1: SYNTH?",
            href: "?section=lesson&unit=u&lesson=l",
            role: "legacyAssigned",
            status: "fields-complete",
            draft: "SYNTH draft.",
            revision: 2,
            contentVersion: "legacy-v0",
            subfieldLabel: "",
          },
        ],
      },
    ],
  });
  const combined = conflictHtml + consentHtml + evidenceHtml;
  assert.deepEqual(unnamedControls(combined), [], "every control must expose an accessible name");
  assert.ok(!/<label\b[^>]*>\s*<(?:a|button)\b/i.test(combined), "no interactive element nested in a label");
});

test("A11Y02/UI04-auto: routes announce; dialogs return focus; focus and motion are styled", () => {
  const { seam } = buildRuntime();
  assert.equal(plain(seam.routeAnnouncementText({ section: "home" })), "Course overview");
  assert.equal(plain(seam.routeAnnouncementText({ section: "mywork" })), "All my work");
  assert.equal(plain(seam.routeAnnouncementText({ section: "nope" })), "Course overview");
  assert.equal(
    plain(
      seam.routeAnnouncementText({
        section: "lesson",
        activeUnitId: "theme-1",
        activeLessonId: "t1-l07-numbered-treaties",
      })
    ),
    "Lesson: Numbered Treaties: Purposes, Language, and Understandings"
  );
  assert.equal(
    plain(seam.routeAnnouncementText({ section: "lesson", activeUnitId: "nope", activeLessonId: "nope" })),
    "Course overview"
  );
  const index = readFileSync(indexPath, "utf8");
  assert.ok(index.includes('id="route-announcer"'), "route announcer in the shell");
  assert.ok(index.includes('id="save-status-announcer"'), "save announcer retained");
  assert.ok(mainSource.includes("announceRoute();"), "every render announces its route");
  assert.ok(mainSource.includes("dialogReturnFocus = returnFocus"), "dialog captures its trigger");
  assert.ok(mainSource.includes("dialogReturnFocus.focus"), "dialog close returns focus");
  const css = readFileSync(cssPath, "utf8");
  assert.ok(css.includes(":focus-visible"), "visible focus styled");
  assert.ok(css.includes("prefers-reduced-motion"), "reduced motion honored");
  assert.ok(css.includes(".visually-hidden"), "visually-hidden helper exists");
});

test("A11Y03/UI01-auto: viewport zooms; narrow/table/print CSS facts hold", () => {
  const index = readFileSync(indexPath, "utf8");
  const viewport = /<meta name="viewport" content="([^"]+)"/.exec(index)?.[1] ?? "";
  assert.ok(viewport.includes("width=device-width"), "responsive viewport");
  assert.ok(!viewport.includes("maximum-scale"), "zoom must not be capped");
  assert.ok(!viewport.includes("user-scalable=no"), "zoom must not be disabled");
  const css = readFileSync(cssPath, "utf8");
  assert.ok(css.includes("@media (max-width: 760px)"), "narrow layout rules");
  assert.ok(css.includes("@media print"), "print rules retained");
  assert.ok(css.includes(".comparison-table") && css.includes("overflow-x"), "comparison tables scroll, never trap");
  assert.ok(css.includes("min-width: 11rem"), "table cells keep readable width");
  assert.ok(css.includes(".icon-glyph"), "glyph controls styled without the icon font");
});

test("A11Y04: comparison tables keep headed, scoped structure", () => {
  const components = readFileSync(
    path.resolve(workspaceDir, "lesson-components.js"),
    "utf8"
  );
  assert.ok(components.includes('<th scope="col">'), "column headers scoped");
  assert.ok(components.includes("<figcaption>"), "comparisons captioned");
});
