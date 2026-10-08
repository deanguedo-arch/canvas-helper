# 02 — Product and visual system

## Intended outcome
A student opens Writing Studio, immediately sees their work, continues a draft, consults their plan/evidence without leaving the writing surface, revises deliberately and exports a submission. They can start from a blank page. The tool supports their writing; it does not write, score or submit for them.

## MVP capability boundary
Include project create/rename/duplicate/archive/restore/remove; project metadata; flexible planning; sources/evidence; schema-based rich text; six revision passes; manual feedback and notes; an offline-bundled guide library; full/project backup and validated import; draft TXT/HTML/print export; save/recovery status; scoped local checkpoints; responsive keyboard-accessible controls.

Exclude real-time collaboration; AI generation; teacher dashboard; automated LMS assignment/feedback retrieval; cloud file APIs; search across other learners; learning analytics beyond bounded local counts; arbitrary attachments; a complete Word clone; paid editor plugins; essay grading; timed/high-security exam claims. DOCX is a later optional exporter, not a mislabeled HTML file. PDF means a real browser print/save-as-PDF flow, not an invented PDF download.

## Navigation
Global left rail: Home, Projects, Feedback notes, Writing Library, Help, Settings. Do not duplicate every project tab in global navigation. Global Feedback notes is an aggregate of learner-entered notes; selecting one opens its project context.
Project workspace tabs: Overview, Plan, Evidence, Draft, Revision, Notes. Notes includes optional project-specific feedback. Global navigation always remains distinguishable from project navigation. Home's “Continue” goes to the most recently edited non-archived project's last meaningful view (Draft by default).

## Visual authority
The canonical uploaded planning/settings images win. Use `design/tokens.css` and `design/components.css` as the concrete starting system. Measurements below are CSS pixels at 100% browser zoom and are design decisions, not pixel measurements promised from generated images.

Palette: ink `#171C1A`; muted text `#535D58`; primary `#124B38`; primary-hover `#0C3B2B`; primary-soft `#EAF2EC`; background `#F7F8F6`; surface `#FFFFFF`; border `#D9DFDA`; control-border `#7B897F`; sage `#DCE9DD`; pale gold `#F6ECD4`; warning ink `#70520C`; error ink `#A12A2A`; focus `#176E50`.

Typography: UI/body system sans `Arial, Helvetica, sans-serif`; if authorized local files are available, Hanken Grotesk for headings and Work Sans for UI. Font files are not included in this handoff. No live font request. Display heading 38/42 px, weight 750–800, tracking -0.025em; page heading 30/36; section 22/28; card heading 18/25; body 16/24; metadata 13/19. Student prose defaults Georgia/serif at 19/32 with a sans preference; export uses the student's editor setting. Do not shrink all UI to fit a screenshot.

Spacing: base 4 px; use 8/12/16/24/32/40. Card radius 6 px; input/button radius 4 px; semantic pill radius 999 px only for tags/status. Cards have a 1px neutral line, at most a minimal shadow. No frosted glass, ornamental texture behind draft text, floating furniture, thick green card borders or large motivational banners. Decorative branch may appear in one empty state or small help panel; it is never necessary to use the tool.

Shell: local topbar 56 px; wide left rail 224 px; content outer padding 28–32 px; context rail 304 px; gaps 24 px. At 1440 px, Plan uses a two-column card grid in the centre and a right context rail. At 1366/1024 px, collapse the context rail before crushing the editor. At 390 px use one column and a navigation drawer. See accessibility contract for exact breakpoints.

## Components
Button: min-height 44 px; primary green/white; secondary white/control-border; destructive white/red until final confirmation; no icon-only action without an accessible name. Busy retains width and text. Disabled has a reason adjacent or in help text; do not use tooltips as the only explanation.

Card: heading first, body next, action last; 20–24 px padding; no nested card stacks deeper than two. Editable planner card shows a real label, help text and edit affordance; save/cancel are per editor panel, not hidden on click-away.

Input: 16 px text; 44 px minimum one-line height; label always visible; helper text linked via aria-describedby. Validation inline after blur/submit, not aggressive error flashes while typing. Errors preserve field values.

Tabs: one active indicator, accessible tablist semantics when panels switch in-place; keyboard arrows/Home/End; long labels may horizontal-scroll **within the tab strip**, never the whole page. Real links are acceptable for routes; do not falsely label route links as tabs without implementing their keyboard pattern.

Progress: use counts and optional semantic SVG ring from runtime values. Home shows project status counts only. Project stage count derives from checked/NA review milestones. No hard-coded 60%, grade fraction or quality score. All numbers in preview are synthetic examples.

Save indicator: one authoritative status in the topbar plus detail panel in Settings. Do not place conflicting success badges in three corners. Status must update by the persistence state machine. Decorative icons use aria-hidden; the text communicates meaning.

## Empty states
Friendly but not patronizing: “No projects yet. Start with a blank page or a guided plan.” Primary action New project; secondary Import backup. No stock-photo hero needed to make the first screen look finished. A project with zero words is allowed, not an error.

## Screen images versus code
Canonical images define appearance, not technical capabilities. The production UI must not include D2L's outer header, fabricated profile identity, screen-reader toggle, “Your work is safe” absolute claim, unlimited save history or Turn In button. The unified preview demonstrates this corrected composition, but is not functional source for saving or editing.
