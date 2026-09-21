"""Optional real-library smoke procedure, NOT a mock-based acceptance test.
Supply MATHLIVE_DIST pointing to an independently obtained 0.110.0 directory
with package.json, mathlive.min.js and fonts. No dependency is downloaded by
this script, no font files are copied into the candidate, no CDN fallback.
This is still not an assistive-technology or physical-keyboard acceptance.
"""
from pathlib import Path
import os,json,sys,http.server,threading
from playwright.sync_api import sync_playwright
from browser_env import ROOT
result={'command':'MATHLIVE_DIST=/absolute/local/mathlive python tests/repair/mathlive_local_spike.py','cases':['ACCESS-05'],'result':'not_run','requiredVersion':'0.110.0','dependencyBundled':False}
try:
 location=os.environ.get('MATHLIVE_DIST')
 if not location:raise FileNotFoundError('MATHLIVE_DIST is not supplied; the real pinned dependency is absent. No acquisition or mock substitution was performed by this test.')
 vendor=Path(location).resolve();package=json.loads((vendor/'package.json').read_text())
 if package.get('version')!='0.110.0':raise RuntimeError('Refusing an unpinned MathLive version')
 if not (vendor/'mathlive.min.js').is_file() or not (vendor/'fonts').is_dir():raise FileNotFoundError('Local library and its local fonts are required for the real spike')
 class Handler(http.server.SimpleHTTPRequestHandler):
  def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
  def log_message(self,*a):pass
  def do_GET(self):
   if self.path.startswith('/vendor/'):
    path=(vendor/self.path.removeprefix('/vendor/').split('?')[0]).resolve()
    if not path.is_relative_to(vendor) or not path.is_file():self.send_error(404);return
    self.send_response(200);self.send_header('Content-Type',self.guess_type(str(path)));self.end_headers();self.wfile.write(path.read_bytes());return
   if self.path=='/spike':
    h=(ROOT/'workspace/index.html').read_text().replace('<head>','<head><base href="/workspace/">',1)
    at=h.index('<script');h=h[:at]+'<script src="/vendor/mathlive.min.js"></script><script>window.MATHLIVE_SPIKE_ENABLED=true;</script>'+h[at:]
    self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.end_headers();self.wfile.write(h.encode());return
   super().do_GET()
 http=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler);thread=threading.Thread(target=http.serve_forever,daemon=True);thread.start();url=f'http://127.0.0.1:{http.server_port}'
 try:
  with sync_playwright() as pw:
   browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox']);page=browser.new_page(viewport={'width':390,'height':844});external=[];errors=[]
   def guard(route):
    if route.request.url.startswith(url+'/'):route.continue_()
    else:external.append(route.request.url);route.abort()
   page.route('**/*',guard);page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(url+'/spike',wait_until='domcontentloaded',timeout=10000);page.wait_for_function('window.Unit3Debug&&Unit3Debug.ready()',timeout=10000)
   page.evaluate("location.hash='u3-35'");task=page.locator('.inline-task[data-question="g35"]');native=task.locator('[data-answer]');native.fill('x^2+3x+4x+12')
   toggle=task.locator('.math-input-toggle');toggle.click();field=task.locator('math-field');field.evaluate("e=>{e.value='x^2+3x+4x+12';e.dispatchEvent(new Event('input',{bubbles:true}));}")
   assert native.input_value()=='x^2+3x+4x+12';toggle.click();assert native.is_visible();assert native.input_value()=='x^2+3x+4x+12'
   assert not external, f'Unexpected external requests: {external}'
   assert not errors, f'Library or adapter errors: {errors}'
   result.update(result='passed',externalRequests=external,errors=errors,limitations=['Programmatic editor input, not physical virtual-keyboard or AT proof','SCORM/Studio iframe CSP and lifecycle still require integration gate'])
   browser.close()
 finally:http.shutdown();http.server_close()
except (FileNotFoundError,PermissionError) as e:result.update(result='blocked',detail=str(e))
except Exception as e:result.update(result='blocked' if 'ERR_BLOCKED_BY_ADMINISTRATOR' in str(e) else 'failed',detail=str(e)[:1500])
(ROOT/'evidence/mathlive-spike-gate.json').write_text(json.dumps(result,indent=2));print(json.dumps(result));sys.exit(0 if result['result']=='passed' else 2 if result['result']=='blocked' else 1)
