# Handoff

- Project: `ai-course-building-resources`
- Task: add the approved AI Assessment Framework intro video, center that section, make the export self-contained, and deploy the digital presentation to Firebase Hosting
- Status: complete

## Summary
- The `DEANAIASSESSMENTPILLARS` resource keeps the original hero as the opening statement and adds the AI Assessment Framework MP4 as its own intro section immediately before `Why Assessment Has to Change`.
- The intro video section uses a centered stacked layout with the copy above the video, instead of the earlier two-column split.
- The single-HTML exporter now handles direct `<video src>` references, including videos inside recursively embedded iframe pages.
- The project now has a `google-hosted` Firebase target wired to Firebase project `calm-module-one` and Hosting site `digitalpresentation`.
- The Firebase-hosted digital presentation was deployed successfully to `https://digitalpresentation.web.app`.

## Files changed
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`
- `docs/plans/2026-04-28-ai-course-framework-video-design.md`
- `docs/plans/2026-04-28-ai-course-framework-video-plan.md`
- `projects/ai-course-building-resources/meta/project.json`
- `projects/ai-course-building-resources/meta/google-hosted.deploy.json`
- `projects/ai-course-building-resources/meta/google-hosted.firebase-config.json`
- `projects/ai-course-building-resources/meta/google-hosted.firebaserc`
- `projects/ai-course-building-resources/workspace/resources/dean-ai-assessment-pillars.html`
- `projects/ai-course-building-resources/workspace/resources/media/ai-assessment-framework.mp4`
- `projects/ai-course-building-resources/exports/google-hosted/**`
- `projects/ai-course-building-resources/exports/single-html/ai-course-building-resources.html`
- `publish-ai-course-building-resources.bat`
- `scripts/lib/exports/shared.ts`
- `scripts/tests/ai-course-building-resources.test.ts`
- `scripts/tests/ai-course-building-resources-google-hosted.test.ts`
- `scripts/tests/single-html-export.test.ts`

## Verification run
- `npx tsx --test scripts/tests/single-html-export.test.ts` failed first on missing `data:video/mp4`, then passed after the exporter patch.
- `npx tsx --test scripts/tests/ai-course-building-resources-google-hosted.test.ts` failed first on missing deploy metadata/export files, then passed after project wiring and export.
- `.\publish-ai-course-building-resources.bat`
- `npx tsx --test scripts/tests/ai-course-building-resources.test.ts scripts/tests/ai-course-building-resources-google-hosted.test.ts scripts/tests/google-hosted-export.test.ts scripts/tests/google-hosted-deploy.test.ts`
- `npm run verify -- --project ai-course-building-resources`
- `npm run typecheck`
- `npm run export:html -- --project ai-course-building-resources`
- `npm run build:studio`
- Live fetch confirmed `https://digitalpresentation.web.app/` serves the AI Course Building Resources shell with `google-hosted-bridge.js`.
- Live fetch confirmed `https://digitalpresentation.web.app/firebase-config.json` contains `calm-module-one`, `G-VPCR5TET7D`, and `projectSlug: ai-course-building-resources`.
- Live fetch confirmed `https://digitalpresentation.web.app/resources/dean-ai-assessment-pillars.html` contains the centered `framework-intro` section.
- Live HEAD confirmed `https://digitalpresentation.web.app/resources/media/ai-assessment-framework.mp4` returns `200 OK`, `Content-Type: video/mp4`, and `Content-Length: 18402905`.

## What changed
- Added `section#framework-intro` after the hero in `workspace/resources/dean-ai-assessment-pillars.html`.
- Added a controlled, non-autoplay `<video controls preload="metadata">` block pointing to `./media/ai-assessment-framework.mp4`.
- Updated the project manifest to include the `google-hosted` export target and tracked storage key `ai-course-building-resources::workspace-state::v1`.
- Added Firebase deploy metadata for `calm-module-one / digitalpresentation`.
- Added the Firebase web app config from the screenshot with app ID `1:217802069551:web:5e645b557a7edcd7a798da`.
- Added `publish-ai-course-building-resources.bat` to export, copy tracked Firebase config, and deploy.
- Added direct `video[src]` handling to the single-HTML resource inliner.
- Added tests for the AI-course Firebase deploy contract and updated the existing AI-course export-target contract.

## Why this changed
- The approved video design keeps the strong text hero intact while making the video a real "start here" moment before the conceptual shift section.
- Direct video-source inlining was needed so the primary HTML export remains self-contained.
- Firebase deployment follows the repo's shared `google-hosted` bridge pattern instead of pasting one-off Firebase initialization into the course runtime.

## Source of truth
- Canonical entry: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\ai-course-building-resources\workspace\index.html`
- Video placement source: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\ai-course-building-resources\workspace\resources\dean-ai-assessment-pillars.html`
- Video asset source: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\ai-course-building-resources\workspace\resources\media\ai-assessment-framework.mp4`
- Firebase deploy config: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\ai-course-building-resources\meta\google-hosted.deploy.json`
- Firebase app config: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\ai-course-building-resources\meta\google-hosted.firebase-config.json`
- Publish command: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\publish-ai-course-building-resources.bat`
- Live URL: `https://digitalpresentation.web.app`

## Fragile areas / watchouts
- The single-HTML export is about 57.7 MB because the 18.4 MB MP4 is embedded as base64; the Firebase-hosted deploy serves the MP4 as a separate file.
- The Firebase-hosted path uses the shared Google Hosted bridge, so sign-in/sync controls may appear on the live page.
- If future video sections use `<source>` children instead of direct `video[src]`, the exporter already supports that path, but tests should still cover the chosen markup.
- The project worktree already had unrelated AI-course and kainaeng changes before this task; do not revert them while continuing this work.

## Next prompt should assume
- The user approved the intro-section approach instead of replacing the hero.
- The live Firebase Hosting site for this project is `https://digitalpresentation.web.app`.
- The hosted deploy target is `calm-module-one / digitalpresentation`.
- The active hosted export path is `projects/ai-course-building-resources/exports/google-hosted`.

## What still needs validation
- Optional browser visual spot-check while signed out and signed in, especially whether the shared Google Hosted sync controls are acceptable for a presentation-only delivery.

## Known risks / follow-up
- Firebase CLI wrote debug noise to `firebase-debug.log`; that generated append was removed after deploy.
- The hosted deployment depends on the existing Firebase Authentication and Firestore setup in `calm-module-one` if sign-in/sync is used.

## Exact next command
`.\publish-ai-course-building-resources.bat`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\ai-course-building-resources\meta\google-hosted.deploy.json`

## Do not do next / warnings
- Do not replace the hero with the video unless the user explicitly changes direction.
- Do not edit `projects/ai-course-building-resources/raw/**`; this task changed workspace, metadata, tests, exporter behavior, docs, generated exports, and Firebase Hosting deployment only.
