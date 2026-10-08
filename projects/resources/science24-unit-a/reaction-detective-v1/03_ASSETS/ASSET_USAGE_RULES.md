# Asset Usage Rules

## Generated scene art

Files in `03_ASSETS/scenes/` are contextual concept assets produced for this handoff. They may be used as prototype art or regenerated at higher fidelity during production.

They are **not scientific evidence by themselves**. Any answer-critical information shown in an image must also exist as authored text/data in the scenario record.

## Mockups

Files in `02_MOCKUPS/` and `01_DESIGN/Design_Board_*.png` are composition references. Do not copy chemical labels, equations, values or claims from pixels.

Some generated mockups may contain scientifically oversimplified or placeholder content. `04_CONTENT/SCENARIO_BANK.json` is authoritative.

## Deterministic icons

Use local SVG icons from `03_ASSETS/icons/` for production controls. SVGs can inherit CSS colour if desired. The sprite sheet is provided as a convenience; individual SVGs are preferred for accessible buttons because each control can receive its own accessible name.

## Do not bake into art

Never bake these into generated PNG/JPEG assets:
- reaction formulas;
- exact temperatures or pH values;
- evidence labels;
- answer choices;
- reaction-type names;
- instructional text;
- progress status.
