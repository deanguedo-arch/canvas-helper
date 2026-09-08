import type {TopicContract} from './pilot2-contract.js';
import type {TopicTeaching} from './pilot2-instruction-audit.js';
import {topicHtml as h} from './pilot2-render-common.js';

export type TopicMediaReview={status:'author-reviewed-provisional';evidencePath:string;evidenceSha256:string;captions:string;facts:string;prerequisites:string;pace:string;relevance:string;segment:string;localEquivalence:string};
export type TopicMediaCandidate={videoId:string;learnerSelected:boolean;required:boolean;providerFilesDownloaded:boolean;sourceOccurrences:{videoId:string;unit:string;url:string;relationshipId:string}[];teachingTopicIds:string[];localWalkthroughTargets:string[];selection?:{title:string;category:string;startSeconds:number;endSeconds:number;captionGuidance:string;prerequisiteGuidance:string;review:TopicMediaReview}};
export type TopicMediaManifest={unit:string;teacherDecision:null;youtubeCandidates:TopicMediaCandidate[]};
export type TopicMediaClip={videoId:string;title:string;category:string;startSeconds:number;endSeconds:number;captionGuidance:string;prerequisiteGuidance:string;review:TopicMediaReview;topics:{id:string;title:string;walkthroughId:string;checkpointId:string}[]};
/** Metadata reachability never selects a clip. Only explicit reviewed selections
 * enter the learner inventory; all source occurrences stay in canonical input. */
export function selectTopicMedia(manifest:TopicMediaManifest,contract:TopicContract,framing:TopicTeaching,figureIds:string[]) {
 if(manifest.unit!==contract.unit||manifest.teacherDecision!==null)throw new Error('Cross-unit or accepted media manifest');
 const seen=new Set<string>(),clips:TopicMediaClip[]=[];
 for(const candidate of manifest.youtubeCandidates){
  if(!/^[a-zA-Z0-9_-]{11}$/.test(candidate.videoId)||seen.has(candidate.videoId)||!candidate.sourceOccurrences.length||candidate.sourceOccurrences.some(source=>source.videoId!==candidate.videoId||source.unit!==contract.unit)||candidate.providerFilesDownloaded!==false)throw new Error('Media source identity, deduplication or provider-file contract drift');
  seen.add(candidate.videoId);
  if(!candidate.learnerSelected){if(candidate.required)throw new Error('Unselected clip cannot be required');continue;}
  const choice=candidate.selection,review=choice?.review;
  if(!choice||!review||review.status!=='author-reviewed-provisional'||!/^projects\/resources\/biology30-production\/v1\/.+\.json$/.test(review.evidencePath)||review.evidencePath.includes('..')||!/^[a-f0-9]{64}$/.test(review.evidenceSha256)||![choice.title,choice.category,choice.captionGuidance,choice.prerequisiteGuidance,review.captions,review.facts,review.prerequisites,review.pace,review.relevance,review.segment,review.localEquivalence].every(value=>typeof value==='string'&&value.trim())||!Number.isInteger(choice.startSeconds)||!Number.isInteger(choice.endSeconds)||choice.startSeconds<0||choice.endSeconds<=choice.startSeconds)throw new Error('Selected clip lacks complete caption, science, pacing and segment review');
  if(!candidate.teachingTopicIds.length||new Set(candidate.teachingTopicIds).size!==candidate.teachingTopicIds.length||candidate.localWalkthroughTargets.length!==candidate.teachingTopicIds.length)throw new Error('Selected clip lost its local topic mapping');
  const topics=candidate.teachingTopicIds.map((id,index)=>{
   const topic=contract.topics.find(topic=>topic.id===id),local=framing.topics.find(topic=>topic.topicId===id)?.localWalkthrough;
   if(!topic||!local||candidate.localWalkthroughTargets[index]!==`${id}-walkthrough`||local.frames.some(frame=>!figureIds.includes(frame.figureTarget))||!local.checkpoint.sameForLocalAndVettedExternal||!local.checkpoint.requiredAttemptForCompletion)throw new Error('Selected clip has no complete illustrated local path and shared checkpoint');
   return{id,title:topic.title,walkthroughId:`${id}-walkthrough`,checkpointId:local.checkpoint.responseId};
  });
  clips.push({videoId:candidate.videoId,title:choice.title,category:choice.category,startSeconds:choice.startSeconds,endSeconds:choice.endSeconds,captionGuidance:choice.captionGuidance,prerequisiteGuidance:choice.prerequisiteGuidance,review,topics});
 }
 return clips;
}
const returnLink=(topic:TopicMediaClip['topics'][number],checkpoint=false)=>`<a href="#${h(topic.id)}" data-pilot2-return-route="${h(topic.id)}" data-pilot2-return-focus="${h(checkpoint?topic.checkpointId:topic.walkthroughId)}">${checkpoint?'Use the same checkpoint':'Open the illustrated walkthrough'}: ${h(topic.title)}</a>`;
export function renderTopicMediaClip(clip:TopicMediaClip,instance:string,topicId?:string) {
 const topics=topicId?clip.topics.filter(topic=>topic.id===topicId):clip.topics;
 if(!topics.length||!/^[a-zA-Z0-9_-]+$/.test(instance)||!/^[a-zA-Z0-9_-]{11}$/.test(clip.videoId))throw new Error('Invalid media renderer identity');
 return `<section class="p2-media" data-pilot2-video="${h(clip.videoId)}" data-pilot2-video-start="${clip.startSeconds}" data-pilot2-video-end="${clip.endSeconds}"><h3>${h(clip.title)}</h3><p>Suggested segment: ${clip.startSeconds}–${clip.endSeconds} seconds. ${h(clip.prerequisiteGuidance)}</p><div class="p2-media-player" data-pilot2-video-host id="${h(instance)}"></div><p role="status" data-pilot2-video-status>Preview loads when this section is visible. Use the player’s own controls.</p><p><a href="https://www.youtube.com/watch?v=${h(clip.videoId)}&amp;t=${clip.startSeconds}s" target="_blank" rel="noopener noreferrer">Open on YouTube</a>. ${h(clip.captionGuidance)}</p><details data-pilot2-video-local><summary>Use the local learning path</summary><p>The illustrated explanation and checkpoint are available without the video.</p><ul>${topics.map(topic=>`<li>${returnLink(topic)} · ${returnLink(topic,true)}</li>`).join('')}</ul></details><p>Your checkpoint attempt records your work; viewing time is not a completion requirement.</p></section>`;
}
export function renderTopicVideoLibrary(clips:TopicMediaClip[],contract:TopicContract) {
 const categories=[...new Set(clips.map(clip=>clip.category))];
 return `<div class="p2-topic"><h1>Video Library</h1>${clips.length?'<p>Use these clips with the illustrated explanations and checkpoints in your topics.</p>':'<p>No external clips are included in this version. Use the illustrated walkthroughs within the topics.</p>'}${categories.map(category=>`<section><h2>${h(category)}</h2>${clips.filter(clip=>clip.category===category).map(clip=>renderTopicMediaClip(clip,`p2-library-${clip.videoId}`)).join('')}</section>`).join('')}<section><h2>Local walkthroughs</h2><ul>${contract.topics.map(topic=>`<li>${returnLink({id:topic.id,title:topic.title,walkthroughId:`${topic.id}-walkthrough`,checkpointId:`${topic.id}-media`})}</li>`).join('')}</ul></section></div>`;
}
export const TOPIC_MEDIA_CSS='.p2-media{margin-block:2rem}.p2-media-player{width:100%;aspect-ratio:16/9;min-height:200px}.p2-media-player iframe,iframe.p2-media-player{width:100%;height:100%;min-height:200px;border:0}.p2-media-player[hidden]{display:none}.p2-media p,.p2-media li{overflow-wrap:anywhere}.p2-media details{margin-block:1rem}@media print{.p2-media-player{display:none}}';
