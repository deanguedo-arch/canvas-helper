(function(){
  "use strict";
  var math=window.Chapter4Math,saveApi=window.Chapter4Save,KEY=saveApi?saveApi.key("learning"):"math10c-unit4-pilot:learning:v1";
  var specs={
    "41-root-bounds":{target:"C4-41b",fingerprint:"root|cube|bounds|90",fields:{"lower-bound":["4"],"upper-bound":["5"],"closer-endpoint":["4","lower"]},hint:"Use 4³ = 64 and 5³ = 125, then compare both distances from 90."},
    "41-classify-order":{target:"C4-41c",fingerprint:"root|square|classify-order|85",fields:{"lower-bound":["9"]},hint:"Locate 85 between 9² and 10² before classifying or comparing."},
    "42-factor-choice":{target:"C4-42b",fingerprint:"radical|square|factor-choice|180",custom:function(a){var f=Number(a["square-factor"]),r=Number(a["remaining-factor"]),root=Math.sqrt(f);return Number.isInteger(root)&&f>1&&f*r===180;},hint:"Choose a perfect square greater than 1 whose product with the remaining factor is 180."},
    "42-faded-conversion":{target:"C4-42c",fingerprint:"radical|cube|entire|4|3|192",fields:{"entire-radicand":["192"]},hint:"A coefficient enters a cube root as its third power: 4³ · 3."},
    "43-product":{target:"C4-43a",fingerprint:"powers|choose-product|p|2|5",fields:{"product-choice":["multiply-same"],"product-exponent":["7"]},hint:"The product law needs multiplication and the same base; then add the exponents."},
    "43-faded-quotient":{target:"C4-43d",fingerprint:"powers|combined-quotient|20|5|m6|m2|n4|n1",fields:{coefficient:["4"],"m-exponent":["4"],"n-exponent":["3"],restrictions:["m!=0,n!=0","n!=0,m!=0","m≠0,n≠0","n≠0,m≠0"]},hint:"Divide coefficients, subtract exponents for each like base, and read restrictions from the original denominator."},
    "44-scope":{target:"C4-44b",fingerprint:"power|quotient|scope|-3x2|2y|3",fields:{"coefficient-sign":["negative"],"x-exponent":["6"]},hint:"The odd outside power applies to the sign and multiplies the exponent on x."},
    "44-faded":{target:"C4-44d",fingerprint:"power|combined|2m2n3|2|m4|n",fields:{"final-expression":["4m^8n^5","4*m^8*n^5"],restriction:["n!=0","n≠0"]},hint:"Square every factor first, then add or subtract exponents from multiplication and division."},
    "45-reciprocal":{target:"C4-45b",fingerprint:"negative|rewrite|5p-3|q-2",fields:{"p-exponent":["3"],"q-exponent":["2"],"p-location":["denominator"]},hint:"A negative exponent moves only its powered factor across the fraction bar."},
    "45-faded":{target:"C4-45c",fingerprint:"negative|rational-base|2|3|3",fields:{"exact-value":["27/8","3.375"]},hint:"Invert 2/3, then apply the third power."},
    "46-interpret":{target:"C4-46c",fingerprint:"rational-exponent|81|2|4",fields:{"root-index":["4"],"outer-power":["2"],"exact-value":["9"]},hint:"The denominator names the fourth root; the numerator says to square."},
    "46-faded-domain":{target:"C4-46d",fingerprint:"rational-exponent|domain|x5/4|x2/3",fields:{"fourth-domain":["x>=0","x≥0"],"cube-domain":["allreal","all real","x is real","x∈r"]},hint:"An even root needs a nonnegative radicand; an odd root accepts every real input."},
    "47-model":{target:"C4-47c",fingerprint:"model|decay|500|0.8|2",fields:{"daily-multiplier":["0.8"],"after-two-days":["320"]},hint:"Retaining 80% means multiply by 0.8 once per day: 500(0.8)²."},
    "47-faded":{target:"C4-47b",fingerprint:"powers|combined|3p2q|2|p3|9p",fields:{"final-expression":["p^6q^2","p^6*q^2"],restriction:["p!=0","p≠0"]},hint:"Distribute the square, combine p powers, divide by the final p, and keep the original restriction."},
    "48-model-choice":{target:"C4-48a",fingerprint:"transfer|square-area|98|exact",fields:{"root-type":["square"],"exact-length":["7sqrt2","7sqrt(2)","7*sqrt2"],unit:["cm","centimetres","centimeters"]},hint:"Area to side uses a square root; simplify √98 and report a linear unit."},
    "48-faded-transfer":{target:"C4-48c",fingerprint:"transfer|cube-volume|500|estimate",fields:{"lower-bound":["7"],"upper-bound":["8"],estimate:["7.9"]},hint:"Use 7³ and 8³ to bracket 500, then estimate the cube root to one decimal place."}
  };
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||"null")||{version:"chapter4-learning-state-1",tasks:{}};}catch(_){return {version:"chapter4-learning-state-1",tasks:{}};}}
  var state=load();
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent("chapter4:state-changed",{detail:{area:"learning"}}));return true;}catch(_){return false;}}
  function normalized(value){return math&&math.normalize?math.normalize(value):String(value||"").toLowerCase().replace(/\s+/g,"");}
  function correct(spec,answers,name){return (spec.fields[name]||[]).some(function(expected){if(math&&/[a-z]/i.test(expected)&&/[\^*/√∛]/.test(expected))return math.equivalent(answers[name],expected);return normalized(answers[name])===normalized(expected);});}
  document.querySelectorAll("[data-guided-task]").forEach(function(section){
    var id=section.dataset.guidedTask,spec=specs[id];if(!spec)return;var saved=state.tasks[id]||{answers:{},checks:0,complete:false};state.tasks[id]=saved;
    function registerPresentation(){
      if(section.dataset.exposureRegistered==="true")return;
      section.dataset.exposureRegistered="true";
      if(window.Chapter4MasteryReview)window.Chapter4MasteryReview.registerExposure(spec.fingerprint,"guided:"+id,"guided learning",spec.target);
    }
    var article=section.closest(".course-page[id]");
    if(article&&window.location.hash==="#"+article.id)registerPresentation();
    window.addEventListener("chapter4:route-shown",function(event){if(article&&event.detail&&event.detail.route===article.id)registerPresentation();});
    section.querySelectorAll("[data-guided-component]").forEach(function(input){var name=input.dataset.guidedComponent;input.value=saved.answers[name]||"";input.addEventListener("input",function(){saved.answers[name]=input.value;input.removeAttribute("aria-invalid");persist();});});
    var button=section.querySelector("[data-guided-check]"),feedback=section.querySelector("[data-guided-feedback]");if(!button||!feedback)return;
    button.addEventListener("click",function(){var answers={};section.querySelectorAll("[data-guided-component]").forEach(function(input){answers[input.dataset.guidedComponent]=input.value;});var blank=Object.keys(answers).some(function(name){return !String(answers[name]).trim();});if(blank){section.querySelectorAll("[data-guided-component]").forEach(function(input){if(!String(input.value).trim())input.setAttribute("aria-invalid","true");});feedback.dataset.status="input";feedback.textContent="Complete each decision before checking. A blank does not use a check.";return;}saved.checks+=1;var all=spec.custom?spec.custom(answers):Object.keys(answers).every(function(name){return correct(spec,answers,name);});section.querySelectorAll("[data-guided-component]").forEach(function(input){var ok=spec.custom?all:correct(spec,answers,input.dataset.guidedComponent);if(ok)input.removeAttribute("aria-invalid");else input.setAttribute("aria-invalid","true");});if(all){saved.complete=true;feedback.dataset.status="correct";feedback.textContent="These decisions work. Explain the relationship in your own words, then continue to the faded task.";}else{feedback.dataset.status="incorrect";feedback.textContent="Recheck the red decision. "+spec.hint;}persist();});
  });
  persist();window.Chapter4Learning={getState:function(){return JSON.parse(JSON.stringify(state));},specs:specs};
}());
