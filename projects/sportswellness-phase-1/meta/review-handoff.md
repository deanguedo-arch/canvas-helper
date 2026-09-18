# Current review handoff

The 2026-09-17 CTS audit repairs supersede the historical notes below. Open [cts-audit-repair-handoff.md](cts-audit-repair-handoff.md) for current sources, checks and rollout deferrals. The game is no longer byte-for-byte unchanged; its original chase mechanics are retained with audited lifecycle/feedback repairs. PDFs and the legacy picker are withheld; backup recovery lives in the course guide.

# Phase 1 learner review

Open `workspace/index.html` through Canvas Helper Studio and review the five added learner routes: Checkpoint, Performance game, Untimed alternative, Process Collection, and Resources & videos.

The original twelve-topic teaching sequence, response fields, formative checks, written review, lab, Regulation Engine, figures, captions, and alt text are preserved. The checkpoint retains all ten stable IDs and changes only the five items recorded in `checkpoint-content-review.json`.

Save and Exit saves in the current browser. Assignment and process exports create learner files; they do not submit work. The course is blocked, Studio Edit is disabled, and SCORM/export/deployment work is deferred.

Review attention should focus on the five revised checkpoint items, game wording and debrief, the untimed alternative, and suitability of the four optional video placements. The response-capacity blocker in `state-budget-report.json` must be resolved before SCORM rollout.

The first browser-comment pass is complete. The Course Phases sidebar group and checkpoint notice were removed. Checkpoint questions, the untimed scenario, and video resources now use inset cards, and the resources route includes a dedicated in-page video player plus a new-tab link.

The second browser-comment pass is complete. Collapsing the desktop sidebar now reveals a top-bar control that reopens it. The game controls, Process Collection exports, and resource links are inset from the content edge.

The third browser-comment pass is complete. The sidebar no longer repeats reviewed-progress or browser-storage notices. The Phase 1 game now runs byte-for-byte copies of the original game HTML, application, scale helper, and theme through a local React and CSS loader. The added outer controls and message adapter were removed; use the original game’s native Begin Simulation, Breathe, Activate, and Restart Simulation controls.

The learning-resource enrichment pass is complete. Every one of the 12 teaching topics now has a collapsed Learn another way section with publisher, purpose, focus, after prompt, unavailable fallback, and a link back to the existing learner response. YouTube resources share the course's existing click-to-load privacy player; non-YouTube media opens on the publisher site. The Resources route builds its grouped video and reading index by scanning canonical lesson HTML. No response field or state schema was added. The exact supplied enrichment HTML is preserved under `projects/resources/sportswellness-phase-1/reference/`, and `learning-support-review.json` records the implementation and resource inventory.

The student-navigation pass is complete. The sidebar now presents one visible chronological 01–12 path with non-collapsible section labels, places My Regulation Engine before Phase 1 review, and keeps Final checkpoint after the numbered path. My Work and Resources are utilities. The simulator and equivalent untimed practice remain directly addressable and now appear as choices inside Topic 10. A contextual Continue control uses the existing learner-controlled reviewed state to point to the first unfinished numbered topic, then the final checkpoint. Desktop collapse/reopen and the existing mobile drawer/focus behavior are preserved. See `navigation-review.json` for the preserved interfaces and route mapping.

The navigation guidance pass adds concise directions under Learn, Practice, Build, Review, and My Tools. The labelled menu trigger remains visible on mobile; when the desktop sidebar is collapsed, the trigger uses its menu icon and accessible label without wrapping text into the header.

The follow-up navigation pass removes the sidebar progress and Continue block. How-to directions now live in their own collapsible sidebar group with a link to the full Overview guide, and Start, Learn, Practice, Build, Review, and My Tools are each independently collapsible. The group containing the current route opens automatically.

The learner-guidance pass expands the Overview into a six-step walkthrough covering Start, Learn, Practice, Build, Review, My Tools, completion, and saved work. Learn, Practice, Build, and Review each have a collapsible on-page completion guide with sequenced actions and expected work; every corresponding sidebar group links directly to its guide.

The course-guide refinement makes How to use this phase a dedicated learner route opened directly from the sidebar; the sidebar mini-guide and redundant open-guide link are removed. Every numbered topic now begins with a closed How to complete this section panel. The 12 panels give stage-appropriate steps and expected work while preserving the numbered route, review marker, and saved-response contracts.

The My Work and My Notes refinement removes the two end-of-section submission and teacher-check-in panels. My Work is now the clear automatic collection point for saved course responses, revisions, practice records, checkpoint attempts, and exports. My Notes is a separate persistent scratch pad available from the sidebar and every topic footer; its existing `notebook-notes` field ID and state contract are preserved. Backup, restore, and clear-work controls now live on My Work.

The simplified My Work pass reduces the route to its automatically collected phase work and one Print or save My Work as PDF action, with consistent inset spacing. Quick Notes is now a persistent floating course control. Saving the composer creates separate timestamped entries, clears the composer, restores entries after reload, and lists them in My Work. Existing single-note state migrates into the entry list without changing the 72-field inventory or version-2 storage key.

Each Quick Notes entry now has a Delete action. The most recently deleted note can be restored immediately with Undo; delete and undo both save locally and refresh the My Work collection.

The course-guide sidebar label now uses the same horizontal inset as the Start, Learn, Practice, Build, Review, and My Tools headings.
