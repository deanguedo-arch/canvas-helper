import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

function harness(){
 const calls:{url:string;options:any}[]=[];
 let files:any[]=[],owner=true,scope='attempt-one',fail=false;
 const window:any={__canvasHelperScorm:{connectionState:()=> 'connected',scopeKey:()=>scope}};
 const fakeFetch=async(url:string,options:any)=>{
  calls.push({url,options});
  if(fail)return new Response('',{status:403});
  if(url.endsWith('/mysubmissions/')&&options.method==='POST'){
   const text=await options.body.text();
   const comment=JSON.parse(text.split('\r\n\r\n')[1].split('\r\n--')[0]).Text;
   const name=text.match(/filename="([^"]+)"/)[1];
   files=[{Submissions:[{Id:21,Comment:{Text:comment},Files:[{FileId:22,FileName:name}]}]}];
   return new Response('{}');
  }
  if(url.endsWith('/mysubmissions/'))return Response.json(owner?files:[]);
  return new Response(new Blob(['image-bytes'],{type:'image/jpeg'}),{headers:{'Content-Type':'image/jpeg'}});
 };
 vm.runInNewContext(readFileSync('scripts/lib/biology30-chapters/brightspace-photo-store.js','utf8'),{window,URL,Blob,fetch:fakeFetch,crypto:webcrypto});
 const config={origin:'https://school.brightspace.com',orgUnitId:123,folderId:456,apiVersion:'1.82',authorize:async()=> 'ephemeral-access-token',questionIds:['q-one']};
 return {window,config,calls,store:window.createBiologyBrightspacePhotoStore(config),setOwner:(v:boolean)=>{owner=v;},setScope:(v:string)=>{scope=v;},setFail:()=>{fail=true;}};
}
test('photo adapter uploads documented multipart, confirms current-user reference, and retrieves bytes',async()=>{
 const h=harness();const reference=await h.store.put({photoId:'photo-1',questionId:'q-one',blob:new Blob(['image-bytes'],{type:'image/jpeg'})});
 assert.equal(reference.provider,'brightspace-assignment-v1');assert.equal(reference.submissionId,'21');
 const blob=await h.store.get(reference);assert.equal(await blob.text(),'image-bytes');
 const post=h.calls.find(c=>c.options.method==='POST')!;assert.match(post.options.body.type,/multipart\/mixed/);
 assert.equal(post.options.headers.Authorization,'Bearer ephemeral-access-token');assert.equal(post.options.credentials,'omit');assert.equal(post.options.redirect,'error');
 assert.match(await post.options.body.text(),/"Html":null/);assert.equal(JSON.stringify(reference).includes('access-token'),false);
 // Retrying an acknowledged upload must not create a duplicate submission.
 await h.store.put({photoId:'photo-1',questionId:'q-one',blob:new Blob(['image-bytes'],{type:'image/jpeg'})});
 assert.equal(h.calls.filter(c=>c.options.method==='POST').length,1);
 h.setOwner(false);const count=h.calls.length;await assert.rejects(h.store.get(reference),/current Brightspace learner/);
 assert.equal(h.calls.length,count+1); // No attachment request after ownership fails.
 h.setScope('another-attempt');await assert.rejects(h.store.get(reference),/current course attempt/);
});
test('photo adapter rejects unapproved destinations, unsupported files, and denied authorization',async()=>{
 const h=harness();assert.throws(()=>h.window.createBiologyBrightspacePhotoStore({...h.config,origin:'http://school.test'}),/approved/);
 assert.throws(()=>h.window.createBiologyBrightspacePhotoStore({...h.config,folderId:'../123'}),/approved/);
 await assert.rejects(h.store.put({photoId:'1',questionId:'not-in-pilot',blob:new Blob(['x'],{type:'image/jpeg'})}),/outside/);
 h.setFail();await assert.rejects(h.store.put({photoId:'1',questionId:'q-one',blob:new Blob(['x'],{type:'image/jpeg'})}),/not authorized/);
});
