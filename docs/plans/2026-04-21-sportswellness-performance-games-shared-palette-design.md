# Sports Wellness Performance Games Shared Palette Design

**Goal**

Make all four injected `Performance` games read as one Sports Wellness family by using the same course palette across their shells, panels, actions, and dominant gameplay surfaces.

**Approved direction**

- Use one shared Sports Wellness palette for all four games.
- Keep the course dark-slate background and panel system:
  - background `#0b111a`
  - secondary background `#111822`
  - panel `#151b25`
  - panel-alt `#0f131a`
  - line `#2a3748`
  - text `#f4f7fb`
  - muted text `#9aa6b6`
- Use the course mint pair as the primary positive/action signal:
  - primary `#00ffca`
  - primary-dim `#00a676`
- Keep semantic alert colors only where the gameplay needs real contrast:
  - red for threat, failure, and damage
  - amber only where a warning state is meaningfully different from success

**What changes**

- All four standalone game HTML wrappers load one shared theme stylesheet.
- Shared wrapper/body colors, panel backgrounds, borders, text, and positive-action colors are remapped to the course palette through common CSS overrides.
- Per-game hardcoded arena colors that bypass utility classes are manually aligned:
  - Phase 1 arena and chart accents
  - Phase 2 outcome-zone gold/yellow treatment
  - Phase 3 court and hit-zone colors
  - Phase 4 core arena background where needed

**What stays the same**

- Game mechanics
- Scoring logic
- Movement logic
- Audio behavior
- Imported gameplay copy unless a color label must change to stay accurate

**Implementation shape**

- Add `projects/sportswellness/workspace/performance/performance-game-theme.css` as the shared palette source of truth for the injected games.
- Update each `performance/*.html` wrapper to load that stylesheet and mark the page with a shared theme class.
- Patch only the hardcoded colors in the four `*.app.js` files that the stylesheet cannot reliably override.
- Keep the course shell and `Performance` menu logic unchanged beyond loading the same themed game pages.

**Risks**

- These games use Tailwind utility classes plus some hardcoded inline colors, so a CSS-only pass will not catch everything.
- Overriding utility classes too broadly could accidentally flatten semantic danger states if red and amber mappings are not preserved.
- Phase 3 has the largest visual drift because its court uses direct hex colors instead of mostly shared utility classes.
