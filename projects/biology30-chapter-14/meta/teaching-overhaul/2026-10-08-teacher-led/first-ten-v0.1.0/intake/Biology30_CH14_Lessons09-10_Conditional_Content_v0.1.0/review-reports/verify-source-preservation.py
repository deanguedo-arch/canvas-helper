from pathlib import Path
import json,hashlib,zipfile,copy,datetime,re
from lxml import html,etree
import fitz
from PIL import Image
R=Path('/workspace/shared/ch14_0910'); O=Path('/workspace/scratch/6f97d4e841e3/biology-image-source-review/ch14/chapter-14'); Z=Path('/workspace/scratch/6f97d4e841e3/biology-image-source-review/BIOLOGY 30 COURSE CREATION/Biology30_Chapter14_Exact_Template_Handoff.zip')
H=lambda b:hashlib.sha256(b).hexdigest()
F=lambda p:{'path':str(p),'bytes':p.stat().st_size,'sha256':H(p.read_bytes())}
report={'created_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Independent read-only historical-source, candidate DOM and static packet audit; no native runtime or current-owner test.'}
report['archive']=F(Z)
with zipfile.ZipFile(Z) as z:
 report['archive']['crc_first_bad_member']=z.testzip(); report['archive']['entries']=len(z.infolist())
checks=[]
for line in (O/'SHA256SUMS.txt').read_text().splitlines():
 sha,name=line.split(None,1);name=name.lstrip('*');p=O/name
 checks.append({'path':name,'expected':sha,'actual':H(p.read_bytes()) if p.exists() else None,'pass':p.exists() and H(p.read_bytes())==sha})
report['original_manifest']={'entries':len(checks),'passed':sum(x['pass'] for x in checks),'failed':[x for x in checks if not x['pass']],'files':checks}
report['frozen_files']=[]
for p in sorted((R/'frozen').rglob('*')):
 if p.is_file():
  rel=p.relative_to(R/'frozen');old=O/rel
  report['frozen_files'].append({**F(p),'original_path':str(old) if old.exists() else None,'matches_original':p.read_bytes()==old.read_bytes() if old.exists() else None})
report['standard']=F(R/'frozen/Course_Production_Standards_v0.4.txt');report['standard']['expected_match']=report['standard']['bytes']==65442 and report['standard']['sha256']=='db8a04bcd7620d9ecf64ec6dc86c046cb3075b9b09cc51dac41936c391379e1e'
report['asset_parity']=[]
for p in (R/'assets').iterdir():
 matches=[x for x in O.rglob(p.name) if x.is_file()]
 report['asset_parity'].append({**F(p),'original_matches':[{'path':str(x),'equal':x.read_bytes()==p.read_bytes(),'sha256':H(x.read_bytes())} for x in matches]})
# Compare parsed element trees, preserving text exactly. Only documented candidate static disabled attrs and the five declared replacement contents are normalized.
def signature(e):
 return [e.tag,sorted((k, '' if k in ['hidden','disabled','checked','selected','multiple','readonly','required','open'] else v) for k,v in e.attrib.items()),e.text,[[signature(x),x.tail] for x in e]]
def norm(e,candidate=False,replace=False):
 e=copy.deepcopy(e)
 if e.get('class')=='course-page': e.attrib.pop('hidden',None)
 if candidate:
  for x in e.iter():
   if x.tag in ['button','input','select','textarea']:x.attrib.pop('disabled',None)
 if replace:
  for i in [f'ch14-l{n:02}-teaching-{k:02}' for k in range(1,5)]+[f'ch14-l{n:02}-worked']:
   x=e.xpath(f'.//*[@id="{i}"]')[0]
   for c in list(x): x.remove(c)
   x.text='REPLACEMENT'
 return e
workspace=html.fromstring((O/'workspace/index.html').read_text())
report['dom_normalizations']=['HTML boolean attribute serialization is canonicalized to presence, preserving true/false semantics.','Only the root lesson section hidden attribute is removed for standalone reading visibility.','Candidate-added disabled attributes are removed only from button/input/select/textarea; original fieldset-disabled gating is retained.','Only child contents/text of the four teaching nodes and one worked node are replaced by a common sentinel; their original attributes remain compared.','DOM equality ignores source formatting and attribute order through parsing, but text nodes and tails are compared exactly.']
report['dom']=[]
for n in [9,10]:
 old=workspace.xpath(f'.//*[@id="lesson-{n:02}"]')[0]
 supplied=html.fromstring((R/f'source-read/original-lesson-{n:02}.html').read_text())
 candidate_doc=html.fromstring((R/f'candidate/lesson-{n:02}.reading.html').read_text());cand=candidate_doc.xpath(f'.//*[@id="lesson-{n:02}"]')[0]
 oldsig=signature(norm(old,replace=True));candsig=signature(norm(cand,candidate=True,replace=True))
 ids=lambda x:[a for a in x.xpath('.//@id')]
 terms=lambda x:sorted(set(x.xpath('.//@data-term-id')))
 targets=[]
 for id in [f'ch14-l{n:02}-teaching-{k:02}' for k in range(1,5)]+[f'ch14-l{n:02}-worked']:
  a=old.xpath(f'.//*[@id="{id}"]')[0];b=cand.xpath(f'.//*[@id="{id}"]')[0]
  targets.append({'id':id,'original_attrs':dict(a.attrib),'candidate_attrs':dict(b.attrib),'attributes_equal':dict(a.attrib)==dict(b.attrib),'content_changed':signature(a)!=signature(norm(b,candidate=True))})
 fragments=html.fragment_fromstring((R/f'candidate/lesson-{n:02}.teaching-fragments.html').read_text(),create_parent='div')
 frag_checks=[]
 for t in targets:
  ff=fragments.xpath(f'.//*[@id="{t["id"]}"]');cc=cand.xpath(f'.//*[@id="{t["id"]}"]')
  # fragment asset URL normalization only (portable candidate reading uses ../assets)
  if ff:
   f=copy.deepcopy(ff[0]);c=norm(cc[0],candidate=True)
   for x in f.xpath('.//img[@src]'):x.attrib['src']='../assets/'+Path(x.attrib['src']).name
   frag_checks.append({'id':t['id'],'fragment_matches_candidate_content':signature(f)==signature(c)})
 rec={'lesson':n,'original_export_matches_workspace':signature(old)==signature(supplied),'outside_five_replacement_nodes_equal':oldsig==candsig,'original_ids':len(ids(old)),'candidate_ids':len(ids(cand)),'missing_original_ids':sorted(set(ids(old))-set(ids(cand))),'duplicate_candidate_ids':sorted({x for x in ids(cand) if ids(cand).count(x)>1}),'original_terms':terms(old),'missing_original_vocabulary_bindings':sorted(set(terms(old))-set(terms(cand))),'targets':targets,'fragment_parity':frag_checks,'normalized_original_sha256':H(json.dumps(oldsig,ensure_ascii=False).encode()),'normalized_candidate_sha256':H(json.dumps(candsig,ensure_ascii=False).encode())}
 if oldsig!=candsig:
  (R/f'review-reports/dom-{n}-original.json').write_text(json.dumps(oldsig,indent=2,ensure_ascii=False));(R/f'review-reports/dom-{n}-candidate.json').write_text(json.dumps(candsig,indent=2,ensure_ascii=False))
 report['dom'].append(rec)
report['source_record_exports']=[]
for name in ['generated-practice-items.json','imported-practice.json','optional-source-responses.json','lesson-source-map.json']:
 orig=json.loads((O/'authoring'/name).read_text());orig=[x for x in orig if x.get('lesson') in [9,10]];export=json.loads((R/'source-read'/name).read_text())
 report['source_record_exports'].append({'file':name,'records':len(export),'exact_json_equal_to_filtered_original':orig==export,'export_sha256':H((R/'source-read'/name).read_bytes())})
pdf=O/'workspace/assets/textbook/chapter-14.pdf';deck=O/'authoring/source-inputs/Unit B Chapter 14 Notes.pptx';deckpdf=Path('/workspace/shared/ch14_authoring/source-read/Unit B Chapter 14 Notes.pdf')
report['source_documents']=[F(pdf),F(deck),F(deckpdf)]
report['source_render_identity']=[]
for file,indices,prefix in [(pdf,[486,487,488,489,490,491,495,498,499,502,504,505],'p'),(deckpdf,[3,19,20,34,35],'slide')]:
 d=fitz.open(file)
 for number in indices:
  idx=number-476 if prefix=='p' else number-1;page=d[idx];pix=page.get_pixmap(matrix=fitz.Matrix(1.5,1.5));saved=R/f'source-read/{prefix}{number}.png';im=Image.open(saved).convert('RGB')
  report['source_render_identity'].append({'kind':prefix,'printed_page_or_slide':number,'source_page_index':idx,'source_render_dimensions':[pix.width,pix.height],'saved_dimensions':list(im.size),'exact_rgb_pixels_equal':im.size==(pix.width,pix.height) and im.tobytes()==pix.samples,'saved':F(saved),'text_sha256':H(page.get_text().encode())})
 d.close()
with zipfile.ZipFile(deck) as z:
 report['pptx_slide_text']=[]
 for n in [3,19,20,34,35]:
  tree=etree.fromstring(z.read(f'ppt/slides/slide{n}.xml'));txt=' '.join(tree.xpath('//*[local-name()="t"]/text()'))
  report['pptx_slide_text'].append({'slide':n,'text':txt,'xml_sha256':H(z.read(f'ppt/slides/slide{n}.xml'))})
report['candidate_and_review_receipts']=[F(p) for folder in ['candidate','review-blind-final','review-rendered-final','review-feedback'] for p in sorted((R/folder).iterdir()) if p.is_file()]
report['summary']={'all_original_hashes_match':all(x['pass'] for x in checks),'archive_crc_ok':report['archive']['crc_first_bad_member'] is None,'all_dom_preserved_outside_declared_targets':all(x['outside_five_replacement_nodes_equal'] for x in report['dom']),'all_exports_match':all(x['exact_json_equal_to_filtered_original'] for x in report['source_record_exports']),'all_source_render_pixels_match':all(x['exact_rgb_pixels_equal'] for x in report['source_render_identity'])}
# Supplementary artifact identity and linked textbook resource records.
report['static_render_identity']=[]
for name in ['lesson-09','lesson-10','generated-09-10']:
 d=fitz.open(R/f'review-rendered-final/{name}.pdf');prefix='generated' if name.startswith('generated') else name
 for i,page in enumerate(d):
  p=R/f'review-rendered-final/{prefix}-page-{i+1:02}.png';im=Image.open(p).convert('RGB');pix=page.get_pixmap(matrix=fitz.Matrix(1.35,1.35))
  report['static_render_identity'].append({'pdf':name+'.pdf','page':i+1,'png':p.name,'dimensions':list(im.size),'fresh_dimensions':[pix.width,pix.height],'matches_fresh_pdf_pixels':im.size==(pix.width,pix.height) and im.tobytes()==pix.samples})
 d.close()
sourcecopy=json.loads((R/'teaching-copy.json').read_text());report['manuscript_structured_copy_parity']=[]
for route,data in sourcecopy.items():
 manuscript=(R/f'candidate/{route}.teaching-manuscript.txt').read_text();tree=html.fromstring((R/f'candidate/{route}.reading.html').read_text());text=' '.join(tree.text_content().split());strings=[]
 for section in data['sections']:strings += [section['title']]+section['paragraphs']
 strings += [data['worked']['title'],data['worked']['scenario']]+data['worked']['steps']+list(data['optional'].values());strings=[x for x in strings if isinstance(x,str)]
 report['manuscript_structured_copy_parity'].append({'route':route,'authored_string_count':len(strings),'all_strings_in_manuscript':all(x in manuscript for x in strings),'all_strings_in_reading_text':all(' '.join(x.split()) in text for x in strings)})
ids={q for lesson in json.loads((O/'authoring/lesson-source-map.json').read_text()) if lesson['lesson'] in [9,10] for q in lesson['optionalTextbookIds']}
report['textbook_question_records']=[x for x in json.loads((O/'authoring/compiled-textbook-data.json').read_text())['questions'] if x['id'] in ids]
report['raw_source_catalogue_records']=[x for x in json.loads((O/'authoring/source-assessment-catalogue.json').read_text()) if x['id'] in ['OBJ_2131525','OBJ_2131570','OBJ_2131114','OBJ_2131183']]
report['summary']['all_static_render_pixels_match']=all(x['matches_fresh_pdf_pixels'] for x in report['static_render_identity'])
report['summary']['all_manuscript_strings_match']=all(x['all_strings_in_manuscript'] and x['all_strings_in_reading_text'] for x in report['manuscript_structured_copy_parity'])

(R/'review-reports/source-preservation-receipts.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print(json.dumps(report['summary'],indent=2));print('DOM summary',[(x['lesson'],x['original_export_matches_workspace'],x['missing_original_ids'],x['duplicate_candidate_ids'],x['fragment_parity']) for x in report['dom']]);print('render',[(x['kind'],x['printed_page_or_slide'],x['exact_rgb_pixels_equal']) for x in report['source_render_identity']])
