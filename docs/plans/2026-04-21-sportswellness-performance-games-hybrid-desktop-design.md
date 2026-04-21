# Sportswellness Performance Games Hybrid Desktop Layout Design

**Date:** 2026-04-21

## Goal

Keep the `Performance` launcher visible as a side card on desktop while preserving the larger, focused game player on tablet and phone.

## Current problem

The fully focused launcher/player change fixed the cramped game surface, but it removed the desktop side rail that helped the course shell feel anchored. The user wants that menu card back on desktop without reintroducing the small boxed-in player.

## Recommended approach

Use a hybrid responsive shell:

- Desktop player mode renders a two-column layout.
- The left column keeps the `Performance` training menu visible as a side rail.
- The right column holds the game header and the large iframe player.
- Tablet and phone collapse back to the focused single-column player with the back-to-menu control.

## Why this approach

- It restores the desktop information architecture the user preferred.
- It keeps the larger game viewport that made the interactions more playable.
- It avoids duplicating integration logic inside the game wrappers because the change stays in the Sports Wellness shell.

## Render contract

- Launcher view remains the entry state for `Performance`.
- Player view on desktop includes:
  - a `performance-player-layout` wrapper
  - a `performance-player-sidebar` rail with the training menu and tool buttons
  - a `performance-player-stage` surface with the current tool header and iframe
- Player view on tablet and phone hides the sidebar rail and keeps the focused stage with the existing back button.

## CSS contract

- Desktop breakpoint uses a split grid with a fixed-width sidebar and flexible player stage.
- The stage iframe keeps the larger viewport-based height.
- Tablet and phone revert to a single-column player and full-width back button.

## Verification

- Update the source-based Performance menu test to lock the new desktop shell classnames.
- Run the focused Performance test, the UI-state test, and the Sports Wellness project E2E contract.

