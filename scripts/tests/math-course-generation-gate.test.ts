import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {spawnSync} from "node:child_process";

test("generation contract is versioned and rejects shallow lesson structure by definition",()=>{
  const contract=JSON.parse(fs.readFileSync(path.resolve("scripts/lib/math-course-generation/contract.json"),"utf8"));
  assert.equal(contract.contractVersion,"math-course-generation-v2");
  assert.deepEqual(contract.assessment.masteryStages,[0,25,50,75,100]);
  assert.equal(contract.assessment.generatedQuestionsPerLessonMinimum,50);
  for(const role of ["orientation","meaning","worked","guided","faded","misconception","mastery"])assert.ok(contract.lessonArchitecture.requiredRoles.includes(role));
});

test("generation gate rejects the intentionally shallow fixture",()=>{
  const fixture=path.resolve("scripts/tests/fixtures/math-course-generation-defective");
  const run=spawnSync(path.resolve("node_modules/.bin/tsx"),["scripts/validate-math-course-generation.ts","--project-path",fixture],{encoding:"utf8"});
  assert.notEqual(run.status,0);
  const result=JSON.parse(run.stdout);
  assert.equal(result.ok,false);
  assert.ok(result.errors.includes("A guided task reveals an answer in learner HTML before the attempt."));
});
