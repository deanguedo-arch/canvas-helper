import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {ROOT,PROGRAM_URL,sha} from './intake.js';

/** Source extraction, not an assertion that a lesson assesses an outcome. */
export function extractBiology20Outcomes(text:string){
 const lines=text.split('\n'),starts:{line:number;id:string;unit:string;group:number;category:string}[]=[];
 for(const [line,value]of lines.entries()){const m=/^20[–-]([ABCD])(\d)\.(\d+)(sts|k|s)\b/.exec(value.trim());if(m)starts.push({line,id:`20-${m[1]}${m[2]}.${m[3]}${m[4]}`,unit:m[1],group:Number(m[2]),category:m[4]==='k'?'knowledge':m[4]==='s'?'skills':'sts'});}
 const seen=new Set<string>();return starts.map((start,i)=>{
  if(seen.has(start.id))throw Error(`Duplicate official outcome ${start.id}`);seen.add(start.id);
  let end=start.line+1;while(end<(starts[i+1]?.line??lines.length)&&lines[end].trim()&&!/^(Specific Outcomes|General Outcome|Note:|Students will:)/.test(lines[end].trim()))end++;
  return {...start,moduleId:start.unit==='D'?(start.group<=2?'d-part-1':'d-part-2'):start.unit.toLowerCase(),sourceStartLine:start.line+1,sourceEndLine:end,sourceExcerpt:lines.slice(start.line,end).join('\n').trim(),teaching:[],independentEvidence:[],coverageStatus:'unmapped',examplesPolicy:'Consult source PDF typography: illustrative examples are not automatically additional required outcomes.'};
 });
}
export async function prepareBiology20Curriculum(repo:string){
 const root=path.join(repo,ROOT),text=await readFile(path.join(root,'authority/program.txt'),'utf8'),source=JSON.parse(await readFile(path.join(root,'authority/source.json'),'utf8')),program=await readFile(path.join(root,'authority/program.pdf'));
 if(sha(program)!==source.sha256)throw Error('Curriculum source hash mismatch');
 const outcomes=extractBiology20Outcomes(text);for(const unit of ['A','B','C','D'])if(!outcomes.some(o=>o.unit===unit))throw Error(`Missing Biology 20 unit ${unit}`);
 const record={schemaVersion:1,sourceUrl:PROGRAM_URL,sourceSha256:source.sha256,status:'official-identifiers-extracted; coverage-review-pending',attitudeOutcomes:{source:'authority/program.txt',status:'cross-course-design-review-pending',physicalAndCollaborationLimits:'An online independent alternative is not evidence of physical manipulation or actual teamwork.'},outcomes};
 await writeFile(path.join(root,'authority/outcome-register.json'),JSON.stringify(record,null,2)+'\n');return record;
}
