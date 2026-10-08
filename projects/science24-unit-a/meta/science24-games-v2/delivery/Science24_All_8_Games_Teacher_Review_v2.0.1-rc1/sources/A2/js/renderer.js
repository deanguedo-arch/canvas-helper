import {validateBalance} from './engine.js';
import {escapeHTML as h, asset, panel, scene, prediction, table, field, explanation, checkButtons, modelGate, formGate} from './ui.js';
const particleName=f=>f==='Fe'?'atom':['Fe2O3','CaCO3','CaCl2'].includes(f)?'formula unit':'molecule';
function particles(species, values) {
  return `<div class="particle-bank"><div class="particle-grid">${species.map((f,i)=> {
    const count = Number(values[i]);
    return Array.from({length:Number.isSafeInteger(count) && count > 0 ? Math.min(count,8) : 0},()=>`<div class="particle"><img src="${asset('assets/sprites/molecule_'+f+'.svg')}" alt="${h(f)} ${particleName(f)}"><strong>${h(f)}</strong></div>`).join('') + (count > 8 ? `<p>${count} ${h(f)} ${particleName(f)}s (eight tiles shown)</p>` : '');
  }).join('')}</div></div>`;
}
function ledger(s,m) {
  try {
    const cs=s.reactants.concat(s.products_list).map((_,i)=>m.modelInputs['c'+i]);
    const r=validateBalance(s.reactants,s.products_list,cs,true);
    return table(['Element','Left','Right','Status'],Object.keys(r.differences).map(e=>[e,r.left[e]||0,r.right[e]||0,r.differences[e]===0?'Equal':'Repair']), 'Your current atom account');
  } catch(e) { return `<p>${h(e.message)}</p>`; }
}
function line(s,m) {
  const cs=s.reactants.concat(s.products_list).map((_,i)=>m.modelInputs['c'+i]);
  return `<div class="atom-supply"><strong>Reactant batch</strong><div>${s.reactants.map((f,i)=>`<span><img src="${asset('assets/premium/particle_'+f+'-v1.svg')}" alt="${h(f)} ${particleName(f)}"><b>${h(f)} × ${h(cs[i]??'—')}</b></span>`).join('')}</div></div><div class="assembly-chamber"><img class="assembly-backdrop" src="${asset('assets/premium/scene-v1.png')}" alt="Empty specimen trays in a molecular assembly laboratory"><div class="assembly-products">${s.products_list.map((f,i)=>{const c=Number(cs[s.reactants.length+i]);return `<div class="product-tray"><strong>${h(f)} product</strong><div>${Array.from({length:Number.isSafeInteger(c)&&c>0?Math.min(c,3):0},()=>`<img src="${asset('assets/premium/particle_'+f+'-v1.svg')}" alt="${h(f)} ${particleName(f)}">`).join('')}</div><span>${Number.isSafeInteger(c)&&c>=0?c:'—'} ${particleName(f)}${c===1?'':'s'}${c>3?' (three shown)':''}</span></div>`;}).join('')}</div></div><p class="small-note">Particle symbols show composition; they do not show measured atomic size or bonding geometry. The element ledger counts the whole batch.</p>`;
}
export function render(s,m,transfer=false) {
  const species=s.reactants.concat(s.products_list);
  const controls=species.map((f,i)=>`<div class="coefficient"><strong>${h(f)}</strong><div class="coefficient-control">${transfer?'':`<button class="btn" data-step="c${i}" data-delta="-1" aria-label="Remove one ${h(f)} ${particleName(f)}">−</button>`}<input class="numeric" type="number" step="1" data-field="c${i}" aria-label="${h(f)} coefficient" value="${h(m.modelInputs['c'+i]??'')}">${transfer?'':`<button class="btn" data-step="c${i}" data-delta="1" aria-label="Add one ${h(f)} ${particleName(f)}">+</button>`}</div></div>`).join('');
  return panel(transfer?'Fresh Transfer':'Repair Order',1,transfer?'Exam mode':'Whole formulas stay fixed',
    (transfer?'':scene(s,'Context illustration of a molecule production line')) + `<p>Balance ${h(s.reactants.join(' + '))} → ${h(s.products_list.join(' + '))}${s.smallestRequired?' in the smallest whole-number ratio':''}.</p>`+(transfer?'<p>No particle tiles are supplied before your first submission.</p>':prediction(s,m))) +
    panel(transfer?'Your Answer':'Build the Batch',2,transfer?'Independent construction':'Select, type or use the buttons',
      (transfer?'':`<div id="live-model">${modelGate(m,line(s,m))}</div>`)+formGate(m,controls,transfer)) +
    panel(transfer?'Explain Your Account':'Live Ledger',3,'Count every element separately',
      `<div id="live-ledger">${!transfer || m.firstTransferResponse ? modelGate(m,ledger(s,m),transfer) : '<p>The ledger is unavailable during the first independent response.</p>'}</div>`+
      explanation(m.explanation,s.explanationPrompt)+checkButtons(m,transfer));
}
export function refresh(root,s,m) {
  const model=root.querySelector('#live-model'), led=root.querySelector('#live-ledger');
  if(model && m.predictionLocked) model.innerHTML=line(s,m);
  if(led && (m.predictionLocked || m.firstTransferResponse)) led.innerHTML=ledger(s,m);
}
export function worked(root) { /* supplied worked batch is exact and preserved */ }
