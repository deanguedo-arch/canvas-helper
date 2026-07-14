# Workflow: English Course Factory

Use this workflow when a Brightspace English course and a teacher-resource archive must become several consistent, review-ready unit workspaces without rebuilding each unit by hand.

The factory keeps one shared learner shell and Evidence Bank contract, while each unit selects the activity system that fits its content:

| Profile | Core activity surfaces |
| --- | --- |
| `short-fiction` | text bank, story questions, Analysis Explorer/Writing Studio, literary-term evidence |
| `modern-drama` | play materials, act questions, character/conflict dossiers, critical essay |
| `shakespeare-drama` | side-by-side scenes, act questions, character dossiers, Shakespeare Writing Studio |
| `novel-study` | title-specific essays, reading guide, Major Works data, phased questions, writing tools |
| `film-study` | critical essay, viewing guide and moments, film question sets, Film Room |

Do not force every English unit into the Short Stories structure. Short Stories is the shared quality baseline; `activityProfile` controls the unit-specific activities.

## Current ELA 20-1 Family

- Course manifest: `config/english/families/ela20-1.json`
- Intake inventory: `config/english/families/ela20-1-inventory.json`
- Source mapping: `config/english/families/ela20-1-mapping.json` and `.md`
- Verification report: `config/english/families/ela20-1-verification.json` and `.md`
- Shared implementation: `scripts/lib/english-unit/`
- Shared shell and Evidence Bank runtime: `scripts/lib/next-step-course-shell.ts`

The five configured units are:

- `ela20-1-short-stories-pilot`
- `ela20-1-modern-play-crucible`
- `ela20-1-shakespeare-macbeth`
- `ela20-1-novel-study-clean`
- `ela20-1-feature-film`

## First Intake

Run intake once when archives are supplied or deliberately refreshed:

```bash
npm run intake:english-course -- \
  --course ela20-1 \
  --brightspace-zip "/absolute/path/to/brightspace.zip" \
  --teacher-resources-zip "/absolute/path/to/teacher-resources.zip"
```

Intake:

- hashes and deduplicates both archives under `projects/resources/<course>/_sources/`
- inventories every archive entry
- allowlists exact Brightspace unit and lesson IDs
- classifies placed, excluded, review-required, reference-only, missing, and unrelated files
- creates only missing unit recipes
- never overwrites an existing recipe or preserved custom component
- initializes preserved Macbeth scene data when it is missing

The teacher-resource archive is course-content authority. The Brightspace archive is lesson-order and instructional-content authority. Soft gates, hard gates, answer keys, Math folders, and alternate unit branches remain excluded.

## Canonical Project Contract

Each unit uses:

- `projects/<slug>/meta/english-unit.json`: editable recipe and source decisions
- `projects/<slug>/meta/prompt-pack.md`: restart context and review blockers
- `projects/<slug>/workspace/index.html`: canonical learner entry generated from the recipe
- `projects/<slug>/workspace/components/**`: preserved custom activity code/data
- `projects/<slug>/workspace/assets/custom/**`: preserved custom assets
- `projects/<slug>/meta/english-unit-build.json`: hashes, profile version, owned outputs, and review status
- `projects/<slug>/meta/english-unit-mapping.json` and `.md`: per-resource disposition

Factory-owned rebuild paths are only:

- `workspace/index.html`
- `workspace/assets/generated/**`
- legacy Short Stories `workspace/resources/generated/**`

Recipes, prompt packs, `workspace/components/**`, and `workspace/assets/custom/**` survive bulk rebuilds. Never patch an export as source.

## Rebuild Loop

Build every review-ready workspace:

```bash
npm run build:english-course -- --course ela20-1
```

Rebuild one unit while refining it:

```bash
npm run build:english-unit -- --project <unit-slug>
```

The unit command dispatches from `EnglishUnitRecipeV2.activityProfile`. The existing V1 Short Stories recipe remains supported as the golden compatibility profile.

## Individual Refinement Loop

1. Open `projects/<slug>/meta/prompt-pack.md`.
2. Review `meta/english-unit-mapping.md` and the learner workspace in Studio.
3. Change source selection, activity configuration, wording, or review status in `meta/english-unit.json`.
4. Put bespoke data or UI under `workspace/components/**` or `workspace/assets/custom/**`.
5. Rebuild only that unit.
6. Run course verification and the project E2E contract.
7. Keep the recipe at `needs-review` until content, rights, accessibility, and editorial review are resolved.

This is the intended bulk-to-individual boundary: the factory supplies the complete shell, lesson conversion, profile activities, resource placement, Evidence Bank wiring, autosave, hints, printing, and responsive behavior; individual passes improve only the content or components that genuinely need judgment.

## Evidence Bank Contract

Every factory profile uses:

```ts
window.nextStepEvidenceBank.upsert(entry);
window.nextStepEvidenceBank.remove(contributionId);
window.nextStepEvidenceBank.list(filters);
```

Rules:

- activity fields autosave continuously to response storage
- nothing enters the Evidence Bank automatically
- collection activities use stable contribution IDs and update in place
- removing an Evidence Bank entry never removes its source response
- question activities save one story, act, phase, or selected set as a collection
- passages, quotations, viewing moments, annotations, paragraphs, and motif cards can save individually
- Evidence Bank filters cover activity, text/film, locator, and evidence type
- unit responses and Evidence Bank entries flow through the SCORM suspend-data bridge

## Verification

Run the factory-specific gates:

```bash
npm run test:english-course
npm run verify:english-course -- --course ela20-1
```

Run platform and project gates:

```bash
npm run verify -- --project <unit-slug>
npm run test:e2e:project -- --project <unit-slug>
npm run test:e2e:smoke
npm run test:scorm
npm run build:studio
npm run typecheck
```

`verify:english-course` validates recipes, E2E metadata, profile routes/counts, local assets, stable response IDs, excluded content, Evidence Bank hooks, and preserved Macbeth component hashes.

## Final Export Gate

Batch builds stop at `needs-review`. Export one approved unit only after:

- its recipe and project metadata are `ready-for-export`
- rights/access decisions are resolved
- accessibility review is complete
- Macbeth plain-language scenes are editorially reviewed when applicable
- the selected film is approved when applicable
- factory verification, project verification, E2E, and SCORM tests pass

Then package individually:

```bash
npm run export:scorm -- --project <approved-unit-slug> --version 2004
unzip -tq projects/<approved-unit-slug>/exports/<approved-unit-slug>-scorm-2004.zip
```

SCORM 2004 is the default because the bridge must restore tracked local state before the learner runtime initializes and because English activity/evidence payloads can exceed SCORM 1.2 suspend-data capacity.

## Adding ELA 10-1 or Another English Family

Do not copy a unit builder. Add a course seed/manifest with:

- exact unit and lesson IDs
- exact alternate-branch exclusions
- resource dispositions
- one of the five activity profiles, or a separately versioned new profile
- review blockers and truthful missing-access notices

Then run the same intake, bulk build, verification, and individual refinement loop. Promote a new activity profile only when the content type genuinely needs a new interaction system.
