# Mental Wellness Option 2 Phase 2 Assignment Restyle Design

**Goal**

Bring `2A` and `2B` onto the same authored shell language as Phase 1 without changing their current Phase 2 content model or save/load behavior.

**What “same style as Phase 1” means here**

- Use the Phase 1 assignment hero pattern:
  - left title block with assignment number, large uppercase title, and phase subtitle
  - right rail with score card and file-actions card
- Use the Phase 1 step-navigation treatment:
  - shell section around the nav
  - `p1-step-nav` / `p1-step-btn` visual language
- Use the Phase 1 step layout treatment:
  - strong step kicker
  - large step heading
  - explanatory paragraph with the same type rhythm
  - field cards built from the same label / helper / textarea pattern
- Use the Phase 1 review architecture:
  - left audit card stack
  - right narrative / synthesis cards
  - rubric table with the `p1-rubric-shell` / `p1-rubric-table` styling

**What stays the same**

- All current Phase 2 fields and ids
- Current Phase 2 save/load behavior
- Current Phase 2 scoring logic
- Current print-report logic
- Phase 3 / Phase 4 assignments

**Implementation shape**

- Rebuild the live `#view-values` and `#view-master` header markup inside `upgradePhase2Views()`.
- Replace the current Phase 2 step markup with Phase 1-style section markup while preserving the existing field ids.
- Extend the Phase 1 shell CSS selectors so the same typography and shell styling apply to `#view-values` and `#view-master`.
- Keep the change isolated to the live runtime source of truth: `assignment-runtime-main.js` plus the supporting CSS in `styles.css`.

**Risks**

- The live Phase 2 UI is runtime-generated, so the static HTML will still look older unless a future cleanup normalizes it.
- Extending Phase 1 shell selectors into Phase 2 must not break Phase 1 itself.
- Review-step and nav styling rely on shared Phase 1 class names, so selector drift in `styles.css` can affect both phases.
