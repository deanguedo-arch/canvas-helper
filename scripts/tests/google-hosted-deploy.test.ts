import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {
  buildGoogleHostedDeployContext,
  buildGoogleHostedFirebaseDeployFiles,
  formatDeployableGoogleHostedProjects,
  getFirebaseCliCommand,
  getFirebaseCliUsesShell,
  listDeployableGoogleHostedProjects,
  loadGoogleHostedDeployConfig,
  parseGoogleHostedDeploySelection
} from "../lib/google-hosted-deploy.js";
import { ensureDir, writeJsonFile, writeTextFile } from "../lib/fs.js";
import { getProjectPaths } from "../lib/paths.js";
import { cleanupProjectFixture, createProjectFixture } from "./helpers/project-fixture.js";

async function writeDeployConfig(
  slug: string,
  value: {
    enabled?: boolean;
    firebaseProjectId?: string;
    hostingSiteId?: string;
  }
) {
  const paths = getProjectPaths(slug);
  await writeJsonFile(path.join(paths.metaDir, "google-hosted.deploy.json"), value);
}

async function writeDeployArtifacts(
  slug: string,
  options: {
    firebaseConfig?: boolean;
    firebaseRc?: boolean;
  } = {}
) {
  const paths = getProjectPaths(slug);
  const exportDir = path.join(paths.exportsDir, "google-hosted");
  await ensureDir(exportDir);
  await writeTextFile(path.join(exportDir, "index.html"), "<!doctype html>\n");

  if (options.firebaseConfig !== false) {
    await writeTextFile(
      path.join(exportDir, "firebase-config.json"),
      JSON.stringify({
        apiKey: "test-key",
        appId: "test-app",
        authDomain: "test.firebaseapp.com",
        messagingSenderId: "123",
        projectId: "test-project",
        storageBucket: "test.firebasestorage.app",
        allowedEmailDomains: [],
        projectSlug: slug
      })
    );
  }

  if (options.firebaseRc !== false) {
    await writeTextFile(
      path.join(exportDir, ".firebaserc"),
      JSON.stringify({
        projects: {
          default: "test-project"
        }
      })
    );
  }
}

test("loadGoogleHostedDeployConfig reads per-slug Firebase deploy metadata", async () => {
  const slug = "test-google-hosted-deploy-config";
  await createProjectFixture({ slug });
  await writeDeployConfig(slug, {
    enabled: true,
    firebaseProjectId: "subject-course-one",
    hostingSiteId: "module-one"
  });

  try {
    const config = await loadGoogleHostedDeployConfig(slug);

    assert.deepEqual(config, {
      enabled: true,
      firebaseProjectId: "subject-course-one",
      hostingSiteId: "module-one"
    });
  } finally {
    await cleanupProjectFixture(slug);
  }
});

test("listDeployableGoogleHostedProjects returns only slugs with config and required Firebase files", async () => {
  const readySlug = "test-google-hosted-deploy-ready";
  const missingConfigSlug = "test-google-hosted-deploy-missing-config";
  const missingRcSlug = "test-google-hosted-deploy-missing-rc";

  await createProjectFixture({ slug: readySlug });
  await createProjectFixture({ slug: missingConfigSlug });
  await createProjectFixture({ slug: missingRcSlug });

  await writeDeployConfig(readySlug, {
    enabled: true,
    firebaseProjectId: "subject-course-one",
    hostingSiteId: "ready-site"
  });
  await writeDeployConfig(missingConfigSlug, {
    enabled: true,
    firebaseProjectId: "subject-course-one",
    hostingSiteId: "missing-config-site"
  });
  await writeDeployConfig(missingRcSlug, {
    enabled: true,
    firebaseProjectId: "subject-course-one",
    hostingSiteId: "missing-rc-site"
  });

  await writeDeployArtifacts(readySlug);
  await writeDeployArtifacts(missingConfigSlug, { firebaseConfig: false });
  await writeDeployArtifacts(missingRcSlug, { firebaseRc: false });

  try {
    const deployableProjects = await listDeployableGoogleHostedProjects();
    const readyProject = deployableProjects.find((project) => project.slug === readySlug);

    assert.equal(readyProject?.slug, readySlug);
    assert.equal(readyProject?.config.firebaseProjectId, "subject-course-one");
    assert.equal(readyProject?.config.hostingSiteId, "ready-site");
    assert.ok(
      deployableProjects.every((project) => project.slug !== missingConfigSlug && project.slug !== missingRcSlug)
    );
  } finally {
    await cleanupProjectFixture(readySlug);
    await cleanupProjectFixture(missingConfigSlug);
    await cleanupProjectFixture(missingRcSlug);
  }
});

test("loadGoogleHostedDeployConfig rejects invalid deploy config", async () => {
  const slug = "test-google-hosted-deploy-invalid";
  await createProjectFixture({ slug });
  await writeDeployConfig(slug, {
    enabled: true,
    firebaseProjectId: "subject-course-one"
  });

  try {
    await assert.rejects(
      () => loadGoogleHostedDeployConfig(slug),
      /hostingSiteId/i
    );
  } finally {
    await cleanupProjectFixture(slug);
  }
});

test("parseGoogleHostedDeploySelection supports one or many numbered selections", () => {
  assert.deepEqual(parseGoogleHostedDeploySelection("2", 3), [1]);
  assert.deepEqual(parseGoogleHostedDeploySelection("1, 3", 3), [0, 2]);
  assert.deepEqual(parseGoogleHostedDeploySelection("3,1,3", 3), [0, 2]);
});

test("parseGoogleHostedDeploySelection rejects invalid selections", () => {
  assert.throws(() => parseGoogleHostedDeploySelection("", 3), /selection/i);
  assert.throws(() => parseGoogleHostedDeploySelection("0", 3), /selection/i);
  assert.throws(() => parseGoogleHostedDeploySelection("4", 3), /selection/i);
  assert.throws(() => parseGoogleHostedDeploySelection("abc", 3), /selection/i);
});

test("buildGoogleHostedDeployContext prepares Firebase project and site targeting", async () => {
  const slug = "test-google-hosted-deploy-context";
  await createProjectFixture({ slug });
  await writeDeployConfig(slug, {
    enabled: true,
    firebaseProjectId: "subject-course-one",
    hostingSiteId: "module-one"
  });
  await writeDeployArtifacts(slug);

  try {
    const projects = await listDeployableGoogleHostedProjects();
    const project = projects.find((entry) => entry.slug === slug);
    assert.ok(project);
    const context = buildGoogleHostedDeployContext(project);

    assert.equal(context.slug, slug);
    assert.equal(context.firebaseProjectId, "subject-course-one");
    assert.equal(context.hostingSiteId, "module-one");
    assert.equal(context.exportDir, path.join(getProjectPaths(slug).exportsDir, "google-hosted"));
    assert.equal(context.firebaseConfigPath, path.join(context.exportDir, "firebase-config.json"));
    assert.equal(context.firebaseRcPath, path.join(context.exportDir, ".firebaserc"));
  } finally {
    await cleanupProjectFixture(slug);
  }
});

test("formatDeployableGoogleHostedProjects renders numbered choices", () => {
  const lines = formatDeployableGoogleHostedProjects([
    {
      slug: "calm3new",
      config: {
        enabled: true,
        firebaseProjectId: "subject-course-one",
        hostingSiteId: "calm3new-site"
      },
      exportDir: "C:/repo/projects/calm3new/exports/google-hosted",
      firebaseConfigPath: "C:/repo/projects/calm3new/exports/google-hosted/firebase-config.json",
      firebaseRcPath: "C:/repo/projects/calm3new/exports/google-hosted/.firebaserc",
      deployConfigPath: "C:/repo/projects/calm3new/meta/google-hosted.deploy.json"
    }
  ]);

  assert.deepEqual(lines, ["1. calm3new -> subject-course-one / calm3new-site"]);
});

test("buildGoogleHostedFirebaseDeployFiles adds hosting target metadata for a site deploy", () => {
  const context = {
    slug: "calm3new",
    firebaseProjectId: "subject-course-one",
    hostingSiteId: "calm3new-site",
    exportDir: "C:/repo/projects/calm3new/exports/google-hosted",
    firebaseConfigPath: "C:/repo/projects/calm3new/exports/google-hosted/firebase-config.json",
    firebaseRcPath: "C:/repo/projects/calm3new/exports/google-hosted/.firebaserc",
    deployConfigPath: "C:/repo/projects/calm3new/meta/google-hosted.deploy.json"
  };
  const result = buildGoogleHostedFirebaseDeployFiles(context, {
    hosting: {
      public: ".",
      ignore: ["**/.*"],
      rewrites: [{ source: "**", destination: "/index.html" }]
    }
  });

  assert.equal(result.deployTargetName, "calm3new");
  assert.equal((result.firebaseJson.hosting as { target?: string }).target, "calm3new");
  assert.equal(result.firebaseRc.projects.default, "subject-course-one");
  assert.deepEqual(result.firebaseRc.targets["subject-course-one"].hosting.calm3new, ["calm3new-site"]);
});

test("getFirebaseCliCommand resolves the correct executable name for the platform", () => {
  assert.equal(getFirebaseCliCommand("win32"), "firebase.cmd");
  assert.equal(getFirebaseCliCommand("linux"), "firebase");
});

test("getFirebaseCliUsesShell enables shell execution only on Windows", () => {
  assert.equal(getFirebaseCliUsesShell("win32"), true);
  assert.equal(getFirebaseCliUsesShell("linux"), false);
});
