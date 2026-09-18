from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import json,base64,mimetypes,re,sys
B=Path(__file__).resolve().parent;OUT=Path(__file__).resolve().parents[2]
E=OUT/'developer/tests';E.mkdir(exist_ok=True,parents=True)
def inline_html(path):
 s=BeautifulSoup(path.read_text(),'html.parser')
 for x in list(s.select('link[rel=stylesheet]')):
  p=path.parent/x['href'];t=s.new_tag('style');t.string=p.read_text();x.replace_with(t)
 for x in list(s.select('script[src]')):x.decompose()
 for x in s.select('img[src]'):
  p=path.parent/x['src'];mime=mimetypes.guess_type(str(p))[0]or'application/octet-stream'
  if p.exists():x['src']='data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
 return str(s)
def start_page(browser,n=2,state=None,viewport=None,fail_storage=False):
 page=browser.new_page(viewport=viewport or {'width':1117,'height':902})
 page.set_default_timeout(5000)
 page.on('pageerror',lambda e:print('PAGEERROR',str(e)))
 page.route('**/*',lambda route:route.abort())
 d=OUT/f'sportswellness-phase-{n}'
 page.set_content(inline_html(d/'index.html'),wait_until='domcontentloaded')
 page.evaluate('''({initial,fail})=>{const data=initial||{};window.__testStore=data;Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.hasOwn(data,k)?data[k]:null,setItem:(k,v)=>{if(fail)throw new DOMException('Test quota failure','QuotaExceededError');data[k]=String(v)},removeItem:k=>delete data[k],clear:()=>Object.keys(data).forEach(k=>delete data[k]),key:i=>Object.keys(data)[i]||null,get length(){return Object.keys(data).length}}});}''',{'initial':state or {},'fail':fail_storage})
 page.add_script_tag(content=(d/'runtime.js').read_text())
 return page
if __name__=='__main__':
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=start_page(browser)
  print(page.evaluate('({ready:!!window.SportsWellness,active:document.querySelector(".chapter-section.active")?.id,buttons:document.querySelectorAll("button").length})'))
  page.screenshot(path=str(E/'phase2-desktop-overview.png'))
  page.evaluate("SportsWellness.navigate('effort-direction')")
  page.get_by_text('Jump to the activity ↓',exact=True).filter(visible=True).click() if False else page.locator('#effort-direction-jump a').click()
  page.locator('#p2-effort-direction-response').fill('Alex practises the setup. That is direction, not how much effort is applied.')
  page.evaluate("SportsWellness.navigate('process-collection')")
  print('work',page.locator('#process-summary').inner_text()[:450])
  page.evaluate("SportsWellness.navigate('playbook')")
  page.screenshot(path=str(E/'phase2-desktop-build.png'))
  page.set_viewport_size({'width':390,'height':844});page.evaluate("SportsWellness.navigate('motivation-reasons')")
  page.screenshot(path=str(E/'phase2-phone-lesson.png'))
  print('overflow',page.evaluate('({w:innerWidth,sw:document.documentElement.scrollWidth,heads:[...document.querySelectorAll(".chapter-section.active h2")].length})'))
  browser.close()
