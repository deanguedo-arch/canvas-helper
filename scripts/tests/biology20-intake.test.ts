import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {safeZip,sourceDisposition,redactSourceText,MODULES} from '../lib/biology20-course/intake.js';

test('Biology 20 module identities keep D parts and chapter ownership separate',()=>{
 assert.deepEqual(MODULES.map(m=>m.id),['a','b','c','d-part-1','d-part-2']);
 assert.deepEqual(MODULES.flatMap(m=>[...m.chapters]),[1,2,3,4,5,6,7,8,9,10]);
});
test('archive intake rejects traversal and symlinks',async()=>{
 const bad=new JSZip();bad.file('../escape.txt','no');await assert.rejects(safeZip(await bad.generateAsync({type:'nodebuffer'})),/Unsafe/);
 const link=new JSZip();link.file('link','target',{unixPermissions:0o120777});await assert.rejects(safeZip(await link.generateAsync({type:'nodebuffer',platform:'UNIX'})),/symlink/);
 const good=new JSZip();good.file('folder/source.txt','test');assert.ok((await safeZip(await good.generateAsync({type:'nodebuffer'}))).file('folder/source.txt'));
});
test('keys, exams and runtime files never receive automatic learner eligibility',()=>{
 for(const n of ['Unit_B_Exam.html','Biology 20 Practice Final and KEY.pdf','questiondb.xml','quiz_d2l_100.xml'])assert.equal(sourceDisposition(n),'restricted-assessment-reference');
 assert.equal(sourceDisposition('old-model.swf'),'inactive-legacy-runtime');
 assert.equal(sourceDisposition('Chapter 1.html'),'reference-pending-selection');
 assert.equal(redactSourceText('Login: example Password: secret'),'[teacher credential removed] [teacher credential removed]');
});
