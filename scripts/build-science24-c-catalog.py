"""Build Unit C's deterministic browser activity catalog from reviewed v2 seeds.

The learner prose lives in workspace/index.html. This script owns only
activity data and source page metadata.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "projects/science24-unit-c"
META = ROOT / "meta"
ASSETS = ROOT / "workspace/assets"
OUT = ROOT / "workspace/course-data.json"

def read(name):
    return json.loads((META / name).read_text())

mapping = read("source-task-map-v2.json")
lessons = [item for chapter in (9, 10, 11, 12)
           for item in read(f"chapter-{chapter:02d}-copy-v2.json")["lessons"]]
seeds = {key: rows for chapter in (9, 10, 11, 12)
         for key, rows in read(f"chapter-{chapter:02d}-questions-v2.json")["lessons"].items()}
assert len(lessons) == len(seeds) == 17
source_by_route = {item["route"]: item for item in mapping["teachingLessons"]}

data = dict(courseId="science24-unit-c-excellence-v2", contentVersion="2.0.0",
            topicId="s24-c", title="Disease Defence and Human Health",
            topics=[], vocabulary=[], banks={"multiple-choice": [], "fill-in-the-blanks": [], "practice": []},
            checks={}, resources=[json.loads((ASSETS / "textbook-page-index-v2.json").read_text())],
            bookQuestions=[], labeling=[], videos=[], calcActivities={}, notes={}, exercises={},
            transfer={}, supplementary=[
                dict(id="workbook", title="Unit C student workbook (2023)", pdf="assets/workbook.pdf"),
                dict(id="workbook-key", title="Unit C workbook key (2023): attempt questions before self-check", pdf="assets/workbook-key.pdf"),
                dict(id="guided-notes", title="Unit C guided notes", pdf="assets/guided-notes.pdf")], figures={})

roles = ["error", "guided1", "guided2", "independent1", "independent2", "required1", "required2"]
def question(row, lesson_number, role):
    stem, correct, *tail = row
    feedback = tail.pop()
    choices = [correct] + tail
    ident = f"s24-c-l{lesson_number:02d}-{role}"
    return dict(kind="mc", prompt=stem, hint="Identify the cause, pathway or evidence before selecting an answer.",
                explanation=feedback, id=ident, topic=f"{lesson_number:02d}",
                difficulty="Foundation" if role in ("error", "guided1") else "Application", role=role,
                options=[dict(id=f"{ident}-o{i}", text=choice) for i, choice in enumerate(choices)],
                answer=f"{ident}-o0")

for number, lesson in enumerate(lessons, 1):
    code = f"{number:02d}"
    route = f"lesson-{code}"
    assert lesson["route"] == route and len(seeds[code]) == 7
    data["topics"].append(dict(id=code, label=f"{number}. {lesson['title']}"))
    items = [question(row, number, role) for row, role in zip(seeds[code], roles)]
    for item in items[:5]:
        data["exercises"][item["id"]] = item
        data["banks"]["multiple-choice"].append(item)
    data["checks"][f"s24-c-required-{code}"] = dict(
        id=f"s24-c-required-{code}", title=f"{lesson['title']} · required check", route=route,
        questions=items[5:], writing=[
            dict(id=f"s24-c-l{code}-write1", prompt=lesson["transferPrompt"] + " Explain your evidence or steps."),
            dict(id=f"s24-c-l{code}-write2", prompt=lesson["laterPrompt"] + " Explain a relevant limit or condition.")])
    for suffix, title, prompt, model in (("transfer", "Use the idea in a new way", lesson["transferPrompt"], lesson["transferModel"]),
                                          ("later", "Check again later", lesson["laterPrompt"], lesson["laterModel"])):
        ident = f"s24-c-l{code}-{suffix}"
        data["notes"][ident] = dict(title=f"{lesson['title']} · {title}", prompt=prompt, model=model, route=route)
    for term, meaning, example, distinction in lesson["terms"]:
        slug = re.sub(r"[^a-z0-9]+", "-", term.lower()).strip("-")
        ident = f"s24-c-word-{slug}"
        if any(x["id"] == ident for x in data["vocabulary"]):
            ident += f"-{code}"
        data["vocabulary"].append(dict(id=ident, term=term, topic=code, meaning=meaning,
                                       example=example, distinction=distinction,
                                       model=dict(meaning=meaning, features=distinction, example=example,
                                                  nonexample=f"Using {term} for a different process without evidence.")))
        data["banks"]["fill-in-the-blanks"].append(dict(
            id=f"{ident}-blank", kind="text", topic=code, difficulty="Foundation", role="retrieval",
            prompt=f"Name the term: {meaning}", answers=[term], hint=example,
            explanation=f"{term}: {meaning} {distinction}"))
        data["banks"]["practice"].append(dict(
            id=f"{ident}-flash", kind="flash", topic=code, difficulty="Foundation",
            prompt=f"Explain {term} and give an example.", answer=f"{meaning} Example: {example}"))

pages = data["resources"][0]["pages"]
for lesson in lessons:
    source = source_by_route[lesson["route"]]
    number = int(lesson["route"].split("-")[-1])
    for printed in source["printedTextbookPages"]:
        if printed == 216:  # Figure-only Mendel page; reading stays in the page viewer.
            continue
        if any(q["printedPage"] == printed for q in data["bookQuestions"]):
            continue
        page = next(p for p in pages if p["printed"] == printed)
        if not re.search(r"(?:Check Your Understanding|Apply|Practice|Questions|Review)", page["text"], re.I):
            continue
        data["bookQuestions"].append(dict(
            id=f"s24-c-textbook-p{printed}-question-page", title=f"Original questions · p. {printed}",
            prompt="Answer the original question(s) on the displayed textbook page. Keep their printed numbers and lettered parts; use the surrounding text and figures.",
            resourceId="s24-c-textbook", printedPage=printed, physicalPage=page["physical"],
            topic=f"{number:02d}", image=page["image"], originalText=page["text"]))

# Original question pages remain available even where the lesson source range is short.
for printed in (162, 164, 165, 167, 169, 170, 180, 183, 184, 189, 222, 225):
    if any(q["printedPage"] == printed for q in data["bookQuestions"]):
        continue
    page = next(p for p in pages if p["printed"] == printed)
    lesson = next((i for i, s in enumerate(mapping["teachingLessons"], 1) if printed in s["printedTextbookPages"]), 17)
    data["bookQuestions"].append(dict(
        id=f"s24-c-textbook-p{printed}-question-page", title=f"Original questions · p. {printed}",
        prompt="Answer the original question(s) on the displayed textbook page. Keep their printed numbers and lettered parts; use the surrounding text and figures.",
        resourceId="s24-c-textbook", printedPage=printed, physicalPage=page["physical"],
        topic=f"{lesson:02d}", image=page["image"], originalText=page["text"]))
data["bookQuestions"].sort(key=lambda item: item["printedPage"])

review_cases = [
    (1, ["Several diners report illness after a shared meal. Which first claim is most defensible?", "Compare meals, symptom timing and organism evidence before naming a foodborne cause.", "Warm air alone proves a specific pathogen caused every case.", "One diner who stayed well proves the meal was safe.", "Every microorganism in the meal must be harmful.", "An investigation separates exposure, organism and alternative explanations."]),
    (4, ["A cooked food is placed on a board used for raw meat. What failure and control should be identified?", "Cross-contamination can transfer microorganisms; separate and clean food-contact surfaces.", "The cooked food is protected because cooking made the board sterile.", "Refrigeration will undo any contamination already transferred.", "A clean-looking board proves no microorganism remains.", "Cooking one item does not prevent later transfer from a contaminated surface."]),
    (6, ["A disease appears in several countries after local outbreaks. Which description avoids treating a label as a cause?", "Describe the extent and time pattern as pandemic spread, then investigate the pathogen and route separately.", "The word pandemic identifies the exact organism.", "International spread proves every exposed person is ill.", "An epidemic can only occur in one household.", "Outbreak scale describes distribution; it does not explain mechanism."]),
    (8, ["A community water alert follows missed test results. Which response addresses the system?", "Follow current public advice while investigators check treatment, sampling, reporting and corrective action.", "Assume clear-looking water is safe without testing.", "Treat one household's boiling as proof the treatment plant worked.", "Ignore monitoring because filtration is always sufficient.", "The Walkerton case illustrates why multiple controls and reliable reporting matter."]),
    (10, ["A student has a red, warm cut and later makes a targeted antibody response. Which comparison is accurate?", "Inflammation is a broad response; antibodies recognize particular targets.", "Inflammation proves a specific antibody already exists.", "Antibodies are the skin barrier before entry.", "Both responses require antibiotics to begin.", "Innate inflammation and adaptive specificity play different roles."]),
    (12, ["A viral illness spreads while someone takes an antibiotic for a separate bacterial infection. What should the course explanation say?", "An antibiotic targets bacteria and does not directly stop viral replication; treatment decisions need clinical guidance.", "The antibiotic automatically cures any virus in the body.", "The person becomes resistant rather than bacteria.", "All fever proves a bacterial cause.", "Cause and treatment mechanism must be matched; do not infer a personal prescription."]),
    (14, ["A Tt × tt model has two Tt and two tt boxes. Which interpretation is justified?", "Each offspring has a one-half model probability of each genotype under the stated assumptions.", "The next four offspring must include exactly two of each genotype.", "The model proves a real human eye colour outcome.", "The t allele disappears whenever T is present.", "Punnett boxes describe chances in a specified one-gene model, not guaranteed family counts."]),
    (15, ["The supplied pedigree shows affected and unaffected relatives but no unaffected couple with an affected child. What can be concluded?", "Test more than one simple inheritance model; the chart alone does not prove the workbook key's recessive claim.", "The recessive claim is proven by an unaffected couple with an affected child shown in the chart.", "The chart proves every relative's genotype.", "Shading identifies the pathogen that caused the trait.", "A limited pedigree can fit multiple models; the key cites a pattern absent from the supplied figure."])]
review_questions = []
for index, (lesson_number, source) in enumerate(review_cases, 1):
    item = question(source, lesson_number, f"review{index}")
    item["id"] = f"s24-c-review-q{index}"
    item["options"] = [dict(id=f"{item['id']}-o{i}", text=o["text"]) for i, o in enumerate(item["options"])]
    item["answer"] = f"{item['id']}-o0"
    item["topic"] = "18"
    review_questions.append(item)
data["checks"]["s24-c-final"] = dict(
    id="s24-c-final", title="Unit C integrated review · required final check", route="lesson-18",
    questions=review_questions, writing=[
        dict(id="s24-c-review-write1", prompt="Trace a communicable disease pathway from exposure to response. Explain an individual action and a public-health action, with evidence and limits."),
        dict(id="s24-c-review-write2", prompt="Explain how an inherited allele can affect a trait while environment and uncertainty still matter. Use one accurate inheritance model and identify its limits.")])
data["transfer"] = dict(id="s24-c-transfer-review", title="Independent application: a community health case",
                        questions=[question(seeds[f"{n:02d}"][4], n, f"transfer{i}") for i, n in enumerate((2, 8, 15), 1)],
                        writing=[dict(id="s24-c-transfer-writing", prompt="A school faces a foodborne illness concern and a family asks about inherited risk. Separate the evidence and response for each situation.")])

label_specs = [
    ("transmission", "Trace an infection pathway", "Match source, exit, transfer and entry in the infection pathway.",
     ["Infected source", "Exit route", "Transfer route", "Entry route"], ["source", "exit", "transfer", "entry"], "02"),
    ("water", "Trace a community water safeguard", "Match intake, treatment, monitoring and household delivery.",
     ["Water intake", "Treatment", "Monitoring", "Household tap"], ["intake", "treatment", "monitor", "delivery"], "07"),
    ("immune", "Trace a targeted immune response", "Match the entering antigen, recognition, response and memory.",
     ["Antigen", "Recognition", "Response", "Memory"], ["antigen", "recognition", "response", "memory"], "10"),
    ("punnett", "Read a Tt × tt cross", "Identify parent gametes, the four combinations and the genotype tally.",
     ["T or t gamete", "t gamete", "Tt and tt cells", "2 Tt : 2 tt"], ["parent1", "parent2", "cells", "tally"], "14")]
for slug, title, prompt, labels, answers, topic in label_specs:
    data["labeling"].append(dict(id=f"s24-c-label-{slug}", title=title, prompt=prompt,
        image=f"assets/{slug}-diagram.svg", topic=topic,
        values=[dict(letter=letter, value=label, answer=answer)
                for letter, label, answer in zip("ABCD", labels, answers)],
        options=[dict(id=answer, text=label) for label, answer in zip(labels, answers)],
        visualDescription=prompt + " Four labeled positions A through D are shown in reading order."))
    data["figures"][slug] = dict(title=title, image=f"assets/{slug}-diagram.svg", alt=prompt)

video_rows = [
    ("food", "Food safety: clean, separate, cook and chill", "U.S. Food and Drug Administration", "04", "iguM_pqetzo", "Watch for which step interrupts contamination or growth.", "Cleaning and separation limit transfer between surfaces and food. Cooking addresses many microorganisms in the food; chilling slows growth. No one step makes all food risks disappear."),
    ("vaccine", "How vaccines work", "Health Canada via ImmunizeBC", "11", "pMSSu7QLAlw", "Watch for immune recognition and memory; compare the older animation with current vaccine types.", "Vaccines expose the immune system to an antigen or instructions for making one, enabling a response and memory without requiring the disease itself. Types differ; a vaccine is not always a weakened or killed whole germ."),
    ("immune", "Immune system", "Amoeba Sisters", "10", "fSEFXl2XQpc", "Separate barriers, innate responses and targeted responses.", "Skin and mucous membranes limit entry. Innate responses react broadly; specific B and T cell responses recognize particular targets. Memory can improve a later response, but neither line guarantees that infection is impossible."),
    ("antibiotic", "Antibiotics and antibiotic resistance", "World Health Organization SEARO", "12", "UQqABSIUFW4", "Identify what becomes resistant and why unnecessary use matters.", "Antibiotics act against bacterial infections, not directly against viruses. Resistant bacteria can survive and spread under selection pressure; the person does not become antibiotic-resistant. Follow current clinical instructions for personal care."),
    ("dna", "DNA, chromosomes, genes and traits", "Amoeba Sisters", "13", "8m6hHRlKwxY", "Follow the scale from DNA sequence to gene to chromosome and trait.", "DNA is a long molecule. A gene is a DNA region with a role in producing a functional product; chromosomes package DNA. Many traits reflect multiple genes and environmental influences."),
    ("punnett", "Punnett squares and sex-linked traits", "Amoeba Sisters", "14", "dN9SZHO6Wjg", "Notice how gametes populate a model and where its prediction stops.", "A Punnett square combines possible parental alleles to model probabilities for a specified inheritance pattern. Four boxes do not predict an exact four-child family. Human sex chromosome patterns also vary."),
    ("pedigree", "Pedigrees", "Amoeba Sisters", "15", "Gd09V2AkZv4", "Read symbols and shading, then test possible inheritance models against a family.", "A pedigree records relationships and observed traits. More than one inheritance model can fit a limited family. The supplied 2023 workbook key incorrectly claims a decisive unaffected-parent pattern that the shown chart does not contain."),
    ("defence", "How does your immune system work?", "TED-Ed", "09", "PSRJfaAYkW4", "Watch for the order of barriers, recognition and coordinated response.", "The immune system coordinates physical barriers, cells and signaling. Inflammation recruits and supports defence but can also produce symptoms. A response is evidence of action, not automatic proof that the body has cleared an infection.")]
for slug, title, publisher, topic, video_id, focus, written in video_rows:
    data["videos"].append(dict(id=f"s24-c-video-{slug}", title=title, publisher=publisher,
        topic=topic, provider="youtube", videoId=video_id,
        sourceUrl=f"https://www.youtube.com/watch?v={video_id}",
        purpose=f"Support Lesson {int(topic)}: {title.lower()}.", focus=focus, written=written,
        verification="Publisher watch page identified in source search on 2026-09-24; external playback and captions may change."))

OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n")
print(f"Built {OUT}: {len(data['topics'])} lessons, {len(data['exercises'])} formative tasks, {len(data['bookQuestions'])} textbook pages")
