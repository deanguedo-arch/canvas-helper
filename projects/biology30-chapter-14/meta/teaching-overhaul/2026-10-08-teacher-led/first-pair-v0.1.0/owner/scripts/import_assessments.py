from pathlib import Path
import json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
catpath=ROOT/'authoring/source-assessment-catalogue.json'
if not catpath.exists():raise FileNotFoundError('Restore authoring/source-assessment-catalogue.json before rebuilding.')
cat=json.loads(catpath.read_text());out=[];notes=[];ledger=[]
# Explicit reviewed mappings, not an inferred assessment placement based on filename alone.
lesson={1095:2,1096:2,1097:1,1098:3,1099:5,1100:6,1101:5,1102:4,1103:4,1104:8,1105:8,1106:2,1107:2,1108:6,1109:5,1110:7,1111:8,1112:8,1113:6,1114:9,1116:8,1117:8,1120:5,1121:5,1122:4,1118:5,1119:4,
1514:5,1523:5,1525:10,1539:4,1542:2,1554:2,1568:2,1570:9,1575:2,1579:2,1153:4,1162:7,1163:4,1183:9,1186:8}
explain={1095:'Sperm form in seminiferous tubules, then mature and can be stored in the epididymis.',1096:'The prostate and bulbourethral (Cowper’s) glands add secretions into the urethral pathway; neither produces sperm.',1097:'An oviduct is a reproductive structure; breast development is a secondary sex characteristic.',1098:'The acrosome contains enzymes; mitochondria supply ATP and the flagellum provides movement.',1099:'An oviduct is the usual fertilization site; the endometrium is the later implantation site.',1100:'The corpus luteum forms from remaining follicular tissue and releases mainly progesterone and some estrogen.',1101:'Epididymis and uterus have different main roles: sperm maturation/storage versus support of development after implantation.',1102:'GnRH stimulates the anterior pituitary to release FSH and LH.',1103:'FSH acts directly on Sertoli cells; testosterone also supports sperm production but is not the specified pituitary signal.',1104:'FSH and LH are anterior-pituitary hormones acting on ovarian tissues.',1105:'The LH surge helps trigger ovulation.',1106:'The diagram’s accessory glands numbered 6, 7 and 8 add fluid; they are distinct from the sperm-production site.',1107:'Number 9 is the epididymis, where sperm mature and may be stored.',1108:'The corpus luteum forms from remaining follicular tissue in the ovary, number 2.',1109:'The blastocyst implants into the endometrium of the uterus, number 3; the zygote stage precedes implantation.',1110:'Ovulation marks the transition from the follicular phase to the luteal phase.',1111:'Curve 1 is the smaller FSH pattern; curve 2 has the large LH surge.',1112:'Curve 7 is estrogen, which rises before ovulation; the later progesterone rise is curve 8.',1113:'The corpus luteum is a temporary endocrine structure after ovulation.',1114:'Menopause names the end of menstrual cycling. Testosterone changes are generally more gradual and are not an identical sudden reproductive stop.',1116:'Label 9 is FSH and label 3 is LH. Follow their ovarian targets rather than only the positions of the arrows.',1117:'Label 7 is estrogen and label 6 is progesterone; the corpus luteum is the main luteal progesterone source.',1120:'Number 3 identifies the uterus, whose inner lining is the endometrium.',1121:'Structure 1 is an oviduct. Scarring can reduce the chance that sperm and oocyte meet without necessarily stopping ovulation or hormones.',1122:'Less testosterone means less inhibitory feedback; a functioning anterior pituitary can increase LH release.',1514:'Both the vas deferens and oviduct have important transport functions. They are not identical in all functions.',1523:'The endometrium provides the site and environment for implantation, rather than the usual site where gametes meet.',1525:'A blocked oviduct can impair transport while the ovary continues to ovulate.',1539:'LH directly stimulates testosterone-producing interstitial cells; testosterone then produces other tissue effects.',1542:'Without the vas deferens, sperm cannot follow their normal route to the urethra.',1554:'The scrotal position helps keep the testes somewhat cooler than the main body core, supporting sperm production.',1568:'Testosterone enters blood from endocrine cells; it does not need the sperm duct to reach target tissues.',1570:'Combined contraceptive hormones have estrogen-like and progesterone-like actions and can suppress the normal FSH/LH pattern.',1575:'Testicular temperature is relevant to sperm development; the model concerns the location of the testes, not an automatic lack of gonadotropins.',1579:'Fructose supports energy supply and the fluid environment helps sperm survive and function. FSH and testosterone regulate production but are not the two semen components asked about.',1153:'FSH supports Sertoli-cell activity and follicular development in the two systems.',1162:'Menstrual flow overlaps the early follicular phase; follicular growth is followed by ovulation and then luteal activity.',1163:'LH supports interstitial-cell testosterone production in males and ovulation and corpus-luteum formation in females.'}
patches={
1096:('Which row pairs two accessory glands whose secretions enter the urethral pathway?','Remove the source’s overgeneralised acidity claim while retaining the validated table and answer.'),
1103:('Which anterior-pituitary hormone directly stimulates Sertoli-cell functions that support sperm production?','Remove ambiguity: FSH and testosterone both support sperm production.'),
1109:('During implantation, a developing blastocyst attaches to the endometrium in which numbered structure?','Replace zygote-at-implantation wording with blastocyst; retain same uterus target.'),
1114:('Which term describes the end of menstrual cycling associated with declining ovarian follicular activity?','Replace an over-equivalent andropause/menopause comparison with the taught menopause concept.'),
1120:('Which numbered structure normally contains the endometrium?','Avoid presenting the source’s simplified explanation of endometriosis origin as a complete mechanism.'),
1122:('In a hypothetical model, a chemical reduces testosterone production in interstitial cells. The hypothalamus and pituitary still respond normally. Which pituitary hormone would tend to rise as feedback decreases?','Use the source’s feedback mechanism as an explicitly hypothetical case rather than an unverified contemporary chemical-exposure claim.'),
1525:('In a hypothetical case, scarring completely blocks both oviducts while ovarian hormone production remains normal. Which event can still occur?','Make the transport obstruction and unaffected ovarian function explicit.'),
1575:('A model places both testes inside the main body cavity instead of the scrotum. Which change could reduce normal sperm development?','Remove the source’s absolute prediction of sterility.'),
1162:('Which sequence correctly orders the main ovarian events?','Do not present flow and the follicular phase as completely separate phases.')}
seen={}
for q in cat:
 n=int(q['id'].split('_')[1])-2130000
 rec={'sourceFile':q['file'],'sourceTitle':q['title'],'itemId':q['id'],'sourceStem':q['stem'],'sourceImages':q['assets']}
 if n in [1115,1519,1532,1533,1545,1556,1557,1564,1565,1573,1582,1583,1584]:
  rec.update(disposition='excluded',reason='Scientific or clinical statement in the historical stimulus is overgeneralised, outdated or unsupported; not adopted as an automatically checked Chapter 14 item.');ledger.append(rec);continue
 if n not in lesson:
  rec.update(disposition='deferred',reason='Retained in the source catalogue for later chapter/unit-review reconciliation; not part of the Chapter 14 auto-checked bank.',target='Chapter 15 unit review or Chapters 16–18 where cell division/molecular content is involved.');ledger.append(rec);continue
 l=lesson[n];rec['lesson']=l
 if n in [1118,1119,1183,1186]:
  prompt=q['stem'];assets=q['assets']
  if n==1118:prompt='Use the numbered structures to trace the passage from the fimbriae through the oviduct and the uterine/cervical/vaginal route to the outside. Give the five-number order and explain where fertilization normally occurs. This traces connected passages, not the survival of an intact unfertilized oocyte.'
  if n==1183:prompt='Explain how the hormones in a combined contraceptive pill can reduce the chance of pregnancy. Trace the feedback effect to ovarian activity.'
  if n==1186:prompt='Explain the positive-feedback relationship leading to the LH surge before ovulation. Contrast it with estrogen’s inhibitory contribution at other stages.'
  notes.append({'id':'ch14-source-'+q['id'],'lesson':l,'title':'Optional application '+str(len(notes)+1),'prompt':prompt,'stimuli':[{'src':a['src'],'alt':'Original question stimulus; use the numbered structures or hormone diagram shown.'}for a in assets],'sourceItemId':q['id']})
  rec.update(disposition='adapted optional written response',targetId=notes[-1]['id'],reason='Retains the scientific task and supplied stimulus, removes historical answer-sheet instructions; response is saved, not automatically graded.');ledger.append(rec);continue
 opts=[o['text'] for o in q['options']];keys=[o['text'] for o in q['options']if o['id']in q['correctOptionIds']]
 if len(keys)!=1 or not opts:rec.update(disposition='unresolved',reason='Single correct-option identity could not be resolved.');ledger.append(rec);continue
 answer=keys[0];prompt=q['stem'];stim=[{'src':a['src'],'alt':'Original diagram or table needed to answer this question.'}for a in q['assets']]
 if n in patches:prompt=patches[n][0];rec['adaptation']=patches[n][1]
 if n==1114:opts=['Menopause','Ovulation','Follicular development','Menstruation'];answer='Menopause';stim=[]
 if n==1120:
  # Crop only the source anatomical drawing, excluding the old causal description.
  from PIL import Image
  p=ROOT/'workspace'/stim[0]['src'];source=p if p.exists() else ROOT/'authoring/source-assets'/p.name;im=Image.open(source);cropped=im.crop((0,int(im.height*.26),im.width,im.height));new=ROOT/'workspace/assets/assessment/endometrium-location.png';cropped.save(new);stim=[{'src':'./assets/assessment/'+new.name,'alt':'Numbered female reproductive anatomy. Identify the structure containing the endometrium.'}]
 if n==1122:stim=[]
 if n==1575:opts=['The testes are warmer than in their usual scrotal position','GnRH becomes a sperm cell','The body loses all LH receptors automatically','Sperm acquire an extra chromosome set because of location'];answer=opts[0]
 if n==1162:opts=['Follicle development → ovulation → corpus-luteum activity','Ovulation → follicle development → corpus-luteum activity','Corpus-luteum activity → ovulation → follicle development','Follicle development → corpus-luteum activity → ovulation'];answer=opts[0]
 # Remove legacy visible a/b prefixes for substantive options; preserve table row letters.
 def clean(x):
  if re.fullmatch(r'[A-Da-d][.,]?',x.strip()):return 'Row '+x.strip()[0].upper()
  return re.sub(r'^[A-D][.]\s+','',x).strip()
 opts=list(map(clean,opts));answer=clean(answer)
 # Replace all-of-the-above with the explicit set so shuffled options remain meaningful.
 if n==1163:opts=['Ovulation, corpus-luteum formation and testosterone production','Only sperm movement through the urethra','Only endometrial shedding','Only follicle-independent estrogen breakdown'];answer=opts[0]
 fingerprint=hashlib.sha256(json.dumps([prompt,sorted(opts),[a['src'] for a in stim]]).encode()).hexdigest()
 if fingerprint in seen:rec.update(disposition='duplicate',duplicateOf=seen[fingerprint]);ledger.append(rec);continue
 id='ch14-import-'+q['id'];seen[fingerprint]=id
 concept={1:'primary-sex-characteristic',2:'vas-deferens',3:'acrosome',4:'lh',5:'oviduct',6:'corpus-luteum',7:'follicular-phase',8:'lh-surge',9:'hormonal-contraception',10:'pelvic-inflammatory-disease'}[l]
 out.append({'id':id,'lesson':l,'conceptId':'ch14-concept-'+concept,'prompt':prompt,'options':opts,'answer':answer,'explanation':explain[n],'cue':'Identify the relevant structure, its usual function, and the direction of the change.','difficulty':'application'if stim or n in [1122,1525,1542,1568,1575]else'recall','stimuli':stim,'sourceItemId':q['id']})
 rec.update(disposition='adapted optional multiple choice'if n in patches or n==1163 else'optional multiple choice',targetId=id,reason='Key resolved from quiz XML and checked against the taught mechanism; options use stable text identities.');ledger.append(rec)
(ROOT/'authoring/imported-practice.json').write_text(json.dumps(out,indent=2));(ROOT/'authoring/optional-source-responses.json').write_text(json.dumps(notes,indent=2));(ROOT/'authoring/assessment-dispositions.json').write_text(json.dumps(ledger,indent=2))
print('Imported',len(out),'MC;',len(notes),'written;',len(ledger),'dispositions')
