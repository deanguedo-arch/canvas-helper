# AB30 full-course visual integration

## Integrated candidate

- The canonical course has **50 lessons**, and every lesson now has at least one learner-facing visual.
- **45 new orientation illustrations** were generated for L01–L45, optimized as WebP, and placed after the first explanation they support.
- **10 existing Theme 4 images** remain in L46–L50: one hero and one supporting illustration per lesson.
- The active course therefore contains **55 image placements across all 50 lessons**.
- Wide screens pair the new supporting illustration with related teaching text. Narrow screens stack the text and image with no horizontal overflow.
- Generated-media limitations remain in accessible captions while staying visually quiet on the page.

The illustrations provide orientation and concept support. They are not presented as photographs, historical documents, maps of record, or evidence about a named person, Nation, community, ceremony, or event.

## Source decisions

- The 29 Theme 1 JPGs remain unused until provenance and reuse rights are confirmed.
- The 256-page official textbook contains 268 embedded image objects across 179 pages. Its copyright notice reserves reproduction rights, so those images remain local review candidates.
- The Film Room's 20 links and the separate 26-moment video proposal remain review-only. No video was embedded without an exact title, provider, working URL or asset, permission basis, captions, transcript, duration, sensitivity review, and fallback.

## Review files

- `INTEGRATED-VISUALS.md`: the 45 integrated images beside their exact generation prompts.
- `generated-visual-integration.json`: exact lesson IDs, paths, dimensions, byte sizes, hashes, alt text, captions and prompts.
- `CURRENT-IMAGE-INDEX.md`: all 55 active image placements across all 50 lessons.
- `lesson-media-map.json`: the full lesson-by-lesson visual and video decision map.
- `image-generation-prompts.md`: the complete initial 50-prompt comparison set.
- `CALIBRATION-REVIEW.md` and `calibration-manifest.json`: the six-lesson style calibration record.
- `existing-media-register.json`: existing workspace media and Film Room inventory.
- `textbook-image-inventory.json`: the textbook image-object inventory.

## Verification completed

- Course doctor passes.
- All 45 new WebP files pass `webpinfo` validation.
- Static reconciliation finds 50 unique lesson routes, 45 generated figures in the intended L01–L45 lessons, and at least one visual in every lesson.
- All 39 focused asset, content, route, teacher-presentation and visual tests pass after updating their expectations for reviewed figure blocks and the current lesson header.
- Representative browser checks cover all four themes. Every checked image decoded, text/image splits rendered, and no horizontal overflow or console warning appeared.

## Next review

Review `INTEGRATED-VISUALS.md` alongside representative learner lessons. Record any image that should be replaced, then complete exact-source video review as a separate pass. Full 50-route E2E, Studio annotation, packaging, SCORM and live Brightspace proof remain rollout checkpoints.
