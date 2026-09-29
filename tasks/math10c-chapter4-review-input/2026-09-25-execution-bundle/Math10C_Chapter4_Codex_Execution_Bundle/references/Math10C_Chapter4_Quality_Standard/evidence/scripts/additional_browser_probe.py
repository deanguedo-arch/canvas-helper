import os
from playwright.sync_api import sync_playwright
from pathlib import Path
from render_harness import navigate
import json
out=Path(os.environ.get('MATH_AUDIT_OUT', str(Path(__file__).resolve().parent.parent/'rerun_results')));results={}
out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 # four wrong checks while every other field is correct
 c=b.new_context(viewport={'width':1440,'height':1000});pg=c.new_page();navigate(pg,'Chapter_4/workspace/index.html#u4-41')
 sec=pg.locator('[data-chapter4-task="41"]');answers=pg.evaluate('Object.fromEntries(Object.entries(Chapter4Checkers.tasks["41"].fields).map(([k,v])=>[k,v.answers[0]]))');answers['exact']='99'
 for k,v in answers.items():
  f=sec.locator('[data-field="'+k+'"]')
  if f.evaluate('(e)=>e.tagName')=='SELECT':f.select_option(v)
  else:f.fill(v)
 for _ in range(4):sec.locator('[data-check-task]').click()
 results['four_incorrect_checks']={'state':pg.evaluate('Chapter4MasteryReview.getState().tasks["41"]'),'feedback':sec.locator('[data-task-feedback]').inner_text(),'nextVisible':sec.locator('[data-next-task]').is_visible(),'helpDisabled':sec.locator('[data-help-task]').is_disabled()}
 pg.screenshot(path=str(out/'u4_four_checks_no_next.png'),full_page=True);c.close()
 # exposed radical mathematics in practice and mastery not linked
 c=b.new_context();pg=c.new_page();navigate(pg,'Chapter_4/workspace/index.html#u4-practice')
 pg.locator('#practice-lesson').select_option('41')
 # first practice question is sqrt196, same component as fresh2 mastery
 first=pg.locator('#practice-set .practice-card').first; first.locator('input').fill('14');first.get_by_role('button',name='Check answer').click()
 results['cross_route_exposure_state']={'practice':pg.evaluate('Chapter4PracticeReview.getState()'),'mastery':pg.evaluate('Chapter4MasteryReview.getState()')}
 # review set coverage in two displayed rotations
 results['review_two_set_coverage']=pg.evaluate('''()=>{let d=Chapter4PracticeData;const a=d.reviewSet(0),b=d.reviewSet(1),c=d.reviewSet(2);return {set0:a.map(q=>q.target),set1:b.map(q=>q.target),set2:c.map(q=>q.target),unique01:new Set([...a,...b].map(q=>q.target)).size,unique12:new Set([...b,...c].map(q=>q.target)).size,overlap01:a.filter(q=>b.some(x=>x.id===q.id)).map(q=>q.id)}}''')
 results['practice_two_sets']=pg.evaluate('''()=>{let d=Chapter4PracticeData;return Object.keys(d.banks).map(id=>{let a=d.lessonSet(id,0,5),b=d.lessonSet(id,1,5);return {lesson:id,questions:d.banks[id].length,overlap:a.filter(q=>b.some(x=>x.id===q.id)).map(q=>q.id),uniqueAcross10Sets:new Set(Array.from({length:10},(_,i)=>d.lessonSet(id,i,5)).flat().map(q=>q.id)).size}})}''')
 # feedback for typographical/math distinction repeat use
 results['mixed_cues']=pg.locator('#mixed-set').inner_text() if pg.locator('#mixed-set').count() else 'see DOM'
 # exponent domain loss on originally negative exponents, teaching tool
 navigate(pg,'Chapter_4/workspace/index.html#u4-exponent-lab');pg.locator('#law-first').fill('-2');pg.locator('#law-operation').select_option('product');pg.locator('#law-second').fill('2');pg.locator('#law-build').click()
 results['exponent_domain_lost']=pg.locator('#law-output').inner_text()
 c.close();b.close()
(out/'additional_browser_probe.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print(json.dumps({k:v for k,v in results.items() if k not in ['cross_route_exposure_state','mixed_cues']},ensure_ascii=False,indent=2))
