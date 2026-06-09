# Migration Report

## Source files used

- `source-package/workspace-source/course-data.js`
- `source-package/workspace-source/content/chapter-1/index.html`
- `source-package/workspace-source/assignments/module1assignment.html`
- `source-package/workspace-source/assignments/module1assignment.bundle.js`
- `approved-template/module-1-static/lesson.html`
- `approved-template/module-1-static/module-1-data.js`

## Module 1 data retained

- Course: Forensic Studies 25
- Module: Module 1
- Quiz: M1 Introduction to Crime Scenes Quiz
- Quiz answer key: C, B, A, A, A
- Assignment: Crime Scene Certification Lab

## Shell cleanup completed

- Default route changed to `#overview`.
- Sidebar labels changed to Overview, Lesson, Quiz, Assignment, and Resources.
- Lesson route embeds the existing Module 1 lesson content.
- Quiz route preserves the existing local scoring behavior.
- Assignment route preserves the existing iframe/full-screen assignment behavior.
- Resources route lists external links, assignment full-screen access, quiz access, and the Google Classroom submission reminder.

## Image paths retained

- Local images copied: 19
- Unresolved local image references: 0

## Resources retained

- https://www.youtube.com/embed/Ys09c9lANjI
- https://www.youtube.com/embed/jcypaqcKesU
- https://www.forensicmag.com/article/2009/02/crime-scene-safety#disqus_thread

## Assignment runtime support files

- `assignment/forensic-assignment-theme.css`
- `assignment/forensic-assignment-print.js`
- `assignment/module1assignment.html`
- `assignment/module1assignment.bundle.js`

## Compromises made

- Lesson content remains embedded in an iframe so the approved visual shell can stay separate from the lesson source.
- Assignment content remains embedded in an iframe so its interactive runtime is not rewritten by hand.
- Storage calls in the copied assignment bundle remain replaced with no-op handlers.
