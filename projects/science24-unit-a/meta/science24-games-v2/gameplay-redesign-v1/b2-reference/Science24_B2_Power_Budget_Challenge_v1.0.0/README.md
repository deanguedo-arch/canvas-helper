# Science 24 — B2 Power Budget Challenge

**Version 1.0.0 · 7 October 2026**  
**Status: functioning standalone game; teacher/host/device release checks remain.**

## Play

Open **PLAY.html** in a browser after downloading it. This one file contains the JavaScript, CSS, contextual artwork and icons. It needs no asset folder, account, server, installation or network connection.

The `game/` directory is the editable multi-file version. Keep its files together and open `game/index.html`, or serve that directory through the intended course host. Do not replace the game with a screenshot.

**Start guided route** opens the worked example and the sequence of practice tasks. **Open centre lab** opens the five-device, live-total management screen inspired by the approved B2 visual reference. The lab is optional open practice; it does not count as independent assessment evidence.

## What is implemented

- The charcoal, forest-green and white Next Step layout, including the three-panel mission/plan/budget workspace and feedback strip.
- A four-step worked example with previous/next controls.
- Three equipment-planning missions: lighting, computer room and projector replacement.
- An efficiency and complete-energy-account check.
- A fresh, conventional equipment-table transfer challenge with different data from the earlier practice.
- A five-device community-centre lab with live energy totals and an optional 12 kWh stretch target.
- Per-device input power, fixed device quantities, editable half-hour operating times, service floors, explicit W/kW display and Wh/kWh answer units.
- Exact derived energy totals and unit-aware numerical answer checks.
- Budget AND service validation. Switching all devices off does not win.
- Hints, feedback, replay/pause, revision, reversible stage navigation, first-submission records and a session review.
- Native labelled controls, focused status announcements, reduced-motion handling and narrow-screen layouts.
- Confirmation before starting over. Resetting the lab does not clear the guided route.

## Progress and privacy

Work is stored **only in memory in the open tab**. Previous, Next, Home and the stage navigation preserve answers, schedules, selected equipment, written work, hints, feedback and attempts. Reloading or closing the page ends the session. No browser storage, cookies, analytics, login, cloud saving, database or automatic submission is used.

A successful answer is locked. **Revise this answer** reopens it and invalidates the current pass until it is checked again. Earlier attempts remain in the record. Visiting a later previously unlocked step does not rewrite an earlier attempt or falsely mark the revised step complete.

The independent challenge captures its first complete submission. Corrections do not overwrite that record. Opening formula help or going back to practice before that submission is recorded as support. The game does not claim to monitor help outside the game.

## What the checks mean

The numerical calculations, constraints and selected reasoning answers are checked deterministically. Written explanations are retained and have a self-review checklist; they are **not automatically graded**. A completion screen is not a claim of mastery, course credit, exam readiness or full Unit B coverage.

## Developer commands

No npm packages are needed for the runtime or numerical tests.

```sh
python3 tools/build.py
node --test tests/engine.test.cjs
```

Browser tests require Python Playwright and an installed Chromium executable:

```sh
B2_CHROMIUM=/path/to/chromium python3 tests/browser_test.py
```

The default test executable path is `/usr/bin/chromium`. The browser harness executes the exact embedded `PLAY.html` bytes, not a recreated mockup. See `qa/TEST_REPORT.md` for the executed methods and untested host paths.

## Files

- `PLAY.html` — self-contained playable game.
- `game/` — editable source, data and image assets.
- `docs/` — gameplay, sources, changes and asset provenance.
- `qa/` — executed test evidence and actual runtime screenshots.
- `tests/` — numerical and browser tests.
- `tools/build.py` — rebuilds the single-file deliverable.
- `references/` — the approved shared visual standard and A1 reference.
- `CODEX_INTEGRATION_HANDOFF.md` — bounded instructions for integrating this actual game.

No live course, repository or deployment was changed by producing this package.
