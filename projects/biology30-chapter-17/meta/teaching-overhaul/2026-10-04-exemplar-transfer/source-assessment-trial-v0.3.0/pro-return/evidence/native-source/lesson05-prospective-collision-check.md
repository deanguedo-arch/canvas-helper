# Prospective lesson05 candidate collision support

Source: `baseline/native-v020/index.html`, SHA256 `bc42ea52d8cf5709c0ec33c914e86450f93971f3e3144cb81b695593aa0eff3b`. The extracted global required bank matches embedded `course-data.checks` exactly. All64 required prompts/models were checked. No source, learner or prior-return file was modified.

| Candidate | Exact whole-demand collision | Closest exposed reasoning |
|---|---|---|
| MC2: at least one recessive phenotype, doublehet×doublehet →7/16 | Not found | One complement or sum from the solved9:3:3:1 table and both L05 video fallbacks. Lesson03 explicitly names the mathematically isomorphic “at least one recessive among two” event, but does not solve it. |
| Writing2: both dominant9/16 versus homozygous at both1/4 | Not found as a complete comparison | The9/16 component is directly solved in teaching/videos; all four double-homozygote cells appear with their weights in the16-cell grid. Selecting/grouping those four as homozygous at both is new. |

The candidate arithmetic is correct. For MC2,7/16=1−9/16=3/16+3/16+1/16; simple addition1/4+1/4 double-counts the double-recessive outcome. For writing2, the qualifying genotypes are CCHH,CChh,ccHH,cchh, each1/16; their total is1/4. Both homozygous includes dominant and recessive homozygotes, not only CCHH.

Exact nearest source identifiers:

- `ch17-l05-teaching-02`: full F2 genotype table, phenotype grouping table, multiplication paragraph and addition paragraph. Companion JSON includes exact UTF-8 byte ranges for both tables and the addition paragraph.
- `course-data.videos[3].fallback`, ID`fe5kSSs83qc`, and `[4].fallback`, ID`qIGXTJLrLf8`: explicitly solve both-dominant9/16 and state3/16,3/16,1/16. These are inspected fallback text; no playback claim.
- `ch17-source-OBJ_2131227`, `course-data.practiceQuestions[3]`:9:3:3:1 ratio with all four probabilities in feedback.
- `ch17-source-OBJ_2131237`, `course-data.practiceQuestions[13]`: A_bb in doublehet×doublehet →3/16.
- `ch17-l05-check-mc-2`, `GLOBAL_REQUIRED_BANK.json[4].mc[1]`: aaB_ →3/16.
- `ch17-final-mc-2`, `GLOBAL_REQUIRED_BANK.json[14].mc[1]`: aabb →1/16.
- `ch17-l03-teaching-03`: ordered successive aa/aa event solved1/16, with “at least one recessive among two” named as a different event; no7/16 answer supplied. This is a genuine near-isomorphic probability cue even though loci and offspring differ.
- `ch17-l01-check-writing-1`, `GLOBAL_REQUIRED_BANK.json[0].writing[0]`: one dominant phenotype can represent BB or Bb; prerequisite conceptual overlap.
- `ch17-word-homozygous`, `course-data.words[13]`: identical allele pair, including either AA or aa.
- `ch17-p598-section-17-1-q6`, `textbook-practice-data.questions[38]`, printed598/PDF15: requests all F2 genotypes, phenotypes and ratios. No solved key is embedded in that record.
- `ch17-p598-section-17-1-q7`, `textbook-practice-data.questions[39]`, printed598/PDF15: four phenotype counts from double heterozygotes among256 offspring; no candidate aggregate/comparison and no embedded solved key.

These findings support “no exact complete duplicate found,” not “no exposure to the component answers.” New-letter substitution does not change the exposed9/16 calculation; the assessment's additional work lies in selecting/combining the event categories and distinguishing genotype from phenotype.
