# Forensics 25 Google Sites Conversion Handoff

Date: 2026-06-09

## Purpose

Use this file to continue the Forensics 25 static module work on another computer and convert it toward a Google Sites delivery path.

The current artifact is not a deployed Google Sites package yet. It is a verified static-module package set that should be used as the source input for a Google Sites / Apps Script / Drive conversion.

## Current status

Modules 2-8 have been generated, audited, packaged, and served locally from the Forensics module-builder project.

Module 1 is the approved Option Two template/source model. Do not redesign it. Modules 2-8 were generated to match that model.

## Source of truth

Primary project folder:

```text
projects/forensics-module-builder/
```

Canonical editable/control files:

```text
projects/forensics-module-builder/workspace/approved-template/module-1-static/
projects/forensics-module-builder/tools/generate-module.py
projects/forensics-module-builder/tools/audit-module.py
projects/forensics-module-builder/tools/package-modules.py
projects/forensics-module-builder/tools/test_generator_contract.py
projects/forensics-module-builder/meta/project.json
```

Reference-only source package:

```text
projects/forensics-module-builder/workspace/source-package/
```

Generated static outputs:

```text
projects/forensics-module-builder/dist/module-2-static/
projects/forensics-module-builder/dist/module-3-static/
projects/forensics-module-builder/dist/module-4-static/
projects/forensics-module-builder/dist/module-5-static/
projects/forensics-module-builder/dist/module-6-static/
projects/forensics-module-builder/dist/module-7-static/
projects/forensics-module-builder/dist/module-8-static/
```

Packaged ZIP outputs:

```text
projects/forensics-module-builder/packages/module-2-static.zip
projects/forensics-module-builder/packages/module-3-static.zip
projects/forensics-module-builder/packages/module-4-static.zip
projects/forensics-module-builder/packages/module-5-static.zip
projects/forensics-module-builder/packages/module-6-static.zip
projects/forensics-module-builder/packages/module-7-static.zip
projects/forensics-module-builder/packages/module-8-static.zip
```

## Transfer checklist for another computer

Copy the full `projects/forensics-module-builder/` folder if possible. That preserves the source package, approved template, generator, audit tools, generated outputs, and ZIP packages.

If copying only the minimum deliverables, copy:

```text
projects/forensics-module-builder/dist/
projects/forensics-module-builder/packages/
projects/forensics-module-builder/meta/google-sites-conversion.md
projects/forensics-module-builder/meta/project.json
```

If the other computer needs to regenerate or repair modules, copy the full project folder, not just `dist/` and `packages/`.

## Local preview on another computer

From the repo root:

```powershell
cd projects\forensics-module-builder\dist
python -m http.server 8080
```

Open:

```text
http://127.0.0.1:8080/module-2-static/#overview
http://127.0.0.1:8080/module-3-static/#overview
http://127.0.0.1:8080/module-4-static/#overview
http://127.0.0.1:8080/module-5-static/#overview
http://127.0.0.1:8080/module-6-static/#overview
http://127.0.0.1:8080/module-7-static/#overview
http://127.0.0.1:8080/module-8-static/#overview
```

## Regenerate everything

From the repo root:

```powershell
cd projects\forensics-module-builder
python -c "import subprocess, sys; [subprocess.run(cmd, check=True) for m in range(2, 9) for cmd in ([sys.executable, 'tools/generate-module.py', '--module', str(m)], [sys.executable, 'tools/audit-module.py', f'dist/module-{m}-static'], [sys.executable, 'tools/package-modules.py', '--module', str(m)])]"
```

Run the full contract test:

```powershell
python tools\test_generator_contract.py
```

Audit one module:

```powershell
python tools\audit-module.py dist\module-4-static
```

Package one module:

```powershell
python tools\package-modules.py --module 4
```

## Module inventory

| Module | Title | Components | Lesson images | Assignment assets | Quiz |
|---|---|---:|---:|---:|---|
| 2 | Types of Evidence and Fingerprint Analysis | 17 | 25 | 7 | quiz-2 |
| 3 | Trace Evidence | 14 | 20 | 0 | quiz-3 |
| 4 | Body Fluid Evidence | 23 | 28 | 3 | quiz-4 |
| 5 | Forensic Detection of Impaired Driving | 18 | 23 | 0 | quiz-5 |
| 6 | Polygraphing and Document Analysis | 21 | 30 | 0 | quiz-6 |
| 7 | Forensic Genetics | 21 | 27 | 0 | quiz-7 |
| 8 | Careers in Forensic Science | 0 | 0 | 0 | none |

## Important fixes already made

Module 2 assignment assets were missing in the first output. The generator now copies module-specific assignment asset folders such as `assignment/module2/`.

Module 4 assignment uses a single HTML file with inline script. The generator now strips inline `localStorage` and `sessionStorage` calls from assignment HTML, not only from JS bundles.

Module 4 assignment assets are referenced from HTML, not from a JS `MODULE*_ASSET_ROOT` constant. The audit now reports `assignment/moduleN/` folders even when they are HTML-referenced.

Module 5 source lesson had visible self-labels that said Module 4 inside the Module 5 generated output. The generator now normalizes narrow current-module self-references.

Module 8 has no quiz and zero lesson components based on the source data. That is expected.

## Google Sites delivery recommendation

Use the Apps Script plus Google Drive asset pattern for Google Sites. Do not paste the generated browser HTML, JS, or CSS into Apps Script as `.gs` files.

Recommended architecture:

```text
Google Sites page
  embeds Apps Script /exec web app URL
Apps Script Code.gs
  serves a shell and raw text assets
Google Drive folder
  stores static module HTML, CSS, JS, images, and assignment assets
```

The generated module folders are static browser apps. For Google Sites, they need a stable web host. The repo's established Google ecosystem path is:

```text
Apps Script shell + Drive-backed assets + Google Sites embed
```

## Google Sites conversion tasks

1. Decide whether Google Sites should show one embedded landing page with links to Modules 2-8, or one Sites page/embed per module.
2. Build or export a Google Sites-ready Apps Script package that serves the module folders from Drive-backed assets.
3. Keep `dist/module-N-static/` folder structure intact when mapping assets.
4. Serve `.html`, `.css`, and `.js` files as raw text or blob/srcdoc-backed assets, not Drive wrapper pages.
5. Serve images and binary files as Drive-backed binary assets.
6. Preserve relative paths such as `./assignment/module4/blood-spill.jpg`.
7. Push only Apps Script shell files to Apps Script.
8. Upload the asset folder to Google Drive and set that exact uploaded folder as the Apps Script asset root.
9. Run `rebuildDriveAssetIndex()` after setting or replacing the Drive asset folder.
10. Deploy or redeploy the existing Apps Script deployment ID used by Google Sites.

## Google Sites verification checklist

Verify from the live Apps Script `/exec` URL in a browser, then verify inside the Google Sites embed.

Check:

```text
Module roots load.
Sidebar navigation works.
Overview, Lesson, Quiz, Assignment, and Resources routes load.
Lesson images render.
Module 2 fingerprint assignment images render.
Module 4 blood spatter assignment images render.
Quiz pages score locally where quiz exists.
Module 8 shows the no-quiz state.
No assignment shows ASSET OFFLINE.
No assignment shows Failed to fetch.
No browser console errors block visible use.
Google Sites embed uses the redeployed Apps Script deployment ID.
```

## Known non-goals

No deploy or publish has been done yet.

No Google Sites URL exists yet for this package.

No STAX-collected visual proof exists yet for the Google Sites version.

No full repo typecheck/build was run for this handoff because this task is project static packaging plus handoff documentation.

## Suggested next prompt on the other computer

```text
Continue from projects/forensics-module-builder/meta/google-sites-conversion.md.

Create a Google Sites-ready Apps Script/Drive delivery package for Forensics 25 Modules 2-8 using projects/forensics-module-builder/dist/module-*-static as the source inputs.

Keep the Option Two styling and behavior. Do not redesign the modules. Preserve the module folder relative paths, especially assignment assets. Use Apps Script only as the shell/text-asset bridge and Google Drive as the asset store. Do not paste browser JavaScript into .gs files.

First create the export plan and file map, then build the package.
```

## Exact next command

```powershell
cd projects\forensics-module-builder
python tools\test_generator_contract.py
```

## Exact next file to open

```text
projects/forensics-module-builder/meta/google-sites-conversion.md
```
