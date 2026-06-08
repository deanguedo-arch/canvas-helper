# Forensics 25 Module 1 Static Tester

This is a content-only static package for Module 1 of Forensic Studies 25.
It includes the extracted module shell, lesson pages, quiz, assignment embed,
and local resources needed for review and export-ready testing.

## Run locally

```bash
cd module-1-static
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080
```

## Files included

- `index.html` and `module-1.js` shell
- `lesson.html` built from Module 1 source lesson pages only
- `module-1-data.js` extracted module, quiz, assignment, and resource metadata
- `assignment/` with the Module 1 assignment surface and support files
- `assets/images/` with copied Module 1 lesson images

## Removed

- Course progress and locking UI
- Mark Complete controls
- Firebase/cloud-save references
- Module 2-8 app code
- Runtime D2L fetch paths

## Later export options

This static package can be converted to Google Apps Script or Google Sites by
moving the same file set into the target host and preserving the relative links.
