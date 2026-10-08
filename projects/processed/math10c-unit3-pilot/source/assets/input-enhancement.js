/* OPTIONAL SPIKE ONLY. Native entry is the shipping mode. No library/fonts are bundled or fetched.
   MathLive activation requires an explicitly installed local 0.110.0 build and an owner-set flag.
   This candidate adapter has not been validated against the real library or assistive technology. */
(function(){'use strict';
const normalise=value=>{let s=String(value).replace(/\\left|\\right/g,'').replace(/\\cdot|\\times/g,'*').replace(/\\,/g,' ').replace(/\^\{([1-6])\}/g,'^$1').replace(/[{}]/g,m=>m==='{'?'(':')');if(/\\/.test(s)||/[^0-9a-z+*^()\s.\-−²³]/.test(s))return null;return s;};
function enhance(){if(!window.MATHLIVE_SPIKE_ENABLED||!globalThis.MathfieldElement)return false;const MF=globalThis.MathfieldElement;
 if(String(MF.version)!=='0.110.0')return false;
 try{MF.fontsDirectory='./fonts';MF.soundsDirectory=null;MF.computeEngine=null;}catch{return false;}
 for(const input of document.querySelectorAll('[data-answer]')){if(input.type==='hidden'||input.closest('.inline-task')?.querySelector('[data-structured-part]'))continue;if(input.dataset.visualAttached)continue;input.dataset.visualAttached='true';const task=input.closest('.inline-task'),button=document.createElement('button');button.type='button';button.className='button secondary math-input-toggle';button.textContent='Use visual notation';button.setAttribute('aria-pressed','false');input.after(button);let field=null,invalid=false;
 button.addEventListener('click',()=>{if(!field){field=new MF();field.mathVirtualKeyboardPolicy='manual';field.menuItems=[];field.smartFence=false;field.setAttribute('aria-label','Visual mathematical entry');field.addEventListener('input',()=>{const text=normalise(field.value);invalid=text===null||text.length>160;task.dataset.visualInputBlocked=String(invalid);if(invalid){field.setAttribute('aria-invalid','true');button.textContent='Return to native entry · visual draft remains here';return;}field.removeAttribute('aria-invalid');input.value=text;input.dispatchEvent(new Event('input',{bubbles:true}));});button.after(field);}const open=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(open));field.hidden=!open;input.hidden=open;if(open){if(!invalid)field.setValue(input.value,{silenceNotifications:true});task.dataset.visualInputBlocked=String(invalid);field.focus();button.textContent='Use native entry';}else{task.dataset.visualInputBlocked='false';input.focus();button.textContent=invalid?'Reopen retained visual draft':'Use visual notation';}});
 }
 if(globalThis.mathVirtualKeyboard)globalThis.mathVirtualKeyboard.container=document.body;
 return true;
}
window.MathInputEnhancement={enhance,normalise,status:()=>window.MATHLIVE_SPIKE_ENABLED&&globalThis.MathfieldElement?'local-spike-not-accepted':'native-input-active; MathLive spike disabled'};
document.addEventListener('DOMContentLoaded',enhance);
})();
