(function(){
  "use strict";
  var data=window.Chapter4PracticeData;
  var math=window.Chapter4Math;
  if(!data)return;
  var KEY=window.Chapter4Save?window.Chapter4Save.key("practice"):"math10c-unit4-pilot:practice:v1", VERSION="chapter4-practice-state-2", LIMIT=18000;
  function blank(){return {version:VERSION,seeds:{lesson:0,mixed:0,review:0},lesson:"41",responses:{},summary:{},updatedAt:""};}
  function load(){try{var parsed=JSON.parse(localStorage.getItem(KEY)||"null");if(parsed&&parsed.version==="chapter4-practice-state-1")parsed.version=VERSION;return parsed&&parsed.version===VERSION?parsed:blank();}catch(_){return blank();}}
  var state=load();
  function save(){
    state.updatedAt=new Date().toISOString();
    var serialized=JSON.stringify(state);
    /* Never reclaim capacity by deleting learner responses. If the exact state
       cannot be admitted, keep the last stored version and leave the current
       visible draft in memory so the learner can copy or print it. */
    if(serialized.length>LIMIT)return false;
    try{localStorage.setItem(KEY,serialized);window.dispatchEvent(new CustomEvent("chapter4-practice-updated",{detail:{summary:state.summary}}));window.dispatchEvent(new CustomEvent("chapter4:state-changed",{detail:{area:"practice"}}));return true;}catch(_){return false;}
  }
  function responseKey(surface,seed,id){return surface+":"+seed+":"+id;}
  function revealExposures(question,key,surface){(question.exposes||[]).forEach(function(fingerprint){if(window.Chapter4MasteryReview&&window.Chapter4MasteryReview.registerExposure)window.Chapter4MasteryReview.registerExposure(fingerprint,"solution:"+key,surface+" solution",question.target);});}
  function currentQuestions(surface){
    if(surface==="lesson")return data.lessonSet(state.lesson,state.seeds.lesson,5);
    if(surface==="mixed")return data.mixedSet(state.seeds.mixed);
    if(surface==="review")return data.reviewSet(state.seeds.review);
    return data.errors;
  }
  function summaryFor(target){if(!state.summary[target])state.summary[target]={checks:0,correct:0,misses:0,support:0,lastAt:""};return state.summary[target];}
  function insertAt(input,text){var start=input.selectionStart==null?input.value.length:input.selectionStart,end=input.selectionEnd==null?start:input.selectionEnd;input.value=input.value.slice(0,start)+text+input.value.slice(end);input.focus();input.setSelectionRange(start+text.length,start+text.length);input.dispatchEvent(new Event("input",{bubbles:true}));}
  function toolbar(input,question){var kind=question.contract&&question.contract.kind;if(kind!=="expression"&&kind!=="restriction")return null;var wrap=document.createElement("details");wrap.className="equation-tools";var summary=document.createElement("summary");summary.textContent="Equation symbols";wrap.appendChild(summary);var row=document.createElement("div");row.className="equation-symbol-row";(kind==="restriction"?["≠","=","0"]:["²","³","√","∛","^","×","−","(",")","/","≠"]).forEach(function(symbol){var button=document.createElement("button");button.type="button";button.textContent=symbol;button.setAttribute("aria-label","Insert "+symbol);button.addEventListener("click",function(){insertAt(input,symbol);});row.appendChild(button);});wrap.appendChild(row);return wrap;}
  function renderStructuredQuestion(surface,seed,question,index){
    var key=responseKey(surface,seed,question.id),saved=state.responses[key]||{answer:{},checks:0,support:false,resolved:false,correct:false};
    if(!saved.answer||typeof saved.answer!=="object")saved.answer={};
    var card=document.createElement("article");card.className="practice-card structured-error-card";card.dataset.practiceId=key;
    var title=document.createElement("h3");title.textContent=(index+1)+". "+question.prompt;card.appendChild(title);
    var skill=document.createElement("p");skill.className="skill-tag";skill.textContent=question.target+" · Lesson "+question.target.slice(3,5).replace(/^4/,"4.");card.appendChild(skill);
    var fieldRoot=document.createElement("div");fieldRoot.className="practice-structured-fields";var controls={};
    question.fields.forEach(function(config,fieldIndex){var wrap=document.createElement("div");wrap.className="mastery-field";var id="practice-"+surface+"-"+index+"-"+fieldIndex,label=document.createElement("label");label.htmlFor=id;label.textContent=config.label;var input;if(config.type==="select"){input=document.createElement("select");(config.options||[]).forEach(function(pair){var option=document.createElement("option");option.value=pair[0];option.textContent=pair[1];input.appendChild(option);});}else{input=document.createElement("input");input.type="text";input.maxLength=80;input.autocomplete="off";}input.id=id;input.value=saved.answer[config.name]||"";input.dataset.practiceField=config.name;var hint=document.createElement("p");hint.className="field-hint";hint.id=id+"-hint";hint.hidden=true;input.setAttribute("aria-describedby",hint.id);controls[config.name]={input:input,wrap:wrap,hint:hint,config:config};input.addEventListener("input",function(){saved.answer[config.name]=input.value;input.removeAttribute("aria-invalid");wrap.classList.remove("is-wrong","is-correct");hint.hidden=true;state.responses[key]=saved;save();});wrap.appendChild(label);wrap.appendChild(input);var tools=toolbar(input,config);if(tools)wrap.appendChild(tools);wrap.appendChild(hint);fieldRoot.appendChild(wrap);});card.appendChild(fieldRoot);
    var actions=document.createElement("div");actions.className="actions";var check=document.createElement("button");check.type="button";check.className="button";check.textContent=saved.resolved?"Correct":"Check diagnosis";check.disabled=Boolean(saved.resolved);var support=document.createElement("button");support.type="button";support.className="button secondary";support.textContent="Give me a hint";support.disabled=Boolean(saved.resolved);actions.appendChild(check);actions.appendChild(support);card.appendChild(actions);var feedback=document.createElement("div");feedback.className="feedback";feedback.setAttribute("role","status");feedback.hidden=true;card.appendChild(feedback);
    if(window.Chapter4MasteryReview&&window.Chapter4MasteryReview.registerExposure)window.Chapter4MasteryReview.registerExposure(question.fingerprint,"practice:"+key,surface,question.target);
    function store(){saved.updatedAt=new Date().toISOString();state.responses[key]=saved;if(!save()){feedback.hidden=false;feedback.dataset.status="input";feedback.textContent="This work remains visible, but browser storage is full. Copy it before leaving.";return false;}return true;}
    support.addEventListener("click",function(){saved.support=true;var sum=summaryFor(question.target);sum.support+=1;sum.lastAt=new Date().toISOString();if(!store())return;feedback.hidden=false;feedback.dataset.status="equivalent";feedback.textContent=question.hint;renderRecommendation();});
    check.addEventListener("click",function(){var blanks=[];Object.keys(controls).forEach(function(name){saved.answer[name]=controls[name].input.value;if(!String(saved.answer[name]).trim())blanks.push(name);});if(blanks.length){blanks.forEach(function(name){controls[name].input.setAttribute("aria-invalid","true");controls[name].wrap.classList.add("is-wrong");controls[name].hint.textContent="Complete this decision before checking.";controls[name].hint.hidden=false;});feedback.hidden=false;feedback.dataset.status="input";feedback.textContent="Complete every diagnosis step. A blank does not use a check.";store();return;}saved.checks=Math.min(4,Number(saved.checks||0)+1);var allCorrect=true,results={};Object.keys(controls).forEach(function(name){var entry=controls[name],correct=data.accepted(entry.config,saved.answer[name]);results[name]=correct;allCorrect=allCorrect&&correct;entry.wrap.classList.toggle("is-correct",correct);entry.wrap.classList.toggle("is-wrong",!correct);entry.input.toggleAttribute("aria-invalid",!correct);entry.hint.textContent=correct?"":entry.config.hint;entry.hint.hidden=correct;});saved.componentResults=results;var sum=summaryFor(question.target);sum.checks+=1;sum.lastAt=new Date().toISOString();if(allCorrect){saved.correct=true;saved.resolved=true;sum.correct+=1;feedback.dataset.status="correct";feedback.textContent="Correct. "+question.solution+" This practice result guides your next step but does not change mastery.";check.disabled=true;support.disabled=true;check.textContent="Correct";}else{saved.correct=false;sum.misses+=1;feedback.dataset.status="incorrect";feedback.textContent=saved.checks>=4?"Four checks used. "+question.solution:"Check "+saved.checks+" of 4: revise the red decisions using the small hints below them.";if(saved.checks>=4){check.disabled=true;support.disabled=true;}}feedback.hidden=false;store();renderRecommendation();renderWorkSummary();});
    if(saved.resolved){feedback.hidden=false;feedback.dataset.status="correct";feedback.textContent="Correct diagnosis retained. "+question.solution;}else if(saved.checks>=4){feedback.hidden=false;feedback.dataset.status="incorrect";feedback.textContent="Four checks used. "+question.solution;check.disabled=true;support.disabled=true;}
    return card;
  }
  function renderQuestion(surface,seed,question,index){
    if(question.fields&&question.fields.length)return renderStructuredQuestion(surface,seed,question,index);
    var key=responseKey(surface,seed,question.id), saved=state.responses[key]||{answer:"",checks:0,support:false,resolved:false,correct:false};
    var card=document.createElement("article");card.className="practice-card";card.dataset.practiceId=key;
    var title=document.createElement("h3");title.textContent=(index+1)+". "+question.prompt;card.appendChild(title);
    var skill=document.createElement("p");skill.className="skill-tag";skill.textContent=question.target+" · Lesson "+question.target.slice(3,5).replace(/^4/,"4.");skill.hidden=surface==="mixed"||surface==="review";card.appendChild(skill);
    var label=document.createElement("label");var input=document.createElement("input");input.type="text";input.maxLength=80;input.autocomplete="off";input.id="practice-"+surface+"-"+index;input.value=saved.answer||"";label.htmlFor=input.id;label.textContent="Your answer";label.appendChild(input);card.appendChild(label);var tools=toolbar(input,question);if(tools)card.appendChild(tools);
    var actions=document.createElement("div");actions.className="actions";
    var check=document.createElement("button");check.type="button";check.className="button";check.textContent=saved.resolved?"Correct":"Check answer";check.disabled=Boolean(saved.resolved);
    var hint=document.createElement("button");hint.type="button";hint.className="button secondary";hint.textContent="Give me a hint";hint.disabled=Boolean(saved.resolved);
    actions.appendChild(check);actions.appendChild(hint);card.appendChild(actions);
    var feedback=document.createElement("div");feedback.className="feedback";feedback.setAttribute("role","status");feedback.hidden=true;card.appendChild(feedback);
    if(window.Chapter4MasteryReview&&window.Chapter4MasteryReview.registerExposure)window.Chapter4MasteryReview.registerExposure(question.fingerprint,"practice:"+key,surface,question.target);
    function store(){saved.answer=input.value;saved.updatedAt=new Date().toISOString();state.responses[key]=saved;if(!save())feedback.textContent="This answer remains visible, but browser storage is full. Copy it before leaving.";}
    input.addEventListener("input",function(){input.removeAttribute("aria-invalid");feedback.hidden=true;store();});
    hint.addEventListener("click",function(){saved.support=true;var sum=summaryFor(question.target);sum.support+=1;sum.lastAt=new Date().toISOString();store();revealExposures(question,key,surface);feedback.hidden=false;feedback.dataset.status="equivalent";feedback.textContent=question.hint;renderRecommendation();});
    check.addEventListener("click",function(){
      saved.answer=input.value;
      if(!String(input.value).trim()){input.setAttribute("aria-invalid","true");feedback.hidden=false;feedback.dataset.status="input";feedback.textContent="Enter an answer first. A blank does not use a check.";store();return;}
      saved.checks=Math.min(4,Number(saved.checks||0)+1);var sum=summaryFor(question.target);sum.checks+=1;sum.lastAt=new Date().toISOString();
      var classified=math&&math.classify?math.classify(question,input.value):null;
      if(data.accepted(question,input.value)){
        saved.correct=true;saved.resolved=true;sum.correct+=1;input.removeAttribute("aria-invalid");revealExposures(question,key,surface);feedback.hidden=false;feedback.dataset.status="correct";feedback.textContent="Correct. "+question.solution+" This practice result guides your next step but does not change mastery.";check.disabled=true;hint.disabled=true;check.textContent="Correct";
      }else{
        saved.correct=false;sum.misses+=1;input.setAttribute("aria-invalid","true");feedback.hidden=false;feedback.dataset.status="incorrect";feedback.textContent=saved.checks>=4?"Four checks used. "+question.solution+" Review the related lesson, then generate a different set.":"Check "+saved.checks+" of 4: "+question.hint;
        if(classified&&classified.status==="unsupported_notation"){saved.checks-=1;sum.checks-=1;sum.misses-=1;feedback.dataset.status="input";feedback.textContent="That notation could not be read, so no check was used. Use the notation example or equation symbols and try again.";}
        if(saved.checks>=4){revealExposures(question,key,surface);check.disabled=true;hint.disabled=true;}
      }
      skill.hidden=false;
      store();renderRecommendation();renderWorkSummary();
    });
    if(saved.resolved){revealExposures(question,key,surface);feedback.hidden=false;feedback.dataset.status="correct";feedback.textContent="Correct practice response retained. "+question.solution;}
    else if(saved.checks>=4){revealExposures(question,key,surface);feedback.hidden=false;feedback.dataset.status="incorrect";feedback.textContent="Four checks used. "+question.solution;check.disabled=true;hint.disabled=true;}
    return card;
  }
  function renderSurface(surface){var root=document.querySelector('[data-practice-surface="'+surface+'"]');if(!root)return;root.textContent="";var seed=surface==="errors"?0:state.seeds[surface],questions=currentQuestions(surface);questions.forEach(function(question,index){root.appendChild(renderQuestion(surface,seed,question,index));});}
  function clearSurface(surface){var prefix=surface+":";Object.keys(state.responses).forEach(function(key){if(key.indexOf(prefix)===0)delete state.responses[key];});}
  function regenerate(surface){clearSurface(surface);state.seeds[surface]=Number(state.seeds[surface]||0)+1;save();renderSurface(surface);renderRecommendation();}
  function weakestTarget(){var ids=Object.keys(state.summary);if(!ids.length)return null;ids.sort(function(a,b){var aa=state.summary[a],bb=state.summary[b],ar=(aa.misses+1)/(aa.checks+1),br=(bb.misses+1)/(bb.checks+1);return br-ar||bb.misses-aa.misses;});return ids[0];}
  function renderRecommendation(){var root=document.getElementById("practice-recommendation");if(!root)return;var target=weakestTarget();root.textContent="";if(!target){root.textContent="Complete or generate a practice set to receive a target-specific recommendation.";return;}var lesson=target.slice(3,5),text=document.createElement("p");text.textContent="Your current practice record points to "+target+" in Lesson 4."+lesson.slice(1)+" — "+data.labels[lesson]+". Repair that target, then generate a different set before returning to mastery.";var links=document.createElement("div");links.className="actions";var support=document.createElement("a");support.className="button secondary";support.href="#support-"+lesson;support.dataset.route="";support.textContent="Open target support";var lessonLink=document.createElement("a");lessonLink.className="button";lessonLink.href="#u4-"+lesson;lessonLink.dataset.route="";lessonLink.textContent="Return to Lesson 4."+lesson.slice(1);links.appendChild(support);links.appendChild(lessonLink);root.appendChild(text);root.appendChild(links);}
  function renderWorkSummary(){var root=document.getElementById("practice-work-summary");if(!root)return;root.textContent="";var lessons={};Object.keys(state.summary).forEach(function(target){var id=target.slice(3,5);if(!lessons[id])lessons[id]={checks:0,correct:0,misses:0,support:0};Object.keys(lessons[id]).forEach(function(key){lessons[id][key]+=Number(state.summary[target][key]||0);});});if(!Object.keys(lessons).length){root.textContent="No practice checks have been recorded in this browser.";return;}var table=document.createElement("table"),head=document.createElement("thead"),row=document.createElement("tr");["Lesson","Checks","Correct","Misses","Hints"].forEach(function(text){var th=document.createElement("th");th.textContent=text;row.appendChild(th);});head.appendChild(row);table.appendChild(head);var body=document.createElement("tbody");Object.keys(lessons).sort().forEach(function(id){var tr=document.createElement("tr"),vals=["4."+id.slice(1)+" "+data.labels[id],lessons[id].checks,lessons[id].correct,lessons[id].misses,lessons[id].support];vals.forEach(function(value){var td=document.createElement("td");td.textContent=value;tr.appendChild(td);});body.appendChild(tr);});table.appendChild(body);var wrap=document.createElement("div");wrap.className="table-wrap";wrap.appendChild(table);root.appendChild(wrap);}
  var lessonSelect=document.getElementById("practice-lesson");if(lessonSelect){lessonSelect.value=state.lesson;lessonSelect.addEventListener("change",function(){state.lesson=lessonSelect.value;clearSurface("lesson");state.seeds.lesson=0;save();renderSurface("lesson");renderRecommendation();});}
  var generate=document.getElementById("practice-generate");if(generate)generate.addEventListener("click",function(){regenerate("lesson");});
  var mixed=document.getElementById("mixed-generate");if(mixed)mixed.addEventListener("click",function(){regenerate("mixed");});
  var review=document.getElementById("review-generate");if(review)review.addEventListener("click",function(){regenerate("review");});
  ["lesson","mixed","errors","review"].forEach(renderSurface);renderRecommendation();renderWorkSummary();
  window.addEventListener("storage",function(event){if(event.key!==KEY)return;state=load();["lesson","mixed","errors","review"].forEach(renderSurface);renderRecommendation();renderWorkSummary();});
  window.Chapter4PracticeReview={getState:function(){return JSON.parse(JSON.stringify(state));},regenerate:regenerate};
}());
