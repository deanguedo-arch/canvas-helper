from pathlib import Path
import subprocess,json,re,hashlib,datetime
r=Path('/workspace/shared/ch14_0910');out=r/'review-reports';first=json.loads((out/'first-attempt.json').read_text());responses={x['id']:x for x in first['attempts']}
expected={'first-attempt.json':'2efa66e5a6b3945188ff5cda597b6eac33697cf8fbc72547e07ba45b641534c5','first-attempt.md':'fc4714470cb130093cb144a9b2bd0851f1ff57206d251e1b5aab435baf5dc8f2'}
for n,h in expected.items():assert hashlib.sha256((out/n).read_bytes()).hexdigest()==h
pdf=r/'review-rendered-final/generated-09-10.pdf';text=subprocess.check_output(['pdftotext',str(pdf),'-']).decode();g=json.loads((r/'review-blind-final/generated-09-10.json').read_text());ids=re.findall(r'(?:^|\s)\d+\.\s+(ch14-[^\s]+)',text)
assert ids==[x['id'] for x in g],(len(ids),len(g))
parity=json.loads((out/'revised-appendix-parity.json').read_text());assert parity['all_passed']
stopsfile=r/'review-feedback/original-stops.json';stops=json.loads(stopsfile.read_text());stop_comparison=[]
for l in [9,10]:
 id=f'lesson-{l:02d}-stop';prompt,model=stops[f'lesson-{l:02d}'];assert responses[id]['prompt']==prompt
 stop_comparison.append({'id':id,'prompt':prompt,'frozen_answer':responses[id]['first_attempt_answer'],'newly_supplied_original_model':model,'result':'Substantive alignment; no change to the first answer needed','reason': 'The answer rejects a conclusion from one sample, states the measured/timing limit, and requires a wider pattern.' if l==9 else 'The answer separates removing the pathogen from reversing scar tissue and asks for separate evidence about the pathway.'})
current=[]
for x in first['source_manifest']:
 p=r/x['path'];h=hashlib.sha256(p.read_bytes()).hexdigest();current.append({'path':x['path'],'bytes':p.stat().st_size,'sha256':h,'first_attempt_sha256':x['sha256'],'changed_since_first_attempt':h!=x['sha256']})
assert not any(x['changed_since_first_attempt'] for x in current if not (x['path'].startswith('review-rendered-final/generated')))
observations=[
{'page':1,'result':'Inspected actual revised pixels. Title now reads “Optional generated practice for lessons 09 and 10”; introductory “All 49” and “are not 49” spacing is clear. Items 1–10 remain readable and unchanged.'},
{'page':2,'result':'Inspected actual revised pixels. Items 11–23 remain readable and complete; no new clipping or displacement.'},
{'page':3,'result':'Inspected actual revised pixels. Items 24–33 and all four item33 choices remain readable; no changed task content.'},
{'page':4,'result':'Inspected actual revised pixels. Items 34–38 remain readable. Item36 remains in stored causal order and is still not a native shuffle test.'},
{'page':5,'result':'Inspected actual revised pixels. Item39 now has explicit “Choice 1:” through “Choice 4:” markers with all four original option strings in the same order. Items 40–44 remain readable; no clipping or page overflow.'},
{'page':6,'result':'Inspected actual revised pixels. Items 45–49, typed prompts and a–d multi-select options remain readable and complete.'}]
report={'status':'FINAL_RECHECK_COMPLETE','created_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Focused recheck of the repaired static generated appendix plus newly authorized original stop feedback; no expansion into source-accuracy or protected-change review.','frozen_first_attempt_integrity':expected,'final_result':'All 66 frozen answers remain supported. All 65 items now having supplied keys/models align substantively, including both newly supplied original stop models. The original saved contraception response is the sole unkeyed item and is supported by its visible mechanism. All 8 required-writing criteria are met. No answer corrections needed.','score_boundary':'This is an offline content/model comparison, not 65 native runtime passes or a course acceptance result.','appendix_parity':{'expected_records':49,'actual_numbered_item_ids':len(ids),'same_id_inventory_and_order':True,'all_prompts_and_ordered_options_steps_match_unchanged_json':True,'source_json_hash_unchanged':True,'comparison_method':'Extract revised PDF text, collapse whitespace only, compare each numbered item block to unchanged JSON prompt and option/step strings; also visually inspect all six PNG pages.','receipt':'revised-appendix-parity.json'},'six_page_pixel_recheck':observations,'stop_model_comparison':stop_comparison,'new_feedback_receipt':{'path':'review-feedback/original-stops.json','bytes':stopsfile.stat().st_size,'sha256':hashlib.sha256(stopsfile.read_bytes()).hexdigest()},'final_source_render_receipts':current,'remaining_limitations':['No missing explanation blocks completing any of the 66 tasks, but success largely reflects close recognition/reconstruction and repeated representations; novel independent transfer remains untested.','The cycle figure’s initial downward arrow retains a standalone causal-reading risk; surrounding text and footer explicitly correct it. The normal-anatomy figure cannot prove infection or blockage.','The PID full-name-plus-abbreviation answer is semantically correct but not literally either stored answer/alias separately; native input normalization remains untested.','No native runtime, mobile/responsive layout, interaction, shuffle, feedback activation, saving, persistence, gating or progress acceptance tested.','Scientific source accuracy and protected-source changes are reserved for the separate reviewer.'],'files_delivered':['first-attempt.md','first-attempt.json','second-pass.md','second-pass.json','revised-appendix-parity.json','final-recheck.md','final-recheck.json']}
(out/'final-recheck.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
md=['# Final learner-review recheck: CH14 lessons 09–10','',report['final_result'],report['score_boundary'],'','## Repaired appendix','All six revised rendered PNG pages were visually inspected. The PDF still contains exactly the 49 numbered item IDs in original order, and every prompt plus ordered option/step string matches the unchanged blind JSON after whitespace-only normalization. No new clipping or content loss found.','']
for x in observations:md += [f"- Page {x['page']}: {x['result']}"]
md += ['','## Original stop-model comparisons','']
for x in stop_comparison:md += [f"### {x['id']}",f"Frozen answer: {x['frozen_answer']}",f"Original model: {x['newly_supplied_original_model']}",f"Result: {x['result']}",x['reason'],'']
md += ['## Remaining boundaries']
for x in report['remaining_limitations']:md += [f'- {x}']
md += ['','## Immutable first-attempt receipts']
for n,h in expected.items():md += [f'- {n}: {h}']
md += ['','## Final source/render hashes']
for x in current:md += [f"- {x['path']}: {x['sha256']} (changed since first rendering: {x['changed_since_first_attempt']})"]
md += [f"- review-feedback/original-stops.json: {report['new_feedback_receipt']['sha256']}",'','The earlier second-pass report correctly records that stop models were unavailable at that stage; this recheck supersedes only that availability/count statement. Frozen responses are unchanged.','']
(out/'final-recheck.md').write_text('\n'.join(md))
for n in ['final-recheck.md','final-recheck.json','revised-appendix-parity.json']:print(n,hashlib.sha256((out/n).read_bytes()).hexdigest())
print('Final generated PDF',hashlib.sha256(pdf.read_bytes()).hexdigest())
print('Changed rendered files:',[x['path'] for x in current if x['changed_since_first_attempt']])
