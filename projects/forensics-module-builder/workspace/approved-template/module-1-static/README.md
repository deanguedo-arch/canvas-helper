# Forensics 25 Module 1 Static Tester

This is the approved single-module static template for Module 1 of Forensic Studies 25.
It includes the extracted module shell, lesson page, quiz, assignment embed, and local resources needed for review and later module generation.

## Run locally

```bash
cd module-1-static
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080
```

## Routes

- `#overview` shows the module summary and student workflow.
- `#lesson` embeds the Module 1 lesson content from `lesson.html`.
- `#quiz` runs the Module 1 quiz locally with Try Again.
- `#assignment` embeds the Module 1 assignment and includes a full-screen link.
- `#resources` lists external links, the quiz link, the assignment link, and the Google Classroom submission reminder.

## Files included

- `index.html` and `module-1.js` shell
- `lesson.html` built from Module 1 source lesson pages only
- `module-1-data.js` extracted module, quiz, assignment, and resource metadata
- `assignment/` with the Module 1 assignment surface and support files
- `assets/images/` with copied Module 1 lesson images

## Removed from the learner runtime

- Course progress and locking UI
- Mark Complete controls
- Firebase/cloud-save references
- Other-module app code
- Runtime D2L fetch paths
- Browser storage progress logic

## Later export options

This static package can be converted to Google Apps Script or Google Sites by moving the same file set into the target host and preserving the relative links.
