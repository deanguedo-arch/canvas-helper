# Forensics Residue Audit (Phase 6B)

| File path | Residue category | Exact identifier / snippet / section | Why it counts as residue | Recommended action |
| --- | --- | --- | --- | --- |
| `projects/forensics/workspace/index.html` | Placeholder naming | `<title>chatgptcanvascreationexample.html</title>` | Placeholder/dev import title is learner-visible in browser and export contexts. | rename |
| `projects/forensics/workspace/main.jsx` | Learner-facing residue | `callout: "Phase 2 goal is full course-map coverage..."` | Internal phase language exposed in learner-facing callout fallback paths. | rename |
| `projects/forensics/workspace/main.js` | Learner-facing residue | `callout: "Phase 2 goal is full course-map coverage..."` | Same internal phase language in runtime file currently loaded by `index.html`. | rename |
| `projects/forensics/workspace/main.jsx` | Learner-facing residue | Learn panel cards: `What Phase 2 proves` / `What Phase 3 proves` | Dev-phase proof framing is internal build language, not course UX language. | rename |
| `projects/forensics/workspace/main.js` | Learner-facing residue | Learn panel cards: `What Phase 2 proves` / `What Phase 3 proves` | Same learner-visible dev copy in runtime file. | rename |
| `projects/forensics/workspace/main.jsx` | Learner-facing residue | Practice header: `Prototype practice layer` | Explicit prototype label is learner-facing dev wording. | rename |
| `projects/forensics/workspace/main.js` | Learner-facing residue | Practice header: `Prototype practice layer` | Same learner-visible prototype label in runtime file. | rename |
| `projects/forensics/workspace/main.jsx` | Learner-facing residue | Learn fallback text: `...in the next build stage.` | Build-stage wording leaks implementation phase details into learner UI. | rename |
| `projects/forensics/workspace/main.js` | Learner-facing residue | Learn fallback text: `...in the next build stage.` | Same build-stage wording in runtime file. | rename |
| `projects/forensics/workspace/main.jsx` | Learner-facing residue | Callout: `...answer the same dumb questions all term.` | Informal internal tone inappropriate for learner-facing copy. | rename |
| `projects/forensics/workspace/main.js` | Learner-facing residue | Callout: `...answer the same dumb questions all term.` | Same learner-facing internal phrasing in runtime file. | rename |
| `projects/forensics/workspace/main.jsx` | Demo/sample scaffolding | `const actualHtmlSamples = { ... }` | Seed sample HTML is fallback/demo scaffolding layered over map data. Needed for unmapped/partial nodes. | keep |
| `projects/forensics/workspace/main.js` | Demo/sample scaffolding | `const actualHtmlSamples = { ... }` | Same fallback sample data in runtime file. | keep |
| `projects/forensics/workspace/main.jsx` | Demo/sample scaffolding | `const courseSeed = { ... }` | Seeded module/lesson metadata acts as fallback map bridge; still required for mixed coverage. | keep |
| `projects/forensics/workspace/main.js` | Demo/sample scaffolding | `const courseSeed = { ... }` | Same fallback seed in runtime file currently executed. | keep |
| `projects/forensics/workspace/main.jsx` | Dev-only scaffolding | Bullet: `Eligible for richer renderer mapping in later passes` | Forward-looking build-roadmap language can appear in learner fallback bullet list. | rename |
| `projects/forensics/workspace/main.js` | Dev-only scaffolding | Bullet: `Eligible for richer renderer mapping in later passes` | Same roadmap language in runtime file. | rename |

## Notes
- `actualHtmlSamples` and `courseSeed` are currently functionally coupled to fallback coverage in `buildCourseFromD2LMap`; removing them now risks regressions for weak/unmapped nodes.
- Recommendation for this pass: keep fallback structures, but remove learner-facing phase/prototype/build language and placeholder naming.
