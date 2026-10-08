"""Small, deterministic authoring vocabulary. All biology copy is authored input."""
from pathlib import Path
import json,re

def paragraphs(text):
 return [p.strip().replace('\n',' ') for p in text.strip().split('\n\n') if p.strip()]
def sec(title,text): return (title,paragraphs(text))
def term(name,meaning,example,distinction,misconception,aliases=()):
 return {'term':name,'meaning':meaning,'example':example,'importantDistinction':distinction,'misconception':misconception,'aliases':list(aliases)}
def q(prompt,answer,wrong,explanation,hint='Trace the normal mechanism before choosing an answer.'):
 assert len(set([answer,*wrong]))==1+len(wrong)
 return {'prompt':prompt,'answer':answer,'wrong':list(wrong),'explanation':explanation,'cue':hint}
def g(prompt,answer,wrong,explanation,hint):return q(prompt,answer,wrong,explanation,hint)
def w(prompt,model,criteria=()):
 return {'prompt':prompt,'model':model,'criteria':list(criteria)or ['Identifies the relevant structures or quantities.','Explains the causal relationship or calculation, not just the final result.','Uses the stated evidence and avoids a stronger conclusion than it supports.']}
def worked(title,scenario,*steps):return {'title':title,'scenario':scenario,'steps':list(steps)}
def lesson(title,question,goal,prior,pages,slides,terms,sections,example,guided,check,writing,app,selfcheck,seq=None):
 assert len(terms)>=4 and len(guided)==2 and len(check)==2 and len(writing)==2
 return {'title':title,'question':question,'goal':goal,'prior':prior,'pages':pages,'slides':slides,'terms':terms,'sections':sections,'worked':example,'guided':guided,'check':check,'writing':writing,'applications':app if isinstance(app,list)else[app],'self':selfcheck,'sequence':seq}
def save(ch,title,first,last,lessons,final,transfer,extension,overview,review,folder=None):
 d={'chapter':ch,'title':title,'first':first,'last':last,'lessons':lessons,'final':final,'transfer':transfer,'extension':extension,'overview':overview,'review':review}
 p=Path(folder or Path(__file__).parent/'content');p.mkdir(exist_ok=True)
 (p/f'chapter-{ch}.json').write_text(json.dumps(d,ensure_ascii=False,indent=2))
 print(ch,len(lessons),'teaching lessons',sum(len(' '.join(pars).split())for l in lessons for _,pars in l['sections']),'teaching words')
