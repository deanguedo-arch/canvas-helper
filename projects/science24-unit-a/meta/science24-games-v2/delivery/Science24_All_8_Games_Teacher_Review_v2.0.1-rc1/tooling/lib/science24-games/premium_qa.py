"""Compare live worked presentations with the new user-supplied premium references.

The photographs, corrected science and live controls are deliberately NOT masked.
This conservative raw comparison does not manufacture visual acceptance.
"""
import argparse,datetime,hashlib,http.server,json,pathlib,sys,threading
import numpy as np
from PIL import Image
sys.path.insert(0,'/tmp/reaction-detective-qa-python')
from playwright.sync_api import sync_playwright
import os
ROOT=pathlib.Path(__file__).resolve().parents[3];META=ROOT/'projects/science24-unit-a/meta/science24-games-v2'
p=argparse.ArgumentParser();p.add_argument('--game');args=p.parse_args()
suite=json.loads((META/'suite.json').read_text());games=[g for g in suite['games'] if g['id']!='A1' and (not args.game or g['id']==args.game)]
if not games:raise SystemExit('No premium game selected')
OUT=META/'validation/browser';OUT.mkdir(parents=True,exist_ok=True)
reference_boxes={
 'A2':[(33,198,430,588),(480,198,701,588),(1196,198,444,588)],
 'B1':[(33,198,493,610),(540,198,651,610),(1207,198,432,610)],
 'B2':[(33,198,519,586),(567,198,537,586),(1119,198,521,586)],
 'C1':[(34,199,518,584),(568,199,536,584),(1119,199,520,584)],
 'C2':[(33,196,514,629),(563,196,597,629),(1174,196,466,629)],
 'D1':[(34,198,475,586),(524,198,620,586),(1160,198,480,586)],
 'D2':[(33,195,453,623),(502,195,654,623),(1172,195,467,623)]}
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def log_message(self,*a):pass
 def end_headers(self):self.send_header('Cache-Control','no-store');super().end_headers()
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler);threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}/'
chrome=os.environ.get('CHROMIUM') or '/Users/deanguedo/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
records=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,**({'executable_path':chrome} if pathlib.Path(chrome).exists() else {}))
 version=browser.version
 for g in games:
  page=browser.new_page(viewport={'width':1672,'height':941},reduced_motion='reduce')
  page.goto(base+g['canonical']+'/');page.wait_for_selector('[data-stage=brief]');page.locator('[data-action=start]').first.click();page.wait_for_selector('[data-stage=worked]');page.locator('.premium-photo').first.wait_for()
  page.evaluate('()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))')
  shot=OUT/(g['id']+'-premium-worked-1672.png');page.screenshot(path=str(shot),full_page=True,timeout=30000)
  reference=META/'premium-visual-v1/references'/(g['id']+'-premium-gameplay.png');actual=Image.open(shot).convert('RGB');ref=Image.open(reference).convert('RGB');w=max(actual.width,ref.width);height=max(actual.height,ref.height)
  a=Image.new('RGB',(w,height),'white');b=Image.new('RGB',(w,height),'white');a.paste(actual,(0,0));b.paste(ref,(0,0));delta=np.max(np.abs(np.array(a,dtype=np.int16)-np.array(b,dtype=np.int16)),axis=2);agreement=float(np.count_nonzero(delta<=10)/delta.size*100)
  geom=[];hb=page.locator('.course-header').bounding_box();geom.append({'selector':'.course-header','reference':[0,0,1672,78],'actual':hb,'maxErrorPx':round(max(abs(hb[k]-n) for k,n in zip(['x','y','width','height'],[0,0,1672,78])),2)})
  for i,expected in enumerate(reference_boxes[g['id']]):
   box=page.locator('.workspace > .panel').nth(i).bounding_box();geom.append({'selector':f'.workspace > .panel:nth-child({i+1})','reference':expected,'actual':box,'maxErrorPx':round(max(abs(box[k]-n) for k,n in zip(['x','y','width','height'],expected)),2)})
  records.append({'game':g['id'],'stage':'premium worked presentation','width':1672,'pixelAgreementPercent':round(agreement,4),'pixelThreshold':99.25,'geometryTolerancePx':4,'geometry':geom,'passed':agreement>=99.25 and all(x['maxErrorPx']<=4 for x in geom),'mask':'None; whole images including additional learner navigation and evidence; white padding at original origin','reference':str(reference.relative_to(ROOT)),'referenceSHA256':hashlib.sha256(reference.read_bytes()).hexdigest(),'actualScreenshot':str(shot.relative_to(ROOT)),'actualSHA256':hashlib.sha256(shot.read_bytes()).hexdigest(),'contentNote':'Preserved scenario values and corrected scientific text differ from the illustration. Clean generated photo plates and accessible controls are real implementation assets. These differences are documented; raw pixel agreement remains conservative.'})
  page.close()
 browser.close()
server.shutdown()
report={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'method':'New October 7 user premium PNG references vs actual Chromium worked presentations at the reference 1672x941 viewport; full-page image, no masks, 10-channel tolerance. Panel boxes measured from original references. No screenshot derived from this runtime is used as its acceptance baseline.','browser':'Chromium '+version,'mobileReference':'No independent mobile premium reference supplied; implementation snapshots and seven-width responsive checks are separate.','otherStates':'Title, feedback, transfer and mobile snapshots are implementation proposals; no independent premium reference supplied.','results':records,'passed':all(r['passed'] for r in records)}
(OUT/((args.game or 'suite')+'-visual-comparison.json')).write_text(json.dumps(report,indent=2)+'\n')
print('New premium raw visual gate:',sum(r['passed'] for r in records),'of',len(records),'meet both requirements; manual visual acceptance remains separate.')
raise SystemExit(0 if report['passed'] else 1)
