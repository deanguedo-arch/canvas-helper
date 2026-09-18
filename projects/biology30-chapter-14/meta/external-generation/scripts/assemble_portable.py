#!/usr/bin/env python3
"""Assemble a single offline chapter; embed each image once in an asset registry.
The registry only resolves images. It does not replace teaching or own storage.
"""
from pathlib import Path
import json,base64,mimetypes,re
from bs4 import BeautifulSoup
R=Path(__file__).resolve().parents[1];W=R/'workspace';P=R/'portable';P.mkdir(exist_ok=True)
s=BeautifulSoup((W/'index.html').read_text(),'html.parser');s.html['data-portable']=''
# CSS is copied byte-for-byte as text; only the wrapping tag changes.
for link in list(s.select('link[rel=stylesheet]')):
 path=W/link['href'];style=s.new_tag('style');style['data-inline-source']=link['href'];style.string=path.read_text();link.replace_with(style)
for script in s.select('script[src]'):
 src=script['src'];script.string=(W/src).read_text();script['data-inline-source']=src;del script['src']
C=json.loads(s.select_one('#course-data').string);M=json.loads(s.select_one('#textbook-practice-data').string)
paths=set()
def walk(o):
 if isinstance(o,dict):
  for k,v in o.items():
   if k=='src'and isinstance(v,str)and v.startswith(('./assets/','assets/'))and not v.endswith('.pdf'):paths.add(v)
   else:walk(v)
 elif isinstance(o,list):
  for v in o:walk(v)
walk(C);walk(M)
for img in s.select('img[src]'):
 src=img['src']
 if src.startswith(('./assets/','assets/')):paths.add(src)
records={}
for src in sorted(paths):
 path=W/src
 if not path.is_file():raise FileNotFoundError(path)
 mime=mimetypes.guess_type(path.name)[0]or'application/octet-stream'
 records[src]='data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
reg=s.new_tag('script',id='chapter-assets',type='application/json');reg.string=json.dumps(records,separators=(',',':'))
boot=s.new_tag('script');boot.string=r"""(()=>{'use strict';const assets=JSON.parse(document.getElementById('chapter-assets').textContent);const resolve=p=>assets[p]||assets['./'+String(p).replace(/^\.\//,'')]||p;window.BiologyChapterAssets=Object.freeze({resolve});document.querySelectorAll('img[src]').forEach(img=>{const p=img.getAttribute('src');if(assets[p])img.src=resolve(p);});})();"""
first=s.select_one('#textbook-practice-runtime');first.insert_before(reg);first.insert_before(boot)
# The library starts with a blank frame, filled from the embedded PDF by main.js.
s.select_one('[data-library-textbook]')['src']='about:blank'
for x in s.select('[data-library-fullscreen],[data-library-download]'):x['href']='#textbook-library'
out=P/'Biology30_Chapter14.html';out.write_text(str(s),encoding='utf8')
(R/'authoring/portable-assets.json').write_text(json.dumps({'images':len(records),'paths':sorted(paths),'bytes':out.stat().st_size},indent=2))
print(out, out.stat().st_size, 'bytes; assets',len(records))
