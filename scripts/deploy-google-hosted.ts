import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";

import { readJsonFile, writeJsonFile } from "./lib/fs.js";
import {
  buildGoogleHostedDeployContext,
  buildGoogleHostedFirebaseDeployFiles,
  formatDeployableGoogleHostedProjects,
  getFirebaseCliCommand,
  getFirebaseCliUsesShell,
  listDeployableGoogleHostedProjects,
  parseGoogleHostedDeploySelection
} from "./lib/google-hosted-deploy.js";

type FirebaseSitesListResponse = {
  result?: {
    sites?: Array<{
      name?: string;
      defaultUrl?: string;
    }>;
  };
};

async function runCommandCapture(command: string, args: string[], cwd: string) {
  return new Promise<{ exitCode: number; stdout: string; stderr: string }>((resolve) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      shell: getFirebaseCliUsesShell(),
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      const message = error instanceof Error ? error.message : String(error);
      resolve({
        exitCode: 1,
        stdout: stdout.trim(),
        stderr: `${stderr}\n${message}`.trim()
      });
    });

    child.on("close", (code) => {
      resolve({
        exitCode: code ?? 1,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      });
    });
  });
}

async function runCommandStreaming(command: string, args: string[], cwd: string) {
  return new Promise<number>((resolve) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      shell: getFirebaseCliUsesShell(),
      stdio: "inherit"
    });

    child.on("error", () => {
      resolve(1);
    });

    child.on("close", (code) => {
      resolve(code ?? 1);
    });
  });
}

async function promptForSelection(lines: string[]) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    console.log("Deployable Google Hosted projects:");
    for (const line of lines) {
      console.log(line);
    }
    console.log("");

    return await rl.question("Select module numbers to deploy (comma-separated): ");
  } finally {
    rl.close();
  }
}

async function ensureHostingSiteExists(firebaseProjectId: string, hostingSiteId: string, cwd: string) {
  const firebaseCommand = getFirebaseCliCommand();
  const result = await runCommandCapture(
    firebaseCommand,
    ["hosting:sites:list", "--project", firebaseProjectId, "--json", "--non-interactive"],
    cwd
  );

  if (result.exitCode !== 0) {
    throw new Error(result.stderr || `Failed to list Hosting sites for "${firebaseProjectId}".`);
  }

  const parsed = JSON.parse(result.stdout) as FirebaseSitesListResponse;
  const sites = parsed.result?.sites ?? [];
  const match = sites.find((site) => site.name?.endsWith(`/sites/${hostingSiteId}`));
  if (!match) {
    throw new Error(`Hosting site "${hostingSiteId}" was not found in Firebase project "${firebaseProjectId}".`);
  }
}

async function prepareDeployFiles(
  context: ReturnType<typeof buildGoogleHostedDeployContext>,
  firebaseProjectId: string,
  hostingSiteId: string
) {
  const firebaseJsonPath = path.join(context.exportDir, "firebase.json");
  const baseFirebaseJson = await readJsonFile<Record<string, unknown>>(firebaseJsonPath);
  const deployFiles = buildGoogleHostedFirebaseDeployFiles(context, baseFirebaseJson as { hosting: Record<string, unknown> });

  await writeJsonFile(firebaseJsonPath, deployFiles.firebaseJson);
  await writeJsonFile(context.firebaseRcPath, deployFiles.firebaseRc);

  return deployFiles.deployTargetName;
}

async function main() {
  const firebaseCommand = getFirebaseCliCommand();
  const deployableProjects = await listDeployableGoogleHostedProjects();
  if (deployableProjects.length === 0) {
    throw new Error("No deployable Google Hosted projects were found.");
  }

  const choiceLines = formatDeployableGoogleHostedProjects(deployableProjects);
  const selection = await promptForSelection(choiceLines);
  const selectedIndexes = parseGoogleHostedDeploySelection(selection, deployableProjects.length);
  const selectedProjects = selectedIndexes.map((index) => deployableProjects[index]).map(buildGoogleHostedDeployContext);

  const failures: string[] = [];

  for (const project of selectedProjects) {
    console.log("");
    console.log(`Preparing deploy for ${project.slug}...`);

    try {
      await ensureHostingSiteExists(project.firebaseProjectId, project.hostingSiteId, project.exportDir);
      const deployTargetName = await prepareDeployFiles(project, project.firebaseProjectId, project.hostingSiteId);
      const exitCode = await runCommandStreaming(
        firebaseCommand,
        ["deploy", "--only", `hosting:${deployTargetName}`, "--project", project.firebaseProjectId, "--non-interactive"],
        project.exportDir
      );

      if (exitCode !== 0) {
        failures.push(`${project.slug}: firebase deploy exited with code ${exitCode}`);
      }
    } catch (error) {
      failures.push(`${project.slug}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failures.length > 0) {
    console.error("");
    console.error("Google Hosted deploy finished with errors:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("");
  console.log("Google Hosted deploy complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
