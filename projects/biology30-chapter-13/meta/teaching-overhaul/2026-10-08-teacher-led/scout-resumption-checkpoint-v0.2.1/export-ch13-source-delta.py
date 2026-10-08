from pathlib import Path
import json,re,hashlib,shutil,zipfile,datetime
from ch13_bounded_build import bounds,sha
ROOT=Path(__file__).resolve().parent
SOURCE=Path('/Users/deanguedo/Documents/GitHub/canvas-helper/projects/biology30-chapter-13/meta/teaching-overhaul/2026-10-08-teacher-led/batch-01-03-v0.1.0/source-handoff')
CAND=ROOT/'comparison/ch13-teacher-pass-v0.2.1'
OUT=ROOT/'deliverables/CH13_Teacher_Source_Delta_and_Ownership_v0.2.1'
assert not OUT.exists();OUT.mkdir(parents=True)
for folder in ['sources/slide-media','sources/slide-xml','current','contracts','review','integration-deltas']:(OUT/folder).mkdir(parents=True,exist_ok=True)
deck=SOURCE/'sources/teacher-chapter-13.pptx'
assert sha(deck.read_bytes())=='05947fe3a4712c7465e9bb370acbeef6897651eae7cac40c2af54d4839bcc482'
shutil.copy2(deck,OUT/'sources/teacher-chapter-13.pptx')
with zipfile.ZipFile(deck) as z:
 for n in range(14,44):
  for member in [f'ppt/slides/slide{n}.xml',f'ppt/slides/_rels/slide{n}.xml.rels']:
   if member in z.namelist():(OUT/'sources/slide-xml'/Path(member).name).write_bytes(z.read(member))
for p in (ROOT/'evidence/ch13/remaining-source').glob('slide-*-image*'):shutil.copy2(p,OUT/'sources/slide-media'/p.name)
shutil.copy2(ROOT/'evidence/ch13/remaining-source/TEACHER_FULL_XML_EXTRACTION.json',OUT/'sources/TEACHER_FULL_XML_EXTRACTION.json')
shutil.copy2(ROOT/'evidence/ch13/remaining-source/lesson04-05-source-contact.png',OUT/'sources/slide14-19-and24-contact.png')
shutil.copy2(ROOT/'evidence/ch13/remaining-source/slide-16-image16.png',OUT/'sources/SLIDE16_COMPLETE_DIAGRAM.png')
t=(CAND/'new/index.html').read_text();owner=(CAND/'old/index.html').read_text(); rows=[]
for n in range(4,14):
 ident=f'lesson-{n:02}';a,b=bounds(t,ident); route=t[a:b];oa,ob=bounds(owner,ident);oldroute=owner[oa:ob]
 (OUT/f'current/{ident}.html').write_text(route)
 ids=re.findall(r'id="(ch13-l\d\d-(?:teaching-\d\d|worked))"',route);blocks=[]
 for id in ids:
  x,y=bounds(route,id);frag=route[x:y];blocks.append({'id':id,'sha256':sha(frag.encode()),'exactOpeningTag':re.match('<[^>]+>',frag)[0],'figuresSha256':[sha(f.encode()) for f in re.findall(r'<figure\b[\s\S]*?</figure>',frag)]})
 rows.append({'lessonId':ident,'candidateRouteSha256':sha(route.encode()),'canonicalRouteSha256':sha(oldroute.encode()),'ownership':'assembled locally; author review complete; independent learner review pending' if n in [4,5] else 'unclaimed; direct content worker may author from06 onward','blocks':blocks,'protectedPolicy':'Only named teaching/worked blocks may change. All guided/stop/advanced questions, required check, models, options, writing/response controls, timers, navigation and runtime remain exact. Original figures remain exact; reviewed companion captions/alt remain exact.'})
for name in ['NATIVE_DATA.json','VOCABULARY_IDS.json','SOURCE_PROTECTION.json']:shutil.copy2(SOURCE/'contracts'/name,OUT/'contracts'/name)
(OUT/'contracts/CURRENT_BOUNDARIES04_13.json').write_text(json.dumps({'candidateSha256':sha(t.encode()),'canonicalSha256':sha(owner.encode()),'routes':rows},ensure_ascii=False,indent=2)+'\n')
for name in ['RESUMPTION_RECEIPT.json','LESSONS04_05_RECEIPT.json']:shutil.copy2(CAND/name,OUT/'integration-deltas'/name)
for name in ['lesson-04.fragment.html','lesson-05.fragment.html']:shutil.copy2(CAND/name,OUT/'integration-deltas'/name)
for p in (ROOT/'blind-review/ch13-04-05-v0.2.1').glob('*.txt'):shutil.copy2(p,OUT/'review'/p.name)
for p in (ROOT/'resume-incoming/images-package').glob('*Handoff.txt'):shutil.copy2(p,OUT/'review'/p.name)
for name in ['RESUMPTION_CHECKPOINT.md','COMPLETION_MATRIX.json']:shutil.copy2(ROOT/name,OUT/name)
text='''# Chapter13 missing teacher sources and current ownership — v0.2.1

This private delta supplies the actual teacher PPTX missing from the previous Library review ZIP. The previous ZIP already contains the chapter textbook and assembled course, so they are not duplicated here. Teacher source SHA256 is verified against the local supplied source. The PPTX contains the whole deck; native XML, relationships and actual embedded images14–43 are also supplied for readable bounded work. Slide16's complete image is explicitly exported: it is not an empty text slide, and no table content has been inferred from a partial extract.

Ownership: lessons04–05 were already locally authored and assembled before the direct-authoring split. Do not duplicate those drafts. Their protected native tasks and source figures are unchanged, two worked examples each added, and lesson04 reader shortcut corrected to444. Independent learner review is still pending; blind packets with assessment models/criteria withheld are in review/. Lesson06 is the exact next unclaimed lesson; the direct content worker may claim06–13. Local integration lead will not continue authoring that boundary. An unfinished06–08 script exists locally but is not an assembled candidate or claimed boundary; it is excluded from this source packet.

Current native lesson fragments04–13 in current/ include full learner prompts, protected tasks and existing figures. They are source fragments, not standalone runnable courses. Use contracts/CURRENT_BOUNDARIES04_13.json for exact current candidate hashes, outer tags and figure hashes. Only the named teaching/worked blocks may be replaced. Preserve canonical IDs, original source figures, all assessment/guided/stop/advanced tasks, model answers, runtime and persistence. Keep reviewed companion captions/alt exactly as supplied. No generic course import or runtime authoring.

Current candidate v0.2.1 SHA256: 15df5967cc8fe94173c1d5a69ed485f28d52fcdbd292c9b1df62145b9264f9bc. Canonical owner SHA256 remains341c2f943c4178bc2abf3d56290f0d8f2cb31e6b78b2b89b187694385ebc62e6; canonical integration/teacher acceptance is false. Newest assembled course is local comparison/ch13-teacher-pass-v0.2.1. Previous Library assembled-course identity: libfile_b3197b67a984819194d412049cde7d48. Integration deltas here are authoritative for newer04–05 work.

Five companion PNGs already supplied separately in libfile_d701855bc414819192288b39a92032f0; their bytes are not duplicated here. Exact captions/alt are supplied in review/, and current lesson fragments refer to assets/teaching-review/. Protocol identity libfile_2da21193976c8191b3d2e3b4b9f668b7 remains the learner-review guide. Lesson02 reading clarification is already implemented and desktop route/visible-text verified. All five companion dialogs desktop verified; mobile/print/Studio/LMS remain unverified.

Source review completed locally for04–05: textbook444–447 text/render, actual teacher slides14–19 plus24 text/media including16. Preliminary06–08 source inspection: textbook441–450 and teacher20–31 text/media, protected native tasks; no new assembled teaching. Known source cautions: ADH deficiency vs kidney resistance; do not assert universal ADH treatment or caffeine inhibition of ADH production. Thyroid failure must be distinguished from pituitary failure; do not assume every low thyroid level has high TSH. T4 contains iodine atoms, not molecules. PTH's intestinal effect is indirect through active vitamin D, calcitonin has smaller adult-human role, and the pathways are not identical mirror images. Later teacher source slides require full review before authoring: ACTH/aldosterone grouping, inflammation/cortisol statement, diabetes tissue/ketone/type simplifications must be checked rather than copied blindly.

Supplementary sources actually read for the06–08 preflight: https://www.niddk.nih.gov/health-information/kidney-disease/diabetes-insipidus and https://www.thyroid.org/thyroid-function-tests/. The NCBI pages attempted in this resumption returned browser checks, so their inaccessible contents are not new evidence.

Chapter17 acceptance conflict corrected by parent direct-source inspection: exact-copy acceptance only06–07;02/05 method references;01/03/04 and08–15+extension acceptance pending. Earlier inherited01–07 signed-off claim is superseded. Preserve the teaching benchmark without claiming whole-chapter acceptance.

Return one bounded lesson or small approved batch with exact-tag HTML fragments, full manuscript, source/practice map, scientific cautions and learner-review findings. No authoring using missing sources or hidden answer rationale as proof of learner readiness. No new ChatGPT browser generation/polling. Model/effort unchanged Sol/High.
'''
(OUT/'README.md').write_text(text)
payload=[]
for p in sorted(OUT.rglob('*')):
 if p.is_file():payload.append({'path':str(p.relative_to(OUT)),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())})
(OUT/'MANIFEST.json').write_text(json.dumps({'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'purpose':'missing actual teacher source delta and current nonoverlapping lesson boundary','files':payload},indent=2)+'\n')
zip_path=OUT.parent/(OUT.name+'.zip')
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(OUT.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(OUT))
with zipfile.ZipFile(zip_path) as z:
 assert z.testzip() is None
 for row in payload:
  b=z.read(row['path']);assert len(b)==row['bytes'] and sha(b)==row['sha256']
print(json.dumps({'file':str(zip_path),'bytes':zip_path.stat().st_size,'sha256':sha(zip_path.read_bytes()),'payloadFilesVerified':len(payload)},indent=2))
