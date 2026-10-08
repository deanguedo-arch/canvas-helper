# Visual Exactness Contract

## Canonical direction
`Science24_Games_Visual_Standard_v0.1.md` and `Science24_Games_Visual_Reference_A1_v0.1.png` remain the shared authority.

## Hierarchy to preserve
- charcoal/near-black Science 24 / Next Step course header;
- prominent game title and explicit stage progression;
- three bounded learning zones whenever the mechanic supports it;
- deep forest-green panel headers;
- dominant white/pale-gray surfaces;
- pale-green selected/correct states;
- restrained bottom Feedback / Key Idea strip;
- real or polished illustrated scientific context separated from deterministic science UI.

## Pixel-regression gate
- Canonical desktop baseline: 1440×900, full page.
- Canonical mobile baseline: 390×844, full page.
- Codex must render the supplied executable mockup in the same browser used for runtime testing, then compare the production screen against that browser-rendered baseline.
- Screenshot comparison target: at least 99.25% pixel agreement after excluding deliberate runtime text/state differences.
- Component bounding boxes may not shift more than 4 px at the canonical viewport without written approval.
- Supplied PNGs are static reference previews; the HTML/CSS/assets are the exact authority.
- Fonts may use the supplied local system stack; do not introduce remote font dependencies.

## Asset rule
Every supplied asset has a manifest entry and a deterministic filename. Use it rather than substituting a vaguely similar icon or generated image. Decorative context may be replaced only through an explicit visual-standard revision.
