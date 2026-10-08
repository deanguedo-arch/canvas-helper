"""Focused Build-mode B2 controls/state check; no learner, teacher or release claim."""
import argparse, hashlib, http.server, json, os, sys, threading, time
from pathlib import Path
sys.path.insert(0, '/tmp/reaction-detective-qa-python')
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[3]
GAME=ROOT/'projects/science24-unit-b/workspace/games/power-budget-challenge'
META=ROOT/'projects/science24-unit-a/meta/science24-games-v2/gameplay-redesign-v1/b2-pilot-1'
OUT=META/'browser';OUT.mkdir(exist_ok=True)
CHROME=os.environ.get('CHROMIUM','/Users/deanguedo/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing')
SOL=json.loads((META/'B2_SOLUTIONS.json').read_text())['solutions']
EXTRA=json.loads((GAME/'data/gameplay.json').read_text())
checks=0
def require(ok,msg):
 global checks
 checks+=1
 if not ok:raise AssertionError(msg)
def hashes():return {str(p.relative_to(GAME)):hashlib.sha256(p.read_bytes()).hexdigest() for p in GAME.rglob('*') if p.is_file()}
before=hashes()
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def log_message(self,*a):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
URL=f'http://127.0.0.1:{server.server_port}/projects/science24-unit-b/workspace/games/power-budget-challenge/'
def click(page,action):page.locator(f'[data-action="{action}"]:visible').first.click()
def run(page):
 page.wait_for_timeout(320)
 click(page,'run')
def predict(page):page.locator('[data-prediction]').first.click()
def fill_config(page,config):
 for k,v in config.items():
  if k=='fixture':page.locator(f'[data-fixture="{v}"]').click()
  elif k.endswith('_power'):
   q=page.locator(f'[data-power="{k[:-6]}"][data-value="{v}"]')
   if q.count():q.click()
  else:
   q=page.locator(f'[data-config="{k}"]')
   if q.count():q.fill(str(v))
def explain(page,sid):
 page.locator('[data-evidence]').first.click()
 page.locator('[data-answer="explanation"]').fill('I kept the required service and used the supplied quantitative energy account. This is an authored model.')
 if sid!='B2-T01':click(page,'finish')
def scenario(page,sid):require(page.locator('#app').get_attribute('data-scenario')==sid,'Expected '+sid)
def layout(page,label):
 require(page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),label+' page overflow')
 small=page.locator('button:visible,input:visible,textarea:visible').evaluate_all('(els)=>els.filter(e=>{const r=e.getBoundingClientRect();return r.width<43.5||r.height<43.5}).map(e=>({text:e.textContent,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))')
 require(not small,label+' undersized controls '+str(small))
 missing=page.locator('img').evaluate_all('(els)=>els.filter(e=>!e.complete||!e.naturalWidth).map(e=>e.src)')
 require(not missing,label+' missing image '+str(missing))

errors=[];external=[];failure=None
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=CHROME,headless=True)
  context=browser.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce')
  page=context.new_page()
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('request',lambda r:external.append(r.url) if not r.url.startswith(('http://127.0.0.1:','data:')) else None)
  page.goto(URL);page.wait_for_selector('[data-mode="home"]');layout(page,'desktop home');page.screenshot(path=str(OUT/'desktop-home.png'),full_page=True)
  click(page,'help');require(page.locator('dialog').is_visible(),'How to play opens');page.keyboard.press('Escape');page.locator('dialog').wait_for(state='detached');require(not page.locator('dialog').count(),'Help closes with Escape')
  page.locator('[data-action="start"]').focus();page.keyboard.press('Enter');scenario(page,'B2-W01')
  require(page.locator('[data-action="run"]:visible').is_disabled(),'Prediction gates first result')
  require('1.040' not in page.locator('#forecast').inner_text(),'Derived opening total concealed')
  predict(page);run(page);require('1.040' in page.locator('#forecast').inner_text(),'Wrong original plan has actual consequence')
  require('Repair the plan' in page.locator('#debrief').inner_text(),'Failed opening actionable')
  fill_config(page,SOL['B2-W01']['config']);require('0.440' in page.locator('#forecast').inner_text(),'Live repair changes forecast')
  require('0.440 / 0.500' in page.locator('#quick-forecast').inner_text(),'Forecast is beside the plan controls')
  require('Draft changed' in page.locator('#debrief').inner_text(),'Repair invalidates old check')
  run(page);require(page.locator('[data-answer="explanation"]').count()==1,'Explanation follows successful run')
  explain(page,'B2-W01');require('You repaired the evening plan' in page.locator('#debrief').inner_text(),'Coached round completed by actions')
  require('Saved 0.600 kWh' in page.locator('#debrief').inner_text(),'Accomplishment reflects the actual energy saved')
  layout(page,'desktop repaired opening');page.screenshot(path=str(OUT/'desktop-opening-repaired.png'),full_page=True)
  click(page,'next')
  for sid in ['B2-P01','B2-P02','B2-P03','B2-P04']:
   scenario(page,sid);predict(page)
   if sid=='B2-P01':
    click(page,'hint');require(page.locator('.shown-hints').inner_text().strip(),'Hint shown and tracked')
   fill_config(page,SOL[sid]['config']);run(page)
   require(page.locator('[data-answer="explanation"]').count()==1,sid+' successful model response')
   explain(page,sid);require('Mission complete' in page.locator('#debrief').inner_text(),sid+' completion')
   if sid=='B2-P02':
    click(page,'back');scenario(page,'B2-P01');require('1 used' in page.locator('[data-action="hint"]').inner_text(),'Hint survives backward navigation')
    page.locator('[data-open="B2-P02"]').click();scenario(page,sid);require('Mission complete' in page.locator('#debrief').inner_text(),'Completion survives navigation')
   if sid=='B2-P04':page.screenshot(path=str(OUT/'desktop-efficiency.png'),full_page=True)
   click(page,'next')
  scenario(page,'B2-T01');require('0.460' not in page.locator('#forecast').inner_text(),'First independent result concealed')
  click(page,'review');require(page.locator('#app').get_attribute('data-mode')=='play','Earlier review is gated before independent submission')
  page.locator('[data-open="B2-W01"]').click();scenario(page,'B2-T01')
  run(page);require(page.locator('#transfer-result').inner_text()=='','Incomplete draft does not consume first response')
  wrong=dict(SOL['B2-T01']['config'],projector_power=200,repairedTotal=.58)
  fill_config(page,wrong);explain(page,'B2-T01');run(page)
  require('First response: needed revision' in page.locator('#transfer-result').inner_text(),'Complete wrong first response preserved')
  fill_config(page,SOL['B2-T01']['config']);explain(page,'B2-T01');run(page)
  require('First response: needed revision' in page.locator('#transfer-result').inner_text(),'Correction does not replace first response')
  require('Model checked' in page.locator('#transfer-result').inner_text(),'Correct revision checked')
  click(page,'review');require('6 of 6' in page.locator('.work-review').inner_text(),'Six core rounds reviewed')
  page.locator('.independent-summary summary').click()
  original=json.loads(page.locator('.independent-summary pre').inner_text())
  require(original['projector_power']==200 and original['repairedTotal']=='0.58','Exact first transfer contents retained')
  require('not established' in page.locator('.independent-summary').inner_text(),'Independent success distinction truthful')
  page.screenshot(path=str(OUT/'desktop-review.png'),full_page=True)
  # All eight replay cases through actual controls, linked to their core skill.
  for v in EXTRA['variants']:
   click(page,'home');click(page,'review');page.locator(f'.replay-list [data-open="{v["id"]}"]').click();scenario(page,v['id'])
   predict(page);fill_config(page,SOL[v['id']]['config']);run(page);explain(page,v['id'])
   require('Mission complete' in page.locator('#debrief').inner_text(),v['id']+' actual control completion')
  click(page,'lab');scenario(page,'B2-LAB');predict(page);run(page)
  require('14.920' in page.locator('#forecast').inner_text(),'Centre starts with an over-cap challenge')
  fill_config(page,SOL['B2-LAB']['config']);require('11.920' in page.locator('#forecast').inner_text(),'Heater repair saves 3 kWh')
  page.locator('[data-config="heater_hours"]').fill('0');require('service is missing' in page.locator('#forecast').inner_text(),'All-off shortcut fails services')
  page.locator('[data-config="heater_hours"]').fill('4');run(page);explain(page,'B2-LAB')
  page.screenshot(path=str(OUT/'desktop-centre-lab.png'),full_page=True)
  # Native confirm cancel keeps work; confirm clears it.
  page.once('dialog',lambda d:d.dismiss());click(page,'restart');require('Centre plan kept' in page.locator('#debrief').inner_text(),'Restart cancel retains plan')
  page.once('dialog',lambda d:d.accept());click(page,'restart');require(page.locator('#app').get_attribute('data-mode')=='home','Restart confirm returns home')
  click(page,'start');predict(page);fill_config(page,SOL['B2-W01']['config'])
  page.emulate_media(reduced_motion='no-preference');page.locator('[data-action="run"]:visible').focus();page.keyboard.press('Enter');page.keyboard.press('Enter');require('Recorded trials (1)' in page.locator('.history summary').inner_text(),'Rapid activation records one intentional trial');page.wait_for_timeout(150);click(page,'pause')
  clock=page.locator('[data-clock]').inner_text();page.wait_for_timeout(150);require(page.locator('[data-clock]').inner_text()==clock,'Pause freezes model time')
  click(page,'resume');page.wait_for_timeout(150);click(page,'back');require(page.locator('#app').get_attribute('data-mode')=='home','Navigation interrupts animation')
  click(page,'start');require(page.locator('[data-action="run"]:visible').is_enabled(),'Interrupted replay does not strand run control')
  page.emulate_media(reduced_motion='reduce')
  # Finite replay selection actually uses the no-replacement queue.
  seen=[]
  for _ in range(8):click(page,'home');click(page,'fresh');seen.append(page.locator('#app').get_attribute('data-scenario'))
  require(len(set(seen))==8,'Fresh replay selection avoids repeats')
  click(page,'home');click(page,'fresh');require(page.locator('#app').get_attribute('data-mode')=='pool','Exhausted pool offers explicit revisits')
  context.close()
  mobile=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce');mp=mobile.new_page();mp.on('pageerror',lambda e:errors.append(str(e)))
  mp.goto(URL);mp.wait_for_selector('[data-mode="home"]');layout(mp,'390px home');mp.screenshot(path=str(OUT/'mobile-home.png'),full_page=True)
  click(mp,'start');predict(mp);fill_config(mp,SOL['B2-W01']['config']);run(mp);explain(mp,'B2-W01');layout(mp,'390px coached repair');mp.screenshot(path=str(OUT/'mobile-opening-repaired.png'),full_page=True)
  click(mp,'lab');predict(mp);fill_config(mp,SOL['B2-LAB']['config']);run(mp);layout(mp,'390px centre lab');mp.screenshot(path=str(OUT/'mobile-centre-lab.png'),full_page=True)
  mp.locator('[data-config="water_hours"]').scroll_into_view_if_needed()
  require(mp.locator('#quick-forecast').evaluate('(el)=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}') and '11.920 / 12.000' in mp.locator('#quick-forecast').inner_text(),'Mobile forecast stays visible while editing later services')
  mobile.close();browser.close()
 require(not errors,'Browser runtime errors '+str(errors));require(not external,'External dependencies '+str(external));require(before==hashes(),'Source changed during checks')
except Exception as e:
 failure=str(e)
 print('B2 pilot browser check failed:',failure)
finally:server.shutdown()
receipt={'version':'2.1.0-pilot1','checks':checks,'status':'failed' if failure else 'passed','failure':failure,'browser':'Chromium actual HTTP controls','viewports':[1440,390],
 'sourceFiles':before,'runtimeErrors':errors,'externalRequests':external,'manualChecks':{'learnerPlaytesting':'Pending','teacherApproval':'Pending','native200PercentZoom':'Not tested','screenReader':'Not tested','Safari':'Not tested','Firefox':'Not tested','physicalDevice':'Not tested','otherFiveResponsiveWidths':'Deferred until rollout','offlinePackage':'Deferred until gameplay acceptance'}}
(META/'browser-results.json').write_text(json.dumps(receipt,indent=2)+'\n')
if failure:sys.exit(1)
print(f'{checks} focused B2 browser assertions passed: six core missions, eight replay challenges, centre lab, state/revision, keyboard, desktop and 390px touch layout.')
