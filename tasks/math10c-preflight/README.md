# Math 10C Preflight (Phase A audit harness)

Preparation scope only. This directory contains a reusable audit harness
for a future ChatGPT-authored Math 10C candidate. It builds no course and
modifies no project.

## Contents

- `ASTRA_REQUIREMENTS.json`: 33-row requirement matrix with documented
  schema, stable IDs (`MATH10C-REQ-001`…`033`), and 10 critical-stop rows
  that cannot be averaged away.
- `EXEMPLAR_STYLE_INVENTORY.md`: reusable Biology Pilot 3
  presentation/state patterns with limitations; Chemistry pilot recorded as
  blocked evidence, not a pattern to copy. Source inspection only.
- `AUDIT_REPORT_TEMPLATE.md`: audit report with separate verdicts for
  local artifact alignment and complete repository/LMS readiness.
- `../math10c-reference-fixtures/`: reviewer-owned factoring and
  right-triangle trigonometry cases for sampling generated questions,
  answers, and checker behavior.
- `../math-source-registry/`: hash-bound inventory tooling and verified
  metadata for the complete Math 10C, 20-1, and 30-1 source family.
- `../../scripts/audit-math10c-candidate.py`: read-only standard-library CLI
  (see below). `../../scripts/test-audit-math10c-candidate.py`: focused tests.

## How to run the scanner (after ChatGPT's candidate is supplied)

```bash
python3 scripts/audit-math10c-candidate.py <candidate-zip-or-directory> \
  --requirements tasks/math10c-preflight/ASTRA_REQUIREMENTS.json \
  --output <report.json>
```

The scanner is read-only toward the candidate (ZIP members are inspected
without unsafe extraction). It writes one deterministic JSON report with
candidate SHA-256, inventory, checks, findings, limitations, transparent
counts by status/severity, and a verified fraction whose denominator is
every requirement, with unresolved rows listed.

Run the focused tests:

```bash
python3 scripts/test-audit-math10c-candidate.py
python3 -m py_compile scripts/audit-math10c-candidate.py scripts/test-audit-math10c-candidate.py
```

## What the scanner is (and is not)

The scanner is Phase A assistance: static triage of packaging integrity,
reference resolution, placeholders, accessibility indicators, save/state
signals, learner-flow keyword evidence, pilot content indicators, and
secret-exposure review flags.

It is not a substitute for independent mathematical derivation, rendered
browser inspection, teacher review, or Phase B claim verification. It does
not certify mathematical correctness, accessibility conformance, live
Brightspace behaviour, or production readiness.
