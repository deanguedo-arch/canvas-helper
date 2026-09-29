# Science 24 visual calibration: implemented A01, B14 and C09

The first three examples from the visual teaching plan are in the canonical learner pages. All three projects remain **blocked review candidates**. This is a Build-mode visual checkpoint, not teacher sign-off or course certification.

| Lesson | What changed | What the learner does |
| --- | --- | --- |
| A01, materials | Moved the rain-shell/towel image out of the polymer definition's fixed side column and into the fabric-choice worked example. It now appears as a restrained 250 px comparison on desktop and 210 px on phone. The caption distinguishes the illustration from the hypothetical Fabric A/B test data. | Compare water shedding with absorption before applying the supplied test results to an outdoor flag. |
| B14, coal | Removed the figure/guide side columns. The complete textbook Figure 8.2 is the main evidence at its 640 px source width on desktop. At tablet and phone widths, the four source panels are shown separately at a readable size with the corresponding A–D explanation; the original figure remains available through View larger. | Trace plant material, burial, accumulating layers and the coal seam in order. |
| C09, inflammation | Placed the textbook capillary/macrophage diagram below the explanation at a centered reading width. Added a reading question before it and native A/B explanations below it. | Follow a white blood cell leaving the capillary, then locate the macrophage acting in tissue. |

The source artwork, page credits, original textbook links, activity IDs and saved-work code were retained. Existing Studio edit keys on the figures and guide remain; the added reading prompts/steps have their own durable keys.

## Focused verification

- Opened the live A, B and C previews at 1594, 800 and 390 CSS px. All nine target sections rendered with loaded images, no page JavaScript errors and no horizontal overflow.
- Checked the A photo's computed height (250/250/210 px), its placement inside the worked example, and removal of the former polymer side pair.
- Checked B's whole image at desktop, four cropped panels at tablet/phone, and native guide columns at 4/2/1 across the three widths.
- Checked C's vertical reading order and both A/B steps. Each figure's View larger dialog opened with its image.
- Checked edit-key uniqueness in all three current HTML files (A 870, B 799, C 831; no duplicates). These content edits did not alter check or response IDs.

Screenshots of the exact reviewed sections are in each project's `meta/review-screenshots-visual-calibration/` folder, named by unit, lesson and viewport width. The fixed course header/footer crosses some element screenshots while Playwright scrolls a tall section into view; that overlay is a capture artifact of the live sticky shell, not figure content.

| Canonical file | SHA-256 |
| --- | --- |
| A `workspace/index.html` | `07b2809590d4c6e1e29b5783da3f75b82de2d27534236f5ea5c0c9390c6c085c` |
| A `workspace/unit-a.css` | `26d061a8054ad2ce964a1399110493671fa37161f56b5969f43becab51d6f591` |
| B `workspace/index.html` | `289f026fed667648e3ae18104c433a9f8d34f7c48e5360f38249c6dc09c823c6` |
| B `workspace/unit-b.css` | `05d98da0a07c757ecb5355f7ed9842a17f84e203ade98165fbb4ead50fb19006` |
| C `workspace/index.html` | `9327771814935987683127ae8517eff4545ea7527d7d870e665c7626d1cf4584` |
| C `workspace/unit-c.css` | `847ad995c10c66abd18724b8356dc3cf30ee3a78ee8d509bfc3216f9ab727f04` |

**Next:** Teacher reviews these three layouts in the refreshed previews. The other figure decisions in the visual teaching plan, full responsive/zoom sweep, Studio check, export, SCORM and Brightspace validation remain separate work.

## Open-tab correction

The existing in-app Unit B tab continued using an older cached `unit-b.css` after normal and hard reloads. That old stylesheet put the complete figure beside four uncropped copies of it. The canonical B HTML now references `unit-b.css?v=visual-calibration-2` so the open preview requests the corrected stylesheet. In that tab, the live computed layout changed from a two-column figure/guide grid with visible duplicate crops to a block layout with the crops hidden at desktop width. The source image and lesson content were unchanged.
