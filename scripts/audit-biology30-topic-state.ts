import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { emptyTopicState, encodeTopicState, TOPIC_STATE_TARGET, TOPIC_STATE_GUARD, type TopicStateSchema } from "./lib/biology30-course/v1/pilot2-state.js";
if(process.argv.slice(2).some(a=>a!=="--write"))throw new Error("Usage: audit-biology30-topic-state [--write]");
const reports=[];
for(const unit of ["B","C","D"]){
  const base=`projects/resources/biology30-production/v1/units/unit-${unit.toLowerCase()}`;const bytes=await readFile(`${base}/pilot2-state-schema.json`);const schema=JSON.parse(bytes.toString("utf8")) as TopicStateSchema;
  const results=[];
  for(const character of ["x","漢","🧬",'"',"\u0001"]){
    const state=emptyTopicState(schema);state.updatedAt="2026-09-06T12:00:00.000Z";state.frayerChoices=schema.families.selectable.slice(0,2);const active=new Set([...schema.families.fixed,...state.frayerChoices]);const excluded=new Set(Object.entries(schema.families.responseIds).filter(([id])=>!active.has(id)).flatMap(([,ids])=>ids));
    for(const [id,field]of Object.entries(schema.responses))if(!excluded.has(id))state.responses[id]=character.repeat(Math.floor(field.limit/character.length));
    for(const [id,choice]of Object.entries(schema.choices))state.choices[id]=choice.values.at(-1)!;state.flags=Object.keys(schema.flags);state.visited=[...schema.routes];
    const chars=encodeTopicState(state,schema,Number.MAX_SAFE_INTEGER).length;results.push({fixture:character==="\u0001"?"JSON-escaped control":character==='"'?"quotes":character,filledTextFields:Object.keys(state.responses).length,serializedCharacters:chars,withinTarget:chars<=TOPIC_STATE_TARGET,guardWouldAccept:chars<=TOPIC_STATE_GUARD});
  }
  const report={unit,status:"engine-tests-passed-browser-integration-pending",schemaSha256:createHash("sha256").update(bytes).digest("hex"),targetMaximumCharacters:TOPIC_STATE_TARGET,runtimeHardGuardCharacters:TOPIC_STATE_GUARD,fixtures:results,policy:"Ordinary and Unicode all-field maximum states fit the target. Heavy JSON escaping and combined legacy work may exceed the guard; reject the write without truncation or replacing the last valid local/LMS payload. Preserve and expose the original legacy payload. This is not live LMS certification.",browserEvidence:null,liveLmsCertification:false};
  if(!results.slice(0,3).every(r=>r.withinTarget))throw new Error(`${unit} maximum ordinary/Unicode state exceeds target`);if(process.argv.includes("--write"))await writeFile(`${base}/pilot2-state-budget.json`,JSON.stringify(report,null,2)+"\n");reports.push(report);
}
console.log(JSON.stringify(reports,null,2));
