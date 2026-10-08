from pathlib import Path
import json,hashlib,zipfile,copy,datetime,re
from lxml import html,etree
import fitz
from PIL import Image
R=Path('/workspace/shared/ch14_11_extension');O=Path('/workspace/scratch/6f97d4e841e3/biology-image-source-review/ch14/chapter-14');Z=O.parents[1]/'BIOLOGY 30 COURSE CREATION/Biology30_Chapter14_Exact_Template_Handoff.zip'
H=lambda b:hashlib.sha256(b).hexdigest()
F=lambda p:{'path':str(p),'bytes':p.stat().st_size,'sha256':H(p.read_bytes())}
report={'created_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Independent historical-source, four-target DOM, assessment and static export preservation; no owner integration or native runtime.'}
report['archive']=F(Z)
with zipfile.ZipFile(Z) as z:report['archive'].update(crc_first_bad_member=z.testzip(),entries=len(z.infolist()))
checks=[]
for line in (O/'SHA256SUMS.txt').read_text().splitlines():
 sha,name=line.split(None,1);name=name.lstrip('*');p=O/name;actual=H(p.read_bytes()) if p.exists() else None
 checks.append({'path':name,'expected':sha,'actual':actual,'pass':sha==actual})
report['historical_manifest']={'entries':len(checks),'passed':sum(x['pass'] for x in checks),'failed':[x for x in checks if not x['pass']],'files':checks}
M=json.loads((R/'PRESERVATION_MANIFEST.json').read_text())
report['owner_freezes']=[{'relative_path':p,'expected':h,'frozen':F(R/'frozen'/p),'original':F(O/p),'all_equal':h==H((R/'frozen'/p).read_bytes())==H((O/p).read_bytes())} for p,h in M['base_files'].items()]
report['standard']=F(R/'frozen/Course_Production_Standards_v0.4.txt');report['standard']['matches_frozen_contract']=report['standard']['bytes']==65442 and report['standard']['sha256']=='db8a04bcd7620d9ecf64ec6dc86c046cb3075b9b09cc51dac41936c391379e1e'
BR=Path('/workspace/scratch/6f97d4e841e3/standards-v01-sources/ch17-benchmark')
report['reference_hashes']=[{'relative_path':p,'expected':h,'actual':H((BR/p).read_bytes()) if (BR/p).exists() else None,'match':(BR/p).exists() and H((BR/p).read_bytes())==h} for p,h in M['reference_files'].items()]
def sig(e):return [e.tag,sorted((k,'' if k in ['hidden','disabled','checked','selected','multiple','readonly','required','open'] else v) for k,v in e.attrib.items()),e.text,[[sig(x),x.tail]for x in e]]
def targets(e,route):
 if route=='lesson-11':return [e.xpath(f'.//*[@id="{i}"]')[0] for i in ['ch14-l11-teaching-01','ch14-l11-teaching-02','ch14-review-worked']]
 return [e.xpath('./div[@class="p2-topic"]/div[@class="content-section"]')[0]]
def norm(e,route,candidate=False,replace=False):
 e=copy.deepcopy(e);e.attrib.pop('hidden',None)
 if candidate:
  for x in e.iter():
   if x.tag in ['button','input','select','textarea']:x.attrib.pop('disabled',None)
 if replace:
  for x in targets(e,route):
   for c in list(x):x.remove(c)
   x.text='TEACHING_REPLACEMENT'
 return e
report['dom_normalization']=['Parse HTML and compare tag, sorted attributes, exact text and child tails. Boolean attributes canonicalized by presence.','Remove only standalone route-root hidden attribute.','Remove review-copy-added disabled attribute only from button/input/select/textarea; retain original disabled fieldset gating.','Replace only contents of three lesson-11 nodes or the first extension teaching div with a sentinel; compare target container attributes. No other content ignored.']
W=html.fromstring((O/'workspace/index.html').read_text());C=json.loads((O/'authoring/course-config.json').read_text())
report['embedded_course_data_equals_config']=json.loads(W.xpath('.//script[@id="course-data"]')[0].text)==C
report['routes']=[]
for route in ['lesson-11','extension']:
 old=W.xpath(f'.//*[@id="{route}"]')[0];sup=html.fromstring((R/'source-read'/f'original-{route}.html').read_text());doc=html.fromstring((R/'candidate'/f'{route}.reading.html').read_text());new=doc.xpath(f'.//*[@id="{route}"]')[0]
 a=sig(norm(old,route,replace=True));b=sig(norm(new,route,candidate=True,replace=True));ot=targets(old,route);nt=targets(new,route)
 fragname='lesson-11.teaching-fragments.html' if route=='lesson-11' else 'extension.teaching-fragment.html';frag=html.fragment_fromstring((R/'candidate'/fragname).read_text(),create_parent='div')
 ff=list(frag);ids=lambda x:x.xpath('.//@id');terms=lambda x:x.xpath('.//@data-term-id')
 rec={'route':route,'original_export_matches_workspace':sig(old)==sig(sup),'outside_declared_targets_equal':a==b,'normalized_original_sha256':H(json.dumps(a,ensure_ascii=False).encode()),'normalized_candidate_sha256':H(json.dumps(b,ensure_ascii=False).encode()),'original_ids':ids(old),'candidate_ids':ids(new),'ids_equal':ids(old)==ids(new),'vocabulary_bindings_equal':terms(old)==terms(new),'duplicate_candidate_ids':sorted({x for x in ids(new)if ids(new).count(x)>1}),'replacement_count':len(nt),'containers_equal':[dict(x.attrib)==dict(y.attrib)for x,y in zip(ot,nt)],'fragment_reading_parity':[sig(x)==sig(y)for x,y in zip(ff,nt)],'protected_tables_equal': [sig(x)==sig(y) for x,y in zip(old.xpath('.//table'),new.xpath('.//table'))] if route=='lesson-11' else None}
 if route=='extension':
  op=ot[0].xpath('./p');protected=[op[1],op[2]]
  rec['original_AB_paragraphs']=[{'text':''.join(x.itertext()),'exact_dom_present':any(sig(x)==sig(y) for y in nt[0].xpath('./p'))} for x in protected]
 report['routes'].append(rec)
fb=json.loads((R/'review-feedback/lesson-11.json').read_text());efb=json.loads((R/'review-feedback/extension.json').read_text());final=next(x for x in C['checks']if x['route']=='lesson-11');transfer=next(x for x in C['transferChecks']if x['route']=='lesson-11')
exold=W.xpath('.//*[@id="extension"]')[0];exmodel=exold.xpath('.//*[@data-extension-model]')[0];exq=exold.xpath('.//label[@for="ch14-optional-extension"]')[0]
report['feedback_original_parity']={'final_check':fb['check']==final,'transfer_check':fb['transfer']==[transfer],'extension_model':efb['model']==''.join(exmodel.xpath('./p')[0].itertext()),'extension_criteria':efb['criteria']==[''.join(x.itertext())for x in exmodel.xpath('./ul/li')]}
report['assessments']={'final':final,'transfer':transfer,'extension':{'id':'ch14-optional-extension','prompt':''.join(exq.itertext()),'model':efb['model'],'criteria':efb['criteria'],'limit':5000},'mc_count':len(final['mc'])+len(transfer['mc']),'writing_count':len(final['writing'])+2,'writing_criteria_count':sum(len(x['criteria'])for x in final['writing'])+len(transfer['writing']['criteria'])+len(efb['criteria'])}
clean=lambda t:' '.join(t.split())
report['static_packet']=[]
for route in ['lesson-11','extension']:
 pdf=fitz.open(R/'review-rendered-final'/f'{route}.pdf');pdftext=clean(' '.join(x.get_text()for x in pdf));blind=html.fromstring((R/'review-blind-final'/f'{route}.html').read_text());bt=clean(' '.join(blind.itertext()));cand=html.fromstring((R/'candidate'/f'{route}.reading.html').read_text());prompts=final['mc']+final['writing']+transfer['mc']+[transfer['writing']] if route=='lesson-11' else [report['assessments']['extension']]
 models=[x['model']for x in final['writing']]+[transfer['writing']['model']] if route=='lesson-11' else [efb['model']]
 pages=[]
 for i,page in enumerate(pdf):
  fn=R/'review-rendered-final'/f'{route}-page-{i+1:02d}.png';im=Image.open(fn).convert('RGB');pix=page.get_pixmap(matrix=fitz.Matrix(1.35,1.35));pages.append({**F(fn),'exact_fresh_render_pixels_equal':im.size==(pix.width,pix.height)and im.tobytes()==pix.samples})
 report['static_packet'].append({'route':route,'pdf':F(R/'review-rendered-final'/f'{route}.pdf'),'pages':pages,'tasks':[{'id':q['id'],'full_prompt_in_blind':clean(q['prompt'])in bt,'full_prompt_in_pdf':clean(q['prompt'])in pdftext,'all_options_in_blind':all(clean(v)in bt for v in q.get('options',[])),'all_options_in_pdf':all(clean(v)in pdftext for v in q.get('options',[]))}for q in prompts],'table_cells':[{'text':clean(' '.join(x.itertext())),'in_pdf':clean(' '.join(x.itertext()))in pdftext}for x in cand.xpath('//td|//th')],'models_masked_in_blind':all(clean(t)not in bt for t in models),'models_masked_in_pdf':all(clean(t)not in pdftext for t in models)})
textbook=O/'workspace/assets/textbook/chapter-14.pdf';deck=O/'authoring/source-inputs/Unit B Chapter 14 Notes.pptx';deckpdf=Path('/workspace/shared/ch14_authoring/source-read/Unit B Chapter 14 Notes.pdf');report['source_documents']=[F(p)for p in [textbook,deck,deckpdf]]
report['source_render_identity']=[]
for file,pages,base,prefix in [(textbook,[480,481,482,484,488,489,493,494,496,497,498,501,503,504,505],476,'p'),(deckpdf,[8,12,13,17,18,22,23,24,27,29,30,31,32],1,'slide')]:
 d=fitz.open(file)
 for number in pages:
  p=R/'review-reports/source-evidence'/f'{prefix}{number}.png';pix=d[number-base].get_pixmap(matrix=fitz.Matrix(1.5,1.5));im=Image.open(p).convert('RGB');report['source_render_identity'].append({'number':number,'kind':prefix,'source_page_index':number-base,'exact_rgb_pixels_equal':im.size==(pix.width,pix.height)and im.tobytes()==pix.samples,**F(p)})
report['supplied_source_render_parity']=[]
for number in [501,503,504,505]:
 a=Image.open(R/'source-read'/f'p{number}.png').convert('RGB');b=Image.open(R/'review-reports/source-evidence'/f'p{number}.png').convert('RGB');report['supplied_source_render_parity'].append({'printed_page':number,'pixels_equal':a.size==b.size and a.tobytes()==b.tobytes()})
with zipfile.ZipFile(deck) as z:
 report['pptx_slides_read']=[{'slide':i,'xml_sha256':H(z.read(f'ppt/slides/slide{i}.xml')),'text':' '.join(etree.fromstring(z.read(f'ppt/slides/slide{i}.xml')).xpath('//*[local-name()="t"]/text()'))}for i in range(3,36)]
manifest=json.loads((O/'authoring/textbook-question-manifest.json').read_text());records=[q for q in manifest['questions']if q['group']=='chapter-review'];report['optional_chapter_review_records']=records;report['optional_records_count']=len(records)
report['optional_resource_presence']=[{'question':q['id'],'resource':c['src'],'exists':(O/'workspace'/c['src']).exists(),'sha256':H((O/'workspace'/c['src']).read_bytes())if(O/'workspace'/c['src']).exists()else None}for q in records for c in q['crops']]
report['candidate_and_review_hashes']=[F(p)for folder in ['candidate','review-blind-final','review-rendered-final','review-feedback','review-reports/route11-extension']for p in sorted((R/folder).iterdir())if p.is_file()]
report['summary']={'archive_crc_ok':report['archive']['crc_first_bad_member']is None,'all_322_historical_hashes_match':len(checks)==322 and all(x['pass']for x in checks),'all_owner_freezes_match':all(x['all_equal']for x in report['owner_freezes']),'all_protected_dom_preserved':all(x['outside_declared_targets_equal']for x in report['routes']),'all_fragment_reading_parity':all(all(x['fragment_reading_parity'])for x in report['routes']),'all_feedback_exact':all(report['feedback_original_parity'].values()),'all_10_packet_pngs_match_pdf':sum(len(x['pages'])for x in report['static_packet'])==10 and all(all(y['exact_fresh_render_pixels_equal']for y in x['pages'])for x in report['static_packet']),'all_prompts_options_tables_present':all(all(all(v for k,v in y.items()if k!='id')for y in x['tasks'])and all(y['in_pdf']for y in x['table_cells'])for x in report['static_packet']),'all_28_source_pngs_match':len(report['source_render_identity'])==28 and all(x['exact_rgb_pixels_equal']for x in report['source_render_identity']),'all_optional_resources_exist':all(x['exists']for x in report['optional_resource_presence'])}
# Additional representation checks are explicitly separate from DOM parity.
def strings(obj):
 if isinstance(obj,str):yield obj
 elif isinstance(obj,dict):
  for v in obj.values():yield from strings(v)
 elif isinstance(obj,list):
  for v in obj:yield from strings(v)
report['authored_string_parity']=[]
for route,obj in json.loads((R/'teaching-copy.json').read_text()).items():
 values=list(strings(obj));man=(R/'candidate'/f'{route}.teaching-manuscript.txt').read_text();rd=' '.join(html.fromstring((R/'candidate'/f'{route}.reading.html').read_text()).itertext())
 report['authored_string_parity'].append({'route':route,'strings':len(values),'all_in_manuscript':all(v in man for v in values),'all_in_reading':all(v in rd for v in values)})
report['option_order_checks']=[]
for folder in ['candidate','review-blind-final']:
 name='lesson-11.reading.html' if folder=='candidate' else 'lesson-11.html';d=html.fromstring((R/folder/name).read_text())
 for q in final['mc']+transfer['mc']:
  opts=d.xpath(f'.//input[@name="{q["id"]}"]/@value');report['option_order_checks'].append({'representation':folder,'id':q['id'],'actual':opts,'exact_original_order':opts==q['options']})
report['review_only_contact_sheets']=[F(p)for p in sorted((R/'review-reports/source-evidence').glob('optional-crops-*.png'))]
report['first_attempt_expected_hashes']=[{'file':name,'expected':expected,'actual':H((R/'review-reports/route11-extension'/name).read_bytes()),'unchanged':H((R/'review-reports/route11-extension'/name).read_bytes())==expected}for name,expected in [('first-attempt.json','e562589298688d896b6a41d87f65dbd5b60a0653e4c8d8728c69aeddbe50d156'),('first-attempt.md','3435e01d97616924f7b57e37734ed2c307699a018025671b78920c87d4b00c44')]]
report['summary']['all_mc_orders_match']=all(x['exact_original_order']for x in report['option_order_checks'])
report['summary']['all_authored_strings_present']=all(x['all_in_manuscript']and x['all_in_reading']for x in report['authored_string_parity'])
report['summary']['first_attempt_unchanged']=all(x['unchanged']for x in report['first_attempt_expected_hashes'])
(R/'review-reports/hash-preservation-receipt.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report['summary'],indent=2));print(json.dumps(report['routes'],indent=2)[:4000]);print('feedback',report['feedback_original_parity'])
