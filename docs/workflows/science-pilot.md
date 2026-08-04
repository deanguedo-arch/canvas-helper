# Workflow: Science Course Pilot

Use this workflow when starting a Science course that should share Canvas Helper's reliable navigation, accessibility, persistence, and export foundations without forcing an English or Social activity system onto different subject matter.

This starts with one real source-backed unit. It does **not** create a generic Science factory or a full learner course on day one.

## Intake

Supply the real source archives once:

```bash
npm run intake:science-pilot -- \
  --project science20-pilot \
  --course-code "SCI 20" \
  --title "Science 20" \
  --mode conversion \
  --brightspace-zip "/absolute/path/to/brightspace.zip" \
  --teacher-resources-zip "/absolute/path/to/teacher-resources.zip"
```

The intake command:

- copies each supplied ZIP into `projects/resources/<slug>/_sources/` under its SHA-256 filename;
- records named source IDs in `resource-manifest.json` and `meta/project.json`;
- creates `meta/science-pilot.json`, `meta/prompt-pack.md`, and `meta/decision-log.md`;
- creates no `workspace/index.html`, no export, and no generic builder;
- marks the project `blocked` / `proposal-only-v1` until the representative unit is approved.

It refuses to overwrite an existing project or resource library. Use an explicit follow-up migration rather than rerunning intake over work that already exists.

## Shared Structure, Science-Specific Learning

Reuse the stable parts of the repository:

- course shell navigation and responsive behavior;
- accessible focus and explicit interaction states;
- persistent response/evidence patterns where the unit needs them;
- resource provenance, source hashing, export, and Brightspace acceptance gates.

Choose the instructional loop from the actual Science unit. The initial planning contract uses this candidate sequence:

`question -> investigate -> explain -> apply -> reflect`

That can become a simulation, data table, model-building activity, lab analysis, phenomenon explanation, or a different evidence-driven sequence. It is a planning prompt, not a mandated page layout.

## Red-Team / Green-Team Decision Loop

Both reviewers must work from the same small packet:

1. `meta/science-pilot.json`
2. `meta/project.json`
3. `meta/prompt-pack.md`
4. `projects/resources/<slug>/resource-manifest.json`
5. only the exact extracted source excerpts or curriculum mapping needed for the chosen unit

The red team looks for missing source authority, inaccessible interactions, fake data, unsafe assessment handling, unsupported persistence claims, and reasons the proposed activity does not fit the Science learning goal.

The green team proposes the smallest complete learner loop using the verified sources and existing shared shell capabilities.

They do not settle disagreement by voting. Record the evidence, unresolved edge case, and smallest testable decision in `meta/decision-log.md`. If either side identifies a real gap, narrow the pilot or gather the missing source rather than expanding the scope.

## Promotion Criterion

Only after the decision log identifies one representative unit, its outcomes, source mapping, learner loop, and verification requirements should the project be changed from blocked planning to an active implementation boundary.

The first build should prove one complete loop, including:

- curriculum/source traceability;
- accessible learner interactions;
- save/restore behavior when responses are collected;
- resource and assessment exclusions;
- project-specific E2E and SCORM acceptance checks if those delivery paths are in scope.

Only then should a reusable Science profile or builder be proposed. The pilot's evidence—not a copied course template—decides what is worth standardizing.

## Inspector Readiness for the First Unit

Do not make a Science workspace inspectable merely by adding a marker to rendered HTML. When the representative unit is approved, its science-specific authoring driver must declare the same ownership contract used by Studio:

- the canonical editable source or recipe;
- any generated workspace output and exact rebuild command;
- source resource IDs and contributor paths that are safe to show in a packet;
- whether a selected block can be `exact`, must remain `bounded`, or must be `unknown`.

Before broad authoring, prove one visible unit block through this loop:

`Inspect -> Copy bounded packet -> review one proposed change -> edit declared source -> rebuild -> verify learner behavior`

Reuse the Inspector contract, not Social or English source ownership. A Science activity may be a simulation, data analysis, lab reflection, or phenomenon explanation; its edit/rebuild path must simply be truthful and testable.

## Verification

```bash
npm run test:science-pilot
npm run validate:manifests
```

Use `npm run course:list -- --all` to confirm that a newly intaken Science pilot appears blocked until it has an approved implementation boundary. That is intentional and safer than treating a source archive as permission to generate a course.
