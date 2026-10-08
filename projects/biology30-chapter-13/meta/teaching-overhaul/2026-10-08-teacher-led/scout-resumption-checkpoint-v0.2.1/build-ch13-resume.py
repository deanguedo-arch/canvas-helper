from pathlib import Path
import re,json,hashlib,shutil,html
ROOT=Path(__file__).resolve().parent
BEFORE=ROOT/'comparison/ch13-batch01-03-v0.1.3'
OUT=ROOT/'comparison/ch13-teacher-pass-v0.2.0'
PKG=ROOT/'resume-incoming/images-package'
sha=lambda data:hashlib.sha256(data).hexdigest()
assert not OUT.exists()
shutil.copytree(BEFORE,OUT,symlinks=True)
t=(OUT/'new/index.html').read_text(); before=t
old_owner=(OUT/'old/index.html').read_bytes()
assert sha(old_owner)=='341c2f943c4178bc2abf3d56290f0d8f2cb31e6b78b2b89b187694385ebc62e6'
rows=[]
for file in PKG.glob('*Handoff.txt'):
 text=file.read_text()
 # Captions and accessible alternatives are copied verbatim from the reviewed handoffs.
 for m in re.finditer(r'Image: ([^\n]+)\n(?:Teaching purpose: [^\n]+\n)?Caption: ([^\n]+)\nAlt text: ([^\n]+)',text):
  name,caption,alt=m.groups(); n=int(re.search(r'_L(\d+)_',name)[1]); asset=PKG/name
  ident=f'ch13-reviewed-l{n:02}'
  title={5:'Growth plates change the response to excess hGH',6:'ADH changes water reabsorption',7:'Thyroid-hormone negative feedback',8:'Three routes that raise blood calcium',12:'The liver stores and releases glucose'}[n]
  start=t.index(f'<section class="course-page" id="lesson-{n:02}"'); end=t.index(f'<section class="course-page" id="lesson-{n+1:02}"',start)
  section=t[start:end]; figure=re.search(r'<figure\b[\s\S]*?</figure>',section).group()
  new=f'<figure class="science-figure" data-figure-id="{ident}" data-canvas-helper-edit-key="{ident}"><div class="figure-toolbar"><strong>{html.escape(title)}</strong><button type="button" class="text-link" data-enlarge-figure="{ident}">View larger</button></div><img loading="lazy" decoding="async" src="assets/teaching-review/{name}" width="1536" height="1024" alt="{html.escape(alt,quote=True)}"><figcaption>{html.escape(caption)}</figcaption></figure>'
  assert section.count(figure)==1; section=section.replace(figure,figure+new,1); t=t[:start]+section+t[end:]
  shutil.copy2(asset,OUT/'new/assets/teaching-review'/name)
  rows.append({'lessonId':f'lesson-{n:02}','asset':name,'sha256':sha(asset.read_bytes()),'caption':caption,'alt':alt,'originalFigurePreserved':True})
assert sorted(r['lessonId'] for r in rows)==['lesson-05','lesson-06','lesson-07','lesson-08','lesson-12']
clarification='Reading clarification: p. 440 groups thyroxine with water-soluble hormones. For this lesson’s signalling comparison, do not treat thyroxine as a typical water-soluble hormone acting through a surface receptor. Thyroid hormones are made from tyrosine, but are lipophilic (lipid-soluble) and act mainly through receptors inside cells. Specific transport proteins help them enter cells; do not extend the steroid diagram’s simple-diffusion route to thyroid hormones. Use epinephrine for this lesson’s typical surface-receptor example and cortisol for its steroid example.'
needle='This is enough of the exception to understand receptor location; thyroid regulation itself comes later.</p>'
assert t.count(needle)==1
t=t.replace(needle,needle+'\n<p id="ch13-thyroid-reading-clarification" data-canvas-helper-edit-key="ch13-thyroid-reading-clarification"><strong>Reading clarification.</strong> '+html.escape(clarification.removeprefix('Reading clarification: '))+'</p>',1)
start=t.index('<section class="course-page" id="lesson-02"'); end=t.index('<section class="course-page" id="lesson-03"',start)
section=t[start:end]
needle='<p class="terms-line lesson-term-strip">'
assert section.count(needle)==1
section=section.replace(needle,'<p class="reading-note"><a href="#ch13-thyroid-reading-clarification">Reading clarification for p. 440: thyroxine does not use the typical surface-receptor route.</a></p>'+needle,1)
t=t[:start]+section+t[end:]
(OUT/'new/index.html').write_text(t)
receipt={'schemaVersion':1,'canonicalIntegrated':False,'teacherAccepted':False,'sourceCandidateSha256':sha(before.encode()),'candidateSha256':sha(t.encode()),'originalCanonicalSha256':sha(old_owner),'imagePackageLibraryId':'libfile_d701855bc414819192288b39a92032f0','imagePackageSha256':sha((ROOT/'resume-incoming/Biology30_CH13_Five_Reviewed_Teaching_Images_v1.zip').read_bytes()),'protocolLibraryId':'libfile_2da21193976c8191b3d2e3b4b9f668b7','protocolSha256':sha((ROOT/'resume-incoming/Learner_Production_Review_Protocol.txt').read_bytes()),'imageIntegrations':sorted(rows,key=lambda r:r['lessonId']),'readingClarification':'lesson02 local teaching paragraph and link adjacent to optional reading; original textbook/protected assessment unchanged','browserVerified':False,'instructionalReview04to13Complete':False}
(OUT/'RESUMPTION_RECEIPT.json').write_text(json.dumps(receipt,indent=2,ensure_ascii=False)+'\n')
# Guard all original figures except the explicitly authorized v0.1.3 lesson02 replacement.
assert all(f in t for f in re.findall(r'<figure\b[\s\S]*?</figure>',before))
# New content has no assessment/form controls or script handlers.
assert re.findall(r'<(?:input|textarea|select|script)\b[^>]*>',before)==re.findall(r'<(?:input|textarea|select|script)\b[^>]*>',t)
assert re.findall(r'data-(?:question-id|response-id|check-id)="[^"]+"',before)==re.findall(r'data-(?:question-id|response-id|check-id)="[^"]+"',t)
print('Five exact-caption companions integrated; lesson02 reading clarification inserted; original figures/control tags preserved.')
