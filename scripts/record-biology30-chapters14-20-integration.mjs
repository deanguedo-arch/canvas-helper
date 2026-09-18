/** Record the completed local integration without promoting imported courses. */
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
let native=0,supplied=0;
for(let ch=14;ch<=20;ch++){
 const base=`projects/biology30-chapter-${ch}`,out=`${base}/meta/local-integration-verification`;
 const r=await read(`${out}/real-origin-results.json`);
 if(r.tests.length!==19||r.tests.some(t=>t.status!=='passed'))throw Error(`Chapter ${ch}: native checks incomplete`);
 native+=r.tests.length;
 const reports=['browser-results.json','additional-browser-results.json',...(ch===14?[]:['final-smoke-results.json'])];
 let count=0;
 for(const name of reports){const s=await read(`${out}/supplied-${name}`);if(s.exception||s.tests.some(t=>t.status!=='passed'))throw Error(`Chapter ${ch}: supplied checks failed`);count+=s.tests.length;}
 supplied+=count;
 const receipt=await read(`${base}/meta/integration-receipt.json`);
 for(const [file,expected]of Object.entries(receipt.styleHashes))if(sha(await readFile(`${base}/workspace/${file}`))!==expected)throw Error(`Chapter ${ch}: style drift`);
 if(sha(await readFile(`${base}/workspace/index.html`))!==receipt.workspaceHtmlSha256||sha(await readFile(`${base}/workspace/portable/Biology30_Chapter${ch}.html`))!==receipt.portableSha256)throw Error(`Chapter ${ch}: stale assembly receipt`);
 receipt.status='local-integrated-verified';receipt.verifiedAt=new Date().toISOString();
 receipt.verification={nativeOriginGroups:r.tests.length,suppliedChecks:count,nativeReport:'meta/local-integration-verification/real-origin-results.json',suppliedEvidenceLimit:'Delivered suites use their own substitute storage; native-origin report proves actual browser storage separately.',workspaceVerifier:'npm run verify -- --project biology30-chapter-'+ch+' --mode workspace: passed',visualInspection:'Representative desktop/mobile preview and first-page print layouts inspected; not a complete crop/science audit.'};
 await writeFile(`${base}/meta/integration-receipt.json`,JSON.stringify(receipt,null,2)+'\n');
}
console.log(`${native} native-origin groups and ${supplied} supplied checks passed; all seven style/assembly receipts verified. Release remains blocked.`);
