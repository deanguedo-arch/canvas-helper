#!/usr/bin/env python3
"""Keyboard-only complete route plus input/fallback/reduced-motion/zoom stress checks.
No screenshot or UI mock substitutes. CSS zoom is not claimed to be native browser zoom.
"""
from pathlib import Path
import os,json,traceback,sys,hashlib
from playwright.sync_api import sync_playwright
from responsive_test import ANSWERS, CONTRAST
ROOT=Path(__file__).resolve().parents[2];rows=[]
def check(n,v,d=''):
 rows.append({'test':n,'status':'PASS' if v else 'FAIL','detail':d})
 if not v:raise AssertionError(n+' '+str(d))
def aim(page,sel):
 for _ in range(160):
  if page.evaluate('(s)=>document.activeElement.matches(s)',sel):return
  page.keyboard.press('Tab')
 raise AssertionError('Could not Tab to '+sel)
def press(page,sel,key='Enter'):aim(page,sel);page.keyboard.press(key)
def choose(page,sel,value):
 aim(page,sel);i=page.locator(sel).evaluate('(e,v)=>[...e.options].findIndex(o=>o.value===v)',value)
 if i<0:raise AssertionError('Missing option '+value)
 # macOS native select: keyboard typeahead selects a label; arrow-only automation
 # leaves the closed native popup unchanged in this headless Chromium build.
 label=page.locator(sel).evaluate('(e,v)=>[...e.options].find(o=>o.value===v).textContent',value)
 page.keyboard.type(label.strip())
 page.keyboard.press('Tab')
 assert page.locator(sel).input_value()==value, ('Keyboard typeahead did not select',value)
def claim(page,value):
 aim(page,'input[name=conclusion]');page.keyboard.press('Space')
 vals=['physical','chemical','insufficient'];now=page.locator(':focus').input_value()
 for _ in range((vals.index(value)-vals.index(now))%3):page.keyboard.press('ArrowRight')
def enter_text(page,text):aim(page,'#explanation');page.keyboard.insert_text(text)
def load(page):
 page.set_default_timeout(5000);page.set_content((ROOT/'PLAY.html').read_text(),wait_until='load')
def run():
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
  page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  load(page)
  page.keyboard.press('Tab');check('Skip link is the first keyboard stop',page.locator(':focus').get_attribute('class')=='skip-link')
  check('Skip link visibly focused',page.locator('.skip-link').evaluate('(e)=>getComputedStyle(e).clipPath')=='none')
  page.keyboard.press('Enter');check('Skip link transfers focus into activity',page.evaluate('document.activeElement.id')=='main')
  press(page,'[data-action=help]');check('Keyboard opens native help dialog',page.locator('dialog').evaluate('(e)=>e.open'))
  for _ in range(4):page.keyboard.press('Tab')
  check('Tab focus stays within modal',page.evaluate('!!document.activeElement.closest("dialog")'))
  page.keyboard.press('Escape');check('Escape restores invoking help control',page.evaluate('document.activeElement.dataset.action')=='help')
  press(page,'[data-action=start]');press(page,'[data-action=practice]')
  for id,conclusion,reaction,response,pair,text in ANSWERS:
   if pair:
    choose(page,'#prediction','insufficient')
    for ev in pair:
     press(page,f'[data-action=reveal][data-id="{ev}"]');check(id+' reveal focus '+ev,page.evaluate('document.activeElement.id')=='evidence-'+ev)
    for ev in pair:press(page,'#select-'+ev,'Space')
   claim(page,conclusion)
   if reaction:choose(page,'#reaction',reaction)
   if response:choose(page,'#response',response)
   enter_text(page,text)
   press(page,'[data-action=submit]');check(id+' keyboard accepted',page.locator('#feedback-title').inner_text()=='Structured choices supported')
   check(id+' feedback receives focus',page.evaluate('document.activeElement.id')=='feedback-title')
   for i in range(4):press(page,f'[data-rubric="{i}"]','Space')
   press(page,'[data-action=advance]')
  check('Entire learning route completed using keyboard alone',page.locator('.result-card').count()==5)
  page.emulate_media(reduced_motion='reduce')
  active=page.locator('*').evaluate_all("els=>els.filter(e=>{const c=getComputedStyle(e);return c.animationName!=='none'||c.transitionDuration.split(',').some(d=>parseFloat(d)>0)}).length")
  check('Reduced-motion setting removes all transitions and animations',active==0,str(active))
  # Read-only robust copy/escaped markup check on replay.
  page.locator('[data-action=replay][data-id=T01]').click();page.locator('#conclusion-physical').check()
  bad='<img src=x onerror="window.__injected=1">\n'+'X'*2200
  page.locator('#explanation').fill(bad);page.locator('[data-action=submit]').click()
  check('User HTML never becomes elements or executable markup',page.evaluate('window.__injected===undefined') and page.locator('img[src="x"]').count()==0)
  check('Literal text preserved in feedback',bad==page.locator('.review-explanation blockquote').inner_text())
  for width in [360,430,768,1440]:
   page.set_viewport_size({'width':width,'height':900});check(f'Unbroken user text wraps at {width}px',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
  page.set_viewport_size({'width':1648,'height':1000});page.add_style_tag(content='html {zoom:2}')
  check('200% CSS zoom transfer stress: no horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),str(page.evaluate('({w:innerWidth,scroll:document.documentElement.scrollWidth})')))
  page.screenshot(path=str(ROOT/'qa/screenshots/19_transfer_css_zoom_200.png'),full_page=True,timeout=30000)
  # Re-load a normal page then remove decorative imagery by an actual decode failure.
  load(page);page.locator('[data-action=start]').click();page.locator('[data-action=practice]').click()
  page.locator('.scene-frame img').evaluate('(e)=>{e.src="data:image/png;base64,not-a-png"}')
  page.wait_for_selector('.scene-frame.unavailable')
  check('Missing decorative asset has visible fallback',page.locator('.image-fallback').is_visible())
  check('Asset failure leaves base science and all evidence available',page.locator('.record-table').is_visible() and page.locator('.evidence-card').count()==4)
  page.locator('#prediction').select_option('physical');page.locator('[data-action=reveal]').first.click()
  check('Asset failure does not block investigation',page.locator('[data-evidence]').count()==1)
  # Late-practice hint ladder and longest choice labels at layout-reflow equivalent of 200% desktop zoom.
  page.set_viewport_size({'width':824,'height':800})
  check('824px reflow equivalent: no overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
  page.add_style_tag(content='html {zoom:2}')
  check('200% CSS zoom practice stress: no overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),str(page.evaluate('({w:innerWidth,scroll:document.documentElement.scrollWidth})')))
  check('No JavaScript errors during keyboard and stress tests',not errors,str(errors));b.close()
try:run()
except Exception:rows.append({'test':'Harness','status':'FAIL','detail':traceback.format_exc()})
report={'artifact_sha256':hashlib.sha256((ROOT/'PLAY.html').read_bytes()).hexdigest(),'method':'macOS keyboard typeahead for native select labels; Chromium exact PLAY.html via set_content. Initial six-case route uses keyboard only. Later robustness checks use DOM input controls. CSS zoom stress is explicitly not native browser zoom. No real assistive-technology or physical-touch-hardware claim.','tests':rows,'passed':sum(r['status']=='PASS' for r in rows),'failed':sum(r['status']=='FAIL' for r in rows)}
(ROOT/'qa/keyboard-stress.json').write_text(json.dumps(report,indent=2));print(json.dumps(report if report['failed'] else {k:v for k,v in report.items() if k!='tests'},indent=2));sys.exit(1 if report['failed'] else 0)
