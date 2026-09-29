import os
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,time
from render_harness import navigate
out=Path(os.environ.get('MATH_AUDIT_OUT', str(Path(__file__).resolve().parent.parent/'rerun_results'))); out.mkdir(exist_ok=True)
base='http://127.0.0.1:8765/'
results={}
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 for ch in (3,4):
  context=browser.new_context(viewport={'width':1440,'height':1000}); page=context.new_page();errs=[]
  page.on('pageerror',lambda e,errs=errs:errs.append(str(e)))
  navigate(page,base+f'Chapter_{ch}/workspace/index.html',wait_until='networkidle')
  if ch==3: routes=['u3-32','u3-35','u3-support-library']
  else: routes=['u4-41','u4-43','u4-45','u4-practice','u4-errors','u4-support-library','u4-work']
  sections={}
  for route in routes:
   page.evaluate('(id)=>location.hash=id',route);page.wait_for_timeout(150)
   page.evaluate('window.scrollTo(0,0)')
   sections[route]={'visible':page.locator('#'+route).is_visible(),'text':page.locator('#'+route).inner_text()}
   page.screenshot(path=str(out/(route+'_desktop.png')),full_page=(route not in ['u3-support-library']))
  results[f'ch{ch}']={'errors':errs,'sections':sections}
  if ch==4:
   page.evaluate('location.hash="u4-43"');page.wait_for_timeout(100)
   raw=page.locator('[data-chapter4-task="43"]')
   # Correct, reordered polynomial monomial instead of listed serialization
   for k,v in {'product':'x^11','quotient':'y^6','zero':'1','restriction':'a!=0','combined':'4y^2x^3'}.items():raw.locator('[data-field="'+k+'"]').fill(v)
   raw.locator('[data-check-task]').click()
   results['normalization_correct_reordered_initial43']={'feedback':raw.locator('[data-task-feedback]').inner_text(),'state':page.evaluate('Chapter4MasteryReview.getState().tasks["43"]')}
   # fresh separate page, test built-in minus on negative exponent answer
   context2=browser.new_context(viewport={'width':1440,'height':1000});pg=context2.new_page();navigate(pg,base+'Chapter_4/workspace/index.html#u4-47',wait_until='networkidle')
   results['unicode_minus_checker']=pg.evaluate('''()=>{const a=Chapter4Checkers;let rows={}; for(const val of ['4x','4*x','4 x','4(x)']){const t=a.getTask('47','initial');const ans=Object.fromEntries(Object.entries(t.fields).map(([k,v])=>[k,v.answers[0]]));ans.simplify=val;rows[val]=a.checkTask('47',ans).fields.simplify;}return rows;}''')
   # 4.1 correct initial + transfer actual field inputs
   navigate(pg,base+'Chapter_4/workspace/index.html#u4-41',wait_until='networkidle')
   sec=pg.locator('[data-chapter4-task="41"]')
   def fillcorrect(variant):
    data=pg.evaluate('(v)=>Object.fromEntries(Object.entries(Chapter4Checkers.getTask("41",v).fields).map(([k,c])=>[k,c.answers[0]]))',variant)
    for k,v in data.items():
     field=sec.locator('[data-field="'+k+'"]')
     if field.evaluate('(e)=>e.tagName')=='SELECT':field.select_option(v)
     else:field.fill(v)
    sec.locator('[data-check-task]').click()
   fillcorrect('initial');results['stage_after_initial41']=pg.evaluate('Chapter4MasteryReview.getState().targetScores')
   sec.locator('[data-next-task]').click(); results['transfer41_prompt']=sec.inner_text();fillcorrect('transfer')
   results['stage_after_transfer41']={'scores':pg.evaluate('Chapter4MasteryReview.getState().targetScores'),'feedback':sec.locator('[data-task-feedback]').inner_text()}
   pg.screenshot(path=str(out/'u4_41_unmeasured_targets75.png'),full_page=True)
   # Incomplete but every filled response correct - an input help false downgrade
   navigate(pg,base+'Chapter_4/workspace/index.html#u4-42',wait_until='networkidle');s42=pg.locator('[data-chapter4-task="42"]');s42.locator('[data-field="coefficient"]').fill('3');s42.locator('[data-check-task]').click()
   results['blank_only_marks_support']={'state':pg.evaluate('Chapter4MasteryReview.getState().tasks["42"]'),'feedback':s42.locator('[data-task-feedback]').inner_text()}
   # Correct different order radical
   vals=pg.evaluate('''()=>{const a=Chapter4Checkers;return ['5sqrt3','5*sqrt(3)','sqrt(3)*5','5√3','√3*5'].map(v=>{const t=a.getTask('42','initial');const answers=Object.fromEntries(Object.entries(t.fields).map(([k,c])=>[k,c.answers[0]]));answers.mixed=v;return {value:v,result:a.checkTask('42',answers).fields.mixed}})}''')
   results['equivalent_radicals']=vals
   # practice mathematical equivalence rejected
   results['practice_semantics']=pg.evaluate('''()=>{let d=Chapter4PracticeData;return [['44c-1','(9/16)*m^2'],['44c-1','9m^2/16'],['44b-1','8b^6a^3'],['45c-1','3.375'],['46d-1','yes']].map(([id,response])=>({id,response,accepted:d.accepted(d.byId(id),response)}))}''')
   # Error wording good natural answer vs canned word
   navigate(pg,base+'Chapter_4/workspace/index.html#u4-errors',wait_until='networkidle');er=pg.locator('#error-set .practice-card')
   if not er.count(): er=pg.locator('[data-practice-surface="errors"] .practice-card')
   results['error_cards']=er.count()
   er.first.locator('input').fill('Compare 70 with 64 and 81, which are nearby perfect squares.')
   er.first.get_by_role('button',name='Check answer').click()
   results['valid_error_explanation_rejected']=er.first.inner_text()
   pg.screenshot(path=str(out/'u4_error_valid_explanation_rejected.png'),full_page=True)
   # mobile screenshot
   pg.set_viewport_size({'width':390,'height':844});navigate(pg,base+'Chapter_4/workspace/index.html#u4-43',wait_until='networkidle');
   results['mobile_overflow43']=pg.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
   pg.screenshot(path=str(out/'u4_43_mobile390.png'),full_page=True)
   context2.close()
  context.close()
 browser.close()
(out/'browser_probe.json').write_text(json.dumps(results,indent=2,ensure_ascii=False))
print(json.dumps({k:v for k,v in results.items() if k not in ['ch3','ch4']},indent=2,ensure_ascii=False))
