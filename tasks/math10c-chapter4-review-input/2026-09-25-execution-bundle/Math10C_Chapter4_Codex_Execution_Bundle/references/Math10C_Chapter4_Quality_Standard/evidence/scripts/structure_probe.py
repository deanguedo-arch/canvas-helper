import os
from pathlib import Path
from bs4 import BeautifulSoup
import json
b=Path(os.environ['MATH_AUDIT_ROOT']).resolve();out=Path(os.environ.get('MATH_AUDIT_OUT',str(Path(__file__).resolve().parent.parent/'rerun_results')));out.mkdir(parents=True,exist_ok=True);stats={}
for ch in [3,4]:
 s=BeautifulSoup((b/f'Chapter_{ch}/workspace/index.html').read_text(),'html.parser');lessons=[s.find(id=f'u{ch}-{ch}{i}') for i in range(1,9)]
 data={'static_lesson_words':[len(x.get_text(' ',strip=True).split()) for x in lessons], 'sum_static_lesson_words':sum(len(x.get_text(' ',strip=True).split()) for x in lessons),'static_support_library_words':len(s.find(id=f'u{ch}-support-library').get_text(' ',strip=True).split()),'guided_sections':len(s.select('.guided-practice')),'static_worked_examples':len(s.select('.worked-example')),'static_lesson_textareas':sum(len(x.select('textarea')) for x in lessons),'static_lesson_input_elements':sum(len(x.select('input')) for x in lessons),'lessons':[]}
 for e in lessons:
  data['lessons'].append({'id':e.get('id'),'line':e.sourceline,'worked_examples':len(e.select('.worked-example')),'input_blocks_before_main_workshop':[x.attrs for x in e.select('[data-question]')]})
 stats[f'ch{ch}']=data;print(json.dumps(data,indent=2)[:4000])
(out/'structural_metrics.json').write_text(json.dumps(stats,indent=2))
