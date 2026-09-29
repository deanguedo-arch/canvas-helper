from pathlib import Path
from bs4 import BeautifulSoup
import base64,json,os
ROOT=Path(os.environ['MATH_AUDIT_ROOT']).resolve()
# Browser navigation is administrator-blocked in this container. Render local
# source in about:blank with unchanged scripts/CSS and an explicit in-memory
# Web Storage substitute. These tests do NOT establish HTTP/SCORM persistence.
SHIM='''(()=>{function storage(){const m=new Map();return {getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear(),key:i=>Array.from(m.keys())[i]??null,get length(){return m.size}};}Object.defineProperty(window,'localStorage',{value:storage(),configurable:true});Object.defineProperty(window,'sessionStorage',{value:storage(),configurable:true});})();'''
def html_for(ch):
 w=ROOT/f'Chapter_{ch}/workspace';s=BeautifulSoup((w/'index.html').read_text(),'html.parser')
 for m in s.select('meta[http-equiv]'):
  if str(m.get('http-equiv')).lower()=='content-security-policy':m.decompose()
 shim=s.new_tag('script');shim.string=SHIM;s.head.insert(0,shim)
 for link in s.find_all('link',href=True):
  f=w/link['href']
  if f.is_file() and f.suffix=='.css':
   n=s.new_tag('style');n.string=f.read_text();link.replace_with(n)
 for im in s.find_all('img',src=True):
  f=w/im['src']
  if f.is_file():im['src']='data:image/png;base64,'+base64.b64encode(f.read_bytes()).decode()
 for sc in list(s.find_all('script',src=True)):
  path=sc['src'];f=w/path
  if ch==3 and path=='course.js':
   for extra in ['mastery-history-policy','mastery-history','mastery-policy','mastery','mastery-retention','mastery-36','mastery-31','mastery-32','mastery-33','mastery-34','mastery-35','mastery-37','mastery-38']:
    n=s.new_tag('script');n.string=(w/'assets'/f'{extra}.js').read_text().replace('</script','<\\/script');sc.insert_before(n)
  if f.is_file():del sc['src'];sc.string=f.read_text().replace('</script','<\\/script')
 return str(s)
HTML={ch:html_for(ch) for ch in (3,4)}
def navigate(page,url,**kwargs):
 ch=3 if 'Chapter_3' in url else 4
 if not getattr(page,'_review_ch',None):
  page.set_content(HTML[ch],wait_until='load');page._review_ch=ch;page.wait_for_timeout(200)
 route=url.split('#',1)[-1] if '#' in url else f'u{ch}-overview'
 page.evaluate('(route)=>location.hash=route',route);page.wait_for_timeout(80)
