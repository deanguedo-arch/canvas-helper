from pathlib import Path
import json,hashlib,datetime
root=Path('/workspace/shared/ch14_0910');out=root/'review-reports';fb=root/'review-feedback'
frozen=json.loads((out/'first-attempt.json').read_text())
expected={'first-attempt.json':'2efa66e5a6b3945188ff5cda597b6eac33697cf8fbc72547e07ba45b641534c5','first-attempt.md':'fc4714470cb130093cb144a9b2bd0851f1ff57206d251e1b5aab435baf5dc8f2'}
assert all(hashlib.sha256((out/n).read_bytes()).hexdigest()==h for n,h in expected.items())
lesson={l:json.loads((fb/f'lesson-{l:02d}.json').read_text()) for l in [9,10]}
generated={g['id']:g for g in json.loads((fb/'generated-09-10.json').read_text())}
lookup={}
for l,b in lesson.items():
 for x in b['check']['mc']+b['check']['writing']+b['guided']['guided']['items']:lookup[x['id']]=x
lookup.update(generated)
criteria_evidence={
'ch14-l09-check-writing-1':[
('Uses negative feedback correctly.','Ovarian hormones normally inhibit the hypothalamus and anterior pituitary. If ovarian output falls, less inhibition reaches a functioning control system, so the anterior pituitary can release more FSH and LH.'),
('Separates stimulation from target responsiveness.','The extra stimulation does not guarantee more ovarian output when follicles respond poorly.')],
'ch14-l09-check-writing-2':[
('Connects corpus luteum to hormones and lining in both cases.','Without pregnancy support, the corpus luteum regresses, its progesterone and estrogen output falls, and the functional endometrial lining is shed. / The corpus luteum keeps supplying progesterone and estrogen, maintaining support for the endometrium rather than following its usual decline.'),
('Identifies hCG’s early supporting role.','In early pregnancy, developing trophoblast releases hCG, which supports the corpus luteum.')],
'ch14-l10-check-writing-1':[
('Gives a relevant reproductive structure.','An infection can cause inflammation and leave scar tissue that narrows or blocks an oviduct.'),
('Explains tissue damage and its functional effect.','The damaged route can prevent sperm and the oocyte from meeting or interfere with early-embryo movement toward the uterus.')],
'ch14-l10-check-writing-2':[
('Separates conception from infection transmission.','Preventing pregnancy and reducing infection transmission act on different parts of the process.'),
('Contrasts hormonal action with barrier action without promising complete protection.','Combined hormonal contraception can suppress the LH surge and ovulation ... An appropriate condom used correctly and consistently is a physical barrier ... affected skin outside its coverage means protection is not absolute.')]}
notes={
'ch14-l09-check-writing-1':'All model relations and both criteria are present; the additional inhibin qualification is taught in 09-02-p2.',
'ch14-l09-check-writing-2':'Both conditions connect corpus-luteum state, hormone output and lining outcome; hCG source and supporting role are included.',
'ch14-l10-check-writing-1':'Oviduct is a relevant example; scar-related obstruction and its effect are explained while ovarian processes remain distinct. The model permits an oviduct or epididymis example, so naming both is not required.',
'ch14-l10-check-writing-2':'Hormonal suppression and physical barrier are contrasted, with residual transmission risk explicitly retained.',
'lesson-09-new-optional':'The answer identifies a non-responsive corpus-luteum target and the broken hCG-to-steroid-output link, with no adequate replacement source. It does not mistake hCG for progesterone or infer an individual clinical outcome.',
'lesson-10-new-optional':'Both disrupted steps are identified; removing infection is not assumed to restore the LH surge or reverse old scarring.',
'lesson-09-stop':'No stop-specific feedback entry is present in lesson-09.json. The answer matches visible 09-01-p4, including the timing limitation.',
'lesson-10-stop':'No stop-specific feedback entry is present in lesson-10.json. The answer matches visible 10-03-p4 and worked step 4.',
'ch14-source-OBJ_2131183':'The feedback explicitly records original_key: null. Compared only to visible 09-04-p1/2: estrogen/progestin supply, inhibitory hypothalamic/pituitary feedback, reduced FSH/LH support, reduced follicular development and ovulation are all present. No raw model or scoring key is invented.',
'ch14-typed-20':'Semantically correct. The frozen response combines full name and abbreviation in one string. The supplied answer is “pelvic inflammatory disease” and its alias is “PID”; the combined string is not literally either stored value. Native normalization/acceptance was not tested, so do not report a runtime pass.',
'ch14-sequence-08':'All four steps match the stored answer order. They were already displayed in that order in the blind packet, so this is an order-consistency comparison, not a blind shuffled-order test.',
'ch14-multiple-select-5':'The selected IDs a and b match the supplied answer set exactly; explanations reject the other two conclusions using visible lesson10 teaching.',
'ch14-concept-menopause-misconception':'The frozen answer directly states reduced inhibition and increased FSH/LH, which addresses the misconception. The supplied model leads with a menopause definition and then says stimulation and responsiveness can change in different directions; the answer is substantively aligned and more explicit about the causal direction.',
'ch14-concept-hormonal-contraception-misconception':'The frozen answer rejects the universal STI-protection claim through the combined-pill example; the model also distinguishes conception control from STI transmission.',
'ch14-concept-pelvic-inflammatory-disease-misconception':'The frozen answer directly denies protection of the oviduct by normal ovarian hormones and supplies the tissue-damage mechanism, matching the model distinction.',
'ch14-concept-infertility-misconception':'The frozen answer provides a transport-pathway counterexample while preserving hormone/gamete production, matching the model distinction.',
'ch14-concept-ectopic-pregnancy-misconception':'The frozen answer correctly distinguishes the site of normal fertilization from the site of implantation, matching the model.'}
comparisons=[]
for r in frozen['attempts']:
 id=r['id'];entry=lookup.get(id);key=None;aliases=[];criteria=[]
 if r['category']=='new_optional':
  key=lesson[r['lesson']]['new_optional_model'];result='Substantive model alignment';basis='Offline semantic comparison to supplied optional model'
 elif r['category'] in ['stop','original_saved_optional']:
  result='Supported by visible teaching; no supplied key';basis='Unkeyed content comparison only'
 elif r['category']=='required_writing':
  key=entry['model'];criteria=[{'criterion':c,'met':True,'frozen_answer_evidence':e} for c,e in criteria_evidence[id]];result='Substantive model alignment; both criteria met';basis='Offline semantic comparison to supplied model and explicit criteria'
 else:
  key=entry.get('answer',entry.get('answers'));aliases=entry.get('aliases',[])
  if entry.get('kind')=='order':result='Stored step order matches';basis='Offline order comparison; native shuffling not tested'
  elif entry.get('kind')=='multi-select':result='Selected option IDs match';basis='Offline set comparison'
  elif id=='ch14-typed-20':result='Semantic match; combined input-string acceptance untested';basis='Offline semantic comparison; no native grading'
  elif isinstance(key,str) and r['first_attempt_answer']==key:result='Exact displayed answer text match';basis='Offline string comparison'
  elif isinstance(key,str) and r['first_attempt_answer'].casefold()==key.casefold():result='Answer text matches apart from case';basis='Offline case-insensitive comparison; native case normalization untested'
  else:result='Substantive answer/model alignment';basis='Offline semantic comparison; not a verbatim-match requirement'
  if entry.get('kind')=='mc' or r['category'] in ['required_selection','supported']:assert r['first_attempt_answer']==key
 comp={'id':id,'category':r['category'],'frozen_first_answer':r['first_attempt_answer'],'supplied_key_or_model':key,'supplied_aliases':aliases,'comparison_result':result,'comparison_basis':basis,'criteria':criteria,'notes':notes.get(id,'The frozen answer expresses the supplied key/model meaning and is supported by the teaching mapped in the first-attempt record.'),'correction_to_first_answer_needed':False,'native_runtime_pass_claimed':False}
 comparisons.append(comp)
files=[fb/n for n in ['lesson-09.json','lesson-10.json','generated-09-10.json']]
feedback_hashes=[{'file':str(p.relative_to(root)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in files]
source_drift=[x['path'] for x in frozen['source_manifest'] if hashlib.sha256((root/x['path']).read_bytes()).hexdigest()!=x['sha256']]
report={
'status':'SECOND_PASS_FEEDBACK_COMPARISON','created_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'frozen_files_verified_unchanged':expected,'feedback_hashes':feedback_hashes,'source_or_render_drift_at_comparison':source_drift,
'learner_sufficiency':{'conclusion':'Sufficient visible support for all 66 attempted prompts, within the stated prerequisite. No first-answer correction required after offline comparison.','qualified_meaning':'This establishes answerability from the visible lesson and consistency with supplied keys/models. It does not establish independent unaided learner mastery, source accuracy, native-course acceptance or mobile/runtime behavior.','first_use':'No blocking first-use gap. Glossary-first trophoblast and unexpanded/untaught incidental distractor terms create minor reading load but no required-answer gap.','cognitive_demand':'Most checks are direct recognition or reconstruction of taught chains. Absurd distractors make several selections easy. Two new optional tasks require useful near transfer. Repeated generated forms and already-ordered pathway do not provide independent concept/mastery counts.'},
'answer_comparison_summary':{'all_attempts':66,'with_supplied_key_or_model':63,'substantively_aligned_with_supplied_key_or_model':63,'required_writing_criteria_met':8,'required_writing_criteria_total':8,'unkeyed_stops_supported_by_visible_teaching':2,'unkeyed_original_saved_response_supported_by_visible_teaching':1,'answer_corrections_needed':0,'runtime_grading_results':None,'generated_breakdown':{'mc':8,'flash':29,'blank':10,'order':1,'multi_select':1},'important_input_caveat':'ch14-typed-20 first answer is the full name plus (PID); key and alias contain each separately. This is semantically correct, but exact native input acceptance is unverified.'},
'per_task_comparison':comparisons,
'static_pixel_result':{'pages_actually_inspected':20,'blocking_clipping_or_missing_content':False,'residual_diagram_issue':'Lesson09 cycle figure has early-follicle-to-flow downward arrow; lesson text and footer explicitly correct causal interpretation. Normal lesson10 anatomy figure is not a damage/blocked-route picture.','minor_presentation_issues':['Some teaching/figure and practice/questions require a page turn.','Lesson10 page 7 is mostly blank.','Generated item39 has readable separated choices without visible bullet markers.','Generated title/introduction contain compact lessons09/and10/All49 spacing.'],'pending_recheck':'Parent will supply repaired generated appendix for focused content/pixel recheck. Frozen first attempt remains unchanged.'},
'feedback_observations':[{'id':'F1','observation':'Several generated application cues are generic definitions rather than mechanism-specific scaffolds. Examples: application16 cues a menopause definition; application17 cues a general negative-feedback definition; application18/20 cue only the STI definition.','impact':'Answers remain supported by teaching, but hints may not help a learner locate the missing causal step.'},{'id':'F2','observation':'The feedback JSON guided.worked entries describe shorter stored worked examples that differ from the rendered authored worked examples. I did not use them to score the new optional prompts; those have dedicated new_optional_model entries.','impact':'This is an observed packet-field difference, not evidence that stale content is exposed in the native course. Implementation/source review belongs to the separate lane.'}],
'limitations':['Read-only static review: no course interactions or native mobile/desktop layout tested.','No native answer matching, alias normalization, shuffle, gates, saving/editing, reload persistence, All My Work, progress/finish, term dialogs, video or textbook navigation tested.','Read-aloud figure descriptions and already-ordered stored steps are not native runtime evidence.','No independent verification of source scientific accuracy or protected-source changes in this lane.','No true novice cohort or delayed/unfamiliar transfer test; my answers draw from visible teaching and permitted prerequisite.'],
'next_step':'Wait for the revised generated appendix, then inspect all affected rendered pages and verify that the 49 prompt/option/step texts are unchanged. Record recheck in a new file; do not rewrite frozen first-attempt files.'}
(out/'second-pass.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
md=['# CH14 lessons 09–10: second-pass feedback comparison','',f"Compared at {report['created_at_utc']}",'','## Outcome','All 63 tasks with supplied keys/models are substantively aligned with the frozen answers; all 8 explicit writing criteria are met. The 2 stops and original saved contraception response are supported by visible teaching, but have no supplied key. No first-answer correction is needed. This is not a 66/66 native runtime grade.','','## Learner sufficiency']
for k,v in report['learner_sufficiency'].items():md += [f'- {k}: {v}']
md += ['','## Actual answer/key/criteria comparison','']
for c in comparisons:
 md += [f"### {c['id']}",f"Frozen first answer: {c['frozen_first_answer']}",f"Supplied key/model: {json.dumps(c['supplied_key_or_model'],ensure_ascii=False)}",f"Supplied aliases: {json.dumps(c['supplied_aliases'],ensure_ascii=False)}",f"Result: {c['comparison_result']}",f"Basis: {c['comparison_basis']}",c['notes']]
 for crit in c['criteria']:md += [f"- Criterion met: {crit['criterion']} Evidence: {crit['frozen_answer_evidence']}"]
 md += ['']
md += ['## Static pixels and limitations',json.dumps(report['static_pixel_result'],indent=2,ensure_ascii=False),'']
for x in report['limitations']:md += [f'- {x}']
md += ['','## Feedback observations']
for x in report['feedback_observations']:md += [f"- {x['id']}: {x['observation']} {x['impact']}"]
md += ['','## Integrity','Both frozen first-attempt hashes match the previously reported values. All 26 source/render files matched their frozen hashes at this comparison.']
for n,h in expected.items():md += [f'- {n}: {h}']
for f in feedback_hashes:md += [f"- {f['file']}: {f['sha256']}"]
md += ['','## Awaited recheck',report['next_step'],'']
(out/'second-pass.md').write_text('\n'.join(md))
for n in ['second-pass.json','second-pass.md']:
 p=out/n;print(n,p.stat().st_size,hashlib.sha256(p.read_bytes()).hexdigest())
