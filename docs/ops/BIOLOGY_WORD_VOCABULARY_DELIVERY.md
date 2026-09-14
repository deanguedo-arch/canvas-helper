# Biology word-vocabulary delivery — 2026-09-09

The individual-word vocabulary rollout is verified locally for Biology30 A Pilot2, B, C and D. Biology20 A's word structure and shared reader are updated too. This is not curriculum certification or a deployment.

| Course | Individual entries | Maximum ordinary/Unicode saved state |
|---|---:|---:|
| Bio30 a-pilot-2 | 141 | 42,383 |
| Bio30 b | 153 | 34,047 |
| Bio30 c | 249 | 43,515 |
| Bio30 d | 99 | 27,766 |
| Bio20 a | 35 | 43,393 |

## What changed

Categories organize selectable words. Each word owns its Meaning, Word structure, What it does, Related ideas, Common confusion and Retrieve the idea. No unavailable-analysis placeholders remain. Word structure distinguishes compounds, grammatical forms, symbols, acronyms, names and appropriate morphemes; it does not invent an origin for every word.

Any eight words can open an empty four-field Frayer. Each field permits240 characters. Written removal requires confirmation and offers copying. Old category writing retains its original label instead of being assigned to a word. Page and lesson popup share the same record.

A Pilot2 retains the original bold word-part layout/caution boxes and its28 exact original model comparisons after a complete attempt. Its separate adapter preserves earlier writing and includes new word drafts/collected Frayers in collection copying. New full comparison models are not claimed for every added word.

All Biology30 teaching text and all167 Advanced Learning blocks are unchanged. Required course completion, existing unrelated response limits, 44,000 target and48,000 guard are unchanged.

## Verification and limits

All five workspace checks and all five project E2E checks passed. Final vocabulary/browser/state tests passed, including501 exact BCD teaching links, mobile/tablet layouts, popup focus/scroll return, eight slots, reload, removal, draft retention and Unicode capacity. Shared smoke passed.

The [exact verification receipt](biology-word-vocabulary-verification.json) records candidate hashes, source pins, commands, inspected screenshots and historical-test limitations. A stays intentionally blocked/proposal-only: its authoring-readiness doctor rejects activation. Two old A historical-suite expectations remain obsolete/unresolved; the changed budget checks pass. No teacher acceptance, observed learning-level equivalence, native screen-reader certification or live LMS certification is implied.

## Workspaces

- [biology30-unit-a-pilot-2](../../projects/biology30-unit-a-pilot-2/workspace/index.html)
- [biology30-unit-b](../../projects/biology30-unit-b/workspace/index.html)
- [biology30-unit-c](../../projects/biology30-unit-c/workspace/index.html)
- [biology30-unit-d](../../projects/biology30-unit-d/workspace/index.html)
- [biology20-unit-a](../../projects/biology20-unit-a/workspace/index.html)

Use the full workspace, not the earlier Biology20 first-topic proof. Refresh an already-open tab to load the rebuilt file. Hosted versions and ZIPs were not updated.

## Canonical sources and regeneration

Word details: A Pilot2 `projects/biology30-unit-a-pilot-2/meta/word-details.json`; B/C/D `projects/resources/biology30-production/v1/units/unit-{b,c,d}/word-details.json`; Bio20 A `projects/resources/biology20-production/v1/units/a/word-details.json`.

Shared UI/state: `scripts/lib/biology30-vocabulary/`. A owner: `scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts`; BCD owner: `scripts/lib/biology30-course/v1/pilot2-inputs.ts` and its renderer. Generated HTML is not an edit target.

```sh
npm run build:biology30-unit-a-pilot-2 -- --project biology30-unit-a-pilot-2 --gate final-academic-review --baseline-workspace-sha 219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc
```

```sh
npm run build:biology30-course -- --project biology30-unit-b --strict --profile pilot2-topic-sequence-v1 --baseline-workspace-sha 540c9323616d1fcdf326256080348ca2f26f428236b4e285c6bb78a3c574325b
```

```sh
npm run build:biology30-course -- --project biology30-unit-c --strict --profile pilot2-topic-sequence-v1 --baseline-workspace-sha aa2f6b78db5b9378668d80de1f2190911a1abaeb868af76e9851a87a082ef760
```

```sh
npm run build:biology30-course -- --project biology30-unit-d --strict --profile pilot2-topic-sequence-v1 --baseline-workspace-sha e8c15e0d933bf60ae3b53b18813207cdb2f3b5063f40ccf75124bb020bd7ad94
```

```sh
npx tsx scripts/build-biology20-course.ts --module a
```

The final BCD protected baseline is `projects/resources/biology30-production/v1/pilot2/baselines/2026-09-09-word-vocabulary-delivery/baseline.json`. Any later A rebuild must be reconciled with that protection before another BCD rebuild.

