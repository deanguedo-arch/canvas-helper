import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
from assemble import assemble,ROOT
MOCK='''<script>window.__testStore={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.hasOwn(__testStore,k)?__testStore[k]:null,setItem:(k,v)=>{__testStore[k]=String(v)},removeItem:k=>delete __testStore[k]}});</script>'''
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  pg=await b.new_page(viewport={'width':1440,'height':960});errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
  await pg.set_content(assemble().replace('<head>','<head>'+MOCK),wait_until='load')
  await pg.wait_for_timeout(300)
  print('errors',errors,'save',await pg.locator('#save-message').inner_text())
  print('statechars',await pg.evaluate('Unit3Debug.stateChars()'))
  await pg.screenshot(path=str(ROOT/'evidence/overview-desktop.png'),full_page=False)
  await pg.locator('a.nav-link[href="#u3-35"]').click(); await pg.locator('#u3-35 input[data-answer="g35"]').fill('x^2+3x+4x+12')
  await pg.locator('#u3-35 button[data-check="g35"]').click()
  print('M09 feedback',await pg.locator('#u3-35 [data-feedback="g35"]').inner_text())
  print('post errors',errors,await pg.locator('#save-message').inner_text())
  (ROOT/'evidence/smoke-errors.json').write_text(json.dumps(errors))
  await b.close()
asyncio.run(main())
