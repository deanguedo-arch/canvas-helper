"""Measures the complete REAL emitted SCORM envelope, including actual codec choice.
No candidate field limit is changed. Decoder-admitted adversarial snapshots are
labelled separately from a UI-produced teaching session. This is not tenant proof.
"""
from controlled_browser import load,ROOT
from playwright.sync_api import sync_playwright
import json,sys
rows=[]
CAPTURE=r'''(()=>{const stringify=JSON.stringify;window.__measuredEnvelopes=[];JSON.stringify=function(value,...rest){const text=stringify.call(JSON,value,...rest);if(value&&value.projectSlug==='math10c-unit3-pilot'&&value.version===1&&value.course&&value.tracking)window.__measuredEnvelopes.push(text);return text;};})();'''
def measure(page,name,data,source):
 return page.evaluate('''({name,data,source})=>{
 const raw=JSON.stringify(data),decoded=Unit3Debug.unpack(data);window.__measuredEnvelopes=[];
 __lms.rejectKey=null;__lms.rejectCommit=false;
 const before=__lms.confirmed['cmi.suspend_data'];__canvasHelperScorm.publishCourseState(data,data.done||[]);
 const ok=__canvasHelperScorm.save(),wire=__measuredEnvelopes.at(-1);if(!wire)throw Error('No actual collected envelope observed');
 const envelope=JSON.parse(wire),packed=__diagnosticForcedPacked.encode(raw),rawVariant={...envelope,course:{...envelope.course,data:raw}},packedVariant={...envelope,course:{...envelope.course,data:packed}};
 const chosen=envelope.course.data;
 if(__repairCodec.decode(chosen)!==raw)throw Error('Saved payload changed content');
 if(!ok&&__lms.confirmed['cmi.suspend_data']!==before)throw Error('Failure replaced confirmed LMS copy');
 return {name,source,applicationCharacters:raw.length,applicationUtf8Bytes:new TextEncoder().encode(raw).length,rawBridgeEnvelopeCharacters:JSON.stringify(rawVariant).length,packedBridgeEnvelopeCharacters:JSON.stringify(packedVariant).length,actualEmittedEnvelopeCharacters:wire.length,actualEncoding:chosen===raw?'raw':'packed',applicationBudget:40000,bridgeBudget:60000,applicationFits:raw.length<=40000,bridgeFits:wire.length<=60000,bridgeSaveReturned:ok,actualSetValueAttempted:__lms.attempted.some(x=>x[0]==='cmi.suspend_data'&&x[1]===wire),lastConfirmedPreservedOnFailure:ok?null:__lms.confirmed['cmi.suspend_data']===before,recordCount:data.r.length,fixedDraftCount:data.drafts.length,provenanceCount:data.provenances.length,roundtripLossless:true};
 }''',{'name':name,'data':data,'source':source})
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);page=browser.new_page();load(page)
 page.add_script_tag(content=(ROOT/'tests/repair/runtime/codec-diagnostics.js').read_text());page.add_script_tag(content=CAPTURE)
 # Non-hypothetical current page baseline through the actual bridge.
 rows.append(measure(page,'blank-current-page',page.evaluate('Unit3Debug.snapshot()'),'actual UI boot and restore'))
 for file in sorted((ROOT/'tests/repair/fixtures/capacity').glob('*.json')):
  print('MEASURE',file.stem,flush=True);data=json.loads(file.read_text());row=measure(page,'max-'+file.stem,data,'complete decoder-admitted adversarial state, not a claim of all submissions being UI-generable');rows.append(row)
 # Measured options are counterfactual projections only. They do not edit POLICY or source.
 data=json.loads((ROOT/'tests/repair/fixtures/capacity/bmp.json').read_text());decoded=page.evaluate('(x)=>Unit3Debug.unpack(x)',data)
 for kind in ['deduplicate-details','recent-zero','shorter-new-explanations-80']:
  copy=json.loads(json.dumps(decoded))
  if kind=='deduplicate-details':
   for r in copy['r'].values():
    for a in r['a']:a[4].pop('detail',None)
   for a in copy['firsts'].values():a[4].pop('detail',None)
  elif kind=='recent-zero':
   for rid in copy['recent']:copy['r'].pop(rid,None)
   copy['recent']=[]
  else:
   # Explicit hypothetical prospective-only option. Never write this back to candidate.
   for r in copy['r'].values():r['reason']=r['reason'][:80]
   copy['reasons']={k:v[:80]for k,v in copy['reasons'].items()};copy['trig']['reason']=copy['trig']['reason'][:80]
  packed=page.evaluate('(x)=>Unit3Debug.pack(x)',copy)
  row=measure(page,'OPTION-NOT-APPLIED-'+kind,packed,'counterfactual capacity projection only; not an approved retention change or existing-work migration');rows.append(row)
 browser.close()
report={'command':'python tests/repair/measure_capacity.py','mechanism':'Observe JSON serialization inside the unmodified emitted proposed shared bridge immediately before its own length check. Use real state decoder. Compare raw/packed in the complete exact envelope, not a made-up envelope. API/DOM environment is controlled, not a tenant.','limitsChanged':False,'currentPolicySource':'workspace/assets/state.js POLICY','countsAreWitnessesNotUniversalProof':True,'results':rows}
(ROOT/'evidence/actual-bridge-capacity.json').write_text(json.dumps(report,indent=2));print(json.dumps([{k:r[k]for k in ['name','applicationCharacters','actualEmittedEnvelopeCharacters','applicationFits','bridgeFits']}for r in rows],indent=2))
