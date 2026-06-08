# Forensics 25 Module 1 Static Tester

This is a content-only proof of concept for Module 1 of Forensic Studies 25. It preserves the course style, lesson content, quiz, assignment link, and local lesson images while removing course save, progress, lock, cloud sync, and full-course navigation behavior.

## Run locally

```bash
cd module-1-static
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080
```

## Extracted files

- Module 1 course metadata from `workspace/course-data.js`
- Lesson content from `workspace/content/chapter-1/index.html`
- Module 1 assignment files from `workspace/assignments/`
- Required local lesson images from `workspace/references/forensics/сontent/`

## Intentionally removed

- Google sign-in and cloud sync
- Save/resume behavior
- Completion tracking
- Locked and blurred states
- Full-course chapter, quiz, assignment, and dashboard navigation

## Later Google path

This static tester can become a Google Apps Script app by serving `index.html` through `doGet()`, splitting CSS and JavaScript into template includes, and moving images into a district-approved Google Workspace storage strategy. It can also be linked from Google Sites as separate module pages if direct app hosting is not approved.
