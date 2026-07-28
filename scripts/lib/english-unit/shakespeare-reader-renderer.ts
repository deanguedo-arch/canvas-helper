import { safeId } from "./source.js";
import type { EnglishShakespeareProfile } from "./activity-profile-renderers.js";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeHref(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return /^(?:https?:\/\/|#|\.\.?\/|assets\/|resources\/)/i.test(trimmed) ? trimmed : "";
}

function learnerPassageNote(value: string | undefined) {
  const note = value?.trim() ?? "";
  if (!note) return "";
  return /(?:machine-normalized|editorial draft|editorial review|final packaging|review before publication)/i.test(note)
    ? ""
    : note;
}

function responseId(profile: EnglishShakespeareProfile, ...parts: string[]) {
  return [safeId(profile.namespace, "english-unit"), ...parts.map((part) => safeId(part))].join(":");
}

/**
 * Donor-parity Shakespeare reader used by the shared profile factory.
 * It deliberately consumes only typed scene data; the renderer never fetches a
 * modern companion or source text while rebuilding a unit.
 */
export function renderShakespeareReaderPage(profile: EnglishShakespeareProfile) {
  const sceneGroup = responseId(profile, "side-by-side", "scenes");
  const firstScene = safeId(profile.scenes[0]?.id ?? "scene");

  return `<section id="side-by-side" class="course-page english-activity-page shakespeare-reader-page" hidden>
    <p class="route-kicker">${escapeHtml(profile.courseCode)} | ${escapeHtml(profile.playTitle)}</p>
    <h2 class="route-title">Side-by-Side Reader</h2>
    <p class="route-description">Move through the play scene by scene. Compare the public-domain original with the locally stored plain-language companion, then save a deliberate close-reading entry to the shared Evidence Bank.</p>

    <div class="parallel-reading-browser">
      <header class="parallel-reading-toolbar">
        <div class="parallel-reading-toolbar-copy">
          <span class="parallel-reading-eyebrow">Scene guide</span>
          <h3>Read, compare, interpret</h3>
          <p>Choose a scene. The selected scene, working notes, and Evidence Bank entry persist through reload and SCORM state.</p>
        </div>
        <label class="parallel-reading-picker">Choose a scene
          <select data-response-id="${escapeHtml(responseId(profile, "selection", "side-by-side-scenes"))}" data-english-activity-select="${escapeHtml(sceneGroup)}">
            ${profile.scenes.map((scene) => `<option value="${escapeHtml(safeId(scene.id))}">Act ${scene.act}, Scene ${scene.scene} - ${escapeHtml(scene.title)}</option>`).join("")}
          </select>
        </label>
      </header>

      <div class="parallel-reading-panel-stack">
        ${profile.scenes.map((scene, sceneIndex) => {
          const sceneId = safeId(scene.id);
          const source = safeHref(scene.sourceHref);
          const evidencePrefix = responseId(profile, "side-by-side", scene.id, "evidence");
          return `<article class="parallel-reading-panel" data-english-activity-panel-group="${escapeHtml(sceneGroup)}" data-english-activity-panel="${escapeHtml(sceneId)}" ${sceneId === firstScene && sceneIndex === 0 ? "" : "hidden"}>
            <header class="parallel-reading-scene-header">
              <div>
                <span class="parallel-reading-eyebrow">Act ${scene.act}, Scene ${scene.scene}</span>
                <h3>${escapeHtml(scene.title)}</h3>
                <p>${escapeHtml(scene.summary)}</p>
              </div>
              ${source ? `<div class="parallel-reading-header-actions"><a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">Open full original scene</a></div>` : ""}
            </header>

            ${scene.focus ? `<aside class="parallel-reading-focus"><span class="material-symbols-outlined" aria-hidden="true">visibility</span><div><h4>What to watch</h4><p>${escapeHtml(scene.focus)}</p></div></aside>` : ""}

            <section class="parallel-reading-pair-card" aria-label="Original and plain-language scene comparison">
              <header class="parallel-reading-block-heading">
                <div>
                  <span class="parallel-reading-eyebrow">Scene-by-scene comparison</span>
                  <h4>Original text beside the companion</h4>
                  <p>Use the original for evidence. Use the companion to check meaning, then make the interpretation your own.</p>
                </div>
              </header>
              <div class="parallel-reading-pair-head" aria-hidden="true"><span>Original Shakespeare text</span><span>Plain-language companion</span></div>
              <div class="parallel-reading-pair-table">
                ${scene.passages.map((passage) => {
                  const note = learnerPassageNote(passage.note);
                  return `<article class="parallel-reading-pair-row" data-scene-passage="${escapeHtml(safeId(passage.id))}">
                  <div class="parallel-reading-pair-cell original">
                    ${passage.speaker ? `<strong class="parallel-reading-speaker">${escapeHtml(passage.speaker)}</strong>` : ""}
                    <p>${escapeHtml(passage.original)}</p>
                    <button type="button" class="parallel-reading-anchor-action" data-reader-anchor="${escapeHtml(passage.original)}"><span class="material-symbols-outlined" aria-hidden="true">push_pin</span> Use as evidence</button>
                  </div>
                  <div class="parallel-reading-pair-cell modern">
                    ${passage.speaker ? `<strong class="parallel-reading-speaker">${escapeHtml(passage.speaker)}</strong>` : ""}
                    <p>${escapeHtml(passage.companion)}</p>
                    ${note ? `<p class="parallel-reading-note"><strong>Reading note:</strong> ${escapeHtml(note)}</p>` : ""}
                  </div>
                </article>`;
                }).join("")}
              </div>
            </section>

            <section class="parallel-reading-recap">
              <span class="material-symbols-outlined" aria-hidden="true">summarize</span>
              <div><h4>Scene recap</h4><p>${escapeHtml(scene.summary)}</p></div>
            </section>

            <section class="parallel-reading-evidence english-activity-worksheet" data-evidence-notebook-panel data-evidence-contribution-id="${escapeHtml(evidencePrefix)}">
              <header><span class="parallel-reading-eyebrow">Evidence panel</span><h4>Turn a line into analysis</h4><p>Choose an anchor above or enter another precise passage. Nothing enters the Evidence Bank until you deliberately save it.</p></header>
              <select class="english-activity-hidden-select" data-evidence-draft="source" aria-hidden="true" tabindex="-1"><option>${escapeHtml(`${profile.playTitle} | Act ${scene.act}, Scene ${scene.scene}`)}</option></select>
              <select class="english-activity-hidden-select" data-evidence-draft="concept" aria-hidden="true" tabindex="-1"><option>Close Reading Annotation</option></select>
              <div class="parallel-reading-evidence-grid">
                <label>Anchor line or passage
                  <textarea rows="4" data-response-id="${escapeHtml(`${evidencePrefix}:passage`)}" data-evidence-draft="detail" placeholder="Choose an anchor line above or record another precise passage."></textarea>
                </label>
                <label>Interpretation
                  <textarea rows="5" data-response-id="${escapeHtml(`${evidencePrefix}:interpretation`)}" data-evidence-draft="connection" placeholder="Explain how Shakespeare's language, structure, or dramatic choice develops meaning."></textarea>
                </label>
              </div>
              <div class="english-evidence-actions">
                <button class="evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Scene Evidence to Evidence Bank</button>
                <a href="#evidence-bank">Open Evidence Bank</a>
                <span data-save-status aria-live="polite">Draft saves automatically</span>
              </div>
            </section>
          </article>`;
        }).join("")}
      </div>
    </div>
  </section>`;
}

export const SHAKESPEARE_READER_STYLES = `
.shakespeare-reader-page .parallel-reading-browser { margin-top: 24px; display: grid; gap: 18px; }
.shakespeare-reader-page .parallel-reading-toolbar { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 360px); gap: 28px; align-items: end; border: 1px solid #d9dadb; border-radius: 8px; background: #f8f9fa; padding: 22px; }
.parallel-reading-eyebrow { display: block; margin-bottom: 5px; color: #154212; font-family: "IBM Plex Sans", sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.shakespeare-reader-page .parallel-reading-toolbar h3, .shakespeare-reader-page .parallel-reading-scene-header h3, .shakespeare-reader-page .parallel-reading-block-heading h4, .shakespeare-reader-page .parallel-reading-recap h4, .shakespeare-reader-page .parallel-reading-evidence h4 { margin: 0 0 7px; font-family: "Hanken Grotesk", sans-serif; color: #191c1d; }
.shakespeare-reader-page .parallel-reading-toolbar p, .shakespeare-reader-page .parallel-reading-scene-header p, .shakespeare-reader-page .parallel-reading-block-heading p, .shakespeare-reader-page .parallel-reading-recap p, .shakespeare-reader-page .parallel-reading-evidence p { margin: 0; color: #42493e; line-height: 1.55; }
.shakespeare-reader-page .parallel-reading-picker { display: grid; gap: 7px; color: #154212; font-family: "IBM Plex Sans", sans-serif; font-size: 13px; font-weight: 700; }
.shakespeare-reader-page .parallel-reading-picker select { width: 100%; min-height: 48px; border: 1px solid #9ca995; border-radius: 8px; background: #fff; padding: 10px 12px; color: #191c1d; font: 500 15px "Work Sans", sans-serif; }
.shakespeare-reader-page .parallel-reading-panel { display: grid; gap: 18px; }
.shakespeare-reader-page .parallel-reading-scene-header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; border: 1px solid #d9dadb; border-radius: 8px; background: #fff; padding: 22px; }
.shakespeare-reader-page .parallel-reading-scene-header > div:first-child { max-width: 72ch; }
.shakespeare-reader-page .parallel-reading-header-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.shakespeare-reader-page .parallel-reading-header-actions a, .shakespeare-reader-page .english-evidence-actions a { color: #154212; font-family: "IBM Plex Sans", sans-serif; font-weight: 700; }
.shakespeare-reader-page .parallel-reading-focus, .shakespeare-reader-page .parallel-reading-recap { display: flex; gap: 14px; border-left: 4px solid #2d5a27; border-radius: 0 8px 8px 0; background: #f3f7f1; padding: 16px 18px; }
.shakespeare-reader-page .parallel-reading-focus .material-symbols-outlined, .shakespeare-reader-page .parallel-reading-recap .material-symbols-outlined { color: #154212; }
.shakespeare-reader-page .parallel-reading-pair-card { overflow: hidden; border: 1px solid #d9dadb; border-radius: 8px; background: #fff; }
.shakespeare-reader-page .parallel-reading-block-heading { padding: 20px 22px; border-bottom: 1px solid #d9dadb; }
.shakespeare-reader-page .parallel-reading-pair-head { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); background: #171c19; color: #fff; font-family: "IBM Plex Sans", sans-serif; font-size: 13px; font-weight: 700; }
.shakespeare-reader-page .parallel-reading-pair-head span { padding: 12px 18px; }
.shakespeare-reader-page .parallel-reading-pair-head span + span { border-left: 1px solid #445048; }
.shakespeare-reader-page .parallel-reading-pair-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-bottom: 1px solid #d9dadb; }
.shakespeare-reader-page .parallel-reading-pair-row:last-child { border-bottom: 0; }
.shakespeare-reader-page .parallel-reading-pair-cell { min-width: 0; padding: 18px; line-height: 1.65; }
.shakespeare-reader-page .parallel-reading-pair-cell + .parallel-reading-pair-cell { border-left: 1px solid #d9dadb; background: #f8f9fa; }
.shakespeare-reader-page .parallel-reading-pair-cell p { margin: 8px 0 0; white-space: pre-wrap; }
.shakespeare-reader-page .parallel-reading-speaker { color: #154212; font-family: "IBM Plex Sans", sans-serif; font-size: 13px; letter-spacing: .03em; }
.shakespeare-reader-page .parallel-reading-note { border-left: 3px solid #9ca995; padding-left: 12px; color: #42493e; font-size: 14px; }
.shakespeare-reader-page .parallel-reading-anchor-action { display: inline-flex; align-items: center; gap: 6px; margin-top: 14px; border: 1px solid #9ca995; border-radius: 8px; background: #fff; color: #154212; padding: 8px 11px; font-family: "IBM Plex Sans", sans-serif; font-weight: 700; }
.shakespeare-reader-page .parallel-reading-evidence { border: 1px solid #d9dadb; border-radius: 8px; background: #fff; padding: 22px; }
.shakespeare-reader-page .parallel-reading-evidence-grid { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: 16px; margin-top: 18px; }
.shakespeare-reader-page .parallel-reading-evidence-grid label { display: grid; gap: 7px; color: #191c1d; font-family: "IBM Plex Sans", sans-serif; font-size: 13px; font-weight: 700; }
.shakespeare-reader-page .parallel-reading-evidence-grid textarea { width: 100%; resize: vertical; border: 1px solid #c2c9bb; border-radius: 8px; background: #fff; padding: 12px; color: #191c1d; font: 400 15px/1.55 "Work Sans", sans-serif; }
.shakespeare-reader-page .english-evidence-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 16px; }
@media (max-width: 820px) {
  .shakespeare-reader-page .parallel-reading-toolbar, .shakespeare-reader-page .parallel-reading-pair-row, .shakespeare-reader-page .parallel-reading-evidence-grid { grid-template-columns: 1fr; }
  .shakespeare-reader-page .parallel-reading-pair-head { display: none; }
  .shakespeare-reader-page .parallel-reading-pair-cell + .parallel-reading-pair-cell { border-left: 0; border-top: 1px solid #d9dadb; }
  .shakespeare-reader-page .parallel-reading-scene-header { flex-direction: column; }
  .shakespeare-reader-page .parallel-reading-header-actions { align-items: flex-start; }
}
`;

export const SHAKESPEARE_READER_RUNTIME = `
(function(){
  document.addEventListener("click", function(event){
    var button = event.target.closest("[data-reader-anchor]");
    if(!button) return;
    var panel = button.closest(".parallel-reading-panel");
    var field = panel && panel.querySelector("[data-evidence-draft='detail']");
    if(!field) return;
    field.value = button.getAttribute("data-reader-anchor") || "";
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.focus();
  });
})();
`;
