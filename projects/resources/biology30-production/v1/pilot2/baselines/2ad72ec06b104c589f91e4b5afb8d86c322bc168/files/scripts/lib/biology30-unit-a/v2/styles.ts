export const BIOLOGY30_UNIT_A_V2_CSS = String.raw`
@font-face {
  font-family: "Hanken Grotesk";
  src: url("assets/fonts/HankenGrotesk-Variable.ttf") format("truetype");
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}
@font-face {
  font-family: "Work Sans";
  src: url("assets/fonts/WorkSans-Variable.ttf") format("truetype");
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}
:root {
  --ink: #171b1b;
  --ink-dark: #171b1b;
  --primary: #154212;
  --primary-strong: #0e3510;
  --science: #146c60;
  --amber: #a15c00;
  --brick: #a43f35;
  --canvas: #f7f8f5;
  --surface: #fff;
  --surface-low: #f7f8f5;
  --surface-soft: #f0f4ef;
  --surface-muted: #d9ded8;
  --surface-variant: #c8d0c8;
  --text-muted: #5b635d;
  --sidebar-width: 256px;
  --sidebar-rail: 72px;
}
html { scroll-padding-top: 84px; }
body {
  background: var(--canvas);
  color: var(--ink);
  font-family: "Work Sans", system-ui, sans-serif;
  font-size: 17px;
  line-height: 1.66;
}
body, button, input, select, textarea { font-family: "Work Sans", system-ui, sans-serif; }
.course-topbar { background: var(--ink); }
.course-sidebar { background: #1c211f; }
.sidebar-title {
  max-width: 168px;
  font-size: 22px;
  line-height: 1.12;
}
.sidebar-course-label,
.course-nav-link,
.top-progress-meta { font-family: "Work Sans", system-ui, sans-serif; }
.top-progress-meta { text-transform: none; letter-spacing: 0; }
.top-progress-bar { border-radius: 4px; }
.top-progress-fill { background: #9bcf92; }
.course-nav-link { border-radius: 6px; font-weight: 600; }
.course-nav-link:hover,
.course-nav-link.active { background: #303633; }
.sublesson-link { padding: 8px 0; }
.course-main { padding: 96px 32px 72px; }
.course-frame { width: min(1180px, calc(100vw - 332px)); }
.course-page > h1 {
  margin: 0;
  font-family: "Hanken Grotesk", system-ui, sans-serif;
  font-size: clamp(2rem, 4vw, 2.625rem);
  line-height: 1.08;
  letter-spacing: -.035em;
}
.bio-route {
  width: 100%;
  overflow: clip;
  border: 1px solid var(--surface-muted);
  border-radius: 8px;
  background: var(--surface);
}
.bio-route p,
.bio-route li { max-width: 72ch; }
.bio-route h1,
.bio-route h2,
.bio-route h3 {
  font-family: "Hanken Grotesk", system-ui, sans-serif;
  color: var(--ink);
}
.bio-route h1 {
  max-width: 24ch;
  margin: 0;
  font-size: clamp(2.1rem, 4.4vw, 2.625rem);
  line-height: 1.06;
  letter-spacing: -.04em;
}
.bio-route h2 {
  margin: 0 0 14px;
  font-size: clamp(1.55rem, 2.4vw, 2rem);
  line-height: 1.15;
  letter-spacing: -.025em;
}
.bio-route h3 {
  margin: 0 0 8px;
  font-size: 1.18rem;
  line-height: 1.25;
}
.bio-route p { margin: 0 0 1em; }
.bio-route ul,
.bio-route ol { margin: 0; }
.bio-course-code,
.bio-section-label {
  margin: 0 0 10px !important;
  color: var(--science);
  font-size: .83rem;
  font-weight: 760;
  letter-spacing: .025em;
}
.bio-lede,
.bio-inquiry {
  max-width: 66ch !important;
  color: #3f4943;
  font-size: 1.1rem;
  line-height: 1.62;
}
.bio-overview-header,
.bio-lesson-header,
.bio-hub-header { padding: 52px 58px 46px; }
.bio-overview-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 250px;
  gap: 56px;
  align-items: start;
}
.bio-overview-facts {
  margin: 4px 0 0;
  border-top: 2px solid var(--primary);
}
.bio-overview-facts div { padding: 14px 0; border-bottom: 1px solid var(--surface-muted); }
.bio-overview-facts dt { color: var(--text-muted); font-size: .78rem; font-weight: 650; }
.bio-overview-facts dd { margin: 2px 0 0; font-family: "Hanken Grotesk"; font-size: 1.35rem; font-weight: 730; }
.bio-section,
.bio-learning-targets {
  margin: 0 58px;
  padding: 40px 0;
  border-top: 1px solid var(--surface-muted);
}
.bio-learning-targets {
  display: grid;
  grid-template-columns: minmax(190px, .72fr) minmax(0, 1.5fr);
  gap: 38px;
  align-items: start;
}
.bio-learning-targets > div { min-width: 0; }
.bio-learning-targets h2 { font-size: 1.35rem; }
.bio-learning-targets .bio-section-label { margin-bottom: 8px; }
.bio-learning-targets ul { margin: 0; padding-left: 20px; }
.bio-learning-targets li + li { margin-top: 9px; }
.bio-module-sequence { padding: 0; list-style: none; counter-reset: modules; }
.bio-module-sequence li {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 24px;
  padding: 14px 0;
  border-bottom: 1px solid var(--surface-muted);
}
.bio-module-sequence li:last-child { border-bottom: 0; }
.bio-module-sequence strong { color: var(--primary); }
.bio-module-sequence span { color: #48524c; }
.bio-two-column { display: grid; grid-template-columns: 1.25fr .75fr; gap: 44px; }
.bio-callout {
  align-self: start;
  padding: 22px 24px;
  border: 1px solid #cbd5ce;
  border-left: 4px solid var(--science);
  background: #f6faf8;
}
.bio-callout h2 { font-size: 1.2rem; }
.bio-callout p:last-child { margin-bottom: 0; }
.bio-callout--safety { border-left-color: var(--amber); background: #fffaf2; }
.bio-process-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  border: 1px solid var(--surface-muted);
  background: var(--surface-muted);
}
.bio-process-grid article { min-height: 190px; padding: 22px; background: #fff; }
.bio-process-grid article > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  margin-bottom: 18px;
  border: 1px solid var(--primary);
  border-radius: 50%;
  color: var(--primary);
  font-weight: 750;
}
.bio-process-grid p { color: var(--text-muted); font-size: .94rem; }
.bio-start-row,
.bio-exit-actions,
.bio-artifact-actions,
.bio-notebook-actions,
.bio-notebook-export {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-top: 24px;
}
.bio-primary-action,
.bio-secondary-action,
.bio-route button,
.bio-hub-card a {
  min-height: 44px;
  border: 1px solid #aeb8b0;
  border-radius: 6px;
  background: #fff;
  color: var(--primary);
  padding: 10px 15px;
  font-weight: 680;
  line-height: 1.3;
  text-decoration: none;
  cursor: pointer;
}
.bio-primary-action,
.bio-primary-button,
.bio-check-action {
  border-color: var(--primary) !important;
  background: var(--primary) !important;
  color: #fff !important;
}
.bio-primary-action:hover,
.bio-primary-button:hover,
.bio-check-action:hover { background: var(--primary-strong) !important; }
.bio-lesson-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin: 32px 0 0;
  border: 1px solid var(--surface-muted);
  background: var(--surface-muted);
}
.bio-lesson-meta div { padding: 13px 16px; background: #fff; }
.bio-lesson-meta dt { color: var(--text-muted); font-size: .76rem; font-weight: 680; }
.bio-lesson-meta dd { margin: 2px 0 0; font-weight: 690; }
.bio-retrieval {
  display: grid;
  grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
  column-gap: 42px;
  background: #f8faf7;
  margin-inline: 0;
  padding-inline: 58px;
}
.bio-retrieval .bio-response-label,
.bio-retrieval textarea,
.bio-retrieval .bio-save-status { grid-column: 2; }
.bio-retrieval .bio-response-label { grid-row: 1; align-self: end; margin-top: 10px; }
.bio-retrieval textarea { grid-row: 2; }
.bio-response-label,
.bio-route label {
  color: var(--ink);
  font-weight: 680;
}
.bio-response-label span,
.bio-route label > span { color: var(--text-muted); font-size: .82rem; font-weight: 520; }
.bio-route textarea,
.bio-route input,
.bio-route select {
  border: 1px solid #aeb8b0;
  border-radius: 6px;
  background: #fff;
  color: var(--ink);
}
.bio-route textarea { min-height: 104px; }
.bio-save-status,
.bio-artifact-actions span,
.bio-exit-actions span,
.bio-notebook-actions span,
.bio-notebook-export span { margin: 0 !important; color: var(--text-muted); font-size: .84rem; }
.bio-concept-note,
.bio-evidence-prompts {
  max-width: 72ch;
  margin: 24px 0;
  padding: 20px 22px;
  border-left: 4px solid var(--science);
  background: #f2f7f5;
}
.bio-concept-note p:last-child { margin-bottom: 0; }
.bio-figure {
  width: min(1040px, 100%);
  margin: 28px 0;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  border: 1px solid var(--surface-muted);
  background: #fff;
}
.bio-figure > svg { display: block; width: 100%; height: auto; }
.bio-figure-copy { padding: 20px 22px; border-top: 1px solid var(--surface-muted); }
.bio-figure-copy p:last-child { margin-bottom: 0; }
.bio-figure--graph { margin: 20px 0 0; }
.bio-table-wrap {
  width: 100%;
  margin: 24px 0;
  overflow-x: auto;
  border: 1px solid var(--surface-muted);
}
.bio-route table { width: 100%; border-collapse: collapse; background: #fff; font-size: .92rem; }
.bio-route caption { padding: 12px 14px; background: #eef3ee; color: var(--ink); font-weight: 700; text-align: left; }
.bio-route th,
.bio-route td { padding: 12px 14px; border: 1px solid var(--surface-muted); text-align: left; vertical-align: top; }
.bio-route thead th { background: #f7f8f5; }
.bio-model {
  margin-inline: 0;
  padding: 44px 58px 48px;
  background: #f4f7f3;
}
.bio-model h2[tabindex="-1"]:focus,
.bio-practice h2[tabindex="-1"]:focus {
  outline: 3px solid rgb(20 108 96 / .35);
  outline-offset: 6px;
}
.bio-model-header { display: flex; justify-content: space-between; gap: 36px; align-items: end; }
.bio-model-header > p { max-width: 42ch; color: var(--text-muted); }
.bio-model-layout { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(250px, .7fr); gap: 26px; align-items: start; }
.bio-model-layout > * { min-width: 0; }
.bio-model-readout { margin-top: 20px; padding: 20px; border: 1px solid #c8d0c8; background: #fff; }
.bio-model-stage { color: var(--science); font-weight: 760; }
.bio-model-readout dl { margin: 0; }
.bio-model-readout dl div { padding: 12px 0; border-top: 1px solid var(--surface-muted); }
.bio-model-readout dt { color: var(--text-muted); font-size: .76rem; font-weight: 680; }
.bio-model-readout dd { margin: 3px 0 0; }
.bio-model-progress { margin: 14px 0 0 !important; color: var(--text-muted); font-size: .84rem; }
.bio-stage-controls { display: flex; flex-wrap: wrap; gap: 8px; }
.bio-stage-controls button[aria-pressed="true"] { border-color: var(--science); background: #e5f2ee; color: #0e534a; }
.bio-static-fallback,
.bio-rubric,
.bio-sources { margin-top: 22px; border-top: 1px solid var(--surface-muted); }
.bio-static-fallback summary,
.bio-rubric summary,
.bio-sources summary { min-height: 44px; padding: 12px 0; color: var(--primary); font-weight: 700; cursor: pointer; }
.bio-static-fallback > *:not(summary),
.bio-sources > *:not(summary) { max-width: 72ch; }
.bio-model-layout--glucose { margin-top: 20px; }
.bio-simulator-controls { display: flex; gap: 12px; align-items: end; margin-top: 20px; }
.bio-simulator-controls label { min-width: min(420px, 100%); }
.bio-synthetic-chart { margin: 0; border: 1px solid var(--surface-muted); background: #fff; }
.bio-synthetic-chart svg { display: block; width: 100%; height: auto; }
.bio-synthetic-chart figcaption { padding: 10px 14px; border-top: 1px solid var(--surface-muted); color: var(--text-muted); font-size: .8rem; }
.bio-practice-list { display: grid; gap: 18px; }
.bio-practice-item { padding: 24px; border: 1px solid var(--surface-muted); background: #fff; }
.bio-practice-item fieldset { margin: 0; padding: 0; border: 0; }
.bio-practice-item legend { margin-bottom: 14px; font-weight: 650; }
.bio-practice-item label { display: grid; grid-template-columns: 22px 1fr; gap: 9px; align-items: start; margin: 9px 0; font-weight: 470; }
.bio-practice-item input[type="radio"] { width: 20px; height: 20px; margin: 3px 0 0; accent-color: var(--primary); }
.bio-check-action { margin-top: 12px; }
.bio-feedback { margin-top: 14px; padding: 14px 16px; border-left: 4px solid var(--amber); background: #fff9ef; }
.bio-feedback.is-correct { border-left-color: var(--science); background: #edf7f3; }
.bio-feedback strong { display: block; margin-bottom: 3px; }
.bio-artifact { background: #fafbf8; margin-inline: 0; padding-inline: 58px; }
.bio-artifact-heading,
.bio-section-heading-row { display: flex; justify-content: space-between; gap: 24px; align-items: start; }
.bio-artifact-heading > span,
.bio-section-heading-row > span { color: var(--text-muted); font-size: .84rem; font-weight: 660; }
.bio-artifact-fields { display: grid; gap: 18px; margin-top: 22px; }
.bio-artifact-fields label { display: grid; gap: 7px; }
.bio-rubric .bio-table-wrap { margin-top: 8px; }
.bio-exit textarea { max-width: 72ch; }
.bio-sources { margin: 0 58px 38px; padding-top: 0; }
.bio-sources p { color: var(--text-muted); font-size: .88rem; }
.bio-comparison-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; margin-top: 24px; border: 1px solid var(--surface-muted); background: var(--surface-muted); }
.bio-comparison-grid article { padding: 22px; background: #fff; }
.bio-comparison-grid ul { padding-left: 19px; }
.bio-comparison-grid li + li { margin-top: 7px; }
.bio-hub-header { border-bottom: 1px solid var(--surface-muted); }
.bio-hub-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; padding: 36px 58px 8px; }
.bio-hub-card { display: flex; flex-direction: column; min-height: 260px; padding: 24px; border: 1px solid var(--surface-muted); background: #fff; }
.bio-hub-card > div { padding-bottom: 16px; border-bottom: 1px solid var(--surface-muted); }
.bio-hub-card > div > p { margin: 0 0 4px; color: var(--science); font-size: .8rem; font-weight: 700; }
.bio-hub-card > div > span { color: var(--text-muted); font-size: .82rem; }
.bio-hub-card > p { color: var(--text-muted); }
.bio-hub-card > a { align-self: start; margin-top: auto; }
.bio-numbered-method { padding-left: 22px; }
.bio-numbered-method li + li { margin-top: 10px; }
.bio-notebook-composer { margin: 36px 58px 0; padding: 26px; border: 1px solid var(--surface-muted); background: #f8faf7; }
.bio-notebook-fields { display: grid; grid-template-columns: .75fr 1.5fr; gap: 18px; }
.bio-notebook-list { display: grid; gap: 12px; }
.bio-notebook-entry { padding: 18px; border: 1px solid var(--surface-muted); }
.bio-notebook-entry header { display: flex; justify-content: space-between; gap: 16px; }
.bio-notebook-entry p { white-space: pre-wrap; }
.bio-notebook-entry button { min-height: 36px; padding: 6px 10px; }
.bio-empty-state { color: var(--text-muted); font-style: italic; }
.bio-artifact-index { display: grid; gap: 10px; }
.bio-artifact-index article { display: flex; justify-content: space-between; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--surface-muted); }
.bio-notebook-export { margin: 0 58px 42px; padding-top: 18px; border-top: 1px solid var(--surface-muted); }
.bio-practice-overview { display: flex; align-items: center; gap: 24px; margin: 36px 58px 4px; padding: 20px; border: 1px solid var(--surface-muted); }
.bio-practice-overview > div:first-child { display: grid; min-width: 150px; }
.bio-practice-overview strong { font-family: "Hanken Grotesk"; font-size: 2rem; line-height: 1; }
.bio-practice-overview span { color: var(--text-muted); font-size: .84rem; }
.bio-practice-meter { flex: 1; height: 12px; border: 1px solid #b8c2ba; background: #eef1ed; }
.bio-practice-meter span { display: block; width: 0; height: 100%; background: var(--science); }
.bio-lesson > .bio-callout { margin: 0 58px 30px; }
.bio-figure figcaption { padding: 14px 18px; border-top: 1px solid var(--surface-muted); color: var(--text-muted); font-size: .86rem; }
.bio-evidence-requirements { padding-left: 21px; }
.bio-evidence-requirements li + li { margin-top: 7px; }
.bio-submission-guidance { max-width: 72ch; margin-top: 22px !important; color: var(--text-muted); }
.bio-extension { margin: 24px 58px 30px; padding: 0 20px; border: 1px solid #c5cfc6; border-left: 4px solid var(--science); background: #f7faf8; }
.bio-extension summary { min-height: 48px; padding: 12px 0; color: var(--primary); font-weight: 720; cursor: pointer; }
.bio-extension p { max-width: 72ch; }
.bio-model--generic > p { max-width: 72ch; }
.bio-generic-model-controls { display: grid; grid-template-columns: minmax(260px, 1fr) auto; gap: 20px; align-items: end; margin-top: 20px; }
.bio-generic-model-controls label { display: grid; gap: 7px; }
.bio-generic-model-controls select { min-height: 46px; padding: 8px 12px; }
.bio-generic-model-controls > div { display: flex; flex-wrap: wrap; gap: 10px; }
.bio-model--generic .bio-model-readout { max-width: 860px; }
.bio-model-reset { display: flex; justify-content: flex-end; margin-top: 14px; }
.bio-collaboration .bio-two-column { gap: 18px; }
.bio-collaboration .bio-two-column > div { padding: 20px; border: 1px solid var(--surface-muted); background: #fff; }
.bio-practice-group { margin-top: 16px; border: 1px solid var(--surface-muted); background: #fff; }
.bio-practice-group > summary { display: flex; justify-content: space-between; gap: 18px; min-height: 54px; padding: 15px 18px; color: var(--primary); font-weight: 720; cursor: pointer; }
.bio-practice-group > summary strong { color: var(--text-muted); font-size: .86rem; }
.bio-practice-group > .bio-practice-list { padding: 0 18px 18px; }
.bio-final-practice-status { display: flex; flex-wrap: wrap; gap: 18px; margin: 18px 0; padding: 14px 16px; border-left: 4px solid var(--science); background: #f1f7f4; }
.bio-final-practice > .bio-primary-button { margin-top: 22px; }
.bio-glossary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 32px; }
.bio-glossary article { padding: 16px 0; border-bottom: 1px solid var(--surface-muted); }
.bio-glossary h3 { color: var(--primary); }
.bio-glossary p { color: var(--text-muted); }
.bio-source-list { display: grid; gap: 0; }
.bio-source-list article { display: grid; grid-template-columns: minmax(220px, .75fr) minmax(180px, .5fr) minmax(220px, 1fr); gap: 24px; align-items: start; padding: 20px 0; border-bottom: 1px solid var(--surface-muted); }
.bio-source-list article > div > p { margin: 0 0 3px; color: var(--science); font-size: .78rem; font-weight: 720; text-transform: capitalize; }
.bio-source-list article h2 { margin: 0; font-size: 1.08rem; }
.bio-source-list article > p,
.bio-source-list article > span { color: var(--text-muted); font-size: .86rem; }
.bio-source-list a { color: var(--primary); font-weight: 650; }
.bio-source-list a span { display: block; color: var(--text-muted); font-size: .78rem; font-weight: 520; }
.bio-global-save { position: fixed; right: 150px; bottom: 16px; z-index: 80; max-width: min(420px, calc(100vw - 190px)); padding: 9px 12px; border: 1px solid #b9c3bb; background: #fff; color: var(--text-muted); box-shadow: 0 4px 14px rgb(23 27 27 / .12); font-size: .78rem; }
.bio-global-save[data-status="error"] { border-color: var(--brick); color: var(--brick); }
.bio-global-save[data-status="warning"] { border-color: var(--amber); color: #704000; }
.bio-save-exit { position: fixed; right: 16px; bottom: 16px; z-index: 81; min-height: 44px; box-shadow: 0 4px 14px rgb(23 27 27 / .14); }
.bio-save-exit[data-saved="true"] { border-color: var(--science); background: #edf7f3; color: #0d5147; }
.lesson-bottom-bar--authored { max-width: none; margin: 24px 0 0; padding: 22px 58px 0; border-top: 1px solid var(--surface-muted); }
.lesson-page--authored .authored-lesson { padding-bottom: 38px; }
.lesson-page--authored .lesson-jump { border-radius: 6px; font-family: "Work Sans"; }
.lesson-page--authored .lesson-jump.primary { background: var(--primary); }
.resource-stack { margin-top: 24px; }
.resource-lesson-group,
.lesson-card { border-radius: 7px; box-shadow: none; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
@media (max-width: 1100px) {
  .course-frame { width: min(100%, 940px); }
  .bio-overview-header { grid-template-columns: 1fr; gap: 26px; }
  .bio-overview-facts { display: grid; grid-template-columns: repeat(3, 1fr); }
  .bio-overview-facts div { padding: 12px 14px; border-right: 1px solid var(--surface-muted); }
  .bio-overview-facts div:last-child { border-right: 0; }
  .bio-process-grid { grid-template-columns: repeat(2, 1fr); }
  .bio-model-layout { grid-template-columns: 1fr; }
  .bio-model-readout { margin-top: 0; }
}
@media (max-width: 760px) {
  body { font-size: 16px; }
  .course-main,
  body.sidebar-collapsed .course-main { padding: 82px 12px 104px; }
  .top-progress-shell { right: 10px; width: 148px; }
  .top-progress-meta > span:first-child { display: none; }
  .bio-route { border-radius: 0; }
  .bio-overview-header,
  .bio-lesson-header,
  .bio-hub-header { padding: 36px 22px 30px; }
  .bio-section,
  .bio-learning-targets,
  .bio-sources { margin-inline: 22px; padding-block: 30px; }
  .bio-retrieval,
  .bio-model,
  .bio-artifact { margin-inline: 0; padding: 32px 22px; }
  .bio-lesson > .bio-callout,
  .bio-extension { margin-inline: 22px; }
  .bio-learning-targets,
  .bio-two-column,
  .bio-retrieval,
  .bio-notebook-fields { grid-template-columns: 1fr; }
  .bio-retrieval .bio-response-label,
  .bio-retrieval textarea,
  .bio-retrieval .bio-save-status { grid-column: 1; grid-row: auto; }
  .bio-lesson-meta,
  .bio-overview-facts,
  .bio-comparison-grid,
  .bio-hub-grid { grid-template-columns: 1fr; }
  .bio-overview-facts div { border-right: 0; }
  .bio-module-sequence li { grid-template-columns: 1fr; gap: 3px; }
  .bio-process-grid { grid-template-columns: 1fr; }
  .bio-process-grid article { min-height: 0; }
  .bio-model-header,
  .bio-artifact-heading,
  .bio-section-heading-row { display: block; }
  .bio-stage-controls { display: grid; grid-template-columns: repeat(2, 1fr); }
  .bio-simulator-controls { align-items: stretch; flex-direction: column; }
  .bio-hub-grid { padding: 26px 22px 4px; }
  .bio-notebook-composer { margin: 28px 22px 0; padding: 20px; }
  .bio-notebook-export,
  .bio-practice-overview { margin-inline: 22px; }
  .bio-practice-overview { align-items: stretch; flex-direction: column; }
  .bio-start-row,
  .bio-exit-actions,
  .bio-artifact-actions,
  .lesson-bottom-bar--authored { align-items: stretch; flex-direction: column; }
  .bio-generic-model-controls,
  .bio-source-list article { grid-template-columns: 1fr; }
  .bio-generic-model-controls > div { align-items: stretch; flex-direction: column; }
  .bio-glossary { grid-template-columns: 1fr; }
  .bio-figure > svg { min-width: 820px; }
  .bio-global-save { left: 12px; right: 126px; bottom: 10px; max-width: none; }
  .bio-save-exit { right: 10px; bottom: 10px; }
  .bio-start-row > *,
  .bio-exit-actions > button,
  .bio-artifact-actions > button,
  .lesson-bottom-bar--authored > * { width: 100%; justify-content: center; }
  .lesson-bottom-bar--authored { margin-inline: 22px; padding-inline: 0; }
}
@media (max-width: 420px) {
  .bio-route h1 { font-size: 2rem; }
  .bio-stage-controls { grid-template-columns: 1fr; }
  .bio-route th,
  .bio-route td { padding: 10px; }
}
@media print {
  body { background: #fff; }
  .bio-route { border: 0; }
  .bio-overview-header,
  .bio-lesson-header,
  .bio-hub-header,
  .bio-section,
  .bio-learning-targets,
  .bio-retrieval,
  .bio-model,
  .bio-artifact { margin: 0; padding: 18pt 0; }
  .bio-stage-controls,
  .bio-simulator-controls,
  .bio-check-action,
  .bio-feedback,
  .bio-artifact-actions,
  .bio-exit-actions,
  .bio-notebook-actions,
  .bio-notebook-export,
  .bio-save-exit,
  .bio-global-save { display: none !important; }
  .bio-model-layout,
  .bio-two-column,
  .bio-learning-targets { display: block; }
  .bio-figure,
  .bio-practice-item,
  .bio-artifact { break-inside: avoid; }
  .bio-figure { overflow: visible; }
  .bio-figure > svg { min-width: 0; }
  .bio-route textarea { border: 1px solid #777; min-height: 90pt; }
}
`;
