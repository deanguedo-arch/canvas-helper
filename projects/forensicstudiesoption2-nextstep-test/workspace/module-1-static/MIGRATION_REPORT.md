# Migration Report

## Source files used

- `workspace/index.html`
- `workspace/styles.css`
- `workspace/main.js`
- `workspace/course-data.js`
- `workspace/content/chapter-1/index.html`
- `workspace/assignments/module1assignment.html`
- `workspace/assignments/module1assignment.bundle.js`
- `workspace/assignments/forensic-assignment-theme.css`
- `workspace/assignments/forensic-assignment-print.js`
- `workspace/references/forensics/`

## Module 1 data extracted

- Module title: 1 Introduction to Crime Scenes
- Module code: Module 1
- Component count: 22

## Quiz data extracted

- Quiz: M1 Introduction to Crime Scenes Quiz

## Assignment files copied

- `module1assignment.html`
- `module1assignment.bundle.js`
- `forensic-assignment-theme.css`
- `forensic-assignment-print.js`

## Image paths rewritten

- Local images copied: 19
- Unresolved local image references: 0
- None

## Resources collected

- Real Life CSI - Crime Scene Cleaners: https://www.youtube.com/embed/Ys09c9lANjI
- 16x9 - Behind the Yellow Line: Real CSI Documentary: https://www.youtube.com/embed/jcypaqcKesU
- https://www.forensicmag.com/article/2009/02/crime-scene-safety#disqus_thread: https://www.forensicmag.com/article/2009/02/crime-scene-safety#disqus_thread
- Crime Scene Certification Lab assignment: ./assignment/module1assignment.html

## Compromises made

- The lesson and assignment are displayed in iframes to keep the tester shell simple and preserve each source surface.
- External videos and links remain external.
- The assignment React bundle was copied as-is except for disabling its browser storage calls for this content-only tester.

## Audit results

- Problem found: the copied Module 1 assignment bundle retained browser storage calls from the original assignment app.
- Fix made: the generated assignment bundle now replaces storage reads with empty-state reads and storage writes with no-ops.
- Remaining risks: assignment print/export behavior still needs teacher review in the target district browser environment.
