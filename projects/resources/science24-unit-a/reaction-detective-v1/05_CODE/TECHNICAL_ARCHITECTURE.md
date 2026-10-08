# Technical Architecture — A1 Reaction Detective v1.0

## Recommended stack

**HTML5 + CSS3 + vanilla JavaScript.**

Why:
- the game is a bounded interaction, not a large application;
- static hosting is simple;
- it can be embedded or linked from an LMS later;
- no framework runtime is required;
- no network services are required;
- accessibility can stay close to native HTML controls;
- the same shell can be reused for the remaining Science 24 games.

## Runtime dependencies

None.

Do not require React, Vue, a CDN, a database, analytics or an API for v1.

## Development pattern

- semantic HTML for structure;
- CSS custom properties for the shared Science 24 visual system;
- authored scenario data in JavaScript/JSON;
- one state object in memory;
- pure functions for structured answer validation;
- native buttons/radios/checkboxes/textareas where possible;
- local SVG icons;
- context art loaded from local assets.

## State model

Suggested state:

```js
{
  stage: 'intro' | 'worked' | 'practice' | 'transfer' | 'review',
  scenarioIndex: 0,
  prediction: null,
  tokensRemaining: 2,
  revealedEvidence: [],
  selectedEvidence: [],
  conclusion: null,
  reactionType: null,
  response: null,
  explanation: '',
  attempts: [],
  hintsUsed: 0,
  caseResults: {}
}
```

Case change must initialize case-specific fields. Never silently carry evidence selections or answers into the next case.

## Validation contract

Structured choices can be exact-checked from scenario data.

Open explanation:
- required where specified;
- saved in memory during the session;
- never declared correct by keyword matching;
- post-submit rubric may guide learner self-review.

## Hosting

The starter prototype runs as static files. For development use a local HTTP server such as:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` from the prototype folder.

For production, publish the static directory to the approved district/LMS hosting route. Do not add third-party telemetry by default.

## Future SCORM/LMS integration

Treat reporting as a separate wrapper. Do not intertwine LMS calls with the scientific model. A future adapter can listen to game events such as:

- `case_started`
- `case_submitted`
- `case_completed`
- `transfer_submitted`
- `game_reviewed`

No such reporting is active in v1.
