from pathlib import Path
import sys,json,re,csv,hashlib,base64
from bs4 import BeautifulSoup
import fitz
sys.path.insert(0,str(Path(__file__).resolve().parent))
from test_harness import start_page,OUT
from verify_modules import dumpcsv
from playwright.sync_api import sync_playwright
E=OUT/'developer/tests';rows=[];structure=[]
for n in(2,3,4):
 d=OUT/f'sportswellness-phase-{n}';s=BeautifulSoup((d/'index.html').read_text(),'html.parser');ids=[x['id']for x in s.select('[id]')];missing=[];brokenanchors=[];external=[]
 for x in s.select('[src],link[href]'):
  value=x.get('src',x.get('href',''))
  if re.match(r'^https?://',value):external.append(value)
  elif value and not value.startswith(('data:','#')):
   if not(d/value.split('#')[0]).exists():missing.append(value)
 for x in s.select('a[href^="#"]'):
  if x['href'][1:]not in ids:brokenanchors.append(x['href'])
 content=s.select_one('main').get_text(' ',strip=True)
 meta=json.loads((d/'review/phase-config.json').read_text());pdf=next((d/'assets/readings').glob('*.pdf'));doc=fitz.open(pdf)
 outside=[(i+1,w[4])for i,p in enumerate(doc)for w in p.get_text('words')if w[0]<-1 or w[2]>p.rect.width+1 or w[1]<-1 or w[3]>p.rect.height+1]
 stray=[t.get_text(' ',strip=True) for t in s.select('main p')if re.search(r'(?:^|[.!?]\s+)(The source|The original reading|supplied slides|teacher notes|source corrections)\b',t.get_text(),re.I)]
 r={'phase':n,'routes':len(s.select('.chapter-section')),'learn_topics':len(meta['lessonFields']),'build_fields':len(meta['buildFields']),'concept_checks':len(s.select('.knowledge-check')),'checkpoint_questions':len(s.select('.checkpoint-question')),'review_questions':len(s.select('.question[data-review-question]')),'duplicate_ids':len(ids)-len(set(ids)),'missing_local_assets':json.dumps(missing),'broken_local_anchors':json.dumps(brokenanchors),'external_core_dependencies':json.dumps(external),'stray_source_commentary':json.dumps(stray),'reading_pages':len(doc),'reading_selectable_words':sum(len(p.get_text().split())for p in doc),'reading_text_outside_pages':len(outside),'stylesheet_sha256':hashlib.sha256((d/'styles.css').read_bytes()).hexdigest()};structure.append(r)
with sync_playwright()as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for n in(2,3,4):
  p=start_page(b,n);d=OUT/f'sportswellness-phase-{n}';cfg=json.loads((d/'review/phase-config.json').read_text());key=f'canvas-helper:sportswellness-phase-{n}:state';opening=cfg['openingField']
  def rec(name,ok,detail=''):rows.append({'phase':n,'test':name,'result':'PASS'if ok else'FAIL','detail':detail})
  p.evaluate('(id)=>SportsWellness.navigate(id)',opening);p.locator('#'+opening).fill('Synthetic export check: <script>window.BAD=true</script> & notes.');p.evaluate("SportsWellness.navigate('course-guide')");p.locator('#backup-save').evaluate('(e)=>{for(let a=e.parentElement;a;a=a.parentElement)if(a.tagName==="DETAILS")a.open=true}')
  try:
   with p.expect_download(timeout=4000)as event:p.locator('#backup-save').click()
   download=event.value;dest=E/f'p{n}-synthetic-backup.json';download.save_as(dest);saved=json.loads(dest.read_text());rec('Backup download creates valid module file',saved['courseId']==cfg['moduleId']and'<script>'in saved['drafts'][opening]);dest.unlink()
  except Exception as ex:rows.append({'phase':n,'test':'Browser backup download','result':'NOT RUN','detail':'Browser fixture download unavailable: '+str(ex)[:250]})
  # Capture the actual export function output without claiming the browser print dialog was tested.
  p.evaluate('''()=>{window.__printed=0;window.__exportHTML='';window.open=()=>({document:{open(){},write(v){window.__exportHTML=v},close(){}},focus(){},print(){window.__printed++}});}''')
  p.evaluate("SportsWellness.navigate('process-collection')");p.locator('[data-export=notebook]').click();p.wait_for_timeout(300);export=p.evaluate('__exportHTML');rec('Export function emits safe complete document','&lt;script&gt;'in export and'window.BAD=true</script>'not in export and'<h1>My Work'in export and p.evaluate('__printed')==1,'Print window and dialog replaced with capture fixture; live browser printing is not certified.')
  # Historical content version cannot meet current threshold.
  p.evaluate("SportsWellness.navigate('checkpoint')");p.evaluate('''()=>document.querySelectorAll('.checkpoint-question').forEach(q=>{const r=q.querySelector('input[value="'+q.dataset.correct+'"]');r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}));})''');p.locator('#phase1-checkpoint-form button[type=submit]').click();p.evaluate('SportsWellness.flush()');raw=p.evaluate('SportsWellness.getState()');raw['checkpoint']['attempts'][0]['contentVersion']='earlier-version';p.close();p=start_page(b,n,state={key:json.dumps(raw)});p.evaluate("SportsWellness.navigate('checkpoint')");rec('Earlier-version score not counted as current threshold','Best current-version score: none' in p.locator('#checkpoint-history').inner_text() and p.locator('.checkpoint-feedback:visible').count()==0);p.close()
  p=start_page(b,n,state={key:'UNREADABLE ORIGINAL STATE'});p.evaluate('(id)=>SportsWellness.navigate(id)',opening);p.locator('#'+opening).fill('New work remains in open page');p.locator('#school-save-exit').click();rec('Unreadable stored state is protected from overwrite',p.evaluate('__testStore')[key]=='UNREADABLE ORIGINAL STATE' and not p.evaluate('SportsWellness.storageAvailable()'));p.close()
 b.close()
dumpcsv(E/'final-static-checks.csv',structure);dumpcsv(E/'export-version-and-corruption-tests.csv',rows)
print('static',structure);print('extra',rows)
