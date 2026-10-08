# Shared Code Architecture

```text
/game/
  index.html
  css/
    tokens.css
    shell.css
    components.css
    game.css
  js/
    app.js
    state.js
    navigation.js
    accessibility.js
    engine.js
    renderers/
  data/
    scenarios.json
    answer_feedback_rules.json
  assets/
    scenes/
    sprites/
    icons/
  tests/
/docs/
```

## Separation of concerns
- **Content:** versioned JSON only.
- **Domain engine:** pure functions that calculate/validate science.
- **State machine:** stage transitions, reversible navigation, retry and revision state.
- **Renderers:** game-specific DOM/SVG presentation.
- **Shared shell:** header, title, progress, navigation, feedback/key-idea strip and review.
- **Tests:** solve every scenario independently and test correct, misconception, incomplete and valid-alternative paths.

No answer key or science rule should be buried in an event handler.
