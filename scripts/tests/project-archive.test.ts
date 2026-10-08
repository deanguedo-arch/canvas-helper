import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { resolveProjectArchiveSource } from '../lib/project-archive.js';
test('archive fallback verifies bytes; prefers current work; rejects missing/corrupt/unsafe recovery files',async()=>{
 const repoRoot=await mkdtemp(path.join(tmpdir(),'canvas-archive-fixture-'));const archiveRoot=path.join(repoRoot,'external');
 try {await mkdir(path.join(repoRoot,'config'));await mkdir(archiveRoot);const originalPath='source.zip',archiveRelativePath='saved.zip',bytes='synthetic source';const sha256=createHash('sha256').update(bytes).digest('hex');
 const entry={originalPath,archiveRelativePath,sizeBytes:Buffer.byteLength(bytes),sha256};const put=async(e=entry)=>writeFile(path.join(repoRoot,'config/project-archives.json'),JSON.stringify({schemaVersion:1,entries:[e]}));await put();await writeFile(path.join(archiveRoot,archiveRelativePath),bytes);
 assert.equal(await resolveProjectArchiveSource(originalPath,{repoRoot,archiveRoot}),path.join(archiveRoot,archiveRelativePath));
 await writeFile(path.join(repoRoot,originalPath),'new local work');assert.equal(await resolveProjectArchiveSource(originalPath,{repoRoot,archiveRoot}),path.join(repoRoot,originalPath));await rm(path.join(repoRoot,originalPath));
 await writeFile(path.join(archiveRoot,archiveRelativePath),'synthetic sourcX');await assert.rejects(resolveProjectArchiveSource(originalPath,{repoRoot,archiveRoot}),/integrity/);
 await rm(path.join(archiveRoot,archiveRelativePath));await assert.rejects(resolveProjectArchiveSource(originalPath,{repoRoot,archiveRoot}),/unavailable/);
 await put({...entry,archiveRelativePath:'../escape.zip'});await assert.rejects(resolveProjectArchiveSource(originalPath,{repoRoot,archiveRoot}),/Invalid project archive entry/);
 assert.equal(await resolveProjectArchiveSource('unregistered.zip',{repoRoot,archiveRoot}),path.join(repoRoot,'unregistered.zip'));
 }finally{await rm(repoRoot,{recursive:true,force:true});}
});
