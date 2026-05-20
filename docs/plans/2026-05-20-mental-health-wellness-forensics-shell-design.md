# Mental Health & Wellness Forensics Shell Design

## Intent

Create a new `mental-health-wellness` conversion project from the supplied Brightspace ZIP while reusing the visual shell, module navigation, completion buttons, and iframe content pattern from `forensicstudiesoption2`.

## Current Scope

- Include content modules only.
- Omit quizzes and assignments from navigation/data for this first build.
- Preserve a regeneration path from the Brightspace ZIP.
- Keep later quiz/assignment work possible by retaining empty arrays in `course-data.js`.

## Source

- Source ZIP: `C:\Users\dean.guedo\Downloads\D2LCCExport_60408_21-22 _ S2 _ Mental Health _ Wellness _ Per 1(A) __202652043.zip`
- Shell reference: `projects/forensicstudiesoption2/workspace/`

## Course Shape

- Chapter 1: Course Information
- Chapter 2: Unit 1: What is Mental Health?
- Chapter 3: Unit 2: Stress, Coping, and the Body
- Chapter 4: Unit 3: Mental Illness
- Chapter 5: Unit 4: Treatments
- Chapter 6: Unit 5: Community Resources
- Chapter 7: Unit 6: Self Care

## Exclusions For This Pass

- Top-level `Assignment Submission`
- Hidden teacher materials
- Unit assignment subtrees and assignment print/online files
- Quiz surfaces until a keyed quiz/import pass is requested later

## Verification Contract

- The project metadata is migrated conversion metadata.
- The shell is discoverable by the Studio project picker.
- `course-data.js` exposes `window.MENTAL_HEALTH_WELLNESS_DATA`.
- `quizzes`, `assignments`, and `library` are present and empty.
- Chapter content pages use module component completion and the `mental-health-wellness-module-progress-*` bridge.
- No learner-facing page includes Forensics branding or placeholder assessment copy.
