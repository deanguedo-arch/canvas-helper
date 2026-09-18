/* Optional authenticated Brightspace assignment storage. The organization must
 * supply authorize() through an approved login integration. No credentials are
 * stored in course state, browser storage, or the SCORM package. */
(function(global){
'use strict';
global.createBiologyBrightspacePhotoStore=function({origin,orgUnitId,folderId,apiVersion,authorize,questionIds}){
 const url=new URL(origin), id=x=>/^\d+$/.test(String(x));
 if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash||!id(orgUnitId)||!id(folderId)||!/^1\.\d+$/.test(apiVersion)||typeof authorize!=='function'||!Array.isArray(questionIds)||!questionIds.length)throw Error('Photo syncing requires an approved Brightspace configuration.');
 const allowed=new Set(questionIds),base=`${url.origin}/d2l/api/le/${apiVersion}/${orgUnitId}/dropbox/folders/${folderId}/submissions/`;
 const scope=()=>{const sc=global.__canvasHelperScorm;if(!sc||sc.connectionState()!=='connected')throw Error('Open this photo activity through Brightspace.');return sc.scopeKey('biology-photos');};
 async function request(suffix,options={}){
  const token=await authorize();if(typeof token!=='string'||!token||/[\r\n]/.test(token))throw Error('Brightspace photo authorization is unavailable.');
  const r=await fetch(base+suffix,{...options,headers:{...options.headers,Authorization:'Bearer '+token},credentials:'omit',redirect:'error',cache:'no-store'});
  if(!r.ok)throw Error(r.status===401||r.status===403?'Brightspace has not authorized this photo operation.':'Brightspace could not store or retrieve this photo. Try again.');return r;
 }
 async function files(){const rows=await (await request('mysubmissions/')).json();if(!Array.isArray(rows))throw Error('Brightspace returned an unsupported photo-submission record.');return rows.flatMap(e=>(e.Submissions||[]).flatMap(s=>(s.Files||[]).map(f=>({submissionId:s.Id,fileId:f.FileId,name:f.FileName,comment:s.Comment?.Text}))));}
 function metadata(photoId,questionId){return JSON.stringify({schemaVersion:1,scope:scope(),photoId,questionId});}
 return {
  enabled:questionId=>allowed.has(questionId),
  async put({photoId,questionId,blob}){
   if(!allowed.has(questionId)||!/^[a-zA-Z0-9-]{1,100}$/.test(photoId)||!(blob instanceof Blob)||blob.type!=='image/jpeg')throw Error('This photo is outside the configured pilot.');
   const comment=metadata(photoId,questionId),name=`biology-photo-${photoId}.jpg`;
   let existing=(await files()).find(f=>f.name===name&&f.comment===comment);
   if(!existing){const boundary='canvas-helper-'+crypto.randomUUID();
    const body=new Blob([`--${boundary}\r\nContent-Type: application/json\r\n\r\n`,JSON.stringify({Text:comment,Html:null}),`\r\n--${boundary}\r\nContent-Disposition: form-data; name=""; filename="${name}"\r\nContent-Type: image/jpeg\r\n\r\n`,blob,`\r\n--${boundary}--\r\n`],{type:`multipart/mixed; boundary=${boundary}`});
    await request('mysubmissions/',{method:'POST',body});existing=(await files()).find(f=>f.name===name&&f.comment===comment);
   }
   if(!existing||!id(existing.submissionId)||!id(existing.fileId))throw Error('Brightspace has not confirmed the uploaded photo. Keep this page open and retry.');
   return {provider:'brightspace-assignment-v1',orgUnitId:String(orgUnitId),folderId:String(folderId),submissionId:String(existing.submissionId),fileId:String(existing.fileId),photoId,questionId,scope:scope()};
  },
  async get(reference){
   if(reference?.provider!=='brightspace-assignment-v1'||reference.orgUnitId!==String(orgUnitId)||reference.folderId!==String(folderId)||reference.scope!==scope()||!allowed.has(reference.questionId)||!id(reference.submissionId)||!id(reference.fileId))throw Error('This photo does not belong to the current course attempt.');
   // Check current-user ownership before requesting an attachment, even if the
   // integration user has broader API permissions than an ordinary learner.
   const owned=(await files()).some(f=>String(f.submissionId)===reference.submissionId&&String(f.fileId)===reference.fileId&&f.comment===metadata(reference.photoId,reference.questionId));
   if(!owned)throw Error('This photo is not available to the current Brightspace learner.');
   const blob=await (await request(`${reference.submissionId}/files/${reference.fileId}`)).blob();
   if(blob.type!=='image/jpeg')throw Error('Brightspace returned an unsupported photo file.');return blob;
  }
 };
};
})(window);
