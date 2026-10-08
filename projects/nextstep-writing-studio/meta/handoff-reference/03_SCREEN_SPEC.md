# 03 — Screen-by-screen contract

All screens use the selected light shell. Routes are hash routes inside the SCO; do not derive storage ownership from a route. Modal routes represent the same accessible view on narrow screens. A concrete schema and the interaction contract determine data behaviour; mockup text never does.

## S00 — Restore gate
**Route:** `/#/restore`  
**Purpose:** Boot-only state; no student editing until identity, mode and payload are read.

**Layout/content.** Show “Opening your workspace…” with a single status region. Resolve SCORM API and configuration, then load/validate. No blank project is created during a spinner.

**Actions.** Success → S01/S02 or previous valid route. Missing API → explicit standalone/session mode; failed read, corrupt payload, wrong binding or newer schema → S19.

**Persistence.** Nothing mutates before restore resolves. A route hash never proves hydration.

**Required states.** Loading; API unavailable; review/browse mode; invalid configuration; corrupt/future payload.

## S01 — First launch / no projects
**Route:** `/#/home`  
**Purpose:** A confirmed empty workspace, not a failed read.

**Layout/content.** Light shell, “Your writing starts here”, New project and Import backup. Short save-location explanation and local-recovery policy. Never preload sample essays into a real account.

**Actions.** New project → S04. Import backup → S18. Writing Library → S14.

**Persistence.** A workspace is created only after valid empty LMS read and explicit first action; persist settings/project normally.

**Required states.** Zero projects; no persistent cache permission; known fresh LMS attempt with orphan local cache goes to S19 first.

## S02 — Home
**Route:** `/#/home`  
**Purpose:** Returning learner overview.

**Layout/content.** Continue card with last edited project title, draft word count, status, last edit time. Recent project rows/cards. Small counts of active/archived projects and up to five activity events. Primary New project.

**Actions.** Continue → last meaningful project view, default S09. Project card → S05. View all → S03.

**Persistence.** Derived counts only; activity coalesces repetitive draft edits to at most one entry per project per session.

**Required states.** All projects archived; current project removed; long titles; no recent activity.

## S03 — Project library
**Route:** `/#/projects`  
**Purpose:** All projects within this workspace.

**Layout/content.** Search title/prompt, filters All/Active/Archived and project type; sort modified/title/created. Three cards per row wide, two medium, one narrow. Project card: type/title/status/word count/time/menu.

**Actions.** Open, New, Rename, Duplicate, Archive/Restore, Export, Export and remove through S20. Search is local and never queries the LMS.

**Persistence.** Filters are UI preferences; no copied draft text in cards beyond a short derived excerpt. Archive retains content and storage.

**Required states.** No projects; no matches; limit reached; long titles; duplicate titles permitted with distinct IDs.

## S04 — New project
**Route:** `/#/projects/new`  
**Purpose:** Accessible dialog wide; full page on narrow screens.

**Layout/content.** Title required (1–160 characters after trim); type required; prompt/word target/due date/criteria optional. Show five starter types plus Blank, with track-neutral descriptions. Diploma practice is a practice flag, not a secure mode.

**Actions.** Create validates → constructs empty typed record → save → S05. Cancel preserves a temporary form only while dialog remains open; dirty Cancel asks discard/continue.

**Persistence.** No template-generated thesis or essay. Copy only template field labels/prompts and revision checklist version.

**Required states.** Invalid title, large prompt, invalid target, storage blocked, form unsaved on exit.

## S05 — Project overview
**Route:** `/#/project/:id/overview`  
**Purpose:** Project header and task metadata.

**Layout/content.** Editable title; type; optional prompt, word goal, due date and criteria text. Five review milestones with explicit Mark done/Not applicable controls. Clear Open draft action.

**Actions.** Edit details → form; project tabs → corresponding views. Mark ready updates project status, not SCORM completion or assignment submission.

**Persistence.** Statuses are planning/drafting/revising/ready; archive stored separately. Word goal is optional and not a grade.

**Required states.** No prompt or criteria; user-added criteria; all milestones NA displays “No milestones selected”, not 100%.

## S06 — Planning
**Route:** `/#/project/:id/plan`  
**Purpose:** Canonical visual layout.

**Layout/content.** Two-column editable planning cards. Personal/analytical defaults: controlling idea, key insight, supporting points, opening, closing, extra notes. Narrative switches labels to focus/change, character/perspective, key moments, opening, ending. Blank starts with Add planning note.

**Actions.** Edit opens inline labeled field with Save/Cancel. Add/reorder supporting points via buttons; optional drag has equivalent controls. Open draft does not generate prose.

**Persistence.** Save updates plan sections, preserving IDs/order. Changing template is explicit and keeps existing sections under a retained section; never remap student text silently.

**Required states.** Empty fields with optional prompts; long note; edit cancelled; template changed after writing.

## S07 — Evidence vault
**Route:** `/#/project/:id/evidence`  
**Purpose:** Project evidence collection, not mandatory for every genre.

**Layout/content.** Search content/analysis/source title/tags; filters Quote/Paraphrase/Scene/Personal example/Other. Cards show content, source+locator if present, analysis and tags. No decorative photo on every evidence note.

**Actions.** Add/Edit → S08. Use in draft → choose insertion at caret on returning to S09 and preview. Remove confirms if referenced. Source edit stays explicit.

**Persistence.** Evidence is project-owned. “Copy to project” duplicates selected record/source with fresh IDs. Original remains unchanged.

**Required states.** No evidence; missing source; verbatim claim unverified; personal example without citation; missing draft block reference.

## S08 — Evidence/source editor
**Route:** `/#/project/:id/evidence/new`  
**Purpose:** Accessible form/dialog.

**Layout/content.** Type, content required; source title, author/creator, locator/page/line, URL, analysis and tags optional. Direct quotes show “Check this against your source”; a checkbox marks student verification, not automated validation.

**Actions.** Save → S07; Save and use → S09 insertion preview; Cancel dirty form warns. Add source is inline, not a cloud file picker.

**Persistence.** Store text verbatim. Never auto-add quotation marks, invented author names, citations or page numbers. Source links limited to https/http; opening is a deliberate action.

**Required states.** Empty content; invalid URL; duplicate source title; overlength field; removed source referenced by evidence.

## S09 — Draft editor
**Route:** `/#/project/:id/draft`  
**Purpose:** Primary work surface.

**Layout/content.** Project title above a minimal toolbar; clear editor body; optional context rail with tabs Prompt/Plan/Evidence/Revision. Word count, Focus, Export. One save indicator. No forced header or student legal name inside document.

**Actions.** Rich editing per editor contract. Insert evidence is explicit and previewable. Export → S17. Focus → S10.

**Persistence.** Structured document is source of truth. Save generation tokens must cover the latest accepted editor transaction.

**Required states.** Empty draft; formatted paste; IME; local-only; cloud pending; read-only review mode; large document.

## S10 — Focus editor
**Route:** `/#/project/:id/focus`  
**Purpose:** Same document and editor instance, not a clone.

**Layout/content.** Hide global nav and context rail. Keep compact Back/Exit focus, project title, save state, word count and Export. Writing area max 72 characters wide.

**Actions.** Escape exits focus when not composing and no dialog is open; button always works. Screen-reader/keyboard navigation remains available.

**Persistence.** No second document state or separate autosave loop; caret/undo/history preserved across mode switch.

**Required states.** Mobile keyboard; high contrast; no fullscreen API permission; save failure must stay visible.

## S11 — Revision lab
**Route:** `/#/project/:id/revision`  
**Purpose:** Guided student review, not automatic marking.

**Layout/content.** Six passes: Ideas, Organization, Evidence, Analysis, Style, Conventions. Each has brief instructions, 3–5 check items, optional notes, and a read-only/live draft context depending on width.

**Actions.** Select pass; mark item reviewed or NA; edit revision note; Open draft at relevant block if available. Reopen a pass freely.

**Persistence.** Store check states and criterion IDs; progress counts applicable check items. Template controls wording, not hidden scoring.

**Required states.** Not started; all items NA; draft empty; draft changed after pass (show “Draft changed since review”); no source evidence for narrative.

## S12 — Project notes and feedback
**Route:** `/#/project/:id/notes`  
**Purpose:** Personal notes in project context.

**Layout/content.** Notes list with title/body/date; filters My notes / Feedback I received. Feedback has optional source/date and student action/handled checkbox. Label “Added by you”.

**Actions.** Add, edit, remove, mark addressed, open related draft block. Feedback text is pasted/typed manually.

**Persistence.** No teacher impersonation, reply thread, unread badge or claim that the teacher can see these notes.

**Required states.** No notes; long feedback; deleted related paragraph; no source attribution.

## S13 — Feedback notes overview
**Route:** `/#/feedback`  
**Purpose:** Workspace-level aggregation.

**Layout/content.** List learner-entered feedback notes grouped by project; filter Unaddressed/All; search notes; header explicitly explains that notes are copied in by the learner.

**Actions.** Open project note; Add feedback selects project then S12.

**Persistence.** No external fetch or inferred teacher identity. Counts computed from note status.

**Required states.** No feedback; archived project note; removed project not displayed.

## S14 — Writing and analysis library
**Route:** `/#/library`  
**Purpose:** Bundled universal resources.

**Layout/content.** Search and categories: Ideas/Structure/Evidence/Analysis/Style/Revision. Resource cards show title, short purpose and bookmark, not progress/grade percentage. Analysis Explorer is available as a library section.

**Actions.** Open → S15; bookmark; copy a blank planning prompt into a chosen project through confirmation.

**Persistence.** Guides are app content, not repeated in suspend_data. Save only guide IDs/bookmarks and optional learner notes.

**Required states.** No search results; unavailable optional legacy text examples; no current project selected.

## S15 — Guide / Analysis Explorer detail
**Route:** `/#/library/:guideId`  
**Purpose:** Instruction in small concept chunks.

**Layout/content.** Purpose, short explanation, original worked example, student try-it prompt, “Use this in my project”. Analysis Explorer allows a term and generic example; optional text-specific packs are labeled.

**Actions.** Bookmark; previous/next guide; return to project; copy prompt only. No automatic copying of model prose into a real draft.

**Persistence.** Practice response saved only after student chooses a project note. Resource reading is not scored.

**Required states.** Long guide; optional examples missing; generic mode; author-reviewed version updated.

## S16 — Settings and storage
**Route:** `/#/settings`  
**Purpose:** Canonical settings layout, corrected copy.

**Layout/content.** Save destination and precise status; wire budget; project/full export; import; local recovery policy; current-session save events; editor font/size/spacing; reduced motion/high contrast; app/schema/deployment info.

**Actions.** Export/import open S17/S18. Retry save runs coordinator, not API direct. Clear device copies affects only current verified learner/scope and confirms.

**Persistence.** Screen-reader support always on. Save log is app-recorded player responses, not a server audit history. Do not turn autosave off.

**Required states.** Local storage blocked; device cache disallowed; player accepted vs tenant-verified saved; capacity limits.

## S17 — Export draft / backup
**Route:** `/#/export`  
**Purpose:** Accessible options dialog.

**Layout/content.** Separate Draft document (TXT, standalone HTML, Print/PDF) from Project backup and Full Studio backup. Explain that only backup files re-import full project structures. Show scope/counts before action.

**Actions.** Generate file using current in-memory content. Print invokes a dedicated print layout. Download reports “Backup file created”, not proof the user stored it.

**Persistence.** Include unsynced changes; no export of learner binding or raw LMS ID. Mark backup checksum/schema; no embedded external resource loads.

**Required states.** Download blocked; print unavailable; empty draft; pending save; unsafe filename; recovery export raw data.

## S18 — Import and migration preview
**Route:** `/#/import`  
**Purpose:** Choose file → validate → preview → confirm.

**Layout/content.** Show file kind, schema, project count, affected items and conflicts. Default Merge as new projects. Replace whole workspace is advanced, requires current backup round-trip and explicit confirmation.

**Actions.** File picker accepts defined backup formats; cancel never changes workspace. On confirmation make candidate state, validate, local checkpoint, then commit via coordinator.

**Persistence.** Reassign conflicting IDs, source references and block anchors as specified. Preserve current workspace binding. Do not trust file MIME or filename alone.

**Required states.** Corrupt/checksum mismatch; unsupported schema; foreign scope backup (portable explicit import is allowed); over budget; repeated import; duplicate IDs.

## S19 — Recovery centre
**Route:** `/#/recovery`  
**Purpose:** Fail-safe route, always available from Help.

**Layout/content.** Explain exactly what failed. List only current verified learner/scope candidates with dates, counts and save status; allow preview/export. Do not show a different learner’s project titles.

**Actions.** Choose LMS copy / recover local as candidate / keep both / export raw / try load again. Recovery never auto-overwrites remote data.

**Persistence.** Preserve last-good and failed raw payloads. If identity cannot be established, no persistent local records are shown. Newer schema remains export-only.

**Required states.** API read failed; corrupt LMS; newer schema; empty remote with nonempty local; local-vs-remote conflict; no usable candidates.

## S20 — Project actions
**Route:** `/#/project/:id/manage`  
**Purpose:** Menu and confirmation dialogs.

**Layout/content.** Rename, duplicate, archive/restore, export, export and remove. Remove clearly states what will leave active LMS storage and whether a verified file was chosen.

**Actions.** Duplicate creates new IDs, clears activity/feedback-handled status only when explicitly chosen. Archive does not delete. Export-and-remove requires reselecting a valid backup of current project revision.

**Persistence.** Permanent removal is staged, with last-good recovery protected locally if policy allows. A denied save leaves a recoverable pending state and honest message.

**Required states.** Referenced evidence/source removal; stale backup chosen; duplicate too large; blocked download; protected unsynced work.

## S21 — Help and saving guide
**Route:** `/#/help`  
**Purpose:** Built-in help, no external dependency.

**Layout/content.** Explain one device at a time, what saving means, reopen verification, local limitations, backup versus document export, submitting in Brightspace and asking the teacher for help. Show app info and a metadata-only diagnostics button.

**Actions.** Open Recovery/Settings; copy diagnostic summary; open teacher-configured HTTPS support link only on explicit click.

**Persistence.** Diagnostics exclude student text, project titles, raw learner IDs and serialized workspace.

**Required states.** No LMS; review mode; copied course; wrong launch; no support URL configured.

## S22 — Second tab / editing conflict
**Route:** `/#/conflict`  
**Purpose:** Read-only protective overlay/page.

**Layout/content.** “This workspace is already open in another tab.” Explain the supported one-editor rule. For possible different-device conflicts, state that automatic prevention is not guaranteed.

**Actions.** Return to first tab; retry lock; close this view; export accessible current copy. No force takeover while a valid same-origin lock is held.

**Persistence.** Only one editor per binding in a browser origin; lock release on explicit exit/crash detection, never just because tab is hidden.

**Required states.** Lock held; abandoned tab; browsers without Web Locks; cross-device simultaneous launch not provably detectable.

## S23 — Storage warning / full
**Route:** `/#/settings/storage`  
**Purpose:** Inline warning plus management detail, not a destructive reset.

**Layout/content.** 44k warning; 50k urgent; >56k blocked cloud write. Show latest player-accepted revision/time versus unsynced current revision, and offer backup/manage projects.

**Actions.** Continue current editing within field limits; export newest content; remove only through verified-backup flow; retry when candidate fits.

**Persistence.** Never truncate, discard evidence/history/current draft silently, or replace a valid LMS payload with an empty/minimal one.

**Required states.** Large poorly compressible paste; oversized import; browser quota failure; raw-data cap; export fails.
