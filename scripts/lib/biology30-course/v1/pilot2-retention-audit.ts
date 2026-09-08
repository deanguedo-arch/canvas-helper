import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { passageDigest } from "./pilot2-passage-audit.js";
export type RetentionReceipt = {
  schemaVersion: number; unit: string; method: string; teacherDecision: unknown;
  sourceFile: string; sourceFileSha256: string;
  reviewedSections: { oldLessonId: string; oldSectionIndex: number; sourceCanonicalSha256: string; legacySourceSha256: string; destinationPart: string; review: string; teacherDecision: unknown;
    targets: { kind: "core" | "advanced" | "seminar"; file: string; targetId: string; contentSha256: string }[] }[];
  pendingSections: { oldLessonId: string; oldSectionIndex: number }[];
};
const key = (value: {oldLessonId:string;oldSectionIndex:number}) => `${value.oldLessonId}#${value.oldSectionIndex}`;
export function validateBiology30Retention(
  disposition: {unit:string; sections:{oldLessonId:string;oldSectionIndex:number;oldSectionSha256:string;destinationPart:string;implemented:boolean}[]},
  source: Record<string,{id:string; sections:unknown[]}[]>, receipt: RetentionReceipt,
  targetData: Record<string, unknown>, requireComplete = false,
) {
  if (receipt.schemaVersion !== 1 || receipt.unit !== disposition.unit || receipt.teacherDecision !== null || !receipt.method.trim()) throw new Error("Invalid retention author review");
  const old = new Map<string, unknown>(source[receipt.unit].flatMap(lesson => lesson.sections.map((section,i) => [`${lesson.id}#${i+1}`,section] as const)));
  const destinations = new Map(disposition.sections.map(section => [key(section), section]));
  if (old.size !== destinations.size || destinations.size !== disposition.sections.length || [...old.keys()].some(id => !destinations.has(id))) throw new Error("Old-section source/disposition inventory mismatch");
  const accounted = new Set<string>();
  for (const reviewed of receipt.reviewedSections) {
    const id = key(reviewed), dest = destinations.get(id);
    if (!dest || accounted.has(id)) throw new Error("Unknown or duplicate retained section");
    accounted.add(id);
    if (passageDigest(old.get(id)) !== reviewed.sourceCanonicalSha256 || dest.oldSectionSha256 !== reviewed.legacySourceSha256) throw new Error(`Stale retained source: ${id}`);
    if (!dest.implemented || dest.destinationPart !== reviewed.destinationPart || reviewed.teacherDecision !== null || !reviewed.review.trim()) throw new Error(`Unimplemented or unsupported retention claim: ${id}`);
    if (!reviewed.targets.some(target => target.targetId === dest.destinationPart)) throw new Error(`Missing actual retention destination: ${id}`);
    const targets = new Set<string>();
    for (const target of reviewed.targets) {
      const targetKey = `${target.file}#${target.kind}#${target.targetId}`;
      if (targets.has(targetKey) || !Object.hasOwn(targetData,targetKey) || passageDigest(targetData[targetKey]) !== target.contentSha256) throw new Error(`Stale or missing retained teaching: ${target.targetId}`);
      targets.add(targetKey);
    }
  }
  for (const pending of receipt.pendingSections) {
    const id = key(pending);
    if (!destinations.has(id) || accounted.has(id) || destinations.get(id)!.implemented) throw new Error("Unknown, duplicate or falsely implemented pending retention");
    accounted.add(id);
  }
  if (accounted.size !== old.size || (requireComplete && receipt.pendingSections.length)) throw new Error("Old-section retention review incomplete");
  return {unit:receipt.unit,reviewed:receipt.reviewedSections.length,pending:receipt.pendingSections.length,proof:"Authored source-to-teaching retention receipt integrity. Rendered placement and whole-unit scientific review remain separate."};
}
export async function auditBiology30Retention(repoRoot:string,unit:string,requireComplete=false) {
  const base = `projects/resources/biology30-production/v1/units/unit-${unit.toLowerCase()}`;
  const files:Record<string,string> = {}, cache:Record<string,any> = {};
  const load=async(file:string)=>{
    if (Object.hasOwn(cache,file)) return cache[file];
    const resolved=await realpath(path.resolve(repoRoot,file)), boundary=await realpath(path.resolve(repoRoot,"projects/resources/biology30-production/v1"));
    const relative=path.relative(boundary,resolved);
    if(relative.startsWith("..")||path.isAbsolute(relative))throw new Error("Unsafe retained-source dependency");
    const bytes=await readFile(resolved);files[file]=createHash("sha256").update(bytes).digest("hex");
    return cache[file]=JSON.parse(bytes.toString("utf8"));
  };
  const disposition=await load(`${base}/pilot2-old-section-disposition.json`),receipt:RetentionReceipt=await load(`${base}/pilot2-old-section-review.json`),source=await load(receipt.sourceFile);
  if(files[receipt.sourceFile]!==receipt.sourceFileSha256)throw new Error("Old authored-source snapshot changed");
  const targets:Record<string,unknown>={};
  for(const reviewed of receipt.reviewedSections) for(const target of reviewed.targets){
    const data=await load(target.file);let value:unknown;
    if(data.unit!==unit)throw new Error("Cross-unit retention target");
    if(target.kind==="core")value=data.parts?.find((part:{id:string})=>part.id===target.targetId)?.paragraphs;
    else if(target.kind==="advanced")value=data.parts?.find((part:{advanced:{id:string}})=>part.advanced.id===target.targetId)?.advanced.paragraphs;
    else if(target.kind==="seminar"&&data.teachingTarget===target.targetId){
      const state=await load(`${base}/pilot2-state-schema.json`);
      if(data.activities.length!==3)throw new Error("Incomplete seminar response inventory");
      for(const [index,suffix] of ["connect","evaluate","revise"].entries()){
        const activity=data.activities[index],id=`${unit.toLowerCase()}-review-seminar-${suffix}`;
        if(activity.id!==id||!state.responses[id]||!activity.attemptBeforeGuide||!activity.prompt?.trim()||!activity.modelResponse?.trim()||activity.modelResponse.length>state.responses[id]?.limit)throw new Error("Seminar operation or capacity mismatch");
      }
      value={introduction:data.introduction,case:data.case,activities:data.activities};
    }
    if(!value)throw new Error(`Missing actual retention target: ${target.targetId}`);
    targets[`${target.file}#${target.kind}#${target.targetId}`]=value;
  }
  return {report:validateBiology30Retention(disposition,source,receipt,targets,requireComplete),files};
}
