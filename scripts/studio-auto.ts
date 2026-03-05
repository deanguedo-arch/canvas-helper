import { spawn, type ChildProcess } from "node:child_process";

function startProcess(label: string, args: string[]) {
  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  const child = spawn(command, args, {
    stdio: "inherit"
  });

  child.on("exit", (code) => {
    const exitCode = code ?? 0;
    if (exitCode !== 0) {
      console.error(`[studio:auto] ${label} exited with code ${exitCode}.`);
    }
  });

  return child;
}

function stopProcess(child: ChildProcess | null) {
  if (!child || child.killed) {
    return;
  }

  child.kill("SIGINT");
}

async function main() {
  console.log("[studio:auto] starting studio + incoming watcher...");

  const studio = startProcess("studio", ["run", "studio"]);
  const watcher = startProcess("watch:incoming", ["run", "watch:incoming"]);

  let shuttingDown = false;
  const shutdown = (code = 0) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    stopProcess(studio);
    stopProcess(watcher);

    setTimeout(() => {
      process.exit(code);
    }, 200);
  };

  studio.on("exit", (code) => {
    if (!shuttingDown) {
      shutdown(code ?? 0);
    }
  });

  watcher.on("exit", (code) => {
    if (!shuttingDown) {
      shutdown(code ?? 0);
    }
  });

  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
