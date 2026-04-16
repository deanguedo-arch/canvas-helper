# World Religions 30 Option 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a new World Religions 30 course shell using the Mental Fitness Option 2 structure, with blank chapter/assignment lanes, generated quiz content from the booklet DOCX files, and local chapter PDFs in the library.

**Architecture:** Create a new standalone project under `projects/worldreligions30-option2`. Keep the shell data-driven so chapters, quizzes, assignments, and library items are rendered from one course data file. Reuse the proven in-app PDF viewing pattern and remove the unused sections from the Mental Fitness structure.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, local PDF.js viewer, Python stdlib DOCX parsing.

---

### Task 1: Create the new project scaffold

**Files:**
- Create: `projects/worldreligions30-option2/raw/original.html`
- Create: `projects/worldreligions30-option2/meta/project.json`
- Create: `projects/worldreligions30-option2/workspace/index.html`
- Create: `projects/worldreligions30-option2/workspace/main.js`
- Create: `projects/worldreligions30-option2/workspace/styles.css`
- Create: `projects/worldreligions30-option2/workspace/course-data.js`
- Create: `projects/worldreligions30-option2/workspace/pdf-viewer.html`

### Task 2: Copy the chapter library PDFs into the workspace

**Files:**
- Create: `projects/worldreligions30-option2/workspace/assets/library/Chapter 1.pdf`
- Create: `projects/worldreligions30-option2/workspace/assets/library/Chapter 2.pdf`
- Create: `projects/worldreligions30-option2/workspace/assets/library/Chapter 3.pdf`
- Create: `projects/worldreligions30-option2/workspace/assets/library/Chapter 4.pdf`
- Create: `projects/worldreligions30-option2/workspace/assets/library/Chapter 5.pdf`
- Create: `projects/worldreligions30-option2/workspace/assets/library/Chapter 6.pdf`
- Create: `projects/worldreligions30-option2/workspace/assets/library/Chapter 7.pdf`
- Create: `projects/worldreligions30-option2/workspace/assets/library/Chapter 8.pdf`
- Create: `projects/worldreligions30-option2/workspace/assets/library/Chapter 9.pdf`
- Create: `projects/worldreligions30-option2/workspace/assets/library/Chapter 10.pdf`

### Task 3: Generate the quiz dataset from the booklet DOCX files

**Files:**
- Modify: `projects/worldreligions30-option2/workspace/course-data.js`

### Task 4: Build the archival shell UI

**Files:**
- Modify: `projects/worldreligions30-option2/workspace/index.html`
- Modify: `projects/worldreligions30-option2/workspace/main.js`
- Modify: `projects/worldreligions30-option2/workspace/styles.css`
- Modify: `projects/worldreligions30-option2/workspace/pdf-viewer.html`

### Task 5: Wire chapter placeholders, quiz detail views, blank assignments, and library viewing

**Files:**
- Modify: `projects/worldreligions30-option2/workspace/main.js`
- Modify: `projects/worldreligions30-option2/workspace/course-data.js`

### Task 6: Manual handoff only

**Files:**
- No additional code files

**Checks:**
- open the new slug in Studio
- confirm `Home`, `Library`, `Quizzes`, and `Assignments` render
- confirm local chapter PDFs open in the in-app viewer
- confirm chapter quiz detail views show objective sections plus keyed written guidance
- confirm mobile collapse still works for the new shell
