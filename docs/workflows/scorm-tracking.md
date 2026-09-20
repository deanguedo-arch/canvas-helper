# SCORM export tracking

The shared exporter adds tracking to the export copy. It does not rebuild lessons or alter feedback, answers, project authoring status, or release gates. Existing installed packages require a new export and a separately reviewed LMS update.

## Default behavior

- LMS-backed response save/restore retains the version-1 suspend-data envelope and adds a `tracking` member. Older saves without that member remain readable.
- Unreadable or differently identified LMS saved work stops automatic saving rather than replacing that attempt. A storage failure during restore also disables the LMS save controls and reports the problem.
- The learner sees pending/saving/saved/error status and a Save now retry. Managed Science courses reuse their native status bar and preserve automatic saving without adding a global exit button. Standalone launches explicitly show that LMS saving is unavailable.
- Active session time is sent as `cmi.session_time` (2004) or `cmi.core.session_time` (1.2). Each write is the cumulative duration of the current session; Brightspace owns `total_time`. Restored historical totals are not resent as a new session.
- A 15-second heartbeat commits progress and time. Hidden tabs pause timing. Five minutes without pointer, keyboard, input, or scroll activity stops accrual until activity returns. A callback delayed more than 30 seconds does not count its gap, avoiding laptop-sleep inflation. These are estimates, not proof of attention; quiet reading beyond the idle window and activity within child frames can be undercounted.
- Supported hash-page courses bookmark a stable page ID and restore it before course scripts run. An explicit launch hash takes precedence. Unknown/stale bookmarks fall back to the course's default page.
- Page time and historical active time are saved inside `cmi.suspend_data`. By default they do not appear as teacher-visible Brightspace page rows. Explicit ungraded action reporting can also publish page-time summaries as SCORM interactions; it does not create grades or quiz questions.
- Required-item completion uses the same underlying IDs as the content. SCORM 2004 receives `cmi.progress_measure` and `cmi.completion_status`; SCORM 1.2 receives lesson status only. No grades or pass/fail scores are manufactured. Completion of one package does not mark other Brightspace activities complete.

## Existing Social and ELA shells

The exporter recognizes the Next Step shell's literal `completionIds` array, `STORAGE_KEY`, completion markers, and matching count calculation. Older Social shells using `lessonIds` in that calculation are also supported. Optional buttons outside the required list are ignored. Ambiguous or unsupported structures produce warnings instead of guessing.

Hash navigation can be connected independently of completion. A course can therefore have resume and page timing while its completion integration is still missing. The generated report describes wiring, not teacher acceptance or live LMS certification.

## Contract for Science and other builders

Write `workspace/scorm-tracking.json` through the course's owning authoring workflow:

```json
{
  "schemaVersion": 1,
  "adapter": "hash-pages-v1",
  "pageIds": ["overview", "lesson-1", "lesson-2"],
  "defaultPageId": "overview",
  "completion": {
    "storageKey": "science-unit:tracking",
    "path": ["completedIds"],
    "requiredIds": ["lesson-1-core", "lesson-2-core"]
  }
}
```

The runtime must route these hash IDs to the corresponding unique HTML elements. `pageIds` and `requiredIds` are nonempty lists of up to 500 unique stable IDs, each at most 200 characters. The default page must be in the page list. The completion key must hold JSON such as `{"completedIds":["lesson-1-core"]}`. Omit `path` for a root JSON array. Paths use own object properties only. `completion` can be omitted when only navigation integration is ready.

The course builder must derive this array from its actual completion rules and keep it synchronized with the visible progress calculation. For packed or computed state, publish a small companion completed-ID array rather than asking the exporter to decode private state or equating visited pages with completion. Include only required items. Existing Biology packed state is not automatically decoded by this adapter; its builder needs this connection before automatic completion can be claimed. Unknown Science courses still receive base save status and session timing, and recognized hash shells receive navigation tracking.

Malformed explicit contracts fail export. The explicit completion key is automatically included in saved storage keys. A missing key means no completed items; malformed existing completion data fails the save visibly. Required IDs are matched as a set, so duplicates or optional saved IDs cannot inflate progress. A course that removes completion items from its saved state will report the recalculated incomplete status; Brightspace's handling of attempt resets must be tested before release.

## Export evidence and checks

The normal command remains:

```bash
npm run export:scorm -- --project <approved-slug> --version 2004
```

It prints the tracking source, connected features, and warnings, and packages `scorm-tracking-report.json`. The report contains static IDs and capability information, not learner data. Read it before LMS upload; missing completion must be resolved if completion reporting is required.

```bash
npm run test:scorm
npm run test:e2e:scorm
```

Browser tests use a simulated LMS API, including a fresh browser context for resume. They do not replace Brightspace verification. Before updating a live package, test an existing attempt with written responses, internal progress versus the SCORM completion display, accumulated time across two sessions, and successful/failed Save and Exit. Confirm the LMS package-update choice preserves attempts. A SCORM Content topic may display a completion checkmark rather than the exact internal percentage.

No installed LMS package, course workspace, or Science release state is changed by implementing the exporter.

## Managed native course state

Science contracts may add `"state": {"adapter": "course-state-v1"}`. Dynamic hash renderers may declare `pageContainerId` instead of requiring a static element for every route. The native runtime reads `__canvasHelperScorm.readCourseState()`, restores before editing, calls `publishCourseState(snapshot, completedIds)`, and registers `registerCourse({flush})`. `saveAsync()` awaits this flush before committing. Required IDs retain their native completion rules.

The version-1 envelope stores compressed course data and a durable attempt scope. `scopeKey(key)` isolates browser recovery and photo databases; learner mismatches, malformed snapshots and unresolved native save failures stop replacement. Managed state excludes unrelated localStorage. Full writing/history is retained until capacity fails: 60,000 characters for SCORM 2004 and 3,500 for 1.2. Capacity errors preserve the previous LMS copy and local writing; use the native Process Collection or Chemistry Backup before closing. Shutdown cannot reliably await pending asynchronous work.

Chemistry's `legacyCourseId` allows exact validated migration of its original `CH10LZ1|` snapshot. Older shared envelopes containing only localStorage values are intentionally blocked until an explicit migration is provided; do not update an existing live attempt without testing its actual format.

## Optional Biology photo pilot

The shared photo factory is bundled into Chapter 11 and copied by the textbook integration owner into Chapters 12/13. The organization must supply an approved authorization callback before assigning `window.biologyPhotoStore = createBiologyBrightspacePhotoStore({origin, orgUnitId, folderId, apiVersion, authorize, questionIds})`. Use one stable textbook question ID and a dedicated ungraded assignment folder first. `authorize()` returns an ephemeral bearer token for the current learner; never embed a token or client secret in the package or save state. Then await `biologyTextbookPractice.refresh()` to retrieve referenced photos after connecting.

The adapter uploads JPEG bytes, verifies acknowledgment through current-user submissions, saves only scoped references, and verifies current-user ownership again before retrieval. Removing a photo removes the course reference; Brightspace retains the submitted file. OAuth registration, current-user file permissions, CORS and fresh-device sign-on must be confirmed in the actual organization. These packages ship without that configuration, so their photos remain browser-local. Mock API tests establish component wiring only.

`--review-only` creates separate review ZIPs with `review-only.json`, skips workspace approval and release-freshness recording, and leaves authoring/export eligibility unchanged. It is for sandbox testing before course-specific readiness gates and live LMS acceptance.

## Optional ungraded action reporting (SCORM 2004)

Add `"actions": {"schemaVersion": 1, "evidenceStorageKey": "<existing evidence store>"}` to the hash-page contract. Omit it to preserve the default behavior; SCORM 1.2 reports it as disabled. `scripts/lib/scorm-actions.ts` owns collection and interaction writing, and the package report declares `actionReporting`.

The Social Option Two contracts opt in. Stable `cmi.interactions` rows summarize page access, answer-edit bursts, actual changed lesson completion, actual changed Evidence Bank collections/removals, vocabulary access, textbook page requests, practice selection/save requests, topic/source filters, support-section openings, resource links, media selection and native audio/video play/pause/end events. Counts continue by reading the LMS's existing rows. First/latest timestamps are retained; this is an aggregate report, not a chronological click log. New activity updates the same row. Answer text and search queries are not copied into analytics; normal learner saves continue to carry answers separately.

Page-time rows include active seconds, foreground-visible seconds and the difference attributable to the active idle cutoff. Foreground time continues during quiet reading beyond five minutes, while active time keeps the existing idle policy. Hidden tabs and long sleep/throttling gaps are excluded from both measures. The row latency represents accumulated active page time; the response summary also includes visible/idle seconds. All rows use type `other`, result `neutral` and weight zero. No score, success status or optional-work completion gates are created. Rows live in native LMS interactions rather than inflating the answer suspend-data payload.

External iframe videos/PDFs do not expose reliable playback, inner-page scrolling or reading completion. Access/request events describe exactly that. Native player events report play/pause/end, not proof of attention or full viewing. Brightspace report rendering and export visibility must be verified in a real organization before claiming availability to teachers. Optional interaction-write rejection keeps affected rows pending for retry and logs the rejected field plus available LMS diagnostics. It does not block the required answer, resume, completion or session-time save and exit. The learner sees that detailed reporting is unavailable after a successful save. Required-state write or commit failures still prevent exit.

Focused real-page integration check (no Social upload ZIPs):

```bash
node_modules/.bin/tsx scripts/tests/social-option2-scorm.mts
```

Shared bridge changes still require the SCORM unit/browser regression checks above. The focused run uses isolated simulated LMS contexts and must not be described as live Brightspace acceptance.

## Automatic save controls
A canonical course body can opt into `data-scorm-save-mode="automatic"`. Existing debounced storage saves, heartbeat, navigation/visibility saves and unload termination continue. Successful status messages stay hidden and the manual Save and Exit control is omitted so learners do not end an attempt while browsing. Required-state failures show the save status and Save now retry; a successful retry hides them. Optional action-report failures remain logged and do not create a learner warning in this mode. All 12 Social Option Two courses now opt in after the teacher confirmed the Social 20-1 Issue 1 pilot works. Biology and Chemistry retain their existing settings.
