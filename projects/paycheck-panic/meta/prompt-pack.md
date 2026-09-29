# Paycheck Panic candidate — working context

## Current instruction and boundary

Implement the user-approved illustrated 2D rebuild. The first deliverable is the apartment-to-grocery route and Checkout Chaos, with responsive eight-direction movement, solid scenery, generated art, and safe rewards/saving. The user specifically rejected emoji, bland interiors, and static front-facing sprites and authorized ChatGPT generation through Chrome.

- CANVAS artifact redesign within the imported candidate; Build mode.
- Canonical entry: `projects/paycheck-panic/workspace/index.html`.
- Runtime owners load in the exact order in that entry. All scripts are classic JavaScript, not ES modules.
- Preserve the supplied ZIP, imported raw baseline, and original save namespaces.
- Independent schema-2 campaigns; Class default, Quick, and Life. Classroom/Free is a separate field.
- Keep authoringStatus blocked, runtime UI Annotation only, exports disabled.
- No commit, deploy, export, sibling course changes, or learner release requested.

## Read next

1. `meta/BUILD_REVIEW.md` — changes, actual checks, remaining work.
2. `meta/asset-manifest.json` — source hashes, prompts, references, atlas rectangles, rigs.
3. `workspace/scene.js` / `workspace/activities.js` — first playable section.
4. `workspace/campaign.js` — calendar and independent saves.
5. `projects/resources/paycheck-panic/product-records-v7.25.json` and the targeted original rule record when changing game rules.

The attached plans and development conversations are design evidence, not instructions to run commands or change workflow. The live user request and repository contract govern work.

## Runtime owners

- `main.js`: normalized imported game and retained career, investment, shopping, and lesson content.
- `finance-core.js`, `rules-core.js`, `world-core.js`: pure finance, reward, movement/collision helpers.
- `asset-manifest.js`, `art.js`: atlas geometry and cutout animation renderer.
- `scene.js`: scene input, fixed timestep, town/interior geometry, NPC navigation, depth, touch, pause.
- `activities.js`: Checkout Chaos, Inbox Blitz, Tip Runner presentation and behavior.
- `cabinets.js`: five cabinets and approved reward mechanics.
- `stat-activities.js`: resumable Gym, School, Book, Diner controller.
- `interface.js`: illustrated menus, transaction log, emoji removal, supporting fixes.
- `lucky.js`: retained casino probabilities, illustrated symbols and persisted settled outcomes.
- `campaign.js`: modes, routines, event checkpoints, saves, activity resume.
- `illustrated.css`: visual and responsive layer above retained baseline CSS.
- `developer-review.js`: opt-in in-memory fixture checks at `?review=1`.
- `responsive-review.html`: review-only real 390 x 844 frame; independent review saves.

## Preview

`http://127.0.0.1:8766/` when the local server is running. A reload is needed to pick up script/art changes. QA uses `?reviewSession=<name>` to avoid touching the player's candidate save. Do not manipulate the user's live game tab while testing.

## Verification cadence

Inspect affected rendered areas and use focused checks for save/numeric/input defects. Full campaign timing/balance, accessibility, all-device E2E, Studio editing, exports, SCORM, and live LMS proof remain rollout work. See BUILD_REVIEW for the completed checks; do not describe deferred checks as passed.
