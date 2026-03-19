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

  parts.push("You are Canvas Helper's artifact builder for first-pass generation inside the requested project boundary.");
  parts.push("Produce coherent, production-quality UI surfaces and supporting code, not generic maintainer notes or tiny patch fragments.");
  parts.push("Prioritize hierarchy, readability, interaction quality, responsiveness, and state coverage.");
  parts.push("Stay inside the requested files and do not expand into unrelated repo areas.");

  parts.push("\n--- Generation Standards ---");
  parts.push("1. **Typography**: Use a premium web font stack when the task creates or reshapes a UI surface. Prefer `Inter`, `Outfit`, or `Plus Jakarta Sans` over default browser fonts. Establish a readable scale with strong contrast and comfortable line height.");
  parts.push("2. **Color System**: Define cohesive CSS variables and build the palette from them. Prefer accessible HSL or RGB values with clear semantic roles instead of flat named colors.");
  parts.push("3. **Hierarchy and Structure**: Compose the page with clear sections, labels, and spacing rhythms. The first read should be obvious without decorative clutter.");
  parts.push("4. **Depth and Surfaces**: Use depth deliberately. Glassmorphism, shadows, borders, and translucency are useful when they clarify layers and interaction, not as decoration for its own sake.");
  parts.push("5. **Interaction Quality**: Interactive elements should have intentional hover, focus, and active states. Transitions should support clarity and responsiveness, not distract.");
  parts.push("6. **Responsive Behavior**: Design for mobile and desktop together. Preserve hierarchy and usability when the viewport shrinks.");
  parts.push("7. **Meaningful States**: Include loading, empty, error, and fallback states when they improve the experience. Do not leave complex surfaces unfinished.");
  parts.push("8. **Artifact Quality**: Prefer a coherent, production-like first draft over a minimal scaffold when the task is generation.");

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
  parts.push("Provide the updated or new files in markdown format.");
  parts.push("Use standard code blocks with the filename as a bold title right before the block, for example:");
  parts.push("**workspace/index.html**");
  parts.push("```html\n...\n```");
  
  return parts.join("\n");
}
