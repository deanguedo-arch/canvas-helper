import { createHash, randomUUID } from "node:crypto";
import { readFile, writeFile, rename, open, unlink } from "node:fs/promises";
import path from "node:path";
import { checkStandardHtml } from "./standard-lesson.js";
import { repoRoot } from "./paths.js";
export type TransferProposal = { schemaVersion: 1; correctionId: string; generation: { path: string; sha256: string }; review: { path: string; sha256: string }; signature: string };
export type Rules = { targetGrade: number; maxParagraphWords: number; modeledReasoningBeforeGuided?: true };
import type { TeachingProposal } from "../../app/shared/course-standards.js";
export type { TeachingProposal } from "../../app/shared/course-standards.js";
export type Standard = { schemaVersion: 1; id: string; version: number; parent: string | null; provenance: unknown; rules: Rules; blueprint: string[]; requirements: string[]; componentVersion?:string; blueprintVersion?:string; transferStrategy?: TransferProposal };
export type Candidate = { id: string; project: string; family: string; checkpoint: string; fingerprint: string; createdAt: string; decision: "pending" | "universal" | "family" | "course-specific" | "defer" | "skip"; proposal?: { rule: keyof Rules; value: number | true }; teachingProposal?: TeachingProposal; transferProposal?: TransferProposal; release?: string };
export type Queue = { schemaVersion: 1; revision: number; candidates: Candidate[]; releases: Standard[]; bindings: Record<string, string> };
const slug = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
export function validateProject(value: string) { if (!slug.test(value) || value.length > 80) throw new Error("Invalid project."); }
const queuePath = (root: string) => path.join(root, "config/course-standards/promotion-queue.json");
export async function readStandardsQueue(root = repoRoot): Promise<Queue> {
 try { const q = JSON.parse(await readFile(queuePath(root), "utf8")); if(q.schemaVersion!==1 || !Array.isArray(q.candidates) || !Array.isArray(q.releases) || !q.bindings || !Number.isInteger(q.revision)) throw new Error("Invalid standards queue."); return q; }
 catch(e) { if((e as NodeJS.ErrnoException).code === "ENOENT") return {schemaVersion:1,revision:0,candidates:[],releases:[],bindings:{}}; throw e; }
}
export async function resolveStandard(root = repoRoot, project = "", family = "general"): Promise<Standard> {
 let seedText: string; try { seedText=await readFile(path.join(root,"config/course-standards/v1.json"),"utf8"); } catch(e) { if((e as NodeJS.ErrnoException).code!=="ENOENT")throw e; seedText=await readFile(path.join(repoRoot,"config/course-standards/v1.json"),"utf8"); }
 const seed = JSON.parse(seedText) as Standard;
 if(project && family==="general"){try{const m=JSON.parse(await readFile(path.join(root,"projects",project,"meta/project.json"),"utf8"));family=courseFamily(`${m.courseCode??""} ${m.title??""} ${project}`);}catch{family=courseFamily(project);}}
 const q = await readStandardsQueue(root);
 const id = q.bindings[`course:${project}`] ?? q.bindings[`family:${family}`] ?? q.bindings.universal;
 return q.releases.find(r=>r.id===id) ?? seed;
}
async function mutate(root: string, action: (q: Queue)=>Promise<void>|void) {
 const target=queuePath(root); const lock=await open(`${target}.lock`,"wx"); const tmp=`${target}.${randomUUID()}.tmp`;
 try { const original=await readFile(target,"utf8").catch(e=>{if(e.code==="ENOENT")return null;throw e;}); const q=await readStandardsQueue(root); await action(q); q.revision++; const current=await readFile(target,"utf8").catch(e=>{if(e.code==="ENOENT")return null;throw e;}); if(current!==original)throw new Error("Queue changed outside the writer lock. Reload before saving."); await writeFile(tmp,JSON.stringify(q,null,2)+"\n",{flag:"wx"}); await rename(tmp,target); return q; }
 finally { await unlink(tmp).catch(()=>{}); await lock.close(); await unlink(`${target}.lock`); }
}
export function courseFamily(code: string) { return /biology/i.test(code)?"biology":/english/i.test(code)?"english":/social/i.test(code)?"social":"general"; }
export async function captureStandardsCheckpoint(project: string, checkpoint: "review"|"export", identity: string, root=repoRoot, sourceHtml?: string) {
 validateProject(project);
 // Only identities and curriculum hashes: no notes, answers, excerpts or student records.
 const fingerprint=createHash("sha256").update(identity).digest("hex");
 const id=createHash("sha256").update(`${project}:${checkpoint}:${fingerprint}`).digest("hex").slice(0,24);
 let family=courseFamily(project); try { const m=JSON.parse(await readFile(path.join(root,"projects",project,"meta/project.json"),"utf8")); family=courseFamily(`${m.courseCode??""} ${m.title??""} ${project}`); } catch {}
 const existing=await readStandardsQueue(root); if(existing.candidates.some(c=>c.id===id)) return existing;
 const transferProposal=await proposeExemplarCorrection(project,root);
 const teachingProposal=await proposeModeledReasoning(project,checkpoint,root,sourceHtml);
 return mutate(root,q=>{if(!q.candidates.some(c=>c.id===id))q.candidates.push({id,project,family,checkpoint,fingerprint,createdAt:new Date().toISOString(),decision:"pending", ...(teachingProposal?{teachingProposal}:{}), ...(transferProposal?{transferProposal}:{})});});
}
export async function decideStandardsCandidate(input: {id:string; revision:number; decision:Candidate["decision"]; rule?:keyof Rules; value?:number | true; proposalSignature?:string; transferSignature?:string},root=repoRoot) {
 const choices=["universal","family","course-specific","defer","skip"];
 if(!choices.includes(input.decision)) throw new Error("Explicit decision required.");
 return mutate(root,async q=>{
 if(input.revision!==q.revision) throw new Error("Queue changed. Reload before deciding.");
 const c=q.candidates.find(c=>c.id===input.id); if(!c || !["pending","defer"].includes(c.decision))throw new Error("Candidate already decided or missing.");
 if(["universal","family","course-specific"].includes(input.decision)) {
 const parent=await resolveStandard(root,input.decision==="course-specific"?c.project:"",input.decision==="universal"?"general":c.family);
 if(input.transferSignature) {
  if(input.rule || input.value !== undefined) throw new Error("Choose one exact promotion proposal.");
  const proposal=c.transferProposal;
  if(!proposal || proposal.signature!==input.transferSignature || (await proposeExemplarCorrection(c.project,root))?.signature!==proposal.signature) throw new Error("Correction evidence changed or signature missing. Capture a fresh paired proposal.");
  const release:Standard={...parent,id:`outreach-v${q.releases.length+2}`,version:q.releases.length+2,parent:parent.id,provenance:{candidate:c.id,project:c.project,checkpoint:c.checkpoint,fingerprint:c.fingerprint,scope:input.decision,decidedAt:new Date().toISOString(),transferProposal:proposal},transferStrategy:proposal};
  q.releases.push(release);q.bindings[input.decision==="universal"?"universal":input.decision==="family"?`family:${c.family}`:`course:${c.project}`]=release.id;
  c.release=release.id;c.decision=input.decision;return;
 }

 let blueprint=[...parent.blueprint];
 if(parent.rules.modeledReasoningBeforeGuided!==undefined && parent.rules.modeledReasoningBeforeGuided!==true)throw new Error("Invalid teaching rule combination.");
 if(parent.rules.modeledReasoningBeforeGuided && JSON.stringify(parent.blueprint)!==JSON.stringify(["context","explanation","worked","modeled-reasoning","guided","independent-check"]))throw new Error("Conflicting modeled-reasoning blueprint.");
 if(input.rule==="modeledReasoningBeforeGuided") {
 const proposal=c.teachingProposal;
 if(input.value!==true || !proposal || input.proposalSignature!==proposal.signature)throw new Error("Exact evidence-backed teaching proposal required.");
 const {signature,...signed}=proposal;
 if(createHash('sha256').update(JSON.stringify(signed)).digest('hex')!==signature)throw new Error('Teaching proposal evidence changed. Capture a fresh proposal.');
 const currentSource=await readFile(path.join(root,'projects',c.project,'workspace/index.html'),'utf8');
 if(createHash('sha256').update(currentSource).digest('hex')!==proposal.evidence.sourceFingerprint)throw new Error('Teaching source changed. Capture a fresh proposal before approval.');
 if(parent.rules.modeledReasoningBeforeGuided)throw new Error("Modeled reasoning is already required in this scope; defer or skip this opportunity.");
 if(JSON.stringify(parent.blueprint)!==JSON.stringify(proposal.before.blueprint))throw new Error("Teaching blueprint changed. Capture a fresh proposal before approval.");
 blueprint=modeledReasoningBlueprint(parent.blueprint);
 } else {
 if(!["targetGrade","maxParagraphWords"].includes(input.rule??"") || typeof input.value!=="number" || !Number.isInteger(input.value)) throw new Error("Choose an exact reusable rule and value.");
 if(input.rule==="targetGrade" ? input.value<8||input.value>12 : input.value<40||input.value>250) throw new Error("Rule value outside supported bounds.");
 }
 const value=input.value!;
 const release:Standard={...parent,id:`outreach-v${q.releases.length+2}`,version:q.releases.length+2,parent:parent.id,provenance:{candidate:c.id,project:c.project,checkpoint:c.checkpoint,fingerprint:c.fingerprint,scope:input.decision,decidedAt:new Date().toISOString(),...(input.rule==="modeledReasoningBeforeGuided"?{teachingProposal:c.teachingProposal}:{})},rules:{...parent.rules,[input.rule!]:value},blueprint,...(input.rule==="modeledReasoningBeforeGuided"?{componentVersion:"standard-lesson-modeled-v2",blueprintVersion:"outreach-modeled-reasoning-v2"}:{})};
 q.releases.push(release); q.bindings[input.decision==="universal"?"universal":input.decision==="family"?`family:${c.family}`:`course:${c.project}`]=release.id;
 c.proposal={rule:input.rule!,value};c.release=release.id;
 }
 c.decision=input.decision;
 });
}
export async function reportStandardsNotice(root=repoRoot,project="",family="general") { try { console.warn("[Standards] " + await standardsContext(root,project,family)); } catch(e) { console.warn("[Standards] Notice unavailable; workflow continues."); } }
export async function standardsContext(root=repoRoot,project="",family="general") {
 const s=await resolveStandard(root,project,family); const q=await readStandardsQueue(root);
 const transfer=s.transferStrategy ? await promotedTransferInstructions(s.transferStrategy,root) : "";
 return `Standard ${s.id}: ${s.requirements.join("; ")}. Transfer strategy: ${s.transferStrategy ? `${s.transferStrategy.generation.path} (${s.transferStrategy.generation.sha256}); paired review ${s.transferStrategy.review.path} (${s.transferStrategy.review.sha256})` : "no reusable transfer strategy promoted"}. Blueprint: ${s.blueprint.join(" → ")}. Target reading grade ${s.rules.targetGrade}; paragraph ceiling ${s.rules.maxParagraphWords} words. ${s.rules.modeledReasoningBeforeGuided?"Require explicit action-and-why modeled reasoning before guided practice.":"Worked-example stage retained; explicit modeled-reasoning enhancement awaits scoped approval."} ${q.candidates.filter(c=>["pending","defer"].includes(c.decision)).length} pending/deferred promotion decisions in Studio. Nonblocking; existing courses require deliberate adoption. ${transfer}`;
}
export async function exportStandardsCheckpoint(project:string,entry:string) {
 try { const source=await readFile(entry,"utf8"); const check=await inspectPinnedStandard(project,source); if(check.status==="needs-review")console.warn(`[Standards] Nonblocking checks: ${check.issues.join(" ")}`); const q=await captureStandardsCheckpoint(project,"export",source,repoRoot,source); console.warn(`[Standards] ${q.candidates.filter(c=>["pending","defer"].includes(c.decision)).length} pending/deferred decisions. Review in Studio; export continues.`); }
 catch(e) { console.warn(`[Standards] Capture unavailable; export continues: ${e instanceof Error?e.message:String(e)}`); }
}

export async function inspectPinnedStandard(project:string,html:string,root=repoRoot){
 validateProject(project);let standard:Standard;
 try{standard=JSON.parse(await readFile(path.join(root,'projects',project,'meta/course-standard.json'),'utf8'));}
 catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return {status:'unadopted',issues:[] as string[]};throw e;}
 const issues=checkStandardHtml(html,standard);return {status:issues.length?'needs-review':'pass',standard:standard.id,issues};
}

// A deterministic structural enhancement, anchored to Dean's explicit worked/guided expectation.
// No teacher notes, student responses or source excerpts enter the proposal.
export function modeledReasoningBlueprint(before: string[]) {
 const baseline=['context','explanation','worked','guided','independent-check'];
 if(JSON.stringify(before)!==JSON.stringify(baseline))throw new Error('Conflicting teaching blueprint: expected the preserved five-stage baseline.');
 return ['context','explanation','worked','modeled-reasoning','guided','independent-check'];
}
export async function proposeModeledReasoning(project:string,checkpoint:'review'|'export',root=repoRoot,sourceHtml?:string):Promise<TeachingProposal|undefined>{
 let html:string;let pinned:Standard;
 try{html=sourceHtml??await readFile(path.join(root,'projects',project,'workspace/index.html'),'utf8');pinned=JSON.parse(await readFile(path.join(root,'projects',project,'meta/course-standard.json'),'utf8'));}
 catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return undefined;throw e;}
 if(pinned.rules.modeledReasoningBeforeGuided)return undefined;
 const { inspectModeledReasoningEvidence }=await import('./standard-lesson.js');
 const observed=inspectModeledReasoningEvidence(html);
 if(!observed.eligible)return undefined;
 let blueprint:string[];try{blueprint=modeledReasoningBlueprint(pinned.blueprint);}catch{return undefined;}
 const proposal:Omit<TeachingProposal,'signature'>={rule:'modeledReasoningBeforeGuided',value:true,
 before:{standard:pinned.id,blueprint:[...pinned.blueprint]},after:{blueprint},
 rationale:'Dean explicitly requested self-teaching lessons with worked examples before guided practice. Add visible action-and-why reasoning so the example models how to think before students try it.',
 example:{before:'Glucose rises → insulin response → glucose falls.',after:[{action:'Identify the starting change: blood glucose rises.',why:'The starting change tells us what the feedback response must oppose.'},{action:'Connect insulin to glucose uptake, then predict a smaller insulin signal.',why:'Explaining each link shows why the response reduces the original change rather than just naming a hormone.'}]},
 evidence:{expectation:'Dean explicit outreach worked/guided sequence, 2026-09-30',checkpoint,source:`projects/${project}/workspace/index.html`,sourceFingerprint:createHash('sha256').update(html).digest('hex'),observed:observed.description}};
 return {...proposal,signature:createHash('sha256').update(JSON.stringify(proposal)).digest('hex')};
}

// Correction prose stays project-local; the queue contains only identity and paired hashes.
export async function proposeExemplarCorrection(project:string,root=repoRoot):Promise<TransferProposal|undefined> {
 validateProject(project);
 let correction:{schemaVersion:number;id:string;scope:string;status:string;generation:TransferProposal["generation"];review:TransferProposal["review"]};
 try {correction=JSON.parse(await readFile(path.join(root,"projects",project,"meta/exemplar-correction.json"),"utf8"));}
 catch(e){if((e as NodeJS.ErrnoException).code==="ENOENT")return undefined;throw e;}
 if(correction.scope==="lesson-specific")return undefined;
 if(correction.schemaVersion!==1 || correction.scope!=="reusable" || correction.status!=="proposed" || !slug.test(correction.id))throw new Error("Invalid proposed correction.");
 const {realpath}=await import("node:fs/promises"); const canonicalRoot=await realpath(root);
 for(const [kind,file] of Object.entries({generation:correction.generation,review:correction.review})) {
  if(!file || !/^[a-f0-9]{64}$/.test(file.sha256) || typeof file.path!=="string" || path.isAbsolute(file.path) || file.path.split(/[\\/]/).some(p=>p===".."||p==="."))throw new Error("Paired generation and review evidence required.");
  const target=await realpath(path.resolve(root,file.path));if(!target.startsWith(canonicalRoot+path.sep))throw new Error("Correction evidence escapes repository.");
  const bytes=await readFile(target);if(createHash("sha256").update(bytes).digest("hex")!==file.sha256)throw new Error("Correction evidence changed.");
  const content=JSON.parse(bytes.toString("utf8"));if(content.schemaVersion!==1 || content.correctionId!==correction.id || content.kind!==kind || !Array.isArray(content.instructions) || !content.instructions.length || content.instructions.some((v:unknown)=>typeof v!=="string"||!v.trim()))throw new Error("Generation instructions and review checks must change together under one correction identity.");
 }
 const proposal:Omit<TransferProposal,"signature">={schemaVersion:1,correctionId:correction.id,generation:correction.generation,review:correction.review};
 return {...proposal,signature:createHash("sha256").update(JSON.stringify(proposal)).digest("hex")};
}

async function promotedTransferInstructions(proposal:TransferProposal,root:string) {
 const {realpath}=await import("node:fs/promises");const canonicalRoot=await realpath(root);const sections:string[]=[];
 for(const [kind,file] of Object.entries({generation:proposal.generation,review:proposal.review})) {
  if(path.isAbsolute(file.path)||file.path.split(/[\\/]/).some(p=>p===".."||p==="."))throw new Error("Invalid promoted strategy path.");
  const target=await realpath(path.resolve(root,file.path));if(!target.startsWith(canonicalRoot+path.sep))throw new Error("Promoted strategy escapes repository.");
  const bytes=await readFile(target);if(createHash("sha256").update(bytes).digest("hex")!==file.sha256)throw new Error("Promoted strategy evidence changed.");
  const content=JSON.parse(bytes.toString("utf8"));if(content.correctionId!==proposal.correctionId||content.kind!==kind||!Array.isArray(content.instructions))throw new Error("Promoted strategy pairing changed.");
  sections.push(`${kind}: ${content.instructions.join("; ")}`);
 }
 return `Approved exemplar transfer correction ${proposal.correctionId}. ${sections.join(". ")}`;
}
