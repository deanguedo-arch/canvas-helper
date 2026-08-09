# Studio Review Set V2

- Status: V2 implemented and locally verified on `codex/studio-workflow-v2`; V1 received the recorded ChatGPT Pro `GO` review.
- Date: 2026-08-04
- Scope: one compact, temporary annotation set shared by embedded Studio and the full-screen preview.
- Out of scope: learner-course changes, raw/export edits, persistent handoff history, batch screenshot export, automatic model calls, and Social 10 source-ownership repair.

## Decision

ChatGPT Pro red-team and green-team adviser passes converged on a small volatile Review Set rather than a history system.

- One project per set; changing between Reference and Workspace views does not discard saved Workspace annotations.
- At most five saved source-mapped workspace selections.
- A final packet is capped at 5,120 UTF-8 bytes.
- The set lives only in browser memory. Reloading, closing Studio, or switching course ends it.
- Changing course warns before the current set is cleared; changing between Reference and Workspace does not.
- A saved item keeps the original bounded inspection request and its resolver result. After saving, only its note and optional screenshot can change.
- Exact duplicate means same project, mode, page, and opaque inspection node. Duplicates are rejected rather than merged.

## Final adviser review

ChatGPT Pro independently inspected the pushed `codex/studio-review-set` branch through the GitHub connector. Its final verdict was **GO**: no blocker was found for persistence/privacy leakage, screenshot object-URL lifecycle, stale or late-response races, ownership overclaim, scope clearing, silent packet omission, or workflow complexity. It also confirmed the intended Social 10 boundary: no declared authoring driver means the project remains `unknown` with a proposal-only diagnostic.

## Teacher workflow

1. Turn on **Inspect** and select a workspace element.
2. Add the current inspection to **Review Set**. Optionally capture one local screenshot annotation first.
3. Repeat for up to five items. Remove items or revise their concise notes when needed.
4. Studio automatically replays every saved resolver request after a save or note change.
5. When **Copy Review Set for Codex** becomes available, copy the one frozen packet into a Codex task or ChatGPT Pro review.

The same flow is available in a connected full-screen preview. It edits the one Studio-owned set rather than creating a second copy. Copy is deliberately disabled until automatic preparation completes. A stale or materially changed mapping stops preparation; Studio never silently refreshes, omits, or rewrites a saved item.

## Privacy and token boundary

- Screenshots remain local object URLs in browser memory. They are individually downloadable and never enter the handoff text, including as per-item presence flags.
- Teacher notes are rejected above 256 UTF-8 bytes. Source excerpts are fixed at 256 bytes and visibly marked only when shortened.
- The packet includes source ownership only when the resolver actually returned it. It never invents candidate files, source lines, rebuild commands, or a new ownership state.
- Oversized packets fail preparation rather than silently dropping fields or items.

## Social 10 boundary

The generic Review Set intentionally does not claim Social 10 source ownership. Its current resolver result remains `unknown` with the existing proposal-only diagnostic. That is a correct fail-closed answer while the project lacks a verified ownership adapter.

The separate follow-up is a Social 10 adapter with a zero-learner-content-diff proof: it must map a selection to an existing canonical builder/source contract and prove that rebuilding does not change learner output before Studio may offer a target.

## Verification contract

The proving set remains deliberately mixed:

| Project | Ownership type | Expected result |
| --- | --- | --- |
| `forensics35` | direct workspace | exact source ownership remains available |
| `ela20-1-modern-play-crucible` | English factory | bounded rebuild-owned source remains available |
| `social10-1-related-issue-1-option-2` | legacy proposal-only | remains unknown; no invented edit target |

Local implementation checks cover the five-item cap, 5 KB byte cap, duplicate blocking, automatic stale revalidation, screenshot exclusion, project-scope clearing, full-preview synchronization, and generated/proposal-only source behavior.

## Adviser / implementer roles

ChatGPT Pro is the red-team and green-team adviser. Codex validates the actual local branch, implements only the accepted contract, and runs the repository checks. The adviser review is not evidence that a local file is correct by itself; local tests and provenance rules remain the source of truth.
