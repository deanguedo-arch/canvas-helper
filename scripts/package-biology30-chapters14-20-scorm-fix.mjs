/** Copy only the corrected individual Brightspace upload ZIPs to a clean handoff folder. */
import {mkdir,copyFile,readFile,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const out='/Users/deanguedo/Downloads/Biology_30_Chapters_14-20_2026-09-21';
try{await access(out);throw Error(`Preserving existing output: ${out}`);}catch(e){if(e.code!=='ENOENT')throw e;}
await mkdir(out,{recursive:true});const rows=[],packages=[];
for(let ch=14;ch<=20;ch++){
 const source=`projects/biology30-chapter-${ch}/exports/biology30-chapter-${ch}-scorm-2004-review.zip`,name=`Biology 30 - Chapter ${ch}.zip`,dest=`${out}/${name}`;
 await copyFile(source,dest);execFileSync('python3',['-m','zipfile','-t',dest],{stdio:'pipe'});
 const data=await readFile(dest),sha=createHash('sha256').update(data).digest('hex');rows.push(`${sha}  ${name}`);
 packages.push({chapter:ch,file:name,bytes:data.length,sha256:sha});
}
await writeFile(`${out}/SHA256SUMS.txt`,rows.join('\n')+'\n');
await writeFile(`${out}/UPLOAD_INSTRUCTIONS.md`,'# Biology 30 Chapters 14–20 SCORM 2004 packages\n\nUpload each of the seven chapter ZIP files to Brightspace as an individual SCORM 2004 learning object. Do not upload this folder or the older 2026-09-21 Chapter 14–20 ZIPs as one combined package.\n\nThe earlier Chapter 14–20 packages had unconnected SCORM bridges and stopped before their navigation runtime initialized. These packages contain explicit hash-route, course-state and required-completion contracts. Local simulated-LMS validation confirmed interactive lesson and labeling navigation plus a SCORM state commit for every chapter. Actual Brightspace upload, launch, resume and reporting still require live confirmation.\n');
await writeFile(`${out}/package-receipt.json`,JSON.stringify({schemaVersion:1,createdAt:new Date().toISOString(),reviewOnly:true,liveBrightspaceVerified:false,rootCause:'Missing workspace SCORM contracts caused the course runtime to call a disabled course-state API before navigation initialization.',verification:{zipCrc:true,simulatedScorm2004Launch:true,interactiveChapters:[14,15,16,17,18,19,20],stateCommit:true},packages},null,2)+'\n');
console.log(JSON.stringify({out,packages},null,2));
