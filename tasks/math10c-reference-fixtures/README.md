# Math 10C Reference Fixtures (pre-generation audit support)

Reviewer-owned, deterministic reference pack for auditing a **future,
externally generated** Math 10C course. It covers a deep factoring slice
(14 cases) and a smaller right-triangle trigonometry contrast (7 cases).

## What this is

- Audit support, not course content: these fixtures never ship to learners.
- Not curriculum certification, not a universal CAS, not a release decision.
- Each fixture carries a stable ID, category, prompt-ready expression or
  data, expected result, accepted equivalent forms, a likely misconception,
  and a short independent derivation.

## Files

- `FACTORIZATION_CASES.json` — factoring cases with integer coefficient
  arrays in descending degree; factors carry an optional integer content.
- `TRIG_CASES.json` — right-triangle cases with numeric inputs, an expected
  numeric answer, and an absolute tolerance.
- `../../scripts/verify-math10c-reference-fixtures.py` — schema, uniqueness,
  factoring-reconstruction, quadratic-discriminant, trig-recomputation,
  finiteness, tolerance, and content-bound checks.

## Factoring coverage

Greatest common factor (including a negative leading term), difference of
squares, monic trinomial, non-monic trinomial, perfect-square trinomial,
multi-step GCF-then-factor, prime over the integers (quadratic discriminant
argument only), and repeated factors.

## Trigonometry coverage (smaller contrast)

Missing side, missing angle, sine / cosine / tangent choice, units (cm, m,
degrees), and stated rounding per case. Every case declares its domain:
right triangle, acute target angle, positive side lengths, degrees, and
nonzero denominators.

## Intended later use

When the externally generated course exists, sample its questions, answers,
and checker behavior and compare them against these reference fixtures
(expected factorizations, discriminant arguments, and trig values within
tolerance). A mismatch is a signal for investigation, not an automatic
verdict: retain separate human mathematical derivation and teacher review
before accepting or rejecting generated content.

## Checks

```bash
PYTHONPYCACHEPREFIX=/tmp/muse-math10c-fixtures-pycache python3 -m py_compile scripts/verify-math10c-reference-fixtures.py scripts/test-verify-math10c-reference-fixtures.py
python3 scripts/test-verify-math10c-reference-fixtures.py
python3 scripts/verify-math10c-reference-fixtures.py --factoring tasks/math10c-reference-fixtures/FACTORIZATION_CASES.json --trig tasks/math10c-reference-fixtures/TRIG_CASES.json
```

## Limitations

- The verifier checks this narrow fixture schema only; it does not certify
  arbitrary learner algebra, notation, reasoning, or curriculum alignment.
- Prime claims are supported only as quadratic-discriminant arguments; the
  verifier proves the discriminant value, not general irreducibility.
- Trig recomputation covers only the declared right-triangle
  ratio/solve-for combinations in this pack.
