# Sportswellness Performance Games Minimal Player Shell Design

**Date:** 2026-04-21

## Goal

Make the selected `Performance` game the dominant surface on desktop, tablet, and mobile by removing the descriptive player header and tightening the outer shell chrome.

## Problem

The current hybrid layout restored the desktop side menu, but the selected game still sits under an extra title bar and inside a relatively heavy frame. That shell chrome wastes vertical space and makes the game feel smaller than it needs to be.

## Approved direction

Use one consistent player-shell rule across all breakpoints:

- remove the descriptive player title/body header
- keep only minimal navigation
- reduce the stage padding and chrome so the iframe takes most of the usable area

## Layout behavior

- Desktop keeps the side training menu card.
- Desktop removes the top player title strip entirely.
- Tablet and phone keep a minimal back/menu row only, with no descriptive title block.
- The player stage becomes visually lighter so the iframe reads closer to edge-to-edge.

## Render contract

- Replace the existing `performance-player-toolbar` / `performance-player-head` shell with a minimal `performance-player-nav`.
- Keep the `Back to training menu` control for non-desktop breakpoints.
- Keep the player stage and iframe source wiring unchanged.

## CSS contract

- Tighten player shell gaps.
- Narrow the desktop sidebar slightly so the stage gets more horizontal room.
- Reduce border/radius treatment around the player frame.
- Retune iframe height offsets now that the descriptive header is gone.

## Verification

- Update the source-based Performance shell test to require the new minimal-nav classname and to ensure the old descriptive player head is gone from `main.js`.
- Run the Performance source test, the UI-state test, and the Sports Wellness project E2E contract.

