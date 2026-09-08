import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describeLegacyWork, preserveLegacyRecords, type LegacyRecord } from "../lib/biology30-course/v1/pilot2-legacy-work.js";

const memory = () => { const data = new Map<string, string>(); return { data, getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } }; };
const load = async (unit: string, name: string) => JSON.parse(await readFile(`projects/resources/biology30-production/v1/units/unit-${unit}/pilot2-${name}.json`, "utf8"));

test("all-unit migration maps account for each original schema identity without claiming new equivalence", async () => {
  for (const unit of ["b", "c", "d"]) {
    const legacy = await load(unit, "legacy-schema"), migration = await load(unit, "migration");
    for (const category of ["responses", "practice", "interactions", "artifacts", "lessons"]) {
      assert.deepEqual(migration.maps[category].map((item: {oldId:string}) => item.oldId).sort(), Object.keys(legacy[category]).sort());
      assert.ok(migration.maps[category].every((item: {newId:unknown;disposition:string}) => item.newId === null && item.disposition === "recoverable-legacy-only"));
    }
  }
});

test("old shell arrays/maps and both envelope versions are backed up before a preserved-only migration", async () => {
  for (const unit of ["b", "c", "d"]) {
    const schema = await load(unit, "state-schema"), local = memory();
    const records: LegacyRecord[] = [
      { source: "LMS", kind: "compact-v2", original: ' {"v":2,"r":[["unresolved","Earlier writing 🧬"]]} ' },
      { source: `${unit}:state:v1`, kind: "state-v1", original: '{"schemaVersion":1,"responses":{"old":"Local writing"}}' },
      { source: `${unit}:responses`, kind: "responses", original: '{"old":"Uncollected shell draft"}' },
      { source: `${unit}:complete`, kind: "completions", original: '["old-lesson"]' },
      { source: `${unit}:notes`, kind: "notes", original: '[{"title":"Earlier note","body":"Keep me"}]' },
    ];
    const result = preserveLegacyRecords(records, schema, local, "backup-fixture");
    result.backups.forEach((backup, index) => assert.equal(local.getItem(backup.key), records[index].original));
    assert.deepEqual(result.state.responses, {}); assert.deepEqual(result.state.flags, []); assert.deepEqual(result.state.choices, {});
    assert.deepEqual(result.state.legacy.map(item => item.original), records.map(item => item.original));
    assert.throws(() => preserveLegacyRecords([{ ...records[0], original: '{"v":99}' }], schema, local, "future"), /Unrecognized/);
    assert.throws(() => preserveLegacyRecords([{ ...records[0], original: '{"v":2,"extra":"different"}' }], schema, local, "backup-fixture"), /Different original/);
    const large = [{ source: "large", kind: "responses" as const, original: JSON.stringify({ old: "x".repeat(49_000) }) }];
    assert.throws(() => preserveLegacyRecords(large, schema, local, "oversize"), /limit/);
    assert.equal(local.getItem("oversize:large"), large[0].original);
    assert.throws(() => preserveLegacyRecords(records, schema, { getItem: () => null, setItem: () => { throw new Error("quota"); } }, "quota"), /quota/);
  }
});

test("readable earlier work preserves duplicate responses and unknown fields without turning old completions into new ones", async () => {
  for (const unit of ["b", "c", "d"]) {
    const legacy = await load(unit, "legacy-schema"), [id, token] = Object.entries(legacy.responses)[0];
    const raw = JSON.stringify({ v: 2, r: [[token, "First saved draft"], [token, "Second occurrence"], ["unknown-token", "Unmatched response"]],
      n: [["My title", "My body"]], c: [Object.values(legacy.lessons)[0]], customFuture: { content: "Preserve extra data" } });
    const display = describeLegacyWork(raw, legacy);
    assert.equal(display.filter(entry => entry.label.includes(id)).length, 2);
    assert.ok(display.some(entry => entry.text === "First saved draft"));
    assert.ok(display.some(entry => entry.text === "Second occurrence"));
    assert.ok(display.some(entry => entry.label.includes("unknown-token") && entry.text === "Unmatched response"));
    assert.ok(display.some(entry => entry.label.includes("not new completion")));
    assert.ok(display.some(entry => entry.text.includes("Preserve extra data")));
    assert.equal(describeLegacyWork("broken JSON", legacy)[0].text, "broken JSON");
  }
});
