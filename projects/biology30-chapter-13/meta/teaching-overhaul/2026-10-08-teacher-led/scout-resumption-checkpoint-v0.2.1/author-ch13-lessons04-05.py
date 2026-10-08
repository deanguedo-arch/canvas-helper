"""Bounded teaching repairs: retain native outer tags, figures and all practice bytes."""
from pathlib import Path
import re, json, hashlib, shutil

ROOT=Path(__file__).resolve().parent
BEFORE=ROOT/'comparison/ch13-teacher-pass-v0.2.0'
OUT=ROOT/'comparison/ch13-teacher-pass-v0.2.1'
sha=lambda b:hashlib.sha256(b).hexdigest()
if OUT.exists():
    assert not (OUT/'LESSONS04_05_RECEIPT.json').exists(), 'Refuse to replace a completed candidate'
    shutil.rmtree(OUT)  # Only this script's failed, unpublished assembly.
shutil.copytree(BEFORE,OUT,symlinks=True)
original=(BEFORE/'new/index.html').read_text()
t=original

def term(key,label):
    return f'<button type="button" class="bio-term" data-term-id="ch13-word-{key}">{label}</button>'
H=term('hypothalamus','hypothalamus'); A=term('anterior-pituitary','anterior pituitary'); P=term('posterior-pituitary','posterior pituitary')
O=term('oxytocin','oxytocin'); PR=term('prolactin','prolactin'); GH=term('human-growth-hormone','human growth hormone'); GF=term('growth-factor','growth factor'); GP=term('growth-plate','growth plate')

replacements={
4:[
f'''<h2>One pituitary, two different routes</h2>
<p>A hormone's production site and its release site can be different. To see why, start with the pituitary: a small gland attached below the {H} at the base of the brain. Its front lobe is the {A}; its back lobe is the {P}. The hypothalamus regulates both, but the two connections carry different things.</p>
<p>Recall the last lesson's control pathway: information about the body leads to a signal, and responsive cells carry out an effect. Here the hypothalamus links nervous information to endocrine activity. Some pituitary hormones stimulate other endocrine glands, so the pituitary is often called the “master gland.” That name describes its influence; it does not mean the pituitary works independently of the hypothalamus.</p>
{{FIGURES}}
<p><strong>Read the two routes in the figure.</strong> At the posterior lobe, trace the long neuronal axons down from the hypothalamus: hormones made above travel along these axons to endings below. At the anterior lobe, trace the small connecting blood vessels: hypothalamic regulatory hormones travel in this blood to different cells, which make their own hormones. The arrows leaving the lobes then show release into general circulation and delivery to targets.</p>
<p>Keep three questions separate as you follow either route: <strong>Where is the hormone made? How does it reach its release site? Where does it enter the general bloodstream?</strong> We can now answer each question instead of memorizing “pituitary” as one undifferentiated location.</p>''',
f'''<h2>The anterior route: one hormone regulates another gland</h2>
<p>The hypothalamus makes regulatory hormones and releases them into a small blood-vessel network called the {term('portal-system','portal system')}. “Portal” here means that this connecting blood carries the signal from the hypothalamus to the anterior pituitary before it enters the wider circulation. It is a blood route, not an axon carrying stored ADH.</p>
<p>When an appropriate regulatory signal reaches responsive anterior-pituitary cells, it changes their {term('hormone','hormone')} production or release. Releasing signals can stimulate; inhibiting signals can reduce release. The {A} itself makes hGH, {PR}, TSH, {term('acth','ACTH')}, {term('fsh','FSH')} and {term('lh','LH')}. These anterior-pituitary hormones then enter the general bloodstream. The hypothalamic signal and the anterior-pituitary hormone are separate chemical messengers.</p>
<p>For example, follow <strong>hypothalamic signal → portal blood → anterior-pituitary cells → TSH in general blood → thyroid</strong>. TSH stimulates thyroid-hormone secretion. TSH is a {term('tropic-hormone','tropic hormone')} because its target is another {term('endocrine-gland','endocrine gland')}. ACTH's cortisol pathway is another example: ACTH reaches the adrenal cortex and stimulates cortisol secretion. Naming both the target and its response explains what the tropic signal accomplishes.</p>
<p>Other anterior-pituitary effects are different. Prolactin supports milk production in mammary glands; hGH affects growth and metabolism, including through liver growth factors. Do not infer that every hormone released from the same lobe has the same target or function.</p>''',
f'''<h2>The posterior route: made above, stored and released below</h2>
<p>ADH and {O} are made by neurons in the {H}. A neuron has a cell body and a long axon. The hormone molecules travel down those axons to nerve endings within the {P}, where they are stored. When appropriate neural signals arrive, the endings release the stored hormone into blood. This lobe is a release site for these hormones, rather than the site that synthesizes them.</p>
<p>Read the route aloud: <strong>hypothalamic neuron makes ADH → ADH moves along its axon → ADH is stored in posterior-pituitary nerve endings → ADH is released into blood → responsive kidney tissue changes water handling.</strong> Oxytocin uses the same production-and-release arrangement, but its effects include uterine contractions and milk ejection. A shared route does not make ADH and oxytocin interchangeable.</p>
<p>Compare the routes before moving on. In the anterior route, a hypothalamic hormone travels through <strong>portal blood</strong> to cells that make a second hormone. In the posterior route, a hormone made in a hypothalamic neuron travels along an <strong>axon</strong> to its own release site. Thus “ADH is released from the posterior pituitary” is correct, while “ADH is made by the posterior pituitary” confuses two different steps.</p>
<p><strong>Try explaining this without looking back:</strong> a sample taken just as ADH enters general blood identifies the release location. Does that observation alone identify where ADH was synthesized? Trace the earlier steps before checking the worked example.</p>''',
f'''<h2>Use the target and effect to distinguish hormones</h2>
<p>The table collects the major pituitary hormones. Read each row as a short sentence: <strong>release site → named hormone → target → response</strong>. For the posterior rows, add “made in the hypothalamus” before the listed release site. For the anterior rows, the lobe makes as well as releases the hormone.</p>
{{TABLE}}
<p>The reproductive hormones will be developed further in Unit B. For now, {term('fsh','FSH')} supports ovarian follicle and egg-cell development and sperm production in the testes. {term('lh','LH')} supports ovulation and sex-hormone production in the ovaries and testosterone production in the testes. Both act on the gonads, but they do different jobs.</p>
<p>Milk provides a useful comparison. {term('prolactin','Prolactin')} from the anterior pituitary stimulates <strong>milk production</strong>: mammary tissue makes milk. {term('oxytocin','Oxytocin')} made in the hypothalamus and released from the posterior pituitary stimulates <strong>milk ejection</strong>: contraction around milk-producing structures moves existing milk toward the ducts. Making a product and moving that product are separate operations, even in the same organ.</p>
<p>A common wrong path is to choose a hormone merely because the target is “mammary glands.” Instead, identify the action in the question. If it asks about making milk, follow prolactin. If it asks about releasing milk already made, follow oxytocin. The target helps narrow the pathway; the stated effect distinguishes the two hormones.</p>''',
'''<p class="section-label">Worked examples</p><h3>Trace the route, then answer the exact question</h3>
<p><strong>Example 1.</strong> A diagram shows a hormone made in a hypothalamic neuron, carried down its axon and released into blood beside the posterior pituitary. The hormone then affects water handling in the kidneys. Identify the hormone and explain whether the posterior pituitary made it.</p>
<ol><li><strong>Identify the target effect.</strong> Kidney water regulation points to ADH in the pathway taught here. The production-and-release route alone would also fit oxytocin, so the effect matters.</li><li><strong>Locate production.</strong> The case states that the molecule is made in a hypothalamic neuron. That is its synthesis site; passing through the posterior pituitary does not move the synthesis step.</li><li><strong>Trace transport and release.</strong> ADH moves down the axon, is stored at the nerve ending, and is released into general blood from the posterior pituitary.</li><li><strong>Write a complete conclusion.</strong> ADH is made in the hypothalamus and released from the posterior pituitary. Saying only “pituitary” loses the distinction the question asks us to explain.</li></ol>
<p><strong>Example 2.</strong> In a simplified lactation case, milk has already been produced, but the question asks which hormone helps eject that milk. A student selects prolactin because it acts on mammary glands. Evaluate the reasoning.</p>
<ol><li><strong>Separate the actions.</strong> “Already produced” tells us that making milk is not the step being asked about. The relevant step is moving stored milk out.</li><li><strong>Match the effect.</strong> Prolactin supports production. Oxytocin promotes milk ejection through contraction around the milk-producing structures. Therefore oxytocin fits the stated action.</li><li><strong>Confirm the route.</strong> Oxytocin is made in hypothalamic neurons, carried down axons and released from the posterior pituitary; prolactin is made and released by anterior-pituitary cells.</li><li><strong>Explain the error.</strong> The student used a shared target to infer a shared function. A stronger answer names the effect and the correct release pathway. This classroom case does not establish a diagnosis or treatment.</li></ol>
<p>Now try the guided questions with the figure closed. For each choice, name the route or action that makes it fit, rather than relying on a familiar hormone name.</p>'''
],
5:[
f'''<h2>Growth requires a signal and responsive tissue</h2>
<p>Two people can have excess growth hormone yet show different growth patterns. To explain that observation, we need both the signal and the condition of its target tissue. Start with the normal pathway: {GH}, or hGH, is made and released by the {A}. Its effects include growth and changes in how the body uses stored fuel.</p>
<p>Growth requires cells to make materials and increase in number. <strong>Protein synthesis</strong> means building proteins; proteins contribute to cell structures and functions. <strong>Cell division</strong> increases cell number. Together, these processes support growth in responsive cartilage, bone and muscle. hGH also helps mobilize stored fat, making fuel available. Hormone molecules supply a regulatory signal; they do not themselves turn into new bone or muscle.</p>
{{FIGURES}}
<p>Read the original pathway figure in two passes. First, locate hGH released from the anterior pituitary and its effects on responsive tissues. Then follow the route through the liver: hGH stimulates liver cells to release growth factors, which act on other tissues. A {GF} is another signalling molecule that supports growth or cell division. It is not a piece of bone carried in blood.</p>
<p>Draw the indirect route as <strong>anterior pituitary → hGH → liver → growth factors → responding tissues</strong>. The arrow from hGH to the liver means stimulation; the next arrow represents a different messenger. In a direct effect, hGH acts on responsive tissue itself, for example to change fuel use. In an indirect effect, that tissue responds to the intervening growth-factor signal. The distinction is the extra signalling step, not whether blood is involved.</p>''',
f'''<h2>An open growth plate allows a long bone to lengthen</h2>
<p>A {GP} is a cartilage region near the end of a growing long bone. While this region remains open, cartilage growth and its replacement by bone allow the long bone to increase in length. This contributes to increasing height. Childhood and adolescence are useful general clues, but <strong>growth-plate status</strong> is the biological condition that matters in a case.</p>
<p>If excess hGH drives excessive growth while the plates are open, long bones can lengthen excessively. The resulting pattern is called {term('gigantism','gigantism')}. Follow the reasoning: <strong>excess growth signal + open growth plates → excessive lengthening of long bones → excessive linear growth and height</strong>. Naming “high hGH” alone leaves out the tissue condition that permits that result.</p>
{{COMPANION}}
<p>In the left half of the comparison, find the cartilage band and the arrow showing lengthening. The right half shows a fused plate. Compare the same location in both panels; this is a simplified view of the tissue condition, not a measurement of a person's hormone level or an anatomical scale drawing.</p>
<p>Insufficient hGH during childhood can limit growth while plates are open and produce proportionate short stature. The textbook uses the older term “pituitary dwarfism” for this pattern. Short stature itself has many possible causes; it is not proof of insufficient hGH. In this lesson, use a stated hormone deficit as evidence rather than assigning a cause from someone's appearance.</p>''',
f'''<h2>Plate closure changes the possible response</h2>
<p>After a growth plate closes, it no longer provides the same route for long-bone lengthening. Excess hGH therefore does <strong>not</strong> restart that route and increase height in the standard closed-plate model. But closure does not stop every tissue from responding to growth signals.</p>
<p>Bones and soft tissues can thicken or enlarge, including tissues in the hands, feet and face. Excess hGH after growth-plate closure is associated with {term('acromegaly','acromegaly')}. Read the right-hand image with its caption: the plate is fused, and enlargement can occur without an increase in long-bone length or height. The visual comparison isolates one important difference; it does not show every physiological effect of excess hGH.</p>
<p>Compare the two causal chains: <strong>open plate → lengthening remains possible → excess hGH can produce gigantism</strong>; <strong>closed plate → that lengthening route is unavailable → excess hGH can produce bone and soft-tissue enlargement associated with acromegaly</strong>. The hormone has not changed its identity. The target tissue's condition changes which outcome it can produce.</p>
<p>A common wrong answer is “closed plates mean no growth-hormone effects.” That confuses growth in length with every form of growth and every metabolic response. Another is “all excess hGH produces gigantism.” Before naming an outcome, check whether the case supplies the plate condition.</p>''',
f'''<h2>Reason from the evidence rather than a symptom alone</h2>
<p>Slow growth is an observation. It does not identify a missing {term('hormone','hormone')}. hGH is one regulator of growth; thyroid hormones also support growth and development. If a case specifically identifies low thyroid hormone but provides no evidence of low hGH, the stated signal problem is in the thyroid pathway.</p>
<p>Why would simply naming hGH fail to explain that case? Different hormones act through different receptor and response pathways. Increasing one signal does not automatically replace the action of another. Trace the stated disturbance to its own target response before considering what evidence would be needed to explain it. This is biological reasoning, not advice to choose a treatment.</p>
<p>The textbook's p. 447 investigation asks students to evaluate uses of synthetic hGH. Its prices, approvals and sport-testing statements describe the source's publication period; they are not a current policy guide. You can practise evaluating evidence by separating a demonstrated deficiency from a proposed enhancement, then asking about benefits, harms and the strength of the evidence. A growth effect alone does not establish that an intervention is appropriate.</p>
<p>For the required check, build explanations from <strong>source and signal → direct or indirect route → responsive tissue and its condition → expected effect</strong>. That sequence supports both the growth-plate comparison and the hGH/liver comparison without relying on the optional reading.</p>''',
'''<p class="section-label">Worked examples</p><h3>Use the pathway and the tissue condition</h3>
<p><strong>Example 1.</strong> Two fictional classroom cases have confirmed excess hGH. Case A has open growth plates and unusually rapid increases in long-bone length. Case B has fused plates, stable height and increasing enlargement of hands and feet. Explain why the outcomes differ.</p>
<ol><li><strong>Hold the shared cause constant.</strong> Both cases state excess hGH. Choosing a different hormone for Case B would contradict the information.</li><li><strong>Identify the differing condition.</strong> A's plates are open; B's are fused. That difference tells us whether the long bones can continue lengthening through the growth plates.</li><li><strong>Explain Case A.</strong> The excessive growth signal acts while the lengthening route is available. Excessive linear growth fits gigantism.</li><li><strong>Explain Case B.</strong> Plate closure prevents the same height increase. Bone and soft-tissue enlargement remains possible, so the stated pattern fits acromegaly.</li><li><strong>Write the comparison.</strong> Excess hGH can produce different outcomes because open and closed growth plates permit different responses. We used the supplied hormone and tissue evidence; these fictional cases are not a way to diagnose someone from height or hand size.</li></ol>
<p><strong>Example 2.</strong> A pathway shows hGH changing fuel use in a responsive tissue. A second pathway shows hGH stimulating the liver to release growth factors that then support growth in bone and cartilage. Which pathway is indirect, and why?</p>
<ol><li><strong>Locate the first messenger.</strong> Both start with hGH from the anterior pituitary. The shared source does not decide whether the final effect is direct.</li><li><strong>Count the signalling steps.</strong> In the fuel-use pathway, the responding tissue receives hGH itself. That is a direct effect of hGH in the simplified comparison.</li><li><strong>Identify the intermediate.</strong> In the other pathway, hGH first stimulates liver cells. The liver releases a different messenger—growth factors—which reaches the tissues that grow.</li><li><strong>Explain the label.</strong> The bone and cartilage response is an indirect effect of hGH because an intervening liver growth-factor signal connects hGH to that response. hGH is neither converted into bone nor stored as glycogen.</li></ol>
<p>Before opening the practice feedback, explain which fact in each question identifies the route or the plate condition. Then compare your reasoning with the feedback.</p>'''
]
}

receipt={'schemaVersion':1,'canonicalIntegrated':False,'teacherAccepted':False,'beforeSha256':sha(original.encode()),'lessons':[]}
for n,contents in replacements.items():
    start=t.index(f'<section class="course-page" id="lesson-{n:02}"');end=t.index(f'<section class="course-page" id="lesson-{n+1:02}"',start)
    section=t[start:end]
    first=section.index(f'<div class="content-section" data-canvas-edit-key="ch13-l{n:02}-teaching-01"')
    last=section.index('<section class="content-section" data-guided=',first)
    before=section[first:last]
    # Outer blocks are direct siblings; preserve their opening tags and IDs exactly.
    tags=re.findall(r'<div class="(?:content-section|worked-example)"[^>]*>',before)
    tags=[tag for tag in tags if re.search(r'(?:-teaching-\d\d|-worked)"',tag)]
    assert len(tags)==5,(n,tags)
    figures=re.findall(r'<figure\b[\s\S]*?</figure>',before)
    table=re.search(r'<div class="comparison-table">[\s\S]*?</table></div>',before)
    blocks=[]
    for i,content in enumerate(contents):
        content=content.replace('{FIGURES}',figures[0]).replace('{TABLE}',table[0] if table else '').replace('{COMPANION}',figures[1] if len(figures)>1 else '')
        blocks.append(tags[i]+content+'</div>')
    fragment='\n'.join(blocks)
    assert all(f in fragment for f in figures)
    assert set(re.findall('data-term-id="([^"]+)"',before))<=set(re.findall('data-term-id="([^"]+)"',fragment))
    assert not re.search(r'<(?:input|textarea|select|script|style|iframe)\b|\son\w+\s*=',fragment,re.I)
    section=section[:first]+fragment+section[last:]
    if n==4:
        assert section.count('Chapter 13 · p. 440')==1
        section=section.replace('Chapter 13 · p. 440','Chapter 13 · pp. 444–445',1).replace('data-open-pdf="440">Open at p. 440','data-open-pdf="444">Open at p. 444',1)
    t=t[:start]+section+t[end:]
    (OUT/f'lesson-{n:02}.fragment.html').write_text(fragment)
    receipt['lessons'].append({'lessonId':f'lesson-{n:02}','oldTeachingSha256':sha(before.encode()),'newTeachingSha256':sha(fragment.encode()),'originalFiguresExact':True,'protectedPracticeAndAssessmentExact':True,'sources':{'textbookPrintedPages':[444,445,446,447],'teacherSlides':list(range(14,20))+[24]},'instructionalReview':'author source-and-practice trace complete; fresh blind learner review pending','browserVerified':False})

# All assessment runtime data and form controls, including protected question text, remain byte-identical.
for n in [4,5]:
    def protected(s):
        a=s.index(f'<section class="course-page" id="lesson-{n:02}"');b=s.index(f'<section class="course-page" id="lesson-{n+1:02}"',a)
        z=s[a:b];return z[z.index('<section class="content-section" data-guided='):]
    assert protected(original)==protected(t),n
assert re.findall(r'<(?:input|textarea|select|script)\b[^>]*>',original)==re.findall(r'<(?:input|textarea|select|script)\b[^>]*>',t)
assert re.findall(r'<figure\b[\s\S]*?</figure>',original)==re.findall(r'<figure\b[\s\S]*?</figure>',t)
# Reverse known bounded lesson deltas and prove every other route/data byte unchanged.
recovered=t
for n in [4,5]:
    def route(s):
        a=s.index(f'<section class="course-page" id="lesson-{n:02}"');b=s.index(f'<section class="course-page" id="lesson-{n+1:02}"',a);return s[a:b]
    recovered=recovered.replace(route(t),route(original),1)
assert recovered==original
(OUT/'new/index.html').write_text(t)
receipt.update(candidateSha256=sha(t.encode()),outsideAffectedRoutesExact=True,runtimeUnchanged=True,completedChapter=False,nextUnfinishedLesson='lesson-06')
(OUT/'LESSONS04_05_RECEIPT.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(receipt,indent=2))
