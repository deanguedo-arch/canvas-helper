# World Religions 30 Option 2 Design

**Goal:** Create a brand-new course shell that reuses the strong structure of `mentalwellness10-option2` but reframes it for World Religions 30 as an editorial, archival reading environment.

## Approved direction
- Reuse the Option 2 course structure.
- Build a new project shell rather than mutating Mental Fitness.
- Use the `Digital Curator` visual direction from `DESIGN (1).md`.
- `Home` should contain `Chapters`, `Quizzes`, and `Assignments`.
- `Library` should contain the chapter PDFs.
- Remove `Performance` and `Athletic Icons` entirely.

## Content model
- `Chapters`: 10 blank chapter placeholders for now, one per textbook chapter.
- `Quizzes`: 10 recreated chapter quizzes built from the `WR30_Assignment_Booklet_Chapter*.docx` files.
- `Assignments`: 10 blank placeholders for future authored activities.
- `Library`: local in-app viewing for `Chapter 1.pdf` through `Chapter 10.pdf`.

## Quiz interpretation
- The assignment booklets are treated as the quiz lane for this course.
- Objective sections should be rendered as interactive quiz content where practical.
- Keyed DOCX files provide the answer key and suggested written-response guidance.
- Written-response and student-choice prompts remain visible as workbook-style sections with teacher-key guidance available in the quiz detail view.

## Visual system
- Warm parchment base with tonal layering instead of dark tactical panels.
- `Noto Serif` for chapter/quiz reading tone.
- `Inter` for labels, controls, and navigation.
- No hard border-heavy framing as the primary structure.
- Calm gold/brown primary actions with blue-grey secondary accents.

## Architecture
- Create a new project slug: `worldreligions30-option2`.
- Keep the shell lightweight: `index.html`, `main.js`, `styles.css`, `course-data.js`, and `pdf-viewer.html`.
- Generate quiz data from the source DOCX files so the shell stays data-driven.
- Keep chapter PDFs local inside the workspace assets folder.
