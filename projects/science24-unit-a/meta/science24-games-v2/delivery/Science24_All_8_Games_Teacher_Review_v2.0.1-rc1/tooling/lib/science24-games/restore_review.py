"""Restore a delivered audit candidate into a NEW reproducible standalone checkout."""
import json,pathlib,shutil,sys
pack=pathlib.Path(__file__).resolve().parents[3]
target=pathlib.Path(sys.argv[1]).resolve()
if target.exists() and any(target.iterdir()):raise SystemExit('Refusing to overwrite a nonempty destination.')
target.mkdir(parents=True,exist_ok=True)
suite=json.loads((pack/'audit-records/suite.json').read_text())
def copy(src,rel):
 dst=target/rel;dst.parent.mkdir(parents=True,exist_ok=True)
 if src.is_dir():shutil.copytree(src,dst)
 else:shutil.copyfile(src,dst)
for g in suite['games']:
 copy(pack/'sources'/g['id'],g['canonical'])
 if g['id']!='A1':copy(pack/'references'/g['id'],g['reference'])
copy(pack/'tooling','scripts')
copy(pack/'audit-records','projects/science24-unit-a/meta/science24-games-v2')
prior='projects/science24-unit-a/meta/reaction-detective-review-2026-10-07/'
copy(pack/'validation/A1-matching-prior-evidence.json',prior+'independent-validation.json')
copy(pack/'audit-records/A1_teacher_guide.txt',prior+'Teacher_Answer_Guide_and_Text_Form.txt')
copy(pack/'games/A1/PLAY.html','projects/resources/science24-unit-a/reaction-detective-v1.2.0/PLAY.html')
copy(pack/'SUPPLIED_CROSSWALK_REFERENCE.md','projects/resources/science24-games-v2/handoff/00_SHARED/ALBERTA_SCIENCE24_OUTCOMES_MATRIX.md')
(target/'package.json').write_text(json.dumps({'name':'science24-review-reproducer','private':True,'type':'module','scripts':{'test:science24-games':'node scripts/test-science24-games.mjs','package:science24-games-review':'node scripts/package-science24-games-review.mjs'},'dependencies':{'esbuild':'0.27.3'}},indent=2)+'\n')
print('Restored candidate sources and deterministic tooling:',target)
print('Install dependencies and run the commands documented in REPRODUCE.txt. No existing project was overwritten.')
