import path from "node:path";
import fs from "node:fs/promises";
import { type ProjectPaths } from "../types.js";

export interface GenerationContextRequest {
  slug: string;
  roots: ProjectPaths;
  includeBlueprint?: boolean;
  includeResourceCatalog?: boolean;
  lessonPackets?: string[]; // IDs or filenames
}

export async function buildGenerationContext(request: GenerationContextRequest): Promise<string> {
  const parts: string[] = [];
  
  parts.push("You are Canvas Helper's internal generative assistant. Your task is to generate or edit project files based on the requested instruction and provided context.");
  parts.push("\n--- Context ---");

  if (request.includeBlueprint) {
    try {
      const p = path.join(request.roots.metaDir, "course-blueprint.json");
      const content = await fs.readFile(p, "utf-8");
      parts.push(`\n# Course Blueprint:\n\`\`\`json\n${content}\n\`\`\``);
    } catch (err) {
      parts.push("\n# Course Blueprint: (Not found)");
    }
  }

  if (request.includeResourceCatalog) {
    try {
      const p = path.join(request.roots.metaDir, "resource-catalog.json");
      const content = await fs.readFile(p, "utf-8");
      parts.push(`\n# Resource Catalog:\n\`\`\`json\n${content}\n\`\`\``);
    } catch (err) {
       parts.push("\n# Resource Catalog: (Not found)");
    }
  }

  if (request.lessonPackets && request.lessonPackets.length > 0) {
    const packetsDir = path.join(request.roots.metaDir, "lesson-packets");
    for (const packetId of request.lessonPackets) {
       try {
         const p = path.join(packetsDir, packetId.endsWith(".json") ? packetId : `${packetId}.json`);
         const content = await fs.readFile(p, "utf-8");
         parts.push(`\n# Lesson Packet ${packetId}:\n\`\`\`json\n${content}\n\`\`\``);
       } catch (err) {
         parts.push(`\n# Lesson Packet ${packetId}: (Not found)`);
       }
    }
  }

  parts.push("\n--- Output Instructions ---");
  parts.push("Please provide the updated or new files inside markdown format.");
  parts.push("Use standard codeblocks with the filename as a bold title right before the block, e.g.");
  parts.push("**workspace/index.html**");
  parts.push("```html\n...\n```");
  
  return parts.join("\n");
}
