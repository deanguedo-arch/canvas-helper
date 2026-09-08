import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { auditBiology30Retention, validateBiology30Retention } from "../lib/biology30-course/v1/pilot2-retention-audit.js";
const load=async(file:string)=>JSON.parse(await readFile(file,"utf8"));
const base="projects/resources/biology30-production/v1";
test("retention audit accepts all reviewed units and refuses to promote pending evidence",async()=>{
  for(const [unit,count] of [["B",56],["C",96],["D",44]] as const){
    assert.equal((await auditBiology30Retention(process.cwd(),unit,true)).report.reviewed,count);
  }
  const disposition=await load(`${base}/units/unit-d/pilot2-old-section-disposition.json`);
  const receipt=await load(`${base}/units/unit-d/pilot2-old-section-review.json`);
  const source=await load(receipt.sourceFile);
  receipt.pendingSections=disposition.sections.map((item:{oldLessonId:string;oldSectionIndex:number;implemented:boolean})=>{
    item.implemented=false;
    return {oldLessonId:item.oldLessonId,oldSectionIndex:item.oldSectionIndex};
  });
  receipt.reviewedSections=[];
  assert.equal(validateBiology30Retention(disposition,source,receipt,{}).pending,44);
  assert.throws(()=>validateBiology30Retention(disposition,source,receipt,{},true),/incomplete/);
});
test("a destination label cannot replace exact source and authored teaching evidence",async()=>{
  const receipt=await load(`${base}/units/unit-b/pilot2-old-section-review.json`),disposition=await load(`${base}/units/unit-b/pilot2-old-section-disposition.json`),source=await load(receipt.sourceFile);
  const targets:Record<string,unknown>={};
  for(const item of receipt.reviewedSections)for(const target of item.targets){
    const data=await load(target.file);let value;
    if(target.kind==="core")value=data.parts.find((p:{id:string})=>p.id===target.targetId).paragraphs;
    else if(target.kind==="advanced")value=data.parts.find((p:{advanced:{id:string}})=>p.advanced.id===target.targetId).advanced.paragraphs;
    else value={introduction:data.introduction,case:data.case,activities:data.activities};
    targets[`${target.file}#${target.kind}#${target.targetId}`]=value;
  }
  validateBiology30Retention(disposition,source,receipt,targets,true);
  const changed=structuredClone(source);changed.B[0].sections[0].paragraphs[0]+="changed";
  assert.throws(()=>validateBiology30Retention(disposition,changed,receipt,targets,true),/Stale retained source/);
  const deleted=structuredClone(targets);delete deleted[Object.keys(deleted)[0]];
  assert.throws(()=>validateBiology30Retention(disposition,source,receipt,deleted,true),/Stale or missing retained teaching/);
  const unimplemented=structuredClone(disposition);unimplemented.sections[0].implemented=false;
  assert.throws(()=>validateBiology30Retention(unimplemented,source,receipt,targets,true),/Unimplemented/);
});
