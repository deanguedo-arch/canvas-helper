# 10 — Responsive, accessibility and browser acceptance

## Baseline target
Build toward WCAG 2.2 AA; the checks here are acceptance requirements, not certification. Use semantic headings/landmarks, labels, keyboard access, visible focus, status text, reflow and sufficiently contrasted meaningful controls. Normal text needs 4.5:1; large text 3:1; meaningful control boundaries/focus indicators 3:1 where applicable. Review the full applicable criteria rather than treating this short list as an accessibility audit. [S10]

## Exact layout decisions
- ≥1280 px available **iframe content width**: 224 px light nav + main + optional 304 px context rail, gaps 24px. Plan cards two columns; editor body minimum 560 px. If available width cannot support that, collapse context first.
- 1000–1279 px: 208 px nav, main workspace; context rail becomes a drawer/button, no third column.
- 720–999 px: 72 px icon rail with accessible names and focus tooltips; context drawer; one/two main cards depending on actual available content width. Do not hide labels from assistive technology.
- <720 px: top menu button and modal navigation drawer; one column. Project tab strip may independently scroll. Context opens as an accessible full-width sheet. Forms become full pages or full-height dialogs with visible headings.
- At 320 CSS px and 200% zoom: no page-wide horizontal scroll for ordinary content. The editor wraps text rather than scaling a desktop screenshot. URLs wrap; toolbar groups collapse into labeled More controls. No clipped Save/Export/Recovery actions.

Measure iframe width, not screen.width. No fixed overall 1440px canvas. Use minmax(0,1fr), overflow-wrap and tested content sizing. Avoid nested independent scroll areas except the editor/context where necessary; keyboard focus must reveal the focused control.

## Keyboard and assistive technology
Skip link to main workspace; one page h1; meaningful card headings. Use native button/input/select/textarea when appropriate. Labels cannot be placeholders only. Icon-only actions have specific accessible names (“Delete evidence note”), not “more” everywhere. Buttons retain focus after successful save and the relevant view takes focus after navigation.

Dialogs: accessible name/description, focus moved inside, focus contained while open, background inert, Escape safe-cancel, focus returned to invoker. Dirty discard confirmation is explicit. Do not implement a modal visually while leaving the page keyboard-active underneath. Tabs implement keyboard navigation or use real route links instead of incomplete ARIA.

The editor exposes a meaningful name and its supported rich editing semantics through the selected editor; test NVDA/Chrome and VoiceOver/Safari manually. Screen-reader support cannot be switched off. Toolbar keyboard navigation is documented and does not trap Tab or override IME.

Status region: polite for normal save transitions, throttled so it does not speak every keystroke. Error/capacity failure may use assertive announcement once when state changes; persistent visual text remains. Do not use green/red alone, spinning icons alone or inaccessible toast-only errors.

## Targets, motion and text
Controls target at least 44×44 px as the product default (stricter than some WCAG minimum cases); inline prose links may follow text metrics with adequate spacing. Touch drag has button alternatives. Visible focus outline 2–3 px with offset, not a removed outline. Colour-token contrast is checked; muted text is still readable. Disabled controls have explanatory text and are not critical sole navigation targets.

Honor prefers-reduced-motion by default. Optional user setting overrides system choice; no continuous background animation or pulsing save badge. Font-size preference changes **editor text**, while browser zoom/reflow handles app UI. High-contrast mode uses solid borders/labels and no decorative background reliance. Editor font selection says serif/sans, not “dyslexia cure”.

## Test matrix
Automated browser: Chromium at 1440×960, 1366×768, 1024×768, 768×1024 and 390×844; check overflow, visible actions and keyboard route traversal. Also 320 CSS px reflow and 200% zoom equivalent. Manual: school-managed Chrome/Chromebook; Safari on macOS/iPad; Windows Chrome/Edge as available. Record actual versions/OS at test time; do not call an untested browser supported.

Test mobile virtual keyboard, selection, long titles, long URLs, multiline dropdown labels, empty states, high contrast, reduced motion, browser back/forward, a missing optional image and a denied clipboard/download. Printing must not include fake LMS navigation. A passing axe/lint result alone is not a full accessibility pass.
