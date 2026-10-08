# Reading the paths in this handoff

The source maps preserve actual source workspace locators and hashes. A source locator is not a claim that the original binary is bundled in this ZIP. Large textbook/PPTX/ZIP binaries, the full native index/runtime/CSS and the absent parent UnitC archive are intentionally not included.

| Original working location in review evidence | Location inside this handoff |
|---|---|
| `output/Biology30_CH17_Source_Teaching_Trial_v0.2.0/` | Archive root |
| `kinch-trial-v0.2.0/authoring/` | `evidence/authoring/`; resolved integration fragments are separately in `integration-text/` |
| `kinch-trial-v0.2.0/analysis/source/` | `evidence/source/`; current source map/readiness/conflict files also appear at root |
| `kinch-trial-v0.2.0/analysis/native/` | `evidence/native/` |
| `kinch-trial-v0.2.0/analysis/exemplar/` | `evidence/exemplar/` |
| `kinch-trial-v0.2.0/analysis/records/` | Finished decision documents at root; exact reading/binding evidence in `evidence/records/` |
| `kinch-trial-v0.2.0/analysis/assembly/` | Selected final pins and notice-only comparison in `evidence/assembly/`; no runnable course builder is supplied |
| Accepted earlier `calibration-v0.1.0/analysis/source/CURRENT_SOURCE_GATE.json` | Unchanged report copied to `evidence/source-gate/CURRENT_SOURCE_GATE.json`; reused, not represented as a new whole-source rerun |
| Original manifest/preservation binding | Unchanged copies in `evidence/source-gate/` |
| The three original teaching/process standards | Unchanged Markdown copies in `evidence/standards/` |
| Source native teaching SVG and labeling PNG | Unchanged copies in `review-assets/assets/`; embedded unchanged in the inert reading HTML |

The practice annotation's literal path `records/CURRENT_NATIVE_PREREQUISITE_READ.json` resolves to an exact duplicate of `evidence/records/CURRENT_NATIVE_PREREQUISITE_READ.json`. This small alias preserves the already reviewed map bytes while making its path directly usable.

Read snapshots and historical review deltas intentionally retain their earlier input hashes. Current final hashes are identified in `REVIEW_STATUS.md`, the source/integration maps and the manifest. A historical snapshot is evidence of what a reviewer actually read, not a second recommended lesson.

The `.html.txt` fragments and raw-before copies are inert text. They preserve exact UTF-8 bytes for later comparison. They are not standalone course pages and do not supply a runtime. The teacher HTML is the complete readable review document; its disabled controls are previews only.
