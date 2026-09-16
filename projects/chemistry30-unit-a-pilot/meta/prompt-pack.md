# Prompt Pack

- Project: chemistry30-unit-a-pilot
- Generated: 2026-09-15T19:48:11.198Z

## Rules

- Start with the narrowest useful retrieval path.
- Prefer known entrypoints, targeted reads, and `rg` over broad discovery.
- Do not expand scope or change behavior unless the current context is insufficient.
- If broader retrieval is needed, stop and ask for approval with the reason, added scope, and expected cost.
- Keep follow-up reads minimal even after approval.
- If the user explicitly says this is a subagent, or says to act as a subagent, treat the task as subagent mode automatically.
- If the signal is ambiguous, ask exactly once: `Should I apply subagent rules for this task?`
- Keep subagent mode on for the rest of the task once confirmed unless the user changes the scope.
- Do not keep asking whether to apply subagent rules after confirmation.
- Work in repo-approved zones (`app/studio`, `app/server`, `scripts`, `docs`, `tasks`, root config files).
- Treat `projects/<slug>/raw` as immutable baseline input.
- Retrieval order: prompt-pack -> course blueprint -> assessment map -> lesson packets -> targeted resource chunks -> pattern matches if enabled.
- Finish only after typecheck/build and task-specific verification pass.

## Session Mode

- Subagent mode: off
- Use standard task mode.

## Intelligence Policy

- Mode: apply
- Policy source: repo-default
- Collect pattern bank: on
- Collect memory ledger: on
- Apply pattern bank to prompt pack: on
- Apply memory ledger to prompt pack: on
- Apply memory ledger to recommendations: on

## Selected Benchmark

none

## Project Manifest

```json
{
  "id": "2d7e0dc7-f858-437d-8904-d30a0fdcee53",
  "slug": "chemistry30-unit-a-pilot",
  "sourcePath": "/Users/deanguedo/Downloads/Chemistry30_UnitA_GuidedEdition.html",
  "inputKind": "html",
  "brightspaceTarget": "course-page",
  "previewModes": [
    "raw",
    "workspace"
  ],
  "workspaceEntrypoint": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/index.html",
  "rawEntrypoint": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/raw/original.html",
  "learningSource": "other",
  "learningTrust": "auto",
  "learningUpdatedAt": "2026-09-15T19:48:10.893Z",
  "migrationState": "migrated",
  "projectType": "conversion",
  "preferredWorkflows": [
    "conversion"
  ],
  "canonicalEntry": "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/index.html",
  "canonicalSources": [
    "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/index.html",
    "main.js",
    "styles.css"
  ],
  "authoring": {
    "driverId": "proposal-only-v1",
    "familyId": "imported-workspace-v1",
    "studioEditing": {
      "enabled": false,
      "renameCourse": false,
      "imageAssets": false
    }
  },
  "generatedOutputs": [],
  "injectedComponents": [],
  "importedFirstPassOrigin": {
    "sourceSystem": "other",
    "sourcePath": "/Users/deanguedo/Downloads/Chemistry30_UnitA_GuidedEdition.html",
    "importedAt": "2026-09-15T19:48:10.712Z"
  },
  "exportTargets": [
    {
      "target": "brightspace",
      "enabled": true,
      "notes": "Default export target for imported projects."
    }
  ],
  "authoringStatus": "blocked",
  "referenceOnly": [],
  "sourceOfTruthNotes": "Imported workspace sources remain reviewable but are not automatically Studio-editable. Onboard explicit ownership, complete learner surfaces, rendered coverage, and a reversible lifecycle before changing authoringStatus to active. Treat generated exports and runtime bundles as derived output.",
  "createdAt": "2026-09-15T19:48:10.712Z",
  "updatedAt": "2026-09-15T19:48:10.893Z"
}
```

## Resource Authority Rules

- Assessments are the highest authority for performance expectations and success criteria.
- Outlines are the highest authority for unit naming, scope, and outcome framing.
- Teacher notes are contextual authority only.
- Textbook and reference resources are supporting evidence, not lesson generators.
- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.
- Current classified resource mix: none.

## Resource Catalog Summary

> resource-catalog.json: missing
> Next: `npm run refs -- --project chemistry30-unit-a-pilot`

## D2L Course Map Summary

> d2l-course-map.json: missing
> Next: `npm run d2l-map -- --project chemistry30-unit-a-pilot`

## Course Blueprint Summary

> course-blueprint.json: missing
> Next: `npm run blueprint -- --project chemistry30-unit-a-pilot`

## Assessment Map Summary

> assessment-map.json: missing
> Next: `npm run assessment-map -- --project chemistry30-unit-a-pilot`

## Lesson Packet Summary

> lesson-packets/index.json: missing
> Next: `npm run lesson-packets -- --project chemistry30-unit-a-pilot`

## Anti-Summary Generation Rules

- Build from outline authority plus assessment demand, not from whole-book excerpts.
- Never generate a lesson that lacks outcomes, linked assessments, misconceptions, guided practice, independent practice, and readiness evidence.
- A lesson is a failure if it reads like chapter notes, only defines terms, or cites broad source blobs instead of targeted lesson evidence.
- Prefer lesson-packet-scoped references and page/section locators over raw document dumps.
- Use textbook or reference sources only to support a specific outcome and assessment demand.

## Sections List

- Node -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js
- Hess -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js
- Formation -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js
- Formation Data -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js
- Path -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js
- Flow -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js
- Fuels -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js
- Review -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js
- Vocab -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js
- Book -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js
- Book Work -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js
- Unit Checks -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js
- Unit Models -> /Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js

## Style Guide

```md
# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
- External dependencies preserved: http://www.w3.org/2000/svg\, http://www.w3.org/2000/svg\\\, https://www.youtube-nocookie.com/embed/nmhZ-m90eus?rel=0&amp;playsinline=1&amp;cc_load_policy=1\, https://www.youtube.com/watch?v=nmhZ-m90eus\, https://www.youtube-nocookie.com/embed/8m_FCe5aCqY?rel=0&amp;playsinline=1&amp;cc_load_policy=1\, https://www.youtube.com/watch?v=8m_FCe5aCqY\, https://www.youtube-nocookie.com/embed/Bi_cWPbOt_A?rel=0&amp;playsinline=1&amp;cc_load_policy=1\, https://www.youtube.com/watch?v=Bi_cWPbOt_A\

## Visual Signals
- No Tailwind color tokens detected.
- Hex colors: #171b1b, #5b635d, #f7f8f5, #fff, #154212, #0e3510, #146c60, #a15c00, #a43f35, #d9ded8
- Repeated shape tokens: rounded
- Motion and interaction tokens: transition, transition-state

## Interaction Notes
- Uses localStorage for persistence.
- Embeds iframe-based media or content.
- Uses confirm dialogs for destructive actions.

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
```

## Content Outline

```md
# Content Outline

- Project: chemistry30-unit-a-pilot
- Source: /Users/deanguedo/Downloads/Chemistry30_UnitA_GuidedEdition.html

## Sections
- Node (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js)
- Hess (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js)
- Formation (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js)
- Formation Data (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js)
- Path (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js)
- Flow (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js)
- Fuels (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js)
- Review (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js)
- Vocab (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js)
- Book (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js)
- Book Work (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js)
- Unit Checks (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js)
- Unit Models (/Users/deanguedo/Documents/GitHub/canvas-helper/projects/chemistry30-unit-a-pilot/workspace/main.js)
```

## Import Log

> import-log.md: missing

## Global Memory

### Runtime and tool choices from chemistry30-unit-a-pilot
- Kind: tool
- Confidence: high
- Reinforcement: 1
- Projects: chemistry30-unit-a-pilot
- Top reasons: Keyword overlap (+1008); Dependency overlap (+108)
- Keywords: about, account, activation, activity, actually, added, adding, adjusted, after, again, agree, alberta
- Style tokens: none
- Dependencies: http://www.w3.org/2000/svg\, http://www.w3.org/2000/svg\">${body}\u003c/svg>`;\n, http://www.w3.org/2000/svg\\\, http://www.w3.org/2000/svg\\\">\u003cdefs>\u003cmarker, http://www.w3.org/2000/svg\\\">\u003cg, https://albertachemistryteacher.ca/chem30/chem30thermo/\", https://www.youtube-nocookie.com/embed/8m_FCe5aCqY?rel=0&amp;playsinline=1&amp;cc_load_policy=1\, https://www.youtube-nocookie.com/embed/8m_FCe5aCqY?rel=0&amp;playsinline=1&amp;cc_load_policy=1\", https://www.youtube-nocookie.com/embed/Bi_cWPbOt_A?rel=0&amp;playsinline=1&amp;cc_load_policy=1\, https://www.youtube-nocookie.com/embed/Bi_cWPbOt_A?rel=0&amp;playsinline=1&amp;cc_load_policy=1\", https://www.youtube-nocookie.com/embed/cAVPhGBLjQ8?rel=0&amp;playsinline=1&amp;cc_load_policy=1\", https://www.youtube-nocookie.com/embed/G1I2a3zFiPw?rel=0&amp;playsinline=1&amp;cc_load_policy=1&amp;list=PLRX_953bUQsogGOg6k7W_hpDD9mrLKugd\", https://www.youtube-nocookie.com/embed/JVTAKTr93GQ?rel=0&amp;playsinline=1&amp;cc_load_policy=1\", https://www.youtube-nocookie.com/embed/LiAuYHD_uIU?rel=0&amp;playsinline=1&amp;cc_load_policy=1\", https://www.youtube-nocookie.com/embed/nmhZ-m90eus?rel=0&amp;playsinline=1&amp;cc_load_policy=1\, https://www.youtube-nocookie.com/embed/nmhZ-m90eus?rel=0&amp;playsinline=1&amp;cc_load_policy=1\", https://www.youtube-nocookie.com/embed/nmhZ-m90eus?rel=0&amp;playsinline=1&amp;cc_load_policy=1&amp;list=PLtm1y0Mmc9CkbSGO197gzN8SCxSudebWe\", https://www.youtube-nocookie.com/embed/NniZvxTLb0A?rel=0&amp;playsinline=1&amp;cc_load_policy=1\", https://www.youtube-nocookie.com/embed/py-U-u8ZK-Y?rel=0&amp;playsinline=1&amp;cc_load_policy=1\", https://www.youtube-nocookie.com/embed/s-RlCDGhfj0?rel=0&amp;playsinline=1&amp;cc_load_policy=1&amp;list=PLAVtOmrnp1j8DRnRbtvd_IGAMwg2p38Sr\", https://www.youtube-nocookie.com/embed/v92ZgmaxQmI?rel=0&amp;playsinline=1&amp;cc_load_policy=1\", https://www.youtube.com/watch?v=8m_FCe5aCqY\, https://www.youtube.com/watch?v=8m_FCe5aCqY\", https://www.youtube.com/watch?v=Bi_cWPbOt_A\, https://www.youtube.com/watch?v=Bi_cWPbOt_A\", https://www.youtube.com/watch?v=cAVPhGBLjQ8\", https://www.youtube.com/watch?v=G1I2a3zFiPw&amp;list=PLRX_953bUQsogGOg6k7W_hpDD9mrLKugd\", https://www.youtube.com/watch?v=JVTAKTr93GQ\", https://www.youtube.com/watch?v=LiAuYHD_uIU\", https://www.youtube.com/watch?v=nmhZ-m90eus\, https://www.youtube.com/watch?v=nmhZ-m90eus\", https://www.youtube.com/watch?v=nmhZ-m90eus&amp;list=PLtm1y0Mmc9CkbSGO197gzN8SCxSudebWe\", https://www.youtube.com/watch?v=NniZvxTLb0A\", https://www.youtube.com/watch?v=py-U-u8ZK-Y\", https://www.youtube.com/watch?v=s-RlCDGhfj0&amp;list=PLAVtOmrnp1j8DRnRbtvd_IGAMwg2p38Sr\", https://www.youtube.com/watch?v=v92ZgmaxQmI\"
- Reference kinds: none

### Reusable sections and components from chemistry30-unit-a-pilot
- Kind: component
- Confidence: high
- Reinforcement: 1
- Projects: chemistry30-unit-a-pilot
- Top reasons: Keyword overlap (+1008); Section overlap (+78)
- Keywords: about, account, activation, activity, actually, added, adding, adjusted, after, again, agree, alberta
- Style tokens: none
- Dependencies: none
- Reference kinds: none

### Approved style direction from chemistry30-unit-a-pilot
- Kind: style
- Confidence: high
- Reinforcement: 1
- Projects: chemistry30-unit-a-pilot
- Top reasons: Keyword overlap (+1008); Approved bonus (+6)
- Keywords: about, account, activation, activity, actually, added, adding, adjusted, after, again, agree, alberta
- Style tokens: rounded
- Dependencies: none
- Reference kinds: none

### Reference and resource profile from chemistry30-unit-a-pilot
- Kind: resource
- Confidence: high
- Reinforcement: 1
- Projects: chemistry30-unit-a-pilot
- Top reasons: Keyword overlap (+1008); Approved bonus (+6)
- Keywords: about, account, activation, activity, actually, added, adding, adjusted, after, again, agree, alberta
- Style tokens: none
- Dependencies: none
- Reference kinds: none

### HSS1010 Interactive Rebuild Design
- Kind: decision
- Confidence: high
- Reinforcement: 2
- Projects: repo-wide
- Top reasons: Keyword overlap (+270); Approved bonus (+6)
- Keywords: 1010, above, abuse, acceptable, access, accordion, across, action, active, activites, activities, activity
- Style tokens: none
- Dependencies: none
- Reference kinds: none

## Pattern Matches

none

## Reference Excerpts

none

## Task Stub

```md
# Task
## Goal
<one sentence>

## Constraints
- Touch only the files listed in this task.
- No new deps.
- No refactors.

## Acceptance tests
- <test 1>
- <test 2>

## Expected files to change
- <file 1>
- <file 2>

## Commands
- npm run typecheck
- npm run build:studio
```
