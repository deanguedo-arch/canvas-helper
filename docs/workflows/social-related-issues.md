# Workflow: Social 30 Related-Issues Rebuild

Use this workflow for the Social Studies 30-1 related-issues family when the course needs a controlled rebuild from its shared Brightspace export.

This is a **proposal/rebuild** workflow. The learner workspace is generated output. Do not use Studio automatic writes or hand-edit `workspace/index.html` as the source of truth.

## Source Contract

The source export is named in:

`projects/resources/social30-1-related-issues/resource-manifest.json`

Each resource has a stable ID, repository-relative path, SHA-256 checksum, provenance, and availability:

- `canonical`: housed under the shared Social resource library.
- `snapshot-backed`: deliberately retained in a kept `projects/processed/**/source/` snapshot until it is promoted. It is still checksum-verified, but should not be duplicated casually or assumed to be a new source upload.

The current verified pilot resource is `social30-1-brightspace-winter-2020`. A course declares the ID in `meta/project.json` under `authoring.sourceResourceIds`.

Never pass an arbitrary `--zip` path. The builder rejects it so a rebuild cannot silently depend on one person's Downloads folder.

## Exact Rebuild Loop

```bash
npm run course:doctor -- --project social30-1-related-issue-1-option-2
npm run build:social30 -- \
  --resource social30-1-brightspace-winter-2020 \
  --only social30-1-related-issue-1-option-2
```

The doctor verifies the manifest path contract and the named source's checksum before the course brief is considered healthy. The builder verifies the same source again before opening it.

## Write Boundary

The builder renders to a temporary sibling directory first. It only swaps the staged result into place after `workspace/index.html` is a complete HTML document.

It may replace:

- `projects/<slug>/workspace/**`
- `projects/<slug>/meta/social-build.json`
- `projects/<slug>/meta/conversion-notes.md`

It never writes:

- `projects/<slug>/raw/**`
- `projects/<slug>/meta/project.json`
- `projects/<slug>/exports/**`

`meta/project.json` remains the human-reviewed contract: ownership, source-resource ID, export intent, and regenerate command are changed intentionally in a focused metadata edit, not as a side effect of a build.

## Extending the Family

For another related issue that uses the same validated export:

1. Add or update that project's explicit Social `authoring` contract, including `sourceResourceIds` and the versioned `studio-routine-content-v1` editability profile.
2. Use the same named resource only if its unit mapping is actually appropriate.
3. Rebuild one exact issue with `--only`.
4. Review generated content before treating it as release-ready.

The profile is an acceptance obligation, not permission to patch generated output. Studio resolves edits through the Social factory adapter, rebuilds transactionally, verifies the rendered result, and retains exact Undo. A new Social course cannot be accepted as `active` or `ready-for-export` until the exact-head new-course gate proves complete learner inventory, the routine-content coverage floors, and a real Apply → rebuild/reload → Undo lifecycle.

For a new source export, first add it to the Social resource manifest with its checksum and provenance. Do not create a duplicate source ZIP in every issue folder.

## Verification

Run the focused checks:

```bash
npm run test:social-build
npm run course:doctor -- --project <issue-slug>
npm run verify:new-course-readiness -- --base <comparison-sha>
npm run test:e2e:project -- --project <issue-slug>
git diff --check
```

Then inspect the generated workspace and run its export checks when the release package changed. Brightspace upload and cross-browser SCORM restoration remain release acceptance checks; a local rebuild alone does not prove them.
