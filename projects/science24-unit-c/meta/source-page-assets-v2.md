# Unit C source page assets

The original PDFs in `workspace/assets/textbook.pdf` and `workspace/assets/workbook.pdf` remain the source of truth. The 49 textbook JPEGs, 35 workbook JPEGs, and `*-page-index-v2.json` files are generated reading aids for the replacement candidate. The index preserves printed textbook page and physical PDF page as separate values and includes extracted text; the full image remains authoritative for figures, tables and question layout.

Regenerate page images from the unchanged PDFs at the reviewed size:

```sh
pdftoppm -jpeg -scale-to 1307 -jpegopt quality=82,optimize=y -r 120 projects/science24-unit-c/workspace/assets/textbook.pdf projects/science24-unit-c/workspace/assets/textbook-page
pdftoppm -jpeg -scale-to 1307 -jpegopt quality=82,optimize=y -r 120 projects/science24-unit-c/workspace/assets/workbook.pdf projects/science24-unit-c/workspace/assets/workbook-page
```

The two JSON indices were generated with `pypdf` from the exact PDF bytes and the approved printed/physical map in `source-task-map-v2.json`; they are candidate inputs for the future reader and are not yet wired into the current v1 learner page. The 2023 workbook key remains a separate original PDF with attempt-first guidance. Printed textbook p. 218, cited by workbook pedigree tasks, is absent from the 49-page textbook PDF; never invent a page image or substitute printed p. 217 without a visible note.

Visual spot checks completed: textbook physical p. 45/printed p. 217 and workbook p. 31. Both images keep the original diagrams and question context readable. Full page-by-page reader QA is deferred until the replacement UI is wired.
