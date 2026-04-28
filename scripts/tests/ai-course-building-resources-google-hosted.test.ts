import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const projectManifestPath = path.resolve("projects/ai-course-building-resources/meta/project.json");
const deployConfigPath = path.resolve("projects/ai-course-building-resources/meta/google-hosted.deploy.json");
const metaFirebaseConfigPath = path.resolve("projects/ai-course-building-resources/meta/google-hosted.firebase-config.json");
const metaFirebaseRcPath = path.resolve("projects/ai-course-building-resources/meta/google-hosted.firebaserc");
const publishBatPath = path.resolve("publish-ai-course-building-resources.bat");
const hostedFirebaseConfigPath = path.resolve("projects/ai-course-building-resources/exports/google-hosted/firebase-config.json");
const hostedFirebaseRcPath = path.resolve("projects/ai-course-building-resources/exports/google-hosted/.firebaserc");
const hostedBridgePath = path.resolve("projects/ai-course-building-resources/exports/google-hosted/google-hosted-bridge.js");

test("ai course building resources opts into google hosted export", async () => {
  const source = await readFile(projectManifestPath, "utf8");

  const expectedSnippets = [
    '"target": "html"',
    '"target": "google-hosted"',
    '"googleHosted": {',
    '"trackedStorageKeys": [',
    '"ai-course-building-resources::workspace-state::v1"'
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("ai course building resources has deploy metadata for the digitalpresentation Firebase site", async () => {
  await access(deployConfigPath);
  const source = await readFile(deployConfigPath, "utf8");

  const expectedSnippets = [
    '"enabled": true',
    '"firebaseProjectId": "calm-module-one"',
    '"hostingSiteId": "digitalpresentation"'
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("ai course building resources keeps tracked Firebase publish config under project meta", async () => {
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
    '"messagingSenderId": "217802069551"',
    '"appId": "1:217802069551:web:5e645b557a7edcd7a798da"',
    '"measurementId": "G-VPCR5TET7D"',
    '"allowedEmailDomains": []',
    '"projectSlug": "ai-course-building-resources"'
  ];

  for (const snippet of firebaseConfigSnippets) {
    assert.match(firebaseConfig, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(firebaseRc, /"default":\s*"calm-module-one"/);
});

test("ai course building resources publish batch exports then deploys the digital presentation", async () => {
  await access(publishBatPath);
  const source = await readFile(publishBatPath, "utf8");

  const expectedSnippets = [
    'npm.cmd run export:google-hosted -- --project ai-course-building-resources',
    'projects\\ai-course-building-resources\\meta\\google-hosted.firebase-config.json',
    'projects\\ai-course-building-resources\\meta\\google-hosted.firebaserc',
    'projects\\ai-course-building-resources\\exports\\google-hosted',
    'copy /Y',
    'npm.cmd run deploy:google-hosted -- --project ai-course-building-resources',
    'Publish complete for "ai-course-building-resources".'
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("ai course building resources google hosted export carries deploy-ready Firebase files", async () => {
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
    '"appId": "1:217802069551:web:5e645b557a7edcd7a798da"',
    '"measurementId": "G-VPCR5TET7D"',
    '"allowedEmailDomains": []',
    '"projectSlug": "ai-course-building-resources"'
  ];

  for (const snippet of firebaseConfigSnippets) {
    assert.match(firebaseConfig, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(firebaseRc, /"default":\s*"calm-module-one"/);
  assert.match(bridgeSource, /Sign in with Google/);
  assert.match(bridgeSource, /ai-course-building-resources::workspace-state::v1/);
});
