# Use this course as the design context for a new Biology 30 activity

Inspect this upload as a design-and-implementation reference for Biology 30 Unit A Pilot 3, Chapter 11.

Start by opening every image in `screenshots/`. Use them to understand the actual student experience: the Next Step black-and-green shell, fixed navigation, readable white lesson canvas, typography, spacing, buttons, lesson hierarchy, mobile treatment, and the current neural-pathway dropdown activity.

Then inspect `COURSE_STRUCTURE.md` and the nested `packages/biology30-unit-a-pilot-3-scorm-2004.zip`. The SCORM contains the current HTML, CSS, JavaScript, local fonts, source diagrams, and learner resources. Use it to understand how the course is structured and styled. Treat it as read-only reference; do not redesign, rewrite, or return the full course. It is a review snapshot, not proof of LMS readiness.

The actual creation task is inside `packages/biology30-neural-pathway-chatgpt-pro.zip`. Open that ZIP and follow `PROMPT_FOR_CHATGPT_PRO.md` and `RETURN_CHECKLIST.md` exactly. Use ChatGPT image creation to make the new original neural-pathway diagram, then build the requested local interactive HTML prototype around it.

The new activity should feel native to the supplied course:

- Alberta Biology 30 high-school science tone;
- clear instructional hierarchy rather than teacher/admin language;
- near-black, dark green, teal, white, and subtle grey-green borders;
- large central scientific diagram with dropdowns placed close to the five assessed letters on desktop;
- a clear list immediately below the diagram on narrow screens;
- accessible, keyboard-usable controls with strong focus and no colour-only feedback;
- no gradients, glass effects, gamified decoration, excessive shadows, or generic dashboard cards.

Do not copy the current low-resolution source art. Create an original, scientifically accurate high-resolution diagram. Do not place answer words inside the image. Do not change the required mappings, letter set, filenames, control IDs, or return-file list from the nested brief.

Return the four requested activity files in one ZIP. This prototype will come back to Codex for careful integration with the course's existing saved-answer IDs, timers, attempts, and Process Collection. Do not recreate those course systems in the prototype, and do not package or modify the full SCORM course.

