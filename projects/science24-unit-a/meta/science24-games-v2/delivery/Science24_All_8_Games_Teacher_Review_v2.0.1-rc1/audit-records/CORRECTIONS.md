# Science 24 v2.0.1 correction register

Original ZIP and executable mockups are preserved under projects/resources/science24-games-v2. These changes were established before freezing this candidate. They do not revise teacher approval; every approval starts pending.

| Record | Correction | Evidence |
|---|---|---|
| A1-01 | Preserve all 11 v1.2 runtime hashes, case IDs and existing immutable first-transfer behavior. Rebuild offline HTML from those bytes. | a1-frozen-files.json; prior independent-validation.json; new package browser receipt |
| A2-01 | Reject unknown formulas, absent/zero/negative/noninteger/nonfinite coefficients. Validate every element. Accept balanced multiples except an explicitly requested smallest ratio. | independent fixture for all six cases; science/state regression assertions |
| B1-01 | Conservation and selected-output continuity both required. Lamp receives generator's 150 J electrical output. Biological matter paths remain separate from joule accounts. | 200→150 continuity regression; six accounts |
| B2-01 | Derive service compliance from equipment, quantity and hours; projector powers are alternatives. Reject negative/nonfinite inputs and shutting off required service. | service-floor and invalid-input assertions |
| B2-02 | B2-T01 retained; content version 2.0.1. Four 9 W lamps × 5 h = 0.180 kWh; 200 W × 2 h = 0.400 kWh; 140 W × 2 h = 0.280 kWh. Original 0.580 exceeds cap 0.500; repaired 0.460 meets it. | independent-fixtures.json; canonical scenarios.json |
| C1-01 | Cleaning a container does not block contaminated source water. Surface cleaning accepted only where a contaminated surface is in the route. Transfer measure map supplied; all sufficient combinations within budget accepted. | exhaustive subset assertions against explicit route maps |
| C1-02 | Route success means addressing the supplied route, not eliminating real infection risk. Defence layers overlap; memory is a consequence of adaptive response, not a separate anatomical barrier. | authored prompts/rubric; PHAC source |
| C2-01 | Supported aa × Aa square uses a,a row gametes and A,a column gametes. Uncertain transfer is aa × unknown dominant phenotype with no resolving child evidence. Accept AA/0% and Aa/50% in either order. Each offspring remains independent. | gamete/probability fixtures; MedlinePlus source |
| D1-01 | Use 5 m/s² constant deceleration: x = vr + vτ − 2.5τ², τ capped at v/5. Braking curve and stopped tail replace straight-line mockup segment; numeric totals preserved. | 60 m at t=3.5 s; 70 m stopped; table/graph browser views |
| D1-02 | Positive clearance is before; zero reaches obstacle; negative passes its position. | zero-clearance regression |
| D2-01 | Positive finite masses/durations; finite signed velocities. Occupant and cart boundaries explicit. Signed Δp/F and comparison magnitude shown. Locked-cart momentum conserved only under negligible external impulse; kinetic energy not assumed conserved. | signed-velocity/mass/duration fixtures; OpenStax source |
| UI-01 | Change source 42px controls to at least 44×44px; label all added controls; preserve keyboard focus, tables/DOM models and reduced-motion replay. | seven-width browser checks |
| UI-02 | Replace static mockup learner answers with blank inputs and selectable controls. Add prediction gates, actual-action feedback, revision history, self-review rubric and first-transfer records. Preserve shell CSS, assets, typography, headers, panel structure and breakpoints. | canonical app/state; actual-control flows |

UI-02 changes answer-area content and its required height. They are necessary to make the supplied static mockups playable; this register does not waive the user's 99.25% / 4px visual acceptance gate. The raw, unmasked comparison reports retain every failure. No entire learning panel is masked. Original references remain available for teacher comparison.

UI-03: Full signed numbers use wider numeric controls; the Punnett table uses a distinct class so the supplied grid styles cannot break its table layout. Transfer returns to the supplied two-panel shell; route evidence remains visible, with model results protected until the first response. Reduced-support missions omit the hint ladder. These necessary readability/input changes are included in the measured comparison.

A2-02: Elemental iron tiles are atoms; CaCO3, CaCl2 and Fe2O3 tiles are formula units. Supplied sprite filenames remain unchanged. D1-03: Replay time and the graph marker continue into the stopped interval while the braking displacement stays capped at the supplied duration.

D2-02: The illustrative cart marker joins at its contact position when the carts lock; it does not reset to the starting position. Momentum quantities and scenario IDs are unchanged.

CONTENT-01: Task-specific predictions and explanation prompts replace generic wording in the efficiency, body-defence, offspring-independence, graph-reading, controlled reaction-time, system-boundary and locking-cart tasks. The plant task explicitly asks about cellular respiration. Numerical solutions and case identifiers are unchanged.

## Source checks and limits

- [Alberta Science 24 program](https://education.alberta.ca/media/159714/sc1424.pdf): official program locators A31–32, B36–37, C42–43, D48–49. Games are supplemental practice; the crosswalk distinguishes task evidence from context.
- [PHAC transmission guidance](https://www.canada.ca/en/public-health/services/publications/diseases-conditions/break-chain-infection-respiratory-infectious-diseases.html): layered route interventions; no diagnosis, treatment recommendation or real risk estimate.
- [MedlinePlus risk assessment](https://medlineplus.gov/genetics/understanding/inheritance/riskassessment/): per-offspring probabilities and uncertainty. Fictional single-locus complete-dominance puzzles do not represent all human inheritance.
- [OpenStax impulse](https://openstax.org/books/physics/pages/8-1-linear-momentum-force-and-impulse): impulse equals momentum change; longer duration for the same impulse lowers average force magnitude. No injury, certification or real crash-pulse claim.

Current D2L source export: 129 indexed entries hash-match the package index. These checks establish provenance, not teacher acceptance. Secure assessment content and keys are excluded from review delivery.

- **C2-INPUT-02:** Blank whitespace and a bare percent sign are incomplete responses, not zero probabilities. Both are rejected; two independent regression checks cover this boundary.

## Premium reference integration (October 7)

The seven new user PNGs supersede the earlier v2 presentation references; A1 runtime remains frozen. Premium photographs and equipment cutouts contain no learner answers. Live equations, atom counts, pedigrees, routes, replay coordinates and signed results remain DOM/SVG. The exact new-reference scientific differences are recorded in `premium-visual-v1/PRODUCTION_HANDOFF.md`.

Worked screens now show read-only independently solved demonstration values in each actual mechanic. Practice and first transfer remain unfilled. Native particle compositions are independently count-checked. D1 uses the vehicle front as its position anchor and one synchronized quadratic calculation for replay, table and right-panel graph. D2 displays signed momentum/force separately from magnitude, and a controlled equal-momentum comparison. Transparent B1 equipment sprites illustrate the learner-selected pathway without replacing continuity or energy accounting. Header, focus and 44 px controls retain the corrected accessible implementation.

Title, feedback, transfer and mobile designs are implemented candidates without independently approved premium references. No screenshot of our own implementation is treated as visual acceptance.

The final screenshot inspection found empty cells in C2-W01 despite the worked probabilities. Its demonstration now displays AA/Aa/Aa/aa and the aa child evidence. A focused browser regression verifies both; independent practice inputs remain empty.

C2-PRESENTATION-03: The square remains in the evidence column while genotype probabilities and per-offspring interpretation occupy the right reasoning column, matching the reference composition and removing an empty worked panel. Response IDs and validator behavior are unchanged.
