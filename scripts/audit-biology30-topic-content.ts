import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { readBiology30TopicContract, type TopicUnit } from "./lib/biology30-course/v1/pilot2-contract.js";
import { topicReadingEstimate as reading, inspectTopicReading } from "./lib/biology30-course/v1/pilot2-reading.js";
const args=process.argv.slice(2);if(args.some(a=>!["--write","--require-reading"].includes(a)))throw new Error("Usage: audit-biology30-topic-content [--write] [--require-reading]");
const reports=[];
for(const unit of ["B","C","D"] as TopicUnit[]){
 const base=`projects/resources/biology30-production/v1/units/unit-${unit.toLowerCase()}`;const {contract}=await readBiology30TopicContract(process.cwd(),unit);const bytes=await readFile(`${base}/pilot2-content.json`);const content=JSON.parse(bytes.toString("utf8")) as {unit:string;parts:{id:string;title:string;paragraphs:string[]}[]};
 if(content.unit!==unit||JSON.stringify(content.parts.map(p=>p.id))!==JSON.stringify(contract.topics.flatMap(t=>t.parts.map(p=>p.id))))throw new Error(`Core part inventory drift: ${unit}`);
 const byPart=new Map(content.parts.map(p=>[p.id,p]));const {partReports, failures: partFailures}=inspectTopicReading(content.parts);
 const topicReports=contract.topics.map(topic=>({topicId:topic.id,...reading(topic.parts.flatMap(p=>byPart.get(p.id)!.paragraphs).join(" "))}));
 const failures=topicReports.filter(t=>t.fleschKincaidGrade>12||t.averageSentenceWords>20);const report={unit,sourceSha256:createHash("sha256").update(bytes).digest("hex"),status:(failures.length || partFailures.length)?"reading-revision-required":"core-reading-estimate-passes-manual-and-complete-content-audit-pending",scope:"Core explanatory paragraphs only; definitions, navigation, guides and controls excluded. Same deterministic estimate as the preserved A method; this is not a comprehension score.",targetRange:[9.5,11.5],ceiling:12,topicReports,partReports,failures:[...failures.map(t=>t.topicId),...partFailures.map(t=>t.partId)],enforcement:"Every core part: grade <=12, average sentence <=20 words, paragraph <=100 words; lesson averages cannot hide dense parts.",pending:["source and first-use review","worked/figure/stop-check/advanced authoring","rendered teaching-before-assessment proof","manual accessible-reading review"]};if(args.includes("--write"))await writeFile(`${base}/pilot2-reading-report.json`,JSON.stringify(report,null,2)+"\n");reports.push(report);
}
console.log(JSON.stringify(reports.map(r=>({unit:r.unit,status:r.status,topics:r.topicReports,highParts:r.partReports.filter(p=>p.fleschKincaidGrade>12).map(p=>({id:p.partId,grade:p.fleschKincaidGrade}))})),null,2));if(args.includes("--require-reading")&&reports.some(r=>r.failures.length))process.exitCode=1;
