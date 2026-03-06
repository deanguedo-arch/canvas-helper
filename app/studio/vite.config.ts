import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { repoRoot } from "../../scripts/lib/paths.js";
import { createStudioServerPlugin } from "../server/studio-server.js";

export default defineConfig({
  root: path.join(repoRoot, "app", "studio"),
  plugins: [react(), createStudioServerPlugin()],
  server: {
    fs: {
      allow: [repoRoot]
    }
  },
  build: {
    outDir: path.join(repoRoot, "dist", "studio"),
    emptyOutDir: true
  }
});
