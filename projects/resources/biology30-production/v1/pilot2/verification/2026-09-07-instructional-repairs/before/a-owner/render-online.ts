import { ONLINE_WALKTHROUGHS, walkthroughVisual } from "./online-media.js";
import { ONLINE_MICROSCOPY, ONLINE_STUDIES, onlineStudyResponseId } from "./online-studies.js";
import type { LessonVisual } from "./full-content.js";

const esc=(value:string)=>value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

/** Reused SVGs receive local identifiers; headings and enlargement remain accessible. */
function localizeVisual(html:string,prefix:string){
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  for(const id of ids){
    html=html.replaceAll(`id="${id}"`,`id="${prefix}-${id}"`).replaceAll(`url(#${id})`,`url(#${prefix}-${id})`);
    html=html.replace(/aria-(labelledby|describedby)="([^"]+)"/g,(_match,kind,values)=>`aria-${kind}="${values.split(" ").map((value:string)=>value===id?`${prefix}-${id}`:value).join(" ")}"`);
  }
  return html.replace(/data-figure-id="([^"]+)"/g,`data-figure-id="${prefix}-$1"`);
}

export function renderOnlineWalkthrough(youtubeId:string,renderVisual:(visual:LessonVisual)=>string){
  const entry=ONLINE_WALKTHROUGHS.find(item=>item.youtubeId===youtubeId);
  if(!entry)throw new Error(`Missing complete local walkthrough: ${youtubeId}`);
  return `<details class="illustrated-equivalent" data-local-equivalent data-online-walkthrough="${youtubeId}"><summary>Use the complete illustrated walkthrough</summary><div class="walkthrough-body"><p>Work through these three illustrated steps. You can use them instead of the video, then answer the same checkpoint below.</p><ul>${entry.objectives.map(objective=>`<li>${esc(objective)}</li>`).join("")}</ul>${entry.panels.map((panel,index)=>`<section class="walkthrough-panel" aria-labelledby="walkthrough-${youtubeId}-${index}"><h3 id="walkthrough-${youtubeId}-${index}">${index+1}. ${esc(panel.title.replace(/^\d+\.\s*/,""))}</h3><p>${esc(panel.explanation)}</p>${localizeVisual(renderVisual(walkthroughVisual(panel.visualId)),`walkthrough-${youtubeId}-${index}`)}</section>`).join("")}<section class="worked-example walkthrough-case"><h3>Work through an example</h3><p><strong>Question:</strong> ${esc(entry.workedCase.question)}</p><p><strong>Reasoning:</strong> ${esc(entry.workedCase.reasoning)}</p></section><p><button type="button" class="text-link" data-open-model="${entry.modelId}">Try the connected model and save your evidence</button></p><p>Now use the checkpoint below. A choice made here is not a medical diagnosis or proof that you performed a hands-on experiment.</p></div></details>`;
}

export function renderOnlineStudies(modelId:string){
  const studies=ONLINE_STUDIES.filter(study=>study.modelId===modelId).map(study=>{
    const id=onlineStudyResponseId(study.id);
    return `<details class="online-study" data-online-study="${study.id}"><summary><h3 id="online-${study.id}-heading" tabindex="-1">${esc(study.title)}</h3></summary><div class="online-study-body"><p>${esc(study.prompt)}</p><p><button type="button" class="text-link" data-page-target="${study.lessonId}">Revisit the lesson and its labelled figures</button></p><input type="hidden" data-response-id="${id}" data-online-response maxlength="${study.rows.length*study.columns.length}" value=""><ol class="online-study-rows">${study.rows.map((row,rowIndex)=>`<li><h4>${rowIndex+1}. ${esc(row.clue)}</h4><div class="online-study-fields">${study.columns.map((column,columnIndex)=>`<label>${esc(column)}<select data-online-pick aria-label="${esc(row.clue)} — ${esc(column)}"><option value="_">Choose ${esc(column.toLowerCase())}</option>${study.options[columnIndex].map((label,index)=>({label,token:String.fromCharCode(97+index)})).sort((a,b)=>a.label.localeCompare(b.label,"en")).map(option=>`<option value="${option.token}">${esc(option.label)}</option>`).join("")}</select><span class="online-selection" data-online-selection aria-hidden="true" hidden></span></label>`).join("")}</div><p class="online-study-answer" data-online-answer hidden><strong>Compare:</strong> ${row.answers.map((answer,index)=>esc(study.options[index][answer])).join(" → ")}. ${esc(row.explanation)}</p></li>`).join("")}</ol><p data-save-status="${id}">Selections autosave with this model in Process Collection. This work does not affect grades or course progress.</p><button class="button button--secondary" type="button" data-online-compare disabled>Compare all rows with the explanation</button><h4 data-online-comparison-heading tabindex="-1" hidden>Compare the explanations with each row</h4></div></details>`;
  }).join("");
  if(modelId!==ONLINE_MICROSCOPY.modelId)return studies;
  const micro=ONLINE_MICROSCOPY;
  return `${studies}<details class="online-study" data-online-microscopy><summary><h3 id="online-microscopy-heading" tabindex="-1">${micro.title}</h3></summary><div class="online-study-body"><p>${esc(micro.prompt)}</p><figure class="science-figure" data-figure-id="online-cdc-nervous-tissue"><div class="figure-toolbar"><p>Prepared cervical spinal-cord tissue</p><button type="button" class="button button--quiet" data-enlarge-figure>View larger</button></div><img src="${micro.asset}" width="${micro.width}" height="${micro.height}" alt="${esc(micro.description)}" loading="lazy"><figcaption>${esc(micro.description)} No scale bar is supplied.</figcaption></figure><label>Your observation and its limit<textarea rows="4" maxlength="${micro.maxLength}" data-response-id="${micro.responseId}"></textarea></label><p data-save-status="${micro.responseId}">Your draft saves with the myelin model in Process Collection.</p><details><summary>Compare an observation with an inference</summary><p>${esc(micro.guide)}</p></details></div></details>`;
}
