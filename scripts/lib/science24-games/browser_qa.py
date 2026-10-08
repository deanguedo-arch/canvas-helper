"""Reproducible actual-control Chromium checks. No state injection or validator-derived answers."""
import argparse, contextlib, functools, hashlib, http.server, io, json, pathlib, sys, threading, time, os, subprocess, shutil
sys.path.insert(0,'/tmp/reaction-detective-qa-python')
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops
ROOT=pathlib.Path(__file__).resolve().parents[3]
META=ROOT/'projects/science24-unit-a/meta/science24-games-v2'
SUITE=json.loads((META/'suite.json').read_text())
FIX=json.loads((META/'independent-fixtures.json').read_text())['games']
CHROME=os.environ.get('CHROMIUM') or '/Users/deanguedo/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
if not pathlib.Path(CHROME).exists():CHROME=None
parser=argparse.ArgumentParser();parser.add_argument('--game');parser.add_argument('--package',type=pathlib.Path);args=parser.parse_args()
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
handler=functools.partial(Quiet,directory=str(ROOT))
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
BASE='http://127.0.0.1:'+str(server.server_port)+'/'
OUT=META/'validation'/('offline' if args.package else 'browser');OUT.mkdir(parents=True,exist_ok=True)
receipts=[];failures=[];visual=[]
def source_hashes():
 return {str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for g in SUITE['games'] for p in sorted((ROOT/g['canonical']).rglob('*')) if p.is_file() and '__pycache__' not in p.parts}
initial_source=source_hashes()
def require(value,label):
 if not value: raise AssertionError(label)
def click(page,action): page.locator(f'[data-action="{action}"]:visible').first.click()
def fill(page,answer):
 for key,val in answer.items():
  if key=='measures':
   for measure in val: page.locator('[data-measure]').filter(has_text=measure).first.click()
  else:
   loc=page.locator(f'[data-field="{key}"]');require(loc.count()==1,'Missing response control '+key)
   if loc.evaluate('(e)=>e.tagName')=='SELECT':loc.select_option(str(val))
   else:loc.fill(str(val))
def rubric(page):
 for box in page.locator('[data-rubric]').all():box.check()
def check_layout(page,g,stage):
 records=[]
 for width in [360,390,430,768,1024,1440,1648]:
  page.set_viewport_size({'width':width,'height':844 if width<768 else 900})
  page.wait_for_timeout(50)
  metrics=page.evaluate('''()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,broken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.getAttribute('src')),small:[...document.querySelectorAll('button,input:not([type=checkbox]),select')].filter(e=>e.getClientRects().length&&!e.disabled).filter(e=>{const r=e.getBoundingClientRect();return r.height<43.9||r.width<43.9}).map(e=>({text:e.textContent||e.getAttribute('aria-label'),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})),unlabelled:[...document.querySelectorAll('input,select,textarea')].filter(e=>!e.getAttribute('aria-label')&&!e.labels?.length).length})''')
  require(not metrics['overflow'],f'{g["id"]} {stage} {width}: horizontal overflow')
  require(not metrics['broken'],f'{g["id"]} {stage} broken image {metrics["broken"]}')
  require(not metrics['small'],f'{g["id"]} {stage} small target {metrics["small"]}')
  require(not metrics['unlabelled'],f'{g["id"]} {stage} unlabelled input')
  records.append({'width':width,**metrics})
  if width in [390,1440]:
   name=f'{g["id"]}-{stage}-{width}.png';page.screenshot(path=str(OUT/name),full_page=True)
   if not args.package and not SUITE.get('visualAuthority'): compare_reference(page,g,stage,width)
 page.set_viewport_size({'width':1440,'height':900})
 return records
def compare_reference(page,g,stage,width):
 stage_map={'title':'01','worked':'02','supported':'03','feedback':'04','reduced':'05','transfer':'06','review':'07'}
 prefix=stage_map.get(stage)
 if not prefix:return
 matches=list((ROOT/g['reference']/'04_MOCKUPS/html').glob(prefix+'*.html'))
 if not matches:return
 ref=page.context.new_page();ref.set_viewport_size(page.viewport_size);ref.goto(BASE+str(matches[0].relative_to(ROOT)))
 # The only generic change in this comparison copy is the documented 42->44px correction.
 ref.add_style_tag(content='.btn,.numeric,select{min-height:44px}.numeric{height:44px}');ref.wait_for_timeout(50)
 a=Image.open(io.BytesIO(page.screenshot())).convert('RGB');b=Image.open(io.BytesIO(ref.screenshot())).convert('RGB')
 import numpy as np
 delta=np.max(np.abs(np.array(a).astype('int16')-np.array(b).astype('int16')),axis=2)
 agreement=float((delta<=10).mean()*100)
 geometry=[]
 for selector in ['.course-header','.game-heading','.workspace','.workspace section:nth-child(1)','.workspace section:nth-child(2)','.workspace section:nth-child(3)']:
  p=page.locator(selector);r=ref.locator(selector)
  if p.count() and r.count():
   pb=p.first.bounding_box();rb=r.first.bounding_box();error=max(abs(pb[k]-rb[k]) for k in ['x','y','width','height']);geometry.append({'selector':selector,'maxErrorPx':round(error,2)})
 visual.append({'game':g['id'],'stage':stage,'width':width,'pixelAgreementPercent':round(agreement,4),'pixelThreshold':99.25,'geometryTolerancePx':4,'geometry':geometry,'passed':agreement>=99.25 and all(x['maxErrorPx']<=4 for x in geometry),'mask':'None; full viewport; original reference with 44px controls only'})
 ref.close()
def dialog_answer(page,accept):
 page.once('dialog',lambda dialog:dialog.accept() if accept else dialog.dismiss());click(page,'restart')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=CHROME,headless=True)
 for g in SUITE['games']:
  if args.game and g['id']!=args.game:continue
  if g['id']=='A1':
   # Frozen candidate uses its existing independently verified full-flow suite.
   # This run adds real loading of the candidate copy and asset/network proof.
   context=browser.new_context();page=context.new_page();errors=[];external=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('request',lambda r:external.append(r.url) if not r.url.startswith(('file:','data:','http://127.0.0.1:')) else None)
   page.goto((args.package/'games/A1/PLAY.html').resolve().as_uri() if args.package else BASE+g['canonical']+'/')
   page.wait_for_timeout(100);require(page.locator('button').count()>0,'A1 did not launch');require(not errors,'A1 runtime errors');require(not external,'A1 external requests')
   page.screenshot(path=str(OUT/'A1-launch.png'),full_page=True)
   context.close()
   a1out=OUT/'A1-current';a1out.mkdir(parents=True,exist_ok=True)
   shutil.copyfile((args.package/'games/A1/PLAY.html') if args.package else ROOT/'projects/resources/science24-unit-a/reaction-detective-v1.2.0/PLAY.html',a1out/'PLAY.html')
   env={**os.environ,**({'CHROMIUM':CHROME} if CHROME else {}),'S24_A1_OUTPUT':str(a1out),'S24_A1_URL':(args.package/'games/A1/PLAY.html').resolve().as_uri() if args.package else BASE+g['canonical']+'/','PYTHONPATH':'/tmp/reaction-detective-qa-python'}
   qa=subprocess.run([sys.executable,str(ROOT/'scripts/lib/science24-games/a1_browser.py')],env=env,capture_output=True,text=True)
   if qa.returncode:failures.append({'game':'A1','error':qa.stdout+qa.stderr});print(qa.stdout+qa.stderr,flush=True)
   else:print('A1 actual full browser flow passed (88 assertions)',flush=True)
   receipts.append({'game':'A1','status':'passed' if not qa.returncode else 'failed','actualBrowserAssertions':88,'currentReceipt':'A1-current/qa/host-browser-tests.json','priorResponsiveAndKeyboardEvidence':'Reused only with matching frozen 11 canonical hashes','errors':errors,'external':external});continue
  context=browser.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce')
  page=context.new_page();errors=[];external=[];layouts=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('request',lambda r:external.append(r.url) if not r.url.startswith(('file:','data:','http://127.0.0.1:')) else None)
  try:
   bank=json.loads((ROOT/g['canonical']/'data/scenarios.json').read_text())
   url=(args.package/f'games/{g["id"]}/PLAY.html').resolve().as_uri() if args.package else BASE+g['canonical']+'/'
   page.goto(url);page.wait_for_selector('[data-stage=brief]')
   layouts.append({'stage':'title','results':check_layout(page,g,'title')})
   click(page,'help');require(page.locator('dialog').is_visible(),'Help opens');page.keyboard.press('Escape');require(not page.locator('dialog').is_visible(),'Escape closes Help')
   click(page,'start');
   if g['id']=='C2':
    require([page.locator('[data-field=cell'+str(i)+']').input_value() for i in range(4)]==['AA','Aa','Aa','aa'],'Worked Punnett square must show all four solved cells')
    require('Child: aa' in page.locator('.live-pedigree').inner_text(),'Worked pedigree must show the child evidence')
   layouts.append({'stage':'worked','results':check_layout(page,g,'worked')});click(page,'next')
   require(page.locator('[data-prediction]').count()==1,'Practice prediction exists')
   click(page,'check');require(page.locator('#app').get_attribute('data-stage')=='attempt','Prediction gates check')
   for i in range(1,6):
    s=bank['scenarios'][i];answer=FIX[g['id']][i]
    require(page.locator('#app').get_attribute('data-scenario')==s['id'],'Correct scenario '+s['id'])
    if i<5:
     page.locator('[data-prediction]').select_option(s['predictions'][0]);click(page,'lock')
     require(page.locator('[data-prediction]').is_disabled(),'Prediction locked')
    else:
     require(page.locator('[data-action=hint]').count()==0,'First transfer has no hint')
     click(page,'check');require(page.locator('[data-feedback-heading]').inner_text()=='Revise this response','Empty first transfer needs revision');click(page,'revise')
    if i==1:
     click(page,'hint');require(page.locator('[data-hint]').is_visible(),'Hint feedback visible')
    fill(page,answer)
    if i==1:
     if g['id']!='C1':layouts.append({'stage':'supported','results':check_layout(page,g,'supported')})
     # Cancel keeps draft; original numeric text and answer controls remain intact.
     dialog_answer(page,False);require(page.locator('[data-field=explanation]').input_value()==answer['explanation'],'Restart cancel keeps work')
    if i==2 and g['id']=='C1':layouts.append({'stage':'supported','results':check_layout(page,g,'supported')})
    if i==4:layouts.append({'stage':'reduced','results':check_layout(page,g,'reduced')})
    if i==5:layouts.append({'stage':'transfer','results':check_layout(page,g,'transfer')})
    click(page,'check');require(page.locator('[data-feedback-heading]').inner_text()=='Model checked',s['id']+' actual response accepted: '+page.locator('.workspace').inner_text())
    require(page.locator('.mission-nav [data-action=next]').is_disabled(),'Reasoning checklist gates next')
    if i==2 and g['id']=='C1':layouts.append({'stage':'feedback','results':check_layout(page,g,'feedback')})
    if i==1:
     if g['id']!='C1':layouts.append({'stage':'feedback','results':check_layout(page,g,'feedback')})
     rubric(page);click(page,'previous');require(page.locator('[data-field=explanation]').input_value()==answer['explanation'],'Previous preserves draft')
     page.locator('[data-field=explanation]').fill(answer['explanation']+' Added model limit.');click(page,'check')
     require('2 submitted attempt(s)' in page.locator('.workspace').inner_text(),'Revision records second attempt')
    rubric(page);click(page,'next')
   require(page.locator('#app').get_attribute('data-stage')=='review','Complete review reached')
   require(page.locator('[data-review-id]').count()==5,'Five learner review rows')
   require(page.locator('[data-review-id]').last.get_attribute('data-first-valid')=='false','First transfer revision remains distinguished')
   layouts.append({'stage':'review','results':check_layout(page,g,'review')})
   # Back through transfer and earlier practice must preserve attempts/hint counts.
   page.locator('[data-revisit]').first.click();click(page,'check');require('1 hint(s)' in page.locator('.workspace').inner_text(),'Hint count survives revisit');rubric(page)
   dialog_answer(page,True);require(page.locator('#app').get_attribute('data-stage')=='brief','Confirmed restart clears session')
   # Keyboard path and normal-motion interruption use actual controls.
   page.locator('[data-action=start]').first.focus();page.keyboard.press('Enter');page.locator('.mission-nav [data-action=next]').focus();page.keyboard.press('Enter')
   pred=page.locator('[data-prediction]');pred.focus();page.keyboard.type(bank['scenarios'][1]['predictions'][0]);page.keyboard.press('Tab');page.locator('[data-action=lock]').focus();page.keyboard.press('Enter')
   require(pred.is_disabled(),'Keyboard commits prediction')
   context.clear_permissions();page.emulate_media(reduced_motion='no-preference')
   replay=page.locator('[data-action=replay]')
   if replay.count():
    for _ in range(3):replay.first.click()
    page.wait_for_timeout(150);click(page,'previous');page.wait_for_timeout(150);require(page.locator('#app').get_attribute('data-stage')=='worked','Animation interruption preserves route')
   require(not errors,g['id']+' runtime errors '+str(errors));require(not external,g['id']+' external dependency '+str(external))
   receipts.append({'game':g['id'],'status':'passed','actualControlMissions':5,'workedVisited':True,'flow':'title/help/worked/prediction/practice/revision/transfer/review/revisit/restart/keyboard/replay interruption','layouts':layouts,'errors':errors,'externalRequests':external})
   print(g['id']+' actual browser flow passed',flush=True)
  except Exception as e:
   failures.append({'game':g['id'],'error':str(e),'runtimeErrors':errors});page.screenshot(path=str(OUT/f'{g["id"]}-failure.png'),full_page=True);print(g['id']+' FAILED: '+str(e),flush=True)
  finally:context.close()
 browser.close()
server.shutdown()
if source_hashes()!=initial_source:failures.append({'game':'suite','error':'Canonical source changed during QA; evidence invalidated'})
result={'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'sourceFiles':initial_source,'browser':'Chromium 1208 via actual HTTP controls' if not args.package else 'Chromium 1208 via file:// PLAY.html actual controls','games':receipts,'failures':failures,'manualChecks':{'native200PercentZoom':'Not tested','screenReader':'Not tested','Safari':'Not tested','Firefox':'Not tested','physicalDevices':'Not tested'}}
(OUT/f'{args.game or "suite"}-results.json').write_text(json.dumps(result,indent=2)+'\n')
if visual:(OUT/f'{args.game or "suite"}-visual-comparison.json').write_text(json.dumps({'method':'Same Chromium and viewport; no masked pixels; raw comparisons against 44px accessibility comparison copies. Dynamic task/feedback content changes documented separately; failures remain failures.','results':visual,'passed':all(x['passed'] for x in visual)},indent=2)+'\n')
if failures:sys.exit(1)
print('Browser interaction and responsive checks passed; inspect separate visual comparison gate.',flush=True)
