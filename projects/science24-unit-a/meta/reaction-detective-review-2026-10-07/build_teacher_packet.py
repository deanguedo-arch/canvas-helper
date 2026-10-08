from pathlib import Path
import hashlib, json, subprocess
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont("ReviewSans", "/System/Library/Fonts/Supplemental/Arial.ttf"))
pdfmetrics.registerFont(TTFont("ReviewSansBold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))

ROOT = Path(__file__).resolve().parent
DATA = json.loads(subprocess.check_output(['node', '-e', 'console.log(JSON.stringify(require(process.argv[1])))', str(ROOT/'validation/game/scenarios.js')]))
EVIDENCE = json.loads((ROOT/'independent-validation.json').read_text())
PLAY_HASH = hashlib.sha256((ROOT/'validation/PLAY.html').read_bytes()).hexdigest()
OUT = ROOT/'output/pdf/Reaction_Detective_Teacher_Review.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
C = canvas.Canvas(str(OUT), pagesize=(612, 792))
C.setTitle('Reaction Detective 1.2.0 - Teacher review and acceptance')
C.setAuthor('Next Step - review packet prepared by Codex')
GREEN = HexColor('#1a4026')
INK = HexColor('#17221b')
GRAY = HexColor('#526158')
LINE = HexColor('#cbd6cd')
STYLE = ParagraphStyle('body', fontName='ReviewSans', fontSize=10, leading=14, textColor=INK, alignment=TA_LEFT)
SMALL = ParagraphStyle('small', parent=STYLE, fontSize=9, leading=12)
Y = 0
PAGE = 0
FIELDS = []

def clean(value):
    return str(value).replace('\u2014', ' - ').replace('\u2013', '-').replace('\u2011', '-').replace('\u2192', ' to ').replace('₂', '2').replace('°', ' degrees ').replace('’', "'")

def para(text, small=False, gap=7):
    global Y
    p = Paragraph(escape(clean(text)).replace('\n', '<br/>'), SMALL if small else STYLE)
    _, h = p.wrap(508, 700)
    if Y-h < 58:
        raise RuntimeError(f'Page {PAGE} overflow near: {text[:70]}')
    p.drawOn(C, 52, Y-h)
    Y -= h+gap

def heading(text):
    global Y
    Y -= 6
    C.setFont('ReviewSansBold', 11)
    C.setFillColor(GREEN)
    C.drawString(52, Y, clean(text))
    Y -= 19

def page(title, subtitle):
    global PAGE, Y
    if PAGE:
        C.showPage()
    PAGE += 1
    C.setFillColor(GREEN)
    C.rect(0, 732, 612, 60, fill=1, stroke=0)
    C.setFillColor(white)
    C.setFont('ReviewSansBold', 18)
    C.drawString(52, 759, clean(title))
    C.setFont('ReviewSans', 9)
    C.drawString(52, 742, clean(subtitle))
    C.setFillColor(GRAY)
    C.setFont('ReviewSans', 8)
    C.drawString(52, 31, 'Reaction Detective 1.2.0 | Optional Unit A practice | Teacher decision pending')
    C.drawRightString(560, 31, f'{PAGE} / 10')
    Y = 711

def choice(name, label, x=52, y=None, width=220, options=None):
    global Y
    if y is None:
        C.setFillColor(INK); C.setFont('ReviewSansBold', 9)
        C.drawString(x, Y, label); Y -= 28; y=Y
    C.acroForm.choice(name=name, tooltip=label, x=x, y=y, width=width, height=22,
                     options=options or ['Unreviewed', 'Accept', 'Changes required'],
                     value='Unreviewed', fontName='Helvetica', fontSize=9,
                     borderColor=LINE, fillColor=white, textColor=INK, fieldFlags='combo')
    FIELDS.append(name)

def textfield(name, label, x=52, y=None, width=508, height=40, multiline=True):
    global Y
    automatic = y is None
    if automatic:
        C.setFillColor(INK); C.setFont('ReviewSansBold', 9)
        C.drawString(x, Y, label); Y -= height+8; y=Y
    C.acroForm.textfield(name=name, tooltip=label, x=x, y=y, width=width, height=height,
                        fontName='Helvetica', fontSize=10, borderColor=LINE, fillColor=white,
                        textColor=INK, value='', fieldFlags='multiline' if multiline else '')
    FIELDS.append(name)
    if automatic:
        Y = y - 20

page('Teacher review and acceptance', 'SCIENCE 24 | A1 REACTION DETECTIVE | Prepared October 7, 2026')
heading('What you are reviewing')
para('A fixed standalone v1.2.0 candidate: one worked example, four practice cases, and one independent transfer. Proposed use is optional Unit A formative practice. It carries no course grade or required-progress credit.')
para('Teacher approval is requested for scientific accuracy, selected curriculum alignment, answer fairness, reading demands and instructional suitability. Approval here does not certify the entire course, accessibility, hosting, SCORM or Brightspace behavior.')
heading('Open and review')
para('1. Extract the review ZIP. Open PLAY.html in your browser; it is self-contained and works without an Internet connection. If local HTML is restricted, use the game/ folder through your approved local/static host.')
para('2. Play the worked example and all five learner tasks. Try a misconception, revise it, use Previous, and inspect your review. Avoid real student information while reviewing.')
para('3. Compare your reasoning with the complete records and answer rules on pages 3-8. Mark the decisions and comments. Complete the checklist and version-specific acceptance on pages 9-10.')
heading('Identity and approval boundary')
para('Version: 1.2.0. Candidate identity: SHA-256 of PLAY.html (full value below). Any change to science, answer rules, feedback or learner behavior requires affected-area re-review and a newly identified candidate.')
para(PLAY_HASH, small=True)
heading('Important limits for learners')
para('Work remains in memory. Reloading or closing the page clears the session. Previous preserves work only within that session. Print your review is available. No answers are sent to a teacher or LMS.')
para('Structured choices are checked. Written explanations are submitted and self-reviewed; neither text length nor four checked rubric boxes establishes scientific correctness. Completion is not mastery.')
heading('Decision remains with the teacher')
para('All decision fields are unreviewed. Type comments into the PDF and save a copy, or print and write on it. A typed acknowledgement is a review record, not a cryptographic digital signature. Return the PDF and any marked defects to Dean.')

page('Curriculum and evidence boundaries', 'Teacher review focus | Evidence current as of October 7, 2026')
heading('Selected alignment - independently checked against the published program')
for t in [
    'General outcome 2, pp.31-32: evidence, reactant/product comparison and reaction classification. All cases support parts of this; W01 demonstrates decomposition.',
    'General outcome 4, p.32: everyday acid-base applications, corrosion protection and combustion emissions. P03, P02 and P04 respectively address selected examples.',
    'Analyzing/interpreting and communication, p.33: evidence-supported conclusions and explanation. Authored records rehearse parts of these skills; students do not perform a real experiment.'
]: para(t)
para('Primary source: Alberta Education, Science 14-24 Program of Studies (2003, updated 2014), Science 24 Unit A, printed/PDF pp.31-33.\nhttps://education.alberta.ca/media/159714/sc1424.pdf', small=True)
para('Mapping is a scoped interpretation for teacher confirmation. Formula naming, equation balancing, independent composition/decomposition assessment, real laboratory/WHMIS skills and the full range of emission controls are not established by this game.')
heading('Independent local technical checks')
for entry in EVIDENCE['summary']:
    para(entry, small=True)
heading('Checks still separate from this teacher decision')
for t in EVIDENCE['pending']:
    para(t, small=True)
heading('Acceptance questions needing particular scrutiny')
para('Is corrosion the appropriate checked label rather than allowing composition? Is acid-carbonate / neutralization appropriate class terminology? Are exact evidence pairs fair? Does the uncertainty follow-up teach limits without rewarding avoidance? Are the mandatory rubric checks useful rather than mechanical?', small=True)
para('Detailed scientific rationales and reference links: docs/SCIENCE_AND_SCOPE.md. Detailed raw results and test-method limits: independent-validation.json and evidence/. Teacher suitability and learning effectiveness remain unapproved.', small=True)

for s in DATA['scenarios']:
    page(f"{s['id']} - {s['title']}", 'Worked example' if s['stage']=='worked' else 'Independent transfer' if s['stage']=='transfer' else s['scaffold'])
    heading('Learner situation and observations')
    para(s['caseText'])
    para(' | '.join(f'{a}: {b}' for a,b in s['base']), small=True)
    if s['evidence']:
        heading('All supplied records (including initially hidden records)')
        for i, e in enumerate(s['evidence']):
            para(f"{chr(65+i)}. {e['label']} [{e['id']}]: {e['detail']}", small=True, gap=5)
    heading('Checked answer and evidence rules')
    para(f"Conclusion: {s['conclusion']}. Reaction target: {s['reaction']}.", small=True)
    if s.get('allowedPairs'):
        labels={e['id']:chr(65+i) for i,e in enumerate(s['evidence'])}
        para('Accepted pairs: '+ '; '.join(' + '.join(labels[e] for e in pair) for pair in s['allowedPairs'])+'. Exactly two selected revealed records are required.', small=True)
    if s['id']=='P01':
        para('Not enough evidence is accepted as an unfinished checkpoint only before the identity record has been seen. The free identity follow-up then requires a supported physical-change classification. Reopening does not erase previously seen identity evidence.', small=True)
    if s.get('application'):
        a=s['application'];para(a['prompt']+' Accepted: '+dict(a['options'])[a['answer']], small=True)
        para('Other options: '+'; '.join(label for key,label in a['options'] if key!=a['answer']), small=True)
    if s['stage']=='worked':
        para('Demonstration only; not independent performance. No learner answer is checked in this round.', small=True)
    if s['stage']=='transfer':
        para(s['prompt']+' No hints, tokens, artwork or pre-submission model. First complete response is retained separately from corrections and replay.', small=True)
    heading('Model explanation - comparison, not automated prose grading')
    para(s['model'], small=True)
    if s.get('hints'):
        para('Hint ladder: '+' / '.join(f'{i+1}. {h}' for i,h in enumerate(s['hints'])), small=True)
    if s.get('misconception'):
        para('Misconception feedback: '+s['misconception'], small=True)
    # Fixed comment region gives every case a consistent review surface.
    if Y < 165:
        raise RuntimeError(f'Case {s["id"]} content intrudes on review fields: {Y}')
    choice('case_'+s['id'], 'Case decision', y=120)
    C.setFillColor(INK); C.setFont('ReviewSansBold',9); C.drawString(52,151,'Case decision'); C.drawString(300,151,'Corrections / alternative answers / level concerns')
    textfield('notes_'+s['id'], 'Case comments', x=300, y=70, width=260, height=72)

page('Teacher audit checklist', 'Play the game and compare its rules with your intended learners and assessment demands')
criteria=[
    ('Science', 'Records, explanations and terminology are scientifically defensible.'),
    ('Alignment', 'Selected Unit A alignment and exclusions are accurate for the intended use.'),
    ('Answers', 'Accepted evidence pairs and rejected alternatives are fair and sufficient.'),
    ('Uncertainty', 'P01 limited-evidence checkpoint and identity follow-up are instructionally appropriate.'),
    ('Applications', 'Corrosion protection and combustion-emissions choices are suitable.'),
    ('Feedback', 'Incorrect-answer feedback diagnoses reasoning without creating misconceptions.'),
    ('Hints', 'Scaffold fading, sentence starters and hint timing suit the learners.'),
    ('Transfer', 'T01 is a useful narrow independent task; first response and corrections are distinguished.'),
    ('Writing', 'Explanation models/rubric help reasoning; automated prose correctness is never claimed.'),
    ('Usability', 'Reading level, visual clarity, navigation and student-facing session-loss notices are suitable.'),
    ('Safety', 'Fictional records do not invite hazardous real-world reproduction.'),
    ('Scope', 'Optional practice, no gradebook reporting and no reload save are acceptable for this use.')
]
for key,text in criteria:
    p=Paragraph(escape(text), SMALL);_,h=p.wrap(322,80);p.drawOn(C,52,Y-h)
    choice('check_'+key,text,x=393,y=Y-24,width=167,options=['Unreviewed','Accept','Changes required','Not applicable'])
    Y -= max(h,24)+17
heading('Overall findings / classroom adjustments')
textfield('overall_findings','Comments, accommodations or required changes',height=95)

page('Version-specific teacher acceptance', 'Complete only after review | Proposed use: optional Science 24 Unit A practice')
para('This record binds your decision to the candidate below. It does not authorize a different version, required course credit, gradebook reporting, production hosting or LMS release. Remaining technical/device checks must be resolved or explicitly accepted in the release decision.')
para('Version 1.2.0 | PLAY.html SHA-256:\n'+PLAY_HASH, small=True)
textfield('teacher_name','Reviewer name',height=22,multiline=False)
textfield('teacher_role','Teaching role / Science 24 experience',height=22,multiline=False)
textfield('teacher_school','School / organization',height=22,multiline=False)
textfield('review_date','Review date',height=22,multiline=False)
choice('overall_decision','Decision',width=350,options=['Unreviewed','Approved for stated optional-practice scope','Approved with conditions','Changes required'])
Y -= 18
textfield('conditions','Conditions / required changes / accessibility accommodations',height=75)
textfield('placement','Recommended lesson placement (teacher recommendation; integration pending)',height=34)
textfield('acknowledgement','Typed acknowledgement or handwritten signature',height=22,multiline=False)
Y -= 7
para('I reviewed the named candidate for science and instructional suitability within the stated scope. My conditions above must be reconciled before release. Any substantive revision returns affected areas for re-review.', small=True)
para('Return this saved PDF to Dean. Decision fields are intentionally unreviewed; no automated process may complete this acceptance on the teacher\'s behalf.', small=True)
C.save()
(ROOT/'pdf-fields.json').write_text(json.dumps(FIELDS,indent=2)+'\n')
print(f'Created {OUT} ({PAGE} pages; {len(FIELDS)} interactive fields)')
