# Narrow repair recheck and final verdict

2026-10-08, 17:45 UTC. This recheck follows the pre-repair findings in record02. It is a source-level reattempt, not a new blind learner trial or browser/LMS test.

## Exact artifact inspected

Current learner HTML: `batch08-09/learner/lesson-08.html`
SHA256: `05af71b5e738e6152dcff454be29d92ebce1f33e0ae993c332b8686b8dccb20b`

Retained pre-repair learner HTML: `batch08-09/review/initial-before-repair/lesson-08.html`
SHA256: `c8e9f6852176fbb12ed0fef0b2581e291e107eade21ff80b7eaf242a2e84267b`

Also inspected current blind text and HTML, the inserted paragraph in the actual learner HTML, presence in the manuscript and teaching fragment, and the adjacent PTH branch/antagonism text. No new browser rendering was performed.

## Observed change

The visible added paragraph follows the explanation of negative feedback:

“Reading clarification: textbook p.449 says the parathyroid glands ‘no longer secrete PTH.’ Normal feedback reduces the extra response as blood calcium is restored; it does not require all PTH secretion to become zero.”

There is exactly one matching paragraph. Removing that paragraph from the current learner HTML exactly restores the retained pre-repair learner HTML. The blind-text diff likewise contains only this addition. This is bounded parity proof between those two supplied lesson artifacts; it does not verify a canonical course owner, deployment, or learner state.

## Repeated affected explanation and task

### Required writing 1, reattempt

Low blood calcium stimulates the parathyroid glands to release more PTH. PTH promotes calcium release from bone mineral, increases return of calcium from kidney-tubule fluid toward blood, and promotes kidney activation of vitamin D. Active vitamin D increases intestinal absorption of available dietary calcium, so this intestinal effect of PTH is indirect. These separate contributions help blood calcium rise. As the original low-calcium stimulus decreases, the extra PTH response decreases. Negative feedback therefore opposes the initial fall; it does not require the normal circulating hormone level to become zero.

**Pass.** The new reading clarification resolves the p449 discrepancy without altering the trigger, gland, parallel branches, indirect vitamin D mechanism, or feedback direction. The existing feedback model still agrees with this answer; “reduces the stimulus for release” need not mean elimination of all release.

### Adjacent branch regression

- Bone route: bone mineral → blood; reserve mobilization
- Renal route: tubule fluid → blood; reabsorption/conservation, less potential urinary loss
- Intestinal route: intestinal contents → body/blood; absorption enhanced by active vitamin D after PTH-supported kidney activation
- The branches act in parallel toward one regulated circulating pool; one calcium ion need not traverse the three organs in sequence

**Pass.** All four distinctions remain explicitly taught in the current visible text. The inserted paragraph adds no route, new required premise, or contradictory arrow meaning.

### Adjacent antagonism regression / required writing 2 reattempt

PTH tends to increase blood calcium, while calcitonin can decrease it, so their overall effects on that shared variable are antagonistic. Their systems are not exact inverses: PTH and active vitamin D have major roles in adult human calcium regulation, calcitonin has a minor role, and the PTH–kidney–vitamin D–intestine branch does not justify drawing a reversed intestinal branch for calcitonin. Reduced extra PTH secretion as calcium rises does not mean calcitonin must take over as an equally strong controller.

**Pass.** No mirror-image or equal-importance inference is introduced. The current nearby comparison and its revealed model remain consistent.

## Final status after recheck

- **Pass:** all16 original blind local response items remain supported; all eight revealed models agree; core candidate science and inspected supplied figures remain accurate at the stated level
- **Pass:** p449 PTH-source reconciliation, previously Needs repair, is now repaired in the exact current learner artifact and rechecked above
- **Pass:** exact narrow parity between current L08 learner HTML and its retained pre-repair version outside the one clarification paragraph
- **Not verified:** actual browser/LMS behavior, responsive delivered layout, reader/video interactions, persistence/unlock/timer/progress, canonical-owner/protected-state preservation, teacher acceptance, later-lesson completeness, student learning, and unfamiliar independent transfer

No remaining blocking content/science repair was identified within this bounded08–09 review. Cosmetic L09 crop/title suggestions and weak-selection/near-model assessment limitations in record02 remain nonblocking; they do not authorize rewriting protected assessment items. This reviewer made no course-code or deployment changes.
