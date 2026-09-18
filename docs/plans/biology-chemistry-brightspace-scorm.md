# Biology and Chemistry Brightspace SCORM rollout

Status: shared state/tracking adapters and optional photo-store component implemented; four SCORM 2004 review packages prepared for sandbox testing. No live LMS upload, photo authorization, authoring promotion or release certification.

## Current decision — no student photo uploads

User chose to remove student photo-upload controls from Biology Chapters 11–13. Written-response saving and SCORM tracking remain. Existing saved photos are preserved for original-browser viewing, but new uploads/replacement are removed. The Brightspace photo-authentication integration is deferred indefinitely. Workspace changes require a fresh export/upload before existing LMS packages reflect them.

## Prior pilot — Chapter 12 only

Organization: https://eips.brightspace.com/. User tested Chapter 12 in regular Chrome then incognito: written response restored, but photo bytes did not; Process Collection retained the filename and reported the photo unavailable. This is user-reported live text-restoration evidence, not full LMS acceptance. All further pilot work is scoped to `biology30-chapter-12`; retain the other review packages without expanding testing or rebuilding them.

Read-only browser inspection reached the authenticated EIPS home. Admin Tools searches across All for OAuth and Extensibility returned no results for the current account. This does not establish that the organization lacks API support; supported app-registration access and learner-scoped authorization remain unresolved. No keys, permissions, assignments or learner submissions were created or changed.

Next dependency: EIPS Brightspace administrator must identify the approved app-registration/authentication route and a dedicated ungraded pilot destination in the actual course containing Chapter 12. Do not substitute administrator tokens for learner authorization.

## Original four-package scope (expansion deferred)

- Produce four separate SCORM 2004 packages: Biology Chapter 11 (`biology30-unit-a-pilot-3`), Chapter 12 (`biology30-chapter-12`), Chapter 13 (`biology30-chapter-13`), and Chemistry Unit A (`chemistry30-unit-a-pilot`).
- Students enter through their existing Brightspace login. Lessons, practice, textbook resources, diagrams, vocabulary and Process Collection remain in their established course locations.
- Report required completion, progress and estimated active time. Keep practice ungraded; do not add gradebook scores or new assessment rules.
- Restore the current lesson, written work, required-check completion and unfinished practice across devices. Preserve existing answer, activity, question, run and storage identities.
- Preserve the latest automatic-saving presentation recorded in the handoff. Show pending, saved and failed states clearly; do not reintroduce a compulsory Save and Exit workflow. Retain a save/retry action where helpful.
- Include a pilot for photos to reopen inside Textbook Practice on another device. This is an integration to build and test, not an existing SCORM capability.

## Shared export and course integration

The shared owners are `scripts/lib/scorm.ts`, `scripts/lib/scorm-tracking.ts` and `scripts/lib/exports/scorm-package.ts`. Course-specific state conversion stays with each canonical course runtime; do not patch generated ZIPs or recreate lessons through retired intake tools.

- Keep one owner for LMS initialization, saving, timing and termination. Chemistry's existing `ChapterSCORM` connection and compressed save format must cooperate with the shared bridge rather than initialize and overwrite the same attempt independently. Preserve compatibility with existing valid saves.
- Add explicit `workspace/scorm-tracking.json` contracts for stable routes and actual required completion IDs. Derive completion from the same rules as the visible course progress; visiting pages and optional practice do not count as completion.
- Add versioned portable state adapters. Chapter 11 requires an IndexedDB adapter beyond its existing unfinished-practice projection; Chapters 12/13 require explicit storage keys and completion projections. Include Chemistry's nested activity and practice state.
- Restore LMS state before accepting learner edits. Scope browser recovery to the correct learner/course/attempt; preserve conflicting newer local work for an explicit recovery choice. Never import another learner's data or silently carry an old attempt into a new one.
- Flush pending text/photo metadata and native save queues before committing a snapshot. Distinguish browser persistence from an acknowledged LMS save. Keep an up-to-date committed snapshot because browser shutdown cannot reliably wait for asynchronous work.
- Measure the complete serialized save envelope against the current 60,000-character SCORM 2004 budget. Deduplicate repeated content and use lossless compression where appropriate. Current permitted writing and unlimited history can exceed that allowance; full-history portability is not yet promised. Never silently shorten writing or delete history to make a save fit. Oversize or failed saves retain the last valid LMS copy, preserve local work, and offer a readable export/backup with a clear unsynced status.
- Keep local instructional assets and browser-generated practice inside the package. Existing externally hosted videos still require internet access.

## Photo-sync pilot using the existing Brightspace login

There are three reusable upload panels, all in Biology Textbook Practice: Chapter 11 has 93 question records, Chapter 12 has 90, and Chapter 13 has 102. Each accepts up to three optional photos. Chemistry currently has no learner photo-upload field. Integrate the shared component once rather than creating 285 separate upload integrations.

1. Confirm the organization's supported application registration, authentication and learner file permissions. Investigate Brightspace's authenticated file-submission APIs and an appropriate private submission location first. Hosting a SCORM package does not grant these permissions automatically; LTI sign-on alone also does not provide file storage or API authorization.
2. Use one Chapter 11 textbook question and a dedicated ungraded pilot location. Confirm upload, retrieval and replacement/deletion semantics before wiring it into the component. Do not repurpose an existing assessed assignment or create one submission folder per question.
3. Use the student's existing Brightspace session through an approved authentication flow. Keep client secrets and privileged credentials out of the SCORM package. No separate student account is part of the intended experience.
4. Associate each photo with its authorized learner, course/attempt and stable question ID. Store image bytes in the approved file location; retain only compact references in course state. Show a photo as synced only after both the upload and its saved reference succeed. Preserve existing local photos and export support.
5. Have the user test the packaged pilot in the actual Brightspace student flow: upload a photo, leave the course, and reopen the same question in a fresh browser or another device. Confirm the image appears inside the activity and in the Process Collection. Confirm another learner cannot retrieve it and that failed uploads remain visibly pending or failed.
6. After that round trip succeeds, use the same adapter for all three Biology chapters. Verify replacement, removal, the three-photo limit and printable reports. If the organization cannot enable the required integration, record the blocker and retain explicitly browser-local photos; do not advertise cross-device photo saving or automatically introduce another storage service.

D2L references: [file uploads](https://docs.valence.desire2learn.com/basic/fileupload.html), [API authentication](https://docs.valence.desire2learn.com/basic/apicall.html), and [LTI Advantage](https://community.d2l.com/brightspace/kb/articles/23660-lti-advantage-v1-3). These document platform capabilities, not this organization's enabled permissions.

## Validation and release sequence

- Freeze the reviewed sources. Resolve course-specific content/readiness blockers and supported authoring ownership before enabling exports; changing blocked or export flags alone is insufficient. Keep prior pilots, other units and the separate advanced course outside this batch.
- During implementation, use targeted state-compatibility and authenticated-file checks. At rollout, run one accumulated validation batch: focused course/state checks, `npm run test:scorm`, `npm run test:e2e:scorm`, the affected project E2E contracts, and applicable Studio/readiness gates. Do not treat existing simulated-LMS results as live Brightspace proof.
- Cover a fresh attempt, a returning learner, another learner on the same browser, fresh-browser/device resume, longer written work, practice/Frayer/textbook work, save failure/retry, oversized state, required versus optional completion, and time over two sessions including hidden/idle periods. Ensure Chemistry has only one LMS lifecycle owner.
- Export each approved project with `npm run export:scorm -- --project <slug> --version 2004`. Inspect ZIP integrity, packaged assets and `scorm-tracking-report.json`; record package hashes and source revision.
- Pilot Chapter 11 first, including the photo round trip. Then verify the other three packages in Brightspace. Confirm actual teacher-visible completion and time; page-level timing in saved state is not automatically a native Brightspace report.
- Test an existing learner attempt after a package update before replacing a live version. Preserve package/course identifiers and retain the previous package for rollback.

## Next action

Upload the Chapter 12 review ZIP to a sandbox Brightspace topic and test writing, resume, completion and time with two learner sessions. The organization URL is confirmed; obtain approved application/API configuration to connect the one-question photo pilot. Current ZIP photos remain browser-local. Test an existing attempt separately: original native Chemistry saves migrate, but older shared localStorage envelopes require explicit migration. Defer expansion to Chapter 11/13 and Chemistry until the user requests it; retain all course readiness blockers and release gates.
