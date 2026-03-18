import path from "node:path";
import fs from "node:fs/promises";
import { type ProjectPaths } from "../types.js";

export interface ApplyGenerationOptions {
  slug: string;
  roots: ProjectPaths;
  llmResponse: string;
}

export interface AppliedFile {
  relativePath: string;
  content: string;
}

export async function applyGeneration(options: ApplyGenerationOptions): Promise<AppliedFile[]> {
  const { roots, llmResponse } = options;
  
  // A simple heuristic to extract code blocks associated with filenames.
  // We look for patterns like:
  // **workspace/index.html**
  // ```html
  // <body>...</body>
  // ```
  
  const results: AppliedFile[] = [];
  const regex = /\*\*([^*]+)\*\*\s*```\w*\n([\s\S]*?)```/g;
  
  let match;
  while ((match = regex.exec(llmResponse)) !== null) {
    const rawPath = match[1].trim();
    const content = match[2];
    
    // Only allow writing to workspace
    if (!rawPath.startsWith("workspace/") && !rawPath.startsWith("workspace\\")) {
       console.warn(`Attempted to apply generation to restricted path: ${rawPath}. Ignoring.`);
       continue;
    }

    const relativePath = rawPath.replace(/^workspace[\/\\]/, "");
    const absolutePath = path.join(roots.workspaceDir, relativePath);
    
    // Ensure the directory exists
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    
    // Write
    await fs.writeFile(absolutePath, content, "utf-8");
    results.push({ relativePath: rawPath, content });
  }

  return results;
}
