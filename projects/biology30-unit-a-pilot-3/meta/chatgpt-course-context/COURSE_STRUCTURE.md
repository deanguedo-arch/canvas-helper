# Current course structure and visual language

## Learner experience

The course is one self-contained, route-based learner page. Its main surfaces are:

- Chapter 11 overview with student-facing explanation and “I can” outcomes.
- Fourteen Chapter 11 topics: eleven teaching topics, Chapter Review, and two optional extensions.
- Memorization practice, lesson check, and topic review.
- Process Collection with saved work and vocabulary/Frayer work.
- Textbook and video libraries plus sources and credits.

The course preserves stable activity and answer IDs so saved drafts, attempts, redo history, timers, and Process Collection records remain connected.

## Layout and styling

- Near-black fixed top bar and dark course sidebar.
- Next Step Continuing Education branding.
- White reading canvas with restrained green and teal accents.
- Large, readable headings using bundled Hanken Grotesk and Work Sans fonts.
- Simple borders, square or lightly rounded controls, high contrast, and generous instructional spacing.
- Desktop sidebar navigation with a persistent collapse control and Save and Exit action.
- Compact mobile course header and navigation.
- Student-facing science language rather than teacher or project-management language.

Use the screenshots as the primary visual reference. Do not redesign the whole course or introduce gradients, glass effects, oversized decorative cards, game styling, or dashboard-like chrome.

## Technical reference

- Launch file: `index.html`
- Main presentation: `styles.css`
- Course behavior: `assets/pilot3-runtime.js`
- Course catalog: `assets/pilot3-catalog.js`
- Local images, diagrams, fonts, and textbook PDFs are under `assets/`.
- Browser save key: `biology30-unit-a-pilot-3:v1`
- The SCORM bridge adds package save/resume and timing integration around the course.

The nested SCORM ZIP is a reference copy. Do not edit it and return it as a replacement course. For the requested neural-pathway activity, follow the separate nested labeling brief and return only the files that brief requests.

## Current SCORM limitation

The review snapshot includes save status, active-session time, resume, and page-time support. Automatic completion and progress measurement are intentionally not connected yet. LMS launch, resume, answers, completion, scores, and timing have not been certified in a target LMS.

