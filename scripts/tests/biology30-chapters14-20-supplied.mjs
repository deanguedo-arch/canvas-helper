/** Run delivered interaction suites with the local Chromium binary; retain limits. */
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
const root=process.cwd(),python=process.env.BIOLOGY_PYTHON||'python3';let failed=false;
const wrapper='import os,sys,runpy\nfrom playwright.sync_api import BrowserType\noriginal=BrowserType.launch\nBrowserType.launch=lambda self,**kw:original(self,**{**kw,"executable_path":os.environ["BIOLOGY_CHROMIUM"]})\nrunpy.run_path(sys.argv[1],run_name="__main__")';
for(let ch=14;ch<=20;ch++){
 const owner=path.join(root,`projects/biology30-chapter-${ch}/meta/external-generation`),out=path.join(root,`projects/biology30-chapter-${ch}/meta/local-integration-verification`);await mkdir(out,{recursive:true});
 for(const [script,report]of [['verify_browser.py','browser-results.json'],['verify_additional.py','additional-browser-results.json'],['verify_final_smoke.py','final-smoke-results.json']]){
  const file=path.join(owner,'scripts',script);try{await access(file);}catch{continue;}
  let log='';try{log=execFileSync(python,['-c',wrapper,file],{cwd:owner,encoding:'utf8',env:{...process.env,BIOLOGY_CHROMIUM:chromium.executablePath()},maxBuffer:12e6,timeout:120000});}catch(e){log=e.stdout||e.message;failed=true;}
  await writeFile(path.join(out,script+'.log'),log);
  let r;try{r=JSON.parse(await readFile(path.join(owner,'verification',report),'utf8'));}catch(e){failed=true;console.error(`Chapter ${ch}: ${script} missing result`);continue;}
  const bad=(r.tests||[]).filter(t=>t.status!=='passed');if(r.exception||bad.length){failed=true;console.error(`Chapter ${ch}: ${script} failure`,r.exception||bad);}
  await writeFile(path.join(out,'supplied-'+report),JSON.stringify(r,null,2)+'\n');
  console.log(`Chapter ${ch} ${script}: ${r.tests?.length||0} checks; ${bad.length} failed${r.exception?'; exception':''}`);
 }
}
if(failed)process.exitCode=1;
