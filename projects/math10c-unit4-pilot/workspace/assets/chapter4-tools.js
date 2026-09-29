(function(){
  "use strict";
  var KEY=window.Chapter4Save?window.Chapter4Save.key("tools"):"math10c-unit4-pilot:tools:v1";
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||"null")||{};}catch(_){return {};}}
  var state=load();
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent("chapter4:state-changed",{detail:{area:"tools"}}));return true;}catch(_){return false;}}
  function value(id,fallback){var node=document.getElementById(id);return node?node.value:fallback;}
  function restore(id){var node=document.getElementById(id);if(node&&state[id]!=null)node.value=state[id];}
  ["radical-coefficient","radical-index","radical-radicand","law-base","law-first","law-operation","law-second"].forEach(function(id){restore(id);var node=document.getElementById(id);if(node)node.addEventListener("input",function(){state[id]=node.value;save();});});
  function radicalSymbol(index){return index===2?"√":(index===3?"∛":""+index+"√");}
  function expose(fingerprint,source){if(window.Chapter4MasteryReview&&window.Chapter4MasteryReview.registerExposure)window.Chapter4MasteryReview.registerExposure(fingerprint,source,"interactive tool",null);}
  function showRadical(recordExposure){
    var coefficient=Math.max(1,Math.min(12,Number(value("radical-coefficient",3))||1));
    var index=Math.max(2,Math.min(5,Number(value("radical-index",2))||2));
    var radicand=Math.max(1,Math.min(500,Number(value("radical-radicand",5))||1));
    var inside=Math.pow(coefficient,index)*radicand, symbol=radicalSymbol(index), root=document.getElementById("radical-output");if(!root)return;
    root.innerHTML="<h3>Connected forms</h3><p class=\"equation\">"+coefficient+symbol+radicand+" = "+symbol+inside+" = "+coefficient+"·"+radicand+"<sup>1/"+index+"</sup></p><p>The coefficient enters as "+coefficient+"<sup>"+index+"</sup>. Extracting that perfect "+(index===2?"square":index===3?"cube":index+"th power")+" returns the mixed form.</p>";
    if(recordExposure!==false)expose("radical|"+(index===2?"square":index===3?"cube":"index"+index)+"|entire|"+coefficient+"|"+radicand+"|"+inside,"tool:radical:"+index+":"+coefficient+":"+radicand);
  }
  function showLaw(recordExposure){
    var base=value("law-base","x"),first=Number(value("law-first",5))||0,second=Number(value("law-second",3))||0,op=value("law-operation","product"),root=document.getElementById("law-output");if(!root)return;var expression,result,law,restriction=(first<0||second<0)?", "+base+" ≠ 0":"";
    if(op==="product"){expression=base+"<sup>"+first+"</sup> · "+base+"<sup>"+second+"</sup>";result=first+second;law="Add the exponents because like bases are multiplied.";}
    else if(op==="quotient"){expression=base+"<sup>"+first+"</sup> ÷ "+base+"<sup>"+second+"</sup>";result=first-second;law="Subtract the denominator exponent because like bases are divided.";restriction=", "+base+" ≠ 0";}
    else{expression="("+base+"<sup>"+first+"</sup>)<sup>"+second+"</sup>";result=first*second;law="Multiply the exponents because a power is raised to a power.";}
    var answer=result<0?"1/"+base+"<sup>"+Math.abs(result)+"</sup>":(result===0?"1":base+"<sup>"+result+"</sup>");
    var boundary=restriction?"<p><strong>Domain check:</strong> the original expression requires "+base+" ≠ 0. Simplifying to "+answer+" does not erase that restriction.</p>":"<p><strong>Domain check:</strong> no nonzero restriction is introduced by this original expression.</p>";
    root.innerHTML="<h3>"+law+"</h3><p class=\"equation\">"+expression+" = "+answer+restriction+"</p>"+boundary;
    if(recordExposure!==false)expose("exponent|"+op+"|"+base+"|"+first+"|"+second,"tool:exponent:"+op+":"+base+":"+first+":"+second);
  }
  var radical=document.getElementById("radical-build");if(radical)radical.addEventListener("click",showRadical);
  var law=document.getElementById("law-build");if(law)law.addEventListener("click",showLaw);
  /* Populate hidden tool panes without recording exposure. */
  showRadical(false);showLaw(false);

  var panel=document.getElementById("reference-panel"),head=panel&&panel.querySelector(":scope > header");
  if(panel&&head&&window.matchMedia("(min-width: 761px)").matches){
    var drag=null;
    head.addEventListener("pointerdown",function(event){if(event.target.closest("button,a"))return;var rect=panel.getBoundingClientRect();drag={x:event.clientX-rect.left,y:event.clientY-rect.top};head.setPointerCapture(event.pointerId);});
    head.addEventListener("pointermove",function(event){if(!drag)return;var left=Math.max(8,Math.min(window.innerWidth-panel.offsetWidth-8,event.clientX-drag.x)),top=Math.max(72,Math.min(window.innerHeight-panel.offsetHeight-8,event.clientY-drag.y));panel.style.left=left+"px";panel.style.top=top+"px";panel.style.right="auto";panel.style.bottom="auto";});
    head.addEventListener("pointerup",function(){drag=null;});head.addEventListener("pointercancel",function(){drag=null;});
  }
  window.Chapter4Tools={showRadical:showRadical,showLaw:showLaw};
}());
