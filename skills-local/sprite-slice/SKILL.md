---
name: sprite-slice
description: Slice uniform, centered sprite tiles from sheets or mockups with measured boxes and proof contact sheets.
---

Use when cutting multiple frames/tiles from a sprite sheet, contact sheet, or mockup screen.

## Steps

1. Identify the source (sheet vs mockup screen). Mockup slices match the game's real frames — prefer them over generic art when available.
2. Measure, don't eyeball: crop the region, then derive boxes from pixel data (divider-column darkness runs, row-brightness jumps for rails/wires/glow lines). Print profiles before committing boxes.
3. Exclude rails, wires, glow orbs, year labels, and divider lines. When glow encroaches, sample the center column to find the exact row it starts and cut above it.
4. Reframe every tile to identical square dimensions, content centered with even padding. Distinguish authentic art (painted light, poles, borders) from bleed before "fixing" anything.
5. Proof: contact sheet of all tiles on white, viewed at 100%+. Check each tile for divider slivers, glow nicks, clipped subjects, and size drift.
6. Stage versioned (`-v3`), update refs, verify all resolve, remove orphans.

## Rules

- Even-grid slicing is a first guess; hand-painted sheets are never perfectly even. Verify per-tile.
- If a slice catches something odd, sample pixels to classify it (art vs bleed) before re-slicing blind.
