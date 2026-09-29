---
name: game-smoke
description: Load-smoke a standalone HTML game file and verify every referenced asset resolves.
---

Use after any edit to a standalone single-file HTML game.

## Steps

1. Syntax-check the embedded script (extract or `node --check` the JS; HTML itself is not checkable by node).
2. Load the exact final file bytes in a browser-less harness or real browser: initialize, advance at least one state/frame, confirm zero runtime errors.
3. Resolve check: parse every constructed asset URL (including JS-built paths like `"assets/g3-tile-" + name + ".png"`) and confirm each file exists on disk. Array lengths (e.g. TILES) must match the milestone/dot/level count the game logic expects.
4. Re-run the smoke after every subsequent edit to that file.

## Rules

- HTTP 200 or "file opens" proves reachability only, never correctness.
- A dynamically built URL that 404s (wrong name, missing file) is the most common break — check names, not just folders.
- Never invent a server for a standalone artifact; hand off the exact file path plus the smoke result.
