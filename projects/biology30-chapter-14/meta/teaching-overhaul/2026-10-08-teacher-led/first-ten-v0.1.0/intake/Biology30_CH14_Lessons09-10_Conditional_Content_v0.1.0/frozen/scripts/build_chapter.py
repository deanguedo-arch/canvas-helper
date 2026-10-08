#!/usr/bin/env python3
"""Build canonical Chapter 14 HTML/data inside the frozen v8 component system.
Run from any directory: python scripts/build_chapter.py
"""
from pathlib import Path
from collections import defaultdict
import sys,json,re,html,hashlib,copy
from bs4 import BeautifulSoup
from content import LESSONS,WORDS,MISCONCEPTIONS,TYPED,SEQUENCES,VIDEOS,FINAL_MC,FINAL_WRITING
ROOT=Path(__file__).resolve().parents[1]; W=ROOT/'workspace'; A=ROOT/'authoring'; T=A/'templates'
e=lambda x:html.escape(str(x),quote=True)
def dump(path,obj):path.write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding='utf8')
def slug(s):return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def attrs(key):return f'data-canvas-edit-key="{key}" data-canvas-helper-edit-key="{key}"'
def fragment(s):return BeautifulSoup(s,'html.parser')
def para(s,key=None):return f'<p {attrs(key) if key else ""}>{s}</p>'
# The compiled arrays retain stable answer strings. Position balancing happens once,
# before browser use; normal generated practice additionally saves seeded order.
counters=defaultdict(int)
def balanced(correct,others,group):
 vals=list(dict.fromkeys([correct]+list(others)))
 if len(vals)<2:raise ValueError('Too few options')
 n=len(vals); pos=counters[(group,n)]%n;counters[(group,n)]+=1
 wrong=[v for v in vals if v!=correct];wrong=wrong[counters[(group,n)]%len(wrong):]+wrong[:counters[(group,n)]%len(wrong)]
 wrong.insert(pos,correct);return wrong
words=[]
for term,meaning,ex,dist,aliases,lesson in WORDS:
 words.append(dict(id='ch14-word-'+slug(term),term=term,meaning=meaning,example=ex,whatItDoes=ex,feature=ex,importantDistinction=dist,confusion=dist,aliases=aliases,lesson=lesson))
byterm={w['term'].lower():w for w in words}
for w in words:
 for alias in w['aliases']:byterm.setdefault(alias.lower(),w)
def lookup(term):
 aliases={'feedback':'negative feedback','corpus luteum degeneration':'corpus luteum','combined hormonal contraceptive':'negative feedback','luteinizing hormone (LH)':'LH','follicle-stimulating hormone (FSH)':'FSH','sexually transmitted infection (STI)':'STI','pelvic inflammatory disease (PID)':'pelvic inflammatory disease'}
 t=aliases.get(term,term).lower()
 if t in byterm:return byterm[t]
 exact=[w for w in words if w['term'].lower().startswith(t+' (')]
 if len(exact)==1:return exact[0]
 raise KeyError(term)
def cid(term):return 'ch14-concept-'+slug(lookup(term)['term'])
def termbutton(term):
 w=lookup(term);return f'<button class="bio-term" type="button" data-term-id="{w["id"]}" aria-haspopup="dialog">{e(term)}</button>'
def linked(text,used):
 # Only source-authored paragraph text enters this function. No DOM headings/choices.
 matches=[]
 for t,w in byterm.items():
  if len(t)<3 or w['id'] in used:continue
  m=re.search(r'(?<![\w])'+re.escape(t)+r'(?![\w])',text,re.I)
  if m:matches.append((m.start(),-len(m.group()),m.end(),w,m.group()))
 matches.sort();out='';last=0
 for start,_,end,w,shown in matches:
  if start<last or w['id'] in used:continue
  out+=e(text[last:start])+f'<button class="bio-term" type="button" data-term-id="{w["id"]}" aria-haspopup="dialog">{e(shown)}</button>';last=end;used.add(w['id'])
 return out+e(text[last:])
concepts=[]
for w in words:
 assert w['term'] in MISCONCEPTIONS,w['term']
 concepts.append(dict(id='ch14-concept-'+slug(w['term']),term=w['term'],lesson=w['lesson'],meaning=w['meaning'],example=w['example'],aliases=w['aliases'],cue='Identify the function or relationship described.',correctExplanation=w['meaning']+' '+w['importantDistinction'],misconception={'statement':MISCONCEPTIONS[w['term']],'correction':w['meaning']+' '+w['importantDistinction']},reviewRoute=f'lesson-{w["lesson"]:02d}'))

checks=[];guided=[]
for n,l in enumerate(LESSONS,1):
 ch=dict(id=f'ch14-check-{n:02d}',route=f'lesson-{n:02d}',title=l['title'],mc=[],writing=[])
 for i,(prompt,answer,wrong,cue,ex)in enumerate(l['check'],1):
  ch['mc'].append(dict(id=f'ch14-l{n:02d}-check-mc-{i}',prompt=prompt,answer=answer,options=balanced(answer,wrong,'checks'),cue=cue,explanation=ex,difficulty='application'))
 for i,(prompt,model,criteria)in enumerate(l['writing'],1):ch['writing'].append(dict(id=f'ch14-l{n:02d}-check-writing-{i}',prompt=prompt,model=model,criteria=criteria,limit=3200))
 checks.append(ch)
 title,scenario,steps=l['worked']
 ga=dict(chapter=14,lesson=n,route=ch['route'],worked=dict(id=f'ch14-l{n:02d}-worked',label='Worked example',title=title,scenario=scenario,steps=steps),guided=dict(id=f'ch14-l{n:02d}-guided',label='Practise with support',title='Apply the explanation',instruction='Try both questions. Use the hint to revise your thinking after an incorrect answer.',items=[]))
 for i,(prompt,answer,a,b,hint,ex)in enumerate(l['guided'],1):ga['guided']['items'].append(dict(id=f'ch14-l{n:02d}-guided-q{i}',kind='select',prompt=prompt,answer=answer,options=balanced(answer,[a,b],'guided'),hint=hint,explanation=ex))
 guided.append(ga)
final=dict(id='ch14-check-11',route='lesson-11',title='Chapter review and final check',mc=[],writing=[])
for i,(p,ans,wrong,cue,ex)in enumerate(FINAL_MC,1):final['mc'].append(dict(id=f'ch14-final-mc-{i}',prompt=p,answer=ans,options=balanced(ans,wrong,'checks'),cue=cue,explanation=ex,difficulty='application'))
for i,(p,m,c)in enumerate(FINAL_WRITING,1):final['writing'].append(dict(id=f'ch14-final-writing-{i}',prompt=p,model=m,criteria=c,limit=3200))
checks.append(final)
transfer=dict(id='ch14-transfer-01',chapter=14,route='lesson-11',title='Try a new case',instruction='Try the whole set before viewing feedback. Record whether you used help. This optional formative check does not add to required progress.',mc=[],writing=dict(id='ch14-transfer-writing',prompt='A tissue model receives a normal luteal progesterone concentration, but its endometrial cells have non-functioning progesterone receptors. Explain why hormone concentration alone cannot establish that the lining will respond normally. Distinguish hormone production from target-cell response.',model='A normal progesterone concentration is evidence about hormone availability, not receptor function. Endometrial cells need functioning receptors for the usual progesterone response. The model can have normal ovarian hormone production but reduced support of the lining because the target cannot respond normally.',criteria=['Separates hormone availability from target response.','Connects receptor function to progesterone action in endometrial cells.','Limits the conclusion to the stated model.'],limit=3200))
transfer_items=[
('A model testis has interstitial cells that cannot respond to LH. The hypothalamus and pituitary still respond normally to feedback. Which pattern is most consistent with this model?','Reduced testosterone with increased stimulation from the control centres',['Increased testosterone with reduced stimulation from the control centres','Reduced testosterone with permanently absent LH release','Normal testosterone because FSH directly replaces LH at interstitial cells'],'Reduced testosterone means weaker negative feedback. More upstream stimulation cannot fully correct an unresponsive target.'),
('A model shows an LH surge and release of an oocyte, followed by failure of the corpus luteum to remain active. Which change follows most directly?','Lower luteal progesterone and reduced support for the endometrium',['Persistently high luteal progesterone from the inactive corpus luteum','Failure of the earlier LH surge to have occurred','A direct blockage of the oviduct by falling progesterone'],'The corpus luteum is the main luteal progesterone source. Its reduced activity affects hormonal support of the lining; it does not undo earlier ovulation.'),
('A semen sample contains sperm and the transport ducts are open, but seminal-vesicle fluid contains unusually little fructose. Which function is affected most directly by this specific change?','An energy contribution normally provided by an accessory-gland secretion',['Testosterone synthesis in interstitial cells','Chromosome reduction inside primary spermatocytes','The opening of the vas deferens during sperm transport'],'Fructose is part of an accessory-gland contribution to semen. The finding does not by itself establish failed meiosis, absent testosterone or blocked transport.')]
for i,(p,ans,wrong,ex)in enumerate(transfer_items,1):transfer['mc'].append(dict(id=f'ch14-transfer-mc-{i}',prompt=p,answer=ans,options=balanced(ans,wrong,'transfer'),explanation=ex))

imports=json.loads((A/'imported-practice.json').read_text());sources=json.loads((A/'optional-source-responses.json').read_text())
# Refine concept associations to the actual answer or taught process, not a whole lesson.
for q in imports:
 ans=q['answer'].lower();possible=[w for w in words if ans in [w['term'].lower()]+[t.lower()for t in w['aliases']]]
 if len(possible)==1:q['conceptId']='ch14-concept-'+slug(possible[0]['term'])
 q['options']=balanced(q['answer'],[o for o in q['options']if o!=q['answer']],'source-mc')
# Additional mechanism items use clearly stated cases. They are finite authored material.
applications=[
(1,'secondary sex characteristic','An ovary grows and becomes more active at puberty. Why is it still a primary sex characteristic?','It is a reproductive organ, regardless of when its activity increases',['Any structure that changes at puberty must be secondary','Primary characteristics are defined by the absence of hormones','Its cells become hormones at puberty'],'Classify the structure, not only the timing of change.'),
(2,'epididymis','A sample shows sperm formation inside testicular tubules, but a nearby coiled duct is damaged. Which function is most directly associated with that duct?','Sperm maturation and storage',['Production of testosterone by interstitial cells','Fructose secretion by seminal vesicles','FSH synthesis by the anterior pituitary'],'The epididymis is a coiled duct beside the testis where sperm mature.'),
(2,'vas deferens','A transport duct is blocked while interstitial cells remain functional. Which finding could still occur?','Testosterone release into blood',['Sperm travelling through the complete blocked segment','Sperm formation in the urinary bladder','Conversion of gland fluid into sperm'],'Transport and hormone release are different functions.'),
(3,'acrosome','A sperm has a functioning flagellum but lacks a functional acrosome. Which task is directly affected?','Interacting with and penetrating the egg’s surrounding layers',['Propelling the sperm using its tail','Producing fructose in a seminal vesicle','Keeping testosterone out of blood'],'The acrosome contributes enzymes used in interaction with the egg’s coverings.'),
(3,'Sertoli cell','A chemical selectively harms Sertoli cells while interstitial cells remain functional. What should be investigated first?','Support for developing sperm',['FSH production in the pituitary','Testosterone production by Sertoli cells','Sperm storage in the urinary bladder'],'Sertoli cells support developing sperm inside the tubules.'),
(4,'luteinizing hormone (LH)','Which change directly follows stimulation of testicular interstitial cells by LH?','Increased testosterone production',['Release of an oocyte','Formation of a corpus luteum','FSH production inside a testis'],'LH stimulates interstitial cells; testosterone is their hormone product.'),
(4,'negative feedback','Outside androgens provide a strong negative-feedback signal while pituitary function is otherwise normal. Which effect could reduce sperm production?','Reduced FSH/LH support for testicular activity',['Conversion of Sertoli cells into pituitary cells','Increased gonadotropin release in response to inhibitory feedback','Direct transport of sperm into the bladder'],'An outside signal can suppress the normal control signals needed by the testes.'),
(5,'oviduct','An oocyte has been released normally but the passage through an oviduct is obstructed. Which function is affected directly?','Transport toward the uterus and the usual meeting of gametes',['Making FSH','Storing mature sperm before ejaculation','Making the follicle grow through a direct LH secretion'],'The oviduct provides a transport route and usual fertilization site.'),
(5,'endometrium','Which uterine change prepares a tissue to support implantation?','Development of a vascular endometrial lining',['Conversion of the cervix into an ovary','Movement of the uterus into an oviduct','Conversion of endometrium into sperm'],'The endometrium is the uterine lining, not the outer wall or a gamete.'),
(6,'corpus luteum','A structure forms from the remains of an ovarian follicle after ovulation. Which role should be assigned to it?','Releasing progesterone and some estrogen',['Producing FSH and LH','Serving as the usual site of fertilization','Transporting the released oocyte through the cervix'],'The post-ovulation follicle becomes the corpus luteum.'),
(6,'oogenesis','Why does oogenesis retain most cytoplasm in one cell rather than divide it equally among four cells?','The future egg needs cell resources for early development',['The retained cell must have twice the normal gamete chromosome number','Unequal cytoplasm prevents any meiotic division','All four cells must become identical sperm'],'Unequal cytoplasm supports the egg without changing its haploid chromosome set.'),
(7,'follicular phase','Menstrual flow occurs while follicles are beginning to develop. What does this show?','Ovarian and uterine events can occur at the same time',['The follicular phase starts only after all uterine changes stop','A single phase name must describe only one organ','Menstruation proves that no ovarian activity occurs'],'The ovarian cycle and uterine cycle describe different coordinated processes.'),
(7,'ovulation','A model cycle begins its next menstrual flow later than expected. Why should the previous ovulation day not be inferred from a fixed universal day number?','Actual cycle timing varies; the diagram is an illustrative model',['Every person has exactly the same 28-day cycle','Ovulation and menstrual flow always occur simultaneously','Only the calendar can establish hormone concentrations'],'Read the stated evidence rather than treating a model day as universal.'),
(8,'positive feedback','Estrogen remains sufficiently high before ovulation. Which response distinguishes the surge mechanism from ordinary inhibitory feedback?','An increase in LH release',['An obligatory immediate disappearance of all LH','A complete interruption of pituitary signalling','A direct blockage of the uterine tubes'],'Sustained high estrogen can switch to positive feedback leading to the LH surge.'),
(8,'progesterone','A graph shows a broad hormone rise after ovulation, associated with an active corpus luteum. Which hormone fits best?','Progesterone',['GnRH released from the corpus luteum','FSH released by the ovary','LH released from the endometrium'],'Progesterone is prominent in the luteal phase.'),
(9,'menopause','Ovarian follicles respond less strongly while pituitary feedback detection remains functional. Why can gonadotropin levels rise?','Less ovarian hormone feedback allows greater pituitary stimulation',['The ovaries become the source of FSH','LH is made from the disappearing follicles','Reduced ovarian response must permanently stop all hypothalamic activity'],'Weaker ovarian negative feedback permits increased upstream stimulation.'),
(9,'negative feedback','In a combined hormonal-contraceptive model, FSH/LH support and the mid-cycle surge are suppressed. What is the intended ovarian consequence?','Reduced likelihood of follicle maturation and ovulation',['More reliable release of several mature oocytes','Immediate destruction of every existing oocyte','A physical cut through both oviducts'],'This model acts through hormone signalling, not a surgical blockage.'),
(10,'sexually transmitted infection (STI)','A person has no visible symptoms. Which conclusion about an STI is justified?','Absence of symptoms alone cannot rule out an infection',['No infection can be present without pain','Symptoms must always appear before transmission is possible','Asymptomatic infection cannot affect reproductive tissue'],'Some STIs can be asymptomatic. Symptoms alone cannot establish infection status.'),
(10,'pelvic inflammatory disease (PID)','After an untreated infection, scar tissue obstructs an oviduct. Why can fertility be reduced even if follicles still develop?','The route needed for gametes to meet is disrupted',['The scar automatically changes every chromosome number','Follicle development occurs only inside the oviduct','The oviduct is the only source of estrogen'],'Tissue damage and transport obstruction are distinct from follicle growth.'),
(10,'sexually transmitted infection (STI)','Which statement best describes a condom’s role in STI prevention?','It can reduce transmission risk but does not eliminate every risk',['It guarantees protection against every STI in every use','It cures an infection already present','It prevents infection by permanently suppressing FSH'],'Barrier use reduces exposure, but protection is not an absolute guarantee.')]
authored=[]
for i,(n,t,p,ans,wrong,ex)in enumerate(applications,1):
 q=dict(id=f'ch14-application-{i:02d}',chapter=14,lesson=n,conceptId=cid(t),family='application',kind='mc',difficulty='application',prompt=p,answer=ans,options=balanced(ans,wrong,'applications'),cue=lookup(t)['meaning'],explanation=ex,reviewRoute=f'lesson-{n:02d}')
 q['flashVariant']=dict(id=q['id']+'-flash',family='scenario-explanation',prompt=p+' Explain your reasoning without answer choices.',model=ans+'. '+ex,selfAssessed=True);authored.append(q)
typed=[]
for i,(n,t,p)in enumerate(TYPED,1):
 w=lookup(t);typed.append(dict(id=f'ch14-typed-{i:02d}',chapter=14,lesson=n,conceptId=cid(t),family='scenario-retrieval',kind='blank',difficulty='application',prompt=p,answer=w['term'],aliases=w['aliases'],cue=w['meaning'],explanation=w['meaning']+' '+w['importantDistinction'],reviewRoute=f'lesson-{n:02d}'))
seq=[]
for i,(n,title,t,steps)in enumerate(SEQUENCES,1):seq.append(dict(id=f'ch14-sequence-{i:02d}',lesson=n,title=title,conceptId=cid(t),steps=steps))
multis=[]
ms=[(2,'semen','Select every correct statement about sperm and semen.',[('a','Sperm are made in seminiferous tubules.',True),('b','Semen contains accessory-gland secretions.',True),('c','All semen is produced by interstitial cells.',False),('d','Sperm must pass through the urinary bladder.',False)],'Distinguish production, transport and secretion.'),
(4,'negative feedback','Select every correct connection in the male hormonal-control model.',[('a','GnRH stimulates the anterior pituitary.',True),('b','LH stimulates interstitial cells.',True),('c','FSH acts on Sertoli cells.',True),('d','Testosterone is produced by the anterior pituitary.',False)],'Trace each signal to its target, then identify what the target does.'),
(6,'oogenesis','Select every correct statement about oocyte development.',[('a','A follicle includes supporting cells around an oocyte.',True),('b','A released secondary oocyte has completed meiosis II before any fertilization.',False),('c','Unequal cytoplasm division concentrates resources in the future egg.',True),('d','An ovarian follicle is a hormone molecule.',False)],'An oocyte is a cell; a follicle includes supporting tissue. Meiosis II normally completes with fertilization.'),
(8,'progesterone','Select every correct relationship in an illustrative cycle without pregnancy.',[('a','The LH surge occurs around ovulation.',True),('b','An active corpus luteum releases progesterone.',True),('c','Falling ovarian hormones help trigger endometrial shedding.',True),('d','Menstruation cannot overlap any ovarian follicle development.',False)],'Connect ovarian events with hormone changes and uterine effects.'),
(10,'sexually transmitted infection (STI)','Select every conclusion supported by this chapter’s STI explanation.',[('a','Some infections may be present without obvious symptoms.',True),('b','Scarring in an oviduct can interfere with reproduction.',True),('c','An online symptom list can establish a diagnosis.',False),('d','Every STI is a bacterial infection.',False)],'Consider symptom limits, different pathogens and the effect of tissue damage.')]
for i,(n,t,p,opts,ex)in enumerate(ms,1):multis.append(dict(id=f'ch14-multiple-select-{i}',lesson=n,conceptId=cid(t),family='discrimination',kind='multi-select',difficulty='application',prompt=p,options=[dict(id=a,text=b)for a,b,c in opts],answers=[a for a,b,c in opts if c],cue=lookup(t)['meaning'],explanation=ex,reviewRoute=f'lesson-{n:02d}'))
labels=json.loads((A/'label-diagrams.json').read_text())
notes_text={
'ch14-label-male':'Follow the ducts; glands add secretions without becoming the sperm-production site.',
'ch14-label-sperm':'Connect each region with movement, energy supply or interaction with the egg.',
'ch14-label-follicle':'Distinguish a developing oocyte from its supporting follicle and the post-ovulation corpus luteum.',
'ch14-label-female':'Identify organs and transport passages before tracing the oocyte route.',
'ch14-label-feedback':'Follow each hormone to its target; dashed inhibitory lines show negative feedback.',
'ch14-label-cycle':'Read the timing of each schematic curve relative to ovulation; vertical height is not a measured hormone concentration.'}
for d in labels:d['reviewNote']=notes_text.get(d['id'],'Match the letter with the structure or event shown.')
diagrampractice=[]
for d in labels:
 for letter,ans in d['answers'].items():
  try:con=cid(ans)
  except KeyError:con='ch14-diagram-concept-'+slug(ans)
  options=list(d['options']);others=[x for x in options if x!=ans][:3]
  if not others:continue
  diagrampractice.append(dict(id=d['id']+'-practice-'+letter,lesson=d['lesson'],conceptId=con,diagramId=d['id'],letter=letter,prompt=f'In this diagram, what does letter {letter} identify?',options=balanced(ans,others,'diagram'),cue='Follow the letter’s leader line to its endpoint, or match the lettered curve.',explanation=f'Letter {letter} identifies {ans}. '+d['reviewNote'],reviewRoute=f'lesson-{d["lesson"]:02d}'))
videos=[dict(id=id,lesson=n,title=t,purpose=p,fallback=f)for id,n,t,p,f in VIDEOS]
notes=[dict(id=x['id'],title=x['title']+': '+LESSONS[x['lesson']-1]['title'])for x in sources]+[dict(id='ch14-optional-extension',title='Endocrine signals and environmental chemicals')]
C=dict(chapter=14,courseTitle='The Reproductive System',pdfPages=30,pdf=dict(firstPrintedPage=476,lastPrintedPage=505,filename='./assets/textbook/chapter-14.pdf'),bankVersion='ch14-authored-v1',contentVersion='2026-09-17-source-handoff-v1',lessons=[dict(title=l['title'])for l in LESSONS]+[dict(title=final['title'])],checks=checks,words=words,practiceQuestions=imports,sequences=seq,labelDiagrams=labels,notes=notes,videos=videos,modeNames={'flash':'Flash cards','blanks':'Fill in the blanks','mc':'Multiple choice','mixed':'Mixed practice'},practiceConcepts=concepts,authoredPractice=authored,typedPractice=typed,multiSelectPractice=multis,guidedActivities=guided,transferChecks=[transfer],transferLegacyChoices=[],diagramPractice=diagrampractice)

# Build static teaching HTML: the browser does not author or replace these lessons.
figs={f['id']:f for f in json.loads((A/'diagram-review.json').read_text())}
def figure(id):
 f=figs[id];return f'<figure class="science-figure" data-figure-id="{id}"><div class="figure-toolbar"><strong>{e(f["title"])}</strong><button type="button" class="text-link" data-enlarge-figure="{id}">View larger</button></div><img src="{e(f["src"])}" alt="{e(f["alt"])}" loading="lazy" decoding="async"><figcaption>{e(f["caption"])}</figcaption></figure>'
def stimuli(items):return ''.join(f'<figure class="science-figure"><img src="{e(x["src"])}" alt="{e(x.get("alt","Question diagram or data"))}" loading="lazy"><figcaption>Use the diagram or data with the question.</figcaption></figure>'for x in items)
def guide():return '''<details class="page-guide"><summary><strong>How to complete this lesson</strong> Learn → worked example → practise → lesson check</summary><div class="guide-body"><ol><li>Read the explanation and its diagrams. Open a bold term when you need a definition.</li><li>Follow the worked example, then try both supported questions. Select <strong>Check answer</strong> for feedback.</li><li>Open the required check and select <strong>Start</strong>. Correct both selections to unlock writing.</li><li>Write each explanation and select its <strong>Save written response</strong> button. Editing saved writing makes it a draft again.</li><li>Select <strong>Submit and finish</strong> to complete the check. Find your records in <strong>All My Work</strong>.</li></ol><p><strong>Expected work:</strong> one completed lesson check. Supported practice, videos and textbook questions are optional. Saved writing is not automatically graded.</p></div></details>'''
def vocabulary(n,anchors):
 ids=[]
 for t in anchors:
  w=lookup(t)
  if w['id']not in ids:ids.append(w['id'])
 aw=[next(w for w in words if w['id']==id)for id in ids]
 def defs(ws):return ''.join(f'<div><dt>{termbutton(w["term"])}</dt><dd>{e(w["meaning"])}</dd></div>'for w in ws)
 more=[w for w in words if w['lesson']==n and w['id']not in ids]
 return '<p class="terms-line lesson-term-strip"><strong>Key terms:</strong> '+ ' · '.join(termbutton(w['term'])for w in aw)+'</p>'+f'<details class="vocab-help lesson-vocabulary-help"><summary>Vocabulary help</summary><section class="lesson-words" aria-labelledby="lesson-{n:02d}-anchor-words"><p class="section-label">Key terms</p><h2 id="lesson-{n:02d}-anchor-words">Words for this lesson</h2><p>Use these definitions when you need help with a term.</p><dl>{defs(aw)}</dl></section>'+ (f'<details class="lesson-term-inventory"><summary>More vocabulary for this lesson</summary><div><section><h3>Lesson vocabulary</h3><dl>{defs(more)}</dl></section></div></details>'if more else '')+'</details>'
def header(n,l,review=False):
 pages=l['pages'];links=' · '.join(f'<a href="#textbook-library" data-open-pdf="{p}">Open p. {p}</a>'for p in dict.fromkeys(pages))
 return f'<header class="page-header"><p class="eyebrow">Learn · Chapter 14</p><h1 {attrs(f"ch14-l{n:02d}-title")}>{e(l["title"])}</h1><p class="lesson-question">{e(l["question"])}</p><div class="goal-strip"><div><p class="section-label">Learning goal</p><p {attrs(f"ch14-l{n:02d}-goal")}>{e(l["goal"])}</p></div><div><p class="section-label">Before you begin</p><p {attrs(f"ch14-l{n:02d}-prior")}>{e(l["prior"])}</p></div></div>'+(''if review else guide())+f'<div class="textbook-band"><div><strong>Optional embedded reading</strong><p>Chapter 14 · printed pp. {pages[0]}–{pages[-1]}</p></div><p>{links}</p></div>'+vocabulary(n,l['anchors'])+'</header>'
def worked(g):return f'<div class="worked-example" id="{g["id"]}" {attrs(g["id"])}><p class="section-label">Worked example</p><h3>{e(g["title"])}</h3><p>{e(g["scenario"])}</p><ol>'+''.join('<li>'+e(x)+'</li>'for x in g['steps'])+'</ol></div>'
def guided_html(g):
 out=f'<section class="content-section guided-practice" id="{g["id"]}" {attrs(g["id"])}><h2>Practise with support</h2><h3>{e(g["title"])}</h3><p>{e(g["instruction"])}</p>'
 for q in g['items']:out+=f'<div class="practice-question" data-guided-item="{q["id"]}"><label for="{q["id"]}">{e(q["prompt"])}</label><select id="{q["id"]}"><option value="">Choose an answer</option>'+''.join(f'<option value="{e(x)}">{e(x)}</option>'for x in q['options'])+'</select><div class="actions"><button type="button" data-guided-check>Check answer</button></div><p aria-live="polite" data-revision-feedback role="status"></p></div>'
 return out+'</section>'
def required(spec):
 s=f'<details class="activity-disclosure"><summary>Open required check · {e(spec["title"])}</summary><section class="activity" data-check-id="{spec["id"]}" data-required-check><h2>Explain what you have learned</h2><p class="required-note">This check counts toward chapter progress. Correct the {len(spec["mc"])} selections to unlock {len(spec["writing"])} written explanations. Saving writing records your response; it does not grade its accuracy.</p><div class="run-head"><div class="actions"><button data-start-check type="button">Start</button><button data-redo-check hidden type="button">Redo this check</button></div><span class="timer" data-check-timer>Not started</span></div><p aria-live="polite" class="run-status" data-check-status></p><fieldset data-check-body disabled><legend class="sr-only">Required chapter check</legend>'
 for i,q in enumerate(spec['mc'],1):
  id=q['id'];s+=f'<div class="check-question" data-check-question="{id}"><p class="eyebrow">Selection {i}</p><h3 id="{id}-prompt" {attrs(id+"-prompt")}>{e(q["prompt"])}</h3><fieldset aria-labelledby="{id}-prompt">'+''.join(f'<label class="choice-row"><input type="radio" name="{id}" data-check-choice="{id}" value="{e(x)}"><span>{e(x)}</span></label>'for x in q['options'])+f'</fieldset><button type="button" data-check-answer="{id}">Check answer</button><p class="inline-feedback" data-feedback aria-live="polite"></p></div>'
 s+='<p class="unlock-message" data-unlock-message>Answer the selections correctly to unlock the writing.</p><fieldset data-writing-gate disabled><legend class="sr-only">Written explanations</legend>'
 for i,q in enumerate(spec['writing'],1):
  id=q['id'];s+=f'<div class="writing-question" data-writing-question="{id}"><p class="eyebrow">Written explanation {i}</p><label for="{id}" {attrs(id+"-prompt")}>{e(q["prompt"])}</label><textarea id="{id}" data-check-writing="{id}" data-limit="3200" aria-describedby="{id}-status" rows="6"></textarea><p class="writing-status">Maximum 3200 characters. Explain the biology in your own words.</p><button type="button" data-save-writing="{id}">Save written response</button><p aria-live="polite" class="writing-status" data-writing-status id="{id}-status"></p><details data-locked="true"><summary>Compare after saving your own response</summary><p>{e(q["model"])}</p><div class="answer-criteria"><strong>Check your explanation for:</strong><ul>'+''.join('<li>'+e(x)+'</li>'for x in q['criteria'])+'</ul></div></details></div>'
 return s+'</fieldset><div class="actions"><button type="button" data-finish-check>Submit and finish</button></div></fieldset></section></details>'
def optional(q):
 id=q['id'];return f'<details class="activity-disclosure optional-disclosure"><summary>{e(q["title"])}</summary><div class="activity"><p>This is optional written practice. It does not change required progress.</p>'+stimuli(q.get('stimuli',[]))+f'<div class="optional-writing"><label for="{id}">{e(q["prompt"])}</label><textarea id="{id}" data-note-input="{id}" aria-describedby="{id}-status" rows="5"></textarea><p class="writing-status" data-note-status="{id}" id="{id}-status">Optional response. Select Save response to collect it. Maximum 5000 characters.</p><button type="button" data-save-note="{id}">Save response</button></div></div></details>'
def video(v):
 id=v['id'];return f'<aside class="video-companion"><div class="video-copy"><p class="eyebrow">Optional video support</p><h3>{e(v["title"])}</h3><p><strong>As you watch:</strong> {e(v["purpose"])}</p><p class="resource-note">Optional video. Internet access is required. The explanation below covers the idea without the video.</p><a href="https://www.youtube.com/watch?v={id}" target="_blank" rel="noopener noreferrer">Open on YouTube</a></div><div class="video-visual"><div class="video-stage" data-video-stage="{id}"><button type="button" data-play-video="{id}">Load video</button></div><div class="concept-summary"><h4>Read the explanation</h4><p>{e(v["fallback"])}</p></div></div></aside>'
def footer(n):
 prev='overview'if n==1 else f'lesson-{n-1:02d}';pt='Overview'if n==1 else C['lessons'][n-2]['title'];nxt=f'lesson-{n+1:02d}'if n<11 else 'overview';nt=C['lessons'][n]['title']if n<11 else 'Overview'
 return f'<nav class="lesson-footer" aria-label="Previous and next topics"><a href="#{prev}">← {e(pt)}</a><a class="next" href="#{nxt}">Next: {e(nt)} →</a></nav>'+f'<div class="content-section textbook-practice-lesson-link"><a data-textbook-topic="{"chapter-review"if n==11 else f"lesson-{n:02d}"}" href="#textbook-practice">Optional textbook practice for {e(C["lessons"][n-1]["title"])}</a></div>'
def lesson(n,l):
 s=f'<section class="course-page" id="lesson-{n:02d}" hidden><div class="p2-topic">'+header(n,l);used=set()
 for j,(title,pars)in enumerate(l['sections'],1):
  key=f'ch14-l{n:02d}-teaching-{j:02d}';s+=f'<div class="content-section" id="{key}" {attrs(key)}><h2>{e(title)}</h2>'
  for k,p in enumerate(pars,1):s+=para(linked(p,used),key+f'-p{k}')
  if j-1 in l.get('figures',{}):s+=figure(l['figures'][j-1])
  s+='</div>'
 s+=worked(guided[n-1]['worked'])+guided_html(guided[n-1]['guided'])
 q,a=l['self'];s+=f'<div class="stop-check"><p class="section-label">Stop and think</p><h2>Try this before opening the explanation</h2><p>{e(q)}</p><details><summary>Show the explanation</summary><p>{e(a)}</p></details></div>'
 for v in videos:
  if v['lesson']==n:s+=video(v)
 s+=required(checks[n-1])
 for q in sources:
  if q['lesson']==n:s+=optional(q)
 return s+footer(n)+'</div></section>'
def transfer_html(t):
 s=f'<section class="content-section" data-transfer="{t["id"]}" {attrs(t["id"])}><h2>{e(t["title"])}</h2><p>{e(t["instruction"])}</p>'
 for q in t['mc']:
  id=q['id'];s+=f'<fieldset class="options"><legend>{e(q["prompt"])}</legend>'+''.join(f'<label class="option-row"><input type="radio" name="{id}" data-transfer-choice="{id}" value="{e(x)}"><span>{e(x)}</span></label>'for x in q['options'])+'</fieldset>'
 w=t['writing'];return s+f'<label for="{w["id"]}">{e(w["prompt"])}</label><textarea id="{w["id"]}" data-transfer-writing rows="6"></textarea><p>Maximum 3200 characters. Writing is saved for review, not automatically graded.</p><label class="choice-row"><input type="checkbox" data-transfer-help><span>I used help before submitting.</span></label><div class="actions"><button type="button" data-transfer-submit>Submit whole set</button></div><div data-transfer-feedback hidden role="status" aria-live="polite"></div></section>'
def table(headers,rows):return '<div class="comparison-table"><table><thead><tr>'+''.join('<th scope="col">'+e(h)+'</th>'for h in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+e(x)+'</td>'for x in row)+'</tr>'for row in rows)+'</tbody></table></div>'
def review():
 l=dict(title=final['title'],question='Can you connect reproductive structures, cells and hormone feedback in a new case?',goal='Explain normal reproductive pathways and use them to predict the effect of a changed structure or signal.',prior='Return to the normal pathway before analysing a failure. A correct label is a starting point, not a complete explanation.',pages=[503,505],anchors=['gamete','negative feedback','ovulation','corpus luteum'])
 s='<section class="course-page" id="lesson-11" hidden><div class="p2-topic">'+header(11,l,True)
 s+='''<div class="content-section review-instructions"><h2>How to complete this section</h2><ol><li>Use the comparisons to find the pathways you need to revisit.</li><li>Follow the synthesis example. Then try the optional independent set before revealing feedback.</li><li>Open the required final check and select <strong>Start</strong>. Correct six selections, save both written explanations, then select <strong>Submit and finish</strong>.</li><li>Find first attempts and later work in <strong>All My Work</strong>.</li></ol><p><strong>Expected work:</strong> one completed final-check run. Textbook review and the independent set are optional.</p></div>'''
 s+='<div class="content-section" id="ch14-l11-teaching-01" '+attrs('ch14-l11-teaching-01')+'><h2>Separate production, transport and control</h2><p>Reproduction depends on several connected systems. A gamete must form, mature and reach the appropriate location. Hormones coordinate tissues, but a hormone cannot carry a cell through a blocked duct. Begin a case by identifying which function has changed.</p>'+table(['Function','Male example','Female example'],[['Gamete development','Seminiferous tubules, with Sertoli-cell support','Oocyte development within ovarian follicles'],['Transport','Epididymis → vas deferens → ejaculatory duct → urethra','Ovary releases oocyte; fimbriae help guide it into the oviduct'],['Hormone-producing tissue','Interstitial cells release testosterone','Follicle cells release estrogen; corpus luteum releases progesterone and estrogen'],['Central control','GnRH → anterior pituitary → FSH and LH','GnRH → anterior pituitary → FSH and LH'],['Useful caution','Sperm production is not accessory-gland secretion','Ovulation is not menstruation or implantation']])+'</div>'
 s+='<div class="content-section" id="ch14-l11-teaching-02" '+attrs('ch14-l11-teaching-02')+'><h2>Trace feedback rather than memorising peaks</h2><p>For each arrow, say what is released, where it acts and what the target does. In the male model, LH stimulates interstitial cells; testosterone then participates in negative feedback. FSH acts on Sertoli cells that support sperm development.</p><p>In the female model, follicle growth and rising estrogen are followed by a positive-feedback switch when estrogen stays sufficiently high. The LH surge helps trigger ovulation. The corpus luteum then supports a progesterone-rich luteal phase. Without pregnancy support, its activity declines, ovarian hormones fall and the uterine lining is shed.</p>'+table(['Change','Normal-pathway reasoning'],[['LH target cells fail to respond','Increasing LH cannot guarantee the usual target response.'],['Corpus luteum becomes inactive','Progesterone support falls; connect this with the endometrium.'],['Oviduct scarring obstructs transport','Cycles can remain normal while fertilisation becomes less likely.'],['No visible symptoms of infection','Symptoms alone cannot rule out an STI.'],['A model says day 14','Use the stated illustrative cycle; do not turn it into a universal calendar rule.']])+'</div>'
 g=dict(id='ch14-review-worked',title='Two different routes to reduced fertility',scenario='Case A has normal hormone cycles but blocked oviducts. Case B has open oviducts but no LH surge in a model cycle.',steps=['In Case A, locate the change in the transport pathway. The obstruction can prevent gametes from meeting while ovarian activity continues.','In Case B, locate the missing control event. A missing LH surge can prevent the usual ovulatory event even though the duct is open.','Do not give both cases the same explanation merely because the eventual outcome is similar. Name the changed step and trace its consequence.','The cases illustrate mechanisms; they do not provide enough information for a personal diagnosis or a treatment recommendation.'])
 return s+worked(g)+transfer_html(transfer)+required(final)+footer(11)+'</div></section>'

shell=fragment((T/'shell.html').read_text());shell.html['lang']='en-CA';shell.title.string='Biology 30 - Chapter 14 | The Reproductive System'
md=shell.find('meta',attrs={'name':'description'})
if md:md['content']='Biology 30 Chapter 14: reproductive systems, gametes and hormonal control. Standalone lessons and formative practice.'
for x in shell.select('.sidebar-title'):x.string='Biology 30 - Chapter 14'
for x in shell.select('.sidebar-code'):x.string='BIO 30'
# Update only navigation chapter-specific content.
for group in shell.select('.nav-group'):
 summary=group.find('summary').get_text(' ',strip=True);links=group.select_one('.nav-links')
 if summary=='Learn':links.clear();links.append(fragment(''.join(f'<a class="nav-link" href="#lesson-{i:02d}">{i}. {e(l["title"])}</a>'for i,l in enumerate(C['lessons'],1))))
 if summary=='Optional extension':links.clear();links.append(fragment('<a class="nav-link" href="#extension">Endocrine signals and environmental chemicals</a>'))
for a in shell.find_all('a',href=re.compile(r'chapter-12')):a['href']=a['href'].replace('chapter-12','chapter-14')
frame=shell.select_one('.course-frame')
# Overview structure remains the reference recipe; replace its biologic content.
ov=fragment((T/'overview.html').read_text());head=ov.select_one('.page-header')or ov.select_one('.overview-hero');head.clear();head.append(fragment('''<p class="eyebrow">Start · Biology 30</p><h1>The Reproductive System</h1><p>Chapter 14 connects reproductive structures, gamete development and hormone feedback. Learn the normal pathways, then explain what changes when a structure or signal is affected.</p>'''))
# Replace content regions while retaining header/guide recipe.
for node in list(ov.select('.content-section')):node.decompose()
body=ov.select_one('.p2-topic')or ov.select_one('section')
body.append(fragment('''<div class="content-section"><h2>What you will learn</h2><ul class="chapter-outcomes"><li>Identify reproductive structures and connect each with its function.</li><li>Distinguish gametes from the cells and tissues that support their development.</li><li>Trace FSH, LH and gonadal hormones through male and female feedback pathways.</li><li>Interpret coordinated ovarian, uterine and hormone changes.</li><li>Explain how reproductive tissue damage, including STI-related damage, can affect function.</li></ul><h2>Start with the lesson</h2><p>The explanations, figures and worked examples teach the content here. The embedded textbook and videos provide optional support. Begin with the first lesson below.</p><p>Each teaching lesson has a required check: two selections and two written explanations. The final check has six selections and two written explanations. Save each written response, then submit and finish the run. Writing is not automatically graded.</p><p>Optional guided work, practice sets, labeling, Frayer work and textbook questions do not increase the required-progress total. They help you revisit a concept in different ways. Your saved responses and attempts appear in All My Work.</p><p><strong>Clinical examples explain biology, not personal diagnosis or treatment.</strong> Use a qualified health professional for individual health questions.</p><p><a class="button" href="#lesson-01">Begin lesson 1</a></p></div>'''))
frame.append(ov)
for n,l in enumerate(LESSONS,1):frame.append(fragment(lesson(n,l)))
frame.append(fragment(review()))
ex=fragment((T/'extension.html').read_text());exbody=ex.select_one('.p2-topic')or ex.select_one('section');exbody.clear()
exbody.append(fragment('''<header class="page-header"><p class="eyebrow">Optional extension</p><h1>Endocrine signals and environmental chemicals</h1><p>How can a chemical change a tissue’s response without changing the amount of a hormone?</p></header><div class="content-section"><h2>A receptor model</h2><p>A hormone acts by interacting with an appropriate receptor. A chemical that binds to the same receptor might imitate a signal or interfere with it. Binding alone does not tell you which effect occurs.</p><p>Consider a hypothetical experiment using two otherwise comparable tissue samples. Both receive the same estrogen concentration. Sample A develops the expected response. Sample B receives an additional chemical and shows a weaker response. A separate binding test finds that the chemical can occupy estrogen receptors without activating them.</p><p>These observations support an interference model: the chemical may reduce the opportunity for estrogen to activate its receptor. They do not establish the chemical’s effects in an entire person, a safe exposure level, or the outcome of every environmental exposure.</p><h2>Separate the model from the conclusion</h2><p>Compare samples under the same conditions and ask whether the observations support the proposed step. An association between exposure and a changed response is not enough by itself to identify every cause.</p></div>'''))
exq=dict(id='ch14-optional-extension',title='Save an optional explanation',prompt='Explain the proposed receptor-interference mechanism. Identify one condition that should be held constant and one conclusion that cannot be established from these tissue samples alone.')
exbody.append(fragment(optional(exq)))
exbody.append(fragment('''<div class="content-section"><details data-extension-model data-locked="true"><summary>Compare after saving your explanation</summary><p>The added chemical occupies receptors without activating them, potentially reducing estrogen signalling. Estrogen concentration, tissue type and exposure conditions should be comparable. A tissue result does not establish a safe dose or predict every effect in a whole organism.</p><ul><li>Connects receptor occupancy with a weaker response.</li><li>Names a controlled condition.</li><li>Limits the conclusion to what the model supports.</li></ul></details><p>This extension is optional and does not change chapter completion.</p></div>'''));frame.append(ex)
# Preserve other page recipes and substitute only chapter data / instructional copy.
for name in ['practice','fill-in-the-blanks','labeling-practice','multiple-choice','mixed-practice','textbook-practice','process-collection','core-vocabulary','textbook-library','video-library']:
 s=fragment((T/(name+'.html')).read_text())
 # Teacher-independent wording, not a new workflow.
 for text in s.find_all(string=True):
  if text.parent.name in ['script','style']:continue
  st=str(text).replace('Chapter 12','Chapter 14').replace('chapter 12','chapter 14').replace('Sensory Reception','The Reproductive System')
  st=st.replace('common confusion','important distinction')
  st=st.replace('For a drawing, graph or table, work on paper and follow your teacher’s submission instructions.','For a drawing, graph or table, work on paper and type the result and explanation here. Paper work is not stored by this course.')
  st=st.replace('complete the questions your teacher assigns, or choose questions you need to practise.','choose the questions you need to practise.')
  if st!=str(text):text.replace_with(st)
 for sel in s.select('[data-topic],[data-vocab-topic]'):
  sel.clear();sel.append(fragment('<option value="all">All Chapter 14</option>'+''.join(f'<option value="{i}">{i}. {e(l["title"])}</option>'for i,l in enumerate(LESSONS,1))))
 if name=='core-vocabulary':
  idx=s.select_one('.vocabulary-index');idx.clear()
  for n,l in enumerate(LESSONS,1):
   ww=[w for w in words if w['lesson']==n]
   if ww:idx.append(fragment('<section class="word-category"><h2>'+e(l['title'])+'</h2>'+''.join(f'<button class="text-link" type="button" data-biology-select-word="{w["id"]}" data-word-card="{w["id"]}" aria-pressed="false"><span>{e(w["term"])}</span></button>'for w in ww)+'</section>'))
  s.select_one('[data-vocab-count]').string=f'{len(words)} terms'
  for sel in s.select('[data-frayer-select]'):sel.clear();sel.append(fragment(''.join(f'<option value="{w["id"]}">{e(w["term"])}</option>'for w in words)))
 if name=='labeling-practice':
  sel=s.select_one('[data-diagram-select]');sel.clear()
  for d in labels:sel.append(fragment(f'<option value="{d["id"]}">{e(d["title"])}</option>'))
 if name=='textbook-library':
  sec=s.select_one('.content-section');sec.find('h2').string='Chapter 14 · The Continuance of Human Life'
  for p in sec.find_all('p'):
   if 'PDF pages' in p.get_text():p.string='30 PDF pages · printed pp. 476–505'
  for a in sec.select('[data-library-fullscreen],[data-library-download]'):a['href']='./assets/textbook/chapter-14.pdf'
  sec.select_one('[data-library-textbook]')['src']='./assets/textbook/chapter-14.pdf#page=1'
 if name=='video-library':
  sel=s.select_one('[data-video-select]');sel.clear()
  for n in sorted(set(v['lesson']for v in videos)):
   sel.append(fragment(f'<optgroup label="{e(LESSONS[n-1]["title"])}">'+''.join(f'<option value="{v["id"]}">{e(v["title"])}</option>'for v in videos if v['lesson']==n)+'</optgroup>'))
 frame.append(s)
# Strip stale authoring attributes in reused shell/routes without altering component styles.
for el in shell.find_all(True):
 for k,v in list(el.attrs.items()):
  if isinstance(v,str)and k in ['data-canvas-edit-key','data-canvas-helper-edit-key']:el[k]=v.replace('ch12-','ch14-')
# Metadata attributes are scoped to this chapter, never a stale course namespace.
for el in shell.find_all(True):
 for k,v in list(el.attrs.items()):
  if isinstance(v,str)and 'biology30-chapter-12' in v:el[k]=v.replace('biology30-chapter-12','biology30-chapter-14')
M=json.loads((A/'textbook-question-manifest.json').read_text())
# The runtime needs only the learner manifest, not clinical dispositions or crop-review notes.
Mlearn={k:M[k]for k in ['chapter','questions','pages','topics']}
for q in Mlearn['questions']:
 for k in ['reviewStatus','clinicalNote']:q.pop(k,None)
# Preserve valid script types. PDF is embedded once in both workspace and portable,
# so the existing modal can open in normal and portable use with the same mapping.
import base64
shell.select_one('#textbook-data').string=base64.b64encode((W/'assets/textbook/chapter-14.pdf').read_bytes()).decode()
shell.select_one('#course-data').string=json.dumps(C,ensure_ascii=False).replace('</',r'<\/')
shell.select_one('#textbook-practice-data').string=json.dumps(Mlearn,ensure_ascii=False).replace('</',r'<\/')
# Fix headline/status placeholders before JavaScript mounts.
for s in shell.select('[data-progress-count]'):s.string='0 of 11 checks'
for s in shell.select('[data-progress-fraction]'):s.string='0 / 11'
# No source/admin instruction should survive from the fixture.
output=str(shell)
(W/'index.html').write_text(output,encoding='utf8')
dump(A/'course-config.json',C);dump(A/'vocabulary.json',words);dump(A/'compiled-textbook-data.json',Mlearn)
dump(A/'option-position-audit.json',{'required':[{'id':q['id'],'position':q['options'].index(q['answer'])+1,'options':len(q['options'])}for c in checks for q in c['mc']], 'guided':[{'id':q['id'],'position':q['options'].index(q['answer'])+1,'options':len(q['options'])}for g in guided for q in g['guided']['items']], 'transfer':[{'id':q['id'],'position':q['options'].index(q['answer'])+1,'options':len(q['options'])}for q in transfer['mc']]})
print(json.dumps({'lessons':len(checks),'words':len(words),'guided':sum(len(x['guided']['items'])for x in guided),'requiredMC':sum(len(x['mc'])for x in checks),'requiredWriting':sum(len(x['writing'])for x in checks),'sourceMC':len(imports),'authoredMC':len(authored),'typed':len(typed),'sequence':len(seq),'multipleSelect':len(multis),'diagrams':len(labels),'diagramPractice':len(diagrampractice),'textbook':len(M['questions']),'HTMLbytes':len(output)},indent=2))
