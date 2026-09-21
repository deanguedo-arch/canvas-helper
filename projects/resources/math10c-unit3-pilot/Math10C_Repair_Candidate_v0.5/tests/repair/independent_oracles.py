"""Independent offline mathematical oracle. SymPy is used ONLY by this test,
never by the course checker. Only canonical whitelisted authored expressions
are parsed. Numeric questions are solved from their prompts, not answer strings.
"""
from pathlib import Path
import json,subprocess,re,math
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr,standard_transformations,implicit_multiplication_application,convert_xor
r=Path(__file__).resolve().parents[2]
js="const fs=require('fs'),vm=require('vm'),x={window:{}};vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'),x);console.log(JSON.stringify(x.window.UNIT3_DATA.questions))"
qs=json.loads(subprocess.check_output(['node','-e',js,str(r/'workspace/assets/unit-data.js')]))
vars={n:sp.Symbol(n)for n in 'xyabmnpq'};rows=[]
def parse(s):
 if not re.fullmatch(r'[0-9xyabmnpq+*^()\s-]+',s):raise ValueError('Authored expression not in offline oracle whitelist')
 s=re.sub(r'(?<=\d)(?=[xyabmnpq(])','*',s) # 0x is multiplication, not a Python hex prefix
 return parse_expr(s,local_dict=vars,transformations=standard_transformations+(implicit_multiplication_application,convert_xor))
for q in qs:
 try:
  mode=q['mode'];text=q['prompt'];contract=q['contract'];actual=q['answer']
  if contract=='factor-pair-v1':
   a,b=map(int,actual.split('|'));ok=a+b==q['sum']and a*b==q['product'];method='integer sum/product'
  elif contract=='integer-root-bracket-v1':
   a,b=map(int,actual.split('|'));ok=b==a+1 and a**q['rootPower']<q['radicand']<b**q['rootPower'];method='strict neighbouring integer powers'
  elif mode=='choice':
   sequences={'e301':['-2*(x-4)','-2*x-8'],'e302':['x^2+8*x+15','x^2+3*x+5*x+15','x*(x+3)+5*(x+3)','(x+5)*(x-3)'],'e303':['(x-4)^2','(x-4)*(x-4)','x^2-16'],'e304':['3*x*(2*x+5)','6*x^2+15*x','21*x^3']}
   seq=sequences[q['id']];expected=next(i for i in range(1,len(seq))if sp.expand(parse(seq[i])-parse(seq[i-1]))!=0);ok=int(actual)==expected;method='first non-equivalent equality, SymPy expansion'
  elif q.get('expression'):
   ok=sp.expand(parse(actual)-parse(q['expression']))==0;method='independent symbolic equivalence (not unrestricted form proof)'
  else:
   nums=list(map(int,re.findall(r'\b\d+\b',text.replace(',',''))))
   if 'greatest common factor' in text:expected=math.gcd(*nums[:2])
   elif 'least common multiple' in text or 'lights flash' in text or 'bell rings' in text:expected=math.lcm(*nums[:2])
   elif 'prime factorization' in text:expected=nums[0]
   elif 'cube' in text:expected=sp.integer_nthroot(nums[0],3)[0]
   elif 'square' in text:expected=math.isqrt(nums[0])
   else:raise ValueError('No independent prompt solver')
   ok=parse(actual)==expected;method='prompt-derived integer GCF/LCM/root/value'
   if mode=='prime':
    factors=sp.factorint(expected);received=[int(x)for x in re.findall(r'\d+',actual)];ok=ok and all(sp.isprime(x)for x in received)
  assert ok,'Answer differs from independent oracle'
  rows.append({'id':q['id'],'result':'passed','method':method})
 except Exception as e:rows.append({'id':q['id'],'result':'failed','detail':str(e)})
(r/'evidence/independent-authored-oracles.json').write_text(json.dumps({'command':'python tests/repair/independent_oracles.py','environment':{'sympy':sp.__version__},'cases':['MATH-11'],'limits':'Checks authored numeric results, polynomial identities and authored error-step answers. Does not establish instructional quality or universal factor-form correctness.','results':rows},indent=2))
print(json.dumps({'passed':sum(x['result']=='passed'for x in rows),'failed':[x for x in rows if x['result']=='failed']}));raise SystemExit(any(x['result']=='failed'for x in rows))
