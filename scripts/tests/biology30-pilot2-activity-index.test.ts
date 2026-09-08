import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildTopicActivityIndex, collectTopicWork, completedTopicRoutes, topicWorkText, validateTopicActivityIndex, type ActivityInputs } from "../lib/biology30-course/v1/pilot2-activity-index.js";
import { emptyTopicState } from "../lib/biology30-course/v1/pilot2-state.js";
import { emptyGraphDraft, encodeGraphDraft, type GraphWork } from "../lib/biology30-course/v1/pilot2-graph-work.js";

async function load(unit: string) {
  const file = async (name: string) => JSON.parse(await readFile(`projects/resources/biology30-production/v1/units/unit-${unit.toLowerCase()}/pilot2-${name}.json`, "utf8"));
  const input: ActivityInputs = { contract: await file("contract"), state: await file("state-schema"), framing: await file("topic-teaching"), instruction: await file("instruction"),
    practice: await file("practice"), vocabulary: await file("vocabulary"), models: await file("models"), investigations: await file("investigations"), seminar: await file("review-seminar"), textbook: await file("textbook-guides") };
  const graphs: GraphWork[] = [await file("graph-work")];
  if (unit === "D") graphs.push(await file("demographic-graph-work"));
  return { input, graphs };
}

test("one owning activity index accounts for every B/C/D response, choice and flag exactly once", async () => {
  for (const unit of ["B", "C", "D"]) {
    const { input } = await load(unit), index = buildTopicActivityIndex(input);
    const report = validateTopicActivityIndex(index, input.state);
    assert.equal(report.responses, Object.keys(input.state.responses).length);
    assert.equal(report.choices, Object.keys(input.state.choices).length);
    assert.equal(report.flags, Object.keys(input.state.flags).length);
    const omitted = structuredClone(index); omitted.pop();
    assert.throws(() => validateTopicActivityIndex(omitted, input.state), /omits registered/);
    assert.throws(() => validateTopicActivityIndex([...index, index[0]], input.state), /Invalid activity return target/);
    const wrongRoute = structuredClone(index); wrongRoute[0].routeId = "unrelated-course";
    assert.throws(() => validateTopicActivityIndex(wrongRoute, input.state), /Invalid activity return target/);
    const wrongChoice = structuredClone(index); delete wrongChoice.find(entry => entry.choices.length)!.choices[0].options["0"];
    assert.throws(() => validateTopicActivityIndex(wrongChoice, input.state), /choice meaning drift/);
  }
});

test("all-work text retains unsaved drafts, canonical choices, plotted errors, confirmations and raw earlier work", async () => {
  const { input, graphs } = await load("D"), index = buildTopicActivityIndex(input), state = emptyTopicState(input.state);
  assert.deepEqual(collectTopicWork(index, state, input.state, graphs), []);
  state.responses["d-process-note"] = "  My uncollected draft <&> 🧬  ";
  const selected = input.practice.items.find(item => item.kind === "multiple-choice")!;
  state.choices[selected.id] = "1"; // Canonical value, independent of displayed order.
  const graph = graphs[0], draft = emptyGraphDraft(graph);
  state.responses[graph.responseId] = encodeGraphDraft(graph, draft, input.state.responses[graph.responseId].limit);
  assert.ok(!collectTopicWork(index, state, input.state, graphs).some(entry => entry.id === graph.responseId));
  draft.g[0].p[0][0] = 0; draft.g[0].p[0][1] = 9.99;
  state.responses[graph.responseId] = encodeGraphDraft(graph, draft, input.state.responses[graph.responseId].limit);
  const book = index.find(entry => entry.category === "Textbook reinforcement")!;
  state.flags.push(book.flags[0].id);
  state.legacy.push({ source: "old-profile fixture", original: '{"v":2,"writing":"preserve exact spacing"} ' });
  const entries = collectTopicWork(index, state, input.state, graphs);
  assert.ok(entries.some(entry => entry.id === selected.id && entry.fields[0].text === selected.options![1]));
  assert.ok(entries.some(entry => entry.id === graph.responseId && entry.fields[0].text.includes("9.99")));
  const filteredVisibleEntries = entries.filter(entry => entry.category === "Notes");
  assert.equal(filteredVisibleEntries.length, 1);
  const full = topicWorkText(index, state, input.state, graphs);
  assert.ok(full.includes(state.responses["d-process-note"]));
  assert.ok(full.includes(selected.options![1]) && full.includes("9.99") && full.includes(book.title));
  assert.ok(full.includes(state.legacy[0].original));
  assert.throws(() => topicWorkText(index.filter(entry => entry.category === "Notes"), state, input.state), /omits registered/);
});

test("completion derives from required attempted work, never optional collection activity", async () => {
  let requiredCount = 0;
  for (const unit of ["B", "C", "D"]) {
    const { input, graphs } = await load(unit), state = emptyTopicState(input.state);
    state.flags = Object.keys(input.state.flags).filter(id => id.endsWith("-advanced-complete") || id.includes("-textbook-"));
    state.responses[`${unit.toLowerCase()}-process-note`] = "Optional study";
    assert.deepEqual(completedTopicRoutes(input, state, graphs), []);
    for (const item of input.practice.items.filter(item => item.role !== "challenge")) {
      state.flags.push(`${item.id}-attempted`);
      if (item.kind === "multiple-choice") state.choices[item.id] = "1"; // Correctness is not required for an honest attempt.
      else {
        const graph = graphs.find(graph => graph.responseId === item.id);
        if (graph) { const draft = emptyGraphDraft(graph); draft.g[0].p[0][0] = 0; state.responses[item.id] = encodeGraphDraft(graph, draft, input.state.responses[item.id].limit); }
        else state.responses[item.id] = "My attempted explanation";
      }
    }
    for (const topic of input.framing.topics) {
      state.responses[topic.evidenceSlip.responseId] = "My saved evidence";
      state.responses[topic.localWalkthrough.checkpoint.responseId] = "My checkpoint attempt";
      state.flags.push(`${topic.topicId}-evidence-collected`, `${topic.topicId}-media-attempted`);
    }
    for (const item of input.seminar.activities) state.responses[item.id] = "My seminar response";
    state.flags.push(`${input.seminar.id}-saved`);
    assert.deepEqual(completedTopicRoutes(input, state, graphs), input.contract.requiredRoutes);
    requiredCount += input.contract.requiredRoutes.length;
    const first = input.framing.topics[0];
    state.responses[first.localWalkthrough.checkpoint.responseId] = " ";
    assert.ok(!completedTopicRoutes(input, state, graphs).includes(first.topicId));
    assert.equal(completedTopicRoutes(input, state, graphs).length, input.contract.requiredRoutes.length - 1);
  }
  assert.equal(requiredCount, 43);
});
