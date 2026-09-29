# Evidence and rerun notes

These scripts inspect the original supplied workspaces. They do not modify the course source. The results stored here came from the September 24 audit; remaining human, device and LMS checks are not run.

## Source-contract probe

Extract the original comparison ZIP. Its root must contain `Chapter_3/` and `Chapter_4/`. Run:

```bash
node scripts/contracts_probe.cjs /absolute/path/to/extracted/root
```

Add `--assert-parity` to return a nonzero exit status when a proposed acceptance condition fails. On the reviewed build, the result is **2/9 passes**, consisting of two controls passing and seven demonstrated gaps. This small adversarial set is not a comprehensive course test score. Arbitrary-prose grading is not a proposed requirement; the complete-sentence rejection is recorded as an observation requiring an honest bounded/retained alternative.

## Controlled rendering and browser probes

Dependencies used in this audit: Python, BeautifulSoup, Playwright and a locally available Chromium executable. Point the environment variables at the extracted original archive and a fresh output directory:

```bash
export MATH_AUDIT_ROOT=/absolute/path/to/extracted/root
export MATH_AUDIT_OUT=/absolute/path/to/new/results
export CHROMIUM_EXECUTABLE=/path/to/chromium
python scripts/structure_probe.py
python scripts/browser_probe.py
python scripts/additional_browser_probe.py
```

The browser harness does **not** navigate to a live website or start an LMS. It inlines the original local HTML/scripts/styles, converts local image references to data URIs, preloads Chapter 3 dynamic mastery modules and uses a deliberately in-memory Web Storage substitute. A CSP meta element, if present, is removed for this local harness only. These tests must not be used to claim native storage, HTTP/CSP deployment, SCORM or Brightspace conformance. The source files are not changed by these transformations.

The scripts record observations in JSON. They are reproducible diagnostic probes, not a replacement for the full regression suite. Use specific expected outcomes from the audit as formal assertions when repairing the course. Portability edits in these copies change only root/output/executable paths; mathematical checks and interaction steps are preserved.

## Supplied tests

`results/supplied_cjs_tests.txt` records the three unchanged CommonJS test suites rerun against this archive. A temporary expected-directory-layout adapter was used because those tests reference repository-style paths; no test assertions or course sources were changed. This package does not reproduce the private repository or claim the supplied TypeScript browser/SCORM suites were rerun.

## Screenshots

Selected images show actual controlled-browser observations: abbreviated Chapter 4 teaching/support, unasked target transfer credit, rejected explanation, the four-check dead end, and a mobile-sized layout. The Chapter 3 teaching crop is illustrative. Any recovery banner caused by the storage harness is not attributed to the original course as a defect.

Desktop/mobile viewport images are not observations of actual learners, mobile keyboards, assistive technology, or live tenant behaviour.
