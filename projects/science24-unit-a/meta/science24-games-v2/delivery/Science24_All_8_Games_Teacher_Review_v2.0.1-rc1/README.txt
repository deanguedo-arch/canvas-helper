SCIENCE 24: EIGHT-GAME TEACHER REVIEW
Candidate: Science24-v2.0.1-rc1-a6e3202c2cd0

Double-click START_REVIEW.html, then choose a game. Each games/ID/PLAY.html also opens independently with no server or external services.
Anonymous work is held only in memory. Closing or reloading clears a session. Print a learner review before closing if a record is needed. Do not enter personal information.

Read TEACHER_GUIDE.html, VALIDATION_STATUS.json, CORRECTIONS.md and CURRICULUM_TASK_MAP.md before deciding. Use TEACHER_REVIEW.pdf or TEACHER_REVIEW_TEXT.txt to record approval. Approvals are pending. The candidate's visual exactness gate is recorded separately and may remain blocked; playable/technical checks do not constitute visual acceptance, teacher approval or release.

Reproduce in the originating Canvas Helper checkout with Node 22+, esbuild and Python/Playwright/Pillow/numpy/reportlab/pypdf available:
 npm run test:science24-games -- --game A2
 npm run test:science24-games
 npm run package:science24-games-review
Bundled copies of the scoped scripts are in tooling/. Source snapshots are in sources/; original references are in references/. The full immutable source handoff remains preserved in the repository; its SHA256 is in candidate.json. Do not edit PLAY.html; regenerate from canonical sources.

No secure course assessments or answer keys are delivered. These teacher solutions apply only to the original supplemental game cases. No SCORM, LMS save/resume, grades, publishing or course integration is included. Any substantive change invalidates affected approval and requires a new version/candidate.
