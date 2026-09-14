import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, readdir, rm, writeFile, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

export const SHOWCASE_COURSES = [
  {
    slug: "pe10-online-pilot",
    title: "Physical Education 10 — Online",
    family: "Physical Education",
    summary: "Plan, complete, document and reflect on meaningful physical activity."
  },
  {
    slug: "marketing-10-20-online",
    title: "Marketing 10–20 — Online",
    family: "Management & Marketing",
    summary: "Develop a small business through customer service, merchandising, advertising and retail operations."
  },
  {
    slug: "marketing-30-online",
    title: "Marketing 30 — Online",
    family: "Management & Marketing",
    summary: "Make business decisions, practise sales and develop a retail launch proposal."
  },
  {
    slug: "legal-studies-30-online",
    title: "Legal Studies 30 — Online",
    family: "Legal Studies",
    summary: "Investigate fictional cases and develop evidence-based legal arguments."
  },
  {
    slug: "tourism-10-20-online",
    title: "Tourism 10–20 — Online",
    family: "Tourism",
    summary: "Respond to traveller needs and create original travel and event plans."
  },
  {
    slug: "tourism-30-online",
    title: "Tourism 30 — Online",
    family: "Tourism",
    summary: "Manage destination, accommodation and transportation scenarios."
  }
] as const;

const FIREBASE_PROJECT_ID = "calm-module-one";
const HOSTING_SITE_ID = "nxtpe10";
const HOSTING_URL = "https://nxtpe10.web.app";
const hash = (data: Uint8Array | string) => createHash("sha256").update(data).digest("hex");

async function copyFile(repo: string, stage: string, source: string, relative: string, files: Record<string, string>) {
  const sourceStat = await lstat(source);
  if (sourceStat.isSymbolicLink()) throw new Error(`Refusing symlink: ${source}`);
  if (!sourceStat.isFile()) throw new Error(`Expected a regular file: ${source}`);
  const data = await readFile(source);
  const target = path.join(stage, "public", relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, data);
  files[relative] = hash(data);
}

async function copyTree(repo: string, stage: string, source: string, relative: string, files: Record<string, string>) {
  const entries = await readdir(source, { withFileTypes: true });
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith(".")) continue;
    const childSource = path.join(source, entry.name);
    const childRelative = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) {
      await copyTree(repo, stage, childSource, childRelative, files);
    } else {
      await copyFile(repo, stage, childSource, childRelative, files);
    }
  }
}

export async function buildCtsPeShowcase(repo: string, stage: string) {
  const files: Record<string, string> = {};
  await mkdir(path.join(stage, "public"), { recursive: true });

  for (const course of SHOWCASE_COURSES) {
    const workspace = path.join(repo, "projects", course.slug, "workspace");
    await copyTree(repo, stage, workspace, path.posix.join("courses", course.slug), files);
  }

  for (const name of ["index.html", "showcase.css", "showcase.js"]) {
    await copyFile(repo, stage, path.join(repo, "scripts", "templates", "cts-pe-showcase", name), name, files);
  }

  await copyFile(
    repo,
    stage,
    path.join(repo, "projects", "pe10-online-pilot", "workspace", "assets", "brand", "nxt-ce-logo-white-with-ce.png"),
    "assets/nxt-ce-logo-white-with-ce.png",
    files
  );
  await copyFile(
    repo,
    stage,
    path.join(repo, "projects", "pe10-online-pilot", "workspace", "assets", "fonts", "HankenGrotesk-Variable.ttf"),
    "assets/HankenGrotesk-Variable.ttf",
    files
  );
  await copyFile(
    repo,
    stage,
    path.join(repo, "projects", "pe10-online-pilot", "workspace", "assets", "fonts", "WorkSans-Variable.ttf"),
    "assets/WorkSans-Variable.ttf",
    files
  );

  for (const course of SHOWCASE_COURSES) {
    for (const relative of ["index.html", "course.js", "styles.css"]) {
      const source = path.join(repo, "projects", course.slug, "workspace", relative);
      const staged = path.join(stage, "public", "courses", course.slug, relative);
      if (hash(await readFile(source)) !== files[path.posix.join("courses", course.slug, relative)]) {
        throw new Error(`Source changed during staging: ${source}`);
      }
      if (hash(await readFile(staged)) !== files[path.posix.join("courses", course.slug, relative)]) {
        throw new Error(`Staged file changed during staging: ${staged}`);
      }
    }
  }

  const release = {
    schemaVersion: 1,
    purpose: "teacher-review-only",
    createdAt: new Date().toISOString(),
    hosting: { projectId: FIREBASE_PROJECT_ID, siteId: HOSTING_SITE_ID, url: HOSTING_URL },
    selector: { entry: "index.html", courseCount: SHOWCASE_COURSES.length },
    courses: SHOWCASE_COURSES.map((course) => ({
      ...course,
      entry: `courses/${course.slug}/index.html`,
      source: `projects/${course.slug}/workspace`
    })),
    files
  };

  await writeFile(path.join(stage, "public", "release.json"), JSON.stringify(release, null, 2) + "\n");
  files["release.json"] = hash(await readFile(path.join(stage, "public", "release.json")));
  await writeFile(
    path.join(stage, "firebase.json"),
    JSON.stringify(
      {
        hosting: {
          site: HOSTING_SITE_ID,
          public: "public",
          ignore: ["firebase.json", "**/.*"],
          headers: [
            {
              source: "**",
              headers: [{ key: "Cache-Control", value: "no-cache, max-age=0, must-revalidate" }]
            }
          ]
        }
      },
      null,
      2
    ) + "\n"
  );

  return { publicRoot: path.join(stage, "public"), release };
}

async function run(command: string, args: string[], cwd: string) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`))));
  });
}

export async function verifyLive(release: { files: Record<string, string> }, base = HOSTING_URL) {
  const rows = Object.entries(release.files);
  let next = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (next < rows.length) {
        const [relative, expected] = rows[next++];
        let match = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          const response = await fetch(`${base}/${relative}?review=${expected.slice(0, 12)}`, {
            signal: AbortSignal.timeout(60000)
          });
          if (response.ok && hash(new Uint8Array(await response.arrayBuffer())) === expected) {
            match = true;
            break;
          }
        }
        if (!match) throw new Error(`Live bytes do not match: ${relative}`);
      }
    })
  );
  return { fileCount: rows.length, allFilesMatch: true };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--deploy")) throw new Error("Use --deploy to publish the CTS/PE course library.");
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  for (const course of SHOWCASE_COURSES) {
    await run("npm", ["run", "verify", "--", "--project", course.slug, "--mode", "workspace"], repo);
  }

  const stage = await mkdtemp(path.join(os.tmpdir(), "cts-pe-showcase-"));
  try {
    const { release, publicRoot } = await buildCtsPeShowcase(repo, stage);
    console.log(`Review files staged at ${publicRoot}`);
    if (!args.includes("--deploy")) return;

    await run(
      process.execPath,
      [
        path.join(repo, "node_modules", "firebase-tools", "lib", "bin", "firebase.js"),
        "deploy",
        "--project",
        FIREBASE_PROJECT_ID,
        "--config",
        path.join(stage, "firebase.json"),
        "--only",
        "hosting",
        "--non-interactive"
      ],
      stage
    );

    const verification = await verifyLive(release);
    const receipt = {
      ...release,
      deployedAt: new Date().toISOString(),
      verification,
      learnerRelease: false,
      studioEdit: false,
      exportsEnabled: false,
      note: "Shared review selector replacing the previous PE-only root deployment. Course source files remain canonical in workspace/**."
    };
    const receiptPath = path.join(repo, "docs", "ops", "cts-pe-showcase-deployment.json");
    await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + "\n");
    console.log(JSON.stringify({ url: HOSTING_URL, verification, receiptPath }, null, 2));
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
