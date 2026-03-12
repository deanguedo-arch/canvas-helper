import type { ProjectManifest } from "../../lib/types.js";
import { ensureDir, removePath, writeJsonFile, writeTextFile } from "../../lib/fs.js";
import { getProjectPaths } from "../../lib/paths.js";

type CreateProjectFixtureOptions = {
  slug: string;
  rawHtml?: string;
  workspaceHtml?: string;
  workspaceFiles?: Record<string, string>;
};

export async function createProjectFixture(options: CreateProjectFixtureOptions) {
  const paths = getProjectPaths(options.slug);
  const timestamp = "2026-03-12T12:00:00.000Z";
  const manifest: ProjectManifest = {
    id: options.slug,
    slug: options.slug,
    sourcePath: `projects/${options.slug}/raw/original.html`,
    inputKind: "html",
    brightspaceTarget: "course-page",
    previewModes: ["raw", "workspace"],
    workspaceEntrypoint: paths.workspaceEntrypoint,
    rawEntrypoint: paths.rawEntrypoint,
    learningSource: "other",
    learningTrust: "auto",
    learningUpdatedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await removePath(paths.root);
  await Promise.all([ensureDir(paths.rawDir), ensureDir(paths.workspaceDir), ensureDir(paths.metaDir)]);
  await writeJsonFile(paths.manifestPath, manifest);
  await writeTextFile(
    paths.rawEntrypoint,
    options.rawHtml ?? "<!doctype html><html><head><title>Fixture</title></head><body><div id=\"app\"></div></body></html>\n"
  );
  await writeTextFile(
    paths.workspaceEntrypoint,
    options.workspaceHtml ??
      [
        "<!doctype html>",
        "<html>",
        "  <head>",
        "    <meta charset=\"utf-8\">",
        "    <title>Project Fixture</title>",
        "  </head>",
        "  <body>",
        "    <div id=\"app\"></div>",
        "    <script src=\"./main.js\"></script>",
        "  </body>",
        "</html>",
        ""
      ].join("\n")
  );

  for (const [relativePath, content] of Object.entries(options.workspaceFiles ?? {})) {
    await writeTextFile(`${paths.workspaceDir}/${relativePath}`, content);
  }

  return paths;
}

export async function cleanupProjectFixture(slug: string) {
  await removePath(getProjectPaths(slug).root);
}
