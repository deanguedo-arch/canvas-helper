import { spawn } from "node:child_process";

import { repoRoot } from "../../../scripts/lib/paths.js";
import { resolveStudioCommandArgs } from "../../shared/studio-commands.js";

import type { StudioCommandName } from "./types";

function trimCommandOutput(value: string, maxChars = 12000) {
  if (value.length <= maxChars) {
    return value;
  }

  return `...<truncated>\n${value.slice(value.length - maxChars)}`;
}

export async function runStudioCommand(slug: string, commandName: StudioCommandName) {
  const commandArgs = resolveStudioCommandArgs(slug, commandName);
  if (!commandArgs) {
    throw new Error(`Unsupported command: ${commandName}`);
  }

  const isWindows = process.platform === "win32";
  const npmCommand = isWindows ? "npm.cmd" : "npm";
  const spawnCommand = isWindows ? [npmCommand, ...commandArgs].join(" ") : npmCommand;
  const spawnArgs = isWindows ? [] : commandArgs;
  const startedAt = new Date().toISOString();

  return new Promise<{
    ok: boolean;
    command: StudioCommandName;
    slug: string;
    exitCode: number;
    startedAt: string;
    finishedAt: string;
    stdout: string;
    stderr: string;
  }>((resolve) => {
    const child = spawn(spawnCommand, spawnArgs, {
      cwd: repoRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: isWindows
    });

    let stdout = "";
    let stderr = "";
    let done = false;

    const finish = (exitCode: number, extraError?: string) => {
      if (done) {
        return;
      }

      done = true;
      const combinedStderr = extraError ? `${stderr}\n${extraError}`.trim() : stderr.trim();
      resolve({
        ok: exitCode === 0,
        command: commandName,
        slug,
        exitCode,
        startedAt,
        finishedAt: new Date().toISOString(),
        stdout: trimCommandOutput(stdout.trim()),
        stderr: trimCommandOutput(combinedStderr)
      });
    };

    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      finish(1, error instanceof Error ? error.message : String(error));
    });

    child.on("close", (code) => {
      finish(code ?? 1);
    });
  });
}
