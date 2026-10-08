# Bounded content and preservation review

Status: complete candidate authoring and static contract checks, 6 October 2026. This document does not certify the current integrated course, teacher acceptance, external playback or Brightspace.

## Evidence read and inspected

- Both full supplied teaching standards
- Exact reference02r1 and05 manuscripts as explanatory models for source-first biological mechanism, actual visual noticing, complete calculation, meaningful changed cases and feedback
- New06/07 continuity and sequence record; frozen10/11 entire lesson text, markup, node bounds, practice datasets and every textbook task routing
- Original114-slide PPTX slides77–91 via ZIP/XML relationship extraction, original selected media and their individual pixels
- Supplied chapter17 PDF pp610–617 text; rendered612,617,621 and other selected page contexts to read pedigree symbols, continued questions and actual diagrams
- Lead source review at `../research/source_science_review.md`, especially slide79–81 errors, slide87 unresolved-allele error and image82 competing models
- Independent reviewer, as reported by the lead, read both complete fragments and all five teaching figures. It confirmed the science and requested replacing “native drawing” with “drawing,” which is done

## Completed instructional checks

- Each lesson has a concrete actual diagram, explicitly guided reading and a connected question
- Model is defined before allele inference, and each genotype claim traces a required contribution
- Native A–D pointer semantics, locked answers and continuous numbering in source77/88 are accurate
- Autosomal AA/Aa and DD/Dd alternatives are not collapsed into certainty; A_ is distinguished from Aa
- Aa×Aa conditional2/3 derives from weighted gamete combinations and a3/4 unaffected denominator, contrasted against crosses where2/3 fails
- Finite runs do not prove absent alleles; likelihood of observed offspring is not equated with genotype probability without priors
- X/Y notation and every relevant transmission route are retained. Father/son co-occurrence is distinguished from direct paternalX transmission
- Both affected-father X-linked models are fully compared; all-offspring versus son/daughter denominators are explicit
- Whole-pedigree competing models are tested, including a complete genotype assignment for each compatible autosomal alternative
- Penetrance, expression age and expressivity are distinct. Fictional models do not become personal medical advice or family-history investigations
- New guided and independent paper-only tasks each have an intentional hint where appropriate and full explanatory feedback/criteria
- Native assessment overlaps are disclosed as formative; fresh tasks change the biological inference or counted population
- Every current mapped native/task object and optional textbook demand is either prepared or precisely flagged for other scope/source defects

## Static technical checks actually run

`build_deliverables.py` parses fragments and their source boundaries, then reconstructs each frozen lesson after swapping only the four permitted root subtrees. Reversing those swaps reproduces the exact original lesson string. It also verifies:

- Four and only four allowed outer roots per lesson, with exact original opening tags
- All19 original in-teaching vocabulary buttons match byte for byte:8 in10 and11 in11
- The complete original10 figure subtree occurs unchanged
- Unique IDs and namespaced new figure/practice headings
- No script, style, input, textarea, select or form added in teaching fragments
- Every teaching image resolves locally and has meaningful alternative text
- Exact snapshots of source lesson/practice/textbook/node files are preserved
- Every figure’s extracted bytes and source relationship are recorded; recovered SVG hash matches frozen authority
- Complete reading HTML, Markdown and text copies are regenerated from the same fragment bytes, with plain prompt/option/explanation text and original optional task content

## Not tested or not cleared

- Current integrated-owner identity/reconciliation beyond the supplied frozen SHA
- Course runtime, save/resume, progress, vocabulary dialogs, reader-page opening, keyboard interactions, print/export, mobile/desktop shell rendering, SCORM or Brightspace
- Existing external video playback, captions and embedding behaviour
- Separate native10 lettered identification PNG, absent from this child packet; mapping is preserved and parent must verify actual asset
- Teacher approval of these exact bytes or separate authorization to correct immutable prompt/routing errors

The static assertions are evidence of a bounded content change, not a substitute for runtime regression or curriculum acceptance.

A final lead-review reconciliation corrected the p620 Q13 map to the actual pea dihybrid diagram and linked completed15 support for617 Q1,620 Q14 and621 Q25. These are map-only corrections; no learner fragment or frozen task changed.

Final reader packaging removes every button, select, input, textarea, form and fieldset from reading copies. Native prompt words and option order remain exact; runtime-produced hints/answers/explanations are reproduced from the frozen JSON at their matching question. Native fragments and frozen course controls are untouched. An automated task-text check confirms each required/guided prompt, ordered option, hint, key, explanation, written model and criterion is present.
