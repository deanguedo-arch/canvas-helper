from pathlib import Path
from bs4 import BeautifulSoup
import sys,json,csv,re
sys.path.insert(0,str(Path(__file__).resolve().parent))
from test_harness import start_page,inline_html,OUT
from verify_modules import dumpcsv
E=OUT/'developer/tests';R=OUT/'developer/reference/phase1-uploaded'
rows=[];geos=[]
with __import__('playwright.sync_api',fromlist=['sync_playwright']).sync_playwright()as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for n in(list(map(int,sys.argv[1:]))or[2,3,4]):
  p=start_page(b,n);errs=[];p.on('pageerror',lambda e:errs.append(str(e)))
  def rec(t,ok,detail=''):rows.append({'phase':n,'test':t,'result':'PASS'if ok else'FAIL','detail':detail})
  try:
   # Test browser history operations in the in-memory document; not URL launch.
   p.evaluate("SportsWellness.navigate('playbook')");p.wait_for_timeout(80);p.evaluate("SportsWellness.navigate('phase-review')");p.wait_for_timeout(80);p.evaluate('history.back()');p.wait_for_timeout(100);rec('Hash Back uses single route owner',p.locator('.chapter-section.active').get_attribute('id')=='playbook')
   p.evaluate('history.forward()');p.wait_for_timeout(100);rec('Hash Forward returns to review',p.locator('.chapter-section.active').get_attribute('id')=='phase-review')
   p.locator('#school-sidebar-toggle').click();p.wait_for_timeout(80);rec('Collapsed sidebar has visible reopen control',p.locator('#contents-toggle').is_visible());p.locator('#contents-toggle').click();rec('Reopen desktop sidebar',not p.evaluate("document.documentElement.classList.contains('nav-collapsed')"))
   p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(250);p.locator('#contents-toggle').click();p.wait_for_timeout(200);rec('Mobile menu opens',p.evaluate("document.documentElement.classList.contains('nav-open')"));p.keyboard.press('Escape');p.wait_for_timeout(160);rec('Escape closes drawer and returns focus',not p.evaluate("document.documentElement.classList.contains('nav-open')") and p.evaluate('document.activeElement.id')=='contents-toggle')
   p.set_viewport_size({'width':1117,'height':902});p.wait_for_timeout(200)
   p.evaluate("SportsWellness.navigate('performance-game')");p.wait_for_timeout(100);iframe=p.locator('#game-host iframe');src=iframe.get_attribute('src');session=src.split('session=')[1];f=iframe.element_handle().content_frame();d=OUT/f'sportswellness-phase-{n}/assets/game'
   f.set_content(inline_html(d/'index.html'),wait_until='domcontentloaded')
   for name in['react-local.js','scale.js','bridge.js','game.js']:
    text=(d/name).read_text()
    if name=='bridge.js':text=re.sub(r"const session=new URLSearchParams\(location.hash.slice\(1\)\).get\('session'\)\|\|'';",'const session='+json.dumps(session)+';',text)
    f.add_script_tag(content=text)
   p.wait_for_timeout(200);f.locator('#game-start').focus();p.keyboard.press('Enter');p.wait_for_timeout(300);rec('Embedded game starts via Enter',f.evaluate("CourseGameBridge.diagnostics().state==='playing'"))
   if n==3:
    ball=f.locator('[role=button]').first;ball.focus();p.keyboard.press('Enter');p.wait_for_timeout(60)
    rec('Moving ball keyboard handler active','Mistimed' in f.locator('#root').inner_text() or 'timing' in f.locator('#root').inner_text().lower(), 'Activation tested, not a winning-strategy certification.')
   if n==4:
    f.locator('button').filter(has_text=re.compile(r'^(Approve|Lockdown)$')).first.wait_for(state='visible',timeout=4000)
    before=f.locator('#root').inner_text();btn=f.locator('button').filter(has_text=re.compile(r'^(Approve|Lockdown)$')).first;btn.focus();p.keyboard.press('Enter');p.wait_for_timeout(100);after=f.locator('#root').inner_text();rec('Moving statement card activates via Enter',before!=after,'Original round remained running; no timer freeze fixture used.')
   f.locator('#game-pause').click();p.wait_for_timeout(60);a=f.evaluate('CourseGameBridge.diagnostics()');p.wait_for_timeout(200);c=f.evaluate('CourseGameBridge.diagnostics()');rec('Pause stops virtual game time',a['state']=='paused' and a['now']==c['now']);f.locator('#game-resume').click();p.wait_for_timeout(80);rec('Resume restarts play',f.evaluate("CourseGameBridge.diagnostics().state==='playing'"));f.locator('#game-end').click();p.wait_for_timeout(130);rec('Embedded ended summary reaches My Work state',len(p.evaluate('SportsWellness.getState().game.attempts'))==1)
   f.locator('#game-restart').click();p.wait_for_timeout(150);rec('Ended game can restart',f.evaluate("CourseGameBridge.diagnostics().state==='playing'"));p.evaluate("SportsWellness.navigate('start')");p.wait_for_timeout(150);recs=p.evaluate('SportsWellness.getState().game.attempts');rec('Topic exit stops game and saves interrupted summary',len(recs)==2 and recs[-1]['status']=='interrupted' and f.evaluate("CourseGameBridge.diagnostics().state==='ended'"))
   rec('No game runtime exceptions',not errs,str(errs));p.close()
  except Exception as x:
   rec('Supplemental harness execution',False,str(x));print('ERROR',n,str(x));p.close()
 # Freeze-reference computed-style comparison (available upload only).
 metricsjs='''()=>{const sels={body:'body',header:'.school-topbar',sidebar:'.sidebar',reading:'.reading-area',heading:'.chapter-section.active .topic-heading',title:'.chapter-section.active h2',guide:'.chapter-section.active .section-completion-guide',lesson:'.chapter-section.active .lesson-block',button:'.chapter-section.active .solid-button'};return Object.fromEntries(Object.entries(sels).map(([k,s])=>{const e=document.querySelector(s);if(!e)return[k,null];const c=getComputedStyle(e);return[k,{font:c.fontFamily,size:c.fontSize,weight:c.fontWeight,lineHeight:c.lineHeight,paddingLeft:c.paddingLeft,paddingRight:c.paddingRight,width:c.width,height:k==='header'?c.height:null,minHeight:c.minHeight,bg:c.backgroundColor,display:c.display}]}));}'''
 for width,height in[(1440,900),(1117,902),(1024,902),(1023,902),(768,1024),(430,900),(390,844)]:
  ref=b.new_page(viewport={'width':width,'height':height});ref.route('**/*',lambda r:r.abort());ref.set_content(inline_html(R/'index.html'),wait_until='domcontentloaded');ref.evaluate("document.documentElement.classList.add('enhanced');document.querySelectorAll('.chapter-section').forEach(e=>e.classList.toggle('active',e.id==='key-terms'));");ref.wait_for_timeout(100);rm=ref.evaluate(metricsjs)
  for n in(2,3,4):
   p=start_page(b,n,viewport={'width':width,'height':height});route=json.loads((OUT/f'sportswellness-phase-{n}/review/phase-config.json').read_text())['topics'][1];p.evaluate('(r)=>SportsWellness.navigate(r)',route);p.wait_for_timeout(180);m=p.evaluate(metricsjs)
   diffs={}
   for component in rm:
    if rm[component] is None or m[component] is None:continue
    delta={k:{'reference':v,'module':m[component][k]}for k,v in rm[component].items()if m[component][k]!=v}
    if delta:diffs[component]=delta
   geos.append({'phase':n,'viewport':f'{width}x{height}','available_reference_style_match':not diffs,'differences':json.dumps(diffs),'document_overflow_px':p.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)'),'latest_local_reference':'unavailable; no exact-current claim'})
   if n==2 and width in[1024,1023,768]:p.screenshot(path=str(E/f'p2-breakpoint-{width}.png'))
   p.close()
  ref.close()
 b.close()
dumpcsv(E/'supplemental-interaction-results.csv',rows);dumpcsv(E/'visual-geometry-comparison.csv',geos);print('supplemental',len(rows),[r for r in rows if r['result']!='PASS']);print('geometry',len(geos),'differences',sum(not r['available_reference_style_match']for r in geos))
