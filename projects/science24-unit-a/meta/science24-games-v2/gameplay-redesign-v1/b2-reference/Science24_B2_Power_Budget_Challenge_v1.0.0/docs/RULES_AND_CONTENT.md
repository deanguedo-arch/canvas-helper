# B2 rules and content contract

## Model

Each group uses `quantity × input watts per device × operating hours / 1000` kWh. All input powers are constant while on; run times are selected in half-hour steps from 0 to 12 hours. Ratings, times, caps and service equivalences are invented teaching assumptions, not product specifications or a building forecast.

A plan succeeds only when the number and duration of every required service are preserved, the calculated total is within the cap, and the submitted arithmetic and closed reasoning check are correct. Plan totals are not rounded before budget comparison. The learner may submit kWh rounded to three decimal places or the equivalent Wh; tolerance is approximately 0.0005 kWh. Invalid, blank, negative, non-finite, missing or unsupported inputs do not silently become zero.

## Guided sequence

| ID | Purpose | Canonical example/answer |
|---|---|---|
| B2-W01 | Model quantity, power, time and separate energy accounts | 4 × 10 W × 5 h = 200 Wh; 1 × 60 W × 4 h = 240 Wh; total 0.440 kWh under 0.500. |
| B2-P01 | Compare equivalent lighting while preserving service | Six 10 W lamps for 6 h use 0.360 kWh under 0.750. Other permitted hours at or above the service floor are accepted if the cap and submitted calculation are satisfied. |
| B2-P02 | Count every device and remove only extra time | 8 × 80 W × 2 h = 1.280 kWh; 6 × 12 W × 3 h = 0.216; fan 60 W × 2 h = 0.120. Total 1.616 kWh under 1.650. |
| B2-P03 | Convert 90 minutes and preserve a compulsory session | Initial 0.414 kWh exceeds 0.400; equivalent 150 W projector for 1.5 h plus lights = 0.369. Shortening the session fails. |
| B2-P04 | Efficiency and conservation | 900 J useful / 1,500 J input × 100 = 60%; thermal output = 600 J. Useful + thermal = input. |
| B2-T01 | Fresh independent application with conventional data | Lights: 4 × 15 W × 3 h = 0.180 kWh. Two 120 W workstations for 2.5 h = 0.600; initial total 0.780. Equivalent two 80 W workstations = 0.400; revised total 0.580 under 0.650, with all times preserved. |

The transfer uses a new setting and numbers because the earlier v2.0 handoff repeated the projector practice data in its transfer entry. Copying a previous answer is not independent transfer.

## Optional centre lab

The live-total lab is an application workspace rather than a scored test. It deliberately shows the numbers as students manipulate time.

| Group | Quantity | W per device | Initial h each | Initial energy (kWh) | Minimum h each |
|---|---:|---:|---:|---:|---:|
| LED lights | 10 | 10 | 8 | 0.800 | 6 |
| Room heater | 1 | 1,500 | 6 | 9.000 | 4 |
| Study computers | 5 | 50 | 4 | 1.000 | 3 |
| Water heater | 1 | 2,000 | 2 | 4.000 | 1.5 |
| Device chargers | 10 | 2 | 6 | 0.120 | 2 |
| Total | | | | **14.920** | |

The cap is 20.000 kWh. All minima total 10.390 kWh, so the optional 12.000 kWh stretch target is reachable without dropping services. Actual heater/charger cycling and building performance are not modelled. These stipulated service floors do not claim to keep a real building at a safe temperature or satisfy real charging requirements.

The premium visual mockup displayed 14.87 kWh with inconsistent row arithmetic. That number is not copied. Aggregate power in ambiguous mockup groups has been expressed explicitly as per-device ratings and quantities in this implementation.

## Scaffold fading

Worked example: the calculation is revealed in four explanatory steps. P01/P02: plan controls, prior calculation, closed reasoning, and optional hints. P03: hint access begins only after a complete submitted attempt and written justification is required. P04: numerical efficiency/accounting task. Transfer: no live totals or hint button; a data table, two energy totals, a plan choice and written explanation. Formula help and backward navigation remain accessible, with support recorded before the first transfer submission.

## Submission integrity

A blank/incomplete entry produces validation feedback but is not counted as a complete attempt. A complete attempt stores an immutable copy of the draft, result, opened hint count and support state. The first such record is retained. A passed answer is locked. Revision unlocks the controls, clears the CURRENT pass and self-review, and keeps the earlier attempt history. A self-review is required to unlock a new step. Previously unlocked steps remain revisitable so navigation cannot delete later work.

Only already visited/unlocked learning stages are navigable. First entry to transfer also requires the current checks and self-reviews for all four practice tasks. Returning to an already visited transfer does not erase its first-submission record. The review only announces route completion while all current practice and transfer checks and self-reviews are satisfied.

## Replay

After checking a plan, the optional replay assumes every device starts at model time zero and stops at its own selected run time. At time t, each group has used `quantity × power × min(t, operating hours)` energy. It is a schematic concurrent timeline, not a real operational schedule. It can be paused, resumed or replayed. Reduced-motion preference resolves directly to the final account. The replay never changes the answer or completion record.

## Writing

Do not keyword-grade explanations or imply that entering any text proves understanding. The runtime checks the presence of required writing only and labels it not automatically graded. Teacher/self review should ask whether the learner used the correct quantities and units, preserved the required services, compared the total with the cap, and connected the decision to the calculation.
