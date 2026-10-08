import {evaluatePlan, deviceEnergyKWh, efficiencyPercent, validate as validateCore} from './engine.js';

export const VERSION = '2.1.0-pilot1';
export function number(value) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim() || !/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i.test(value.trim()))) throw new Error('Enter a finite number.');
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error('Enter a finite, non-negative number.');
  return n;
}
export function challenges(bank, extra) {
  return [...bank.scenarios.map(s => ({...structuredClone(s), ...structuredClone(extra.core[s.id]),
    initial: {...structuredClone(s.initial), ...(extra.core[s.id].initialOverrides || {})},
    sourceContentVersion:s.contentVersion || bank.version, contentVersion:extra.version})),
    ...structuredClone(extra.variants), structuredClone(extra.lab)];
}
export function initialConfig(s) {
  const c = structuredClone(s.initial || {});
  // Authored worked answers remain fixtures, never learner responses.
  delete c.total; delete c.initialTotal; delete c.repairedTotal;
  if (s.input_j != null) c.fixture = s.initialFixture || 'reference';
  return c;
}
export function account(s, config) {
  try {
    if (s.input_j != null) {
      const fixture = s.fixtures.find(f => f.id === config.fixture);
      if (!fixture) throw new Error('Choose an offered motor.');
      const percent = efficiencyPercent(fixture.useful, fixture.input);
      return {ready:true, kind:'efficiency', fixture, percent, other:fixture.input-fixture.useful,
        usefulMet:fixture.useful >= s.usefulMinimum, efficiencyMet:percent + 1e-9 >= s.efficiencyMinimum,
        valid:fixture.useful >= s.usefulMinimum && percent + 1e-9 >= s.efficiencyMinimum};
    }
    const rows = s.serviceRequirements.map(r => {
      const count=number(config[r.id+'_count']), watts=number(config[r.id+'_power']), hours=number(config[r.id+'_hours']);
      if (!Number.isSafeInteger(count) || count>24) throw new Error('Use a whole number of devices from 0 to 24.');
      if (hours>24 || Math.abs(hours*2-Math.round(hours*2))>1e-8) throw new Error('Use 0–24 hours in half-hour steps.');
      if (!r.powers.includes(watts)) throw new Error('Choose a supplied equal-service equipment option.');
      return {...r, count, watts, hours, kwh:deviceEnergyKWh({count,watts,hours}),
        service:count>=r.requiredCount && hours>=r.requiredHours};
    });
    const p=evaluatePlan({devices:rows,cap_kwh:s.cap_kwh,requirements:s.serviceRequirements});
    return {ready:true,kind:'plan',rows,...p,remaining:s.cap_kwh-p.total_kwh};
  } catch(e) {return {ready:false,valid:false,message:e.message};}
}
export function judge(s, config, independent=false) {
  const model=account(s,config);
  if (!model.ready) return {...model, message:model.message};
  if (model.kind==='efficiency') {
    let entered;
    try {entered=number(config.efficiency);} catch {return {...model,valid:false,message:'Predict the selected motor’s efficiency as a percentage, then run the test.'};}
    const calculation=Math.abs(entered-model.percent)<=0.05;
    const original=validateCore({...s,input_j:model.fixture.input,useful_j:model.fixture.useful},{efficiency:calculation?model.percent:entered});
    return {...model,calculation,valid:model.valid&&original.valid,
      message:!calculation?'Your predicted percentage does not match this motor. Compare useful output with input.':!model.usefulMet?'This motor does not provide enough useful motion for the task.':!model.efficiencyMet?'This motor provides motion, but misses the efficiency target.':'This motor meets both targets, and your efficiency calculation matches.'};
  }
  const a={...config};
  if (!independent) a.total=model.total_kwh;
  else {
    try {a.initialTotal=number(config.initialTotal);a.repairedTotal=number(config.repairedTotal);} catch {return {...model,valid:false,message:'Enter both totals in kWh before submitting your independent plan.'};}
  }
  const checked=validateCore(s,a);
  return {...model,valid:checked.valid,message:checked.valid?'Every service is covered and the energy account fits the cap.':checked.message,
    calculationSupported:!independent};
}
export function replayAccount(model, elapsed) {
  if (!model.ready || model.kind!=='plan') return [];
  return model.rows.map(r=>({...r,elapsed:Math.min(Math.max(0,elapsed),r.hours),
    active:r.count>0 && elapsed<r.hours,used:deviceEnergyKWh({count:r.count,watts:r.watts,hours:Math.min(Math.max(0,elapsed),r.hours)})}));
}
