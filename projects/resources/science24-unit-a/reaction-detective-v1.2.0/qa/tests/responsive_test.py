#!/usr/bin/env python3
"""Real runtime layout/contrast/touch checks; exact embedded HTML, no external dependencies in game.
Usage: python qa/tests/responsive_test.py 360 390 430
Browser test dependency: Playwright and Chromium. Not an axe or WCAG certification.
"""
from pathlib import Path
import os, sys, json, traceback, hashlib
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
HTML=(ROOT/'PLAY.html').read_text()
# Expected answers authored independently in this test; these are not injected into game state.
ANSWERS=[
 ('P01','physical','',None,['p01_e1','p01_e2'],'The identity comparison reports no new substances and the recovered solid matches the original. The cooling alone did not establish a chemical change.'),
 ('P02','chemical','corrosion','barrier_coating',['p02_e1','p02_e2'],'The coating contains iron and oxygen and differs from the original metal. This supports corrosion. A barrier limits further oxygen and moisture contact.'),
 ('P03','chemical','neutralization',None,['p03_e1','p03_e2'],'The acid and calcium carbonate form identified carbon dioxide, water and a calcium salt. New substances support an acid–carbonate neutralization reaction.'),
 ('P04','chemical','combustion','carbon_dioxide',['p04_e1','p04_e2'],'Methane and oxygen react to form carbon dioxide and water in this complete-combustion model. Carbon dioxide is the carbon-containing greenhouse-gas product.'),
 ('T01','physical','',None,[],'The identity record remains H₂O before heating and after condensation. The bubbles therefore show a change of state rather than proof of a new substance.')]
CONTRAST=r"""() => {
 function rgba(v){return (v.match(/[\d.]+/g)||[]).map(Number)}
 function bg(e){if(!e)return [255,255,255];const a=rgba(getComputedStyle(e).backgroundColor);const p=bg(e.parentElement);if(a.length<3)return p;const t=a[3]??1;return a.slice(0,3).map((v,i)=>v*t+p[i]*(1-t));}
 function lum(a){return a.map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)}
 let count=0,fail=[];
 for(const e of document.querySelectorAll('body *')){
  if(e.closest('.sr-only,.skip-link,script,style,svg,noscript')||!e.checkVisibility()||e.matches(':disabled')||e.closest('button:disabled'))continue;
  if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;
  if(e.matches('option'))continue;
  const c=getComputedStyle(e),f=rgba(c.color),b=bg(e),l=[lum(f.slice(0,3)),lum(b)].sort((a,b)=>b-a),ratio=(l[0]+.05)/(l[1]+.05),sz=parseFloat(c.fontSize),min=(sz>=24||(sz>=18.66&&parseInt(c.fontWeight)>=700))?3:4.5;
  count++;if(ratio<min-.01)fail.push({text:e.textContent.trim().slice(0,60),foreground:c.color,background:b,ratio:+ratio.toFixed(2),minimum:min});
 }
 return {count,fail};
}"""

def one(width,p):
 rows=[];errors=[];requests=[]
 def check(n,v,detail=''):
  rows.append({'test':n,'status':'PASS' if v else 'FAIL','detail':detail})
  if not v:raise AssertionError(n+' '+str(detail))
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 ctx=browser.new_context(viewport={'width':width,'height':900},device_scale_factor=1,has_touch=(width==390),is_mobile=(width==390))
 page=ctx.new_page();page.set_default_timeout(5000)
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url))
 def click(selector):
  loc=page.locator(selector).first
  if width==390:loc.tap()
  else:loc.click()
 def layout(label):
  result=page.evaluate('({doc:document.documentElement.scrollWidth,view:innerWidth})')
  check(label+' / no horizontal overflow',result['doc']<=result['view']+1,str(result))
  out=page.locator('main button,main select,main textarea,main input,main summary').evaluate_all("els=>els.filter(e=>e.checkVisibility()).filter(e=>{const r=e.getBoundingClientRect();return r.left<-.5||r.right>innerWidth+1}).map(e=>e.id||e.textContent.slice(0,45))")
  check(label+' / controls within viewport',not out,str(out))
  if width in (390,1440):
   c=page.evaluate(CONTRAST);check(label+' / text contrast sample',not c['fail'],json.dumps(c))
  if width==390:
   small=page.locator('main button:not(:disabled), main select, main summary,main label.option,main label.checkline').evaluate_all("els=>els.filter(e=>e.checkVisibility()).filter(e=>{const r=e.getBoundingClientRect();return r.height<43.5||r.width<43.5}).map(e=>({id:e.id,text:e.innerText.slice(0,40),r:e.getBoundingClientRect().toJSON()}))")
   check(label+' / active touch targets at least 44px',not small,str(small))
 def snap(name):
  if width in(390,1440):page.screenshot(path=str(ROOT/'qa/screenshots'/f'{name}_{width}px.png'),full_page=True)
 try:
  page.set_content(HTML,wait_until='load');layout('Intro');snap('11_intro')
  click('[data-action=start]');layout('Worked');snap('12_worked')
  click('[data-action=practice]')
  for id,conclusion,reaction,response,pair,text in ANSWERS:
   layout(id+' initial')
   if id=='P01':snap('13_investigation')
   if id=='T01':snap('17_transfer')
   if pair:
    page.locator('#prediction').select_option('insufficient')
    for ev in pair:click(f'[data-action=reveal][data-id="{ev}"]')
    for ev in pair:click(f'#select-{ev}')
   click(f'#conclusion-{conclusion}')
   if reaction:page.locator('#reaction').select_option(reaction)
   if response:page.locator('#response').select_option(response)
   page.locator('#explanation').fill(text)
   click('[data-action=submit]');check(id+' / answer accepted',page.locator('#feedback-title').inner_text()=='Structured choices supported')
   layout(id+' feedback')
   if id=='P02':snap('14_rusting')
   if id=='P04':snap('15_combustion')
   for i in range(4):click(f'[data-rubric="{i}"]')
   click('[data-action=advance]')
  check('First-attempt transfer recorded honestly','Transfer: first structured answer supported' in page.locator('main').inner_text())
  layout('Review');snap('18_review')
  check('No runtime JS errors',not errors,str(errors));check('No external requests',not [r for r in requests if not r.startswith('data:')],str(requests))
 except Exception:
  rows.append({'test':'Harness','status':'FAIL','detail':traceback.format_exc()})
 finally:
  (ROOT/f'qa/responsive-{width}.json').write_text(json.dumps({'artifact_sha256':hashlib.sha256(HTML.encode()).hexdigest(),'width':width,'touch_emulation':width==390,'method':'Exact PLAY.html bytes, Chromium set_content; computed CSS contrast is a custom opaque/alpha background check, not a screen-reader or full WCAG audit.','tests':rows,'passed':sum(r['status']=='PASS' for r in rows),'failed':sum(r['status']=='FAIL' for r in rows)},indent=2))
  browser.close()
  print(width, sum(r['status']=='PASS' for r in rows),'passed;',sum(r['status']=='FAIL' for r in rows),'failed')
  if any(r['status']=='FAIL' for r in rows):print(rows[-2:])
 return all(r['status']=='PASS' for r in rows)
if __name__=='__main__':
 with sync_playwright() as p:results=[one(int(w),p) for w in sys.argv[1:] or ['390','1440']]
 sys.exit(0 if all(results) else 1)
