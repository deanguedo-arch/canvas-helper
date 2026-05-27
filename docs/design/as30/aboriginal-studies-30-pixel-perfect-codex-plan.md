# Aboriginal Studies 30 — Pixel-Target Codex Implementation Plan

## Purpose

This file is the execution plan for taking the Aboriginal Studies 30 generated UI mockups and turning them into a real course shell with the highest practical visual fidelity.

The goal is not “make something inspired by this.” The goal is:

> Build the real course shell so the desktop Units screen visually lands extremely close to the supplied reference image, then apply the same component system across Theme pages, Theme 1 Questions, Assignments, Library/PDF viewer, Film Room, Quiz placeholder, and mobile.

True pixel perfection depends on the actual repo, available fonts, browser rendering, and whether the decorative assets are supplied as real SVG/image files. The plan below is designed to remove guesswork and force Codex or any coding agent through a visual QA loop.

---

## 0. Required files to place in the repo

Create this structure:

```txt
/docs/design/
  aboriginal-studies-30-agent-ready-design-implementation.md
  aboriginal-studies-30-pixel-perfect-codex-plan.md

/docs/design/reference/
  as30-units-home-reference.png
  as30-design-system-reference.png

/docs/design/assets/
  as30-medallion-mark.svg
  as30-pattern-band.svg
  as30-bead-divider.svg
  as30-topographic-overlay.svg
  as30-botanical-overlay.svg
  as30-progress-landscape.webp       optional but recommended
```

Use the generated Units home image as:

```txt
/docs/design/reference/as30-units-home-reference.png
```

Use the generated design-system image as:

```txt
/docs/design/reference/as30-design-system-reference.png
```

The existing agent-ready implementation spec stays as the product/content contract. This file is the visual precision contract.

---

## 1. Reality check for “pixel perfect”

Do not pretend Codex will hit this perfectly from a prompt. It will not.

The correct workflow is:

1. Build a static visual clone route first.
2. Screenshot it at the same viewport as the reference.
3. Compare layout, spacing, colors, and component positions.
4. Adjust until the shell matches.
5. Only then connect the styled components back to the real app data/routes.

This prevents the agent from turning the design into a generic dark dashboard.

---

## 2. Reference frame

Primary reference image:

```txt
as30-units-home-reference.png
Size: 1672 × 941
Aspect ratio: approximately 16:9
```

Design-system reference image:

```txt
as30-design-system-reference.png
Size: 1448 × 1086
Aspect ratio: 4:3
```

All desktop pixel matching should begin against a browser viewport of:

```txt
1672px × 941px
```

Then test responsive behavior at:

```txt
1440 × 900
1280 × 800
1024 × 768
768 × 1024
390 × 844
```

---

## 3. Key desktop measurement targets

The reference image uses a wider sidebar than the previous CSS token suggested.

### Overall shell

```txt
Viewport:              1672 × 941
Sidebar:               x 0–335, width 336
Main content start:    x 336
Main content padding:  roughly 45px left on desktop reference
Primary content x:     ~381
Primary content max:   ~1248px
```

### Sidebar

```txt
Sidebar width:                  336px
Top pattern band height:         46px
Brand block starts around:       y 103
Course title block x:            ~106
AS badge center:                 x ~295, y ~132
Course shell label y:            ~222
Active Units nav y:              ~256
Active Units nav height:         ~63px
Sidebar bottom principle y:      ~847
```

### Progress hero

```txt
Progress hero x:                 ~381
Progress hero y:                  ~33
Progress hero width:             ~1248
Progress hero height:             ~271
Progress hero radius:             16–18px
Progress hero header y:            ~75
Progress track x:                 ~427
Progress track y:                 ~109
Progress track width:             ~1148
Progress track height:             ~38
Large percent baseline region:     y ~176–244
Module count x:                   ~1355
Module count y:                   ~265
```

### Units section

```txt
Units heading x:                 ~376
Units heading y:                 ~346
Heading decorative divider x:    ~505
```

### Unit cards

```txt
Card left x:                     ~376
Card right x:                    ~1628
Card width:                      ~1252
Card height:                     ~106
Card border radius:              8–12px
Vertical card gap:               ~22px

Card 1 y:                        ~393–500
Card 2 y:                        ~522–628
Card 3 y:                        ~650–757
Card 4 y:                        ~779–885

Badge column width:              ~128px
Accent stripe x:                 ~503–510
Badge size:                      ~58px
Badge center x:                  ~442
Card text x:                     ~540
Right chevron x:                 ~1587
```

### Important correction

Previous spec token used:

```css
--as-sidebar-width: 260px;
```

For the reference image, this is too narrow. Use:

```css
--as-sidebar-width: 336px;
```

Then add responsive reductions:

```css
@media (max-width: 1280px) {
  :root { --as-sidebar-width: 300px; }
}

@media (max-width: 820px) {
  :root { --as-sidebar-width: 100%; }
}
```

---

## 4. Font decision for closest match

The design-system poster suggests Playfair Display, Cinzel, and Inter. The actual Units mockup visually uses three roles:

1. **Course title / nav / micro labels**: tall condensed uppercase sans.
2. **Theme titles / large percent**: elegant serif.
3. **Body/UI text**: clean readable sans.

Recommended production font stack:

```css
:root {
  --font-brand: "Barlow Condensed", "Oswald", "Arial Narrow", system-ui, sans-serif;
  --font-display: "Playfair Display", "Cinzel", Georgia, serif;
  --font-ui: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```

If external fonts are allowed, load:

```txt
Barlow Condensed: 600, 700, 800
Playfair Display: 600, 700
Inter: 400, 500, 600, 700, 800
```

If external fonts are not allowed, use system fallbacks but expect visible deviation.

---

## 5. Adjusted visual tokens for pixel-target match

Use these values as the final visual baseline.

```css
:root {
  --as-bg-page: #061014;
  --as-bg-deep: #081520;
  --as-bg-panel: #10171A;
  --as-bg-panel-2: #111C1E;
  --as-bg-elevated: #152326;

  --as-forest: #0F2A26;
  --as-deep-teal: #0E3D3F;
  --as-teal: #0F6B66;
  --as-turquoise: #19C1B7;
  --as-turquoise-soft: #6FE7DC;

  --as-copper: #B87347;
  --as-copper-dark: #7B4729;
  --as-amber: #D69A5A;

  --as-cream: #F2E9D8;
  --as-cream-muted: #CFC3AE;
  --as-text-muted: #8F9A98;

  --as-border-faint: rgba(242, 233, 216, 0.10);
  --as-border-copper: rgba(184, 115, 71, 0.50);
  --as-border-teal: rgba(25, 193, 183, 0.45);

  --as-sidebar-width: 336px;
  --as-content-max: 1252px;

  --as-radius-card: 10px;
  --as-radius-panel: 18px;
  --as-radius-hero: 18px;

  --as-shadow-panel: 0 22px 60px rgba(0, 0, 0, 0.42);
  --as-shadow-card: 0 10px 30px rgba(0, 0, 0, 0.30);
  --as-glow-teal: 0 0 0 1px rgba(25, 193, 183, 0.42), 0 0 26px rgba(25, 193, 183, 0.14);
}
```

---

## 6. Asset strategy

Pixel-level fidelity requires real assets. CSS-only patterns are acceptable, but they will not be identical to the mockup.

### Required SVG/CSS assets

#### 6.1 Top pattern band

```txt
File: /docs/design/assets/as30-pattern-band.svg
Used in: sidebar top strip, active nav edge accent, small decorative areas
Target dimensions: 336 × 46, repeat-x capable
Visual: copper/teal/cream diamond geometric strip on dark base
```

Do not let the agent invent random “tribal” art. Use a generic geometric diamond/woven pattern.

#### 6.2 Medallion mark

```txt
File: /docs/design/assets/as30-medallion-mark.svg
Used in: sidebar brand mark, design identity
Target dimensions: 48 × 48
Visual: circular generic dotted mark, teal/copper/cream; no sacred symbols
```

#### 6.3 Bead divider

```txt
File: /docs/design/assets/as30-bead-divider.svg
Used in: below brand, beside Units heading, footer separators
Target dimensions: 160 × 16
Visual: small centered geometric diamond motif with thin copper line
```

#### 6.4 Topographic overlay

```txt
File: /docs/design/assets/as30-topographic-overlay.svg
Used in: background overlays, cards, sidebar lower area
Visual: very subtle contour lines
Opacity in CSS: 0.08–0.16
```

#### 6.5 Botanical overlay

```txt
File: /docs/design/assets/as30-botanical-overlay.svg
Used in: right side of unit/resource cards
Visual: subtle plant silhouette line art
Opacity in CSS: 0.05–0.10
```

#### 6.6 Progress landscape

```txt
File: /docs/design/assets/as30-progress-landscape.webp
Used in: progress hero background
Visual: dark mountain/forest/water horizon
Opacity/overlay: dark gradient on top for readability
```

If no real landscape asset is supplied, create an abstract CSS/SVG landscape. Do not use stock-looking hero photography.

---

## 7. Build a static reference route first

Before touching all real screens, create a static reference route/component:

```txt
/__design/as30-units-reference
```

or, if the project does not support routes:

```txt
src/design/AS30UnitsReference.tsx
src/design/as30-reference.css
```

This route should hardcode the visible Units screen only:

- Sidebar
- Brand block
- Active Units nav
- Progress hero
- Units heading
- Four unit cards

No real app data yet. No worksheet yet. No library yet. This is the visual calibration target.

### Why this matters

If the agent connects every real feature first, it will compromise the design. The static route lets the agent prove it can match the image before wiring real behavior.

---

## 8. Screenshot and visual-diff loop

Add a visual QA script if the repo has Playwright or can support it.

### Playwright screenshot target

```ts
// tests/visual/as30-units-reference.spec.ts
import { test, expect } from "@playwright/test";

test("AS30 units reference screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.goto("/__design/as30-units-reference");
  await expect(page).toHaveScreenshot("as30-units-reference.png", {
    fullPage: true,
    animations: "disabled",
    maxDiffPixelRatio: 0.12
  });
});
```

A strict screenshot diff may fail because browser font rendering and generated textures differ. Use this as a forcing function, not as the only acceptance rule.

### Better acceptance for this project

The visual clone is acceptable when:

```txt
- Sidebar width is within ±4px of reference.
- Progress hero x/y/w/h are within ±6px.
- Unit card x/y/w/h are within ±6px.
- Unit badge position is within ±5px.
- Accent stripe position is within ±4px.
- Main colors are within close visual range.
- Typography hierarchy matches even if exact font rendering differs.
- The screen does not read as a generic dashboard.
```

---

## 9. Desktop Units screen CSS blueprint

### App shell

```css
.as30-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: var(--as-sidebar-width) minmax(0, 1fr);
  color: var(--as-cream);
  background:
    radial-gradient(circle at 88% 5%, rgba(24, 49, 72, 0.38), transparent 34%),
    radial-gradient(circle at 67% 10%, rgba(15, 61, 63, 0.24), transparent 42%),
    linear-gradient(135deg, #071016 0%, #0B1520 45%, #05070D 100%);
  font-family: var(--font-ui);
}

.as30-main {
  height: 100vh;
  overflow-y: auto;
  padding: 33px 43px 56px 45px;
}

.as30-content {
  max-width: var(--as-content-max);
  margin: 0 auto;
}
```

### Sidebar

```css
.as30-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(8, 18, 20, 0.96), rgba(7, 16, 22, 0.98)),
    var(--as-bg-deep);
  border-right: 1px solid rgba(184, 115, 71, 0.28);
  box-shadow: var(--as-shadow-panel);
}

.as30-sidebar::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 360px;
  pointer-events: none;
  background:
    linear-gradient(180deg, transparent, rgba(15, 42, 38, 0.60)),
    url("/docs/design/assets/as30-topographic-overlay.svg");
  opacity: 0.65;
}

.as30-sidebar-pattern {
  height: 46px;
  background:
    url("/docs/design/assets/as30-pattern-band.svg") center / auto 46px repeat-x,
    #071016;
  border-bottom: 1px solid rgba(184, 115, 71, 0.35);
}
```

### Sidebar brand

```css
.as30-brand {
  position: relative;
  z-index: 1;
  padding: 58px 25px 22px;
}

.as30-brand-row {
  display: grid;
  grid-template-columns: 54px 1fr 54px;
  align-items: center;
  gap: 16px;
}

.as30-brand-title {
  margin: 0;
  font-family: var(--font-brand);
  font-size: 34px;
  line-height: 0.92;
  font-weight: 800;
  letter-spacing: 0.055em;
  color: var(--as-cream);
  text-transform: uppercase;
}

.as30-course-badge {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 2px solid rgba(25, 193, 183, 0.65);
  color: var(--as-turquoise);
  background: rgba(5, 11, 14, 0.75);
  font-weight: 900;
  box-shadow: inset 0 0 0 1px rgba(184, 115, 71, 0.30);
}
```

### Nav item sizing

```css
.as30-nav {
  position: relative;
  z-index: 2;
  margin-top: 6px;
}

.as30-nav-item {
  min-height: 64px;
  display: flex;
  align-items: center;
  gap: 18px;
  width: 100%;
  padding: 0 25px;
  border: 0;
  border-left: 4px solid transparent;
  background: transparent;
  color: var(--as-cream-muted);
  font-family: var(--font-brand);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
}

.as30-nav-item.is-active {
  color: var(--as-cream);
  border-left-color: var(--as-turquoise);
  background:
    linear-gradient(90deg, rgba(25, 193, 183, 0.35), rgba(15, 107, 102, 0.18)),
    rgba(15, 42, 38, 0.82);
  box-shadow:
    inset 0 1px 0 rgba(25, 193, 183, 0.26),
    inset 0 -1px 0 rgba(25, 193, 183, 0.18);
}
```

### Progress hero

```css
.as30-progress-hero {
  min-height: 271px;
  padding: 39px 49px 31px;
  border-radius: 18px;
  border: 1px solid rgba(184, 115, 71, 0.44);
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(6, 13, 18, 0.98) 0%, rgba(8, 21, 32, 0.82) 38%, rgba(15, 61, 63, 0.46) 100%),
    url("/docs/design/assets/as30-progress-landscape.webp") center / cover no-repeat,
    var(--as-bg-panel);
  box-shadow: var(--as-shadow-panel);
}

.as30-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 19px;
  font-family: var(--font-brand);
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.23em;
  text-transform: uppercase;
}

.as30-progress-track {
  height: 39px;
  border-radius: 999px;
  border: 1px solid rgba(184, 115, 71, 0.72);
  padding: 5px;
  background:
    repeating-linear-gradient(45deg, rgba(25, 193, 183, 0.13) 0 5px, rgba(184, 115, 71, 0.12) 5px 10px),
    rgba(2, 6, 9, 0.60);
  box-shadow: inset 0 0 0 1px rgba(25, 193, 183, 0.14);
}

.as30-progress-body {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: end;
  gap: 32px;
  margin-top: 28px;
}

.as30-progress-percent {
  font-family: var(--font-display);
  font-size: 91px;
  line-height: 0.9;
  font-weight: 700;
  color: var(--as-cream);
}

.as30-progress-label {
  font-family: var(--font-display);
  font-size: 37px;
  line-height: 1;
  color: var(--as-cream);
}
```

### Units list

```css
.as30-section-title-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 35px;
  margin-bottom: 19px;
}

.as30-section-title {
  margin: 0;
  font-family: var(--font-brand);
  font-size: 36px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.as30-unit-list {
  display: grid;
  gap: 22px;
}

.as30-unit-card {
  min-height: 106px;
  display: grid;
  grid-template-columns: 128px minmax(0, 1fr) 48px;
  align-items: center;
  width: 100%;
  padding: 0 18px 0 0;
  border-radius: 10px;
  border: 1px solid rgba(184, 115, 71, 0.42);
  background:
    linear-gradient(90deg, rgba(15, 42, 38, 0.70), rgba(16, 24, 32, 0.96)),
    var(--as-bg-panel);
  color: var(--as-cream);
  box-shadow: var(--as-shadow-card);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.as30-unit-card::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 128px;
  width: 7px;
  background: linear-gradient(180deg, var(--as-turquoise), var(--as-deep-teal), var(--as-copper));
  box-shadow: 0 0 14px rgba(25, 193, 183, 0.32);
}

.as30-unit-badge-wrap {
  display: grid;
  place-items: center;
}

.as30-unit-badge {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-family: var(--font-brand);
  font-size: 30px;
  font-weight: 800;
  color: var(--as-turquoise);
  border: 1px solid rgba(184, 115, 71, 0.70);
  box-shadow:
    0 0 0 6px rgba(25, 193, 183, 0.06),
    0 0 0 11px rgba(184, 115, 71, 0.08),
    inset 0 0 0 1px rgba(25, 193, 183, 0.24);
}

.as30-unit-title {
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: 29px;
  line-height: 1.12;
  font-weight: 700;
  color: var(--as-cream);
}

.as30-unit-desc {
  margin: 0;
  font-size: 16px;
  line-height: 1.45;
  color: var(--as-cream-muted);
}

.as30-unit-arrow {
  justify-self: center;
  font-size: 50px;
  line-height: 1;
  color: var(--as-copper);
}
```

---

## 10. Real implementation sequence

### Pass 1 — static Units clone

Goal:

```txt
Create a hardcoded visual clone of the Units screen at /__design/as30-units-reference.
```

Do not wire data. Do not touch worksheet. Do not touch Library. This is a screenshot-matching pass.

Acceptance:

```txt
- At 1672×941 viewport, shell proportions match the reference.
- Sidebar, progress hero, Units heading, and four unit cards are in the right places.
- Colors, typography, borders, and accents feel close to the reference.
```

### Pass 2 — componentize

Turn the static clone into reusable components:

```txt
AS30Shell
AS30Sidebar
AS30ProgressHero
AS30SectionHeader
AS30UnitCard
AS30Button
AS30StatusPill
AS30Panel
AS30ResourceRow
AS30WorksheetQuestion
AS30TextArea
```

### Pass 3 — connect Units home to real app

Replace the current Units view with the new componentized version.

Preserve:

```txt
- current routing
- current completion/progress logic
- current click handlers
- current auth/sync behavior
```

### Pass 4 — Theme page

Implement Theme page styling using the same system.

Must include:

```txt
- Back to Units
- Theme title
- Resources panel
- Mark Complete
- Theme 1 Questions entry point
```

Theme 1 resource order:

```txt
1. Chapter 1 — Open Chapter
2. Walking Together: The Oral Tradition — Open
3. Road Allowance People — Watch
4. Metis Self-Governance — Watch
```

### Pass 5 — Theme 1 Questions

Implement the worksheet UI.

Critical behavior:

```txt
- No PDF screenshots.
- Textareas resize: none.
- Textareas auto-grow.
- Max textarea height: 360px.
- Very long responses scroll internally.
- Autosave status visible.
- Copy Responses button visible.
```

### Pass 6 — Assignments

Restyle assignment cards. Use student-facing language only.

Buttons:

```txt
View Assignment
Download DOCX
Open Source  only when genuinely useful
```

### Pass 7 — Library/PDF viewer

Library must include:

```txt
Chapter 1
Chapter 2
Chapter 3
Chapter 4
Chapter 5
Chapter 6
Chapter 7
Textbook
Glossary
```

Buttons:

```txt
View Chapter
Download PDF
```

PDF opens in-shell with download fallback.

### Pass 8 — Film Room

Preserve the TV concept. Replace all tape language.

Use:

```txt
Film Room
Video catalog
Load a video
Playlist
Now loaded
Theme 1
Theme 2
Theme 3
Theme 4
Open Source
```

Do not use:

```txt
Tape catalog
Tape 01
Tapes loaded
```

### Pass 9 — Quiz placeholder

Make the Quizzes page intentional, not empty/broken.

Example:

```txt
No quizzes are available yet.
When a quiz is ready, it will appear here with instructions and a start button.
```

### Pass 10 — mobile and accessibility pass

Test and fix:

```txt
390px
768px
1024px
1440px
1672px
```

---

## 11. Required AGENTS.md

Add this file to repo root:

```md
# AGENTS.md

## Project: Aboriginal Studies 30 Course Shell

Follow `/docs/design/aboriginal-studies-30-agent-ready-design-implementation.md` for product/content requirements.

Follow `/docs/design/aboriginal-studies-30-pixel-perfect-codex-plan.md` for visual precision and implementation sequence.

Use `/docs/design/reference/as30-units-home-reference.png` as the primary visual target.
Use `/docs/design/reference/as30-design-system-reference.png` as the design-system reference.

Do not produce a generic dark dashboard. Preserve the real course shell behavior and implement the visual system as production UI.

Before editing, inspect the repo and produce a plan.
After editing, run the available build/lint/test commands.
Provide screenshots for desktop and mobile.
State any deviations from the reference.
```

---

## 12. Exact Codex kickoff prompt

Use this first. Do not ask for full implementation immediately.

```txt
You are working in the Aboriginal Studies 30 course-shell repo.

Before editing any files, inspect the repo and read:

- /docs/design/aboriginal-studies-30-agent-ready-design-implementation.md
- /docs/design/aboriginal-studies-30-pixel-perfect-codex-plan.md
- /docs/design/reference/as30-units-home-reference.png
- /docs/design/reference/as30-design-system-reference.png

Task 1 only:
Create an implementation plan.

Your plan must identify:
1. Existing shell/layout files.
2. Existing sidebar/navigation files.
3. Existing Units, Theme page, Questions, Assignments, Library, PDF viewer, Film Room, and Quiz files.
4. Existing stylesheet/theme files.
5. Whether Playwright or another screenshot tool exists.
6. What assets are missing for close visual fidelity.
7. A step-by-step implementation order.

Do not edit files yet.
Do not simplify the design into a generic dark dashboard.
```

---

## 13. Exact Codex implementation prompt — Pass 1 only

Use this after the planning response.

```txt
Implement Pass 1 only from the pixel-perfect plan.

Goal:
Create a static visual reference route/component for the Units home screen that matches `/docs/design/reference/as30-units-home-reference.png` as closely as practical.

Requirements:
- Viewport target: 1672 × 941.
- Sidebar width: 336px on large desktop.
- Progress hero should match the reference position, size, color, and hierarchy.
- Unit cards should match the reference layout: 4 horizontal cards, circular T badges, teal vertical stripe, copper border, right chevron.
- Use the design tokens and font strategy in the pixel-perfect plan.
- Use abstract geometric/topographic/botanical motifs only.
- Do not wire real course data yet.
- Do not touch Theme Questions, Library, Assignments, Film Room, or Quiz in this pass unless required by shared styling.

Proof required:
- Run build/lint if available.
- Provide changed files.
- Provide screenshot of the static Units reference route at 1672 × 941.
- State visual deviations from the supplied reference.
```

---

## 14. Exact Codex implementation prompt — Pass 2 and 3

```txt
Now componentize the static AS30 Units reference and connect it to the real Units home route.

Requirements:
- Preserve existing routing, progress logic, active nav behavior, completion behavior, and auth/sync behavior.
- Reuse the visual components from the static clone.
- Remove the static route only if it is no longer needed, or keep it under `/__design` for QA if appropriate.
- The real Units home must visually match the static clone.

Proof required:
- Build/lint/test output.
- Screenshot of real Units home at 1672 × 941.
- Screenshot at 390px mobile width.
- Changed files list.
- Any deviations.
```

---

## 15. Exact Codex implementation prompt — remaining screens

```txt
Implement the remaining Aboriginal Studies 30 screens using the AS30 component system.

Screens:
1. Individual Theme page
2. Theme 1 Questions online worksheet
3. Assignments
4. Library
5. In-shell PDF viewer
6. Film Room
7. Quiz placeholder/list view
8. Mobile layout

Hard requirements:
- Preserve existing app behavior and data flow.
- Theme 1 resources must show Chapter 1 first.
- Theme 1 Questions must be web-native, not a PDF/image dump.
- Textareas must be `resize: none`, auto-grow vertically, cap at 360px, and scroll internally after cap.
- Library buttons must say View Chapter and Download PDF.
- Film Room must use video/module language, not tape language.
- No backend/admin/source-system wording.
- Use accessible labels, focus states, real buttons/links, and 44px touch targets.

Proof required:
- Build/lint/test output.
- Screenshots for Theme 1 page, Theme 1 Questions, Assignments, Library/PDF viewer, Film Room, Quiz page, and mobile.
- Changed files list.
- Any deviations.
```

---

## 16. Visual QA checklist

Use this checklist on every screenshot.

### Shell

```txt
[ ] Sidebar is ~336px wide on large desktop.
[ ] Main content begins at the right x-position.
[ ] Background is deep navy/forest/charcoal, not pure black.
[ ] Content max width does not stretch too wide.
[ ] Main content scrolls independently.
```

### Sidebar

```txt
[ ] Top pattern band exists and is not overpowering.
[ ] Course title reads ABORIGINAL STUDIES 30.
[ ] Course title uses tall uppercase display style.
[ ] AS badge appears near title.
[ ] Nav includes only Units, Quizzes, Assignments, Library, Film Room.
[ ] Active Units state is turquoise/teal with patterned edge.
[ ] Footer principle line appears near bottom.
[ ] Google sign-in/sync control remains available near lower area if present in original app.
```

### Progress hero

```txt
[ ] Wide rounded card near top.
[ ] Copper border visible.
[ ] Course Progress label appears.
[ ] 0 / 4 Units appears on right.
[ ] Patterned progress track exists.
[ ] Large 0% complete hierarchy matches reference.
[ ] Modules: 0 / 4 appears on right/lower area.
[ ] Background has landscape/topographic mood without hurting readability.
```

### Units cards

```txt
[ ] Four horizontal cards.
[ ] T1–T4 circular badges.
[ ] Teal vertical stripe after badge column.
[ ] Theme titles use elegant serif/display font.
[ ] Description text is readable.
[ ] Right chevron is copper.
[ ] Hover/focus states are visible.
[ ] Cards look clickable, not static.
```

### Worksheet

```txt
[ ] Looks like an intentional digital worksheet.
[ ] No inline PDF/booklet images.
[ ] Section headers and source references are clear.
[ ] Numbered question cards scan cleanly.
[ ] Inputs are polished and high contrast.
[ ] Long answer boxes auto-grow and do not manually resize.
[ ] Autosave status is visible.
[ ] Copy Responses button is visible.
```

### Cultural guardrails

```txt
[ ] No dreamcatchers.
[ ] No feathers as token decoration.
[ ] No headdresses.
[ ] No sacred objects.
[ ] No faux tribal clipart.
[ ] No fake Nation-specific claims.
[ ] Motifs remain abstract, geometric, topographic, botanical, or landscape-based.
```

---

## 17. Most likely failure points

Watch these closely:

1. **Sidebar too narrow** — use 336px, not 260px, for desktop reference fidelity.
2. **Wrong font feel** — Inter-only will look too generic. Use a condensed brand font plus serif display.
3. **Over-decoration** — patterns should support the UI, not overpower reading.
4. **Generic dashboard look** — if it looks like a SaaS admin panel, it failed.
5. **Worksheet ignored** — Theme 1 Questions is one of the most important screens.
6. **Mobile afterthought** — the design must not collapse into tiny unreadable cards.
7. **No visual proof** — do not accept an agent response without screenshots.

---

## 18. Final acceptance rule

Accept the implementation only when:

```txt
1. The Units screen visually matches the reference image closely at 1672 × 941.
2. The rest of the course uses the same component system.
3. The course remains usable, accessible, and student-facing.
4. The design avoids stereotypes and does not invent sacred/Nation-specific artwork.
5. Screenshots prove the implementation, not just text claims.
```

The target is a serious, premium, readable Aboriginal Studies 30 course shell — not a decoration layer on top of the old shell.
