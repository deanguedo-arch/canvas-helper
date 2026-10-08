# Biology 30 — teaching-overhaul prompt pack
Prepared for Dean Guedo | 2 October 2026

## Start here
Paste `01_CODEX_START_HERE.md` into Codex and supply `02_TEACHING_STANDARD.md`. The first task is to locate the actual current Chapters 11–20, preserve their contracts, and export Chapter 11 for authoring. It deliberately does not ask Codex to rewrite all ten chapters in one run.

Bring the exported Chapter 11 package into ChatGPT with `03_CHATGPT_AUTHOR_CHAPTER.md` and the teaching standard. Author and review a bounded batch of two or three coherent lessons. After explicit content approval, give the manuscripts and manifest back to Codex using `04_CODEX_IMPLEMENT_APPROVED_BATCH.md`. Use `05_REVIEW_AND_ACCEPT.md` for an independent review of both content and implementation. `06_CHAPTER_HANDOFF_TEMPLATE.md` organizes the transfer without making the developer notes visible to students.

Complete the chapter progression map before drafting small batches. Calibrate with Chapter 11 and stress-test the standard on an identified later lesson of a contrasting type before scaling. Then continue Chapters 11–20 with the same quality threshold. Earlier chapters receive the full review too.

## What this pack is — and is not
This is a proposed workflow, instructional standard, and set of reusable prompts. It is not a completed chapter rewrite, a scientific audit of Chapters 11–20, a delivered image pack, or an authorization to publish changes.

The remote repository inspection established the main branch revision as `ed6dcc2c23c88c245e19dbb6ae190e57c4ffeac4` and retrieved the historical Pilot 3 activity catalog, which contains stable question IDs, answer keys, and label mappings. The full Pilot 3 HTML could not be retrieved through the connector, and the current learner-visible Chapters 11–20 were not established or audited in this task. Codex must therefore establish the actual current working sources rather than use this remote revision as a canonicality claim. No repository files were changed.

Teacher reports that teaching is stronger in Chapters 11–15 and weaker later are treated as review input, not independently verified findings.

## Persistent project guidance
Keep the full teaching standard in a dedicated project document and explicitly require it to be read in each task. A concise pointer may be added to the appropriate existing AGENTS.md without replacing unrelated repository instructions. Codex's official instructions describe AGENTS.md discovery from the repository root to the working directory; a file elsewhere is not automatically part of that path. Do not assume a custom standard filename is automatically read.

Reference: OpenAI, Custom instructions with AGENTS.md, accessed 2 October 2026:
https://developers.openai.com/codex/guides/agents-md/

Repository evidence inspected:
https://github.com/deanguedo-arch/canvas-helper/blob/ed6dcc2c23c88c245e19dbb6ae190e57c4ffeac4/projects/biology30-unit-a-pilot-3/workspace/assets/pilot3-catalog.js

## File order
00_README.md — how to use the pack and evidence limits.
01_CODEX_START_HERE.md — inventory and bounded source export.
02_TEACHING_STANDARD.md — the shared instructional and preservation standard.
03_CHATGPT_AUTHOR_CHAPTER.md — complete classroom-style authoring.
04_CODEX_IMPLEMENT_APPROVED_BATCH.md — faithful implementation and regression checks.
05_REVIEW_AND_ACCEPT.md — independent acceptance with evidence.
06_CHAPTER_HANDOFF_TEMPLATE.md — repeatable manuscript and integration structure.
