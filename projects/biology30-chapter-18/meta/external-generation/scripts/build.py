#!/usr/bin/env python3
"""Rebuild from canonical HTML, reviewed data and local assets. No lesson rewrite."""
from pathlib import Path
import json,base64,subprocess,sys
from bs4 import BeautifulSoup
R=Path(__file__).resolve().parents[1];W=R/'workspace';A=R/'authoring'
C=json.loads((A/'course-config.json').read_text());M=json.loads((A/'textbook-question-manifest.json').read_text());s=BeautifulSoup((W/'index.html').read_text(),'html.parser')
# Fail closed on a mismatch between authored lesson markup and the check registry.
for ck in C['checks']:
 if len(s.select('[data-check-id="'+ck['id']+'"]'))!=1:raise ValueError('Update canonical lesson markup for check '+ck['id'])
 if not s.find(id=ck['route']):raise ValueError('Missing route '+ck['route'])
for d in C['labelDiagrams']:
 if not (W/d['src']).is_file():raise FileNotFoundError(d['src'])
 if any(v not in d['options']for v in d['answers'].values()):raise ValueError('Invalid diagram options '+d['id'])
for q in M['questions']:
 for c in q['crops']:
  if not (W/c['src']).is_file():raise FileNotFoundError(c['src'])
s.select_one('#course-data').string=json.dumps(C,ensure_ascii=False).replace('</',r'<\/')
s.select_one('#textbook-practice-data').string=json.dumps({k:M[k]for k in ['chapter','questions','pages','topics']},ensure_ascii=False).replace('</',r'<\/')
s.select_one('#textbook-data').string=base64.b64encode((W/C['pdf']['filename']).read_bytes()).decode()
(W/'index.html').write_text(str(s),encoding='utf8')
subprocess.run([sys.executable,str(R/'scripts/assemble_portable.py')],check=True)
print('Built Chapter',C['chapter'],'from canonical workspace and reviewed data.')
