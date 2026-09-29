import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";

type Result={ok:boolean;errors:string[];measurements:Record<string,unknown>};
const root=process.cwd();
const projectFlag=process.argv.indexOf("--project"),pathFlag=process.argv.indexOf("--project-path");
if(projectFlag<0&&pathFlag<0)throw new Error("Usage: validate-math-course-generation --project <slug> or --project-path <directory>");
const project=pathFlag>=0?path.resolve(process.argv[pathFlag+1]):path.join(root,"projects",process.argv[projectFlag+1]);
const metaPath=path.join(project,"meta","math-generation.json");
const contract=JSON.parse(fs.readFileSync(path.join(root,"scripts/lib/math-course-generation/contract.json"),"utf8"));
const invocation=JSON.parse(fs.readFileSync(metaPath,"utf8"));
const workspace=path.resolve(path.dirname(metaPath),invocation.workspace);
const html=fs.readFileSync(path.join(workspace,"index.html"),"utf8");
const errors:string[]=[];
if(invocation.contractVersion!==contract.contractVersion)errors.push(`Contract version ${invocation.contractVersion} does not match ${contract.contractVersion}.`);
for(const file of contract.requiredFiles){if(!fs.existsSync(path.join(workspace,file)))errors.push(`Missing required runtime file: ${file}`);}
const targetMatches=[...html.matchAll(/data-target-id="([^"]+)"/g)].map(m=>m[1]);
for(const id of invocation.targetIds){if(targetMatches.filter(x=>x===id).length!==1)errors.push(`Target ${id} must appear exactly once in learner HTML.`);}
const assetsDir=path.join(workspace,"assets");
const learnerFiles=[path.join(workspace,"index.html"),...(fs.existsSync(assetsDir)?fs.readdirSync(assetsDir,{withFileTypes:true}).filter(entry=>entry.isFile()&&/\.js$/i.test(entry.name)).map(entry=>path.join(assetsDir,entry.name)):[]),path.join(workspace,"course.js")].filter(file=>fs.existsSync(file));
const learnerText=learnerFiles.map(file=>fs.readFileSync(file,"utf8")).join("\n").toLowerCase();
for(const phrase of contract.forbiddenLearnerPhrases){if(learnerText.includes(String(phrase).toLowerCase()))errors.push(`Learner runtime contains internal phrase: ${phrase}`);}
for(const block of html.match(/<[^>]+data-guided-task=[\s\S]*?<\/section>/g)||[]){if(/data-answer=|the answer is|answer:\s*<\/strong>/i.test(block))errors.push("A guided task reveals an answer in learner HTML before the attempt.");}
const roleCounts:Record<string,number>={};
for(const role of contract.lessonArchitecture.requiredRoles){roleCounts[role]=(html.match(new RegExp(`data-learning-role="${role}"`,"g"))||[]).length;if(roleCounts[role]<invocation.lessonRoutes.length)errors.push(`Learning role ${role} appears ${roleCounts[role]} times; expected at least ${invocation.lessonRoutes.length}.`);}
const lessonWords:Record<string,number>={};
for(const route of invocation.lessonRoutes){const start=html.indexOf(`id="${route}"`),next=start<0?-1:html.indexOf('<article class="course-page"',start+1),slice=start<0?"":html.slice(start,next<0?html.length:next),text=slice.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&\w+;/g," "),words=(text.match(/[A-Za-z0-9][A-Za-z0-9'−⁻²³]*/g)||[]).length;lessonWords[route]=words;}
const safeRead=(file:string)=>fs.existsSync(file)?fs.readFileSync(file,"utf8"):"";
const practice=safeRead(path.join(workspace,"assets/chapter4-practice-data.js")),mastery=safeRead(path.join(workspace,"assets/chapter4-mastery.js")),policy=safeRead(path.join(workspace,"assets/chapter4-policy.js"));
for(const token of ["familyQuestion","reviewSet"]){if(!practice.includes(token))errors.push(`Practice generator is missing ${token}.`);}
for(const token of ["firstSubmission","finalSubmission","freshAtPresentation","componentResults","confirmedGapAt"]){if(!mastery.includes(token))errors.push(`Mastery runtime is missing protected evidence field ${token}.`);}
for(const stage of contract.assessment.masteryStages){if(!policy.includes(String(stage)))errors.push(`Policy does not declare mastery stage ${stage}.`);}
if(!policy.includes("48*60*60*1000"))errors.push("Policy does not preserve the 48-hour retention delay.");
let adapterMeasurements:Record<string,unknown>={};
if(!invocation.validationAdapter)errors.push("Generation invocation is missing validationAdapter.");
else{
  const adapter=path.resolve(path.dirname(metaPath),invocation.validationAdapter);
  if(!fs.existsSync(adapter))errors.push(`Generation validation adapter does not exist: ${invocation.validationAdapter}`);
  else{
    const run=spawnSync(process.execPath,[adapter,JSON.stringify({project,workspace,invocation,contract})],{encoding:"utf8",maxBuffer:10*1024*1024});
    try{
      const report=JSON.parse(run.stdout||"{}");adapterMeasurements=report.measurements||{};
      for(const error of report.errors||[])errors.push(`Adapter: ${error}`);
      if(run.status!==0&&!(report.errors||[]).length)errors.push(`Generation validation adapter exited with status ${run.status}.`);
      for(const name of contract.requiredAdapterMeasurements||[])if(!Object.hasOwn(adapterMeasurements,name))errors.push(`Generation adapter did not report ${name}.`);
    }catch(error){errors.push(`Generation validation adapter returned invalid JSON: ${String(error)}`);}
  }
}
const result:Result={ok:errors.length===0,errors,measurements:{lessons:invocation.lessonRoutes.length,targets:invocation.targetIds.length,targetMarkup:targetMatches.length,roleCounts,lessonWords,adapter:adapterMeasurements}};
console.log(JSON.stringify(result,null,2));if(!result.ok)process.exitCode=1;
