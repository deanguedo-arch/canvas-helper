import {createHash} from 'node:crypto';
import {readFile,realpath,lstat} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {load} from 'cheerio';
import type {TopicContract} from './pilot2-contract.js';
import type {TopicFigure} from './pilot2-render-topic.js';
export type TopicFigureAsset={id:string;sourcePath:string;destination:string;sha256:string;width:number;height:number;alt:string;caption:string;equivalentExplanation:string;provenance:string;rightsScope:'local-blocked-review';scienceReview:{status:'author-reviewed-provisional';evidencePath:string;evidenceSha256:string;finding:string};teacherDecision:null};
export type TopicFigureBindings={schemaVersion:1;unit:'B'|'C'|'D';status:'draft'|'complete-author-review';teacherDecision:null;targets:{partId:string;figureId:string;assetId:string|null;purpose:string;bindingReview:string|null;panelAssetIds?:string[];groupCaption?:string;groupEquivalentExplanation?:string;groupComparisonGuide?:string}[];assets:TopicFigureAsset[]};
/** Local reviewed originals only. Return a copy plan; never copy into learners
 * or mutate source bytes during draft inspection. Whole-build freeze is separate. */
export async function readTopicFigureBindings(repoRoot:string,contract:TopicContract,manifest:TopicFigureBindings,requireComplete=false) {
 if(manifest.schemaVersion!==1||manifest.unit!==contract.unit||manifest.teacherDecision!==null)throw new Error('Invalid unit figure contract');
 const expected=contract.topics.flatMap(topic=>topic.parts.map(part=>part.id));
 if(manifest.targets.length!==expected.length||new Set(manifest.targets.map(target=>target.partId)).size!==expected.length||manifest.targets.some(target=>!expected.includes(target.partId)||target.figureId!==`${target.partId}-figure`||!target.purpose.trim()))throw new Error('Figure target inventory drift');
 const ids=new Set<string>(),destinations=new Set<string>();
 const root=await realpath(repoRoot),resourceRoot=path.join(root,'projects/resources/biology30-production/v1');
 const resourceFile=async(relative:string)=>{
  if(!relative.startsWith('projects/resources/biology30-production/v1/')||relative.includes('..')||path.isAbsolute(relative)||relative.includes('\\'))throw new Error('Figure evidence outside the owning resources');
  const absolute=path.join(root,relative),resolved=await realpath(absolute);if(resolved!==absolute||!resolved.startsWith(resourceRoot+path.sep)||(await lstat(absolute)).isSymbolicLink())throw new Error('Figure resource resolves through a symlink');return readFile(absolute);
 };
 const verified=new Map<string,TopicFigureAsset>(),copies:{sourcePath:string;destination:string;sha256:string}[]=[];
 for(const asset of manifest.assets){
  if(!asset.id||ids.has(asset.id)||destinations.has(asset.destination)||!/^assets\/figures\/[a-z0-9-]+\.(svg|png|jpe?g|webp)$/.test(asset.destination)||!asset.alt.trim()||!asset.caption.trim()||!asset.equivalentExplanation.trim()||!asset.provenance.trim()||asset.rightsScope!=='local-blocked-review'||asset.teacherDecision!==null||asset.scienceReview.status!=='author-reviewed-provisional'||!asset.scienceReview.finding.trim())throw new Error('Incomplete, duplicate or unsafe figure asset');
  ids.add(asset.id);destinations.add(asset.destination);
  const bytes=await resourceFile(asset.sourcePath),hash=createHash('sha256').update(bytes).digest('hex');if(hash!==asset.sha256)throw new Error(`Figure source bytes changed: ${asset.id}`);
  if(createHash('sha256').update(await resourceFile(asset.scienceReview.evidencePath)).digest('hex')!==asset.scienceReview.evidenceSha256)throw new Error(`Figure review evidence changed: ${asset.id}`);
  if(asset.destination.endsWith('.svg')){const source=bytes.toString('utf8'),$=load(source,{xmlMode:true});if(/<!DOCTYPE|<!ENTITY/i.test(source)||$('svg').length!==1||$('script,foreignObject').length||/<\?xml-stylesheet|@import/i.test(source)||$('*').toArray().some(node=>'attribs' in node&&Object.entries(node.attribs).some(([key,value])=>/^on/i.test(key)||(/(?:^|:)href$/i.test(key)&&!value.startsWith('#'))||/url\(\s*['"]?(?!#)/i.test(value))))throw new Error('Active or external SVG content is not a local teaching figure');}
  const metadata=await sharp(bytes).metadata(),extension=path.extname(asset.destination).slice(1),format=extension==='jpg'?'jpeg':extension;if(metadata.format!==format)throw new Error(`Figure file format differs from its destination: ${asset.id}`);if(metadata.width!==asset.width||metadata.height!==asset.height)throw new Error(`Figure intrinsic dimensions changed: ${asset.id}`);
  verified.set(asset.id,asset);copies.push({sourcePath:asset.sourcePath,destination:asset.destination,sha256:asset.sha256});
 }
 const pending=manifest.targets.filter(target=>!target.assetId||!target.bindingReview?.trim()),figures:TopicFigure[]=[];
 const descriptor=(asset:TopicFigureAsset,id:string):TopicFigure=>({id,src:asset.destination,width:asset.width,height:asset.height,alt:asset.alt,caption:asset.caption,equivalentExplanation:asset.equivalentExplanation,scienceReview:'passed',useScope:'local-blocked-review',sha256:asset.sha256});
 for(const target of manifest.targets){
  if(!target.assetId){if(target.panelAssetIds)throw new Error('Figure group lacks its primary asset');continue;}
  const asset=verified.get(target.assetId);if(!asset)throw new Error(`Unknown bound figure asset: ${target.figureId}`);
  const figure=descriptor(asset,target.figureId);
  if(target.panelAssetIds){
   if(target.panelAssetIds.length<2||target.panelAssetIds.length>8||target.panelAssetIds[0]!==target.assetId||new Set(target.panelAssetIds).size!==target.panelAssetIds.length||!target.groupCaption?.trim()||!target.groupEquivalentExplanation?.trim())throw new Error('Incomplete teaching figure group');
   figure.panels=target.panelAssetIds.map((id,index)=>{const panel=verified.get(id);if(!panel)throw new Error(`Unknown figure panel asset: ${id}`);return descriptor(panel,`${target.figureId}-panel-${index+1}`);});
   figure.caption=target.groupCaption;figure.equivalentExplanation=target.groupEquivalentExplanation;
   figure.comparisonGuide=target.groupComparisonGuide;
  }
  if(target.bindingReview?.trim())figures.push(figure);
 }
 if(requireComplete&&(manifest.status!=='complete-author-review'||pending.length))throw new Error(`Figure bindings incomplete: ${pending.length} required targets pending`);
 return{unit:manifest.unit,figures,copies,pending:pending.map(target=>target.figureId),teacherDecision:null};
}
