import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./specs",
  testMatch: ["scorm-tracking.spec.ts", "science-scorm.spec.ts"],
  outputDir: "../test-results/scorm",
  timeout: 30_000,
  workers: 1,
  reporter: "list",
  use: { ...devices["Desktop Chrome"], trace: "retain-on-failure" }
});
