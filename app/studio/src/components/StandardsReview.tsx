import { useEffect, useState } from "react";
import type { TeachingProposal } from "../../../shared/course-standards";

type Candidate = { id: string; project: string; family: string; checkpoint: string; decision: string; teachingProposal?: TeachingProposal };
type Queue = { revision: number; candidates: Candidate[] };
const decisions = ["universal", "family", "course-specific", "defer", "skip"];

export function StandardsReview() {
  const [queue, setQueue] = useState<Queue>({ revision: 0, candidates: [] });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [rule, setRule] = useState("maxParagraphWords");
  const [value, setValue] = useState(120);
  const refresh = () => fetch("/api/course-standards").then(async response => {
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error);
    setQueue(payload); setError("");
  }).catch(error => setError(String(error)));
  useEffect(() => {
    void refresh();
    const reload = () => void refresh();
    window.addEventListener("focus", reload);
    window.addEventListener("standards-checkpoint", reload);
    return () => { window.removeEventListener("focus", reload); window.removeEventListener("standards-checkpoint", reload); };
  }, []);
  const decide = async (candidate: Candidate, decision: string) => {
    setBusy(true);
    const proposal = candidate.teachingProposal;
    try {
      const response = await fetch("/api/course-standards/decide", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: candidate.id, revision: queue.revision, decision,
          rule: proposal?.rule ?? rule, value: proposal?.value ?? value, proposalSignature: proposal?.signature })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setQueue(payload); setError("");
    } catch (error) { setError(String(error)); }
    finally { setBusy(false); }
  };
  const pending = queue.candidates.filter(candidate => ["pending", "defer"].includes(candidate.decision));
  return <details className="standards-review" style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)" }}>
    <summary>Standards review · {pending.length} pending/deferred</summary>
    <p>Nonblocking. Review acceptance identifies an opportunity; it does not approve a universal rule. New releases apply to future starters. Existing courses require deliberate adoption.</p>
    {pending.some(candidate => !candidate.teachingProposal) && <details>
      <summary>Numeric rule for opportunities without a teaching proposal</summary>
      <label>Reusable rule <select value={rule} onChange={event => { setRule(event.target.value); setValue(event.target.value === "targetGrade" ? 10 : 120); }}>
        <option value="maxParagraphWords">Maximum words per lesson paragraph</option><option value="targetGrade">Target reading grade</option>
      </select></label>
      <label>Proposed value <input type="number" value={value} min={rule === "targetGrade" ? 8 : 40} max={rule === "targetGrade" ? 12 : 250} onChange={event => setValue(Number(event.target.value))} /></label>
      <p>A paragraph ceiling checks future lesson length; reading grade remains an authoring target, not an automatic certification.</p>
    </details>}
    {pending.map(candidate => <div key={candidate.id} data-standards-candidate={candidate.id}>
      <strong>{candidate.project}</strong> · {candidate.checkpoint} · {candidate.decision}
      {candidate.teachingProposal ? <>
        <h3>Require modeled reasoning before guided practice</h3>
        <p>{candidate.teachingProposal.rationale}</p>
        <p><strong>Evidence:</strong> {candidate.teachingProposal.evidence.observed} Source: <code>{candidate.teachingProposal.evidence.source}</code>. No inference about teaching quality.</p>
        <p><strong>Before:</strong> {candidate.teachingProposal.before.blueprint.join(" → ")}</p>
        <p><strong>After:</strong> {candidate.teachingProposal.after.blueprint.join(" → ")}</p>
        <p><strong>Example before:</strong> {candidate.teachingProposal.example.before}</p>
        <ol>{candidate.teachingProposal.example.after.map((step, index) => <li key={index}>{step.action} <strong>Why:</strong> {step.why}</li>)}</ol>
        <p>Approval adds a modeled-reasoning stage with at least two action-and-why steps before guided practice. New lessons and canonical HTML checks inherit it; pinned earlier courses remain unchanged.</p>
      </> : <p>Approve the displayed numeric rule/value for the chosen scope, or defer/skip this opportunity.</p>}
      {decisions.map(decision => <button className="ghost-button compact" disabled={busy} key={decision} onClick={() => void decide(candidate, decision)}>
        {decision === "family" ? `Family (${candidate.family})` : decision}
      </button>)}
    </div>)}
    {error && <p role="alert">{error}</p>}
  </details>;
}
export async function captureReviewStandard(project: string, identity: string) {
  const response = await fetch("/api/course-standards/capture", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project, identity }) });
  if (!response.ok) throw new Error((await response.json()).error);
  window.dispatchEvent(new Event("standards-checkpoint"));
}
