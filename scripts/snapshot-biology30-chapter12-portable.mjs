// Snapshot only: never normalize or rewrite the canonical HTML, runtime or CSS.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {load} from 'cheerio';

const base=path.resolve('projects/biology30-chapter-12/workspace');
const source=fs.readFileSync(path.join(base,'index.html'),'utf8');
const $=load(source);
const mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff','.pdf':'application/pdf'};
const references=new Map();
function embed(value,owner=base){
 if(!value||/^(data:|https?:|\/\/|#|blob:)/i.test(value))return value;
 const split=value.search(/[?#]/),file=split<0?value:value.slice(0,split),suffix=split<0?'':value.slice(split);
 const target=path.resolve(owner,file);
 assert(target.startsWith(base+path.sep),`Outside workspace: ${value}`);
 assert(fs.existsSync(target),`Missing asset: ${value}`);
 const bytes=fs.readFileSync(target),type=mime[path.extname(target)];
 assert(type,`Unsupported embedded asset: ${value}`);
 references.set(path.relative(base,target),crypto.createHash('sha256').update(bytes).digest('hex'));
 return `data:${type};base64,${bytes.toString('base64')}${suffix}`;
}
for(const e of $('link[rel=stylesheet]').toArray()){
 const file=path.resolve(base,$(e).attr('href'));
 assert(file.startsWith(base+path.sep));
 const css=fs.readFileSync(file,'utf8').replace(/url\(\s*(['"]?)([^'"\)]+)\1\s*\)/g,(_,quote,url)=>`url("${embed(url.trim(),path.dirname(file))}")`);
 $(e).replaceWith(`<style>${css.replace(/<\/style/gi,'<\\/style')}</style>`);
}
for(const e of $('script[src]').toArray()){
 const file=path.resolve(base,$(e).attr('src'));
 assert(file.startsWith(base+path.sep));
 $(e).removeAttr('src').text(fs.readFileSync(file,'utf8').replace(/<\/script/gi,'<\\/script'));
}
for(const e of $('img[src],source[src]').toArray())$(e).attr('src',embed($(e).attr('src')));
// Runtime-owned diagram and question images are held in these native data blocks.
function walk(value){
 if(Array.isArray(value))return value.map(walk);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,key==='src'&&typeof v==='string'?embed(v):walk(v)]));
 return value;
}
for(const id of ['course-data','textbook-practice-data']){
 const node=$(`#${id}`);assert.equal(node.length,1);
 node.text(JSON.stringify(walk(JSON.parse(node.text()))).replace(/<\/script/gi,'<\\/script'));
}
const output=$.html();
const check=load(output);assert.equal(check('script[src],link[rel=stylesheet]').length,0);
assert.equal(fs.readFileSync(path.join(base,'index.html'),'utf8'),source,'Canonical source changed');
fs.writeFileSync(path.join(base,'Biology30_Chapter12.html'),output);
console.log(JSON.stringify({output:'projects/biology30-chapter-12/workspace/Biology30_Chapter12.html',bytes:Buffer.byteLength(output),embeddedAssets:references.size,canonicalUnchanged:true,scope:'Standalone snapshot, not SCORM or release proof'}));
