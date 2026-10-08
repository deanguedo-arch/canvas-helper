# 00 — Locked decisions and corrected assumptions

## Product decisions
D01. One SCORM activity per learner workspace/deployment, linked prominently from a Brightspace course. Every assignment directs the student to that same activity; it does not instantiate a new Studio.

D02. English 30 students are the initial audience; the core workspace is assignment-independent. Projects store their own prompt, type, criteria, notes and draft. Track preference is General / English 30-1 / English 30-2; no hidden grading differences are inferred from it.

D03. Selected visual shell: the last uploaded **light planning and settings** screens. Bold sans-serif headings and UI; serif is optional for the writing canvas, not mandatory display branding. The earlier dark-sidebar imagery is subordinate.

D04. SCORM 2004 4th Edition is the build target. A 3rd Edition compatibility build requires a separate validated configuration. There is no silent SCORM 1.2 fallback. D2L documents general 1.2/2004 support, not this tenant's precise behaviour. [S1, S3]

D05. The first release supports a finite workspace. Maximum serialized wire state is **56,000 ASCII characters**, warning at 44,000 and urgent at 50,000. These are our conservative product limits, not claims about a measured tenant maximum. Compression is not a promise of a project/word count.

D06. Primary persistence is the current LMS attempt payload. Browser recovery is optional, isolated by learner/deployment, and never sold as permanent storage. Portable backups are explicit student-generated files. [S3, S4]

D07. Complete projects remain editable and can be archived in-app. Archive is a display filter, **not storage savings**. “Export and remove” is a distinct verified-backup workflow. No automatic deletion to make room.

D08. No direct assignment submission in pure SCORM. The action is **Export draft**, with separate directions to submit in the Brightspace assignment. A manually configured assignment link may open externally; it never transmits the draft or proves submission.

D09. Feedback is **learner-entered notes copied from feedback they received elsewhere**, not live teacher threads. Show origin “Added by you” and optional source/date. Do not invent teacher names, unread notifications, or API-based comment syncing.

D10. No automated grades. Criteria are teacher-provided or learner-entered checklist text. Revision progress measures checked review items, not writing quality. A task can be marked not applicable with an explanation; the numerator/denominator must reflect that.

D11. Default full-cloud version history is out of scope. There is one current draft per project in SCORM, plus local-only bounded recovery checkpoints when enabled. Explicit project duplication and backup files provide portable snapshots.

D12. No image, audio, PDF attachment or arbitrary-file upload into the learner state. Sources are text metadata. Optional decorative bundled image IDs are app assets, not learner uploads.

D13. Accessibility is always present. There is **no “screen-reader support” switch**. Optional display settings: text size, line spacing, reduced motion, high contrast, editor serif/sans. Do not advertise clinical benefits for a font.

D14. No new official school logo is invented. “Next Step / Writing Studio” is a text lockup; supplied leaf line art is decorative, not the institution's official mark. No D2L masthead, fake bell or fake avatar login menu.

D15. No fabricated literary quotations. Existing screenshot essay excerpts and names are illustrative only. Original source examples require teacher review and correct quote-vs-paraphrase labeling. Default guides use clearly original, fictional examples.

## Corrections to earlier conversation
C01. The current uploaded ZIP is an editable development source, not a working SCORM integration. Its README says so, and inspection found no manifest/API bridge.

C02. Earlier claims that D2L “explicitly says all new versions reset learner progress” are not established by the current documentation inspected for this handoff. The documentation confirms static/dynamic linking and version replacement, but not universal data preservation or universal reset. Record the tenant outcome; do not assert either as a rule. [S2]

C03. A stable browser key alone is unsafe on shared devices. Keys must include deployment scope and a learner-scoped identifier; app semver is not a storage namespace. Different origins/storage partitions can still make the cache unavailable. [S4]

C04. An LMS `Commit("" )` result is an API/player acknowledgement, not a portable server read-after-write guarantee. `GetValue` can return buffered state. Network status is a hint, not proof. UI uses “Saved to Brightspace” only under the tenant-verified label policy; default development label is “LMS player accepted save”. [S3, S6]

C05. Same-device tabs can be coordinated. Standard SCORM does not provide a cross-device lock or conditional update transaction. Simultaneous device editing remains unsupported and can overwrite a whole workspace despite optimistic checks.

C06. Percentages in the images are not coherent source data (for example 60% beside one completed stage). Replace them with actual counts of student-checked steps. Do not preserve illustrative numbers merely to match pixels.

C07. The two raster “sprite” sheets have baked text and visibly damaged transparency. They are reference-only. This handoff supplies actual SVG icons; buttons, cards, rings and menus are code.

## Owner-dependent deployment fields
Before live release, the owner must supply/confirm tenant identifier, cohort/course deployment scope, which Content/SCORM player is used, availability dates, sharing/cache policy, pinned linking behaviour, and a synthetic learner account. These are explicit deployment gates, not reasons for Codex to invent an external service.

All [S#] citations resolve in `13_SOURCES_AND_VERIFICATION.md`.
