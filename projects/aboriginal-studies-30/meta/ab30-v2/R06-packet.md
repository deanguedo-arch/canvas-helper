# Muse bounded work packet
Read the master contract first. This packet does not override repository safety or authorize publication. Work only on the specified ticket.

# R06 — Finish lesson navigation, mobile layout and keyboard behaviour

**Depends on:** R05. **Owner:** Muse implementation; existing lead integration.

## Read for this ticket
- `03_VISUAL_AND_NAVIGATION_SPEC.md`
- `contracts/BASELINE_IDENTITIES.json`
- `contracts/DOM_TEST_CONTRACT.json`
- `08_MEDIA_ACCESSIBILITY_AND_DELIVERY.md`

## Production targets
- `main.js`: route parsing/history, sidebar rendering, `setActiveLesson`, `focusLessonHeading`, menu/dialog controls.
- `styles.css`: responsive header/sidebar/source cards and print exclusions.
- `lesson-components.js`: per-lesson guide, end-summary and previous/next links.

## Execute in this order
1. Retain current stable query routes and50 lesson IDs. One route renders one lesson; overview shows summaries, not all lessons. Invalid/old anchors resolve safely without losing drafts.
2. Build course sidebar groups in locked order with theme disclosure and individual lessons. Current route is visible within the sidebar on load/resume; remove the tiny nested fixed-height scroll region.
3. Put How to complete this lesson inside every lesson after the complete goal strip, with actual control names, save semantics and required-versus-optional statement.
4. At<=760px use two-row header; source metadata stacks<=640. Tie content offset to actual header height. Test zero logo/progress overlap and no pagewide horizontal scrolling at390 and 320.
5. Mobile menu opens from button, closes by close/Escape/selection, returns focus correctly. Dialogues/traps and focus scroll padding work. Test browser Back/Forward, deep-link reload, resume and unsaved-failure navigation.

## Evidence required to pass
- All50 route pages render once, unique DOM IDs, correct active navigation visible and next/previous sequence.
- No overlap/clip at tested widths; keyboard menu/dialog path works through actual controls.
- Guide present in all 50 lessons; browser history and normal reload do not erase work.

## Return
Write the completion record from `templates/TICKET_COMPLETION.json` into the evidence directory. Record actual changed file paths/hashes, commands, test results, screenshots and unresolved issues. Include the next ticket. Do not substitute a tests-only repair, weaken acceptance assertions, fabricate a review signature, publish or change provider settings. Run the relevant prior regressions after shared changes.
