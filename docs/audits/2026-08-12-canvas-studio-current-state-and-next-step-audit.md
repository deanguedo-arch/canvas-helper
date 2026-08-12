# Canvas Studio Current-State and Next-Step Audit Brief

**Prepared for:** ChatGPT Pro / Terra Max independent audit

**Prepared:** August 12, 2026

**Repository:** `deanguedo-arch/canvas-helper`

**Implementation branch:** `codex/studio-roadmap-phases`

**Implementation commit:** `1ad3cc210ceb100e69be601bd21ba63d44a5033c`

**Final roadmap handoff commit:** `dc89ec969bfc8ee214a7a24c303df543beb9141e`

**Current roadmap status:** Phases A through H complete and pushed

## How to use this document

Attach this file to ChatGPT Pro and give it GitHub access to the repository and branch above. Then paste the copy-ready audit prompt at the end.

The implementation commits are already on GitHub. This audit brief is a new local document unless a later commit says otherwise, so attaching this file directly is the safest way to ensure the auditor reads the exact brief.

Ask ChatGPT Pro to verify every repository-dependent claim against the branch. Adviser recommendations are proposals until Codex confirms them locally against source ownership, current tests, and the active working tree.

---

## Audit boundary

This audit is about Canvas Studio as a universal, front-facing product for reviewing courses and preparing precise change requests for Codex.

It includes:

- finding and opening courses;
- Focus and Split comparison;
- Original and Current views;
- desktop, tablet, mobile, and zoom review;
- Annotate mode;
- element and area selection;
- course-only screenshots;
- Review Set organization and persistence;
- Full Preview continuity;
- source-aware Codex handoffs;
- stale-selection recovery and relinking;
- preview failure recovery;
- keyboard, responsive, accessibility, and performance behavior;
- the quality and clarity of the visible interface;
- release confidence and maintainability only where they protect the user experience.

It does **not** ask for an audit of Social Studies, English, CALM, Forensics, Science, or any other individual course. Courses may be sampled only to prove that Studio remains project-neutral.

It also does not ask Studio to become:

- another AI assistant;
- a source-code editor;
- browser developer tools;
- a cloud collaboration product;
- an unlimited issue tracker;
- a course-specific control panel;
- a replacement for Codex repository investigation.

Canvas Studio deliberately has no embedded API-dependent assistant. The working model is:

> Studio collects visual intent and evidence. Codex investigates ownership, edits canonical sources, rebuilds, and verifies.

---

## Executive assessment

Canvas Studio is now a credible local course-review workstation rather than a basic iframe preview or engineering dashboard.

Its strongest product advantage over one-at-a-time Codex Browser annotation is continuity:

- several observations can be collected before interrupting the review;
- notes and screenshots remain grouped by course and review session;
- the same work survives Studio reloads and movement into or out of Full Preview;
- Original and Current versions can be compared;
- stale targets can be found, relinked, or explained;
- one bounded, source-aware handoff can be copied to Codex;
- repository paths and implementation details remain hidden from the normal teacher interface.

The foundation is substantially stronger than the August 11 pre-roadmap product audit. Most of that audit's largest functional findings were addressed in phases B through H.

The remaining opportunity is no longer “make annotation work.” It is:

1. make the product feel visually intentional and high-end;
2. make the first review obvious without explanation;
3. close the loop after Codex makes changes;
4. reduce handoff size further without losing source precision;
5. resist adding broad features that weaken the central workflow.

---

## Core product journey now implemented

The intended daily loop is:

1. Launch Studio.
2. Search for or select a course.
3. Open its remembered page and viewing state.
4. Review Current in Focus mode, or compare Original and Current in Split mode.
5. Switch to desktop, tablet, or mobile when needed.
6. Turn on Annotate.
7. Click an element or drag over a visual area.
8. Write a plain-language change request.
9. Capture one or more marked, course-only screenshots when they add value.
10. Save the observation to a named Review Set.
11. Continue reviewing without leaving the course.
12. Reorder, label, prioritize, resolve, move, or merge review items as needed.
13. Copy one verified and bounded Review Set for Codex.
14. Let Codex investigate the canonical source, implement, rebuild, and validate.
15. Return to the saved page and target to inspect the result.

The interface does not ask the teacher to identify a file, selector, builder, or regeneration command. That technical evidence is resolved behind the scenes and included only in the Codex handoff.

---

## At-a-glance change matrix

| Earlier Studio | Current Studio | Practical benefit |
| --- | --- | --- |
| Project and file controls dominated the page | Searchable Course and Page controls with technical work behind Tools | The teacher starts from the course rather than repository structure |
| Split engineering view was the natural starting state | Current course in Focus is the normal review state; Split is optional | Less visual and cognitive overhead |
| Ref, Workspace, Root, and HTML terminology appeared in the main workflow | Original, Current, Course, and Page are the primary labels | No repository vocabulary is required for review |
| Inspector exposed source paths and technical panels | Annotate presents only the selected content, teacher note, and screenshots | The interaction feels like visual feedback rather than developer tooling |
| One selection led immediately to one handoff | Several observations can be collected in one bounded Review Set | The teacher can finish a review pass before interrupting work |
| Review work could disappear during reload or preview changes | Per-project drafts, sessions, layout, page, scroll, and screenshots persist locally | Reviews can continue across navigation and interruptions |
| One temporary list covered the active course | Up to eight named Review Sets per project, five active items per set | Large reviews can be divided into small implementation batches |
| Screenshot evidence was limited or depended on browser sharing | Deterministic course-only capture supports multiple marked and cropped PNGs | Better visual evidence with less privacy risk and no Studio chrome |
| Full Preview behaved like a separate popup | Full Preview rejoins the same Annotate and Review Set session | A full-size review does not create a second workflow |
| Changed or missing targets became ambiguous | Show, current/changed/missing checks, page fallback, Relink, resolve, and reopen are available | Review evidence can survive a rebuild and remain actionable |
| Blank or mangled pages could look like unexplained failure | Exact-page preflight and runtime health provide Retry, another-page, and Codex handoff paths | Failure is visible and recoverable rather than silent |
| Keyboard and narrow-screen behavior were partial | Keyboard traversal, focus recovery, reduced motion, and 320 px contracts are tested | The essential workflow is usable beyond a desktop pointer path |
| Release confidence depended on several manual commands | One release gate records exact source fingerprint, versions, timing, and all critical test results | Future Studio changes can be judged against reproducible evidence |
| An embedded assistant existed but required an unused API workflow | The assistant is absent from the core product | Studio stays focused on evidence collection and Codex handoff |

The earlier front-facing audit was tied to branch `codex/studio-workflow-v2` at commit `5940f722`. The current implementation is the completed `codex/studio-roadmap-phases` branch described at the top of this document.

---

## What functionally changed

### 1. Course-first product shell

Before the roadmap, Studio exposed too much of its engineering history: raw/workspace terminology, duplicated pane controls, build commands, and a default state that emphasized the system more than the course.

Now:

- Courses and Assessments are separate top-level workspaces.
- Focus is the normal course-first view.
- Split is available when comparison is useful.
- Original and Current replace raw/workspace language in the primary controls.
- Build and export operations live behind Tools.
- Review Set is a first-class visible workflow rather than an inspector subsection.
- Annotate is a temporary, unmistakable mode rather than an always-on technical inspector.
- A concise What's new panel explains the current release.

### 2. Course finding and continuity

Studio now supports:

- searching by title or slug;
- `Command/Ctrl + K` course finding;
- bounded recent courses;
- browser-local favourites;
- grouping by declared project metadata rather than subject-specific code;
- a New Project intake entry;
- remembered page, scroll position, Focus/Split state, Original/Current state, device, zoom, and Review Set visibility per project;
- initialization that waits for the real project catalogue instead of overwriting the remembered project with an early fallback;
- explicit reconnect behavior when the preview service is temporarily unavailable.

Switching courses no longer requires destroying another course's review work. Each project owns its own bounded local review state.

### 3. Focus, Split, and responsive review

The current toolbar provides:

- Focus and Split layouts;
- Original and Current switching in Focus;
- side-by-side comparison in Split;
- Desktop, Tablet, and Mobile preview sizes;
- controlled preview zoom;
- per-project layout memory;
- synchronized comparison behavior where appropriate.

The course remains the dominant surface, while review tools are available without being embedded into the course artifact itself.

### 4. Deliberate Annotate mode

Annotate now behaves as a real temporary mode:

- it has a strong blue active treatment;
- it can be exited with Done or Escape;
- normal course actions are blocked only while annotation is active;
- hover and selected targets receive restrained visual outlines;
- a teacher can select an element by pointer;
- a teacher can drag over an area;
- keyboard navigation can enter the course, traverse inspectable content, and select with Enter or Space;
- selecting an item moves focus to the change note;
- leaving Courses for Assessments pauses an unfinished draft instead of silently deleting it;
- embedded Studio and Full Preview use the same review state.

### 5. Selection-owned draft safety

Unfinished work is now bound to the selected course evidence instead of behaving like a loose note field.

The system protects against:

- an older asynchronous selection result replacing a newer one;
- a note being silently attached to the wrong newly selected target;
- project or page changes leaving stale selection state active;
- unfinished work disappearing simply because annotation was paused;
- selection resolution continuing after a new selection, project change, or unmount.

The Phase H inspection hook makes these cancellation and stale-run rules explicit and testable.

### 6. Course-only screenshot evidence

Screenshot capture now:

- captures the course preview rather than the Studio chrome;
- adds a deterministic blue marker for the selected element or area;
- works from embedded Studio and Full Preview;
- supports several screenshots on one annotation;
- supports cropping to the selected element or teacher-drawn rectangle;
- supports screenshot removal;
- supports exact-owner screenshot replacement/retake;
- preserves drafts if part of a multi-screenshot save fails;
- keeps copied handoffs small by including safe local paths rather than pixels or base64;
- validates project, session, annotation, node, page, and screenshot ownership before display, copy, replacement, or deletion.

Current intentional bounds:

- up to **3 screenshots per annotation**;
- up to **15 screenshots per active Review Set session**.

These are token, storage, performance, and safety controls—not accidental limitations.

### 7. Persistent Review Sets

Review Set is now a local workbench rather than a temporary list.

It supports:

- up to **5 saved annotations per set**;
- up to **8 named Review Sets per project**;
- one active set and queued local sets;
- a seven-day local persistence window;
- editable notes after saving;
- short labels;
- normal, high, or low priority;
- annotation reordering;
- screenshot reordering;
- duplication, movement, and bounded merging;
- resolved/reopened state;
- exclusion of resolved items from the next Codex handoff;
- readiness states such as ready, stale, needs relinking, needs a note, or needs a screenshot;
- packet item and byte counts before copy;
- Copy Review Set for Codex;
- readable Markdown export;
- validated JSON backup and restore;
- isolated review storage for each project.

Copy remains unavailable until saved source routes and screenshots are rechecked against current repository state.

### 8. Full Preview is part of the same workflow

Full Preview is no longer a disposable raw-course popup.

It now provides:

- the same Annotate state;
- the same active Review Set;
- shared notes and screenshots;
- return to the original Studio;
- continuity after Studio reload;
- bounded reconnection behavior;
- screenshot preview and review controls;
- trusted top-level controls that remain outside the course iframe;
- no second persistent data island in the preview tab.

The teacher can move into Full Preview for a more natural course experience, collect feedback, and return without rebuilding the review manually.

### 9. Stale-selection and rebuild recovery

Saved evidence now remains useful when a page changes.

Studio can:

- classify an anchor as current, changed, or missing;
- prevent stale evidence from being copied as if it were current;
- return to the nearest saved page and scroll location;
- use Show to return to a saved target;
- relink a saved annotation to a new current selection;
- preserve the note, metadata, and original screenshot evidence during relinking;
- distinguish Element and Area selections;
- preserve recovery metadata through storage migration;
- discard corrupt persisted state safely rather than crashing.

### 10. Preview recovery instead of silent failure

Studio now preflights the exact selected page before mounting it.

It distinguishes:

- ready pages;
- missing pages;
- empty sources;
- missing runtime or styles;
- unsupported runtime families;
- blank or transparent output;
- indefinitely stuck loading/progress states;
- late runtime failures;
- bridge or reconnection failures.

Teacher-facing recovery actions include:

- Retry;
- Open another page;
- Copy issue for Codex;
- Return to Studio from Full Preview.

Technical details stay collapsed and bounded. A secure screenshot-capture fallback is not misreported as a broken learner-facing preview.

The Phase F compatibility audit preflighted **524 raw/workspace HTML pages across 57 projects**, with zero hard failures and four bounded project-level warnings at that time. That is strong evidence, not a promise that every future artifact or external runtime can never fail.

### 11. Accessibility and narrow-screen behavior

The review workflow now includes explicit coverage for:

- keyboard entry into mapped interactive and noninteractive course content;
- arrow-key traversal while annotating;
- Enter/Space selection without triggering the learner action;
- focus movement to the note after selection;
- focus return after save, remove, Show, screenshot preview, Done, and Escape;
- truthful pressed, expanded, status, alert, search, modal, and landmark semantics;
- readable muted-text contrast;
- reduced-motion preferences;
- a usable fixed annotation rail at **320 px**;
- reachable Done and Save actions without horizontal page overflow.

### 12. Performance protections

Studio now has explicit performance behavior rather than relying on the browser to remain fast by accident.

It includes:

- frame-coalesced pointer work;
- cached course-node and keyboard indexes;
- protection against Studio overlays invalidating course indexes;
- bounded observers that stop after readiness;
- exact file-change validation for source-resolution caching;
- lazy, asynchronous screenshot thumbnail decoding;
- bounded Review Set and screenshot caches;
- measured preview readiness, selection feedback, and screenshot outcome budgets;
- recovery deadlines that are longer than normal experience budgets;
- tests for large mapped pages and dynamic scroll containers.

### 13. Maintainability and release confidence

The visible simplicity now rests on more explicit internal boundaries:

- selection lifecycle and cancellation live in `useInspectionDraft`;
- App accesses Review Set behavior through one `review-workbench.ts` facade;
- cross-boundary numeric limits live in `app/shared/studio-quality.ts`;
- capability-token, standalone-session, and Review Set session limits remain distinct even when some numeric values match;
- neutral test projects replace course-specific feature branches;
- release content is backed by a static in-product manifest and durable release note;
- `npm run test:studio-release` owns its port, uses installed tools, forbids focused-only tests, runs gates in order, stops on the first failure, and records exact evidence.

The final Phase H release gate passed:

- **85/85 focused Studio contracts**;
- the Studio production build;
- **50/50 inspection end-to-end tests**;
- **1/1 platform smoke test**;
- **1/1 strict neutral-project contract**;
- a SHA-256 fingerprint of **499 in-scope source files**;
- `sourceChangedDuringRun: false`;
- independent Terra Max red-team review with a final verdict of **PASS**.

Repository-wide typecheck still contains established unrelated diagnostics in legacy course builders. No Phase H failure points into the Phase H source set. Those diagnostics should be handled separately rather than used to misrepresent Studio's focused release evidence.

---

## Roadmap phases completed

| Phase | Goal | Functional result | Published commits |
| --- | --- | --- | --- |
| A | Publish and freeze the baseline | Local, GitHub, and adviser evidence aligned before expansion | `741b5282`, `fbd74fc3` |
| B | Polish the core review loop | Course-first shell, safe drafts, shared Annotate state, undo, per-project layout memory | `ccdb916d`, `6c824f42` |
| C | Improve finding and continuity | Search, recents, favourites, metadata grouping, per-project state, reconnect, New Project | `cddc6142`, `3b119710` |
| D | Strengthen Review Set | Named sessions, ordering, labels, priority, bounded operations, export and backup | `a7501627`, `3cc61308` |
| E | Improve precision and recovery | Area evidence, crop/retake, anchor checks, Show, Relink, resolved/reopened work | `a1abbb56`, `01167026` |
| F | Recover preview failures | Exact-page preflight, runtime health, plain recovery actions, compatibility audit | `75a5d369`, `4760f458` |
| G | Accessibility and performance | Keyboard workflow, focus, 320 px support, reduced motion, performance contracts | `c71e524c`, `43a6c278` |
| H | Maintainability and release discipline | Focused boundaries, shared contracts, neutral fixtures, What's new, release fingerprint | `1ad3cc21`, `dc89ec96` |

---

## What was deliberately not changed

- No learner-course source, workspace, or generated export was changed to complete the roadmap.
- Studio remains project-neutral.
- Generated course output was not promoted to canonical editable source.
- The embedded API-dependent assistant was not retained as a core workflow.
- Studio was not turned into a general build-command dashboard.
- Full Preview was not given independent persistent storage.
- Screenshot capture was not weakened into unrestricted screen sharing.
- Review Sets were intentionally bounded rather than becoming an unlimited project-management system.

---

## Current visible strengths

### The course is finally the center

The current implementation gives most of the working area to the course. The controls sit in a compact toolbar, technical operations are secondary, and the review rail is present without competing with the learner artifact.

### The product language is substantially cleaner

Primary labels now use teacher-facing concepts such as Course, Page, Original, Current, Focus, Split, Annotate, Full Preview, Review Set, and Tools.

### Review Set is the correct central object

“Review Set” describes the teacher's actual task better than “Inspector,” “Source Workbench,” or an abstract issue-management term. It should remain the visible center of the product.

### Persistence is a real differentiator

Codex Browser is excellent for one immediate annotation. Studio is now better for sustained course review because it can preserve multiple notes, screenshots, pages, courses, and sessions without forcing the teacher to interrupt the review after every observation.

### Source safety remains invisible but intact

The teacher can speak naturally. Codex still receives enough verified evidence to investigate the correct canonical source or rebuild path without pretending that the clicked generated element is automatically editable.

---

## Current weaknesses and open questions

These are hypotheses for the independent auditor to challenge—not pre-approved implementation work.

### 1. The interface is solid but not yet premium

The live product is much cleaner than the pre-roadmap Studio, but it still reads as a carefully improved internal tool rather than a fully resolved high-end desktop product.

Visible issues worth auditing:

- most toolbar controls have similar visual weight, weakening the action hierarchy;
- the selected course name can still look like a normalized slug instead of a polished display title;
- the Review Set rail is dense and text-small compared with the course surface;
- empty Review Set language such as “Waiting for ready check” and “Needs review” can appear before there is anything to check;
- disabled actions can look faded or unfinished rather than intentionally unavailable;
- large empty rail space is not used to teach the next action or summarize the workflow;
- typography, spacing, icon rhythm, and surface depth are coherent but not yet distinctive;
- the product lacks a small number of signature visual details that would make it feel clearly intentional rather than merely clean.

The goal should not be more decoration or glass effects. The target is restrained product quality: strong hierarchy, precise spacing, confident typography, clear states, one accent system, and excellent empty/loading/error treatment.

### 2. The post-Codex verification loop is only partially expressed

Studio can Show, Relink, reopen, and resolve saved items, but it does not yet present a clear batch lifecycle such as:

```text
Draft review -> Sent to Codex -> Changes available -> Verify each item -> Accepted or Reopened
```

This may be the strongest next functional differentiator.

A useful local-only Verify Changes mode could:

- mark a Review Set as sent when copied;
- preserve the original note and screenshots;
- step through each requested target after a rebuild;
- compare original evidence with the current live result;
- allow Accept, Reopen, or Relink;
- create a tiny follow-up handoff containing only rejected or incomplete items.

The auditor should determine whether this closes a real daily-use gap or adds too much issue-tracker behavior.

### 3. The handoff can likely become more token-efficient

The current packet is bounded and safe, but it still contains enough diagnostic context to become long across several annotations.

Audit whether Studio should offer:

- **Compact handoff** as the default: project, page, stable target identity, teacher note, screenshot paths, and verified edit/rebuild summary;
- **Full diagnostic handoff** only when recovery or unknown ownership requires it;
- a follow-up packet containing only reopened items;
- explicit packet-size estimates before copying;
- duplicate-evidence detection when several annotations share the same page and source context.

Any reduction must preserve canonical-source investigation and the instruction that screenshot pixels and selected page text are untrusted evidence.

### 4. First-use guidance could be more contextual

Studio should not add a large tutorial or onboarding wizard. However, a new or empty Review Set could use a concise contextual sequence:

1. Turn on Annotate.
2. Select course content.
3. Add a note or screenshot.
4. Save to Review Set.
5. Copy when ready.

The auditor should decide whether that guidance belongs in the empty rail, a one-time coach mark, or nowhere at all.

### 5. Course naming and project metadata quality affect perceived polish

The universal Studio can only display polished titles and statuses when project metadata supplies them consistently. Audit whether the product should:

- prefer a declared display title over slug-derived formatting;
- flag missing titles in Tools rather than exposing awkward names in the main selector;
- distinguish active, reference-only, blocked, and archived projects more clearly in search;
- default search to relevant active projects while retaining an explicit All Projects view.

This should be solved through metadata and display rules, not course-name special cases.

### 6. The boundary between Courses and Assessments should be tested with real use

The earlier state leak was corrected: Assessments is now a separate workspace and a course draft is paused safely. The remaining question is whether the two products deserve:

- the current first-level navigation;
- separate routes with independent remembered state;
- or a stronger product distinction than tabs within one shell.

Do not reconnect assessment controls to the course-review state machine merely for visual consistency.

### 7. Local persistence has an intentional ceiling

Review Sets are local, bounded, and retained for seven days. This is appropriate for the current personal workflow, but the auditor should assess whether the user needs:

- manual pinning beyond seven days;
- clearer expiry language;
- automatic Markdown/JSON archival after handoff;
- or no change because backup/export already solves the durable-record use case.

Cloud accounts, collaboration, and synchronization should not be recommended without strong evidence that this personal local-first workflow needs them.

---

## Codex product judgment

### Overall verdict

The architecture and core interaction model should be kept.

Canvas Studio is already functionally better than Codex Browser for long-form course review because it combines comparison, persistent batches, several screenshots, source-aware packets, and Full Preview continuity. Codex Browser remains simpler for one isolated comment. Studio should preserve that simplicity at the moment of annotation while using persistence and organization to win the longer workflow.

### Recommended next order

#### Priority 1 — A disciplined visual and usability refinement

Do one bounded refinement pass, not another redesign.

Focus on:

- hierarchy between primary and secondary controls;
- typography and spacing consistency;
- friendly course titles;
- a clearer, calmer Review Set rail;
- excellent empty, disabled, loading, success, and error states;
- consistent iconography;
- a resizable or better-proportioned review rail on larger screens;
- visual parity between embedded and Full Preview controls;
- maintaining the course as the dominant surface.

Success should be measured through screenshots at realistic desktop, medium, and 320 px widths—not by adding decorative effects.

#### Priority 2 — Close the implementation-to-verification loop

Prototype a local Verify Changes state for a sent Review Set. This has more potential to improve the real workflow than another new authoring or management feature.

The smallest useful version is:

- mark copied set as Sent;
- preserve original screenshots;
- step through current targets after rebuild;
- Accept, Reopen, or Relink each item;
- copy only unresolved follow-up items.

#### Priority 3 — Introduce compact and diagnostic handoff modes

Default to the smallest safe packet. Expand only when source ownership or recovery requires diagnostic evidence.

Measure:

- packet bytes;
- repeated context removed;
- whether Codex can still identify the canonical edit and verification path without requesting a second broad context dump.

#### Priority 4 — Improve first-use and metadata quality

Use contextual empty-state guidance and declared display titles. Do not add a tutorial center, chatbot, or course-specific naming rules.

### Features to reject unless new evidence appears

- an embedded AI assistant requiring an API;
- cloud collaboration or accounts;
- unlimited annotations or screenshots;
- source-code editing inside Studio;
- a permanent developer diagnostics sidebar;
- a broad course-builder UI mixed into the review surface;
- another visual redesign before observing the current workflow in use;
- course-specific branches in shared Studio code;
- automatic direct edits from a visual selection without Codex source verification.

---

## Questions the independent auditor must answer

### Product and workflow

1. Is Review Set still the correct central object?
2. Is Studio now clearly better than Codex Browser for a multi-item course review?
3. Where does Studio still feel slower or less obvious than Codex Browser?
4. Can a first-time teacher complete one annotation and one Codex handoff without documentation?
5. Which current controls should be removed, merged, renamed, or demoted?
6. Does Full Preview feel like the same product rather than a parallel implementation?
7. Is a Verify Changes lifecycle the correct next differentiator, or unnecessary issue-tracker behavior?

### Visual quality

8. What specifically prevents the current interface from feeling premium?
9. Which hierarchy, typography, spacing, colour, icon, and state changes provide the most impact without another redesign?
10. Is the Review Set rail the right width, density, and visual priority?
11. What should the empty Review Set communicate?
12. Which parts of the supplied concept imagery are useful direction, and which would make the product generic or visually noisy?

### Token and context efficiency

13. What is the minimum safe Codex packet for a normal bounded annotation?
14. Which fields are repeated across items and should be shared once?
15. When should a diagnostic appendix be included?
16. Would compact/default and full/diagnostic modes materially reduce tokens without creating failed handoffs?
17. Should completed, resolved, or accepted review evidence be omitted automatically from follow-up packets?

### Reliability and safety

18. Do current preview, screenshot, source-resolution, and persistence boundaries remain appropriate?
19. Are any usability proposals likely to weaken exact-project, exact-page, screenshot-owner, or canonical-source checks?
20. Which current limits should remain fixed, and which should become user-configurable?
21. Is seven-day local persistence appropriate for this workflow?
22. Are there remaining failure states that can still look like success?

### Scope discipline

23. Which proposed improvements should be rejected as complexity without daily value?
24. What is the smallest next roadmap that materially improves the teacher's actual work?
25. What should be learned from real use before any further feature work begins?

---

## Required red-team / green-team process

The audit should use the same adviser/implementer discipline established for this repository:

### Round 1 — Red team

Attack the current product and this proposed direction.

- Identify unsupported claims.
- Find remaining state-loss or misleading-success risks.
- Challenge the visual-polish priority.
- Challenge Verify Changes and compact packets for unnecessary complexity or lost evidence.
- Identify security or source-of-truth regressions the proposed changes could create.
- Identify recommendations that are fashionable but irrelevant to this teacher's workflow.

### Round 2 — Green team

Defend only what survives repository evidence and actual workflow value.

- Preserve proven behavior.
- Correct or narrow weak proposals.
- Provide the smallest implementation that captures the value.
- Name measurable acceptance criteria.
- Reject speculative scope.

### Round 3 — Adjudication

Produce a consensus decision list.

- `KEEP`: proven current behavior that must not regress.
- `CHANGE NOW`: high-confidence next work.
- `VALIDATE FIRST`: needs observation or a prototype before implementation.
- `DEFER`: useful but not currently important.
- `REJECT`: conflicts with the product or adds unjustified complexity.

Do not manufacture agreement. Any remaining disagreement must name the missing evidence that would resolve it. The final roadmap should contain no unresolved must-fix disagreement.

---

## Repository material to inspect

Start with:

- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md`
- `docs/releases/2026-08-11-canvas-studio.md`
- this audit brief

Then inspect the product boundary:

- `app/studio/src/App.tsx`
- `app/studio/src/components/Topbar.tsx`
- `app/studio/src/components/CourseToolbar.tsx`
- `app/studio/src/components/AnnotationModeBar.tsx`
- `app/studio/src/components/InspectionPanel.tsx`
- `app/studio/src/components/ReviewSetPanel.tsx`
- `app/studio/src/components/PreviewPane.tsx`
- `app/studio/src/components/PreviewRecoveryPanel.tsx`
- `app/studio/src/components/WhatsNewPanel.tsx`
- `app/studio/src/hooks/useProjectLibrary.ts`
- `app/studio/src/hooks/useInspectionDraft.ts`
- `app/studio/src/hooks/usePreviewRecovery.ts`
- `app/studio/src/hooks/usePreviewScrollSync.ts`
- `app/studio/src/hooks/useScreenshotAnnotation.ts`
- `app/studio/src/lib/project-library.ts`
- `app/studio/src/lib/review-set.ts`
- `app/studio/src/lib/review-set-storage.ts`
- `app/studio/src/lib/review-workbench.ts`
- `app/studio/src/lib/studio-performance.ts`
- `app/studio/src/lib/studio-release-notes.ts`
- `app/studio/src/precision-editor.css`
- `app/shared/inspection.ts`
- `app/shared/preview-bridge.ts`
- `app/shared/preview-health.ts`
- `app/shared/preview-path.ts`
- `app/shared/studio-quality.ts`
- `app/server/preview-bridge-runtime.ts`
- `app/server/lib/preview-preflight.ts`
- `app/server/lib/preview-capture.ts`
- `app/server/lib/review-screenshots.ts`
- `e2e/specs/inspection.spec.ts`
- `scripts/run-studio-release.ts`
- `scripts/lib/studio-release.ts`

Use individual courses only as varied fixtures. Do not organize the product recommendations around any one course.

---

## Current verification command

The authoritative complete Studio gate is:

```bash
npm run test:studio-release
```

It covers focused contracts, the production build, inspection E2E, platform smoke, and a strict neutral-project contract. Its ignored machine-readable evidence is written to:

```text
.runtime/studio-release-report.json
```

Any future Studio, preview, Review Set, fixture, or release-gate change should rerun this command.

---

## Copy-ready ChatGPT Pro / Terra Max prompt

```text
Act as an independent product, usability, visual-design, accessibility, architecture, security, and context-efficiency auditor for Canvas Studio in the canvas-helper repository.

Read the attached “Canvas Studio Current-State and Next-Step Audit Brief” completely.

Before judging it:
1. State the exact repository, branch, and commit you can inspect through GitHub.
2. Verify that branch codex/studio-roadmap-phases contains implementation commit 1ad3cc210ceb100e69be601bd21ba63d44a5033c and final roadmap handoff commit dc89ec969bfc8ee214a7a24c303df543beb9141e.
3. Label any claim you cannot verify as UNVERIFIED. Do not infer repository facts from the brief alone.
4. Treat individual courses only as varied fixtures. Do not make this a Social, English, CALM, Forensics, or Science audit.

The primary user is a teacher who develops courses with Codex. Canvas Studio is a local-first visual review and Codex-handoff tool. It deliberately does not contain an API-dependent AI assistant. The core journey is:

choose course -> review Current or compare Original/Current -> Annotate -> select an element or area -> add a plain-language note and course-only screenshots -> save several observations to a bounded Review Set -> copy one verified packet to Codex -> return and verify the result.

Run a genuine three-stage review:

ROUND 1 — RED TEAM
- Attack the current product and the proposed next direction.
- Find unsupported claims, confusing UX, state-loss risks, misleading success states, visual weaknesses, token waste, security regressions, and unnecessary feature scope.

ROUND 2 — GREEN TEAM
- Defend only what survives repository evidence and real workflow value.
- Preserve proven capabilities and source-of-truth boundaries.
- Narrow proposals to the smallest useful implementation.

ROUND 3 — ADJUDICATION
Produce a consensus table using KEEP, CHANGE NOW, VALIDATE FIRST, DEFER, and REJECT. Do not manufacture agreement. If a must-fix disagreement remains, identify the exact missing evidence needed to settle it.

Required output:
1. A direct current-product verdict.
2. A verified feature-and-evidence matrix.
3. A walkthrough of the first-time and experienced-user journeys.
4. A visual critique detailed enough to guide implementation: hierarchy, typography, spacing, colour, icons, Review Set rail, empty/loading/error/success states, embedded/full-preview parity, desktop/medium/320 px behavior.
5. A context/token audit of the copied Review Set packet, including a proposed minimum safe compact schema and when a full diagnostic appendix is required.
6. A decision on whether “Verify Changes” should be the next functional differentiator.
7. The five highest-value improvements at most, ranked by user impact, engineering risk, complexity, and token impact.
8. Explicit features to reject or defer.
9. Acceptance criteria and required tests for every CHANGE NOW item.
10. Likely owning repository files, without writing code.
11. A smallest-credible next roadmap with no duplicate work from completed phases A-H.
12. A final consensus decision list with no unresolved must-fix disagreement.

Take a stand. Do not provide a generic brainstorm, recommend another assistant, propose cloud collaboration without evidence, or bury the decision in possibilities.
```

---

## Final position to challenge

Canvas Studio does not need another broad feature phase yet.

It needs one disciplined visual/usability refinement, followed by a small closed-loop verification feature and a more compact normal handoff. Those changes would improve the way the teacher already works while preserving the strongest parts of the current product: course-first review, simple annotation, persistent bounded evidence, Full Preview continuity, and safe Codex implementation.

If the independent audit cannot prove that a proposed addition makes that central loop faster, clearer, safer, or less context-heavy, the addition should not be built.
