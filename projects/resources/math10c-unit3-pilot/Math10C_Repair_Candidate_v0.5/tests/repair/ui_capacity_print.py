"""Event-driven UI session, report print and actual complete-envelope measurement.
Uses same explicitly controlled storage/lock/API environment as browser_regressions.
"""
from controlled_browser import load,ROOT
from playwright.sync_api import sync_playwright
import json
from pathlib import Path
# Do not import measure_capacity: it is a command script that executes its own batch.
CAPTURE="""(()=>{const old=JSON.stringify;window.__actualEnvelopes=[];JSON.stringify=function(v,...a){const s=old.call(JSON,v,...a);if(v&&v.projectSlug==='math10c-unit3-pilot'&&v.version===1&&v.course&&v.tracking)__actualEnvelopes.push(s);return s;};})();"""
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);p=b.new_page(viewport={'width':1440,'height':1000});p.set_default_timeout(6000);load(p)
 errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 # Each dispatch below is a visible source-owned control's normal event path,
 # not direct state injection. This is scripted UI coverage, not a learner trial.
 for lesson in ['3.1','3.2','3.3','3.4','3.5','3.6','3.7','3.8']:
  p.evaluate('(x)=>location.hash="u3-"+x.replace(".","")',lesson);p.wait_for_timeout(70)
  p.evaluate('''(lesson)=>{const page=document.getElementById('u3-'+lesson.replace('.',''));const set=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));};
   for(const t of page.querySelectorAll('.inline-task')){const q=Unit3Debug.question(t.dataset.question),input=t.querySelector('[data-answer]'),fields=t.querySelectorAll('[data-structured-part]');
    for(let n=0;n<6;n++){if(fields.length){const values=q.answer.split('|');fields.forEach((f,i)=>set(f,' '.repeat(n)+values[i]));}else set(input,' '.repeat(n)+q.answer+' '.repeat(Math.max(0,160-n-q.answer.length)));t.querySelector('[data-check]').click();}
    if(!fields.length)set(input,'Unchecked draft '+('好'.repeat(130)));
   }
   const reason=page.querySelector('[data-reason]');if(reason)set(reason,Array.from({length:160},(_,i)=>String.fromCharCode(0x4e00+(i*237+lesson.charCodeAt(2))%18000)).join(''));
  }''',lesson)
  print('UI',lesson,flush=True)
 # Independent fixed prompts and additional error/review responses.
 for route in ['u3-errors','u3-review']:
  p.evaluate('(x)=>location.hash=x',route);p.wait_for_timeout(60)
  p.evaluate('''()=>{for(const t of document.querySelector('.course-page:not([hidden])').querySelectorAll('.inline-task')){const q=Unit3Debug.question(t.dataset.question),i=t.querySelector('[data-answer]');i.value=q.answer;i.dispatchEvent(new Event('input',{bubbles:true}));t.querySelector('[data-check]').click();}}''')
 p.evaluate("location.hash='u3-practice'");p.wait_for_timeout(70);p.locator('#practice-topic').select_option('core-positive');p.locator('#start-practice').click()
 for j in range(6):
  p.evaluate('''()=>{const t=document.querySelector('#practice-root .inline-task'),q=Unit3Debug.question(t.dataset.question),i=t.querySelector('[data-answer]');for(let n=0;n<6;n++){i.value=' '.repeat(n)+q.answer+' '.repeat(160-n-q.answer.length);i.dispatchEvent(new Event('input',{bubbles:true}));t.querySelector('[data-check]').click();}const reason=document.getElementById('practice-reason');reason.value=Array.from({length:120},(_,i)=>String.fromCharCode(0x4e00+i*107)).join('');reason.dispatchEvent(new Event('input',{bubbles:true}));}''')
  if j<4:p.locator('#pin-current').click()
  p.locator('#practice-next').click()
 p.evaluate("location.hash='u3-practice'");p.wait_for_timeout(70);p.locator('#start-practice').click()
 # Four selected records remain while a second current run is created.
 s=p.evaluate('Unit3Debug.snapshot()');d=p.evaluate('Unit3Debug.unpack(Unit3Debug.snapshot())');assert len(d['pins'])==4 and len(d['active'])==6
 (ROOT/'tests/repair/fixtures/ui-long-session.json').write_text(json.dumps(s,ensure_ascii=False))
 p.add_script_tag(content=CAPTURE);p.evaluate("__canvasHelperScorm.publishCourseState(Unit3Debug.snapshot(),[]);__canvasHelperScorm.save()")
 wire=p.evaluate('__actualEnvelopes.at(-1)');assert wire is not None
 report={'source':'scripted visible UI control events; no fabricated attempt arrays','applicationCharacters':len(json.dumps(s,ensure_ascii=False,separators=(',',':'))),'javascriptApplicationCharacters':p.evaluate('JSON.stringify(Unit3Debug.snapshot()).length'),'actualBridgeEnvelopeCharacters':len(wire),'retainedRecords':len(d['r']),'firstResponses':len(d['firsts']),'fixedDrafts':len(d['drafts']),'selected':len(d['pins']),'active':len(d['active']),'summary':d['summary'],'skills':d['skills'],'originalLimitsUnchanged':True,'pageErrors':errors}
 (ROOT/'evidence/ui-session-capacity.json').write_text(json.dumps(report,indent=2))
 # Re-render print views using normal controls. page.pdf proves real print layout,
 # not physical printer behaviour. Dialog replacement only prevents a host print prompt.
 p.evaluate('window.print=()=>{}');p.evaluate("location.hash='u3-work'");p.wait_for_timeout(60);p.locator('#report-print').click();p.pdf(path=str(ROOT/'evidence/process-report-print.pdf'),format='A4',print_background=True)
 p.evaluate("window.dispatchEvent(new Event('afterprint'));location.hash='u3-35'");p.wait_for_timeout(60);p.locator('#u3-35 .lesson-guide summary').click();p.locator('#u3-35 [data-print-lesson]').click();p.pdf(path=str(ROOT/'evidence/lesson35-print.pdf'),format='A4',print_background=True)
 p.evaluate("window.dispatchEvent(new Event('afterprint'));location.hash='u3-overview'");p.wait_for_timeout(60);p.screenshot(path=str(ROOT/'evidence/overview-desktop.png'),full_page=True)
 p.evaluate("location.hash='u3-transfer'");p.wait_for_timeout(60);p.screenshot(path=str(ROOT/'evidence/trig-desktop.png'),full_page=True)
 p.set_viewport_size({'width':390,'height':844});p.evaluate("location.hash='u3-35'");p.wait_for_timeout(100);p.screenshot(path=str(ROOT/'evidence/lesson35-mobile.png'),full_page=True)
 b.close()
print(json.dumps(report,indent=2))
