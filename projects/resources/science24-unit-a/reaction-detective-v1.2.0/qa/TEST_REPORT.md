# Test report — Reaction Detective 1.2.0

## Result

**842 engine tests and 404 browser/interface assertions passed; zero failures in these suites.** These are automated test cases/assertions, including repeated viewport checks, not 1,246 independently reviewed curriculum outcomes. Package structure and hashes have a separate verification receipt.

| Suite | Passed | Failed | Actual scope |
|---|---:|---:|---|
| Pure engine | 842 | 0 | Evidence/claim/type/application combinations; token rules; immutability; stale-success rejection; revision; uncertainty; history; hint caps; exact four-item review gate; first transfer preservation |
| Core browser flow | 88 | 0 | Intro, worked example, every practice/transfer/review screen; misconception/correction/follow-up paths; dialogs; replay; naming/focus; print action; no external requests |
| Responsive routes | 277 | 0 | Complete route at 360, 390, 430, 768, 1024, 1440 and 1648 CSS px; no horizontal overflow or off-viewport controls; 390px touch emulation; selected computed text-contrast and 44px target checks |
| Keyboard and stress | 39 | 0 | Entire route using only keyboard; modal focus; reduced motion; escaped HTML; 2,200-character unbroken text; missing-image fallback; CSS 200% zoom stress and reflow |
| **Total** | **1,246** | **0** | See method and limitations below |

## Exact tested artifact

`PLAY.html` SHA256: `ebd9f60548887206e144fbbc3fece4d90877fbe47c01422d5aac943341c0fc70`  
Size: 699,281 bytes.

`TEST_SUMMARY.json` also records input archive and engine/scenario hashes. Every JSON browser receipt is bound to this exact PLAY hash. Engine raw output is `engine-tests.tap`. Screenshots are captured from this runtime, not generated design images.

Environment: Chromium 144.0.7559.96 (Linux headless), Node 22.16.0, Python 3.13.5, Playwright 1.57.0.

## How the browser tests ran

The managed browser in the authoring environment blocks navigation to both `file://` and localhost URLs with `ERR_BLOCKED_BY_ADMINISTRATOR`. The tests did **not** change or bypass those policies. Instead they loaded the exact self-contained `PLAY.html` string into a Chromium document using `set_content`. The actual HTML, JavaScript engine, controls, styles and embedded images executed. No mock UI, screenshot hotspots or debug-state injection replaced the interactions.

This verifies the runtime flow and rendering, but not opening an HTML attachment, HTTP routing, server headers, an LMS iframe or the user's specific browser/security policies. The source-folder entry and references were checked structurally. The intended host must still be tested in its own environment.

The 390px route uses a touch-enabled/mobile-emulated browser context and taps actual targets. It is not a physical-phone test. The text contrast check computes foreground/background ratios for visible rendered text in sampled states, including alpha backgrounds, with normal/large-text thresholds. It is a custom diagnostic, **not axe and not a WCAG certification**.

The keyboard route uses Tab, arrows, Space, Enter and text typing for the complete learning sequence. A separate later robustness section uses normal DOM interaction. 200% tests use CSS zoom/reflow stress; native browser zoom was not accessible as a separately verified action.

The print action was invoked with a harness print stub and the resulting print-media rendering captured. No printer/PDF-driver or actual browser print dialog is claimed tested.

## Significant regressions exercised

- **Reversible navigation:** Previous returns to the worked example or earlier cases without deleting the current draft, opened/selected evidence, submitted feedback state, or later in-progress work. Returning forward restores that state. Review can return directly to transfer.
- A passed answer locks. Explicit revision removes Next case and requires rechecking. An altered fingerprint cannot finalize.
- Review needs exactly four literal true self-check values. Empty, short, long or truthy-nonboolean arrays cannot bypass the engine.
- A newly reached case starts blank. Moving backward restores the earlier case exactly as left, and moving forward again restores the later in-progress draft. Investigation reopens keep earlier attempts, hint count and previously seen identities.
- P01 uncertainty is justified under incomplete evidence, cannot finish the case, and has a working free follow-up. A third selected evidence record is rejected until one is removed.
- P02 practical protection is required and wrong responses fail. Unconditional composition is not accepted.
- P03's specific acid–carbonate/neutralization label is accepted in the supplied model.
- P04 requires inlet/outlet evidence and distinguishes the carbon-containing product from water vapour without denying its greenhouse role.
- A wrong first transfer followed by a correct retry remains corrected-after-feedback, even on replay. A clean first transfer is also recorded correctly.
- Empty explanations do not count as complete attempts; arbitrary text is never given a scientific-reasoning score.
- Escape cancels confirmations and restores focus. The app is not one large live region.
- Missing context art never removes science records. Learner markup stays literal; long unbroken text cannot force horizontal overflow.
- All runtime images decode along tested normal routes; no captured JavaScript errors or non-data network requests occur.

## Visual inspection

Actual desktop investigation, intro, worked example, feedback, transfer, review and 390px mobile screens were inspected. The live game restores forest-green panel headers and the three-zone workspace from the approved reference. It does not copy the reference image's incidental scientific text. Input borders were strengthened and the skip link is hidden except when focused. Mobile uses stacked regions rather than shrinking desktop labels. Transfer deliberately uses a simpler paper-like layout.

Main preview: `screenshots/20_actual_game_desktop.png`. Same state on mobile: `screenshots/21_actual_game_mobile.png`.

## Still separate release checks

| Check | Status / reason |
|---|---|
| Teacher scientific and exam-demand review | **Not performed by an independent teacher here.** See source/mapping document; written explanations remain ungraded. |
| Actual VoiceOver/NVDA route | **Not tested.** Native semantics/focus and keyboard route tested; real assistive technology is a separate check. |
| Real phone and Safari/Firefox | **Not tested.** Chromium responsive/touch emulation is not hardware/cross-browser testing. |
| Native browser zoom / browser print dialog | **Not tested separately.** CSS zoom/reflow and print-media behaviour tested as described. |
| Direct extracted-file/host navigation | **Not tested here** because of managed browser navigation restrictions. |
| Live course, CSP, iframe, LMS/SCORM and required-progress integration | **Not tested / not changed.** No deployment was performed. |
| Learning effectiveness / complete Science 24 coverage | **Not established.** This is a focused six-case activity, not full-course or exam-readiness certification. |

The result is a repaired, tested standalone candidate ready for Dean's review and host validation—not an invented “100% classroom-certified” label.
