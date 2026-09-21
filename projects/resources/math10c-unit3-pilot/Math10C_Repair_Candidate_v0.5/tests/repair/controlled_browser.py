"""Real Chromium DOM + unmodified emitted bridge; explicit storage/lock/API doubles.
Native Web Locks, actual origin navigation, Studio and LMS acceptance are NOT proved.
The host environment blocks URL navigation, including file and localhost URLs.
"""
from pathlib import Path
import re,base64,json
ROOT=Path(__file__).resolve().parents[2]
ENV=r'''(()=>{
 const env=window.__env={values:{},failRead:false,failWrite:false,writeCount:0,failAt:0,held:false,noLocks:false};
 const store={getItem(k){if(env.failRead)throw Error('Injected storage read failure');return Object.hasOwn(env.values,k)?env.values[k]:null;},setItem(k,v){env.writeCount++;if(env.failWrite||(env.failAt&&env.writeCount===env.failAt))throw Error('Injected quota failure');env.values[k]=String(v);},removeItem(k){delete env.values[k];},clear(){env.values={};},get length(){return Object.keys(env.values).length;},key(i){return Object.keys(env.values)[i]||null;}};
 Object.defineProperty(window,'localStorage',{configurable:true,value:store});
 const locks={request(name,options,callback){if(env.held)return Promise.resolve(callback(null));env.held=true;return Promise.resolve(callback({name,mode:'exclusive'})).finally(()=>{env.held=false;});}};
 Object.defineProperty(navigator,'locks',{configurable:true,value:locks});
})();'''
def html(managed=True,which='proposed',prelude='',body_override=None):
 w=ROOT/'workspace';text=body_override or (w/'index.html').read_text()
 text=re.sub(r'<link[^>]*href="(?:\./)?styles.css"[^>]*>',lambda m:'<style>'+(w/'styles.css').read_text()+'</style>',text)
 text=re.sub(r'<script[^>]*src="([^"]+)"[^>]*>\s*</script>',lambda m:'<script>'+(w/m[1]).read_text().replace('</script','<\\/script')+'</script>',text)
 text=text.replace('src="assets/nextstep.png"','src="data:image/png;base64,'+base64.b64encode((w/'assets/nextstep.png').read_bytes()).decode()+'"')
 idx=text.index('<script')
 scripts=ENV+prelude
 if managed:scripts+='\n'+(ROOT/'tests/repair/lms_harness.js').read_text()+'\n'+(ROOT/f'tests/repair/runtime/bridge-{which}.js').read_text()
 return text[:idx]+'<script>'+scripts.replace('</script','<\\/script')+'</script>'+text[idx:]
def load(page,managed=True,which='proposed',prelude=''):
 page.set_content(html(managed,which,prelude),wait_until='domcontentloaded',timeout=7000);page.wait_for_function('window.Unit3Debug !== undefined',timeout=7000);page.wait_for_timeout(150)
