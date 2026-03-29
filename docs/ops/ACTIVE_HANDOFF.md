# Handoff

- Project: calm-life-adventure
- Task: Strip the Module 1 slice down further and remap the CALM content so it sits more naturally inside the decoded AGI rooms
- Status: ready for validation

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/styles.css
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/project.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md

## What changed
- Collapsed the layout further toward a single AGI play surface by removing the old side-dashboard composition and replacing it with a compact in-flow `Case File` block under the parser.
- Remapped the active Module 1 rooms around decoded AGI spaces more honestly: outside strip, side hall, lounge, and back room, instead of pretending the same logic still lived in a bedroom/classroom shell.
- Updated room copy, parser hints, and hotspot nouns so the current CALM tasks better match the new environments.
- Added source-derived NPC sprite presence to the rooms using exported `vBarGreaser`, `vBartender`, and `vReceptionist` assets so Maya, the mentor, and Ms. Singh are not just invisible labels.
- Expanded project metadata so the regeneration command now includes the additional AGI view assets used by the room remap.

## Verification run
- `node --check projects/calm-life-adventure/workspace/main.js`
- `python3 -m py_compile projects/calm-life-adventure/meta/extract-agi-view-assets.py projects/calm-life-adventure/meta/extract-agi-pic-assets.py`
- `npx tsx -e "import { loadProjectManifest } from './scripts/lib/projects.ts'; const main = async () => { const manifest = await loadProjectManifest('calm-life-adventure'); console.log(manifest.slug, manifest.workspaceEntrypoint); }; main().catch((error) => { console.error(error); process.exit(1); });"`

## Why this changed
- The user said plainly that only changing the character was not enough and that we should strip the project down and let the ZIP drive the real game style.
- This pass reduces more of the “lesson app around a game” feeling and starts reconciling the CALM activities with the actual AGI rooms instead of only swapping art assets.

## Source of truth
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/styles.css
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/extract-agi-view-assets.py
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/extract-agi-pic-assets.py
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/project.json

## Fragile areas / watchouts
- The game style is now much more source-driven, but the CALM puzzle logic is still custom, so some room semantics are still in transition.
- NPC sprites are now real AGI assets, but the hotspot boxes are still the interaction layer; the next pass should tighten those alignments further.
- Generated AGI assets under `workspace/assets/agi/**` remain regeneration outputs, not hand-edit targets.

## Next prompt should assume
- `calm-life-adventure` now uses decoded AGI room backgrounds, decoded AGI NPC/player sprites, and a more stripped-down single-column play layout.
- The next meaningful step is a deeper puzzle/content rewrite so the current Module 1 flow feels native to these rooms instead of adapted onto them.
- If we keep leaning into authenticity, more helper UI should be removed rather than added.

## What still needs validation
- Open the project in Studio/Canvas Builder and confirm the stripped-down layout feels more like a real AGI game.
- Check that the NPC sprites visually land in the intended places and that the updated hotspot nouns still feel usable.
- Play through the Module 1 path and decide what still feels too “lesson layer” versus “adventure logic.”

## Known risks
- The environments and sprites are now much closer to the target, but the actual puzzle grammar still needs another pass to fully feel like the original style.
- Because the AGI rooms are now more authentic, any hotspot misalignment will feel more obvious than it did before.

## Exact next command
`npm run studio`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js`

## Do not do next / warnings
- Do not hand-edit the generated AGI assets under `workspace/assets/agi/**`; regenerate them.
- Do not expand into Modules 2-4 yet; keep tightening Module 1 until the room logic actually feels right.
