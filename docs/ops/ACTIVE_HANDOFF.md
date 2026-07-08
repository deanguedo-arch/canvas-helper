# Handoff

## Summary

- Project: `social20-1-related-issue-*` and `social10-1-related-issue-*`
- Task: Layer the NSO Social Studies podcast list into Social 20-1 and Social 10-1 using the proven Social 30-1 pattern, clean up repeated/noisy lesson titles, clean Social 10-1 missing visual-source placeholders, clean malformed Social 10-1 DOCX/D2L text fragments, and keep Studio responsive while these generated workspaces grow.
- Status: Podcast integration is implemented in the builders. Social 20-1 repeated concept mini-lessons now merge into clean learner-facing lessons. Social 20-1 and Social 10-1 imported lesson content no longer repeats the same heading immediately under the shell lesson title, and a full Social 10/20/30 audit reports zero first-heading duplicates. Social 10-1 lesson titles now strip D2L leading numbers and raw course-code labels. Social 10-1 lesson preview summaries now come from the learner content area instead of D2L admin headers, so `SS10-1 U# Lesson #` strings no longer appear in lesson pathway cards or lesson document headers. Social 10-1 overview `I can...` statements now follow the Social 30 learner-facing pattern, and the overview lesson-count pill says `course lessons` instead of `D2L lessons`. Social 20-1 and Social 10-1 overview `I can...` rows now inherit the Social 30 boxed-row treatment through the shared Next Step shell: white row boxes, 5px green left border, and the Social 30 shadow color. Social 20-1 overview outcome wording now uses the same learner-facing pattern as Social 30, and RI1 no longer says `recovered` in the visible overview intro. Studio project dropdowns are now grouped by subject, and the legacy Social 30 `social30-1-related-issue-1` through `social30-1-related-issue-4` entries are hidden from Studio while the four `option-2` Social 30 issue projects remain. Social 10-1 visible Library/Resources descriptions now use standalone course language rather than `Recovered D2L file...`; visible `SS10-1` study-guide titles are cleaned to learner-facing `Unit # Study Guide`; active imported-course hrefs now use `assets/imported/course/...` instead of `assets/imported/d2l/...`. Social 10-1 image references missing from the course package no longer render learner-facing placeholder/note boxes; the missing original filenames are omitted from lesson flow and listed in `social10-module-mapping.*` for source recovery. Social 10-1 Source Analysis now uses real visual sources when available: course lesson images first, then extracted DOCX module images, then text excerpts only as fallback. The Social 10-1 Issue Inquiry, Position Builder support set, Resources support groups, and Film Room title cleanup have now been rolled through all four Social 10 related-issue workspaces from the builder. Issue Inquiry uses the Social 30-style workflow, Issue Inquiry plus Position Builder use copied Social 30-1 support documents, and Source Analysis remains Social 10-specific. Office support files no longer auto-load in iframes, preventing refresh-triggered downloads. The Unit 2 land-acknowledgment DOCX fragment now renders as a structured lesson activity with a cleaned template and helper links, not a single malformed paragraph. The Social 10 builder now resets generated workspaces by renaming the previous workspace aside and creating a fresh directory because interrupted recursive deletes were hanging locally. The Social 20 builder now uses the same reset strategy. Studio `/api/projects` is responsive again: `scripts/lib/projects.ts` skips generated asset folders (`assets`, `assets 2`, etc.) and parked workspace backups when listing editable HTML files. SCORM/export packaging remains intentionally out of scope.

## Files changed

- `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/nso-podcasts.ts`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/app/studio/src/App.tsx`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/app/studio/src/components/ReferencePicker.tsx`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/app/studio/src/components/WorkspacePicker.tsx`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/app/studio/src/lib/project-display.ts`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/app/studio/src/lib/projects.ts`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/next-step-course-shell.ts`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/projects.ts`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-social20-related-issues.ts`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-social10-related-issues.ts`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social20-1-related-issue-*/workspace/index.html`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social20-1-related-issue-*/meta/project.json`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social20-1-related-issue-*/meta/conversion-notes.md`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social20-1-related-issue-*/meta/social20-podcast-mapping.json`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social20-1-related-issue-*/meta/social20-podcast-mapping.md`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social10-1-related-issue-*/workspace/index.html`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social10-1-related-issue-*/workspace/assets/module-visuals/**`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social10-1-related-issue-*/workspace/assets/social30-supports/**`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social10-1-related-issue-*/meta/project.json`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social10-1-related-issue-*/meta/conversion-notes.md`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social10-1-related-issue-*/meta/social10-module-mapping.json`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social10-1-related-issue-*/meta/social10-module-mapping.md`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social10-1-related-issue-*/meta/social10-podcast-mapping.json`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social10-1-related-issue-*/meta/social10-podcast-mapping.md`

Existing unrelated dirty files and processed-folder churn were already present in the worktree and should not be reverted without an explicit user request.

## Verification run

- `npx tsc --noEmit --pretty false --target es2022 --module nodenext --moduleResolution nodenext --esModuleInterop --skipLibCheck scripts/build-social20-related-issues.ts` passed.
- `npx tsc --noEmit --pretty false --target es2022 --module nodenext --moduleResolution nodenext --esModuleInterop --skipLibCheck scripts/build-social10-related-issues.ts` passed.
- `npx tsx scripts/build-social20-related-issues.ts` passed.
- `npx tsx scripts/build-social10-related-issues.ts` passed.
- Static podcast audit passed:
  - Social 20: 38 podcast entries found in the DOCX, 38 generated video IDs present, 22 visible lesson podcast card groups, 0 duplicate Film Room iframe IDs.
  - Social 10: 17 podcast entries found in the DOCX, 17 generated video IDs present, 13 visible lesson podcast card groups, 0 duplicate Film Room iframe IDs.
  - all eight workspaces have `data-resource-select`, no quick Resources row, no raw admin labels in lesson/podcast blocks, no contextless source questions, and no `(cont.)` nav titles.
- Static Social 20 lesson-title cleanup audit passed after the duplicate mini-lesson fix:
  - RI1 now has 23 lessons, with one `What is a Nation?`, one `What is Nationalism?`, and one `Napoleon and Nationalism`.
  - RI4 now has 21 lessons after the exact duplicate `North American Union` page was merged.
  - Social 20 RI1-RI4 now report no duplicate lesson titles.
  - Social 20 still contains all 38 podcast video IDs after regeneration.
- Static Social 10 lesson-title cleanup audit passed:
  - RI1-RI4 report no leading-number lesson titles, no `SS10` raw course-code labels, no duplicate lesson titles, and no admin labels in lesson/podcast blocks.
  - RI1 now shows `Issue Summary` instead of `SS10-1 U1`.
  - RI1-RI4 conclusion pages now show `Unit Wrap-Up`.
  - RI4 now shows `How Globalization Affects Individuals and Communities`.
  - Social 10 still contains all 17 podcast video IDs after regeneration.
- Static Social 10 missing-visual cleanup audit passed:
  - RI1: 14 absent D2L image references omitted from learner pages and listed in `social10-module-mapping.*`, 4 with recovered alt/title descriptions.
  - RI2: 42 absent D2L image references omitted from learner pages and listed in `social10-module-mapping.*`, 34 with recovered alt/title descriptions.
  - RI3: 55 absent D2L image references omitted from learner pages and listed in `social10-module-mapping.*`, 35 with recovered alt/title descriptions.
  - RI4: 20 absent D2L image references omitted from learner pages and listed in `social10-module-mapping.*`, 13 with recovered alt/title descriptions.
  - All four Social 10 workspaces now have 0 `.social-visual-source-note` elements, 0 `figure.social-missing-asset` elements, 0 `Image unavailable in export` strings, 0 `Visual source note` strings, and 0 missing local `src` assets.
- Static Social 10 malformed-text cleanup audit passed:
  - Unit 2 `Making Your Own Land Acknowledgment` now places in RI2 lesson 09, `Impacts of Imperialism on Indigenous Peoples in Canada`.
  - The land-acknowledgment template now uses blanks instead of `(answer here)` fragments, fixes `territory.This` and `welearn`, and presents the Alberta Treaties conversation guide, Métis settlement map, settlement corporation, and Elder-definition links as separate links.
  - All four Social 10 workspaces report 0 matches for targeted malformed patterns: `territory.This`, `welearn`, `acknowledgment:Metis`, glued helper URLs, `CanadaAnother`, `illiteracyBut`, and representative joined D2L sentence boundaries.
- Static Social 10 admin-summary cleanup audit passed:
  - All four Social 10 workspaces report 0 matches for lesson-preview/header admin strings such as `SS10-1 U# Lesson #`, `SS10-1 Lesson #`, `SS10-1 U# Summary`, `SS10-1 Conclusion`, and `Social Studies 10-1 Course Page`.
  - DOM audit of `.lesson-card`, `.lesson-document-header`, and lesson pathway summaries reports 0 bad preview summaries across RI1-RI4.
  - RI1 lesson 04 now renders the card/header summary as `Your individual identity can be easy to describe...`, not `SS10-1 U1 Lesson 3...`.
- Static Social 10 Source Analysis visual audit passed:
  - RI1 has 6 source-analysis image figures, RI2 has 6, RI3 has 2, and RI4 has 6.
  - All source-analysis local image paths exist on disk, and no source-analysis labels show raw DOCX image filenames, hash filenames, `SS10-1 U#`, `Practice set`, `Assignment Booklet`, `Image unavailable in export`, or `Visual source note`.
  - RI4 now uses extracted Unit 4 module visuals including `The Story of Stuff`, `China Blue documentary source`, `Factory production`, `Fact checking and social media`, `Collective action`, and `Migration and displacement`.
- Static Social 10 duplicate lesson-heading audit passed:
  - All four Social 10 workspaces now report 0 lessons where the first imported D2L heading repeats the shell lesson title.
  - RI2 lesson 04, `Ethnic Superiority and Social Darwinism`, now starts its imported content with the Pears' Soap source paragraph instead of repeating the title.
- Static all-Social duplicate lesson-heading audit passed:
  - All generated Social 10-1, Social 20-1, and Social 30-1 related-issue workspaces report 0 lessons where the first imported heading repeats the shell lesson title.
  - Social 20-1 was the remaining source of this pattern and has been regenerated from `scripts/build-social20-related-issues.ts`.
- Social 10-1 Issue Inquiry/support rollout across all four issues:
  - `scripts/build-social10-related-issues.ts` now renders Issue Inquiry with the Social 30-style structure: `Start with a position`, a four-step investigation block, possible-position mapping, proof-hunt fields, saved response fields, and Print/PDF behavior.
  - Social 10 now splits support documents by tool:
    - Issue Inquiry shows `Inquiry and evidence supports` with the Social 30-1 support set: `Fact vs Opinion and Journalism`, `Finding Premises and Conclusions`, `Reading Strategies`, and `Ways to Support an Argument`.
    - Source Analysis shows `Source analysis supports` with `Unit 1 Written Response - The Source Analysis`, `Guide to Analyzing Sources`, `Understanding Political Cartoons`, `Political Cartoon Skills PowerPoint`, `Political Cartoons`, and `Reading Images`.
    - Position Builder shows `Position writing supports` with the Social 30-1 support set: `Economic Position Paper How-To`, `Finding Premises and Conclusions`, `Position Paper How-To`, `Position Paper Notes`, `Position Paper Outline`, `Social Studies 30 Position Paper Checklist`, `Social Studies 30-1 Student Writing Sample`, `Ways to Support an Argument`, and `Writing Essays Thesis Statement`.
  - The Social 30 support files and Office previews are copied into `assets/social30-supports/` during the Social 10 builder run. `Tips for Success` is no longer collected into Social 10 support workspaces.
  - The Resources page now has matching groups: `Inquiry Supports`, `Source Analysis Supports`, `Position Writing Supports`, `Module Sources`, plus the normal textbook, issue document, and media groups.
  - All four Social 10 related-issue workspaces were regenerated after this rollout.
  - Static DOM audit passed: 4 inquiry steps, 11 saved textareas, 1 print button, and 1 writing activity panel.
  - Chrome spot check passed for `social10-1-related-issue-1-option-2#issue-inquiry`: visible investigation panel and no old simplified inquiry text.
  - Follow-up static/browser audit passed after splitting support: no Office file iframe sources, Source Analysis has 2 non-preview placeholders for PPT/PPTX, Chrome refresh produced 0 downloads, and there was no fetch failure on port 5175.
  - Follow-up Social 30 support audit passed: Inquiry has 4 Social 30 supports, Position Builder has 9 Social 30 supports, Source Analysis still has 6 Social 10-specific supports, `Tips for Success` has 0 matches, 15 Social 30 support/preview assets were copied, and the live preview on port 5175 serves the copied support previews with 200 responses.
- Social 10-1 Film Room title cleanup rollout across all four issues:
  - `scripts/build-social10-related-issues.ts` now applies Social 10 YouTube title overrides, treats generic iframe titles and lesson-title-only labels as fallback candidates, dedupes by media identity and title identity, preserves readable hyphenated media titles, and rewrites raw `title="YouTube video player"` iframe attributes during lesson sanitization.
  - All four Social 10 related-issue workspaces were regenerated after this rollout.
  - Static audit passed: RI1 has 18 Film Room items, RI2 has 15, RI3 has 14, and RI4 has 8; all four report 0 duplicate option labels, 0 generic labels (`YouTube video player`, repeated lesson titles, or generated `video #` placeholders), and 0 raw `title="YouTube video player"` matches in the generated workspace.
- Social 10-1 overview/admin-label cleanup rollout across all four issues:
  - Overview outcomes now match the Social 30 `I can...` pattern: explain the issue connection, analyze sources, collect evidence, and refine a Social Studies 10-1 position response.
  - Overview status pills now say `course lessons`, not `D2L lessons`.
  - Visible learner text audit passed across RI1-RI4: 0 matches for `D2L`, `SS10`, `Recovered D2L`, `Brightspace`, `Course Page`, or `D2L lessons`.
  - Active imported-course asset namespace is now `assets/imported/course/...`, and a static audit reports 0 `assets/imported/d2l/...` hrefs in the active Social 10 workspace HTML.
  - Resource titles/descriptions now strip visible `SS10-1` prefixes and replace `Recovered D2L file connected to this related issue.` with `Course file connected to this related issue.`
- Studio project API responsiveness fix:
  - `scripts/lib/projects.ts` now skips generated asset directories and parked generated workspace backups when listing HTML choices for Studio project bundles.
  - This prevents `/api/projects` from recursively walking imported course packages, duplicate `assets 2` / `assets 3` folders, or `workspace.previous-*` / `workspace.stuck-*` backups.
  - Live route check passed: `curl http://127.0.0.1:5175/api/projects` returned 54 projects in about 0.06 seconds after the patch and includes `social10-1-related-issue-1-option-2`.
  - Live project check passed: `curl http://127.0.0.1:5175/api/projects/social20-1-related-issue-3-option-2` returns immediately and no longer hangs on its duplicate asset folders.
- `npm run verify -- --project social20-1-related-issue-1-option-2` passed with existing external anthem/audio warnings only.
- `npm run verify -- --project social20-1-related-issue-2-option-2` passed.
- `npm run verify -- --project social20-1-related-issue-3-option-2` passed.
- `npm run verify -- --project social20-1-related-issue-4-option-2` passed.
- `npm run build:studio` passed after the Social 20 duplicate-heading regeneration.
- `npm run verify -- --project social10-1-related-issue-1-option-2` passed after the full Social 10 overview/admin-label cleanup rebuild.
- `npm run verify -- --project social10-1-related-issue-2-option-2` passed after the full Social 10 overview/admin-label cleanup rebuild.
- `npm run verify -- --project social10-1-related-issue-3-option-2` passed after the full Social 10 overview/admin-label cleanup rebuild, with the existing external Flickr warning only.
- `npm run verify -- --project social10-1-related-issue-4-option-2` passed after the full Social 10 overview/admin-label cleanup rebuild.
- `npm run build:studio` passed after the full Social 10 overview/admin-label cleanup rebuild.
- `npm run build:studio` passed after the Studio project-scanner fix.
- Shared overview `I can...` boxed-row rollout:
  - `scripts/lib/next-step-course-shell.ts` now renders `.unit-focus-list li` as Social 30-style white boxes with a 5px primary border and `0 6px 18px` muted shadow.
  - `scripts/build-social20-related-issues.ts` now resets generated workspaces by renaming the previous workspace aside before rebuild, matching the Social 10 strategy that avoids local recursive-delete hangs.
  - Social 20-1 RI1 overview wording now says `Social 20-1 lessons and course sources` instead of `recovered Social 20-1 lessons...`.
  - Static audit passed: all eight Social 10/20 generated workspaces contain the boxed `.unit-focus-list li` rule.
  - Direct browser preview checks passed for Social 20 RI1 and Social 10 RI1: row background `rgb(255, 255, 255)`, border-left `5px`, shadow `rgb(221, 226, 221) 0px 6px 18px 0px`, and 4 outcome rows.
  - `npx tsc --noEmit --pretty false --target es2022 --module nodenext --moduleResolution nodenext --esModuleInterop --skipLibCheck scripts/build-social20-related-issues.ts` passed after the Social 20 builder updates.
  - `npm run verify -- --project social20-1-related-issue-1-option-2` passed after a single-project rebuild, with only existing external anthem/audio warnings.
  - `npm run verify -- --project social20-1-related-issue-2-option-2` passed.
  - `npm run verify -- --project social20-1-related-issue-3-option-2` passed after a single-project rebuild.
  - `npm run verify -- --project social20-1-related-issue-4-option-2` passed.
  - `npm run verify -- --project social10-1-related-issue-1-option-2` passed.
  - `npm run verify -- --project social10-1-related-issue-2-option-2` passed.
  - `npm run verify -- --project social10-1-related-issue-3-option-2` passed with the existing external Flickr warning only.
  - `npm run verify -- --project social10-1-related-issue-4-option-2` passed.
- `npm run build:studio` passed after the overview boxed-row rollout.
- Live preview route checks passed for Social 20 RI1 and Social 10 RI1 on port 5175 with 200 responses, and Studio was reopened at `http://127.0.0.1:5175/`.
- Studio project-list categorization:
  - Workspace and Reference project dropdowns now render subject optgroups: Social Studies, English Language Arts, Science, Math, Psychology, Physical Education and Wellness, Career and Life, and Other.
  - `scripts/lib/projects.ts` hides the four legacy non-option Social 30 related-issue slugs from `/api/projects`.
  - API audit passed: hidden legacy Social 30 slugs are absent and `social30-1-related-issue-1-option-2` through `social30-1-related-issue-4-option-2` remain present.
  - Browser audit passed on `http://127.0.0.1:5175/`: Workspace project select has grouped optgroups and reports no legacy Social 30 entries.
  - `npm run build:studio` passed after the project-list grouping changes.
- `npm run typecheck` is still blocked by existing unrelated repo errors in ELA, Forensics, and Social 20 builder scripts; this was not introduced by the Studio project-scanner fix.
- In-app browser spot checks passed:
  - Social 20 RI2 Film Room shows 33 media items with NSO podcast entries at the front.
  - Social 20 RI2 lesson 47, `World War II Summary`, shows a visible podcast card with `WW2 Oversimplified Podcast` and `WW2 Podcast`.
  - Social 10 RI4 Film Room shows 8 media items with NSO podcast entries.
  - Social 10 RI4 lesson 06, `5. Acting Big - Civic Responsibilities`, shows a visible `Civic Responsibility Podcast` card.
  - Social 20 RI1 refreshed in the in-app browser at `#lesson-04`: 23 lessons, visible lesson `What is a Nation?`, and no duplicate lesson titles in the generated lesson sections.
  - Social 10 RI1 refreshed in the in-app browser at `#lessons`: 10 lessons, no bad titles, no duplicate titles, and titles read `Aspects of Globalization`, `Issue Summary`, and `Unit Wrap-Up` instead of D2L numbering/raw codes.
  - Social 10 RI1 lesson 04, `Media, Technology and Cultural Exchange`, refreshed in the in-app browser at `#lesson-04`: 0 visual source notes, 0 old missing-image boxes, no missing image loads, and no `Image unavailable in export` / `Visual source note` text.
  - Social 10 RI2 lesson 09, `Impacts of Imperialism on Indigenous Peoples in Canada`, refreshed in the in-app browser at `#lesson-09`: land-acknowledgment activity present, four helper links present, and no malformed `territory.This` / `welearn` / glued URL text.
- Chrome spot checks passed:
  - Social 10 RI2 `#source-analysis`: 6 source panels, 6 image figures, first image loaded, and no placeholder/admin text.
  - Social 10 RI4 `#source-analysis`: 6 source panels, 6 image figures, first image loaded, and no placeholder/admin text.

## Known risks / follow-up

- Social 20 RI1 still references external anthem/audio URLs from the original course content; verification reports them as warnings, not missing local assets.
- Social 10 RI3 still references one external Flickr image from the original course content; verification reports it as a warning, not a missing local asset. The Source Analysis dropdown now gives that image a learner-facing title instead of exposing the hashed Flickr filename.
- Social 20 RI1 and RI3 may need single-project rebuilds after a full interrupted Social 20 batch if verification ever reports stale missing imported assets. Running `npx tsx scripts/build-social20-related-issues.ts --only <slug>` produces fresh imported asset folders and verifies cleanly.
- The Social 10 D2L export does not contain many image files referenced by the original lesson HTML. Exact filename searches across the provided Social 10 D2L ZIP, duplicate `.imscc`, updated module ZIP, local Downloads ZIPs, repo projects, and the user's home folder recovered no Social 10 originals beyond an unrelated Social 20 `diversity.png`; the builder omits absent originals from learner pages instead of inventing or displaying placeholder boxes.
- Parked generated workspace backups remain after the local recursive-delete hang: `workspace.stuck-1783526569` for RI1 and multiple `workspace.previous-*` directories across Social 10 issues. They are not source of truth. Do not use broad `git status` or recursive delete over those directories until a safe cleanup path is chosen.
- The podcast source is currently `/Users/deanguedo/Downloads/NSO SOCIAL STUDIES PODCAST LIST.docx`. If that file is renamed or moved, the builders will fail instead of silently omitting podcasts.
- The builders place all confidently classified podcasts. Social 10 RI4 has one fallback overview placement for `Global Apathy Podcast`, which is recorded in `social10-podcast-mapping.*`.

## Source-of-truth location

- Podcast parser: `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/nso-podcasts.ts`
- Social 20 generator: `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-social20-related-issues.ts`
- Social 10 generator: `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-social10-related-issues.ts`
- Podcast source DOCX: `/Users/deanguedo/Downloads/NSO SOCIAL STUDIES PODCAST LIST.docx`
- Generated workspaces: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social20-1-related-issue-*/workspace/index.html` and `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social10-1-related-issue-*/workspace/index.html`
- Mapping reports: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social*-1-related-issue-*/meta/social*-podcast-mapping.md`
- Social 10 missing visual-source reports: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social10-1-related-issue-*/meta/social10-module-mapping.md`

## Fragile areas / what might drift

- Podcast issue placement is deterministic but keyword-based. If the DOCX titles change substantially, review the mapping report after regeneration.
- The Film Room dedupes by YouTube embed/video ID. If future links use a non-YouTube host, verify dedupe behavior before trusting counts.
- Lesson placement depends on current generated lesson titles and lesson text. If a D2L export changes title wording, fallback overview placements may increase.
- Social 20 mini-lesson merging is intentionally targeted: repeated `What is a Nation?`, repeated `What is Nationalism?`, repeated `Napoleon and Nationalism`, and exact consecutive duplicate titles merge. It does not flatten broader real lesson sequences.
- Social 10 title cleanup is display-focused and builder-owned. It strips leading D2L numbers, maps raw `SS10-1 U#` labels to `Issue Summary`, maps `Unit # Conclusion` to `Unit Wrap-Up`, and fixes a few learner-facing wording issues.
  - Social 10 missing visual-source cleanup is builder-owned in `sanitizeHtml`. It records only missing assets inside the final lesson content scope, omits absent originals from learner pages, keeps a simple related-source link only when the missing image was wrapped in an external link, and writes counts into `social10-module-mapping.*`.
  - Social 10 malformed-text cleanup is builder-owned. D2L lesson text uses conservative text-node cleanup for collapsed sentence boundaries and line-break joins. DOCX overlay text uses `cleanModuleRawText`, and the land-acknowledgment activity is deliberately extracted as a special high-priority prompt.
  - Social 10 preview-summary cleanup is builder-owned. `buildBaseLessons` now uses a summary-only D2L content extraction path and `summarizeText` strips any remaining D2L admin prefix before writing lesson cards/headers.
- The repo worktree contains many unrelated modified/deleted/untracked files from prior activity. Keep Social 20/10 podcast changes separate when staging.

## Next prompt assumptions

- Continue learner review in Studio before SCORM/export packaging.
- If the user asks whether podcasts are layered in, answer yes for Social 20-1 and Social 10-1 and point to the podcast mapping reports.
- If a podcast feels misplaced, adjust the issue/lesson hint rules in the builder and regenerate; do not hand-edit generated workspace HTML.
- If a repeated lesson title feels noisy, adjust `relatedMiniLessonCluster` or duplicate-title supplementation in `scripts/build-social20-related-issues.ts`, then regenerate from the builder.
- If a Social 10 lesson title still feels raw, adjust `cleanLessonDisplayTitle` in `scripts/build-social10-related-issues.ts`, then regenerate from the builder.
- If a Social 10 visual source is needed later, first check `social10-module-mapping.md` for unresolved D2L originals and check `assets/module-visuals/unit-*` for extracted DOCX visuals. If another real source file is found, add a deliberate source-specific override or asset import in `scripts/build-social10-related-issues.ts` rather than hand-editing workspace HTML. Do not restore learner-facing placeholder boxes.
- If another DOCX activity appears as a malformed paragraph, add a structured extractor or conservative text cleanup in `scripts/build-social10-related-issues.ts`; do not hand-edit generated workspace HTML.

## Exact next command

`npx tsx scripts/build-social10-related-issues.ts && npm run verify -- --project social10-1-related-issue-1-option-2 && npm run verify -- --project social10-1-related-issue-2-option-2 && npm run verify -- --project social10-1-related-issue-3-option-2 && npm run verify -- --project social10-1-related-issue-4-option-2`

## Exact next file to open

`/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-social10-related-issues.ts`
