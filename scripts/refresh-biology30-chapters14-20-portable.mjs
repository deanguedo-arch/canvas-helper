/** Preserve the imported authoring boundary and invoke its supplied assembly owner. */
import {execFileSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const python=process.env.BIOLOGY_PYTHON||'python3',root=process.cwd();
for(let ch=14;ch<=20;ch++){
 const p=path.join(root,`projects/biology30-chapter-${ch}`),owner=path.join(p,'meta/external-generation');
 const script=ch===14?'assemble_portable.py':'build.py';
 execFileSync(python,[path.join(owner,'scripts',script)],{cwd:owner,stdio:'pipe',maxBuffer:4e6});
 const receipt=JSON.parse(await readFile(path.join(p,'meta/integration-receipt.json'),'utf8'));
 for(const [key,rel]of [['workspaceHtmlSha256','index.html'],['portableSha256',`portable/Biology30_Chapter${ch}.html`]])receipt[key]=createHash('sha256').update(await readFile(path.join(p,'workspace',rel))).digest('hex');
 receipt.refreshedAt=new Date().toISOString();await writeFile(path.join(p,'meta/integration-receipt.json'),JSON.stringify(receipt,null,2)+'\n');
 if(ch===14){const file=path.join(p,'meta/project.json'),m=JSON.parse(await readFile(file,'utf8'));if(!m.canonicalSources.includes(m.canonicalEntry))m.canonicalSources.push(m.canonicalEntry);const note='workspace/index.html is the generated canonical entry; content.py/build_chapter.py remain its authoring owner.';if(!m.sourceOfTruthNotes.includes(note))m.sourceOfTruthNotes+=' '+note;await writeFile(file,JSON.stringify(m,null,2)+'\n');}
 console.log(`Chapter ${ch}: portable refreshed through supplied owner`);
}
