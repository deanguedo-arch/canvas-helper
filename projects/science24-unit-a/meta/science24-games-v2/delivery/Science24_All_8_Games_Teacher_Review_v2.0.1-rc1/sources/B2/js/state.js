// Anonymous session only. No storage, telemetry or learner identifiers.
export const clone = value => structuredClone(value);
export const fingerprint = value => JSON.stringify(value);
export function createSession(bank) {
  return { gameId: bank.game_id, scenarioVersion: bank.version, stage: 'brief', scenarioIndex: 0,
    transferStarted: false, transferSupportRevisited: false, missions: Object.fromEntries(bank.scenarios.map(s => [s.id,
      { scenarioId: s.id, scenarioVersion: bank.version, stage: s.stage === 'worked' ? 'worked' : s.stage === 'transfer' ? 'transfer' : 'attempt', claim: null, transferResponse: null, prediction: '', predictionLocked: false,
        modelInputs: clone(s.initial || {}), explanation: '', openedEvidence: [], selectedEvidence: [], hintsUsed: [],
        attempts: [], feedback: null, submittedValid: false, submittedFingerprint: null,
        firstTransferResponse: null, selfReview: {}, revealed: false, replayTime: 0 }])) };
}
export function getMission(session, bank) { return session.missions[bank.scenarios[session.scenarioIndex].id]; }
export function answerOf(mission) { return { ...clone(mission.modelInputs), explanation: mission.explanation }; }
export function editMission(mission, field, value) {
  if (field === 'explanation') mission.explanation = value;
  else mission.modelInputs[field] = value;
  if (mission.submittedFingerprint !== fingerprint(answerOf(mission))) mission.submittedValid = false;
}
export function lockPrediction(mission) {
  if (!String(mission.prediction).trim()) return false;
  mission.predictionLocked = true;
  return true;
}
export function submitMission(session, scenario, mission, validate) {
  if (scenario.stage !== 'transfer' && !mission.predictionLocked) return { valid: false, incomplete: true, message: 'Commit your prediction before checking the model.' };
  const answer = answerOf(mission);
  const result = validate(scenario, answer);
  const complete = String(mission.explanation).trim().length > 0;
  const checked = { ...result, valid: result.valid && complete,
    message: result.valid && !complete ? 'Your model result is valid. Add your reasoning before continuing; a teacher will judge its quality.' : result.message };
  const attempt = clone({ answer, result: checked, prediction: mission.prediction,
    hintsUsed: mission.hintsUsed, supportRevisited: session.transferSupportRevisited });
  // Snapshots never share references with the editable draft.
  mission.attempts.push(attempt);
  if (scenario.stage === 'transfer' && mission.firstTransferResponse === null) mission.firstTransferResponse = clone(attempt);
  if (scenario.stage === 'transfer') mission.transferResponse = clone(attempt);
  mission.feedback = checked;
  mission.submittedValid = checked.valid;
  mission.submittedFingerprint = fingerprint(answer);
  mission.revealed = true;
  mission.selfReview = {};
  return checked;
}
export function canAdvance(mission) {
  return mission.submittedValid && mission.submittedFingerprint === fingerprint(answerOf(mission)) &&
    ['model', 'evidence', 'reasoning', 'limits'].every(k => mission.selfReview[k] === true);
}
export function addHint(mission, index) { if (!mission.hintsUsed.includes(index)) mission.hintsUsed.push(index); }
export function navigate(session, bank, stage, index = session.scenarioIndex) {
  if (!Number.isInteger(index) || index < 0 || index >= bank.scenarios.length) throw new Error('Unknown mission');
  if (!['brief', 'worked', 'attempt', 'feedback', 'transfer', 'review'].includes(stage)) throw new Error('Unknown stage');
  const transfer = bank.scenarios.find(s => s.stage === 'transfer');
  if (session.transferStarted && !session.missions[transfer.id].firstTransferResponse && stage === 'worked') return false;
  if (session.transferStarted && stage !== 'transfer' && stage !== 'review' && index < bank.scenarios.length - 1) session.transferSupportRevisited = true;
  if (stage === 'transfer') session.transferStarted = true;
  session.stage = stage; session.scenarioIndex = index; session.missions[bank.scenarios[index].id].stage = stage;
  return true;
}
export function sessionReview(session, bank) {
  return bank.scenarios.filter(s => s.stage !== 'worked').map(s => {
    const m = session.missions[s.id]; const first = m.firstTransferResponse;
    return { id: s.id, title: s.title, checked: m.submittedValid, attempts: m.attempts.length,
      hints: m.hintsUsed.length, selfReview: clone(m.selfReview), explanation: m.explanation,
      firstTransfer: first ? clone(first) : null,
      independentFirstResult: !!first && first.result.valid && first.hintsUsed.length === 0 && !first.supportRevisited,
      explanationQuality: 'Teacher review pending' };
  });
}
