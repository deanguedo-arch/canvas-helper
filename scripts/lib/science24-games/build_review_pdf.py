"""Create and verify an unsigned candidate-specific AcroForm and text alternative."""
import json,pathlib,sys,textwrap
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor,white
from pypdf import PdfReader,PdfWriter
OUT=pathlib.Path(sys.argv[1]);candidate=json.loads((OUT/'candidate.json').read_text())
(OUT/'validation').mkdir(parents=True,exist_ok=True)
games=[('A1','Reaction Detective'),('A2','Atom Factory'),('B1','Energy Chain Rescue'),('B2','Power Budget Challenge'),('C1','Break the Chain'),('C2','Inheritance Detective'),('D1','Safe Stop Challenge'),('D2','Crash-Test Studio')]
PDF=OUT/'TEACHER_REVIEW.pdf';W,H=612,792;c=canvas.Canvas(str(PDF),pagesize=(W,H));c.setTitle('Science 24 candidate teacher review');c.setAuthor('Canvas Helper');green=HexColor('#123f2d');ink=HexColor('#172b23');grey=HexColor('#e4ebe7')
fields=[];text=[]
def line(s,y,size=10,bold=False):c.setFillColor(ink);c.setFont('Helvetica-Bold' if bold else 'Helvetica',size);c.drawString(42,y,s)
def para(s,y,size=10,width=92):
 for ln in textwrap.wrap(s,width):line(ln,y,size);y-=14
 return y
def header(title,page):
 c.setFillColor(green);c.rect(0,H-76,W,76,fill=1,stroke=0);c.setFillColor(white);c.setFont('Helvetica-Bold',19);c.drawString(42,H-39,title);c.setFont('Helvetica',10);c.drawString(42,H-58,'Science 24 | Standalone supplemental practice | Teacher decision pending')
 line('Candidate: '+candidate['id'],H-100,9);line('Source snapshot SHA256:',H-117,9);line(candidate['sourceSnapshotSHA256'],H-131,8)
 line('Unsigned review form - does not authorize LMS or production release',24,8);c.drawString(W-48,24,str(page));text.extend([title,'Candidate: '+candidate['id'],'Source snapshot SHA256: '+candidate['sourceSnapshotSHA256']])
def field(name,label,y,height=24,multiline=False):
 line(label,y,11,True);c.acroForm.textfield(name=name,tooltip=label,x=42,y=y-height-7,width=528,height=height,borderWidth=1,borderColor=grey,fillColor=white,textColor=ink,fontName='Helvetica',fontSize=10,fieldFlags='multiline' if multiline else '',value='');fields.append(name);text.append(label+': ____________________');return y-height-28
def choice(name,label,y,options):
 line(label,y,11,True);c.acroForm.choice(name=name,tooltip=label,x=42,y=y-31,width=528,height=24,borderWidth=1,borderColor=grey,fillColor=white,textColor=ink,fontName='Helvetica',fontSize=10,options=options,value='Not reviewed',fieldFlags='combo');fields.append(name);text.append(label+': '+' / '.join(options)+' [default: Not reviewed]');return y-53
header('Eight-game teacher review',1)
y=H-164
for s in [
 'Open START_REVIEW.html and inspect all six scenarios in each game. Read TEACHER_GUIDE.html for independent solutions, alternatives, misconceptions and reasoning rubrics. Record findings for the exact candidate named above.',
 'Model correctness, support use, completion, learner self-review and teacher judgment are separate. First transfer responses are preserved; revisions cannot be labelled independent first-attempt success.',
 'Review VALIDATION_STATUS.json and the visual comparisons before approving. A blocked visual gate is an outstanding requirement, even when science and browser flows pass. Manual checks that were not performed stay Not tested.',
 'Review outcomes against CURRICULUM_TASK_MAP.md and the official Alberta program. These supplemental games do not cover the full course. No secure assessments, SCORM, grades, publishing or course placement are included.',
 'A substantive change invalidates affected approval. Do not reuse this form for a different source snapshot. Approval must be the actual reviewer decision; this unsigned file certifies nothing.'
]:y=para(s,y)-20
y=field('overall_reviewer','Overall reviewer name',y)
y=field('overall_date','Review date (YYYY-MM-DD)',y)
y=choice('overall_decision','Overall decision',y,['Not reviewed','Approve','Revise'])
c.showPage()
for page,(gid,title) in enumerate(games,2):
 header(gid+' '+title,page);y=H-164
 y=field(gid+'_reviewer','Reviewer name',y);y=field(gid+'_date','Date (YYYY-MM-DD)',y)
 y=choice(gid+'_science','Science judgment',y,['Not reviewed','Supported','Needs revision'])
 y=choice(gid+'_curriculum','Curriculum and level judgment',y,['Not reviewed','Supported','Needs revision'])
 y=field(gid+'_usability','Usability findings (flow, navigation, revision and transfer)',y,64,True)
 y=field(gid+'_accessibility','Accessibility findings and checks actually performed',y,64,True)
 y=field(gid+'_revisions','Required revisions, alternatives and explanation-rubric findings',y,80,True)
 y=choice(gid+'_decision','Game decision',y,['Not reviewed','Approve','Revise'])
 y=para('Approving this game does not establish complete course coverage, target-LMS operation or completion of unperformed manual checks.',y,9)
 c.showPage()
header('Review evidence and open checks',10);y=H-164
for s in [
 'Technical evidence: see VALIDATION_STATUS.json, validation/ and candidate.json. Inspect screenshots and unchanged premium PNG references. Receipts identify the actual HTTP and offline browser checks; A1 evidence is reusable only while its frozen hashes match.',
 'Native browser 200% zoom: Not tested. Real screen-reader operation: Not tested. Safari and Firefox: Not tested. Physical phone/tablet: Not tested. Chromium viewport checks and keyboard checks are not substitutes for those results.',
 'Visual exactness target: 99.25% pixel agreement and 4 px geometry tolerance outside documented corrections. No entire learning panel is masked. The unmasked premium comparison includes corrected scenario values, new photos and real controls. Title, feedback, transfer and mobile snapshots lack independently approved premium references.',
 'Science sources: Alberta Science 24 program; PHAC respiratory transmission guidance; MedlinePlus inheritance-risk assessment; OpenStax Physics impulse. Complete links and coverage limits are in CORRECTIONS.md and CURRICULUM_TASK_MAP.md.',
 'Suggested review sequence: read evidence; solve transfer independently; inspect supported and reduced-support tasks; test revision/back navigation/restart; review all six explanations and acceptable alternatives; record judgment and required revisions; approve only the reviewed candidate.',
 'Use the accessible text alternative if your PDF viewer does not support form controls. Save a copy of the completed form. All decision fields default to Not reviewed; approval records default to pending.'
]:y=para(s,y)-20
c.save()
reader=PdfReader(str(PDF));found=reader.get_fields();assert set(found)==set(fields),(len(found),len(fields));assert len(reader.pages)==10
widgets=sum(len(p.get('/Annots',[])) for p in reader.pages);assert widgets==len(fields),(widgets,len(fields))
for p in reader.pages:
 for ref in p.get('/Annots',[]):
  a=ref.get_object();x0,y0,x1,y1=a['/Rect'];assert 0<=x0<x1<=W and 38<=y0<y1<=H-150
for name,f in found.items():assert str(f.get('/V','')) in ('','Not reviewed'),name
# Synthetic fill of every field in a scratch document. The delivered form remains unsigned.
writer=PdfWriter();writer.append(reader);samples={name:('Revise' if name.endswith('decision') else 'Supported' if name.endswith(('science','curriculum')) else 'Synthetic QA value') for name in fields}
for page in writer.pages:
 if page.get('/Annots'):writer.update_page_form_field_values(page,samples,auto_regenerate=False)
scratch=OUT/'synthetic-form-check.pdf';writer.write(scratch);filled=PdfReader(str(scratch));reopened=filled.get_fields();assert all(str(reopened[n].get('/V',''))==v for n,v in samples.items())
for page in filled.pages:
 for ref in page.get('/Annots',[]):
  widget=ref.get_object();assert str(widget.get('/V',''))==samples[str(widget['/T'])];assert widget.get('/AP',{}).get('/N')
scratch.unlink()
form_text='SCIENCE 24 TEACHER REVIEW - UNSIGNED\n\n'+'\n\n'.join(text)+'\n\nManual checks: native 200% browser zoom / screen reader / Safari / Firefox / physical device: Not tested unless the reviewer records otherwise.\nTeacher decisions: pending. Any substantive change requires new candidate identity and affected re-review.\n'
(OUT/'TEACHER_REVIEW_TEXT.txt').write_text(form_text)
(OUT/'validation/pdf-form-verification.json').write_text(json.dumps({'pages':10,'fields':len(fields),'widgets':widgets,'fieldWidgetParity':'passed','allFieldsInsidePage':'passed','unsignedDefaults':'passed','syntheticFillAndReopenAllFields':'passed','visualInspection':'Required after rendering'},indent=2)+'\n')
print('Fillable PDF verified:',len(fields),'fields, 10 pages; render inspection still required.')
