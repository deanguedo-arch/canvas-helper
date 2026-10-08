export type TeachingProposal = {
 rule: "modeledReasoningBeforeGuided"; value: true; signature: string;
 before: { standard: string; blueprint: string[] }; after: { blueprint: string[] };
 rationale: string; example: { before: string; after: { action: string; why: string }[] };
 evidence: { expectation: string; checkpoint: "review"|"export"; source: string; sourceFingerprint: string; observed: string };
};
