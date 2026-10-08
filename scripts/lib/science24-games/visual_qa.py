"""Full-page comparison with original executable references; no learning panels masked."""
import argparse,functools,http.server,io,json,pathlib,sys,threading,os
sys.path.insert(0,'/tmp/reaction-detective-qa-python')
from playwright.sync_api import sync_playwright
from PIL import Image
import numpy as np
ROOT=pathlib.Path(__file__).resolve().parents[3];META=ROOT/'projects/science24-unit-a/meta/science24-games-v2';OUT=META/'validation/browser'
parser=argparse.ArgumentParser();parser.add_argument('--game');args=parser.parse_args()
suite=json.loads((META/'suite.json').read_text());source=json.loads((OUT/f'{args.game or "suite"}-visual-comparison.json').read_text())
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}/'
mapping={'title':'01','worked':'02','supported':'03','feedback':'04','reduced':'05','transfer':'06','review':'07'}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or ('/Users/deanguedo/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing' if pathlib.Path('/Users/deanguedo/Library/Caches/ms-playwright/chromium-1208').exists() else None),headless=True)
 for row in source['results']:
  g=next(g for g in suite['games'] if g['id']==row['game']);ref=next((META/'comparison-references'/g['id']/'04_MOCKUPS/html').glob(mapping[row['stage']]+'*.html'));page=b.new_page(viewport={'width':row['width'],'height':844 if row['width']==390 else 900});page.goto(base+str(ref.relative_to(ROOT)));page.add_style_tag(content='.btn,.numeric,select{min-height:44px}.numeric{height:44px}');page.wait_for_timeout(50)
  raw=page.screenshot(full_page=True);(OUT/f'{row["game"]}-reference-{row["stage"]}-{row["width"]}.png').write_bytes(raw)
  a=Image.open(OUT/f'{row["game"]}-{row["stage"]}-{row["width"]}.png').convert('RGB');r=Image.open(io.BytesIO(raw)).convert('RGB');size=(max(a.width,r.width),max(a.height,r.height));aa=Image.new('RGB',size,'white');rr=Image.new('RGB',size,'white');aa.paste(a,(0,0));rr.paste(r,(0,0));delta=np.max(np.abs(np.array(aa).astype('int16')-np.array(rr).astype('int16')),axis=2)
  row['viewportAgreementPercent']=row['pixelAgreementPercent'];row['pixelAgreementPercent']=round(float((delta<=10).mean()*100),4);row['runtimeFullPageSize']=list(a.size);row['referenceFullPageSize']=list(r.size);row['passed']=row['pixelAgreementPercent']>=99.25 and all(x['maxErrorPx']<=4 for x in row['geometry']);row['mask']='None. Full pages aligned at origin; missing page area padded white; 10-channel-unit pixel tolerance.';page.close()
 b.close()
server.shutdown();source['method']='Full-page, same Chromium, canonical 1440x900 and 390x844 viewports. Documented science/accessibility corrections applied to separate comparison copies. No masked learning panels or other pixels.';source['passed']=all(x['passed'] for x in source['results']);(OUT/f'{args.game or "suite"}-visual-comparison.json').write_text(json.dumps(source,indent=2)+'\n')
print('Visual exactness:',sum(x['passed'] for x in source['results']),'of',len(source['results']),'states meet both gates.');sys.exit(0 if source['passed'] else 1)
