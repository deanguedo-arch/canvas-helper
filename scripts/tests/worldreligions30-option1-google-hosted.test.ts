import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const projectManifestPath = path.resolve("projects/worldreligions30-option1/meta/project.json");
const deployConfigPath = path.resolve("projects/worldreligions30-option1/meta/google-hosted.deploy.json");
const metaFirebaseConfigPath = path.resolve("projects/worldreligions30-option1/meta/google-hosted.firebase-config.json");
const metaFirebaseRcPath = path.resolve("projects/worldreligions30-option1/meta/google-hosted.firebaserc");
const publishBatPath = path.resolve("publish-worldreligions30-option1.bat");
const hostedFirebaseConfigPath = path.resolve("projects/worldreligions30-option1/exports/google-hosted/firebase-config.json");
const hostedFirebaseRcPath = path.resolve("projects/worldreligions30-option1/exports/google-hosted/.firebaserc");
const hostedBridgePath = path.resolve("projects/worldreligions30-option1/exports/google-hosted/google-hosted-bridge.js");

test("worldreligions30-option1 project manifest opts into google hosted export and explicit tracked storage keys", async () => {
  const source = await readFile(projectManifestPath, "utf8");

  const expectedSnippets = [
    '"target": "google-hosted"',
    '"googleHosted": {',
    '"trackedStorageKeys": [',
    '"worldreligions30-option1.progress"',
    '"worldreligions30-option1.ui"',
    '"worldreligions30-option1.assignment.chapter1interactive"',
    '"worldreligions30-option1.assignment.chapter2interactive"',
    '"worldreligions30-option1.assignment.chapter3interactive"',
    '"worldreligions30-option1.assignment.chapter4interactive"',
    '"worldreligions30-option1.assignment.chapter5interactive"',
    '"worldreligions30-option1.assignment.chapter6interactive"',
    '"worldreligions30-option1.assignment.chapter7interactive"',
    '"worldreligions30-option1.assignment.chapter8interactive"',
    '"worldreligions30-option1.assignment.chapter9interactive"',
    '"worldreligions30-option1.assignment.chapter10interactive"'
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("worldreligions30-option1 has google hosted deploy metadata wired to Firebase Hosting", async () => {
  await access(deployConfigPath);
  const source = await readFile(deployConfigPath, "utf8");

  const expectedSnippets = [
    '"enabled": true',
    '"firebaseProjectId": "calm-module-one"',
    '"hostingSiteId": "worldreligion"'
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("worldreligions30-option1 publish batch file runs google hosted export then deploy for the course", async () => {
  await access(publishBatPath);
  const source = await readFile(publishBatPath, "utf8");

  const expectedSnippets = [
    'npm.cmd run export:google-hosted -- --project worldreligions30-option1',
    'projects\\worldreligions30-option1\\meta\\google-hosted.firebase-config.json',
    'projects\\worldreligions30-option1\\meta\\google-hosted.firebaserc',
    'projects\\worldreligions30-option1\\exports\\google-hosted',
    'copy /Y',
    'npm.cmd run deploy:google-hosted -- --project worldreligions30-option1',
    'Publish complete for "worldreligions30-option1".'
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("worldreligions30-option1 keeps tracked Firebase publish config under project meta", async () => {
  await access(metaFirebaseConfigPath);
  await access(metaFirebaseRcPath);

  const [firebaseConfig, firebaseRc] = await Promise.all([
    readFile(metaFirebaseConfigPath, "utf8"),
    readFile(metaFirebaseRcPath, "utf8")
  ]);

  const firebaseConfigSnippets = [
    '"apiKey": "AIzaSyA52m1X_WjbTlj1I3YWbInMxFLFX6h0fiw"',
    '"authDomain": "calm-module-one.firebaseapp.com"',
    '"projectId": "calm-module-one"',
    '"storageBucket": "calm-module-one.firebasestorage.app"',
    '"appId": "1:217802069551:web:1ba1ce0e3707fb98a798da"',
    '"measurementId": "G-7VKS7Q8CKY"',
    '"allowedEmailDomains": []',
    '"projectSlug": "worldreligions30-option1"'
  ];

  for (const snippet of firebaseConfigSnippets) {
    assert.match(firebaseConfig, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(firebaseRc, /"default":\s*"calm-module-one"/);
});

test("worldreligions30-option1 google hosted export carries deploy-ready Firebase files and bridge wiring", async () => {
  await access(hostedFirebaseConfigPath);
  await access(hostedFirebaseRcPath);
  await access(hostedBridgePath);

  const [firebaseConfig, firebaseRc, bridgeSource] = await Promise.all([
    readFile(hostedFirebaseConfigPath, "utf8"),
    readFile(hostedFirebaseRcPath, "utf8"),
    readFile(hostedBridgePath, "utf8")
  ]);

  const firebaseConfigSnippets = [
    '"apiKey": "AIzaSyA52m1X_WjbTlj1I3YWbInMxFLFX6h0fiw"',
    '"authDomain": "calm-module-one.firebaseapp.com"',
    '"projectId": "calm-module-one"',
    '"storageBucket": "calm-module-one.firebasestorage.app"',
    '"allowedEmailDomains": []',
    '"projectSlug": "worldreligions30-option1"'
  ];

  for (const snippet of firebaseConfigSnippets) {
    assert.match(firebaseConfig, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(firebaseRc, /"default":\s*"calm-module-one"/);
  assert.match(bridgeSource, /Sign in with Google/);
  assert.match(bridgeSource, /collection\("users"\)\.doc/);
  assert.match(bridgeSource, /worldreligions30-option1\.progress/);
  assert.match(bridgeSource, /worldreligions30-option1\.assignment\.chapter10interactive/);
});
