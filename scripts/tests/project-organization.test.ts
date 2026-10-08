import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { organizationForSlug, parseOrganizationRegistry, readOrganizationRegistry, setProjectArchived } from "../../app/server/lib/project-organization.js";
import { getProjectMetadataGroups, getVisibleStudioProjects } from "../../app/studio/src/lib/project-display.js";
import type { ProjectBundle } from "../../app/studio/src/lib/types.js";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { ReferencePicker } from "../../app/studio/src/components/ReferencePicker.js";
import { WorkspacePicker } from "../../app/studio/src/components/WorkspacePicker.js";
import { repoRoot } from "../lib/paths.js";

const registry = { schemaVersion: 1 as const, projects: {
  archived: { archived: true }, "e2e-fixture": { archived: true, role: "fixture" as const }
} };
function bundle(slug: string): ProjectBundle {
  return { manifest: { id: "uuid-" + slug, slug, authoringStatus: "active" }, organization: organizationForSlug(registry, slug) } as ProjectBundle;
}

test("organization keys are folder slugs; lifecycle, fixtures and archived sources remain separate", () => {
  const items = [bundle("kept"), bundle("archived"), bundle("e2e-fixture")];
  assert.deepEqual(getVisibleStudioProjects(items).map(x => x.manifest.slug), ["kept", "e2e-fixture"]);
  assert.equal(items[1].manifest.authoringStatus, "active");
  assert.equal(getProjectMetadataGroups(items).find(x => x.label === "Test fixtures")?.projects[0].manifest.slug, "e2e-fixture");
  assert.equal(getProjectMetadataGroups(items, true).flatMap(x => x.projects).length, 3);
  assert.equal(organizationForSlug(registry, "uuid-archived").archived, false);
});

test("restoration persists, concurrent restores serialize, and unapproved projects cannot be archived", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "canvas-organization-test-"));
  const file = path.join(dir, "registry.json");
  await writeFile(file, JSON.stringify(registry));
  await Promise.all([setProjectArchived("archived", false, file), setProjectArchived("e2e-fixture", false, file)]);
  const restored = await readOrganizationRegistry(file);
  assert.equal(restored.projects.archived.archived, false);
  assert.equal(restored.projects["e2e-fixture"].archived, false);
  assert.equal(restored.projects["e2e-fixture"].role, "fixture");
  await setProjectArchived("archived", true, file);
  assert.equal((await readOrganizationRegistry(file)).projects.archived.archived, true);
  const before = await readFile(file, "utf8");
  await assert.rejects(setProjectArchived("kept", true, file), /outside the approved/);
  await assert.rejects(setProjectArchived("__proto__", true, file), /outside the approved/);
  assert.equal(await readFile(file, "utf8"), before);
});

test("invalid registry fails closed; missing registry leaves catalog unchanged", async () => {
  assert.throws(() => parseOrganizationRegistry('{"schemaVersion":2,"projects":{}}'), /Invalid/);
  assert.throws(() => parseOrganizationRegistry('{"schemaVersion":1,"projects":{"x":{"archived":"yes"}}}'), /Invalid/);
  assert.throws(() => parseOrganizationRegistry('{"schemaVersion":1,"projects":[]}'), /Invalid/);
  assert.deepEqual(await readOrganizationRegistry(path.join(os.tmpdir(), "missing-organization-registry-never-created.json")), {schemaVersion:1,projects:{}});
});

test("approved registry contains exactly the 28 selections and fixture roles", async () => {
  const actual = await readOrganizationRegistry();
  assert.equal(Object.keys(actual.projects).length, 28);
  assert.equal(Object.values(actual.projects).filter(x => x.role === "fixture").length, 2);
  for (const slug of Object.keys(actual.projects)) {
    const manifest = JSON.parse(await readFile(path.join(repoRoot, "projects", slug, "meta", "project.json"), "utf8"));
    assert.equal(manifest.slug, slug);
    assert.notEqual(manifest.authoringStatus, "archived");
  }
});

test("picker preserves current archived selection and exposes reversible action without losing fixture access", () => {
  const html = renderToStaticMarkup(createElement(WorkspacePicker, {
    selectedSlug: "archived", projects: [bundle("kept"), bundle("archived"), bundle("e2e-fixture")],
    resolvedWorkspaceHtmlPath: "index.html", workspaceFileOptions: ["index.html"],
    onProjectChange: () => {}, onHtmlChange: () => {}, onRefresh: () => {}
  }));
  assert.match(html, /Archived \(2\)/);
  assert.match(html, />Restore</);
  assert.match(html, /value="archived" selected/);
  assert.match(html, /label="Test fixtures"/);
});


test("an external registry writer prevents overwrite", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "canvas-organization-lock-test-"));
  const file = path.join(dir, "registry.json");
  await writeFile(file, JSON.stringify(registry));
  await writeFile(`${file}.lock`, "another writer");
  await assert.rejects(setProjectArchived("archived", false, file), /registry is busy/);
  assert.equal((await readOrganizationRegistry(file)).projects.archived.archived, true);
});


test("archived source projects remain selectable as references", () => {
  const html = renderToStaticMarkup(createElement(ReferencePicker, {
    target: {projectSlug:"archived",source:"html",root:"workspace",htmlPath:"index.html",resourceRoot:"raw",resourcePath:""},
    projects:[bundle("kept"),bundle("archived")],htmlOptions:["index.html"],resourceOptions:[],
    incomingRefreshRunning:false,incomingRefreshMessage:"",incomingRefreshIsError:false,
    onProjectChange:()=>{},onSourceChange:()=>{},onRootChange:()=>{},onHtmlChange:()=>{},
    onResourceRootChange:()=>{},onResourcePathChange:()=>{},onRefreshIntake:()=>{}
  }));
  assert.match(html, /value="archived" selected/);
});
