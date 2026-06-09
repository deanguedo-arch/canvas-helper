# Forensics Module 1 Routed Option Two Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the Forensics Module 1 static package so Chapters, Quizzes, and Assignments are separate Option Two-style views while preserving Module 1-only stripped/static behavior.

**Architecture:** Keep `scripts/build-forensics-module1-static.ts` as the source of truth. Generate a static `index.html`, `styles.css`, and `module-1.js` where hash routes (`#chapters`, `#chapter-1`, `#quizzes`, `#quiz-1`, `#assignments`, `#assignment-1`) render one view at a time. Avoid storage, progress persistence, locks, and full Option Two runtime imports.

**Tech Stack:** TypeScript generator, static HTML/CSS/JS, Playwright smoke checks, local Python HTTP server.

---

### Task 1: Replace static fallback with routed runtime

**Files:**
- Modify: `scripts/build-forensics-module1-static.ts`

**Steps:**
1. Replace `indexHtml()` with Option Two shell links that route by hash.
2. Replace `stylesCss()` with Option Two-compatible content, quiz assessment, and assignment styling.
3. Replace `moduleJs()` with hash router and no browser storage.
4. Keep generated data and lesson/assignment file copying unchanged.

### Task 2: Rebuild generated package

**Files:**
- Generated: `projects/forensics-module1/workspace/module-1-static/**`
- Generated: `projects/forensics-module1/workspace/module-1-static.zip`

**Steps:**
1. Stop any local server using the generated folder.
2. Run `npx tsx scripts/build-forensics-module1-static.ts`.
3. Run `node --check projects/forensics-module1/workspace/module-1-static/module-1.js`.
4. Rebuild `module-1-static.zip`.

### Task 3: Smoke test routes and styling hooks

**Files:**
- No code files.

**Steps:**
1. Start local Python server on `127.0.0.1:8801`.
2. Verify HTTP 200.
3. Use Playwright to open `#chapter-1`, `#quiz-1`, and `#assignment-1`.
4. Confirm chapter frame, assessment shell, quiz questions, score behavior, and assignment frame render.
5. Run residue scan for BOM/storage/Firebase/full-course terms.
