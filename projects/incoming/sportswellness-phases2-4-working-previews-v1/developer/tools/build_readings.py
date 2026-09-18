"""Selectable Letter PDFs derived from the same canonical learner HTML, not a second rewrite."""
from pathlib import Path
from bs4 import BeautifulSoup
import json,copy,re,html,sys
from weasyprint import HTML
B=Path(__file__).resolve().parent;OUT=Path(__file__).resolve().parents[2]
e=lambda x:html.escape(str(x),quote=True)
CSS='''@page{size:Letter;margin:0.65in 0.7in 0.65in;@top-left{content:string(chapter);font:9pt sans-serif;color:#5b635d}@bottom-left{content:"SPORTS PSYCHOLOGY · NEXT STEP";font:8pt sans-serif;color:#5b635d}@bottom-right{content:counter(page);font:10pt sans-serif;color:#154212}}@page:first{@top-left{content:none}}html{font-family:Arial,sans-serif;color:#171b1b;font-size:11.5pt;line-height:1.42}body{margin:0}h1,h2,h3,h4{font-family:Arial,sans-serif;line-height:1.2;color:#154212;break-after:avoid}h1{font-size:29pt;margin:0 0 18pt;string-set:chapter content()}h2{font-size:21pt;margin:0 0 13pt;bookmark-level:1}h3{font-size:15pt;margin:17pt 0 8pt;bookmark-level:2}h4{font-size:12pt;margin:14pt 0 7pt;bookmark-level:3}p{margin:0 0 8pt;orphans:3;widows:3}ul,ol{padding-left:20pt}li{margin:0 0 5pt}a{color:#146c60;text-decoration:none}.cover{break-after:page;padding-top:0.7in}.cover .kicker{font-size:10pt;letter-spacing:1pt;color:#146c60}.cover .purpose{font-size:16pt;line-height:1.45}.cover .meta{border-top:3pt solid #154212;padding-top:15pt;margin-top:30pt}.contents{break-after:page}.contents li{list-style:none;padding:8pt 0;border-bottom:0.5pt solid #d9ded8}.contents a::after{content:leader('.') target-counter(attr(href),page)}.chapter-section{break-before:auto;margin-top:24pt;padding-top:15pt;border-top:1pt solid #d9ded8}.book-section{break-before:page}.goal{padding:12pt 15pt;background:#eef6f3;border-left:3pt solid #146c60;margin:14pt 0;break-inside:avoid}.worked-example{padding:13pt 16pt;background:#faf8f2;border:0.5pt solid #e5dccb;border-left:3pt solid #a15c00;margin:15pt 0;break-inside:avoid}.worked-example h3{margin-top:0}.example-label{font-size:9pt;font-weight:bold;color:#a15c00}.learning-figure{margin:14pt 0 18pt;break-inside:avoid}.learning-figure img{max-width:100%;width:100%;height:auto;max-height:415pt;object-fit:contain}.learning-figure figcaption{font-size:10.5pt;line-height:1.4;margin:8pt 0 0}.figure-description{font-size:11.5pt}.question-box{padding:13pt 15pt;margin:14pt 0;border:0.6pt solid #c8d6cc;break-inside:avoid}.question-box h3{font-size:12pt;margin:0 0 8pt}.question-box ul{margin:5pt 0}.question-box ol{list-style-type:upper-alpha}.application{border-left:3pt solid #146c60;padding:12pt 15pt;background:#f3f8f4;break-inside:avoid;margin:14pt 0}.small{font-size:10pt;color:#5b635d}.build-step{break-before:auto;margin-top:18pt}.field{margin:12pt 0;padding:10pt 12pt;border:0.5pt solid #d9ded8;break-inside:avoid}.field h4{margin:0 0 6pt}.rubric-dimension{break-inside:avoid;border-top:2pt solid #146c60;padding:10pt 0;margin:12pt 0}.rubric-dimension p{font-size:11pt}.feedback-item{break-inside:avoid;border-top:0.5pt solid #d9ded8;padding:8pt 0}.feedback-item h3{margin-top:0}.glossary-term{break-inside:avoid;margin:10pt 0}dt{font-weight:bold;color:#154212}dd{margin:3pt 0 0}.no-answer{font-size:10pt;color:#5b635d;margin:0 0 12pt}.source{font-size:10pt;overflow-wrap:anywhere}.column{display:block}.goal-list{break-inside:avoid}'''
def make(n):
 d=OUT/f'sportswellness-phase-{n}';p=json.loads((d/'review/authored-content.json').read_text());s=BeautifulSoup((d/'index.html').read_text(),'html.parser')
 body=f'<section class="cover"><p class="kicker">NEXT STEP · SPORTS PSYCHOLOGY</p><h1>Phase {n} — {e(p["name"])}</h1><p class="purpose">{e(p["purpose"])}</p><div class="meta"><p><strong>Reading and practice chapter</strong></p><p>Use this chapter beside the learning website or as a reading route through the same lessons. Save written responses in the website or the format directed by your teacher.</p><p>Worked examples are labelled. Try the learner questions before checking the answer and feedback section at the end.</p><p>Fictional sport, academic and artistic examples are welcome. No private health details, personal beliefs or claims of perfect confidence are needed.</p></div><p class="small">'+('Newly authored Phase 4 reading chapter.'if n==4 else 'Reconciled learner reading chapter.')+'</p></section>'
 titles=[('case','The phase case and learning goals')]+[(l['route'],f'{l["number"]:02} · {l["title"]}')for l in p['lessons']]+[('book-lab','10 · Decision practice'),('book-build','11 · '+p['assignment']),('book-review','12 · Written review'),('book-checkpoint','Final checkpoint'),('book-glossary','Glossary and sources'),('book-feedback','Answers and feedback')]
 body+='<section class="contents"><h2>Contents</h2><ol>'+''.join(f'<li><a href="#{id}">{e(t)}</a></li>'for id,t in titles)+'</ol></section>'
 case=s.select_one('#start-content .lesson-copy');case=''.join(str(x) for x in list(case.children)[list(case.children).index(next(h for h in case.find_all('h3',recursive=False) if h.get_text(strip=True)==p['case_title'])):]);body+='<section class="book-section" id="case"><h2>The phase case</h2>'+str(case)+'<h3>Your opening response</h3><p>'+e(p['opening'])+'</p><div class="goal-list"><h3>Learning goals</h3><ul>'+''.join('<li>'+e(l['goal'])+'</li>'for l in p['lessons'])+'</ul></div></section>'
 for l in p['lessons']:
  sec=s.select_one('#'+l['route']);body+=f'<section class="chapter-section" id="{l["route"]}"><h2>{l["number"]:02} · {e(l["title"])}</h2><p>{e(l["intro"])}</p><div class="goal"><p><strong>Learning goal:</strong> {e(l["goal"])}</p><p><strong>Before you begin:</strong> {e(l["before"])}</p></div>'
  for node in sec.select('.lesson-block'):
   cp=copy.deepcopy(node)
   for button in cp.select('.figure-open'):button.unwrap()
   for label in cp.select('.zoom-label'):label.decompose()
   for img in cp.select('img[src]'):img['src']='../'+img['src'].lstrip('./')
   body+=str(cp)
  body+='<h3>Try the concept checks</h3><p class="no-answer">Choose before checking. Explanations are in Answers and feedback.</p>'
  for j,q in enumerate(l['checks'],1):body+=f'<div class="question-box"><h3>{l["number"]:02}.{j} · {e(q["prompt"])}</h3><ol type="A">'+''.join('<li>'+e(c)+'</li>'for c in q['choices'])+'</ol></div>'
  body+='<div class="application"><h3>'+e(l['label'])+'</h3><p>'+e(l['application'])+'</p><p class="small">Write two to four sentences using case evidence, a choice and a reason. Save this response for Build.</p></div></section>'
 body+='<section class="book-section" id="book-lab"><h2>10 · Decision practice</h2><p>Complete all three cases with reasons, then the transfer below. These are the same decisions in the guided and untimed website pathways. The timed game is optional.</p>'
 for i,c in enumerate(p['labs'],1):body+=f'<div class="question-box"><h3>Case {i} · {e(c["title"])}</h3><p>{e(c["text"])}</p><ol type="A">'+''.join('<li>'+e(v)+'</li>'for v in c['choices'])+'</ol><p><strong>Explain:</strong> What evidence supports your response? What would you check next?</p></div>'
 body+='<div class="application"><h3>Transfer the idea</h3><p>'+e(p['lab_transfer'])+'</p></div></section>'
 body+='<section class="book-section" id="book-build"><h2>11 · '+e(p['assignment'])+'</h2><p>Use the same case throughout. Each field asks for a short structured response, not an essay. Earlier lesson answers can be reused and adapted. The website protects edited Build responses with a replacement confirmation.</p><p>The five steps contain twelve required evidence fields. Your teacher evaluates the reasoning and plan, not a self-reported feeling, game score or word count.</p></section>'
 for i,st in enumerate(p['steps'],1):
  body+=f'<section class="build-step"><h3>Step {i} · {e(st["title"])}</h3><p>{e(st["intro"])}</p>'
  for f in st['fields']:body+=f'<div class="field"><h4>{e(f["label"])}</h4><p>{e(f["help"])}</p></div>'
  body+='<p class="small">Worked field examples are collected in Answers and feedback. Use them to check the reasoning rather than copy without adapting.</p></section>'
 table=s.select_one('#playbook-rubric table');body+='<section class="book-section"><h2>Build review criteria</h2><p>The levels describe evidence, not an automatic numeric grade.</p>'
 levels=['Not yet shown','Developing','Clear','Thoughtful']
 for tr in table.select('tbody tr'):
  cells=tr.find_all(['th','td'],recursive=False);body+='<div class="rubric-dimension"><h3>'+e(cells[0].get_text(' ',strip=True))+'</h3>'+''.join(f'<p><strong>{levels[i]}:</strong> {e(c.get_text(" ",strip=True))}</p>'for i,c in enumerate(cells[1:]))+'</div>'
 body+='</section><section class="book-section" id="book-review"><h2>12 · Written review</h2><p>Write a first explanation before checking the answer section. Then explain a revision, or explain why the answer fits and add a useful example or limit. The website keeps the first-answer snapshot.</p>'
 for i,r in enumerate(p['reviews'],1):body+=f'<div class="question-box"><h3>Review {i}</h3><p>{e(r["prompt"])}</p><p><strong>First explanation:</strong> two to four sentences.</p><p><strong>After comparison:</strong> what did you clarify, correct or strengthen?</p></div>'
 body+='</section><section class="book-section" id="book-checkpoint"><h2>Final checkpoint</h2><p>Answer all questions before checking the explanations. The website saves attempts and uses a 70% local practice threshold. This is not a teacher grade or an LMS submission.</p>'
 for i,q in enumerate(p['checkpoint'],1):body+=f'<div class="question-box"><h3>{i} · {e(q["prompt"])}</h3><ol type="A">'+''.join('<li>'+e(v)+'</li>'for v in q['choices'])+'</ol></div>'
 body+='</section><section class="book-section" id="book-glossary"><h2>Glossary and sources</h2><dl>'+''.join(f'<div class="glossary-term"><dt>{e(k)}</dt><dd>{e(v)}</dd></div>'for k,v in p['glossary'].items())+'</dl><h3>Sources</h3><p class="source">Sports Wellness supplied '+e(p['name'])+' teaching chapter and task materials. New fictional cases, corrected learner explanations and practice items are authored for this course.</p>'
 if n==2:body+='<p class="source">Ryan, R. M., and Deci, E. L. (2000). Self-Determination Theory and the Facilitation of Intrinsic Motivation, Social Development, and Well-Being. American Psychologist, 55(1), 68–78. <a href="https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf">Author-hosted paper</a>.</p>'
 if n==3:body+='<p class="source">Timothy Gallwey, The Inner Game: the performance framework and Self 1 / Self 2 terminology. Attention quadrants associated with Robert Nideffer, as presented in the supplied Focus material. <a href="https://theinnergame.com/">The Inner Game</a>.</p>'
 if n==4:body+='<p class="source">Confidence-account, E-S-P, C-B-A and coping-rehearsal structures adapted from the supplied Toolkit material, which attributes confidence practices to Nate Zinsser. These structures are taught as planning tools and metaphors, not guarantees or neurological measurements.</p>'
 body+='</section><section class="book-section" id="book-feedback"><h2>Answers and feedback</h2><p>Use this section after trying the questions. Compare the ideas and evidence rather than matching every word. Written responses are not automatically marked.</p>'
 for l in p['lessons']:
  body+=f'<h3>{l["number"]:02} · {e(l["title"])}</h3>'
  for j,q in enumerate(l['checks'],1):body+=f'<div class="feedback-item"><p><strong>Check {l["number"]:02}.{j}: {chr(65+q["answer"])}.</strong> {e(q["feedback"])}</p></div>'
  body+='<p><strong>Written application: look for</strong></p><ul>'+''.join('<li>'+e(v)+'</li>'for v in l['expected'])+'</ul>'
 body+='<h3>Decision cases</h3>'
 for i,c in enumerate(p['labs'],1):body+=f'<div class="feedback-item"><p><strong>Case {i}: {chr(65+c["answer"])}.</strong> {e(c["feedback"])}</p></div>'
 body+='<p><strong>Transfer:</strong> identify a genuinely different situation, use its evidence to choose a response and explain a relevant limit or adjustment.</p><h3>Build field examples</h3>'
 for st in p['steps']:
  for f in st['fields']:body+=f'<div class="feedback-item"><h4>{e(f["label"])}</h4><p>{e(f["example"])}</p></div>'
 body+='<h3>Written review</h3>'
 for i,r in enumerate(p['reviews'],1):body+=f'<div class="feedback-item"><p><strong>Review {i}:</strong> {e(r["answer"])}</p></div>'
 body+='<h3>Checkpoint explanations</h3>'
 for i,q in enumerate(p['checkpoint'],1):body+=f'<div class="feedback-item"><p><strong>{i}: {chr(65+q["answer"])}.</strong> {e(q["feedback"])}</p></div>'
 body+='</section>'
 book=f'<!doctype html><html lang="en-CA"><head><meta charset="utf-8"><title>Phase {n} — {e(p["name"])}</title><style>{CSS}</style></head><body>{body}</body></html>'
 (d/'review/reading-source.html').write_text(book)
 target=d/'assets/readings'/p['reading'];HTML(string=book,base_url=str(d/'review')+'/').write_pdf(target)
 print(target)
if __name__=='__main__':
 for n in (list(map(int,sys.argv[1:]))or[2,3,4]):make(n)
