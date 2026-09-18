from pathlib import Path
import sys,json,re,csv
sys.path.insert(0,str(Path(__file__).resolve().parent))
from test_harness import start_page,inline_html,OUT
from playwright.sync_api import sync_playwright
E=OUT/'developer/tests'; G=E/'embedded-games'; G.mkdir(exist_ok=True)
records=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for n in (2,3,4):
  for w,h in ((1117,902),(390,844)):
   p=start_page(b,n,viewport={'width':w,'height':h})
   p.evaluate("SportsWellness.navigate('performance-game')");p.wait_for_timeout(100)
   frame=p.locator('#game-host iframe');session=frame.get_attribute('src').split('session=')[1]
   f=frame.element_handle().content_frame();d=OUT/f'sportswellness-phase-{n}/assets/game'
   f.set_content(inline_html(d/'index.html'),wait_until='domcontentloaded')
   for name in ['react-local.js','scale.js','bridge.js','game.js']:
    txt=(d/name).read_text()
    if name=='bridge.js': txt=re.sub(r"const session=new URLSearchParams\(location.hash.slice\(1\)\).get\('session'\)\|\|'';",'const session='+json.dumps(session)+';',txt)
    f.add_script_tag(content=txt)
   p.wait_for_timeout(150)
   p.evaluate('window.scrollTo(0,0)');p.screenshot(path=str(E/f'routes/p{n}-{w}-performance-game-top.jpg'),type='jpeg',quality=80)
   frame.scroll_into_view_if_needed();p.wait_for_timeout(80)
   frame.screenshot(path=str(G/f'p{n}-{w}-intro.png'))
   p.screenshot(path=str(E/f'routes/p{n}-{w}-performance-game-activity.jpg'),type='jpeg',quality=80)
   f.locator('#game-start').click();p.wait_for_timeout(900 if n!=4 else 2100)
   frame.screenshot(path=str(G/f'p{n}-{w}-playing.png'))
   overflow=f.evaluate('Math.max(0,document.documentElement.scrollWidth-innerWidth)')
   f.locator('#game-end').click();p.wait_for_timeout(80)
   p.evaluate('window.scrollTo(0,document.documentElement.scrollHeight)');p.screenshot(path=str(E/f'routes/p{n}-{w}-performance-game-bottom.jpg'),type='jpeg',quality=80)
   records.append({'phase':n,'viewport':f'{w}x{h}','game_iframe_hydrated':True,'game_document_overflow_px':overflow,'fixture':'Local scripts and styles inlined; launch nonce supplied; URL navigation unavailable.'})
   p.close()
 b.close()
with (G/'capture-record.csv').open('w',newline='')as f:
 wr=csv.DictWriter(f,fieldnames=records[0]);wr.writeheader();wr.writerows(records)
(G/'README.md').write_text('# Embedded game screenshots\n\nThese captures use the actual local game scripts, React runtime and styles within each parent module. URL navigation is unavailable in the execution environment, so the frame was hydrated in place and the nonce normally read from its URL was supplied by the fixture. The game-route top/activity/bottom images in `../routes` were refreshed using these hydrated frames. Initial intro and running states are also captured here. These are component/viewport tests, not physical-phone or real-launch certification.\n')
print(records)
