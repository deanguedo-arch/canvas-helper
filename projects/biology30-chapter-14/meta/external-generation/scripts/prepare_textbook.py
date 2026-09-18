from pathlib import Path
import fitz,json,re,hashlib
ROOT=Path(__file__).resolve().parents[1];A=ROOT/'workspace/assets';P=A/'textbook/chapter-14.pdf';pdf=fitz.open(P);H=hashlib.sha256(P.read_bytes()).hexdigest();qs=[];excluded=[]
M={'schemaVersion':1,'chapter':14,'coordinateSystem':'PDF points, top-left origin; split chapter PDF (printed 476 = PDF page 1)','questions':qs,'pages':{},'excluded':excluded,'sourcePdfSha256':H,'topics':[]}

def page_asset(n):
 if str(n) not in M['pages']:
  fp=A/'textbook-practice'/f'p{n}.jpg';pdf[n-476].get_pixmap(matrix=fitz.Matrix(2,2)).pil_save(fp,quality=88)
  M['pages'][str(n)]={'src':'./assets/textbook-practice/'+fp.name,'pdfPage':n-475,'box':list(pdf[n-476].rect)}
 return M['pages'][str(n)]['src']
def add(page,group,number,boxes,topics,contexts=(),note=None):
 id=f'ch14-p{page}-{group}-q{number}';crops=[]
 for j,box in enumerate(boxes):
  fp=A/'textbook-practice'/f'{id}-{j+1}.png';pdf[page-476].get_pixmap(matrix=fitz.Matrix(2.4,2.4),clip=fitz.Rect(box)).save(fp)
  crops.append({'page':page,'box':list(box),'asset':fp.name,'src':'./assets/textbook-practice/'+fp.name,'role':'question'if j==0 else'required question continuation'})
 for n in dict.fromkeys([page,*contexts]):crops.append({'page':n,'box':[0,0,603,783],'src':page_asset(n),'role':'supporting full-page context'})
 qs.append({'id':id,'page':page,'group':group,'number':number,'label':f'{group.replace("-"," ").title()} · p. {page} · question {number}','topics':[f'lesson-{n:02}'for n in topics],'crops':crops,'clinicalNote':note,'reviewStatus':'Crop boundaries checked against original text geometry; visual review recorded separately.'})
# In-text questions use the embedded numbering font. Decode only the number, never OCR.
qtopics={1:[1],2:[2],3:[3],4:[2],5:[3],6:[2],7:[5],8:[5],9:[5,7],10:[7],11:[10],12:[10],13:[10],14:[10],16:[10],18:[1],19:[4],20:[8],21:[7],22:[7],23:[6,7],24:[7]}
for n in range(478,499):
 for b in pdf[n-476].get_text('dict')['blocks']:
  lines=b.get('lines',[]);starts=[]
  for i,l in enumerate(lines):
   txt=''.join(s['text']for s in l['spans'])
   m=re.match(r'([\x11-\x1a]+)\s+',txt)
   if m and i>0 and ''.join(s['text']for s in lines[i-1]['spans']).strip()=='2':
    number=int(''.join(str(ord(c)-17)for c in m[1]));starts.append((i-1,number))
  for j,(i,k) in enumerate(starts):
   if k in [15,17]:
    excluded.append({'page':n,'group':'in-text','number':k,'reason':'Requires a current clinical recommendation/treatment comparison; historical source wording is not adopted as present guidance.'});continue
   end=starts[j+1][0]if j+1<len(starts)else len(lines);r=fitz.Rect(lines[i]['bbox'])
   for l in lines[i+1:end]:r|=fitz.Rect(l['bbox'])
   bottom=r.y1+4
   if (n,k) in [(484,9),(487,12)]:bottom-=8
   add(n,'in-text',k,[[r.x0-5,r.y0-3,r.x1+5,bottom]],qtopics[k])
# Hand-verified section and chapter review column boundaries, including every subpart.
regions={
 (485,'section-14-1'):{1:[68,437,316,465],2:[68,469,316,541],3:[68,546,316,574],4:[68,578,316,606],5:[68,610,316,652],6:[319,437,565,595],7:[319,599,565,640],8:[319,644,565,700]},
 (491,'section-14-2'):{1:[68,497,314,525],2:[68,529,314,557],3:[68,561,314,589],4:[68,593,314,667],5:[319,497,567,552],6:[319,555,567,696]},
 (502,'section-14-3'):{1:[38,73,286,101],2:[38,105,286,133],3:[38,137,286,229],4:None,5:[289,134,537,188],6:[289,192,537,220],7:[289,224,537,291],8:[289,295,537,337]},
 (504,'chapter-review'):{1:[38,87,285,114],2:[38,118,285,224],3:[38,228,285,295],4:[38,299,285,340],5:[38,344,285,489],6:[38,493,285,535],7:[38,538,285,567],8:[38,570,285,599],9:[38,602,286,631],10:[38,634,286,676],11:[289,70,536,340],12:[289,359,536,389],13:[289,392,536,421],14:[289,424,536,479],15:[289,482,536,537],16:[289,540,536,608],17:[289,611,536,679]},
 (505,'chapter-review'):{18:[68,70,315,416],19:[68,420,317,526],20:[319,87,567,245],21:[319,248,567,290],22:[319,293,567,335],23:[319,338,567,419],24:[319,422,567,595]}}
for (page,group),items in regions.items():
 for k,box in items.items():
  if (group=='chapter-review'and k in [5,7,15,19])or(group=='section-14-2'and k==6):
   reason={5:'Current treatment comparison is beyond this mechanism lesson; original clinical specifics require updated professional sources.',7:'Current treatment options are not a student treatment guide.',15:'Generalises delayed puberty to athletes and asks for an unsupported comparison without evidence.',19:'Government budget allocation is an optional policy exercise, not included in the chapter biology practice.'}.get(k,'Asks for a programme-policy argument; not part of this bounded scientific practice bank.')
   excluded.append({'page':page,'group':group,'number':k,'reason':reason});continue
  if group=='section-14-1':topics={1:[1],2:[2,5],3:[2],4:[5],5:[2],6:[6],7:[3,6],8:[2]}[k]
  elif group=='section-14-2':topics=[10]
  elif group=='section-14-3':topics={1:[1],2:[4],3:[4,7,8],4:[8],5:[1,4,8],6:[7],7:[4],8:[4,9]}[k]
  else:topics={1:[3],2:[3,4,6,8],3:[2,5],4:[2],6:[10],8:[6],9:[7],10:[1,8],11:[8],12:[10],13:[3],14:[4,8],16:[4],17:[9],18:[8,9],20:[1,9],21:[3,5],22:[10],23:[9],24:[4,9]}[k]
  boxes=[box]if box else[[38,233,286,365],[289,73,537,131],[38,372,398,627]]
  add(page,group,k,boxes,topics)
# Paper-based analysis with complete supplied data (not physical procedures).
for n,g,items,topics,contexts in [
 (500,'investigation-14b',{1:[50,400,280,442],2:[50,444,280,484],3:[50,489,280,518],4:[50,521,280,560],5:[50,565,280,605],6:[50,610,280,650],7:[50,674,280,714],8:[289,209,524,239],9:[289,241,524,281],10:[289,285,524,312]},[7,8],[500]),
 (494,'thought-lab-14-2-analysis',{1:[288,608,523,634],2:[288,636,523,724]},[4],[494]),
 (494,'thought-lab-14-2-procedure',{1:[50,528,282,554],2:[50,555,282,582]},[4],[494]),
 (497,'thought-lab-14-3-procedure',{1:[80,608,316,657],2:[80,658,316,727],3:[318,434,554,494]},[6,7],[496,497]),
 (497,'thought-lab-14-3-analysis',{1:[318,512,554,561],2:[318,562,554,622]},[6,7],[496,497]),
 ]:
 for k,box in items.items():add(n,g,k,[box],topics,contexts)
# Inventory other source exercises explicitly, rather than silently dropping them.
excluded.extend([
 {'page':477,'group':'launch-lab','reason':'Comparative salmon/human life-cycle assignment is deferred to Chapter 16 life-cycle treatment; not required to teach Chapter 14 human mechanisms.'},
 {'page':483,'group':'investigation-14a','reason':'Microscope observations and specimen drawing depend on equipment/observations not supplied to the standalone learner. Equivalent source-diagram interpretation occurs in the lesson and labeling.'},
 {'page':491,'group':'thought-lab-14-1','reason':'Group research and peer programme evaluation depend on an external classroom activity; scientific STI implications are taught and checked directly.'},
 {'page':497,'group':'thought-lab-14-3-extension','number':3,'reason':'External animation-authoring task is outside the supported written-input workflow; the five paper-based procedure/analysis questions are included.'},
 {'page':494,'group':'thought-lab-14-2-procedure','number':3,'reason':'Requires independent external research; the supplied-data graph procedures 1–2 and analysis 1–2 are included.'},
 {'page':499,'group':'thought-lab-14-4','reason':'Historical hormone-therapy comparison requires current medical sources and individual clinical judgement; excluded from learner treatment advice.'},
 {'page':501,'group':'connection','reason':'Adapted to the self-contained endocrine-disruptor evidence extension; government-policy verdict prompt not reproduced as a recommended answer.'}
])
import sys
sys.path.insert(0,str(ROOT/'scripts'));from content import LESSONS
M['topics']=[{'id':f'lesson-{i:02}','label':f'{i}. {l["title"]}'}for i,l in enumerate(LESSONS,1)]
M['contextPolicy']='Every question retains the original wording and any required continuation. Supporting full pages provide shared figures and context. Responses are ungraded. Paper work is not stored.'
(ROOT/'authoring/textbook-question-manifest.json').write_text(json.dumps(M,indent=2));print('questions',len(qs),'pages',len(M['pages']),'exclusion records',len(excluded))
