# Aboriginal Studies 30 — Agent-Ready Redesign Implementation Spec

## Purpose

Redesign the existing Aboriginal Studies 30 course shell so it matches the new Canadian Indigenous-inspired visual direction shown in the generated design mockups, while preserving the existing course structure, navigation, student workflow, and interaction model.

This is not a landing page. This is a production-style student course shell.

The agent should implement the redesign as a real responsive course interface using the current app structure wherever possible. Do not rebuild the course as a generic marketing site. Do not replace working logic unless required for styling, layout, or component cleanup.

---

# 1. Non-Negotiable Product Requirements

## Course identity

Course title:

```txt
ABORIGINAL STUDIES 30
```

Course badge:

```txt
AS
```

or

```txt
AS 30
```

Use four main course themes:

```txt
Theme 1 - Aboriginal Rights & Self-Government
Theme 2 - Aboriginal Land Claims
Theme 3 - Aboriginal Peoples in Canadian Society
Theme 4 - Aboriginal World Issues
```

## Required main navigation

Keep only these primary navigation items:

```txt
Units
Quizzes
Assignments
Library
Film Room
```

Do not include:

```txt
Phases
Performance
Sports Wellness
Course Information
Teacher/admin comments
Answer key references
Source-system labels
Backend conversion notes
```

## Required screens

Implement or restyle these screens as one cohesive course website:

1. Units home
2. Individual Theme page
3. Theme 1 Questions online booklet
4. Assignments
5. Library
6. PDF chapter viewer
7. Film Room
8. Quiz placeholder/list view
9. Mobile layout

## Required interaction model

Preserve the current shell behavior:

- Persistent desktop sidebar
- Main content area scrolls independently
- Active nav state
- Clickable unit/resource/assignment rows
- Google sign-in/sync area near lower sidebar
- Course progress display
- Mark Complete controls
- Back to Units controls
- Autosaving worksheet responses where already supported or feasible

---

# 2. Visual Target

The new interface should visually match the generated concept:

- Dark, premium, course-shell UI
- Deep forest green / midnight navy / charcoal base
- Cream text
- Copper and turquoise accents
- Subtle Indigenous-inspired geometric pattern accents
- Landscape/topographic/botanical texture
- Mature high-school humanities tone
- Clear, readable, respectful, non-gimmicky design

The design should feel like:

```txt
A serious online humanities/social studies course
+
A polished dark-mode learning platform
+
A restrained Canadian Indigenous-inspired visual system
```

It should not feel like:

```txt
A generic landing page
A fantasy game UI
A sports course
A marketing homepage
A faux-tribal theme
A decorative stereotype
```

---

# 3. Cultural/Visual Guardrails

Use respectful, restrained, abstract visual language.

Allowed:

- Abstract beadwork-inspired geometric borders
- Subtle woven/sash-like line accents
- Topographic contour line backgrounds
- Natural landscape silhouettes
- Forest/mountain/water horizon imagery
- Botanical silhouettes
- Copper/teal decorative dividers
- Small circular medallion-style UI badges, kept generic

Avoid:

- Dreamcatchers
- Feathers as token decoration
- Headdresses
- Sacred objects
- Pan-Indigenous clichés
- Faux tribal clipart
- Random earth-tone-only palette
- Overly decorative patterns that hurt readability
- Using specific Nation artwork unless officially sourced and permitted

The interface can be Indigenous-inspired, but it must not pretend to be official Nation-specific artwork.

---

# 4. Design Tokens

Implement these as CSS variables or theme tokens.

```css
:root {
  /* Backgrounds */
  --as-bg-900: #071016;      /* app background */
  --as-bg-850: #0B1520;      /* deep navy */
  --as-bg-800: #101820;      /* charcoal panel */
  --as-bg-750: #111D1F;      /* green-black panel */
  --as-bg-700: #162225;      /* elevated card */
  --as-bg-650: #1B2A2D;      /* hover card */

  /* Indigenous-inspired natural palette */
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
  --as-sand: #E5D2B7;
  --as-slate: #2A3238;
  --as-muted-sage: #5E6D66;

  /* Borders */
  --as-border-subtle: rgba(242, 233, 216, 0.12);
  --as-border-copper: rgba(184, 115, 71, 0.55);
  --as-border-teal: rgba(25, 193, 183, 0.45);

  /* Text */
  --as-text-primary: #F2E9D8;
  --as-text-secondary: #CFC3AE;
  --as-text-muted: #8F9A98;
  --as-text-accent: #19C1B7;
  --as-text-copper: #D69A5A;

  /* States */
  --as-focus: #6FE7DC;
  --as-success: #19C1B7;
  --as-warning: #D69A5A;
  --as-locked: rgba(143, 154, 152, 0.45);

  /* Radius */
  --as-radius-sm: 8px;
  --as-radius-md: 12px;
  --as-radius-lg: 18px;
  --as-radius-xl: 24px;

  /* Layout */
  --as-sidebar-width: 260px;
  --as-content-max: 1180px;
  --as-space-1: 4px;
  --as-space-2: 8px;
  --as-space-3: 12px;
  --as-space-4: 16px;
  --as-space-5: 24px;
  --as-space-6: 32px;
  --as-space-7: 48px;

  /* Shadows */
  --as-shadow-panel: 0 18px 50px rgba(0, 0, 0, 0.35);
  --as-shadow-card: 0 10px 30px rgba(0, 0, 0, 0.28);
  --as-glow-teal: 0 0 0 1px rgba(25, 193, 183, 0.35), 0 0 24px rgba(25, 193, 183, 0.12);
  --as-glow-copper: 0 0 0 1px rgba(184, 115, 71, 0.45), 0 0 24px rgba(184, 115, 71, 0.10);
}
```

---

# 5. Typography

Use a clean pairing. If the project already has fonts, keep the closest available equivalent.

Preferred web font pairing:

```txt
Display / major headings: Playfair Display or Cinzel
UI / body / forms: Inter
```

Fallback:

```css
--font-display: "Playfair Display", "Cinzel", Georgia, serif;
--font-ui: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

## Type rules

### Course title

```css
font-family: var(--font-ui);
font-weight: 800;
letter-spacing: 0.08em;
text-transform: uppercase;
line-height: 0.95;
```

### Section headings

```css
font-family: var(--font-ui);
font-weight: 800;
letter-spacing: 0.12em;
text-transform: uppercase;
color: var(--as-text-primary);
```

### Theme/card titles

```css
font-family: var(--font-display);
font-weight: 700;
line-height: 1.15;
color: var(--as-text-primary);
```

### Body copy

```css
font-family: var(--font-ui);
font-size: 0.95rem;
line-height: 1.55;
color: var(--as-text-secondary);
```

### Micro labels

```css
font-family: var(--font-ui);
font-size: 0.72rem;
font-weight: 700;
letter-spacing: 0.18em;
text-transform: uppercase;
color: var(--as-text-copper);
```

---

# 6. Global Layout

## Desktop shell

Use a two-column app layout.

```css
.course-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: var(--as-sidebar-width) minmax(0, 1fr);
  background:
    radial-gradient(circle at top right, rgba(15, 61, 63, 0.35), transparent 38%),
    linear-gradient(135deg, #071016 0%, #0B1520 45%, #090B14 100%);
  color: var(--as-text-primary);
}
```

## Sidebar

```css
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  background:
    linear-gradient(180deg, rgba(15,42,38,0.94), rgba(7,16,22,0.98)),
    var(--as-bg-850);
  border-right: 1px solid rgba(184, 115, 71, 0.28);
  box-shadow: var(--as-shadow-panel);
}
```

## Main content

```css
.main-content {
  height: 100vh;
  overflow-y: auto;
  padding: clamp(20px, 3vw, 48px);
}

.content-inner {
  width: min(100%, var(--as-content-max));
  margin: 0 auto;
}
```

## Mobile shell

At `max-width: 820px`:

- Sidebar becomes top bar/drawer
- Main content uses full width
- Cards stack
- Unit cards become compact vertical cards
- Tables become horizontally scrollable or stacked question blocks
- PDF viewer gets download fallback
- Film Room player remains visible and usable

```css
@media (max-width: 820px) {
  .course-shell {
    display: block;
  }

  .sidebar {
    position: sticky;
    top: 0;
    height: auto;
    z-index: 50;
  }

  .main-content {
    height: auto;
    min-height: 100vh;
    padding: 16px;
  }
}
```

---

# 7. Background Motifs

Add texture through CSS pseudo-elements, not heavy image dependencies.

## Topographic contour overlay

```css
.topographic-bg {
  position: relative;
  overflow: hidden;
}

.topographic-bg::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.14;
  background-image:
    radial-gradient(ellipse at 20% 30%, transparent 0 35%, rgba(214,154,90,0.18) 36%, transparent 37%),
    radial-gradient(ellipse at 70% 40%, transparent 0 40%, rgba(25,193,183,0.15) 41%, transparent 42%),
    radial-gradient(ellipse at 50% 80%, transparent 0 45%, rgba(242,233,216,0.10) 46%, transparent 47%);
  background-size: 420px 260px, 520px 340px, 640px 420px;
}
```

## Generic beadwork/geometric divider

Use simple CSS patterns. Do not use sacred or Nation-specific imagery.

```css
.bead-divider {
  height: 12px;
  width: 160px;
  margin: 18px 0;
  background:
    linear-gradient(45deg, transparent 43%, var(--as-copper) 44% 56%, transparent 57%),
    linear-gradient(-45deg, transparent 43%, var(--as-turquoise) 44% 56%, transparent 57%);
  background-size: 14px 14px;
  opacity: 0.85;
}
```

## Pattern accent strip

```css
.pattern-strip {
  background:
    repeating-linear-gradient(
      45deg,
      rgba(25,193,183,0.95) 0 2px,
      transparent 2px 8px,
      rgba(184,115,71,0.9) 8px 10px,
      transparent 10px 16px
    );
}
```

---

# 8. Sidebar Implementation

## Sidebar content order

1. Decorative top pattern band
2. Course brand block
3. Small AS badge
4. Progress mini summary or sync state
5. Navigation list
6. Google sign-in/sync controls near lower portion
7. Small footer principle line

## Brand block

Visual:

- Course title on two lines
- Small circular AS badge
- Thin copper divider
- Small decorative bead divider
- Muted label: COURSE SHELL

Example structure:

```html
<aside class="sidebar">
  <div class="sidebar-pattern-band"></div>

  <div class="sidebar-brand">
    <div class="brand-row">
      <div class="brand-mark" aria-hidden="true"></div>
      <h1>ABORIGINAL<br />STUDIES 30</h1>
      <div class="course-badge">AS</div>
    </div>
    <div class="brand-divider"></div>
    <p class="sidebar-kicker">Course Shell</p>
  </div>

  <nav class="sidebar-nav" aria-label="Course navigation">
    <!-- nav buttons -->
  </nav>

  <div class="sidebar-sync">
    <!-- existing Google sign-in/sync control -->
  </div>

  <p class="sidebar-footer">Learning. Respect. Reciprocity.</p>
</aside>
```

## Nav item styling

```css
.nav-item {
  display: flex;
  align-items: center;
  min-height: 52px;
  gap: 12px;
  padding: 0 18px 0 22px;
  color: var(--as-text-secondary);
  border-left: 4px solid transparent;
  background: transparent;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 800;
  font-size: 0.78rem;
  transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
}

.nav-item:hover {
  background: rgba(25, 193, 183, 0.08);
  color: var(--as-text-primary);
}

.nav-item.active {
  color: var(--as-text-primary);
  background:
    linear-gradient(90deg, rgba(25,193,183,0.28), rgba(15,107,102,0.18)),
    rgba(15,42,38,0.75);
  border-left-color: var(--as-turquoise);
  box-shadow: inset 0 0 0 1px rgba(25,193,183,0.18);
}

.nav-item.active::after {
  content: "";
  margin-left: auto;
  width: 22px;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    var(--as-copper) 0 2px,
    transparent 2px 7px,
    var(--as-turquoise) 7px 9px,
    transparent 9px 14px
  );
  opacity: 0.7;
}
```

---

# 9. Progress Panel

The main Units screen should have a large, elegant course progress card at the top.

## Required content

- Label: `Course Progress`
- Progress value: `0% complete` or dynamic value
- Right label: `0 / 4 Units`
- Module count: `Modules: 0 / 4`
- Patterned progress bar

## Visual direction

- Wide rounded card
- Mountain/forest/topographic feel using gradient or background image if available
- Copper border
- Turquoise/copper patterned progress track
- Large cream percentage
- Compact metadata on right

Example:

```html
<section class="progress-hero topographic-bg">
  <div class="progress-hero-header">
    <span>Course Progress</span>
    <strong>0 / 4 Units</strong>
  </div>

  <div class="progress-track" aria-label="Course progress">
    <div class="progress-fill" style="width: 0%"></div>
  </div>

  <div class="progress-hero-body">
    <div class="progress-percent">0%</div>
    <div class="progress-label">complete</div>
    <div class="module-count">Modules: <strong>0 / 4</strong></div>
  </div>
</section>
```

```css
.progress-hero {
  position: relative;
  min-height: 190px;
  padding: 28px 34px;
  border-radius: var(--as-radius-xl);
  border: 1px solid var(--as-border-copper);
  background:
    linear-gradient(90deg, rgba(7,16,22,0.95), rgba(15,61,63,0.68)),
    linear-gradient(180deg, rgba(25,193,183,0.10), transparent),
    var(--as-bg-800);
  box-shadow: var(--as-shadow-panel);
  overflow: hidden;
}

.progress-track {
  height: 20px;
  border-radius: 999px;
  border: 1px solid rgba(184,115,71,0.75);
  padding: 3px;
  background:
    repeating-linear-gradient(
      45deg,
      rgba(25,193,183,0.18) 0 4px,
      rgba(184,115,71,0.14) 4px 8px
    ),
    rgba(0,0,0,0.25);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--as-copper), var(--as-turquoise));
}
```

---

# 10. Units Home

## Layout

Below the progress card:

- Section heading: `Units`
- Decorative divider
- Four large horizontal unit cards

## Unit card requirements

Each card includes:

- Badge: `T1`, `T2`, `T3`, `T4`
- Theme title
- Student-facing description
- Right chevron/link affordance
- Visible hover/focus state
- Supports future locked/blurred state

## Unit card visual

```html
<button class="unit-card" type="button">
  <div class="unit-badge">T1</div>
  <div class="unit-copy">
    <h3>Theme 1 - Aboriginal Rights & Self-Government</h3>
    <p>Resources and readings from Theme 1 - Aboriginal Rights & Self-Government.</p>
  </div>
  <span class="unit-arrow" aria-hidden="true">›</span>
</button>
```

```css
.unit-card {
  width: 100%;
  display: grid;
  grid-template-columns: 96px 1fr auto;
  align-items: center;
  gap: 24px;
  min-height: 108px;
  padding: 0 28px 0 20px;
  text-align: left;
  color: var(--as-text-primary);
  background:
    linear-gradient(90deg, rgba(15,42,38,0.80), rgba(16,24,32,0.96)),
    var(--as-bg-700);
  border: 1px solid rgba(184,115,71,0.42);
  border-radius: var(--as-radius-md);
  box-shadow: var(--as-shadow-card);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.unit-card::before {
  content: "";
  position: absolute;
  left: 94px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--as-turquoise), var(--as-copper));
}

.unit-card:hover {
  border-color: rgba(25,193,183,0.70);
  transform: translateY(-1px);
  box-shadow: var(--as-glow-teal);
}

.unit-card:focus-visible {
  outline: 3px solid var(--as-focus);
  outline-offset: 3px;
}

.unit-badge {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: var(--as-turquoise);
  font-weight: 900;
  font-size: 1.35rem;
  border: 1px solid rgba(184,115,71,0.65);
  box-shadow:
    0 0 0 6px rgba(25,193,183,0.07),
    inset 0 0 0 1px rgba(25,193,183,0.25);
}

.unit-arrow {
  font-size: 2.4rem;
  color: var(--as-copper);
}
```

## Locked state support

```css
.unit-card.locked {
  cursor: not-allowed;
  opacity: 0.62;
}

.unit-card.locked .unit-copy {
  filter: blur(1.5px);
}

.unit-card.locked::after {
  content: "Locked";
  position: absolute;
  right: 24px;
  top: 18px;
  color: var(--as-text-muted);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
```

---

# 11. Individual Theme Page

Each theme page must include:

- Back to Units
- Theme title
- Theme description
- Compact Resources section
- Student activity section if applicable
- Mark Complete button

## Theme 1 resource list

Theme 1 resources must be ordered exactly:

```txt
Chapter 1 — Open Chapter
Walking Together: The Oral Tradition — Open
Road Allowance People — Watch
Metis Self-Governance — Watch
```

## Resource row pattern

Rows must visibly look clickable.

```html
<a class="resource-row" href="#">
  <div>
    <span class="resource-type">Chapter</span>
    <h3>Chapter 1</h3>
    <p>Begin the Theme 1 textbook reading.</p>
  </div>
  <span class="resource-action">Open Chapter</span>
</a>
```

```css
.resource-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 20px;
  color: var(--as-text-primary);
  text-decoration: none;
  background: rgba(16, 24, 32, 0.82);
  border: 1px solid var(--as-border-subtle);
  border-radius: var(--as-radius-md);
  transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
}

.resource-row:hover,
.resource-row:focus-visible {
  background: rgba(15, 61, 63, 0.34);
  border-color: var(--as-border-teal);
  box-shadow: var(--as-glow-teal);
}

.resource-action {
  flex: 0 0 auto;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  padding: 0 16px;
  border-radius: 999px;
  background: rgba(25,193,183,0.14);
  color: var(--as-turquoise-soft);
  border: 1px solid rgba(25,193,183,0.45);
  font-weight: 800;
}
```

---

# 12. Theme 1 Questions Online Booklet

This page is one of the most important screens. It must look like a clean web-native worksheet, not a PDF import.

## Page title

```txt
Theme 1 Questions
```

## Required features

Support:

- Section labels
- Source references
- Numbered questions
- Fill-in-the-blank inputs
- Multiple-choice choices
- Long-answer response boxes
- Fillable chart/table questions
- Prompt-specific video/reading resource cards
- Copy Responses action
- Autosave status text

## Do not include

- Inline booklet images
- Raw PDF screenshots
- Manually resizable textareas
- Backend/import labels
- Teacher/admin notes

## Worksheet layout

```html
<section class="worksheet-page">
  <header class="worksheet-header">
    <div>
      <span class="eyebrow">Online Booklet</span>
      <h2>Theme 1 Questions</h2>
      <p>Complete the questions below. Your responses save automatically.</p>
    </div>

    <div class="worksheet-actions">
      <span class="autosave-status">Saved automatically</span>
      <button class="secondary-button">Copy Responses</button>
    </div>
  </header>

  <article class="question-section">
    <div class="section-header">
      <span class="section-pill">Section 1</span>
      <h3>Aboriginal Rights and Self-Government</h3>
      <p>Source: Textbook Chapter 1, pages 1–8</p>
    </div>

    <div class="question-card">
      <div class="question-number">1</div>
      <div class="question-body">
        <label for="q1">Define self-government in your own words.</label>
        <textarea id="q1" class="auto-grow-textarea" rows="4"></textarea>
      </div>
    </div>
  </article>
</section>
```

## Worksheet styling

```css
.worksheet-page {
  display: grid;
  gap: 24px;
}

.worksheet-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  padding: 28px;
  border-radius: var(--as-radius-lg);
  border: 1px solid var(--as-border-copper);
  background:
    linear-gradient(135deg, rgba(15,42,38,0.9), rgba(11,21,32,0.94)),
    var(--as-bg-800);
}

.question-section {
  border: 1px solid var(--as-border-subtle);
  border-radius: var(--as-radius-lg);
  background: rgba(16,24,32,0.74);
  overflow: hidden;
}

.section-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--as-border-subtle);
  background: rgba(15,61,63,0.22);
}

.section-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  color: var(--as-turquoise-soft);
  background: rgba(25,193,183,0.12);
  border: 1px solid rgba(25,193,183,0.35);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.question-card {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 18px;
  padding: 22px 24px;
  border-bottom: 1px solid rgba(242,233,216,0.08);
}

.question-number {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: var(--as-turquoise);
  border: 1px solid rgba(184,115,71,0.55);
  font-weight: 900;
}

.question-body label,
.question-prompt {
  display: block;
  margin-bottom: 12px;
  color: var(--as-text-primary);
  font-weight: 700;
  line-height: 1.45;
}
```

## Inputs

```css
.text-input,
.auto-grow-textarea,
.table-answer-input {
  width: 100%;
  color: var(--as-text-primary);
  background: rgba(7,16,22,0.72);
  border: 1px solid rgba(242,233,216,0.16);
  border-radius: var(--as-radius-sm);
  padding: 12px 14px;
  font: inherit;
  line-height: 1.5;
}

.auto-grow-textarea,
.table-answer-input {
  resize: none;
  min-height: 112px;
  max-height: 360px;
  overflow-y: auto;
}

.text-input:focus,
.auto-grow-textarea:focus,
.table-answer-input:focus {
  outline: 3px solid rgba(111,231,220,0.45);
  border-color: var(--as-turquoise);
}
```

## Auto-grow textarea behavior

Implement JS or framework equivalent:

```js
function autoGrowTextarea(textarea) {
  textarea.style.height = "auto";
  const nextHeight = Math.min(textarea.scrollHeight, 360);
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > 360 ? "auto" : "hidden";
}

document.querySelectorAll(".auto-grow-textarea, .table-answer-input").forEach((textarea) => {
  autoGrowTextarea(textarea);
  textarea.addEventListener("input", () => autoGrowTextarea(textarea));
});
```

## Multiple choice

```html
<fieldset class="choice-group">
  <legend>Choose the best answer.</legend>

  <label class="choice-option">
    <input type="radio" name="q2" value="a" />
    <span>A. Option text here</span>
  </label>
</fieldset>
```

```css
.choice-group {
  border: 0;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.choice-option {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px;
  border: 1px solid rgba(242,233,216,0.12);
  border-radius: var(--as-radius-sm);
  background: rgba(7,16,22,0.44);
  cursor: pointer;
}

.choice-option:hover {
  border-color: rgba(25,193,183,0.45);
  background: rgba(15,61,63,0.22);
}
```

## Fillable chart/table

```css
.worksheet-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--as-border-subtle);
  border-radius: var(--as-radius-md);
}

.worksheet-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
}

.worksheet-table th,
.worksheet-table td {
  padding: 14px;
  border-bottom: 1px solid rgba(242,233,216,0.10);
  vertical-align: top;
}

.worksheet-table th {
  color: var(--as-text-primary);
  background: rgba(15,61,63,0.32);
  text-align: left;
}
```

---

# 13. Assignments Screen

Assignment cards must be student-facing and clean.

## Each card includes

- Assignment title
- Theme/unit association
- Short summary
- Status/completion affordance
- Buttons:
  - View Assignment
  - Download DOCX
  - Open Source only when useful

Avoid backend wording.

## Pattern

```html
<article class="assignment-card">
  <div class="assignment-meta">Theme 1</div>
  <h3>Assignment Title</h3>
  <p>Complete this assignment after reviewing the Theme 1 resources.</p>

  <div class="assignment-footer">
    <span class="status-pill">Not Started</span>
    <div class="button-row">
      <button>View Assignment</button>
      <button class="secondary-button">Download DOCX</button>
    </div>
  </div>
</article>
```

```css
.assignment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}

.assignment-card {
  display: grid;
  gap: 14px;
  padding: 22px;
  border-radius: var(--as-radius-lg);
  border: 1px solid var(--as-border-subtle);
  background: linear-gradient(180deg, rgba(16,24,32,0.96), rgba(15,42,38,0.62));
}
```

---

# 14. Library Screen

The Library works like the Sports Wellness Library, but with chapters instead of slides.

## Required items

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

## Each card includes

- Resource title
- Type label: Chapter, Textbook, or Glossary
- Primary button: View Chapter
- Secondary button: Download PDF

## Layout

```html
<section class="library-grid">
  <article class="library-card">
    <span class="resource-type">Chapter</span>
    <h3>Chapter 1</h3>
    <p>Open the chapter inside the course shell or download the PDF.</p>
    <div class="button-row">
      <button>View Chapter</button>
      <button class="secondary-button">Download PDF</button>
    </div>
  </article>
</section>
```

## PDF viewer

When a student chooses View Chapter, keep them inside the course shell.

```html
<section class="pdf-viewer-panel">
  <header>
    <button class="secondary-button">Back to Library</button>
    <div>
      <span class="eyebrow">Chapter</span>
      <h2>Chapter 1</h2>
    </div>
    <button>Download PDF</button>
  </header>

  <div class="pdf-frame-wrap">
    <iframe title="Chapter 1 PDF" src="chapter-1.pdf"></iframe>
  </div>
</section>
```

```css
.pdf-frame-wrap {
  height: min(78vh, 900px);
  min-height: 560px;
  border: 1px solid var(--as-border-subtle);
  border-radius: var(--as-radius-lg);
  overflow: hidden;
  background: #0B1520;
}

.pdf-frame-wrap iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
```

Mobile:

- Keep View Chapter available
- Provide Download PDF fallback
- Viewer may be shorter but must remain reachable

---

# 15. Film Room

Preserve the TV-style player concept, but use video/module language.

## Required wording

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

## Layout

Desktop:

- Large TV/player area left/top
- Video catalog panel right
- Now loaded panel beneath or beside
- Playlist dropdown
- External/unavailable state

```html
<section class="film-room">
  <div class="tv-panel">
    <div class="tv-screen">
      <!-- iframe/video/unavailable state -->
    </div>
  </div>

  <aside class="video-catalog">
    <label for="playlist">Playlist</label>
    <select id="playlist">
      <option>Theme 1</option>
      <option>Theme 2</option>
      <option>Theme 3</option>
      <option>Theme 4</option>
    </select>

    <button class="video-row">Walking Together: The Oral Tradition</button>
    <button class="video-row">Road Allowance People</button>
    <button class="video-row">Metis Self-Governance</button>
  </aside>
</section>
```

```css
.film-room {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 24px;
}

.tv-panel {
  padding: 18px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, #202A2E, #080D11);
  border: 1px solid rgba(184,115,71,0.55);
  box-shadow: var(--as-shadow-panel);
}

.tv-screen {
  aspect-ratio: 16 / 9;
  border-radius: 18px;
  overflow: hidden;
  background:
    radial-gradient(circle at center, rgba(25,193,183,0.12), transparent 60%),
    #020609;
  border: 1px solid rgba(242,233,216,0.12);
}
```

## External/unavailable video state

```html
<div class="video-unavailable">
  <h3>Video opens from an external source</h3>
  <p>This video cannot be embedded here, but you can open it using the source link.</p>
  <a class="primary-button" href="#">Open Source</a>
</div>
```

---

# 16. Quiz Screen

The Quiz screen can be a placeholder/list view, but it must look intentional.

Use:

- Section title: `Quizzes`
- Empty state if no quizzes are ready
- Optional quiz cards if present
- Student-facing wording

Example:

```txt
Quizzes
No quizzes are available yet.
When a quiz is ready, it will appear here with instructions and a start button.
```

Do not use backend/admin language.

---

# 17. Buttons and Status Pills

## Primary button

```css
.primary-button,
button:not(.secondary-button):not(.ghost-button) {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid rgba(25,193,183,0.55);
  background: linear-gradient(135deg, rgba(25,193,183,0.95), rgba(15,107,102,0.95));
  color: #04100F;
  font-weight: 900;
  cursor: pointer;
}
```

## Secondary button

```css
.secondary-button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid rgba(184,115,71,0.55);
  background: rgba(184,115,71,0.10);
  color: var(--as-text-primary);
  font-weight: 800;
  cursor: pointer;
}
```

## Status pill

```css
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(184,115,71,0.55);
  color: var(--as-text-secondary);
  background: rgba(7,16,22,0.45);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.status-pill::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--as-copper);
}
```

---

# 18. Accessibility Requirements

Implement:

- Visible `:focus-visible` states on all interactive elements
- Real `<button>` elements for actions
- Real `<a>` elements for navigation/resources
- Labels for inputs and textareas
- Minimum 44px touch targets
- Strong text contrast
- No tiny low-contrast metadata
- No text overlap on mobile
- No manually resizable long-answer boxes
- Tables scroll horizontally or convert to stacked cards on mobile

Global focus rule:

```css
:focus-visible {
  outline: 3px solid var(--as-focus);
  outline-offset: 3px;
}
```

Reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
  }
}
```

---

# 19. Mobile Requirements

At mobile widths:

## Sidebar

- Convert to top app bar or drawer
- Keep course title visible
- Navigation reachable with menu button
- Active nav visible

## Units

- Unit cards stack
- Badge and title remain readable
- Cards remain touch-safe

## Theme pages

- Resource rows stack vertically
- Action buttons move below title text

## Worksheet

- Questions become single-column
- Tables scroll horizontally or stack
- Long answers remain auto-growing with max height
- Copy Responses remains reachable

## Library/PDF

- Cards stack
- PDF viewer has Download PDF fallback
- Viewer does not break layout

## Film Room

- TV player appears before catalog
- Catalog stacks below
- Playlist dropdown full width

```css
@media (max-width: 700px) {
  .unit-card {
    grid-template-columns: 58px 1fr;
    padding: 18px;
  }

  .unit-arrow {
    display: none;
  }

  .worksheet-header,
  .resource-row,
  .assignment-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .question-card {
    grid-template-columns: 1fr;
  }

  .film-room {
    grid-template-columns: 1fr;
  }
}
```

---

# 20. Agent Implementation Plan

## Step 1 — Audit current files

Find the current shell files/components for:

- Sidebar
- Main app layout
- Units view
- Theme page
- Questions/booklet page
- Assignments
- Library
- PDF viewer
- Film Room
- Quiz page
- Shared buttons/cards/forms

Do not guess. Inspect existing structure first.

## Step 2 — Add theme tokens

Create or update the main stylesheet with the design tokens in this spec.

Prefer one centralized theme file, for example:

```txt
src/styles/aboriginal-studies-theme.css
```

or update the existing equivalent stylesheet.

## Step 3 — Restyle global shell

Apply:

- Dark background
- Fixed/sticky sidebar
- Scrollable main content
- New typography
- New color tokens
- New focus states

## Step 4 — Rebuild sidebar presentation only

Keep existing nav behavior but restyle:

- Course title
- AS badge
- Active nav
- Nav icons
- Google sign-in/sync area
- Footer phrase

## Step 5 — Units home

Implement the progress hero and four unit cards.

## Step 6 — Theme page

Implement the resources section, Theme 1 resource ordering, Mark Complete, Back to Units.

## Step 7 — Theme 1 Questions

Build the web-native worksheet layout.

Important:

- Textareas must auto-grow
- Textareas must not be manually resizable
- Max height with internal scroll
- Autosave status displayed
- Copy Responses action included
- No inline booklet images

## Step 8 — Assignments

Restyle assignment cards using student-facing language.

## Step 9 — Library and PDF viewer

Implement chapter cards and in-shell PDF viewer.

## Step 10 — Film Room

Preserve TV/player concept but replace tape language with video/module language.

## Step 11 — Responsive pass

Test mobile layout at:

```txt
390px
768px
1024px
1440px
```

## Step 12 — Proof gate

Return evidence:

- Screenshot of Units home desktop
- Screenshot of Theme 1 page
- Screenshot of Theme 1 Questions
- Screenshot of Library/PDF viewer
- Screenshot of Film Room
- Screenshot or browser proof of mobile layout
- List of changed files
- Build/test command output

---

# 21. Codex / Agent Prompt

Paste this to the coding agent.

```txt
You are working in the existing Aboriginal Studies 30 course-shell project.

Goal:
Implement the new Canadian Indigenous-inspired dark course-shell design described in `aboriginal-studies-30-agent-ready-design-implementation.md`.

Do not create a generic landing page. This is a student-facing online course shell. Preserve the existing course structure, navigation, routing, state, and interaction model unless a change is required to implement the redesign.

Hard requirements:
- Course title must read ABORIGINAL STUDIES 30.
- Primary nav must include only Units, Quizzes, Assignments, Library, Film Room.
- Do not include Phases, Performance, Sports Wellness, Course Information, answer keys, admin comments, backend/source-system wording, or conversion notes.
- Use four units:
  1. Theme 1 - Aboriginal Rights & Self-Government
  2. Theme 2 - Aboriginal Land Claims
  3. Theme 3 - Aboriginal Peoples in Canadian Society
  4. Theme 4 - Aboriginal World Issues
- Theme 1 resources must include Chapter 1 first, then Walking Together: The Oral Tradition, Road Allowance People, and Metis Self-Governance.
- Theme 1 Questions must become a clean web-native worksheet, not a PDF dump.
- Long-answer and table-answer fields must not be manually resizable. They should auto-grow vertically as students type and cap at a stable max height with internal scrolling.
- Library must use Chapter cards with View Chapter and Download PDF buttons.
- Film Room must preserve the TV/player concept but use video/module language, not tape language.
- Design must be respectful, restrained, readable, and production-quality.

Implementation approach:
1. Inspect the current project structure first.
2. Identify the current components/styles for shell, sidebar, Units, Theme page, Questions, Assignments, Library, PDF viewer, Film Room, and Quiz.
3. Add centralized CSS variables/tokens from the design spec.
4. Restyle the existing shell rather than replacing working logic.
5. Implement responsive behavior for desktop/tablet/mobile.
6. Add accessible focus states, labels, real buttons/links, and 44px minimum touch targets.
7. Avoid culturally specific sacred symbols or stereotyped pan-Indigenous decoration. Use abstract geometric, topographic, landscape, and subtle botanical motifs only.

Visual target:
Match the generated design concept as closely as possible:
- Deep navy/charcoal/forest green background
- Cream text
- Copper borders and dividers
- Turquoise/teal active states
- Subtle beadwork-inspired geometric pattern strips
- Topographic contour overlays
- Premium course-shell UI
- Large elegant progress card
- Rich horizontal unit cards
- Polished sidebar navigation
- Clean worksheet forms

Proof required before final response:
- Run the project build/lint/test command available in the repo.
- Provide the exact command output.
- Provide screenshots or browser-preview proof for:
  1. Units home desktop
  2. Theme 1 page
  3. Theme 1 Questions worksheet
  4. Library/PDF viewer
  5. Film Room
  6. Mobile layout
- Provide a changed-files list.
- State anything not completed or any assumptions made.
```

---

# 22. Acceptance Checklist

The redesign is acceptable only if all of these are true:

## Navigation/content

- [ ] Course clearly reads as Aboriginal Studies 30.
- [ ] Sidebar uses Units, Quizzes, Assignments, Library, Film Room only.
- [ ] No Phases section appears.
- [ ] No Performance section appears.
- [ ] No Sports Wellness label remains.
- [ ] No answer key/admin/source-system language appears.

## Units/theme flow

- [ ] Units home has four themes.
- [ ] Unit cards are visibly clickable.
- [ ] Theme pages have Back to Units.
- [ ] Theme pages have Mark Complete.
- [ ] Theme 1 resources show Chapter 1 first.

## Theme 1 Questions

- [ ] Looks like a clean digital worksheet.
- [ ] Uses section labels and source references.
- [ ] Supports numbered questions.
- [ ] Supports fill-in-the-blank.
- [ ] Supports multiple choice.
- [ ] Supports long answer.
- [ ] Supports fillable chart/table questions.
- [ ] Includes Copy Responses.
- [ ] Includes autosave status.
- [ ] Textareas are not manually resizable.
- [ ] Textareas auto-grow and cap at a stable max height.
- [ ] No inline booklet images appear.

## Assignments

- [ ] Assignment cards have clear hierarchy.
- [ ] Buttons include View Assignment.
- [ ] Buttons include Download DOCX.
- [ ] Open Source only appears when useful.
- [ ] No backend wording appears.

## Library/PDF

- [ ] Library includes Chapter 1–7.
- [ ] Library includes Textbook.
- [ ] Library includes Glossary.
- [ ] Buttons say View Chapter and Download PDF.
- [ ] PDF opens inside the course shell.
- [ ] Download fallback exists.

## Film Room

- [ ] TV/player concept remains.
- [ ] Uses Film Room, Video catalog, Playlist, Now loaded.
- [ ] Uses Theme 1–4 labels.
- [ ] Does not use Tape/Tapes language.
- [ ] External/unavailable video state exists.

## Visual/accessibility

- [ ] Dark premium UI matches the mockup direction.
- [ ] Cream/copper/turquoise/forest palette is implemented.
- [ ] Active nav state is clear.
- [ ] Resource links look clickable.
- [ ] Focus states are visible.
- [ ] Text contrast is strong.
- [ ] Mobile layout is usable.
- [ ] Buttons are touch-safe.
- [ ] No text overlap at small widths.

---

# 23. Final Design Principle

The redesign should look finished enough that a student believes this is the actual Aboriginal Studies 30 course environment, not a temporary converted shell.

The goal is not decoration. The goal is clarity, seriousness, respect, and a stronger learning experience.
