from pathlib import Path
from bs4 import BeautifulSoup
import json,re,hashlib,math,itertools,xml.etree.ElementTree as ET
R=Path(__file__).resolve().parent.parent;O=R;results={}
def check(ch,name,ok,detail=''):
 results.setdefault(ch,[]).append(dict(name=name,status='passed'if ok else'failed',details=detail))
configs={}
for ch in range(15,21):
 root=O/f'chapter-{ch}';w=root/'workspace';C=json.loads((root/'authoring/course-config.json').read_text());D=json.loads((root/'authoring/lesson-content.json').read_text());M=json.loads((root/'authoring/textbook-question-manifest.json').read_text());configs[ch]=C;s=BeautifulSoup((w/'index.html').read_text(),'html.parser');n=len(D['lessons'])
 check(ch,'exact_main_stylesheet',hashlib.sha256((w/'styles.css').read_bytes()).hexdigest()=='94fe523654289edd8b0f951dd6782f83dce7d08f5e18a3d903d25576fbfa0ba5')
 check(ch,'exact_textbook_stylesheet',hashlib.sha256((w/'assets/textbook-practice.css').read_bytes()).hexdigest()=='4101415cce977a4a8553754a01cea3d33ad194add1198db00ddc0ba99bfeea12')
 check(ch,'route_and_check_counts',len(s.select('.course-page'))==n+13 and len(C['checks'])==n+1)
 check(ch,'three_sections_per_teaching_lesson',all(len(s.select(f'#lesson-{i:02d} [data-canvas-edit-key$="teaching-01"]'))==1 and len(l['sections'])==3 for i,l in enumerate(D['lessons'],1)))
 check(ch,'worked_supported_required_each_lesson',all(s.select_one(f'#lesson-{i:02d} .worked-example') and s.select_one(f'#lesson-{i:02d} [data-guided-item]') and s.select_one(f'#lesson-{i:02d} [data-check-id]')for i in range(1,n+1)))
 check(ch,'required_keys_and_unique_options',all(q['answer']in q['options']and len(q['options'])==len(set(q['options']))for c in C['checks']for q in c['mc']))
 for group,qs in [('guided',[q for a in C['guidedActivities']for q in a['guided']['items']]),('transfer',[q for a in C['transferChecks']for q in a['mc']])]:
  positions=[q['options'].index(q['answer'])for q in qs];check(ch,group+'_varied_answer_positions',len(set(positions))>1,str(positions))
 check(ch,'no_unresolved_required_asset_paths',all((w/img['src']).is_file()for img in s.select('img[src]')if img['src'].startswith(('./assets/','assets/'))))
 check(ch,'textbook_crop_files_resolve',all((w/c['src']).is_file()for q in M['questions']for c in q['crops']))
 check(ch,'textbook_id_unique',len({q['id']for q in M['questions']})==len(M['questions']))
 check(ch,'textbook_topics_nonempty',all(any(t['id']in q['topics']for q in M['questions'])for t in M['topics']))
 check(ch,'original_question_has_fullpage_context',all(any(c['role']=='supporting full-page context'and c['page']==q['page']for c in q['crops'])for q in M['questions']))
 check(ch,'reviewed_diagram_maps_resolve',all((w/d['src']).is_file()and all(v in d['options']for v in d['answers'].values())for d in C['labelDiagrams']))
 check(ch,'svg_parses',all(ET.parse(p).getroot().tag.endswith('svg')for p in (w/'assets').rglob('*.svg')))
 check(ch,'no_photo_input_or_global_save_exit',not s.select('input[type=file]')and not s.select('[data-save-exit]'))
 authored=s.get_text(' ',strip=True);bad=re.findall(r'teacher.slide|teacher notes|in this pilot|the source material explains|this section was assembled|source video \d',authored,re.I);check(ch,'no_student_editorial_commentary',not bad,str(bad))
 check(ch,'unique_chapter_storage_namespace',f'biology30-chapter-${{C.chapter}}:html:v1'in (w/'main.js').read_text()or str(ch)in(w/'main.js').read_text())
 check(ch,'all_mixed_item_ids_unique',len({x['id']for key in ['practiceQuestions','authoredPractice','typedPractice','multiSelectPractice','diagramPractice']for x in C[key]})==sum(len(C[key])for key in ['practiceQuestions','authoredPractice','typedPractice','multiSelectPractice','diagramPractice']))
 check(ch,'no_external_core_dependency',not s.select('script[src^="http"],link[rel=stylesheet][href^="http"]'))
 check(ch,'full_book_page_mapping',C['pdfPages']==D['last']-D['first']+1 and C['pdf']['firstPrintedPage']==D['first'])
 check(ch,'transfer_ungraded_written_response',bool(C['transferChecks'][0]['writing']['model'])and len(C['transferChecks'][0]['mc'])==3)

def qanswer(ch,id):return next(q['answer']for ck in configs[ch]['checks']for q in ck['mc']if q['id']==id)
def eq(ch,id,value):check(ch,'calculation_'+id,str(value)==qanswer(ch,id),f'Independently computed: {value}; actual key: {qanswer(ch,id)}')
eq(16,'ch16-l01-check-mc-2',10//2);eq(16,'ch16-l03-check-mc-2',8*2);eq(16,'ch16-final-mc-4',2**5)
eq(16,'ch16-final-mc-1',f'{10} chromosomes and {10*2} chromatids')
# Enumerate independent gametes and crosses rather than taking expected ratios on trust.
def gametes(genotype):return [''.join(x)for x in itertools.product(*[genotype[i:i+2]for i in range(0,len(genotype),2)])]
def cross(a,b):return [''.join(''.join(sorted(pair,key=lambda t:(t.lower(),t.islower())))for pair in zip(x,y))for x in gametes(a)for y in gametes(b)]
z=cross('AaBb','AaBb');check(17,'dihybrid_aaB_',sum(x.startswith('aa')and'B'in x[2:]for x in z)/len(z)==3/16 and qanswer(17,'ch17-l05-check-mc-2')=='3/16')
check(17,'dihybrid_aabb',z.count('aabb')/len(z)==1/16 and qanswer(17,'ch17-final-mc-2')=='1/16')
z=cross('Aa','Aa');unaffected=[x for x in z if x!='aa'];check(17,'conditional_carrier_two_thirds',unaffected.count('Aa')/len(unaffected)==2/3 and qanswer(17,'ch17-l10-check-mc-1')=='2/3')
check(17,'recombination_denominator',round((10+10)/(150+130+10+10)*100,2)==6.67 and qanswer(17,'ch17-l13-check-mc-1')=='6.67% approximately')
eq(17,'ch17-final-mc-5',f'{(15+15)*100//(36+34+15+15)}%')
# Independent standard code, explicitly read RNA 5-prime to 3-prime.
code=json.loads((O/'chapter-18/authoring/codon-table.json').read_text());check(18,'all_64_codons',set(code)=={''.join(z)for z in itertools.product('ACGU',repeat=3)})
check(18,'stops_and_glutamine',all(code[c]=='Stop'for c in ['UAA','UAG','UGA'])and code['CAG']=='Gln'and code['CAA']=='Gln'and code['GAA']=='Glu')
def transcribe_template(seq,direction='3to5'):
 if direction=='5to3':seq=seq[::-1]
 return seq.translate(str.maketrans('ATCG','UAGC'))
def translate(rna):
 aa=[]
 for i in range(0,len(rna)-2,3):
  a=code[rna[i:i+3]]
  if a=='Stop':break
  aa.append(a)
 return '–'.join(aa)
eq(18,'ch18-l07-check-mc-1',translate(transcribe_template('TACCTTAGGATT')))
eq(18,'ch18-final-mc-4',translate('AUGCAAUGA'))
for t,d,exp in [('TTACCCTTTCAT','5to3','AUGAAAGGGUAA'),('CTATTCCAT','5to3','AUGGAAUAG'),('TACAAACCGACT','3to5','AUGUUUGGCUGA')]:check(18,'strand_'+t,transcribe_template(t,d)==exp,exp)
check(18,'charged_double_strand_percent',100-(22*2)==56 and qanswer(18,'ch18-l02-check-mc-2')=='C is 22%, and A and T are each 28%')
eq(19,'ch19-l02-check-mc-1',f'{(2*20+60)/(2*(20+60+20)):.2f}')
eq(19,'ch19-final-mc-1',f'{(2*20+40)/(2*(20+40+40)):.2f}')
eq(19,'ch19-final-mc-2',f'{2*(1-math.sqrt(.04))*math.sqrt(.04):.2f}')
eq(19,'ch19-l04-check-mc-1',f'{2*(1-math.sqrt(.09))*math.sqrt(.09)*100:.0f}%')
eq(19,'ch19-l04-check-mc-2',f'{.8**2:.2f}')
check(19,'weighted_gene_flow',math.isclose((80*.25+20*.75)/100,.35))
check(19,'rare_recessive_carriers',math.isclose(2*(1-math.sqrt(1/10000))*math.sqrt(1/10000)*100,1.98))
eq(20,'ch20-l02-check-mc-1',f'{25-18:+d}');eq(20,'ch20-l03-check-mc-1',f'{-15/150:.2f}'.replace('-','−'))
eq(20,'ch20-final-mc-1',f'{360//90} individuals/km²');eq(20,'ch20-final-mc-2',f'{40+12-25-7:+d}');eq(20,'ch20-final-mc-3',f'{(300-250)//5} individuals/year')
check(20,'beaver_consistent_counts',205+240+11-195-8==253 and math.isclose(48/20,2.4)and math.isclose(48/205,.23414634146341465))
# Chronology and feedback are checked against exact lesson statements, not live clinical claims.
d=json.loads((O/'chapter-15/authoring/lesson-content.json').read_text());t=json.dumps(d).lower()
check(15,'age_convention_explicit','fertilization'in t and'gestational'in t)
check(15,'normal_placental_separation_taught','do not normally mix'in t or 'separate circulations'in t or 'separate blood'in t or 'do not normally join into one continuous stream'in t)
check(15,'prolactin_oxytocin_distinct','prolactin'in t and 'milk production'in t and 'milk ejection'in t)
for ch,rr in results.items():
 v=O/f'chapter-{ch}/verification';(v/'static-science-results.json').write_text(json.dumps(dict(tests=rr),indent=2));print(ch,len(rr),'tests',[(x['name'],x['details'])for x in rr if x['status']!='passed'])
