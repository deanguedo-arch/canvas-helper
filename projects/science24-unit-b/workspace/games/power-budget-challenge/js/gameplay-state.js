import {clone, fingerprint} from './state.js';
import {initialConfig, judge, VERSION} from './gameplay-model.js';

const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const modelKey=m=>fingerprint(m.config);
export function createGame(all) {
  return {version:VERSION,mode:'home',currentId:'B2-W01',unlocked:0,seenReplay:[],transferStarted:false,supportRevisited:false,serial:0,
    missions:Object.fromEntries(all.map(s=>[s.id,{scenarioId:s.id,baseScenarioId:s.baseScenarioId||s.id,
      contentVersion:s.contentVersion,sourceContentVersion:s.sourceContentVersion||null,config:initialConfig(s),prediction:'',explanation:'',evidence:'',hints:[],trials:[],
      firstTransferResponse:null,completion:null,completions:[],revealed:false,elapsed:0}]))};
}
export function edit(m,field,value) {
  if (['prediction','explanation','evidence'].includes(field)) m[field]=value;
  else m.config[field]=value;
  m.completion=null;
}
export function latest(m) {return m.trials.at(-1)||null;}
export function currentCheck(m) {const t=latest(m);return !!t&&t.result.valid&&t.modelKey===modelKey(m);}
export function complete(m) {
  return !!m.completion&&currentCheck(m)&&m.completion.answerKey===fingerprint({config:m.config,prediction:m.prediction,explanation:m.explanation,evidence:m.evidence});
}
export function submit(game,s) {
  const m=game.missions[s.id], independent=s.stage==='transfer';
  if (!independent&&!m.prediction) return {incomplete:true,message:'Make a prediction before the first model result is shown.'};
  if (independent&&(!m.explanation.trim()||!m.evidence)) return {incomplete:true,message:'Include your claim and chosen evidence before submitting. Your first response is preserved.'};
  const result=judge(s,m.config,independent);
  // Invalid numeric forms are drafts, not submitted attempts. A complete wrong answer is a trial.
  if (!result.ready) return {incomplete:true,message:result.message};
  if (independent&&(!Number.isFinite(Number(m.config.initialTotal))||!String(m.config.initialTotal??'').trim()||!Number.isFinite(Number(m.config.repairedTotal))||!String(m.config.repairedTotal??'').trim())) return {incomplete:true,message:'Enter both finite totals in kWh.'};
  if (s.input_j!=null&&!String(m.config.efficiency??'').trim()) return {incomplete:true,message:'Predict a percentage before testing the motor.'};
  const trial=freeze(clone({id:++game.serial,scenarioId:s.id,baseScenarioId:m.baseScenarioId,contentVersion:m.contentVersion,sourceContentVersion:m.sourceContentVersion,
    answer:{...m.config,explanation:m.explanation,evidence:m.evidence},
    prediction:independent?`Original energy: ${m.config.initialTotal} kWh; repaired plan: ${m.config.repairedTotal} kWh`:m.prediction,
    result,modelKey:modelKey(m),hintsUsed:m.hints,supportRevisited:game.supportRevisited,
    supportMode:independent?'independent':s.stage==='lab'?'open experimentation':s.stage==='worked'?'coached':'practice',
    calculationSupported:!independent&&s.input_j==null}));
  m.trials.push(trial);m.revealed=true;m.completion=null;
  if(independent&&!m.firstTransferResponse)m.firstTransferResponse=trial;
  if(independent&&result.valid) finish(game,s);
  return result;
}
export function finish(game,s) {
  const m=game.missions[s.id];
  if (!currentCheck(m)) return {valid:false,message:'Run the current plan successfully before completing this mission.'};
  if(!m.explanation.trim()||!m.evidence)return {valid:false,message:'Choose supporting evidence and add a short claim.'};
  m.completion=freeze(clone({trialId:latest(m).id,explanation:m.explanation,evidence:m.evidence,
    answerKey:fingerprint({config:m.config,prediction:m.prediction,explanation:m.explanation,evidence:m.evidence}),
    explanationQuality:'Teacher review pending'}));
  m.completions.push(m.completion);
  return {valid:true};
}
export function open(game,s) {
  const t=game.missions['B2-T01'];
  if(game.transferStarted&&!t.firstTransferResponse&&s.stage!=='transfer')return false;
  if(game.transferStarted&&s.stage!=='transfer')game.supportRevisited=true;
  if(s.stage==='transfer')game.transferStarted=true;
  if(s.stage==='replay'&&!game.seenReplay.includes(s.id))game.seenReplay.push(s.id);
  game.currentId=s.id;game.mode='play';return true;
}
export function hint(game,s) {
  if(s.stage==='transfer'&&!game.missions[s.id].firstTransferResponse)return null;
  const m=game.missions[s.id],text=s.hints?.[m.hints.length];
  if(text){m.hints.push(text);return text;}return null;
}
export function takeReplay(game,all,random=Math.random) {
  const candidates=all.filter(s=>s.stage==='replay'&&!game.seenReplay.includes(s.id));
  if(!candidates.length)return null;
  const s=candidates[Math.min(candidates.length-1,Math.floor(random()*candidates.length))];
  if(!open(game,s))return null;
  return s;
}
export function review(game,core) {
  return core.map(s=>{const m=game.missions[s.id],first=m.firstTransferResponse;
    return {id:s.id,title:s.title,complete:complete(m),modelChecked:currentCheck(m),trials:m.trials.length,hints:m.hints.length,
      explanation:m.completion?.explanation||m.explanation,evidence:m.completion?.evidence||m.evidence,
      supportMode:s.stage==='worked'?'Coached':s.stage==='transfer'?'Independent':'Practice with model support',
      firstTransfer:first,independentFirstModel:!!first&&first.result.valid&&!first.supportRevisited&&!first.hintsUsed.length,
      explanationQuality:'Teacher review pending'};});
}
