# Sports Wellness Performance Games Focused View Design

**Goal**

Make `Performance` behave like a launcher instead of a side-by-side content panel so the selected game becomes the main surface on desktop, tablet, and phone.

**Approved direction**

- Entering `Performance` should show a launcher/menu view first.
- Selecting a game should switch the section into a focused player view.
- The focused player view should remove the large descriptive stage card and give the iframe most of the available content area.
- The only persistent chrome above a running game should be a slim toolbar with:
  - a back-to-menu control
  - the selected game title
  - a short support line only if it fits

**Why the current layout breaks playability**

- The current `performance-shell` uses a desktop split layout even when the user only needs the game.
- The selected game sits inside a second descriptive card and then inside another viewer box, which reduces usable width and height on all breakpoints.
- On tablet and phone, that nested structure creates a cramped iframe with its own scroll region rather than a game surface sized for the device.

**Target behavior**

- Desktop:
  - show a launcher grid when no game is open
  - once selected, show the game full-width in the content column
  - remove the menu from the running-game screen
- Tablet:
  - same launcher flow as desktop
  - the focused game should take nearly the full available width and viewport height
- Phone:
  - same launcher flow
  - the game view should prioritize the iframe over descriptive copy
  - avoid double-card nesting and give the game a viewport-based height

**State behavior**

- Keep `activePerformanceToolId` as the current selected game id.
- Add an ephemeral `activePerformanceView` with:
  - `menu`
  - `player`
- `setSection('performance')` should open the launcher view.
- `openPerformanceTool(id)` should switch to `player`.
- A new close/back action should return to `menu`.
- Do not persist `activePerformanceView`; the section should reopen as a launcher.

**Implementation shape**

- Update `renderPerformance()` in `workspace/main.js` so it renders one of two modes:
  - launcher markup
  - focused player markup
- Replace the current split-shell CSS with:
  - launcher grid styles
  - player toolbar styles
  - full-area iframe wrapper styles
- Use viewport-aware iframe sizing with `100dvh`/responsive fallbacks so the game surface scales with the screen instead of sitting inside a small fixed-height panel.

**What stays the same**

- The four game pages and their URLs
- The `Performance` navigation entry
- The imported game logic
- The shared palette work already completed

**Risks**

- If the viewport-height offsets are too aggressive, the iframe could run under the shell chrome on smaller screens.
- If the focused player view is persisted accidentally, the section may reopen mid-game instead of as a launcher.
- The iframe content still has its own internal layout rules, so a shell fix improves the available space but does not replace game-level responsive bugs if any remain.
