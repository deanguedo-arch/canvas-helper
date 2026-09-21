"""Independent SymPy equality checks on actual canonical worked-example nodes.
Label definitions (GCF/V/s/a/b) are not universal identities; these are explicitly
excluded or their numeric tails tested. Pedagogical interpretation remains review.
"""
from pathlib import Path
import json,re,sys
from bs4 import BeautifulSoup
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr,standard_transformations,implicit_multiplication_application,convert_xor
ROOT=Path(__file__).resolve().parents[2]
locals={v:sp.Symbol(v)for v in 'xyabmnpq'}
def parse(t):
 t=t.replace('−','-').replace('·','*').replace('×','*').strip()
 if '÷' in t:
  a,b=t.split('÷');t=f'({a})/({b})'
 if not re.fullmatch(r'[0-9xyabmnpq+*/^()\s-]+',t):raise ValueError('Outside independent expression whitelist: '+t)
 t=re.sub(r'(?<=\d)(?=[xyabmnpq(])','*',t)
 return parse_expr(t,local_dict=locals,transformations=standard_transformations+(implicit_multiplication_application,convert_xor))
soup=BeautifulSoup((ROOT/'workspace/index.html').read_text(),'html.parser');rows=[];excluded=[]
for j,example in enumerate(soup.select('.worked-example')):
 title=example.select_one('h2').get_text();targets=json.loads(example.get('data-solved-expressions','[]'));target=targets[0] if len(targets)==1 else None
 for k,node in enumerate(example.select('.equation')):
  for sup in node.select('sup'):sup.replace_with('^('+sup.get_text()+')')
  for p,text in enumerate(node.get_text().split(';')):
   text=text.strip();parts=[s.strip()for s in text.split('=')]
   if parts[0] in ['GCF','LCM','V','s','b']or parts[0]=='a  ·  c':parts=parts[1:]
   if len(parts)<2:
    # Standalone polynomial transformation: compare with the authored target,
    # except labelled geometric definitions and numeric factor-pair lists.
    if len(parts)==1 and target and any(v in parts[0]for v in ['x','y']) and not text.startswith('GCF'):parts=[target,parts[0]]
    else:excluded.append({'workedExample':j+1,'text':text,'reason':'Definition, single numeric value or factor-pair listing; not claimed as an equality test'});continue
   try:
    vals=[parse(v)for v in parts];assert all(sp.cancel(v-vals[0])==0 for v in vals[1:]), 'Non-equivalent terms'
    rows.append({'id':f'worked-{j+1}-{k+1}-{p+1}','example':title,'sourceText':text,'result':'passed'})
   except Exception as e:rows.append({'id':f'worked-{j+1}-{k+1}-{p+1}','example':title,'sourceText':text,'result':'failed','detail':str(e)})
report={'command':'python tests/repair/worked_identity_oracles.py','cases':['MATH-11'],'environment':{'sympy':sp.__version__},'limitations':'Equality/transform checks only; no semantic teaching, domain, diagram or classroom acceptance. Definitions and factor listings explicitly excluded.','results':rows,'excluded':excluded}
(ROOT/'evidence/worked-identity-oracles.json').write_text(json.dumps(report,indent=2,ensure_ascii=False));print(json.dumps({'passed':sum(r['result']=='passed'for r in rows),'failed':[r for r in rows if r['result']=='failed'],'excluded':len(excluded)}));sys.exit(any(r['result']=='failed'for r in rows))
