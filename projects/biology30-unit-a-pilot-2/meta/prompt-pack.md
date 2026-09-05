# Biology 30 Unit A Pilot 2 prompt pack

## Boundary

- Project: `biology30-unit-a-pilot-2`
- Canonical learner source: `projects/biology30-unit-a-pilot-2/workspace/index.html`
- Ownership: direct workspace, blocked, preview-only, Studio Edit disabled
- Gate 1 accepted SHA-256: `8c0e38fefdd2493155bc3de123b5f708c9eede59efb6234613b455407e2369fe`
- Gate 2 changes-requested SHA-256: `9ed0b01efaed7e1708cf8f32068e69933b86c7c83e6b45275c6fd88921b935e7`
- Revision Gate A accepted SHA-256: `3deebf23e21f895dae53a8bc30d9c3912919510ae85194e21febc8fb8b0c39ff`
- Advanced Learning pre-bridge SHA-256: `912a213fd62e503b99d9c42f28b1094f8a4f4e31d9772513013adbc02ef4707e`
- Advanced Bridge Gate A accepted SHA-256: `3d81ce61d56abdad611ee287a4c5db4e31ab5d9e2197610818b08a79f223b5f6`
- Advanced Bridge Gate B candidate SHA-256: `11f9508fce938bf55065a308d4267c98c6fbc47b093fa60b7701158d4e331d4c`
- Preserved Advanced Bridge Gate B workspace-tree SHA-256: `5ea60d70eb152639be5644965c98c566349a64ff924310016f23cf531094feef`
- Pilot 1 and production Units A-D are protected references and must not be edited.

## Preserved Advanced Bridge Gate B review

Advanced Bridge Gate B renders all forty optional blocks directly after their matching Learn sections. The eight accepted Gate A examples retain their role, and the remaining thirty-two blocks complete the bridge at the same accessible reading level. The synchronized Process Collection checklist now opens every block. Every one of Pilot 1's 470 section records has one retained, advanced, review, or exclusion disposition. The course remains blocked and cannot be exported or edited in Studio. No deployment, commit, push, export, promotion, or B-D transfer is authorized.

## Review focus

1. Review at least one expanded block in every lesson, including the eight accepted Gate A reference blocks and the thirty-two new Gate B blocks.
2. Confirm all forty blocks appear immediately after the core Learn section they extend, begin collapsed, use accessible language, and add genuine depth rather than harder wording.
3. Inspect each evidence table and exact Models and Data Lab link. Confirm the evidence supports the stated excellence-level reasoning and remains usable with keyboard-only navigation and text zoom.
4. Mark a block complete in a lesson, open Advanced Learning under Process Collection, and confirm the matching checklist item updates. Uncheck it in the checklist and confirm only that flag is removed.
5. Use representative checklist deep links from every chapter. Each must open the exact lesson, expand the exact block, scroll it into view, and focus its heading.
6. Reload after partial completion and confirm the flags persist. Load a version-5 state and confirm existing learner work remains while all advanced flags begin unchecked.
7. Confirm the checklist lists forty available blocks in lesson order and the timing contract remains 245 lesson-block minutes plus 50 existing optional review minutes.
8. Confirm none of the Advanced Learning checkboxes changes the eighteen required routes, guided practice, Evidence Slips, score, required time, Core Vocabulary, textbook review, or Models and Data Lab state.
9. Review the 470-record difference audit in `meta/advanced-learning-bridge.json` and the readable summary in `meta/advanced-learning-bridge.md`.
10. Review only the exact build recorded in `meta/advanced-bridge-gate-b-review.json`.

## Verification

`npm run test:biology30-unit-a-pilot-2`
`npm run audit:biology30-unit-a-pilot-2:visual -- --project biology30-unit-a-pilot-2`
`npm run verify -- --project biology30-unit-a-pilot-2 --mode workspace`
`npm run test:e2e:project -- --project biology30-unit-a-pilot-2`
`npm run test:e2e:biology30-unit-a-pilot-2`
`npm run course:doctor -- --project biology30-unit-a-pilot-2`

## Current contained enhancement — Process Collection Index

- Current canonical workspace SHA-256: `219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc`
- Current workspace tree SHA-256: `bf5de61f7b01bd8431b853c53d4468b30baf790007bc64e21201290f918f0dc6`
- Preserved pre-index and Advanced Bridge Gate B review SHA-256: `11f9508fce938bf55065a308d4267c98c6fbc47b093fa60b7701158d4e331d4c`
- Review record: `meta/process-collection-index-review.json`
- Authored registry: `scripts/lib/biology30-unit-a-pilot-2/process-collection-content.ts`
- Generated registry: `meta/process-collection-index.json`

This contained candidate replaces duplicate evidence displays with one state-derived **All My Work** index. It does not change course content, Advanced Learning, practice, completion, required or optional time, state schema, Pilot 1, or Units A–D. The earlier Advanced Bridge Gate B review and its unresolved teacher decision remain attached to the preserved pre-index build. No deployment, export, commit, push, publication, Studio editing, or transfer is authorized.

### Review focus

1. Start representative work in every activity category and confirm only meaningful started records appear.
2. Filter by chapter and activity type; filtering must not change saved state.
3. Use exact return links with keyboard navigation and confirm the originating heading receives focus.
4. Confirm copy and print include all started categories even when the visible index is filtered.
5. Review the four truthful save outcomes with local-only, LMS-success, LMS-failure, and total-failure fixtures.
6. Confirm the 40 Advanced Learning blocks, 86 practice items, 18 required routes, 1,505 required minutes, and 295 optional minutes are unchanged.
