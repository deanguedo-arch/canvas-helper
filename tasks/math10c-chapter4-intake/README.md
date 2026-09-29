# Math 10C Chapter 4 intake boundary

Status: preflight complete; blocked instructional review build created. The canonical candidate is `projects/math10c-unit4-pilot/workspace/`. It contains the reconciled eight-lesson sequence and all 32 target statements, but deliberately has no answer bank, mastery score, retained-work state, SCORM bridge, grade reporting or export authorization. A bounded tracked-student Brightspace save/resume check for the Chapter 3 model passed on 2026-09-24; teacher, accessibility, and real elapsed retention review remain open. Fresh exports of both independent source variants, CBE System and NXT Master, are preserved by path and hash for controlled intake.

## Remaining Math 10C chapter sequence

The verified CBE System and NXT Master archive metadata agree on the seven-chapter Math 10C sequence: Chapter 1 Measurement; Chapter 2 Trigonometry; Chapter 3 Factors & Products; Chapter 4 Roots and Powers; Chapter 5 Relations & Functions; Chapter 6 Linear Functions; Chapter 7 Systems of Linear Equations. Chapter 3 is the existing review candidate. Build Chapters 4–7, then reconcile Chapters 1–2 against the same model; the sequence is a source inventory, not an approved lesson map.

## Source findings

- The verified private-source registry in `tasks/math-source-registry/` records two Math 10C source variants: CBE System (183 HTML entries, 799 question records) and NXT Master (119 HTML entries, 1,232 question records). These are structural counts, not approved practice questions.
- The live CBE System Math 10C course (Brightspace organization unit 6685) labels the next textbook block **Chapter 4: Roots and Powers**. Its separate Unit 2 teaching sequence lists: irrational numbers; mixed and entire radicals; four exponent-law lessons; applying exponent laws; and review. The Chapter 4 block also contains workbook, textbook, worksheet, review, and assessment groups. These two source groupings need reconciliation before authoring.
- The live NXT Math 10C Master course (organization unit 6861) also labels Chapter 4 as Roots and Powers. Its visible Chapter 4 tree has one required item and empty video, textbook, workbook, section-quiz, worksheet, and evidence-of-learning groups; its original export bytes have not been reverified during this intake. Its large registry question count must not be mistaken for a complete Chapter 4 teaching sequence. Do not treat either variant as the sole approved course.
- The previously verified, exact-byte CBE System and NXT Master ZIPs were not found in the checked local Documents/Downloads paths. Fresh exports of both source courses are now available below. They are later exports of the same Brightspace courses and therefore do not hash-match the historical registry copies. The new CBE System ZIP differs from its old registry size by only 1,860 bytes (0.000564%), while retaining the expected 183 HTML entries. The class-course export is a third, derivative source and must not be mistaken for an independent curriculum variant.

## Newly recovered source exports (2026-09-24)

All three archives pass ZIP member-integrity checks and contain a Brightspace `imsmanifest.xml`. These remain immutable external source files in Downloads. Their exact paths and hashes are recorded in `projects/resources/math10c-production/v1/source-manifest.json`; the large archives were not duplicated into the repository.

| Role | Local filename | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| CBE System re-export, course 6685 | `D2LExport_6685_CBE System Math 10C (Winter 2020)_202692410.zip` | 329,786,794 | `155309751b50720b6f1e06a749d8bfb9412ac62b40529fe2a81dba972efe0076` |
| NXT Master re-export, course 6861 | `D2LExport_6861_NXT Math 10C (Master)_202692441.zip` | 194,388,256 | `5c2f28f1c25e319b5176b35fbdaa2143f9348f01217380a9e56b66247ea49238` |
| 2026–27 Math 10C class export, course 157162 | `D2LExport_157162_26-27 _ S1 _ Mathematics 10-C _ Per 1(A) _ Sec OL0_202692413.zip` | 194,260,623 | `818fd8edd60dcd11ff4dc5c4be43c0dd56c4c8c94e301299157efa1a1439278c` |

The NXT Master and current class archives each have 2,745 ZIP members. They share 2,661 paths; 2,546 of those have matching size and CRC (242,880,619 uncompressed bytes), while 115 shared paths differ and each archive has 84 unique paths. This indicates substantial shared source material, not two independent curriculum variants. The class export has class-specific banner, outline, workbook versions and quiz IDs. Keep its student/class-specific material out of an authored master course unless classified. The separate CBE System archive has 2,735 members.

The CBE System and NXT archives share 2,034 paths, but only 1,922 have matching size and CRC. CBE contributes 701 unique paths and NXT contributes 711, confirming that they are genuinely distinct source variants. CBE includes 183 HTML files, 219 PDFs, and fuller Chapter 4 worksheet and review groups; NXT includes 119 HTML files, 148 PDFs, and separate section-quiz, practice-exam and evidence-of-learning groups.

Both Chapter 4 manifests contain six textbook sections. The textbook section PDFs begin with: 4.1 Estimating Roots, 4.2 Irrational Numbers, 4.3 Mixed and Entire Radicals, 4.4 Fractional Exponents and Radicals, 4.5 Negative Exponents and Reciprocals, and 4.6 Applying the Exponent Laws. CBE additionally exposes worksheets for exponent laws, multiplying radicals, simplifying square/cube/fourth roots and negative exponents, plus a review assignment and key. Formal exams, answer keys and EOL/submission surfaces remain restricted assessment evidence, not automatically reusable formative banks.

## Build contract before a learner candidate

1. Preserve all three new exports by their hashes above; do not claim they match the historical `tasks/math-source-registry/SOURCE_INPUTS.json` bytes. Run conversion intake/audit against CBE System and NXT Master without overwriting the originals. Treat the class export only as a current implementation comparison after removing class-specific material from consideration.
2. Reconcile Chapter 4 scope and order across the two variants. Separate formative practice from formal or restricted assessments before any question-bank extraction. Review image rights and accessibility before copying assets into learner content.
3. Obtain a teacher-reviewed target map and mathematical contracts for radicals and exponent laws: allowed forms, domains, equivalence, simplification, working, common errors, transfer, and later checks. Chapter 3 factoring checkers and saved IDs must not be reused as Chapter 4 mathematics.
4. Build one blocked Chapter 4 candidate using the Chapter 3 interface and evidence architecture where appropriate. Give its bank and state their own stable IDs and migration rules. Route clean, bounded bank/fixture work through the agent pre-edit checkpoint; keep mathematical acceptance, integration, and saving with the lead.
5. Run focused math and saved-state checks during Build. Run full learner, SCORM, Brightspace, accessibility, teacher, and delayed-evidence checks at the Chapter 4 rollout checkpoint.

## Completed preflight outputs

- `projects/resources/math10c-production/v1/source-manifest.json`: exact external source paths, hashes, sizes and roles.
- `projects/resources/math10c-production/v1/chapter4/production-contract.json`: reconciled eight-lesson sequence and 32-target contract.
- `projects/resources/math10c-production/v1/chapter4/assessment-disposition.json`: formative, restricted and external assessment categories.
- `projects/math10c-unit4-pilot/meta/source-map.json`: source inclusion and exclusion decisions for the blocked learner build.
- `projects/math10c-unit4-pilot/workspace/`: canonical instructional review build with working navigation and reference sheet.

The review build is a truthful checkpoint rather than a simulated finished course. Practice and review pages describe the intended evidence rules but expose no response controls until the Chapter 4 checker, state and save-admission contracts exist.

## Chapter 3 gate before scale

Chapter 3's corrected review package passed 91 focused Math tests, 34 chapter browser checks, 32 SCORM source checks, nine generic tracking-browser checks, local package integrity, and a bounded live tracked-student Brightspace draft/evidence save-resume scenario on 2026-09-24. Teacher review of alternate methods, accessibility, and actual delayed learner evidence remain pending. These gates constrain claims of a reusable, released template; they do not prevent source intake for Chapter 4.
