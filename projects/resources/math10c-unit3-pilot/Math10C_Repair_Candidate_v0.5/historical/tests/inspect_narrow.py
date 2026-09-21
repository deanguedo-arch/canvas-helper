from playwright.sync_api import sync_playwright
from assemble import ROOT,assemble
import json
mock='<script>window.s={};Object.defineProperty(window,"localStorage",{value:{getItem:k=>s[k]||null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k]}});</script>'
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);p=b.new_page(viewport={'width':320,'height':900});p.set_content(assemble().replace('<head>','<head>'+mock));p.wait_for_timeout(100);p.evaluate('location.hash="u3-transfer"');p.wait_for_timeout(100)
 print(p.evaluate('({w:innerWidth,sw:document.documentElement.scrollWidth,bad:[...document.querySelectorAll("body *")].filter(e=>{let r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+1&&getComputedStyle(e).position!=="fixed"}).map(e=>({tag:e.tagName,id:e.id,cl:e.className,rect:[e.getBoundingClientRect().left,e.getBoundingClientRect().width],text:e.textContent.slice(0,60)})).slice(0,25)})'))
 p.screenshot(path=str(ROOT/'evidence/narrow-debug.png'));b.close()
