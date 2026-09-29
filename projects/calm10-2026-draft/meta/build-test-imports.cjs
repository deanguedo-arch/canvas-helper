// Course-specific teacher package builder. These files stay in meta, outside the learner workspace.
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const input = path.join(root, "formal-test-bank.json");
const bank = JSON.parse(fs.readFileSync(input, "utf8"));
const expected = ["T1-A", "T1-B", "T2-A", "T2-B", "T3-A", "T3-B"];
const escapeCell = value => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const csv = rows => rows.map(row => row.map(escapeCell).join(",")).join("\r\n") + "\r\n";
const error = message => { throw new Error(`CALM test bank: ${message}`); };

if (!Array.isArray(bank.tests) || bank.tests.length !== 6) error("exactly six forms are required");
const seenIds = new Set();
const seenStems = new Set();
const summary = [];
const output = path.join(root, "brightspace-imports");
fs.mkdirSync(output, { recursive: true });

for (const formId of expected) {
  const form = bank.tests.find(test => test.id === formId);
  if (!form || !Array.isArray(form.items) || form.items.length !== 20) error(`${formId} needs 20 items`);
  const mcCount = form.items.filter(item => item.type === "mc").length;
  const wrCount = form.items.filter(item => item.type === "written").length;
  if (mcCount !== 16 || wrCount !== 4) error(`${formId} needs 16 MC and 4 written-response items`);
  const rows = [];
  let totalPoints = 0;
  let applicationPoints = 0;
  const answerPositionCounts = [0, 0, 0, 0];
  form.items.forEach((item, index) => {
    const expectedId = `${formId}-Q${String(index + 1).padStart(2, "0")}`;
    if (item.id !== expectedId || seenIds.has(item.id)) error(`invalid or duplicate item id ${item.id}`);
    seenIds.add(item.id);
    if (!item.prompt || typeof item.prompt !== "string") error(`${item.id} lacks a prompt`);
    const stem = item.prompt.trim().toLowerCase().replace(/\s+/g, " ");
    if (seenStems.has(stem)) error(`${item.id} repeats another formal prompt`);
    seenStems.add(stem);
    if (!Number.isInteger(item.points) || item.points < 1 || item.points > 10) error(`${item.id} has invalid points`);
    if (!["application", "reasoning", "interpretation", "recall"].includes(item.level)) error(`${item.id} lacks a cognitive level`);
    totalPoints += item.points;
    if (item.level !== "recall") applicationPoints += item.points;
    rows.push(["NewQuestion", item.type === "mc" ? "MC" : "WR"]);
    rows.push(["Title", item.id]);
    rows.push(["Points", item.points]);
    rows.push(["QuestionText", item.prompt]);
    if (item.type === "mc") {
      if (!Array.isArray(item.choices) || item.choices.length !== 4 || !Number.isInteger(item.correctIndex) || item.correctIndex < 0 || item.correctIndex > 3) error(`${item.id} has invalid choices`);
      if (new Set(item.choices.map(choice => String(choice).trim().toLowerCase())).size !== 4) error(`${item.id} repeats a choice`);
      answerPositionCounts[item.correctIndex] += 1;
      item.choices.forEach((choice, choiceIndex) => rows.push(["Option", choiceIndex === item.correctIndex ? "100" : "0", choice]));
      if (item.rationale) rows.push(["Feedback", item.rationale]);
    } else if (!item.markingGuide || typeof item.markingGuide !== "string") error(`${item.id} needs a teacher marking guide`);
  });
  if (applicationPoints / totalPoints < 0.6) error(`${formId} has less than 60% application, interpretation or reasoning marks`);
  if (answerPositionCounts.some(count => count !== 4)) error(`${formId} needs four correct answers in each displayed option position`);
  fs.writeFileSync(path.join(output, `${formId}.csv`), csv(rows));
  summary.push({ formId, items: form.items.length, mcCount, wrCount, totalPoints, applicationPoints });
}
fs.writeFileSync(path.join(output, "import-manifest.json"), JSON.stringify({ schemaVersion: 1, status: "local-csv-created-brightspace-import-unverified", source: "formal-test-bank.json", forms: summary }, null, 2) + "\n");
console.log(JSON.stringify(summary));
