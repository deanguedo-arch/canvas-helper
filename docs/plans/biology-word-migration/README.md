# Word-owned vocabulary correction — in progress

## Current decision — any eight words

Continuation: Biology30 B now has the same individual-word/eight-slot workflow (153 words), exact first-teaching links and bounded mobile word navigation. B maximum is 34,047 characters. C's proposed profile fits at 43,515, but C/A/D remain unintegrated. Current hashes, source ownership and checks are in the active handoff; no deployment or packaging occurred.

The latest user decision is **any eight selected words per unit**, each opening an empty four-field Frayer, with copy and explicit removal safeguards to free a slot. It replaces both all-word storage and compulsory six-anchor/two-choice designs. No storage-policy question remains outstanding.

This workflow is implemented in the full Biology20 A workspace with shared page/popup state and original reader aesthetics. Earlier category writing keeps its original label and occupies a slot until explicitly removed. Measured maximum: 43,393 characters, under the unchanged 44,000 target. State, actual desktop/mobile candidate, project E2E, workspace and shared smoke checks passed; current exact hashes and commands are in `docs/ops/ACTIVE_HANDOFF.md`.

Biology30 A/B/C/D integration and individual word-content review remain unfinished. Do not claim all five courses complete. The rest of this document records historical decisions and is superseded wherever inconsistent with this section.

## Latest instruction and current state — supersedes the earlier eight-Frayer plan

The user now requires **every word** to have its own Frayer, save and Process Collection action, retaining the original Biology30 A reader aesthetic. Six anchors/two choices is no longer the final requirement. The current Bio20 A candidate still uses that old saved-response inventory pending replacement; do not present the expanded save system as implemented.

Bio20 A's 35 word-reference entries are now integrated into both page and popup. The rejected selector-over-family view was replaced. A-style plain navigation rows, teal labels, typography, two-column comparison and shaded retrieval were restored and visually inspected. Existing controls are loaned rather than cloned. Focus, oversized drafts, saves, original videos/PDF links, workspace verification, project E2E and shared smoke passed. Maximum state remains 43,297 under the unchanged current inventory.

Biology30 B153 and C249 word-specific drafts now exist in each unit's word-details.json. Their category/relationship schemas validate, including explicitly labelled source-topic groups for formerly ungrouped terms. They are not yet scientifically reviewed or integrated. A141 and D99 remain unfinished.

**Pending decision:** must all word Frayers persist across devices through the LMS, or is current-device saving with downloadable backup acceptable? The question was sent asynchronously. C's word fields alone could require 239,040 characters (249 × 4 × 240), exceeding the existing LMS payload target before other work. Do not silently choose local-only persistence or inflate thresholds.

See docs/ops/ACTIVE_HANDOFF.md for current candidate hashes, exact files and verification. The sections below describe the earlier baseline and are historical where contradicted by this update.

## Authorized scope
Biology20 Unit A and Biology30 Unit A Pilot 2, B, C and D. Categories organize words only. Each word owns Meaning, Word structure, What it does, Related ideas, Common confusion and Retrieve the idea. The full page and lesson popup must render the same record. Preserve existing saved writing, six anchors plus two learner choices, and existing save limits. No deployment or packaging.

## Actual status
This is **not integrated into any learner candidate yet**. The old category-based pages remain the current workspaces. Do not describe the new format or draft content as a delivered fix.

- Inventory frozen from the five current candidate HTML hashes and their declared owners in `inventory.json`.
- Unique word counts: Bio20 A 35; Bio30 A 141 (152 entries before deduplication), B 153, C 249, D 99. Total 677 across module inventories, not cross-course deduplicated.
- Bio30 A has 113 words without their own definition in its current panel payload; 28 primary entries have rich source records. Do not reuse a primary definition for a different related word.
- Bio20 A: 35 individually authored draft detail records at `projects/resources/biology20-production/v1/units/a/word-details.json`. Meanings retained from the existing course. Mechanism, confusion and retrieval text drafted word by word. Word analysis is contextual where supplied, otherwise explicitly unverified. Scientific second review remains outstanding.
- Shared `word-record.ts` rejects category-owned explanations and incomplete word fields. `word-reader.ts` presents category names containing word controls and a single selected word's sections. No persistence implementation is added by these components.
- Four focused tests pass, including all 35 selections at desktop/mobile widths and keyboard focus. This is component verification, not final course E2E or visual certification.

## Remaining work, in order
1. Review the 35 Bio20 draft records against their cited teaching parts. Integrate the common renderer into the full page AND popup, replacing the earlier added selector and family-reference display, not layering on another view.
2. Resolve every existing Frayer record to an explicit word target. Keep incompatible prior family writing clearly labelled and recoverable; do not relabel it as an answer for a different word. Check maximum state before enabling any migration. Do not invent storage fields or relax thresholds merely to avoid this review.
3. Reuse Bio30 A's rich entries only for exact matching words. Author/review its 113 missing individual definitions and remaining detail sections. Draft and review word-owned details for B/C/D using existing definitions, teaching and source material. Category prose is not a substitute.
4. Integrate both owning adapters (A and B–D/Bio20) with the same records, exact lesson/textbook links and existing Frayer controls. Preserve shared panel focus/scroll/draft behavior.
5. Update owning source reviews and dependent pins; rebuild through each current declared command. Check baseline arguments against the owning builder rather than assuming the stored command is fresh.
6. Run exact-candidate content inventory, save compatibility/capacity, workspace/project E2E, shared smoke and visual checks; document remaining external playback/LMS boundaries. No deployment.

## Do not repeat the prior mistakes
- A word selector above a family explanation is not this correction.
- A generic question repeated with a different word is not a word-specific retrieval activity.
- Missing verified word analysis must be stated, not guessed.
- Family Frayers cannot silently become newly assessed word answers.
- Do not claim passing component tests prove all five learner courses are finished.

## Reproducible checks
`npx tsx scripts/audit-biology-word-migration.ts` records candidate inventories only; it does not change learner files.

`npx tsx --test scripts/tests/biology-word-record.test.ts scripts/tests/biology-word-reader-browser.test.ts`

The old candidate receipts remain historical evidence for unchanged learner files. The new shared files and word JSON are staged authoring inputs, not yet added to active course manifests or builders.
