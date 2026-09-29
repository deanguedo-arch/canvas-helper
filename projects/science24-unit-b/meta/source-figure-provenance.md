# Unit B source figures

These images are crops rendered from the supplied **Science 24 textbook PDF** in the Unit B canonical workspace. They are used only in the corresponding lesson; the complete source pages remain available in Textbook Practice. The printed textbook page and physical PDF page are recorded separately.

| Lesson | Learner asset | Printed page | PDF page | Instructional use | Review note |
|---|---|---:|---:|---|---|
| 4 · Generators and turbines | `workspace/assets/source-generator-p101.png` | 101 | 16 | Trace kinetic input through a generator to electrical output; inspect magnet and moving coil. | Figure 6.3 and 6.4 were visually checked. The crop includes their original labels/captions. |
| 15 · Finding, extracting and refining fuels | `workspace/assets/source-oil-reservoir-p140.png` | 140 | 45 | Read gas, oil, water and rock layers; explain trapping and well positions. | Figure 8.7 was visually checked. Lesson copy corrects the potential “underground lake” inference. |
| 14 · How fossil fuels form | `workspace/assets/source-coal-formation-p136.jpg` | 136 | 41 | Trace wetland plants, burial and coal seams through the A–D sequence with an adjacent editable panel guide. | Figure 8.2 replaces an oil-reservoir schematic that was incorrectly placed under the coal-formation heading. The oil-reservoir catalog entry is retained for prior reference; its meaning was not reassigned. |
| 15 · Finding, extracting and refining fuels | `workspace/assets/source-pumpjack-p141.jpg` | 141 | 46 | Connect the extraction explanation with one visible example of surface well equipment. | The caption identifies a pump jack as one method and avoids implying the reservoir is visible in the photograph. |

**Extraction:** The earlier PNG figures were rendered from the supplied PDF with `pdftoppm`. The new JPG crops were taken from the original textbook page renders in the canonical workspace with `sips`; each crop was visually checked against its full page. The source PDF was not edited. These are textbook excerpts, so the teacher should confirm the planned learner distribution/rights before export or LMS release.

**Excluded after inspection:** the p. 122 (PDF p. 31) energy-pyramid crop included adjacent explanatory text and clipped the diagram at useful reading sizes. The lesson keeps its own diagram and the full textbook page instead.

**Further review:** the p. 104 (PDF p. 18) coal-generation diagram was considered for Lesson 5. The available crop either clipped its A–F explanation or included unrelated page text; the lesson's existing turbine cutaway remains the clearer learner visual. Current electricity-mix claims from the old page were not copied.

## CBE-discovered supplemental figure

| Lesson | Learner asset | Source and status | Instructional use |
|---|---|---|---|
| 5 · Generation systems and transmission | `workspace/assets/water-turbine-cutaway.png` | Rendered from [Wikimedia Commons Water turbine.svg](https://commons.wikimedia.org/wiki/File:Water_turbine.svg), a U.S. Army Corps of Engineers public-domain illustration. The CBE `UnitB/UBM6P1.html` page links a raster version. | Trace water → turbine blades → shaft → generator. Compare with a steam-driven turbine without implying the turbine itself creates electrical energy. |
