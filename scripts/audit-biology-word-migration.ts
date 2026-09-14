import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';

const projects=['biology20-unit-a','biology30-unit-a-pilot-2','biology30-unit-b','biology30-unit-c','biology30-unit-d'];
const reports=[];
for(const project of projects){
 const html=await readFile(`projects/${project}/workspace/index.html`),$=load(html.toString());
 const metadata=JSON.parse(await readFile(`projects/${project}/meta/project.json`,'utf8'));
 const isA=project==='biology30-unit-a-pilot-2';
 const source=isA?JSON.parse($('#bio-inline-vocabulary-data').text()):JSON.parse($('#pilot2-course-data').text()).activities.vocabulary;
 const families=isA?source.families:source.conceptFamilies;
 const raw=isA?source.terms:source.introducedTerms.map((t:any)=>({...t,familyIds:families.filter((f:any)=>f.termIds.includes(t.id)).map((f:any)=>f.id)}));
 const terms=new Map<string,any>();
 for(const word of raw){const key=word.term.toLowerCase(),old=terms.get(key);if(old){old.familyIds=[...new Set([...old.familyIds,...word.familyIds])];if(word.definition&&!old.definitions.includes(word.definition))old.definitions.push(word.definition);}else terms.set(key,{term:word.term,sourceId:word.id??null,familyIds:word.familyIds,definitions:word.definition?[word.definition]:[]});}
 reports.push({project,candidateSha256:createHash('sha256').update(html).digest('hex'),regenerateCommand:metadata.regenerateCommand,rawTermEntries:raw.length,uniqueWords:terms.size,categories:families.length,
  words:[...terms.values()].map(w=>({...w,disposition:w.definitions.length===1?'definition-present; word-specific remaining sections require review':w.definitions.length?'conflicting-definitions-review-required':'individual-definition-required; category fallback prohibited'})),
  frayers:families.map((f:any)=>({originalId:f.id,originalLabel:f.label,disposition:'Preserve original saved record; explicit word target and old-writing compatibility require review before activation.'})),status:'inventory-only; no learner mutation'});
}
await mkdir('docs/plans/biology-word-migration',{recursive:true});
await writeFile('docs/plans/biology-word-migration/inventory.json',JSON.stringify({schemaVersion:1,status:'in-progress; not a completion receipt',projects:reports},null,2)+'\n');
console.log(JSON.stringify(reports.map(({words,frayers,...r})=>r)));
