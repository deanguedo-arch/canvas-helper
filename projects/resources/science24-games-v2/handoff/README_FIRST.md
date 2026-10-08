# Science 24 — All Eight Games Production Handoff v2.0

This package turns the eight-game concept set into a **build-ready visual, content, asset, code and QA specification** for Codex. It is designed so Codex can implement the games from executable screen sources rather than trying to imitate a screenshot from memory.

## Start here
1. Read `00_SHARED/MASTER_BUILD_CONTRACT.md`.
2. Read `00_SHARED/VISUAL_EXACTNESS_CONTRACT.md`.
3. Open `PREVIEW/all_games_title_overview.jpg` and `PREVIEW/all_games_mechanics_overview.jpg`.
4. Work on one game at a time using its `07_CODEX/CODEX_BUILD_PROMPT.txt`.
5. Treat `04_MOCKUPS/html/` as the exact executable visual source. The PNG files are deterministic reference previews; establish target-browser baselines from the same HTML.

## Included games
| ID | Game | Status | Package depth |
| --- | --- | --- | --- |
| A1 | Reaction Detective | PLAYABLE_REFERENCE | Functioning v1.2 reference + baseline screenshots |
| A2 | Atom Factory | PRODUCTION_HANDOFF | 7-screen exact mockup + assets + content + starter engine |
| B1 | Energy Chain Rescue | PRODUCTION_HANDOFF | 7-screen exact mockup + assets + content + starter engine |
| B2 | Power Budget Challenge | PRODUCTION_HANDOFF | 7-screen exact mockup + assets + content + starter engine |
| C1 | Break the Chain | PRODUCTION_HANDOFF | 7-screen exact mockup + assets + content + starter engine |
| C2 | Inheritance Detective | PRODUCTION_HANDOFF | 7-screen exact mockup + assets + content + starter engine |
| D1 | Safe Stop Challenge | PRODUCTION_HANDOFF | 7-screen exact mockup + assets + content + starter engine |
| D2 | Crash-Test Studio | PRODUCTION_HANDOFF | 7-screen exact mockup + assets + content + starter engine |

## What each game folder contains
- complete design, curriculum/exam alignment and content guardrails;
- authored scenario bank and exact answer/feedback rules;
- all deterministic SVG/PNG sprites and contextual scene images;
- seven executable responsive screen mockups;
- desktop/mobile PNG reference previews and contact sheets;
- pure JavaScript domain engine and passing starter tests;
- step-by-step implementation plan, QA gates and ready-to-paste Codex prompt.

## Critical distinction
A1 Reaction Detective is already a functioning tested reference. A2–D2 are **production handoffs**, not falsely labelled completed games. Their executable screens define the exact appearance and interaction states, while Codex still has to connect the full runtime, state machine and browser tests.

## Course/source boundary
The user-supplied current D2L export was audited for course chapters, vocabulary, assessments and formula demands. Secure assessment wording is not reproduced. The Alberta Science 24 program locators remain the curriculum authority; see `00_SHARED/ALBERTA_SCIENCE24_OUTCOMES_MATRIX.md`.

## Delivery philosophy
The mockup and implementation cannot drift apart because the mockups are actual HTML/CSS using the same supplied assets and design tokens intended for production. Codex is directed to copy and connect that source—not redesign it.
