# Ticket T21 completion record

Status: IMPLEMENTED (queue reviewGate: no extra approval beyond the master contract)
Baseline commit/source hashes: dirty overlay continues from the T20 record; this ticket removes both CDN links from workspace/index.html, swaps 10 Font Awesome icons to text glyphs (index.html + main.js), unifies font stacks on system fallbacks + adds glyph/consent CSS in styles.css, converts all 3 video-embed renderers to consent-gated facades + delegated loader in main.js, and adds scripts/as30-asset-manifest.js, meta/ab30-parity/asset-manifest.json, meta/ab30-parity/media-ledger.json, scripts/tests/aboriginal-studies-30-assets.test.ts. Three older suites gain one seam slice each (no assertion changes).
Dirty-overlay/diff digest: cumulative overlay covers T01–T11 + T14/T16/T18-partial + T20 + T21 (uncommitted by contract). No Biology/Chemistry/brand files touched. No lesson, prompt, assignment, stored-work, or completion semantics changed. Brand logo + core tokens retained byte-identical.
Writer/approved scope: index.html assets; source/asset records; styles.css (queue allowedScope). No teacher/lead gate in this ticket.

## Changed files and actual changes

- workspace/index.html: Google Fonts + Font Awesome CDN links REMOVED (zero essential network deps); menu/collapse icons → ☰/‹ text glyphs.
- workspace/styles.css: --font-body/--font-display extended with full system stacks; 2 hardcoded Hanken stacks unified to the token; .icon-glyph + .consent-embed styles added.
- workspace/main.js: 8 FA icon sites → glyphs (✓/○/⌕/⇅/▤/▷/✕/⤢/⤡/⬇/‹/›, all aria-hidden with existing text/aria labels kept); new renderConsentEmbed/mountConsentEmbed + delegated [data-load-embed] handler; renderActivityResource/renderActivityPromptResources/renderMediaFrame emit the facade (host disclosed + load button, zero iframe until click); `autoplay` removed from iframe permissions.
- scripts/as30-asset-manifest.js (new, committed generator): emits the allowlist (path/bytes/sha256/class) + media ledger. Regen: `node scripts/as30-asset-manifest.js`.
- meta/ab30-parity/asset-manifest.json (new): 92 shipped / 5 excluded (2 Archive.zip + 3 .DS_Store, each reasoned).
- meta/ab30-parity/media-ledger.json (new): 70 entries with source/permission/fallback; permissions honest (`unverified` where no human confirmed).
- scripts/tests/aboriginal-studies-30-assets.test.ts (new): ASSET01 (refs exist), ASSET02 (zero CDN/iframe/autoplay + facade behavior), ASSET05 (allowlist/exclusions/sources), LEDGER (coverage + honest unverified).
- content/parity/route suites: +1 seam slice each (`renderConsentEmbed`) for the facade dependency; zero assertion changes.

## Evidence

- `node --test scripts/tests/aboriginal-studies-30-assets.test.ts`: 4/4 pass. Log: meta/ab30-parity/T21-run.log.
- Matrix step ASSET01–05: assets (01/02/05) + theme3 (03) + mywork (04-print) suites: 19/19 green.
- Full battery same session: 113/113 across all 11 suites.
- Audit (first-hand): 39 course-data asset refs (0 missing); 18 unique video URLs (all YouTube, all consent-gated); main.js literal refs all exist; index.html local-only (logo/css/7 js); zero `*key*` files under assets; 5 backup/metadata files excluded-but-intact.
- Rendered inspection: all 3 embed paths assert facade HTML (button + host + title, no iframe) through the real renderers; mount path is DOM-only (browser half belongs to T23).
- `node --check` main.js: SYNTAX_OK. `npx tsc --noEmit`: ZERO errors in touched files.
- Caught and fixed during T21: (1) generator written CommonJS in an ESM repo → import syntax; (2) seam named a wrong helper (libraryCodeFor vs moduleCodeFor — and the renderer needs neither) → dropped; (3) 4 cross-suite failures after the facade landed — old seams lacked the new dependency (test-only repair, production was correct).

## Learner-work impact

None: no store/data changes. Behavior changes are strictly resilience-positive: course renders fully offline except explicitly-consented video loads; controls never depend on fonts/icons loading.

## Content/source review

No content touched. Media permissions are LEDGERED, not approved: images/library PDFs read `unverified` (human decision before release; the T10 textbook-copyright note still stands). Film access stays unverified (ASSET03). No video added, removed, or auto-played.

## Not run / failed / blocked

- Real blocked-network browsing (fonts/icons/videos failing), consent-load click-through in a real browser, visual check of glyph rendering across platforms: NOT RUN — need a browser/human (T23).
- npx tsx --test: same environmental EPERM; lead/CI verification needed.
- Nothing failed; nothing blocked.

## Next safe step

T22 (responsive + accessibility pass) is next and unblocked: automated halves over the real shell (viewport/keyboard/focus/announcement/reduced-motion static checks) + explicit manual protocol for the human halves. The new consent buttons, mywork route, and glyph controls are T22 inputs.
