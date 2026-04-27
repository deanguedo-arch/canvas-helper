import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const projectManifestPath = path.resolve("projects/sportswellness/meta/project.json");
const deployConfigPath = path.resolve("projects/sportswellness/meta/google-hosted.deploy.json");
const metaFirebaseConfigPath = path.resolve("projects/sportswellness/meta/google-hosted.firebase-config.json");
const metaFirebaseRcPath = path.resolve("projects/sportswellness/meta/google-hosted.firebaserc");
const publishBatPath = path.resolve("publish-sportswellness.bat");
const hostedFirebaseConfigPath = path.resolve("projects/sportswellness/exports/google-hosted/firebase-config.json");
const hostedFirebaseRcPath = path.resolve("projects/sportswellness/exports/google-hosted/.firebaserc");
const hostedBridgePath = path.resolve("projects/sportswellness/exports/google-hosted/google-hosted-bridge.js");

test("sportswellness project manifest opts into google hosted export and explicit tracked storage keys", async () => {
  const source = await readFile(projectManifestPath, "utf8");

  const expectedSnippets = [
    '"target": "google-hosted"',
    '"googleHosted": {',
    '"trackedStorageKeys": [',
    '"sportswellness.course-progress.v1"',
    '"sportswellness.ui-state.v1"',
    '"sportswellness.sidebarCollapsed"',
    '"diag_data"',
    '"sportswellness_phase1_assignment_v2"',
    '"vb_data"',
    '"mb_data"',
    '"p3_data"',
    '"p4a_data"',
    '"athlete_visualization_master_v1"'
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness has google hosted deploy metadata wired to Firebase Hosting", async () => {
  await access(deployConfigPath);
  const source = await readFile(deployConfigPath, "utf8");

  const expectedSnippets = [
    '"enabled": true',
    '"firebaseProjectId": "calm-module-one"',
    '"hostingSiteId": "sportwellness"'
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness publish batch file runs google hosted export then deploy for the course", async () => {
  await access(publishBatPath);
  const source = await readFile(publishBatPath, "utf8");

  const expectedSnippets = [
    'npm.cmd run export:google-hosted -- --project sportswellness',
    'projects\\sportswellness\\meta\\google-hosted.firebase-config.json',
    'projects\\sportswellness\\meta\\google-hosted.firebaserc',
    'projects\\sportswellness\\exports\\google-hosted',
    'copy /Y',
    'npm.cmd run deploy:google-hosted -- --project sportswellness',
    'Publish complete for "sportswellness".'
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness keeps tracked Firebase publish config under project meta", async () => {
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
    '"allowedEmailDomains": []',
    '"projectSlug": "sportswellness"'
  ];

  for (const snippet of firebaseConfigSnippets) {
    assert.match(firebaseConfig, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(firebaseRc, /"default":\s*"calm-module-one"/);
});

test("sportswellness google hosted export carries deploy-ready Firebase files and bridge wiring", async () => {
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
    '"projectSlug": "sportswellness"'
  ];

  for (const snippet of firebaseConfigSnippets) {
    assert.match(firebaseConfig, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(firebaseRc, /"default":\s*"calm-module-one"/);
  assert.match(bridgeSource, /Sign in with Google/);
  assert.match(bridgeSource, /projects\/\{slug\}\/users\/\{uid\}|collection\("users"\)\.doc/);
  assert.match(bridgeSource, /sportswellness\.course-progress\.v1/);
  assert.match(bridgeSource, /sportswellness_phase1_assignment_v2/);
});
