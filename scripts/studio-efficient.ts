import { spawn, spawnSync } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const status = spawnSync(npm, ["run", "agents:status"], { stdio: "inherit" });
if (status.error || status.status !== 0) {
  console.warn("Agent status is unavailable; starting Studio with the compact session path.");
}
const child = spawn(npm, ["run", "studio:codex:session", "--", "--no-headroom", ...process.argv.slice(2)], { stdio: "inherit" });
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 0;
});
