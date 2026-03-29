# Standalone CALM Life Game Web App Plan

## Summary
Build this as a brand-new standalone Firebase web app, not as an add-on inside the existing CALM module surfaces.

The app will be a single public-facing CALM capstone experience inspired by the Real Python Conway article's architecture:
- a reusable simulation engine
- modular content packs
- a browser UI
- Firebase hosting as the primary runtime

It should live in the repo as its own project, with its own deploy target, own workspace, and own identity, while drawing its themes and scenario content from CALM Modules 1-4.

## Key Changes
### 1. New standalone app
Create a new project, recommended slug:
- `projects/calm-life-game/`

It should have:
- its own `workspace/index.html`, `main.js|jsx`, and `styles.css`
- its own `meta/project.json`
- its own `meta/google-hosted.deploy.json`
- its own Firebase-hosted export/deploy flow
- no dependency on being embedded in `calm-module`, `calmmodule2`, `calmmodule3`, or `calm-module-4`

This is a capstone-style app, not a module patch.

### 2. Real Python adaptation
Adapt the article at the architecture level, not by copying the literal Python game.

Map the article's parts like this:
- grid/model layer -> pure browser simulation engine
- pattern definitions -> CALM scenario packs and starting profiles
- rendering/view -> standalone web app UI
- CLI entrypoint -> start screen, profile picker, replay controls, and stage navigation

The result is a browser-native "Game of Life" interpretation:
- each generation is a turn or life phase
- player choices influence future generations
- outcomes evolve from previous state plus linked domain effects

### 3. CALM 1-4 structure
The standalone app should be one linked experience with four stages:

- **Module 1 stage**
  - personal choices, relationships, risk, addictions, mental health
- **Module 2 stage**
  - needs vs wants, consumerism, budgeting, living scenarios
- **Module 3 stage**
  - goals, decision making, careers, workplace readiness
- **Module 4 stage**
  - planning, resumes, cover letters, transition-to-future choices

Shared life domains:
- `wellbeing`
- `relationships`
- `money`
- `careerReadiness`
- `stability`
- `stress`

The engine should support future alternate modes, but v1 ships as one standalone end-to-end simulation.

### 4. App behavior
Main user flow:
- landing screen
- choose a starting profile
- enter Stage 1
- progress through all four CALM stages
- see domain changes after each turn
- get triggered life events based on earlier decisions
- finish with a summary + reflection report

Required screens:
- intro / scenario picker
- main simulation dashboard
- turn/choice panel
- life history / generation timeline
- end-of-run reflection and summary

Required controls:
- start new run
- advance turn
- inspect current stats
- replay from beginning
- optional restart from current stage

### 5. Firebase-first delivery
This app is designed from day one as a standalone hosted site.

Deployment expectations:
- static browser app
- Firebase Hosting target dedicated to this app
- exported artifact follows the repo's existing `google-hosted` deployment pattern
- app should be independently launchable and shareable by URL

Recommended Firebase target:
- site id like `calm-life-game` or `calmlifegame`

## Tests and Acceptance
### Engine
- same seed + same choices always produce the same run
- domain interactions apply in a stable order
- events trigger only when conditions are met
- stage transitions preserve state correctly
- restart/replay fully resets state

### Content
- all four module packs load
- each stage has valid starting profiles and valid turns
- every run can reach the end summary
- no stage has dead-end content or missing transitions

### UI
- full run works on desktop and mobile
- stats update after every choice
- progression across Modules 1-4 is obvious
- final reflection is only shown after completion
- replay feels clean and not buggy

### Hosting
- project exports successfully
- Firebase deploy succeeds on its own hosting target
- hosted app loads directly by URL and survives reload/navigation

## Assumptions and Defaults
- This is a new standalone app, not an injection into existing CALM projects
- It still lives inside this repo as a new project slug
- Existing CALM module resources are the content authority for scenarios and prompts
- The app is browser-first and Firebase-hosted
- The Conway inspiration is structural and generational, not a literal cell-grid clone
