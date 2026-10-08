# B2 Power Budget Challenge — executed QA

**Build:** 1.0.0  
**Date:** 7 October 2026  
**Verdict:** Functioning browser build with the checks below passed; not yet certified for a particular course host or all devices/accessibility tools.

## Executed results

| Suite | Passed | Failed | Evidence |
|---|---:|---:|---|
| Pure calculation, validation and data tests | 76 | 0 | `engine-tests.tap`, `../tests/engine.test.cjs` |
| Chromium interaction and responsive checks | 119 | 0 | `browser-results.json`, `../tests/browser_test.py` |
| **Total named tests/checks** | **195** | **0** | These counts do not include informal visual inspection. |

No JavaScript runtime exceptions and no external HTTP(S) requests were observed during the exercised browser flows. This is an observation from the executed harness, not a claim about untested future integrations.

## Exact tested build and browser method

SHA256 of the tested `PLAY.html`:

```
5423cd6ee0f517567ee4744e5ab55d83e6a0b84ba24522407e409a1348db3a71
```

Numerical tests ran in Node.js v22.16.0. Browser checks ran with Python Playwright and **Chromium 144.0.7559.96** (`/usr/bin/chromium`, Debian 13), headless.

The harness loads the **exact self-contained PLAY.html content** into a real browser document with Playwright `page.set_content()`. The delivered JavaScript, CSS and embedded image assets execute; the screenshots are of this running application, not generated concept images.

Direct `file://` navigation was blocked by the execution environment with `ERR_BLOCKED_BY_ADMINISTRATOR`. That restriction was not bypassed. Consequently, local-file launching and source-directory/HTTP/LMS hosting are **Not tested** here. The delivered standalone file embeds all runtime resources and is intended to be opened after downloading it, but that separate launch path must be confirmed in the destination environment.

## What the tests cover

### Calculation and content validation

Energy = quantity × per-device watts ÷ 1,000 × hours; W/kW and Wh/kWh conversions; strict finite-number handling; incompatible/empty input; half-hour scheduling limits; quantities; equipment identities; minimum service requirements; budget comparisons on unrounded values; reasonable displayed-answer rounding tolerance; efficiency and other-output accounting; the worked, practice, new transfer and optional-lab answer records; fresh draft isolation; and replay totals.

The optional five-device lab's default is **14.920 kWh**, not the inconsistent 14.87 printed in the concept image. The minimum permitted services use **10.390 kWh**. The worked example totals 0.440 kWh; the practice projector replacement totals 0.369 kWh. The independent workstation case has distinct data and answers of 0.780 kWh initially and 0.580 kWh after the valid replacement.

### Interaction and progression

Worked-step Previous/Next; missing responses; rejecting an all-off plan; hint disclosure and retained hint counts; answer locking; explicit revision invalidating the current pass; required self-review; preserving checked and unfinished drafts through backward/forward navigation; retained explanations; correct equipment replacement; efficiency submission; hidden independent answers before submission; preservation of the first complete independent response across retries; support flags after returning to practice; session review; cancellation/confirmation of starting over; lab reset not deleting guided progress; and a clean complete route with an unassisted first transfer response.

### Robustness and accessibility-related behaviour

Targeted status/focus handling rather than whole-app live announcements; native form inputs; a keyboard-only primary planning path; native dialog Escape/return-focus behaviour; literal display of markup-containing student text without executing it; malformed schedules; image loading; reduced-motion replay; pause/resume; and layout overflow checks.

Responsive widths exercised: **320, 360, 390, 430, 590, 760, 768, 1024, 1366 and 1648 CSS pixels**. Home, centre lab, worked example and lighting were checked at each width. The independent screen and help dialog were also exercised at 390 px. Narrow-screen tests use browser viewport/touch emulation, not physical phones. They are not substitutes for real-device or screen-reader testing.

## Actual runtime screenshots

`qa/screenshots/` contains 12 browser captures: desktop home, centre lab, worked example, successful lighting/computer-room checks, efficiency feedback, independent task before submission, session review, and 390 px lab/lighting/independent/help screens.

Visual inspection confirmed the charcoal/forest-green/white system and the mission–plan–budget composition in the inspected desktop screens. Mobile content stacks without shrinking the desktop interface. Some representations intentionally change: the independent task uses a conventional table, while data and calculations use authored controls rather than generated pixels. This is not a claim of pixel-for-pixel equality to an image with incorrect arithmetic.

## Remaining release gates — NOT TESTED / NOT APPROVED

- Direct local-file launch and the final HTTP/LMS embedding environment.
- Real iPhone/Android hardware, Safari, Firefox and Edge.
- A screen reader such as VoiceOver or NVDA, real browser zoom/text enlargement, and a complete formal accessibility audit.
- Host policies, content-security-policy interactions, download behaviour and print behaviour in the intended course environment.
- Teacher content sign-off and exact placement in the live Unit B course.
- Learning effectiveness, long-term retention or exam performance.

Written explanations are **not automatically graded**. Numerical/closed-response success, student self-review and independent-first-response records are kept distinct. Session work survives in-game navigation but not closing/reloading the page. No live course or repository was modified.

## Re-run

From the package root:

```sh
python3 tools/build.py
node --test tests/engine.test.cjs
B2_CHROMIUM=/path/to/chromium python3 tests/browser_test.py
```

Runtime and numerical tests have no npm dependencies. Browser tests require Python Playwright and an installed Chromium executable. Re-run after any code/data change and replace the old evidence rather than copying its pass count forward.
