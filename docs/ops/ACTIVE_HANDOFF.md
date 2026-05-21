# Handoff

- Project: `course-showcase`
- Task: Add Learning Strategies 15/25/35 under `LDC`, add Mental Health & Wellness under `Wellness`, and deploy the Course Showcase hub.
- Status: complete

## Summary
- Added the `LDC` filter to both desktop and mobile Course Showcase filter controls.
- Added Learning Strategies 15, Learning Strategies 25, and Learning Strategies 35 to the showcase registry under category/area `LDC`.
- Added Mental Health & Wellness to the showcase registry under category/area `Wellness`.
- Added valid local SVG icon assets for Learning Strategies and Mental Health & Wellness.
- Updated the Course Showcase UI test to assert the new filter and category membership.
- Deployed the Course Showcase hub.
- Live URL: `https://courseshowcasenextstep.web.app`.

## Files changed
- `projects/course-showcase/workspace/index.html`
- `projects/course-showcase/workspace/main.js`
- `projects/course-showcase/workspace/assets/course-icons/learning-strategies.svg`
- `projects/course-showcase/workspace/assets/course-icons/mental-health-wellness.svg`
- `projects/course-showcase/meta/showcase-ui.test.mjs`
- `projects/course-showcase/meta/project.json`
- `projects/course-showcase/meta/deviation-report.json`
- `projects/course-showcase/meta/deviation-report.md`
- `docs/ops/ACTIVE_HANDOFF.md`

## Verification run
- `node --test projects/course-showcase/meta/showcase-ui.test.mjs`
- `npm.cmd run validate:manifests -- --project course-showcase`
- `npm.cmd run verify -- --project course-showcase`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`
- `cmd.exe /c publish-course-showcase.bat`
- Live fetch checks for:
- `https://courseshowcasenextstep.web.app`
- `https://courseshowcasenextstep.web.app/main.js`
- `https://courseshowcasenextstep.web.app/assets/course-icons/learning-strategies.svg`
- `https://courseshowcasenextstep.web.app/assets/course-icons/mental-health-wellness.svg`
- Playwright live browser check confirmed the `LDC` filter shows Learning Strategies 15, 25, and 35, and the `Wellness` filter shows Sports Wellness plus Mental Health & Wellness.

## Known risks / follow-up
- The Course Showcase deploy regenerated the project deviation report timestamps and workspace approval timestamp.
- STAX observer may still report `Reject` because of stale unrelated command evidence; distinguish that from the successful live showcase deploy.

## Source-of-truth location
- `projects/course-showcase/workspace/main.js`
- `projects/course-showcase/workspace/index.html`
- `projects/course-showcase/meta/showcase-ui.test.mjs`

## Fragile areas / what might drift
- Course Showcase categories are hardcoded in both `index.html` filter buttons and `main.js` course entries.
- The `image` fields are not currently rendered in the rail, but the icon files are present so future image rendering does not break.

## Next prompt assumptions
- Keep the Course Showcase registry hand-maintained in `workspace/main.js` until a generated registry is introduced.
- Use `publish-course-showcase.bat` for future showcase deploys.

## Exact next command
`cmd.exe /c publish-course-showcase.bat`

## Exact next file to open
`projects/course-showcase/workspace/main.js`

---

- Project: `learning-strategies-15`, `learning-strategies-25`, `learning-strategies-35`
- Task: Configure Google-hosted Firebase deployment with shared Google sign-in sidebar controls, create publish batch files, and deploy all three live.
- Status: complete

## Summary
- Enabled the `google-hosted` export target in each Learning Strategies project metadata file.
- Added Firebase deploy metadata for Firebase project `calm-module-one`.
- Added the provided Firebase config for each course:
- Learning Strategies 15: Hosting site `learningstrategies15`, appId `1:217802069551:web:431d965ad3a30810a798da`, measurement ID `G-TL625EQEEK`.
- Learning Strategies 25: Hosting site `learningstrategies25`, appId `1:217802069551:web:4eaeb96ca6d3cf16a798da`, measurement ID `G-P851G5HSGG`.
- Learning Strategies 35: Hosting site `learningstrategies35`, appId `1:217802069551:web:f80d9ea77f09aef5a798da`, measurement ID `G-F3KV27YDKK`.
- Added individual publish files plus a combined `publish-learning-strategies.bat`.
- Published all three through the shared Google Hosted export/deploy flow.
- Live URLs:
- `https://learningstrategies15.web.app`
- `https://learningstrategies25.web.app`
- `https://learningstrategies35.web.app`
- The hosted bundles use the shared `google-hosted-bridge.js`, which embeds Google sign-in controls into the existing `.sidebar` shell.

## Files changed
- `projects/learning-strategies-15/meta/project.json`
- `projects/learning-strategies-15/meta/google-hosted.deploy.json`
- `projects/learning-strategies-15/meta/google-hosted.firebase-config.json`
- `projects/learning-strategies-15/meta/google-hosted.firebaserc`
- `projects/learning-strategies-25/meta/project.json`
- `projects/learning-strategies-25/meta/google-hosted.deploy.json`
- `projects/learning-strategies-25/meta/google-hosted.firebase-config.json`
- `projects/learning-strategies-25/meta/google-hosted.firebaserc`
- `projects/learning-strategies-35/meta/project.json`
- `projects/learning-strategies-35/meta/google-hosted.deploy.json`
- `projects/learning-strategies-35/meta/google-hosted.firebase-config.json`
- `projects/learning-strategies-35/meta/google-hosted.firebaserc`
- `publish-learning-strategies-15.bat`
- `publish-learning-strategies-25.bat`
- `publish-learning-strategies-35.bat`
- `publish-learning-strategies.bat`

## Verification run
- `firebase.cmd hosting:sites:list --project calm-module-one --json --non-interactive`
- `npm.cmd run validate:manifests -- --project learning-strategies-15`
- `npm.cmd run validate:manifests -- --project learning-strategies-25`
- `npm.cmd run validate:manifests -- --project learning-strategies-35`
- `npm.cmd run verify -- --project learning-strategies-15`
- `npm.cmd run verify -- --project learning-strategies-25`
- `npm.cmd run verify -- --project learning-strategies-35`
- `npm.cmd run test:google-hosted`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`
- `cmd.exe /c publish-learning-strategies.bat`
- Live fetch checks for each course root URL, `firebase-config.json`, and `google-hosted-bridge.js`.
- Playwright live browser check confirmed `.sidebar .canvas-helper-google-hosted-controls--embedded` renders on all three live courses with no console errors.

## Known risks / follow-up
- A real Google account sign-in was not completed in-browser; the live anonymous page controls and hosted bridge are verified.
- The shared bridge button renders as `Sign in`; the status text may briefly show `Preparing cloud resume...` before the Google sign-in prompt state settles.
- This deploy assumes Google Authentication and Firestore rules are already configured in Firebase project `calm-module-one`, matching the other hosted courses.
- STAX observer may still report `Reject` because of stale unrelated command evidence; distinguish that from the successful live deploy.

## Source-of-truth location
- `projects/learning-strategies-15/meta/google-hosted.deploy.json`
- `projects/learning-strategies-25/meta/google-hosted.deploy.json`
- `projects/learning-strategies-35/meta/google-hosted.deploy.json`
- `publish-learning-strategies.bat`
- `projects/learning-strategies-15/exports/google-hosted`
- `projects/learning-strategies-25/exports/google-hosted`
- `projects/learning-strategies-35/exports/google-hosted`

## Fragile areas / what might drift
- Firebase Hosting site IDs are `learningstrategies15`, `learningstrategies25`, and `learningstrategies35`; changing them requires updating each `google-hosted.deploy.json`.
- The hosted export preserves `firebase-config.json` across re-export only after the first config is copied or present.
- The shared bridge embeds controls into `.sidebar`; if the shell sidebar class changes, sign-in placement may fall back to fixed positioning.

## Next prompt assumptions
- Use the shared Google Hosted bridge for sign-in and progress sync; do not add custom Firebase SDK initialization inside the course shell.
- Use `publish-learning-strategies.bat` to redeploy all three, or the individual course batch files for one course at a time.

## Exact next command
`cmd.exe /c publish-learning-strategies.bat`

## Exact next file to open
`projects/learning-strategies-15/meta/google-hosted.deploy.json`

---

- Project: `mental-health-wellness`
- Task: Configure Google-hosted Firebase deployment with shared Google sign-in sidebar controls, create a publish batch file, and deploy live.
- Status: complete

## Summary
- Enabled the `google-hosted` export target in `projects/mental-health-wellness/meta/project.json`.
- Added Firebase deploy metadata for Firebase project `calm-module-one` and Hosting site `mentalhealthandwellness`.
- Added the hosted Firebase config from the provided SDK snippet, including `appId` `1:217802069551:web:d496be960a9609daa798da` and measurement ID `G-M931KYR5EZ`.
- Added `publish-mental-health-wellness.bat`.
- Published the course through the shared Google Hosted export/deploy flow.
- Live URL: `https://mentalhealthandwellness.web.app`.
- The hosted bundle uses the shared `google-hosted-bridge.js`, which embeds the Google sign-in controls into the existing `.sidebar` shell.

## Files changed
- `projects/mental-health-wellness/meta/project.json`
- `projects/mental-health-wellness/meta/google-hosted.deploy.json`
- `projects/mental-health-wellness/meta/google-hosted.firebase-config.json`
- `projects/mental-health-wellness/meta/google-hosted.firebaserc`
- `publish-mental-health-wellness.bat`
- Existing Mental Health banner cleanup remains in:
- `projects/mental-health-wellness/workspace/content/chapter-5/index.html`
- `projects/mental-health-wellness/workspace/content/chapter-6/index.html`
- `projects/mental-health-wellness/workspace/content/module-index.css`
- `projects/mental-health-wellness/workspace/references/mental-health-wellness/assets/unit-5-6-office-wellness-banner.jpg`

## Verification run
- `firebase.cmd hosting:sites:list --project calm-module-one --json --non-interactive`
- `npm.cmd run validate:manifests -- --project mental-health-wellness`
- `npm.cmd run verify -- --project mental-health-wellness`
- `npm.cmd run test:google-hosted`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`
- `cmd.exe /c publish-mental-health-wellness.bat`
- Live fetch checks for:
- `https://mentalhealthandwellness.web.app`
- `https://mentalhealthandwellness.web.app/firebase-config.json`
- `https://mentalhealthandwellness.web.app/google-hosted-bridge.js`
- Playwright live browser check confirmed `.sidebar .canvas-helper-google-hosted-controls--embedded` renders with sign-in/status controls.

## Known risks / follow-up
- The shared bridge shows the main action button text as `Sign in`; the status text below says `Sign in with Google to sync progress.`
- This deploy assumes Google Authentication and Firestore rules are already configured for Firebase project `calm-module-one`, matching the other hosted courses.
- Regenerating from the original Brightspace ZIP must preserve the manual Unit 5/6 banner override unless the builder is updated for that override.
- STAX observer can still report `Reject` because of stale unrelated command evidence; distinguish that from the successful live deploy.

## Source-of-truth location
- `projects/mental-health-wellness/meta/google-hosted.deploy.json`
- `projects/mental-health-wellness/meta/google-hosted.firebase-config.json`
- `publish-mental-health-wellness.bat`
- `projects/mental-health-wellness/exports/google-hosted`

## Fragile areas / what might drift
- Firebase Hosting site ID is `mentalhealthandwellness`; changing it requires updating `google-hosted.deploy.json`.
- The hosted export preserves `firebase-config.json` across re-export only after the first config is copied or present.
- The shared bridge embeds controls into `.sidebar`; if the shell sidebar class changes, sign-in placement may fall back to fixed positioning.

## Next prompt assumptions
- Use the shared Google Hosted bridge for sign-in and progress sync; do not add custom Firebase SDK initialization inside the course shell.
- Use `publish-mental-health-wellness.bat` for future deploys.

## Exact next command
`cmd.exe /c publish-mental-health-wellness.bat`

## Exact next file to open
`projects/mental-health-wellness/meta/google-hosted.deploy.json`

---

- Project: `english-9-resource-folder`, `mathematics-9-resource-folder`
- Task: Build teacher-facing English Language Arts 9 and Mathematics 9 resource folders organized by Brightspace unit from the supplied D2LExport ZIPs.
- Status: complete

## Summary
- Created `projects/english-9-resource-folder`.
- Created `projects/mathematics-9-resource-folder`.
- Added a shared manifest-driven builder at `scripts/lib/grade9_resource_folder_builder.py`.
- Built clean resource folders:
- `projects/english-9-resource-folder/exports/resource-folder`
- `projects/mathematics-9-resource-folder/exports/resource-folder`
- Built portable ZIPs:
- `projects/english-9-resource-folder/exports/english-9-resource-folder.zip`
- `projects/mathematics-9-resource-folder/exports/mathematics-9-resource-folder.zip`
- English 9: organized 67 manifest-referenced downloadable resources across 13 unit folders; 5 source-hidden units are marked `_HIDDEN`; 45 unreferenced downloadable files preserved separately.
- Mathematics 9: organized 49 manifest-referenced downloadable resources across 11 unit folders; Unit 8 and Unit 9 have 0 downloadable files but are preserved; 36 unreferenced downloadable files preserved separately.
- Added generated `README.md` and `resource-folder-audit.json` files for both projects.

## Files changed
- `scripts/lib/grade9_resource_folder_builder.py`
- `scripts/tests/english_math_9_resource_folders_test.py`
- `projects/english-9-resource-folder/meta/build_resource_folder.py`
- `projects/english-9-resource-folder/meta/project.json`
- `projects/english-9-resource-folder/meta/resource-folder-audit.json`
- `projects/english-9-resource-folder/exports/resource-folder/**`
- `projects/english-9-resource-folder/exports/english-9-resource-folder.zip`
- `projects/mathematics-9-resource-folder/meta/build_resource_folder.py`
- `projects/mathematics-9-resource-folder/meta/project.json`
- `projects/mathematics-9-resource-folder/meta/resource-folder-audit.json`
- `projects/mathematics-9-resource-folder/exports/resource-folder/**`
- `projects/mathematics-9-resource-folder/exports/mathematics-9-resource-folder.zip`
- `.stax/task.md`
- `.stax/codex-report.md`
- `docs/ops/ACTIVE_HANDOFF.md`

## Verification run
- `python scripts/tests/english_math_9_resource_folders_test.py`
- `npm.cmd run validate:manifests -- --project english-9-resource-folder`
- `npm.cmd run validate:manifests -- --project mathematics-9-resource-folder`
- `npm.cmd run verify -- --project english-9-resource-folder`
- `npm.cmd run verify -- --project mathematics-9-resource-folder`
- ZIP integrity check with Python `zipfile.testzip()` for both ZIPs.

## Known risks / follow-up
- These are resource folders only, not converted course shells.
- English and Math exports were downloadable-resource packages; no HTML lesson shell was produced.
- Math source includes four Science files in `unreferenced-source-files`; they were preserved because they are present in the source ZIP, but not assigned to Math units.
- Unreferenced files may be older duplicates or alternate copies; they are preserved separately rather than assigned to units by filename guessing.

## Source-of-truth location
- `scripts/lib/grade9_resource_folder_builder.py`
- `projects/english-9-resource-folder/meta/resource-folder-audit.json`
- `projects/mathematics-9-resource-folder/meta/resource-folder-audit.json`
- `projects/english-9-resource-folder/exports/resource-folder/README.md`
- `projects/mathematics-9-resource-folder/exports/resource-folder/README.md`

## Fragile areas / what might drift
- Regeneration depends on `ENGLISH_9_SOURCE_ZIP` / `MATHEMATICS_9_SOURCE_ZIP` or the current local Downloads ZIP paths.
- Project metadata uses concrete generated README and ZIP paths because generated-output verification does not treat globs as artifacts.

## Next prompt assumptions
- The user wants original downloadable Word/PowerPoint/PDF resources grouped by unit, not a transformed LMS course.
- Manifest order is the correct teacher-facing unit order.

## Exact next command
`python scripts/tests/english_math_9_resource_folders_test.py`

## Exact next file to open
`projects/english-9-resource-folder/exports/resource-folder/README.md`

---

- Project: `science-9-resource-folder`
- Task: Build a teacher-facing Science 9 resource folder organized by Brightspace unit from the supplied D2LExport ZIP.
- Status: complete

## Summary
- Created `projects/science-9-resource-folder`.
- Parsed `imsmanifest.xml` from `D2LExport_151050_25-26 _ Science 9 _ Per 1(A) _ Sec 1_202652151.zip`.
- Built a clean resource folder at `projects/science-9-resource-folder/exports/resource-folder`.
- Built a portable ZIP at `projects/science-9-resource-folder/exports/science-9-resource-folder.zip`.
- Organized 44 manifest-referenced downloadable resources into 5 top-level unit folders:
- Unit A Biological Diversity: 13 files
- Unit E Space Exploration: 15 files
- Unit B Matter and Chemical Change: 10 files
- Unit D Electrical Principles and Technologies: 6 files, marked `_HIDDEN` because the source Brightspace unit was hidden
- Unit C Environmental Chemistry: 0 downloadable manifest files, marked `_HIDDEN` because the source Brightspace unit was hidden
- Preserved 75 downloadable files that were present in the ZIP but not referenced by the manifest under `unreferenced-source-files`.
- Did not duplicate the 348 HTML lesson pages and hundreds of lesson image/support files into unit folders; this package is for teacher-facing downloadable resources.
- Added a generated `README.md` and `resource-folder-audit.json` so the folder structure is explainable and reproducible.

## Files changed
- `projects/science-9-resource-folder/meta/build_resource_folder.py`
- `projects/science-9-resource-folder/meta/project.json`
- `projects/science-9-resource-folder/meta/resource-folder-audit.json`
- `projects/science-9-resource-folder/exports/resource-folder/**`
- `projects/science-9-resource-folder/exports/science-9-resource-folder.zip`
- `scripts/tests/science_9_resource_folder_test.py`
- `.stax/task.md`
- `.stax/codex-report.md`
- `docs/ops/ACTIVE_HANDOFF.md`

## Verification run
- `python scripts/tests/science_9_resource_folder_test.py`
- `npm.cmd run validate:manifests -- --project science-9-resource-folder`
- `npm.cmd run verify -- --project science-9-resource-folder`
- ZIP integrity check with Python `zipfile.testzip()`

## Known risks / follow-up
- The generated ZIP is large: about 1.62 GB, because the source package contains many large PowerPoint files and alternates.
- The source ZIP also contains full HTML lesson content and image assets; those were intentionally not duplicated into the resource-folder package.
- Unit C has no manifest-linked downloadable files, but the unit folder is still created so the Brightspace unit structure stays visible.
- Unreferenced downloadable files may be older duplicates or alternate copies; they are preserved separately rather than assigned to units by filename guessing.

## Source-of-truth location
- `projects/science-9-resource-folder/meta/build_resource_folder.py`
- `projects/science-9-resource-folder/meta/resource-folder-audit.json`
- `projects/science-9-resource-folder/exports/resource-folder/README.md`

## Fragile areas / what might drift
- Regeneration depends on `SCIENCE_9_SOURCE_ZIP` or the current local Downloads ZIP path.
- The project verifier checks concrete generated paths, so `project.json` lists the generated README and ZIP explicitly while the full folder is covered by the audit/test.

## Next prompt assumptions
- The user wants the resource package as original downloadable files, not a converted course shell.
- Manifest order is the correct teacher-facing unit order.

## Exact next command
`python projects/science-9-resource-folder/meta/build_resource_folder.py`

## Exact next file to open
`projects/science-9-resource-folder/exports/resource-folder/README.md`

---

- Project: `social-studies-9-resource-folder`
- Task: Build a teacher-facing Social Studies 9 resource folder organized by Brightspace unit from the supplied D2LExport ZIP.
- Status: complete

## Summary
- Created `projects/social-studies-9-resource-folder`.
- Parsed `imsmanifest.xml` from `D2LExport_151052_25-26 _ Social Studies 9 _ Per 1(A) _ Sec 1_202652100.zip`.
- Built a clean resource folder at `projects/social-studies-9-resource-folder/exports/resource-folder`.
- Built a portable ZIP at `projects/social-studies-9-resource-folder/exports/social-studies-9-resource-folder.zip`.
- Organized 18 manifest-referenced Office resources into 4 unit folders:
- Unit 1: 4 files
- Unit 2: 2 files
- Unit 3: 9 files
- Unit 4: 3 files, marked `_HIDDEN` because the source Brightspace unit was hidden
- Preserved 8 Office files that were present in the ZIP but not referenced by the manifest under `unreferenced-source-files`.
- Added a generated `README.md` and `resource-folder-audit.json` so the folder structure is explainable and reproducible.

## Files changed
- `projects/social-studies-9-resource-folder/meta/build_resource_folder.py`
- `projects/social-studies-9-resource-folder/meta/project.json`
- `projects/social-studies-9-resource-folder/meta/resource-folder-audit.json`
- `projects/social-studies-9-resource-folder/exports/resource-folder/**`
- `projects/social-studies-9-resource-folder/exports/social-studies-9-resource-folder.zip`
- `scripts/tests/social_studies_9_resource_folder_test.py`
- `.stax/task.md`
- `.stax/codex-report.md`
- `docs/ops/ACTIVE_HANDOFF.md`

## Verification run
- `python scripts/tests/social_studies_9_resource_folder_test.py`
- `npm.cmd run validate:manifests -- --project social-studies-9-resource-folder`
- `npm.cmd run verify -- --project social-studies-9-resource-folder`
- ZIP integrity check with Python `zipfile.testzip()`

## Known risks / follow-up
- The source package contains only Office documents plus XML metadata; there is no lesson HTML/content shell in this export.
- Unit 4 was hidden in the source course, but it was preserved because this is a resource folder request.
- The 8 unreferenced source files are preserved separately rather than assigned to units by filename guesswork.

## Source-of-truth location
- `projects/social-studies-9-resource-folder/meta/build_resource_folder.py`
- `projects/social-studies-9-resource-folder/meta/resource-folder-audit.json`
- `projects/social-studies-9-resource-folder/exports/resource-folder/README.md`

## Fragile areas / what might drift
- Regeneration depends on `SOCIAL_STUDIES_9_SOURCE_ZIP` or the current local Downloads ZIP path.
- The repo verifier only checks concrete generated paths, so `project.json` lists the generated README and ZIP explicitly while the full folder is covered by the audit/test.

## Next prompt assumptions
- The user wants the resource package as original Word/PowerPoint files, not a converted course shell.
- Manifest order is the correct teacher-facing unit order.

## Exact next command
`python projects/social-studies-9-resource-folder/meta/build_resource_folder.py`

## Exact next file to open
`projects/social-studies-9-resource-folder/exports/resource-folder/README.md`

---

- Project: `mental-health-wellness`
- Task: Evaluate the newly supplied Mental Health & Wellness D2LExport content-folder ZIP and use anything that improves the existing Forensics-style course shell.
- Status: complete

## Summary
- The new content-folder ZIP is useful, but only for a narrow gap.
- It contains additional coursefile resources: 40 images, 37 PDFs, 82 HTML files, and 8 Office documents.
- The first Mental Health & Wellness pass was already good for packaged lesson images: it copied 20 images from the original source package.
- The new ZIP resolved the three remaining PDF quickLinks that had previously been unavailable:
- `pregnancy-mental-health-grossesse-sante-mentale-eng.pdf`
- `Team-Based Healthcare Offers Proven Path to Improving Americans' Mental Health.pdf`
- `PrimaryCare_Overview_Reviews_Narrative_Summaries_ENG_0.pdf`
- The new ZIP does not contain the remaining shared-template `banner_06.jpg` references.
- Current audit now has 8 support files, 20 copied images, 0 unresolved links, and 2 unresolved assets, both shared-template banner images.

## Files changed
- `projects/mental-health-wellness/meta/build_forensics_style_course.py`
- `projects/mental-health-wellness/meta/source-zip-audit.json`
- `projects/mental-health-wellness/workspace/content/chapter-3/index.html`
- `projects/mental-health-wellness/workspace/content/chapter-4/index.html`
- `projects/mental-health-wellness/workspace/references/mental-health-wellness/linked-resources/**`
- `scripts/tests/mental-health-wellness-shell.test.ts`
- `.stax/task.md`
- `.stax/codex-report.md`
- `docs/ops/ACTIVE_HANDOFF.md`

## Verification run
- `node node_modules/tsx/dist/cli.mjs --test scripts/tests/mental-health-wellness-shell.test.ts`
- `python projects/mental-health-wellness/meta/build_forensics_style_course.py`
- `rg -n "missing-resource-link|quickLink\.d2l|pregnancy-mental-health|Team-Based%20Healthcare|PrimaryCare_Overview" projects/mental-health-wellness/workspace/content`
- `npm.cmd run verify -- --project mental-health-wellness`

## Known risks / follow-up
- The two remaining unresolved assets are `/shared/HTML-Template-Library/HTML-Templates-V3/pages/../_assets/img/banner_06.jpg` in Module 5 Summary and Module 6 Summary.
- Those shared-template banner images were not present in either Mental Health package.
- Regeneration now uses `MENTAL_HEALTH_WELLNESS_ASSET_ZIP` when set, or the supplied Downloads path by default.
- Live deploy was not requested and was not run.

## Source-of-truth location
- `projects/mental-health-wellness/workspace/index.html`
- Regeneration command: `python projects/mental-health-wellness/meta/build_forensics_style_course.py`

## Fragile areas / what might drift
- The project-local generator deletes and rebuilds the Mental Health workspace and raw folder.
- The auxiliary asset ZIP path is local-machine specific unless the environment variable points to a durable copy.
- The remaining `banner_06.jpg` references are from Brightspace shared template paths, not course package files.

## Next prompt assumptions
- Mental Health & Wellness is ready for review with the useful assets from the new D2LExport ZIP included.
- The first conversion was broadly correct; the new ZIP improves missing PDF resource coverage rather than changing the course shell.

## Exact next command
`npm.cmd run verify -- --project mental-health-wellness`

## Exact next file to open
`projects/mental-health-wellness/workspace/index.html`

---

- Project: `learning-strategies-15`, `learning-strategies-25`, `learning-strategies-35`
- Task: Convert the three supplied Learning Strategies Brightspace ZIPs into separate content-only course shells using the same Forensics 25-style behavior and cleanup pattern used for Mental Health & Wellness.
- Status: complete

## Summary
- Added three migrated conversion projects:
- `projects/learning-strategies-15`
- `projects/learning-strategies-25`
- `projects/learning-strategies-35`
- `projects/mental-health-wellness`
- Built each from its own supplied Brightspace ZIP as an individual course.
- Used the same student shell behavior as the recent Mental Health/Forensics-style course: sidebar navigation, lesson cards, iframe lesson view, local progress, Mark Complete flow, and blurred/blue locked next cards.
- Kept `quizzes`, `assignments`, and `library` arrays empty for now.
- Removed learner-facing LMS/admin material: Course Information, Keys, assignment booklets, assignment/dropbox directions, contact assignment, teacher guide/admin/source wording, and Next Steps blocks.
- Kept card headers to the content label, such as `Reading`, without repeating lesson-name trails.
- Applied link/readability cleanup so links are visually clickable and imported lesson bodies are less cluttered.
- Temporarily review-unlocked all lesson cards in Mental Health & Wellness plus Learning Strategies 15/25/35 so every card can be checked without completing earlier cards first.

## Files changed
- `projects/learning-strategies-15/**`
- `projects/learning-strategies-25/**`
- `projects/learning-strategies-35/**`
- `scripts/tests/learning-strategies-shells.test.ts`
- `.stax/task.md`
- `.stax/codex-report.md`
- `.stax/visual-proofs/manifest.json`
- `.stax/visual-proofs/learning-strategies-15-shell-proof.png`
- `.stax/visual-proofs/learning-strategies-25-shell-proof.png`
- `.stax/visual-proofs/learning-strategies-35-shell-proof.png`
- `.stax/visual-proofs/mental-health-wellness-review-unlocked.png`
- `.stax/visual-proofs/learning-strategies-15-review-unlocked.png`
- `.stax/visual-proofs/learning-strategies-25-review-unlocked.png`
- `.stax/visual-proofs/learning-strategies-35-review-unlocked.png`
- `docs/ops/ACTIVE_HANDOFF.md`

## Verification run
- `node node_modules/tsx/dist/cli.mjs --test scripts/tests/learning-strategies-shells.test.ts`
- `rg -n -i -g "*.html" "Course Information|Assignment Booklet|Teacher Guide|Contact Assignment|Retained content from the original|Brightspace module|Brightspace export|Source image unavailable|Content-only Brightspace conversion|source unit|original course package|Next Steps|sequence-title|sequence-note" projects/learning-strategies-15/workspace projects/learning-strategies-25/workspace projects/learning-strategies-35/workspace`
- `npm.cmd run validate:manifests -- --project learning-strategies-15`
- `npm.cmd run validate:manifests -- --project learning-strategies-25`
- `npm.cmd run validate:manifests -- --project learning-strategies-35`
- `npm.cmd run verify -- --project learning-strategies-15`
- `npm.cmd run verify -- --project learning-strategies-25`
- `npm.cmd run verify -- --project learning-strategies-35`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`
- Playwright rendered check for all three shells.
- STAX visual proof collection for all three shells.
- Review-unlock check:
  - `node node_modules/tsx/dist/cli.mjs --test scripts/tests/learning-strategies-shells.test.ts scripts/tests/mental-health-wellness-shell.test.ts`
  - Playwright rendered check for Mental Health & Wellness and Learning Strategies 15/25/35 confirming zero locked cards and zero disabled Mark Complete buttons on chapter 1.

## Known risks / follow-up
- The source ZIPs contain no packaged images. Missing source image references are represented by the student-facing `Image not available yet.` fallback.
- Source audits still show unresolved references because the Brightspace exports did not include those files: LS15 has 84, LS25 has 95, and LS35 has 91 unresolved references.
- Mental Health & Wellness is different: its ZIP contains image files and 20 images were copied; only 2 shared template banner references remain unresolved.
- Learning Strategies 15 images were restored from `C:\Users\dean.guedo\Downloads\D2LExport_68818_22-23 _ S2 _ Learning Strategies 15 (2018) _ Per 1_202652115.zip`: 67 images copied, 0 unresolved image refs.
- Learning Strategies 25 images were restored from `C:\Users\dean.guedo\Downloads\D2LExport_149442_24-25 _ Learning Strategies 25 (2018) _ Per 1(A-B)_202652130.zip`: 73 images copied, 0 unresolved image refs.
- Learning Strategies 35 images were restored from `C:\Users\dean.guedo\Downloads\D2LExport_149441_24-25 _ Learning Strategies 35 (2018) _ Per 1(A-B)_202652158.zip`: 61 images copied, 0 unresolved image refs.
- Live deploy was not requested and was not run.
- Quizzes and assignments are intentionally absent and should be added in a later pass.
- There are unrelated dirty files already present in the worktree; they were not reverted.

## Source-of-truth location
- `projects/learning-strategies-15/workspace/index.html`
- `projects/learning-strategies-25/workspace/index.html`
- `projects/learning-strategies-35/workspace/index.html`
- Regeneration commands:
- `python projects/learning-strategies-15/meta/build_forensics_style_course.py`
- `python projects/learning-strategies-25/meta/build_forensics_style_course.py`
- `python projects/learning-strategies-35/meta/build_forensics_style_course.py`

## Fragile areas / what might drift
- Each project-local generator deletes and rebuilds that project workspace and raw folder.
- The generator logic is duplicated across the three projects to match the current project-local builder pattern.
- Future assignment/quiz additions need tests updated so hidden tabs become visible only when real data exists.
- Review-unlock mode is currently hard-coded as `reviewUnlockAll = true` in the generated chapter scripts and project-local generators. Turn it back off before a student-facing release if sequential locking is desired.

## Next prompt assumptions
- The three Learning Strategies shells exist separately and are ready for browser review.
- Assignments/quizzes are deliberately excluded for now.
- Missing images come from absent Brightspace package assets, not from a failed copy step.

## Exact next command
`node node_modules/tsx/dist/cli.mjs --test scripts/tests/learning-strategies-shells.test.ts`

## Exact next file to open
`projects/learning-strategies-15/workspace/index.html`
