export function evidenceSufficiency(records){return {hasNewSubstanceIdentity:records.some(r=>r.kind==='identity'&&r.changed===true),supportingCount:records.filter(r=>r.relevant).length}}
export function invalidateOnEdit(state){return {...state,submittedValid:false,feedback:null,revisionMode:true}}
