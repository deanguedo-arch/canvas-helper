# R06 record — lesson navigation, mobile layout, keyboard behaviour

- Contract: stable routes, visible active nav, per-lesson guide (done R05,
  re-verified), two-row mobile header on a measured offset, menu
  Escape/focus/scrim, draft-safe history/reload.

## Find/fix

- **Found:** lesson subnav lived in a 360px nested scroll box; nothing
  scrolled the active link into view; Escape only served the library
  reader; no scrim; mobile header squeezed menu/logo/progress into one
  64px row with a hardcoded 84px content offset.
- **Fixed:** nested scroll removed — sidebar scrolls, `revealActiveNavLink`
  (`block:nearest`, sidebar only) runs on every nav paint; `setMobileMenu`
  single writer (open→focus into menu, close→focus returns to menu
  button); Escape/scrim/selection all close; selection closes without
  stealing focus (lesson heading takes it).
- **Fixed:** ≤760px two-row header (menu/logo, full-width progress);
  `syncTopbarOffset` measures the real height into `--topbar-actual` at
  boot + resize; sidebar top, main padding, scrim inset, and
  `scroll-padding-top` all follow it.
- **Fixed:** eyebrows from display order (`Learn · Theme N · Lesson X of
  Y`); sidebar order overview→Themes→My work→Resources; print hides
  guide/pager/scrim while teaching still prints.
- **Verified, not rebuilt:** stable query routes + 50 IDs (ROUTE01/02);
  one article per route + unique IDs (NAV01); one aria-current (NAV03);
  prev/next array order (ROUTE03 + pager on every route); guide in all
  50 after the strip (VIS05); nav setters wipe nothing, unload flushes
  (NAV08); overview mounts no lessons (NAV10).
- **Not changed:** sidebar group labels (repo shell contract pins them;
  V-06 Start/Learn wording deliberately not adopted — deviation
  recorded). Native `<dialog>` keeps its own trap/Esc + focus restore.

## Evidence

- Tests: 10/10 nav suite (incl. behavioural reveal + offset seam runs);
  battery 165/168 (same 3 lead-owned shell); doctor PASS; manifest
  regen (ASSET05 green).
- Browser proof extended (`as30-r05-browser.cjs`: two-row, overlap,
  offset, scrim, active-link at 5 widths) but NOT_RUN — no engine
  launches in this sandbox. Same single lead-run command covers R05+R06.
