# Assets and visual contract

## Canonical direction

The unchanged `reference/Science24_Games_Visual_Standard_v0.1.md` and `reference/Science24_Games_Visual_Reference_A1_v0.1.png` define the visual family. Version 1.2.0 is a navigation refinement on the repaired game, **not a new visual-standard version**.

The implementation uses charcoal `#161b18`, forest `#1d4027`, course green `#23b75a`, pale selected fill `#edf5ee`, paper `#f5f7f3`, white and restrained neutral borders. Primary controls and section headers use forest green, not cyan. The three workspace regions remain recognisable on phones when stacked. Corner radius is modest; shadows are minimal. Typography uses an installed system sans-serif stack, so no font files or remote fonts are bundled.

The Next Step wordmark is authored text with simple chevrons, consistent with the approved concept reference. It is not claimed to be an independently supplied official vector logo. Replace only with Dean's authorized logo asset in a later brand-integration pass; do not invent a mascot.

## Runtime assets

| Local file, under `game/assets/scenes/` | Use |
|---|---|
| `scene_01_peroxide.webp` | Intro and worked context; existing unlabelled source alternative |
| `scene_02_cooling_solution.webp` | P01 context |
| `scene_03_rusting_tool.webp` | P02 context |
| `scene_04_antacid_model.webp` | P03; crop excludes the acid-labelled bottle |
| `scene_05_combustion_furnace.webp` | P04 context |
| `scene_06_boiling_transfer.webp` | Retained as a documented asset; intentionally not displayed in the independent transfer |

`ASSET_PROVENANCE.json` records source filenames, crop coordinates, dimensions and hashes. No new image model generations were used in this repair. Existing supplied art was selected/cropped/compressed. Original art ownership/permissions are inherited from Dean's supplied package; no new third-party asset licence is asserted.

UI icons are deterministic inline SVG paths in `game.js`, sized and coloured in CSS. These include flask, record, temperature, observe, vapour, tool, location, solid, check, hint, arrow, retry and print concepts. They are not character sprites or baked screen images. Text/values always remain HTML. No external icon library, font file or image-based controls are required.

## Scientific presentation boundary

Glassware marks in context art are decorative and never used to calculate or identify anything. Every context panel states that the written record is authoritative. No answer requires seeing the photo; decorative images have empty alt text and the complete evidence is available in text. An actual image decode failure has a visible fallback and does not disable controls.

Do not reuse the approved concept's sample chemistry labels as content. Its approval was about aesthetic. Do not add formula labels, concentration claims, numerical thermometers or answer keys to generated pixels.

## Actual screens

`qa/screenshots/` contains screenshots of the functioning repaired game. These are evidence, not runtime UI textures. `20_actual_game_desktop.png` and `21_actual_game_mobile.png` show the same authored P02 investigation state. Other screens include intro, worked explanation, initial/answered practice, conventional transfer, review and print styling. The font rendering shown is from the recorded Linux Chromium environment and can differ slightly on macOS/Windows.

Do not render the game as one giant screenshot with invisible hotspots. The actual interface is responsive semantic HTML.
