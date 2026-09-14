import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {MODULES,ROOT,sha} from './intake.js';

type Plan={name:string;sha256:string;rows:{cells:string[]}[]};
type Slide={number:number;paragraphs:string[]};
export type Biology20Topic={id:string;title:string;chapter:number;planRows:{source:string;row:number;days:string}[];slideNumbers:number[];sourceActivities:string[];calendarDays:number;outcomeIds:string[];status:'source-mapped'};
const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function days(value:string){const n=value.match(/\d+/g)?.map(Number)??[];if(!n.length)throw Error(`Unrecognized plan day ${value}`);return n.length===1?1:n[1]-n[0]+1;}
export function mapBiology20Topics(id:string,chapters:readonly number[],plans:Plan[],slides:Slide[]){
 const topics:Biology20Topic[]=[],reviews:any[]=[];
 for(const chapter of chapters){
  const plan=plans.find(p=>p.name===`Chapter ${chapter} Daily Plans.docx`);if(!plan)throw Error(`Missing plan ${chapter}`);
  for(const [row,{cells}]of plan.rows.entries()){
   if(row===0)continue;if(cells.length!==3)throw Error(`Unexpected plan table shape ${plan.name}:${row}`);
   const [day,title,activities]=cells,ref={source:plan.name,row,days:day};
   if(/\bQuiz\b/.test(title)){reviews.push({chapter,planRow:ref,sourceActivities:activities,disposition:'chapter-practice-and-review; secure-quiz-not-copied'});continue;}
   const range=/slides\s+(\d+)\s*[–—-]\s*(\d+)/i.exec(activities);if(!range)throw Error(`Missing slide range ${plan.name}:${row}`);
   const first=Number(range[1]),last=Number(range[2]);let selected=slides.filter(s=>s.number>=first&&s.number<=last).map(s=>s.number);
   if(selected.length!==last-first+1)throw Error(`Incomplete slide range ${plan.name}:${row}`);
   // Source inspection confirms slide100 is the Chapter7 REVIEW page;101
   // introduces Chapter8. Retain it in Chapter7, not as new circulation teaching.
   if(chapter===8&&first===100)selected=selected.filter(n=>n!==100);
   const previous=topics.at(-1);
   if(chapter===5&&title==='Cellular Respiration Part 2'){
    if(!previous||previous.title!=='Cellular Respiration Part 1'||JSON.stringify(previous.slideNumbers)!==JSON.stringify(selected))throw Error('Respiration continuation no longer matches the source');
    previous.title='Cellular Respiration';previous.id=`${id}-topic-cellular-respiration`;previous.planRows.push(ref);previous.sourceActivities.push(activities);previous.calendarDays+=days(day);continue;
   }
   topics.push({id:`${id}-topic-${slug(title)}`,title,chapter,planRows:[ref],slideNumbers:selected,sourceActivities:[activities],calendarDays:days(day),outcomeIds:[],status:'source-mapped'});
  }
 }
 const owners=new Map<number,string>();for(const topic of topics)for(const n of topic.slideNumbers){if(owners.has(n))throw Error(`Unresolved duplicate slide ownership ${n}: ${owners.get(n)} / ${topic.id}`);owners.set(n,topic.id);}
 const unassigned=slides.filter(s=>!owners.has(s.number)).map(s=>({number:s.number,title:s.paragraphs[0]??'',disposition:id==='a'&&s.number===78&&s.paragraphs[0]==='REVIEW:'?'optional-unit-review-video-index; retain-links-after-media-review':'pending-source-review'}));
 return {topics,reviews,unassignedSlides:unassigned};
}
/** Mechanical source map only. Never stamps curriculum/academic clearance. */
export async function prepareBiology20TopicMap(repo:string){
 const root=path.join(repo,ROOT),plans:Plan[]=JSON.parse(await readFile(path.join(root,'extracted/plans.json'),'utf8')),manifest=await readFile(path.join(root,'resource-manifest.json'),'utf8'),results=[];
 for(const module of MODULES){const deck=JSON.parse(await readFile(path.join(root,`extracted/decks/${module.id}.json`),'utf8')),mapped=mapBiology20Topics(module.id,module.chapters,plans,deck.slides);results.push({module:module.id,...mapped});}
 const record={schemaVersion:1,status:'source-map-complete; academic-mapping-pending',sourceManifestSha256:sha(manifest),pacing:'Source calendar days are preserved; minutes will be derived from authored work rather than guessed period lengths.',modules:results};
 await writeFile(path.join(root,'topic-map.json'),JSON.stringify(record,null,2)+'\n');return record;
}
