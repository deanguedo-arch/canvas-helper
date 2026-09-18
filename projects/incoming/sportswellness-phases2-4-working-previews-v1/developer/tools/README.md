# Verification and reading tools

These are developer tools, not required to open a learner module. They expect Python with BeautifulSoup, Playwright, Pillow, PyMuPDF, CairoSVG and WeasyPrint. The recorded tests used `/usr/bin/chromium`. Set an installed Chromium executable in the tools when using another operating system.

From the extracted bundle root, `python developer/tools/verify_modules.py 2` runs the Phase 2 component fixture. Use 3 or 4 for the other phases. `supplemental_tests.py` tests the game bridge and compares available-reference geometry. `final_checks.py` checks links, documents, backups and export generation. `build_readings.py 2 3 4` rebuilds reading PDFs from the module HTML and matching authored question records.

The fixture inlines local assets and supplies an emulated browser-storage object because this execution environment denied URL navigation. Its captured-state reconstruction is **not** a real browser shutdown/reload or Brightspace test. For game embedding, the fixture supplies the launch nonce that would normally come from the iframe URL. The actual message validation and game application logic run unchanged.

The PDF tool takes lesson explanation/figure/worked-example markup from canonical HTML and question/Build/glossary records from `review/authored-content.json`. Keep those authoring records synchronized when editing questions. The generated PDF is an alternate format, not another assignment.
