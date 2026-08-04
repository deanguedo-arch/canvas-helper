import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { repoRoot } from "../../scripts/lib/paths";
import { createStudioServerPlugin } from "../server/studio-server";

export default defineConfig({
  root: path.join(repoRoot, "app", "studio"),
  plugins: [react(), createStudioServerPlugin()],
  server: {
    host: "127.0.0.1",
    fs: {
      allow: [repoRoot]
    }
  },
  build: {
    outDir: path.join(repoRoot, "dist", "studio"),
    emptyOutDir: true
  }
});
