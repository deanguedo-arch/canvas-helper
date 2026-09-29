const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cheerio = require("cheerio");

const project = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(project, "workspace/index.html"), "utf8");
const $ = cheerio.load(html);
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "instructional-repair-manifest-v1.json"), "utf8"));
const resources = JSON.parse(fs.readFileSync(path.join(__dirname, "learner-resource-manifest-v1.json"), "utf8"));
const imagePlan = JSON.parse(fs.readFileSync(path.join(__dirname, "lesson-image-plan-2026-09-26.json"), "utf8"));
const sourceAccessPlan = JSON.parse(fs.readFileSync(path.join(__dirname, "source-access-plan-2026-09-26.json"), "utf8"));
const sourceSpine = JSON.parse(fs.readFileSync(path.join(__dirname, "source-spine-cues-2026-09-26.json"), "utf8"));
const sourceReadingGuides = JSON.parse(fs.readFileSync(path.join(__dirname, "source-reading-guides-2026-09-28.json"), "utf8"));
const entrepreneurshipCaptions = fs.readFileSync(path.join(project, "workspace/assets/finlit/54963081799d.vtt"), "utf8");
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

check($("article[data-lesson-id]").length === 40, "Expected 40 lesson routes");
check(sourceAccessPlan.lessonsWithExternalSource === 40, "Expected an external source in all 40 lessons");
check(sourceAccessPlan.lessonsRequiringPrereading === 0, "No lesson should require external prereading");
check(sourceAccessPlan.lessonsRequiringPointOfUseSourceCheck === 40, "Every lesson should require its point-of-use source check");
check(sourceAccessPlan.lessonsWithSourceSpine === 40, "Every lesson should reuse its official source throughout the lesson");
check(sourceAccessPlan.lessons.length === 40, "Source-access plan must cover all 40 lessons");
check($("article.lesson > .source-access-card").length === 40, "Expected one official-source row in every lesson");
check($("article.lesson > details.source-access-card:not([open])").length === 40, "Official-source rows should be collapsed by default");
check($(".lesson-roadmap-body > ol").filter((_, el) => $(el).children("li").length === 5).length === 40, "Every lesson completion guide should contain five steps");
check($("details.source-access-card summary > strong").filter((_, el) => $(el).text().trim() === "Official source").length === 40, "Every source disclosure should identify the official source");
check($("details.source-access-card summary > span").filter((_, el) => $(el).text().includes("required during this lesson")).length === 40, "Every source disclosure should state that source use is required");
check($(".lesson-source > h2").filter((_, el) => $(el).text().trim().startsWith("Read ") && $(el).text().trim().endsWith(" with a purpose")).length === 40, "Every lesson should name the page in its reading guide title");
check(sourceReadingGuides.lessonCount === 40 && sourceReadingGuides.guides.length === 40, "Source reading-guide contract must cover all 40 lessons");
check($(".source-reading-guide").length === 40, "Every lesson should provide a source-specific reading guide");
check($(".source-reading-guide > li").length === 120, "Every source reading guide should explain where to look, what to record, and how to use it");
check($(".source-reading-guide").filter((_, el) => $(el).children("li").length === 3).length === 40, "Every source reading guide should have exactly three steps");
check($(".lesson-opening + .lesson-source--throughline").length === 37, "Expected source evidence directly after the opening in all standard lessons");
check($(".lesson-vocabulary-help + .lesson-source--throughline").length === 3, "Expected source evidence before teaching in all three pilot lessons");
check($(".source-opening-cue").length === 40, "Every lesson should connect its opening decision to the source");
check($(".source-teaching-cue").length === 0, "Required source actions should no longer be styled as passive teaching notes");
check($(".source-model-cue").length === 40, "Every lesson should use the source in its complete example");
check($(".source-practice-cue").length === 40, "Every lesson should return to the source during practice");
check($(".source-limit-cue").length === 0, "Source-limit advice should no longer look like a required task");
check($(".source-checkpoint").length === 42, "Expected one required source checkpoint per lesson plus three staged CE1-02 checkpoints");
check($(".source-checkpoint [data-source-checkpoint-key]").length === 42, "Every required checkpoint should have a checkbox");
check(new Set($(".source-checkpoint").map((_, el) => $(el).attr("data-source-checkpoint")).get()).size === 42, "Source checkpoint IDs must remain unique");
check($("details.source-quick-tip:not([open])").length === 40, "Every lesson should offer one collapsed source-limit quick tip");
check($("script[src='./source-checkpoints.js']").length === 1, "Source checkpoint persistence runtime is not wired once");
check($(".source-connection").length === 40 && $(".source-evidence-requirement").length === 40, "Every independent application should require a source detail");
check($("textarea[data-lesson-evidence][data-task-version='2026-09-26.2']").length === 37, "Expected 37 retained source-integrated task versions");
check($("textarea[data-lesson-evidence][data-task-version='2026-09-26.3']").length === 3, "Expected three revised tasks for corrected source matches");
check($("article.lesson > details.lesson-roadmap + .source-access-card").length === 40, "Expected each official source directly after the lesson completion guide");
check($("[data-open-source-viewer], .source-viewer-dialog, script[src='./source-viewer.js']").length === 0, "Removed source-viewer UI remains");
sourceAccessPlan.lessons.forEach(record => {
  const lesson = $(`#${record.lessonId}`);
  const topCard = lesson.children(".source-access-card");
  const pointOfUse = lesson.find(".lesson-source");
  check(topCard.length === 1, `${record.lessonId} source-access card missing`);
  check(pointOfUse.length === 1, `${record.lessonId} point-of-use source band missing`);
  check(topCard.find(".source-access-actions a").attr("href") === record.url, `${record.lessonId} source-access live URL drifted`);
  check(pointOfUse.find(".source-band-actions a").attr("href") === record.url, `${record.lessonId} point-of-use live URL drifted`);
  check(topCard.find(".source-access-owner").text().trim() === record.owner, `${record.lessonId} source owner drifted`);
});
sourceSpine.forEach(record => {
  const lesson = $(`#${record.lessonId}`);
  check(lesson.find(".source-opening-cue strong").text().includes(record.sourceTitle), `${record.lessonId} opening cue should name ${record.sourceTitle}`);
  check(lesson.find(".source-model-cue strong").text().includes(record.sourceTitle), `${record.lessonId} example cue should name ${record.sourceTitle}`);
  check(lesson.find(".source-practice-cue strong").text().includes(record.sourceTitle), `${record.lessonId} practice cue should name ${record.sourceTitle}`);
  check(lesson.find(".source-quick-tip summary").text().includes(record.sourceTitle), `${record.lessonId} quick tip should name ${record.sourceTitle}`);
  check(lesson.find(".source-checkpoint h4").first().text().includes(record.sourceTitle), `${record.lessonId} checkpoint should name ${record.sourceTitle}`);
  check(lesson.find(".source-checkpoint a").toArray().every(link => $(link).attr("href") === record.sourceUrl), `${record.lessonId} checkpoints should link to ${record.sourceTitle}`);
});
sourceReadingGuides.guides.forEach(record => {
  const lesson = $(`#${record.lessonId}`);
  const steps = lesson.find(".source-reading-guide > li span").map((_, el) => $(el).text().trim()).get();
  check(lesson.find(".lesson-source > h2").text().includes(record.sourceTitle), `${record.lessonId} reading guide should name ${record.sourceTitle}`);
  check(steps[0] === record.whereToLook, `${record.lessonId} reading target drifted`);
  check(steps[1] === record.whatToRecord, `${record.lessonId} evidence direction drifted`);
  check(steps[2] === record.howToUse, `${record.lessonId} lesson-use direction drifted`);
  check(lesson.find(".source-band-actions a").attr("href") === record.sourceUrl, `${record.lessonId} reading guide URL drifted`);
});
check($("#ce1-02 .source-checkpoint").length === 3, "CE1-02 should stage three required source checkpoints");
check($("#ce1-02 .source-access-actions a").attr("href") === "https://alis.alberta.ca/occinfo/occupations-in-alberta/occupation-profiles/graphic-designer/", "CE1-02 should link directly to Graphic Designer — alis");
check(!$("#ce1-02").text().replace(/\s+/g, " ").includes("What the source cannot decide"), "CE1-02 should not use generic source-limit wording");
check($("#ce1-04 .source-access-actions a").attr("href") === "https://alis.alberta.ca/occinfo/occupations-in-alberta/occupation-profiles/database-analyst/", "CE1-04 should link directly to Database Analyst — alis");
check($("#ce1-04 .source-reading-guide").text().includes("3-Year Job Market Forecast") && $("#ce1-04 .source-reading-guide").text().includes("Employed in AB"), "CE1-04 should direct learners to the exact labour-market fields");
check($("#fl1-04 .source-access-actions a").first().attr("href").includes("office-consumer-affairs"), "FL1-04 should use the official big-ticket product research source");
check($("#fl1-06 .source-access-actions a").first().attr("href") === "https://www.canada.ca/en/financial-consumer-agency/services/make-budget.html", "FL1-06 should use budgeting guidance for major purchases and irregular costs");
check($("#fl3-04 .source-access-actions a").first().attr("href") === "https://www.bankofcanada.ca/rates/related/inflation-calculator/", "FL3-04 should use the Bank of Canada inflation calculator");
check(imagePlan.lessons.length === 37, "Expected a contextual image plan for all 37 non-pilot lessons");
check($("article.lesson figure.source-document > figure.scenario-photo").length === 40, "Expected one contextual scene in every lesson case document");
imagePlan.lessons.forEach(record => {
  const scene = $(`#${record.lessonId} figure.source-document > figure.scenario-photo[data-lesson-image='${record.lessonId}']`);
  const image = scene.find("img");
  check(scene.length === 1, `${record.lessonId} contextual scene missing`);
  check(image.attr("alt") === record.alt, `${record.lessonId} contextual image alt text drifted`);
  check(fs.existsSync(path.join(project, "workspace", record.courseImage)), `${record.lessonId} contextual image file missing`);
});
check($("[data-skill-lab]").length === 37, "Expected 37 rebuilt guided case studios");
check($(".source-document--designed").length === 37, "Expected 37 redesigned source documents");
check($("[data-save-key^='guided:']").length === 111, "Expected three guided response fields in each rebuilt lesson");
check($(".guided-comparison").length === 37, "Expected one field-by-field comparison in each rebuilt lesson");
check($(".guided-comparison > summary").filter((_, el) => $(el).text().trim() === "Compare your response with a model").length === 37, "Guided comparisons need the learner-facing model label");
check($(".guided-review-row").length === 111 && $("[data-guided-response-copy]").length === 111, "Expected one learner/model comparison row for every guided response field");
check($("[data-canvas-helper-edit-key$='-guided-model-1']").length === 37 && $("[data-canvas-helper-edit-key$='-guided-model-2']").length === 37 && $("[data-canvas-helper-edit-key$='-guided-model-3']").length === 37, "Expected three editable practice-specific models in every rebuilt lesson");
check($("script[src='./guided-comparison.js']").length === 1, "Guided response mirroring runtime is not wired once");
$(".guided-builder").each((_, builder) => {
  const lessonId = $(builder).closest("article[data-lesson-id]").attr("data-lesson-id");
  check($(builder).find(".guided-fields [data-save-key]").length === 3, `${lessonId} should retain three guided response fields`);
  check($(builder).find(".guided-review-row").length === 3, `${lessonId} should compare all three response fields`);
});
check($(".instructional-repair").length === 0 && $("section.worked").length === 0, "Rejected generic repair and worked blocks remain");
check($(".pilot-stage").length === 9 && $("[data-pilot-activity]").length === 3, "Expected three teach-show-practise pilot lessons");
check(Object.keys(manifest.lessons).length === 40, "Repair manifest must cover all 40 lessons");
check($("[data-practice-id]").length === 240, "Expected 240 practice questions");
check(new Set($("[data-practice-id]").map((_, el) => $(el).attr("data-practice-id")).get()).size === 240, "Practice IDs must remain unique");
check($("textarea[data-lesson-evidence]").length === 40, "Expected one designated progress field per lesson");
check($("#portfolio textarea[data-save-key]").length === 1, "Expected one final portfolio response");

const p0 = Object.entries(manifest.lessons).filter(([, record]) => record.priority === "P0").map(([id]) => id);
check(p0.length === 11, "Expected 11 P0 routes");
p0.forEach(id => {
  const expectedVersion = ["fl1-04", "fl1-06", "fl3-04"].includes(id) ? "2026-09-26.3" : "2026-09-26.2";
  check($(`#${id} .transfer-work textarea`).attr("data-task-version") === expectedVersion, `${id} response needs the current source-integrated task version`);
  check($(`#${id} [data-skill-lab='${id}']`).length === 1, `${id} needs aligned guided practice`);
  check($(`#${id} [data-save-key^='guided:${id}:']`).length === 3, `${id} needs three guided response controls`);
});

const text = id => $(`#${id}`).text().replace(/\s+/g, " ");
check(text("co1-03").includes("Two helpers wanted late arrivals to skip sign-in"), "CO1-03 disagreement evidence missing");
check(text("co1-04").includes("55 minutes remain"), "CO1-04 clock correction missing");
check(text("fl1-03").includes("paid twice monthly on the 1st and 15th"), "FL1-03 schedule is not reconciled");
check(!text("fl1-03").includes("every two weeks"), "FL1-03 still contradicts the twice-monthly schedule");
check(text("fl1-04").includes("Rental is $7 per week") && text("fl1-04").includes("used calculator costs $95"), "FL1-04 complete terms missing");
check(text("fl1-05").includes("$4 per month for six months") && text("fl1-05").includes("$11 per month"), "FL1-05 independent terms missing");
check(text("fl1-06").includes("used bicycle costs $340"), "FL1-06 bicycle price missing");
check(text("fl2-03").includes("nominal annual rate of 8%"), "FL2-03 independent rate missing");
check(text("fl2-05").includes("six payments of $26 plus a $12 setup fee"), "FL2-05 complete offer missing");
check(text("fl3-05").includes("Only $35 per month is available for both goals"), "FL3-05 shared-cash constraint missing");
check(text("fl3-06").includes("Four deposits of $30 add $120"), "FL3-06 corrected timeline missing");
const comparisonText = id => $(`#${id} .guided-comparison`).text().replace(/\s+/g, " ");
check(comparisonText("ce1-01").includes("Amina repaired a bicycle brake") && !comparisonText("ce1-01").includes("Jordan redesigned"), "CE1-01 comparison must answer Amina's practice case");
check(comparisonText("fl1-01").includes("18 hours × $16 = $288") && !comparisonText("fl1-01").includes("12.5 regular hours"), "FL1-01 comparison must use the practice pay-stub figures");
check(comparisonText("fl2-02").includes("$36 of simple interest for six months") && !comparisonText("fl2-02").includes("$18 estimated interest"), "FL2-02 comparison must answer the six-month practice calculation");

function monthlyRate(nominal) { return Math.pow(1 + nominal / 2, 2 / 12) - 1; }
function payment(principal, nominal, periods) {
  const rate = monthlyRate(nominal);
  return principal * rate / (1 - Math.pow(1 + rate, -periods));
}
function balance(principal, nominal, periods, completed) {
  const rate = monthlyRate(nominal);
  const level = payment(principal, nominal, periods);
  return principal * Math.pow(1 + rate, completed) - level * ((Math.pow(1 + rate, completed) - 1) / rate);
}
const remaining = balance(5000, 0.05, 24, 12);
const stressed = payment(remaining, 0.07, 12);
check(Math.abs(stressed - 221.53918667512073) < 0.000001, "FL2-06 independent fixture changed");
check(text("fl2-06").includes("about $221.54") && text("fl2-06").includes("below the limit"), "FL2-06 teaching does not match calculated fixture");
check(!$("[data-practice-id='fl2-06-q6'] legend").text().includes("exceeds"), "FL2-06 q6 still has the false premise");
check($("[data-practice-id='fl2-06-q6']").attr("data-task-version") === "2026-09-25.1", "FL2-06 q6 needs task versioning");

check($(".original-resource-card").length === 0, "Learner PDF resource cards should be removed");
check($(".official-source-card[data-repair-source]").length === 3, "Expected three dated official-source cards");
check(resources.officialSources.length === 5, "Expected five dated official sources in the learner resource ledger");
check($(".resource-reader-dialog").length === 1 && $("script[src='./resource-reader.js']").length === 1, "Resource reader is not wired once");
check($("#assessments .assessment-brief").length === 7, "Expected complete learner briefs for A1-A7");
check($("#portfolio .portfolio-baseline").length === 1 && $("#portfolio .portfolio-baseline").text().includes("$1,170"), "Morgan fallback baseline is incomplete");
check($("#ce1-02-case-file .profile-research-sheet").length === 1, "CE1-02 should provide one coherent occupation-profile research sheet");
check($("#ce1-02-case-file .profile-evidence-row:not(.profile-evidence-row--head)").length === 3, "CE1-02 research sheet should connect duties, conditions, and preparation to Jordan's decision");
check(text("ce1-02").includes("Graphic Designer — alis") && text("ce1-02").includes("March 22, 2023") && text("ce1-02").includes("September 25, 2026"), "CE1-02 research sheet should retain a dated source record");
check(!text("ce1-02").includes("Two fictional profile cards") && !text("ce1-02").includes("Completed dated source row"), "CE1-02 should not retain the disconnected profile cards or source-row label");
check(text("ce1-04").includes("Two advertised postings captured") && text("ce1-04").includes("Three fictional labour-market records"), "CE1-04 source count or local evidence is inconsistent");
check(text("ce1-05").includes("English 10-2") && text("ce1-05").includes("English 20-2") && text("ce1-05").includes("English 30-2"), "CE1-05 lacks a complete Grade 10-12 route");
check(text("fl3-03").includes("TFSA") && text("fl3-03").includes("Guaranteed investment certificate") && text("fl3-03").includes("Diversified investment fund"), "FL3-03 lacks paired wrapper and holding examples");
check(text("fl2-07").includes("No new payment calculation is required"), "FL2-07 task and evidence instructions remain misaligned");
check(text("portfolio").includes("English 10-2 as complete") && text("portfolio").includes("Use Morgan’s complete monthly baseline below"), "Morgan pathway or budget carry-forward record is incomplete");
check(!html.includes("Do not treat the 13-second FINLIT clip") && !html.includes("This course deliberately crops the video"), "Learner-facing production notes remain");
check(!html.includes("<p class=\"section-label\">Teacher walkthrough</p>"), "Learner-facing teacher walkthrough labels remain");
check(!/\bArrows the possible|Ever gets tied|Employees the resources|risk in possible rewards/.test(`${html}\n${entrepreneurshipCaptions}`), "Known CE1-06 transcript or caption errors remain");
resources.resources.forEach(resource => {
  const file = path.resolve(project, resource.file.replace(/^workspace\//, "workspace/"));
  const fallback = file.replace(/\.pdf$/i, `-page-${resource.physicalPage}.png`);
  check(fs.existsSync(file), `Missing resource ${resource.id}`);
  check(fs.existsSync(fallback), `Missing page-image fallback for ${resource.id}`);
  if (fs.existsSync(file)) {
    const hash = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    check(hash === resource.sha256, `Hash mismatch for ${resource.id}`);
  }
});

if (failures.length) {
  console.error(failures.map(message => `FAIL: ${message}`).join("\n"));
  process.exit(1);
}
console.log(JSON.stringify({
  lessons: 40,
  contextualScenes: 40,
  rebuiltGuidedCaseStudios: 37,
  redesignedSourceDocuments: 37,
  guidedPracticeFields: 111,
  guidedComparisonRows: 111,
  pilotLessons: 3,
  p0Repairs: 11,
  practiceIds: 240,
  finlitResourceCards: 0,
  officialSourceCards: 3,
  officialSourcesTracked: 5,
  lessonsWithExternalSource: 40,
  lessonsRequiringPrereading: 0,
  lessonsRequiringPointOfUseSourceCheck: 40,
  sourceAccessCards: 40,
  sourceSpineLessons: 40,
  sourceViewerLaunchers: 0,
  sourceCheckpoints: 42,
  sourceQuickTips: 40,
  sourceReadingGuides: 40,
  sourceReadingSteps: 120,
  fl206StressPayment: Number(stressed.toFixed(2))
}, null, 2));
