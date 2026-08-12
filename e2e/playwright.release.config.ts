import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_STUDIO_PORT);
if (!Number.isInteger(port) || port < 1_024 || port > 65_535) {
  throw new Error("The Studio release gate requires an isolated E2E_STUDIO_PORT.");
}
const host = "127.0.0.1";
const baseURL = `http://${host}:${port}`;
const repoRoot = path.resolve(import.meta.dirname, "..");
const viteCli = path.join(repoRoot, "node_modules", "vite", "bin", "vite.js");
const configuredReportPath = process.env.STUDIO_RELEASE_PLAYWRIGHT_REPORT;
const reportPath = configuredReportPath
  ? (path.isAbsolute(configuredReportPath) ? configuredReportPath : path.join(repoRoot, configuredReportPath))
  : path.join(repoRoot, ".runtime", "studio-release-playwright.json");

export default defineConfig({
  testDir: "./specs",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  forbidOnly: true,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["json", { outputFile: reportPath }]],
  use: {
    baseURL,
    trace: "retain-on-failure"
  },
  webServer: {
    command: `"${process.execPath}" "${viteCli}" --config app/studio/vite.config.ts --host ${host} --port ${port} --strictPort`,
    cwd: repoRoot,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
});
