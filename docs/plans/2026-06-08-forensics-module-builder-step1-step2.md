# Forensics Module Builder Step 1-2 Implementation Plan

**Goal:** Set up a local module-builder workspace from the supplied source and approved Module 1 zips, then clean the Module 1 shell navigation into the final single-module template.

**Architecture:** Keep the supplied source package as immutable input under `source-package/` and the approved static tester under `approved-template/module-1-static/`. Step 2 edits only the approved template shell/docs so later generator work can reuse it.

**Tech Stack:** Static HTML/CSS/JavaScript, PowerShell extraction, Canvas Helper project workspace.

---

### Task 1: Create builder workspace

**Files:**
- Create: `projects/forensics-module-builder/workspace/source-package/**`
- Create: `projects/forensics-module-builder/workspace/approved-template/module-1-static/**`

**Steps:**
- Extract `forensics25-chatgpt-package-20260608-083502(1).zip` into `source-package/`.
- Extract `module-1-static-boom-normalized (1).zip` into `approved-template/`.

### Task 2: Clean Module 1 template navigation

**Files:**
- Modify: `projects/forensics-module-builder/workspace/approved-template/module-1-static/index.html`
- Modify: `projects/forensics-module-builder/workspace/approved-template/module-1-static/module-1.js`
- Modify: `projects/forensics-module-builder/workspace/approved-template/module-1-static/README.md`
- Modify: `projects/forensics-module-builder/workspace/approved-template/module-1-static/MIGRATION_REPORT.md`
- Modify: `projects/forensics-module-builder/workspace/approved-template/module-1-static/ACCEPTANCE_CHECKLIST.md`

**Steps:**
- Convert nav labels to Overview, Lesson, Quiz, Assignment, Resources.
- Route default to `#overview`.
- Add Overview and Resources routes.
- Preserve current lesson, quiz, assignment content and behavior.
- Update docs/checklist to describe the cleaned single-module template.
