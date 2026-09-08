import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import { ONLINE_MICROSCOPY, ONLINE_STUDIES, onlineStudyResponseId } from "./online-studies.js";
import { ONLINE_WALKTHROUGHS } from "./online-media.js";
import { ONLINE_VIDEO_REVIEW } from "./online-video-review.js";
import { PILOT_2_LESSONS } from "./contracts.js";

export const ONLINE_BASELINE="f39669f01779f98a1c8d7d3ec5fe7e1524100d9d55f0b9286c01f4de5603e865";
export const onlineBaselineDirectory=`raw/online-finalization-baselines/${ONLINE_BASELINE}`;
const sha=(value:string)=>createHash("sha256").update(value).digest("hex");

export function buildOnlineFinalizationReport(beforeHtml:string,afterHtml:string,generatedAt:string,estimatedCharacters:number){
  assert.equal(sha(beforeHtml),ONLINE_BASELINE,"Online revision baseline drift");
  const before=load(beforeHtml),after=load(afterHtml);
  for(const selector of ["[data-core-zone]","[data-practice-id]","[data-advanced-block-id]","[data-study-task]",".retrieve-block",".evidence-block","[data-textbook-review-route]"]){
    const original=before(selector).toArray(),current=after(selector).toArray();
    assert.equal(current.length,original.length,`${selector} count changed`);
    original.forEach((node,index)=>assert.equal(after.html(current[index]),before.html(node),`${selector} changed outside the online revision`));
  }
  before("[data-response-id]").each((_i,node)=>{
    const field=before(node),id=field.attr("data-response-id")!;
    const current=after(`[data-response-id="${id}"]`);
    assert.equal(current.length,1,`Lost saved response ${id}`);
    assert.equal(current.attr("maxlength"),field.attr("maxlength"),`Changed existing response capacity ${id}`);
  });
  const added=after("[data-response-id]").toArray().map(node=>after(node).attr("data-response-id")!).filter(id=>!before(`[data-response-id="${id}"]`).length);
  assert.deepEqual(added.sort(),[...ONLINE_STUDIES.map(task=>onlineStudyResponseId(task.id)),ONLINE_MICROSCOPY.responseId].sort());
  assert.equal(after("[data-online-walkthrough]").length,14);
  assert.equal(after("[data-online-walkthrough] .walkthrough-panel").length,42);
  assert.equal(after("[data-online-study]").length,5);
  assert.equal(after("[data-investigation]").length,3);
  assert.ok(estimatedCharacters<=44000);
  const duplicateIds=after("[id]").toArray().map(node=>after(node).attr("id")!).filter((id,index,all)=>all.indexOf(id)!==index);
  assert.deepEqual(duplicateIds,[],"Duplicate focus/SVG identifiers");
  const timeAudit=PILOT_2_LESSONS.map(lesson=>{
    const page=after(`#${lesson.id}`), coreWords=page.find("[data-core-zone]").text().trim().split(/\s+/).length;
    const localWords=page.find("[data-local-equivalent]").text().trim().split(/\s+/).length;
    const videos=ONLINE_WALKTHROUGHS.filter(entry=>entry.lessonId===lesson.id).map(entry=>ONLINE_VIDEO_REVIEW.find(video=>video.id===entry.youtubeId)!);
    const fullSourceVideoMinutes=videos.reduce((sum,video)=>sum+video.sourceSeconds/60,0);
    const selectedVideoMinutes=videos.reduce((sum,video)=>sum+(video.end-video.start)/60,0);
    return {lessonId:lesson.id,allocatedRequiredMinutes:lesson.requiredMinutes,coreWords,localWalkthroughWords:localWords,readingWordsPerMinute:150,fullSourceVideoMinutes:Number(fullSourceVideoMinutes.toFixed(1)),selectedVideoMinutes:Number(selectedVideoMinutes.toFixed(1)),estimateComponents:{coreReadingMinutes:Math.ceil(coreWords/150),mediaMinutes:Math.ceil(Math.max(fullSourceVideoMinutes,localWords/150)),wordsAndStopChecks:10,modelOrWorkedExample:10,guidedPractice:10,evidenceAndRetrieval:10},observation:"Planning estimate, not stopwatch evidence. Includes full-source duration conservatively even though lesson embeds select shorter excerpts. Optional identification/Frayer/investigation depth is self-paced."};
  });
  return {
    schemaVersion:1,project:"biology30-unit-a-pilot-2",generatedAt,workspaceSha256:sha(afterHtml),baselineWorkspaceSha256:ONLINE_BASELINE,
    baselineDirectory:onlineBaselineDirectory,status:"awaiting-explicit-user-review",teacherDecision:null,transferReady:false,
    delivery:"Fully online, confirmed by the user. Supplied data, digital observation and computer models do not certify physical laboratory operation or unobserved collaboration.",
    invariants:{requiredRoutes:18,requiredMinutes:1505,optionalMinutes:295,practiceItems:86,advancedBlocks:40,mediaCheckpoints:14,collectionParentRecords:178,stateVersion:6,existingResponseLimits:"unchanged",addedCompactStudyResponses:5,addedObservationResponses:1,estimatedWorstCaseCharacters:estimatedCharacters,completionImpact:false},
    localWalkthroughs:ONLINE_WALKTHROUGHS.map(entry=>({...entry,selector:`[data-online-walkthrough="${entry.youtubeId}"]`,academicReview:"Original explanations checked against local course/textbook and OpenStax; three meaningful visuals and a worked case map to the existing checkpoint. Not a transcript reproduction.",rights:"Original text and semantic tables; reused figures retain their original provenance.",accessibility:"Full-width native disclosure, three ordered sections, adjacent visual descriptions or data tables; no network required."})),
    studies:ONLINE_STUDIES.map(study=>({...study,responseId:onlineStudyResponseId(study.id),selector:`[data-online-study="${study.id}"]`,collectionRecordId:`model-${study.modelId}`,persistedCharacters:study.rows.length*study.columns.length,review:"Every row has a source/structure-function explanation. Full-row attempt precedes comparison. Encoded selections are decoded into readable collection/copy/print output; no score."})),
    videoReview:{checkedAt:generatedAt,method:"All fourteen full English caption transcripts exported after the actual content loaded, read, and compared with original local explanations. Initial ad-player transcript failures were retried after content load. No video/audio files or transcript text are redistributed.",scope:"Transcript-level factual, relevance, caption and pacing review; selected excerpts are not whole-source endorsement or observed learner comprehension. Duration metadata was retrieved 2026-09-05; transcript checks are current to this candidate.",records:ONLINE_VIDEO_REVIEW.map(entry=>({...entry,selectedSeconds:entry.end-entry.start,url:`https://www.youtube.com/watch?v=${entry.id}`,disposition:"focused-excerpt-with-local-clarification",captionFallback:"Complete local illustrated path, spelled labels and adjacent tables",teacherDecision:null}))},
    microscopy:{...ONLINE_MICROSCOPY,rights:"CDC PHIL explicitly marks this image public domain; no CDC endorsement is implied.",inspected:"Original 700×466 image opened and inspected before integration. No invented scale, magnification or claims of full-neuron identification."},
    timeOnTask:{method:"150 words/minute reading allowance plus explicit vocabulary/check, model, practice and evidence/retrieval allowances; no claimed observed student timing",lessons:timeAudit,unchangedCourseMinutes:{required:1505,optional:295},teacherReview:"Confirm real student pace during review; do not infer that an assigned minute total proves workload."},
    investigations:[
      {id:"reflex-response",adaptation:"Synthetic reflex-pathway observations plus retained ruler-drop reaction data; calculate, distinguish mechanisms, test a calcium-release hypothesis and revise a claim. No reflex stimulation or physical microscope operation."},
      {id:"sensory-receptors",adaptation:"Retained tactile values plus separate visual-discrimination and cochlear-response datasets; explicit variables, threshold rule, quantitative comparisons, technology tradeoff and communication/revision. No vision or hearing diagnosis or tone playback."},
      {id:"endocrine-data",adaptation:"ADH computer-model observation, controlled synthetic repeats, retained observational samples, hypothesis/variables, monitoring-tool benefits/limits/waste and revised communication. No collection of personal health data."}
    ],
    acceptanceBoundary:["Teacher reviews the complete exact build once, including suitability of the online practical adaptations.","Observed learner comprehension, actual completion time and real collaboration cannot be certified by static tests.","LMS save/restore and learner-release approval remain separate from this blocked preview candidate.","No automatic Unit B-D content or acceptance transfer, deployment, export or commit."],
  };
}
