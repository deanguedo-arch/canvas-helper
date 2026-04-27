import { spawn, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import net from "node:net";

const STUDIO_HOST = "127.0.0.1";
const npmCommand = process.platform === "win32" ? "cmd.exe" : "npm";

function buildNpmArgs(args: string[]) {
  return process.platform === "win32" ? ["/d", "/s", "/c", "npm.cmd", ...args] : args;
}

let dryRun = false;
let runMigrate = false;
let runHeadroomContext = true;

function usage() {
  return "Usage: npm run studio:codex:session -- [--dry-run] [--migrate] [--no-headroom]";
}

for (const arg of process.argv.slice(2)) {
  if (arg === "--dry-run") {
    dryRun = true;
  } else if (arg === "--migrate") {
    runMigrate = true;
  } else if (arg === "--no-headroom") {
    runHeadroomContext = false;
  } else {
    console.error(`Unknown option: ${arg}`);
    console.error(usage());
    process.exit(1);
  }
}

function ensureLayout() {
  mkdirSync("projects/incoming", { recursive: true });
  mkdirSync("projects/processed", { recursive: true });
  mkdirSync("projects/resources", { recursive: true });
}

function runNpm(args: string[], options: { allowFailure?: boolean } = {}) {
  const result = spawnSync(npmCommand, buildNpmArgs(args), { stdio: "inherit" });
  if (result.error) {
    if (!options.allowFailure) {
      throw result.error;
    }

    console.error(result.error.message);
    return 1;
  }

  if (result.status && !options.allowFailure) {
    process.exit(result.status);
  }

  return result.status ?? 0;
}

function isPortFree(port: number) {
  return new Promise<boolean>((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, STUDIO_HOST);
  });
}

async function resolveStudioPort() {
  for (let port = 5173; port <= 5193; port += 1) {
    if (await isPortFree(port)) {
      return port;
    }
  }

  throw new Error("Could not find a free Studio port between 5173 and 5193.");
}

function runHeadroom() {
  if (!runHeadroomContext) {
    console.log("Skipping Headroom (--no-headroom).");
    return;
  }

  console.log("Running Headroom context pack...");
  const status = runNpm(["run", "headroom"], { allowFailure: true });
  if (status !== 0) {
    console.log("Headroom failed; continuing Studio startup. Run npm run headroom -- --project <slug> manually if needed.");
  }
}

function printPromptStarters(studioUrl: string) {
  console.log(`
==============================================
  Codex Prompt Starters
==============================================

[UI edit]
Edit project: <slug>
Files: projects/<slug>/workspace/index.html, projects/<slug>/workspace/styles.css, projects/<slug>/workspace/main.js
Goal: <describe the visual/behavior change>
Acceptance checks:
- Keep course content structure intact
- Keep mobile and desktop layout usable
- Run npm run build:studio after edits

[Image generate/edit]
Project: <slug>
Task: <generate new image | edit existing image>
Output file: projects/<slug>/workspace/assets/images/<file-name>.webp
Also do:
1) update projects/<slug>/meta/images-manifest.json
2) run npm run sync:course-images -- --project <slug>
3) confirm image placement in Studio preview

Studio URL: ${studioUrl}`);
}

function startBrowser(studioUrl: string) {
  try {
    if (process.platform === "win32") {
      const child = spawn("cmd", ["/c", "start", "", studioUrl], { detached: true, stdio: "ignore" });
      child.unref();
    } else if (process.platform === "darwin") {
      spawn("open", [studioUrl], { detached: true, stdio: "ignore" }).unref();
    } else {
      spawn("xdg-open", [studioUrl], { detached: true, stdio: "ignore" }).unref();
    }
  } catch {
    // Browser launch is convenience-only; Studio startup should continue.
  }
}

async function main() {
  ensureLayout();

  if (runMigrate) {
    console.log("Normalizing project layout...");
    runNpm(["run", "migrate:projects"]);
  } else {
    console.log("Skipping migrate:projects (use --migrate when you want layout normalization).");
  }

  runHeadroom();

  const studioPort = await resolveStudioPort();
  const studioUrl = `http://${STUDIO_HOST}:${studioPort}`;
  printPromptStarters(studioUrl);

  if (dryRun) {
    console.log("");
    console.log("Dry run mode: Studio was not started.");
    return;
  }

  startBrowser(studioUrl);
  console.log("");
  console.log(`Starting Studio on ${studioUrl} ...`);

  const studio = spawn(
    npmCommand,
    buildNpmArgs(["run", "studio", "--", "--host", STUDIO_HOST, "--port", String(studioPort), "--clearScreen", "false"]),
    { stdio: "inherit" }
  );

  studio.on("exit", (code) => {
    process.exitCode = code ?? 0;
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
