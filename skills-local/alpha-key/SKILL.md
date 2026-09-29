---
name: alpha-key
description: Turn painted checkerboard backgrounds into true alpha transparency with edge-connected keying and flatten-proof verification.
---

Use when wiring art with painted checkerboard (gray-check) backgrounds into games or pages.

## Steps

1. Inspect the source: confirm the background is a painted checker (two alternating near-gray tones), not true alpha (`file`, then sample corners).
2. Key with edge-connected flood fill only: seed from all four borders through near-gray pixels (`min(r,g,b) > 175`, `max-min < 26`, tune per asset). Never global-key — interior parchment, highlights, and light paint must survive.
3. Reframe only if geometry demands it; never silently resize. Keep a backup of the pre-key original until the proof passes.
4. Flatten-proof: composite the keyed art onto solid white AND the real page background, view at 100%+. Zero checker cells, zero interior holes, zero halo fringe.
5. Stage under a versioned name (`-v2`, `-v3`) so browsers can't serve the cached bad copy. Update refs, verify every ref resolves, delete orphaned versions.

## Rules

- If keying eats interior detail, the seed leaked: tighten the gray definition or add interior keep-masks, don't ship holes.
- Rounded art on dark backgrounds: prefer true alpha + CSS radius over opaque squares.
