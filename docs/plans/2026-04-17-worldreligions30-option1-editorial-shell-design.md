# World Religions 30 Option 1 Editorial Shell Design

## Goal

Apply the flatter editorial visual language from the quiz detail page across the rest of `worldreligions30-option1` without making every section identical. The site should read as one coherent course shell instead of a mix of older card treatments and newer editorial surfaces.

## Approved Direction

- Flatten the shared shell: calmer paper background, simpler borders, reduced gradients, reduced shadow language, stronger serif hierarchy.
- Keep section behaviors intact: quizzes remain assessment-oriented, assignments remain workflow-oriented, chapters remain reading-oriented, library remains document-oriented.
- Use the quiz detail page as the visual reference, not as a literal layout template.

## Approach

### 1. Shared shell pass

- Simplify the body/background treatment.
- Flatten the sidebar into a more solid archival rail.
- Reduce outer shell decoration on `content-shell` and the home hero/progress surfaces.
- Tighten section headers so they feel like page headers instead of promo cards.

### 2. Overview card pass

- Convert chapter, quiz, and assignment overview cards into flatter editorial panels.
- Keep action buttons context-specific, but make card rhythm, borders, and metadata consistent.
- Reduce ornamental radial accents and soft panel glow styling.

### 3. Chapter and library detail pass

- Make chapter detail read like an editorial content page rather than a placeholder card.
- Make library controls and viewer panels align with the same system.
- Preserve existing actions and PDF viewer behavior.

## Constraints

- Scope stays inside `projects/worldreligions30-option1/**` plus required docs/tests.
- No `sportswellness` edits.
- No quiz or assignment behavior rewrites in this pass beyond visual integration.

## Verification

- Add/update a targeted source regression for the shared editorial shell markers.
- Run targeted tests, `build:studio`, and `test:e2e:project -- --project worldreligions30-option1`.
