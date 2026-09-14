import {selectSourceVideos,type SourceVideoMetadata} from './pilot2-source-videos.js';
import {selectTopicMedia,type TopicMediaManifest} from './pilot2-media.js';
import {createHash} from 'node:crypto';
import {readFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {readBiology30TopicContract,type TopicUnit} from './pilot2-contract.js';
import {validateBiology30Instruction,validateBiology30TopicTeaching,type CoreTeaching,type Instruction,type TopicTeaching} from './pilot2-instruction-audit.js';
import {validateBiology30LearningInputs,type LearningInputs} from './pilot2-learning-audit.js';
import {buildTopicActivityIndex} from './pilot2-activity-index.js';
import {readTopicFigureBindings,type TopicFigureBindings} from './pilot2-figure-bindings.js';
import {graphMaximumResponse,type GraphWork} from './pilot2-graph-work.js';
import type {TopicStateSchema} from './pilot2-state.js';
import type {TopicCourseInputs} from './pilot2-render-course.js';
import type {RenderTopicVocabulary} from './pilot2-render-vocabulary.js';
import type {RenderPractice} from './pilot2-render-controls.js';
import type {TopicFigure} from './pilot2-render-topic.js';
import type {Biology30SuspendDataSchema} from './suspend-data.js';
import {prepareTopicWordProfile} from './pilot2-word-profile.js';
import type {BiologyWordPageData} from '../../biology30-vocabulary/word-page.js';

const resources='projects/resources/biology30-production/v1';
const sharedAssets='projects/resources/biology30-unit-a-pilot/v2/assets';
const digest=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');
export type TopicInputFile={file:string;sha256:string};
export type TopicAssetCopy={sourcePath:string;destination:string;sha256:string};

/** Read-only preparation. It deliberately produces no HTML, writes no learner
 * files and cannot turn incomplete figures or review gates into a candidate. */
export async function inspectTopicInputs(repoRoot:string,unit:TopicUnit) {
 const root=await realpath(repoRoot),base=`${resources}/units/unit-${unit.toLowerCase()}`,files:TopicInputFile[]=[];
 const bytes=async(file:string)=>{
  if(path.posix.normalize(file)!==file||file.includes('\\')||!(file.startsWith(resources+'/')||file.startsWith(sharedAssets+'/')))throw new Error(`Unsafe topic input: ${file}`);
  const absolute=path.join(root,file);if(await realpath(absolute)!==absolute)throw new Error(`Topic input resolves through a symlink: ${file}`);
  const value=await readFile(absolute);files.push({file,sha256:digest(value)});return value;
 };
 const json=async<T>(name:string):Promise<T>=>JSON.parse((await bytes(`${base}/pilot2-${name}.json`)).toString('utf8'));
 const checked=await readBiology30TopicContract(root,unit),contract=checked.contract;
 files.push({file:checked.file,sha256:checked.sha256});
 const [core,instruction,framing,state,practice,vocabulary,timing,models,investigations,seminar,textbook,books,figureManifest,legacySchema,primaryGraph]=await Promise.all([
  json<CoreTeaching>('content'),json<Instruction>('instruction'),json<TopicTeaching>('topic-teaching'),json<TopicStateSchema>('state-schema'),
  json<LearningInputs['practice']&{items:RenderPractice[]}>('practice'),json<RenderTopicVocabulary&{introducedTerms:(RenderTopicVocabulary['introducedTerms'][number]&{requiredIntroductionTarget:string})[]}>('vocabulary'),json<LearningInputs['timing']>('time'),
  json<{unit:string;models:TopicCourseInputs['models']}>('models'),json<{unit:string;investigations:TopicCourseInputs['investigations']}>('investigations'),json<TopicCourseInputs['seminar']>('review-seminar'),
  json<{unit:string;groups:TopicCourseInputs['textbookGroups']}>('textbook-guides'),json<{unit:string;chapters:{chapter:number;pdfPath:string;sha256:string;pages:{physicalPage:number;printedFolio:number|null;sequenceFolio:number}[]}[]}>('textbook'),json<TopicFigureBindings>('figures'),json<Biology30SuspendDataSchema>('legacy-schema'),json<GraphWork>('graph-work')
 ]);
 if([models.unit,investigations.unit,seminar.unit,textbook.unit,books.unit].some(value=>value!==unit))throw new Error('Cross-unit course assembly input');
 validateBiology30Instruction(contract,core,instruction);
 validateBiology30TopicTeaching(contract,core,instruction,framing,state,vocabulary);
 validateBiology30LearningInputs(contract,{practice,vocabulary,timing,state});
 // Only explicitly reviewed units opt in; the remaining candidates keep their
 // existing save format until their individual word content is ready.
 const wordData=prepareTopicWordProfile(JSON.parse((await bytes(`${base}/word-details.json`)).toString()) as BiologyWordPageData,vocabulary,state);
 const graphs=[primaryGraph,...(unit==='D'?[await json<GraphWork>('demographic-graph-work')]:[])];
 const responseOwners=new Set<string>();
 for(const graph of graphs){
  if(graph.unit!==unit||responseOwners.has(graph.responseId)||!state.responses[graph.responseId])throw new Error('Graph assembly lost its unique response owner');
  responseOwners.add(graph.responseId);graphMaximumResponse(graph,state.responses[graph.responseId].limit);
 }
 const figureResult=await readTopicFigureBindings(root,contract,figureManifest);
 const mediaManifest=await json<TopicMediaManifest>('link-dispositions');
 const sourceMetadata=JSON.parse((await bytes(`${resources}/pilot2/source-review/powerpoint-video-metadata.json`)).toString()) as SourceVideoMetadata;
 const sourceAuthorization=(mediaManifest as TopicMediaManifest&{sourceLibrary?:{authorityEvidence:string;authoritySha256:string;metadataSha256:string}}).sourceLibrary;
 if(sourceAuthorization&&(digest(await bytes(sourceAuthorization.authorityEvidence))!==sourceAuthorization.authoritySha256||digest(await bytes(`${resources}/pilot2/source-review/powerpoint-video-metadata.json`))!==sourceAuthorization.metadataSha256))throw new Error('Source video authorization or metadata drift');
 const sourceVideos=selectSourceVideos(mediaManifest,sourceMetadata,contract);
 const videos=selectTopicMedia(mediaManifest,contract,framing,figureResult.figures.map(figure=>figure.id));
 for(const clip of videos)if(digest(await bytes(clip.review.evidencePath))!==clip.review.evidenceSha256)throw new Error(`Selected media review bytes changed: ${clip.videoId}`);
 const copies:TopicAssetCopy[]=[...figureResult.copies];
 // Include exact scientific-review bytes in the assembly closure, not only the
 // JSON manifest that names them. The figure reader has verified their hashes.
 for(const asset of figureManifest.assets){await bytes(asset.sourcePath);await bytes(asset.scienceReview.evidencePath);}
 const requiredPdfs=new Set(textbook.groups.flatMap(group=>group.items.map(item=>item.chapterPdf)));
 for(const destination of requiredPdfs){
  const chapter=/^assets\/textbook\/chapter-(\d+)\.pdf$/.exec(destination)?.[1],matches=books.chapters.filter(book=>book.chapter===Number(chapter));
  if(!chapter||matches.length!==1)throw new Error(`Missing unique textbook asset: ${destination}`);
  const source=matches[0];if(!source.pdfPath.startsWith(`${resources}/pilot2/intake/`))throw new Error('Textbook asset is outside immutable intake');
  const pdf=await bytes(source.pdfPath);if(digest(pdf)!==source.sha256||pdf.subarray(0,5).toString()!=='%PDF-')throw new Error(`Textbook bytes changed: ${destination}`);
  copies.push({sourcePath:source.pdfPath,destination,sha256:source.sha256});
 }
 const logoPath='assets/brand/nxt-ce-logo-white-with-ce.png',logoSource=`${sharedAssets}/brand/nxt-ce-logo-white-with-ce.png`;
 copies.push({sourcePath:logoSource,destination:logoPath,sha256:digest(await bytes(logoSource))});
 for(const name of ['HankenGrotesk-Variable.ttf','WorkSans-Variable.ttf','OFL-Hanken-Grotesk.txt','OFL-Work-Sans.txt']){
  const sourcePath=`${resources}/pilot2/presentation-assets/fonts/${name}`;
  copies.push({sourcePath,destination:`assets/fonts/${name}`,sha256:digest(await bytes(sourcePath))});
 }
 const materials:TopicCourseInputs['materials']=[];
 for(const item of investigations.investigations)for(const material of item.materialFiles){
  if(digest(await bytes(material.path))!==material.sha256)throw new Error(`Investigation material bytes changed: ${material.path}`);
  if(!/\.(svg|png|jpe?g|webp)$/i.test(material.path))continue;
  if(materials.some(binding=>binding.sourcePath===material.path))continue;
  const matches=figureManifest.assets.filter(asset=>asset.sourcePath===material.path&&asset.sha256===material.sha256);
  if(matches.length!==1)throw new Error(`Investigation lacks one reviewed image descriptor: ${material.path}`);
  const asset=matches[0],figure:TopicFigure={id:`${unit.toLowerCase()}-material-${asset.id}`,src:asset.destination,width:asset.width,height:asset.height,alt:asset.alt,caption:asset.caption,equivalentExplanation:asset.equivalentExplanation,sha256:asset.sha256,scienceReview:'passed',useScope:'local-blocked-review'};
  materials.push({sourcePath:material.path,figure});
 }
 if(new Set(copies.map(copy=>copy.destination)).size!==copies.length)throw new Error('Duplicate course asset destination');
 const textbookLinks=contract.topics.map(topic=>{
  const assignment=(topic as typeof topic&{teacherTextbookAssignment?:string}).teacherTextbookAssignment??'';
  const book=books.chapters.find(b=>b.chapter===topic.chapter),folios=(assignment.match(/\d{3}/g)??[]).map(Number),page=folios.map(n=>book?.pages.find(p=>p.printedFolio===n)).find(Boolean),printedPage=page?.printedFolio;
  if(!page||printedPage==null)throw new Error(`Missing recorded lesson textbook folio: ${topic.id}/${printedPage}`);
  return{topicId:topic.id,pdf:`assets/textbook/chapter-${topic.chapter}.pdf`,printedPage,physicalPage:page.physicalPage};
 });
 const activities={contract,state,framing,instruction,practice,vocabulary,models,investigations,seminar,textbook};
 const index=buildTopicActivityIndex(activities);
 const uniqueFiles=new Map<string,string>();for(const file of files){if(uniqueFiles.has(file.file)&&uniqueFiles.get(file.file)!==file.sha256)throw new Error(`Input changed during assembly: ${file.file}`);uniqueFiles.set(file.file,file.sha256);}
 // Overview text is derived from already governed topic titles and learning
 // goals, avoiding a second unsynchronised set of curriculum claims.
 const title=`Biology 30 — Unit ${unit}: ${{B:'Reproduction and Development',C:'Cell Division, Genetics and Molecular Biology',D:'Population and Community Dynamics'}[unit]}`;
 const summary=`Work through ${contract.topics.length} topics, use the local illustrated explanations, and save your reasoning as you practise.`;
 return {unit,title,summary,outcomes:framing.topics.map(topic=>topic.learningGoal),topic:{contract,core,instruction,framing,state,vocabulary,timing,textbookLinks,practice:practice.items,figures:figureResult.figures,graphs},models:models.models,investigations:investigations.investigations,seminar,textbookGroups:textbook.groups,materials,legacySchema,logoPath,activities,index,copies,
  files:[...uniqueFiles].sort(([a],[b])=>a.localeCompare(b)).map(([file,sha256])=>({file,sha256})),
  wordData,sourceVideos,videos,figureStatus:figureManifest.status,pendingFigures:figureResult.pending,reviewGates:checked.report.pending,rendered:false as const};
}

/** Every unit must be frozen before a production caller may obtain inputs.
 * This does not replace the separately required transitive code/asset closure. */
export async function readFrozenTopicInputs(repoRoot:string,unit:TopicUnit) {
 for(const code of ['B','C','D'] as const)await readBiology30TopicContract(repoRoot,code,true);
 const input=await inspectTopicInputs(repoRoot,unit);
 if(input.figureStatus!=='complete-author-review'||input.pendingFigures.length)throw new Error('Frozen topic inputs still contain unresolved required figures');
 return input;
}
