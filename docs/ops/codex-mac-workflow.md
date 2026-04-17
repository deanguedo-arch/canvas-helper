# Codex Mac Workflow

Use this when working in the Codex desktop app on macOS.

This path keeps Canvas Helper behavior repo-native while making Codex edits and visual review fast.

## Quick Start (Codex + Mac)

1. Open the repo in Codex (`/Users/deanguedo/Documents/GitHub/canvas-helper`).
2. Run `npm install` once (if needed).
3. Start Studio:
   - Stable Studio only: `npm run studio:codex`
   - Studio + incoming watcher: `npm run studio:codex:auto`
   - Migration + Studio (only when needed): `npm run studio:codex:migrate`
   - Session helper (opens browser + prints prompt starters): `npm run studio:codex:session`
4. Open `http://127.0.0.1:5173` in your browser.

`studio:codex:session` skips migration by default to avoid manifest churn in git.
Use `npm run studio:codex:session -- --migrate` when you intentionally want layout normalization.

`studio:codex:session` also auto-selects a free Studio port (`5173`-`5193`) and prints ready-to-paste prompt templates for UI edits and image tasks.

## Visual Edit Loop

1. Keep Studio open in the browser.
2. Ask Codex to edit exact workspace files under `projects/<slug>/workspace/`.
3. Refresh preview as needed (Vite hot reload will handle many changes automatically).
4. Run verification for meaningful changes:
   - `npm run typecheck`
   - `npm run build:studio`

This gives you "visible HTML/CSS/JS editing" through Studio preview while Codex edits source files directly.

## Image Generation / Change Loop

1. Ask Codex to generate or edit the needed image.
2. Save final assets into `projects/<slug>/workspace/assets/images/`.
3. Update `projects/<slug>/meta/images-manifest.json` (or initialize it with `--init`).
4. Run `npm run sync:course-images -- --project <slug>`.
5. Verify image placement in Studio.

## Multi-Computer Workflow Split

- Codex on Mac: use `studio:codex*` commands and fast chat-driven file edits.
- VS Code on other machines: continue normal `npm run studio` or launcher usage.
- Canvas AI first-pass generation: treat outputs as intake, then import/refine in Canvas Helper.

Keep the repo workflow invariant across environments:
`import -> normalize -> edit -> expand -> integrate -> export`.
