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
  
  parts.push("You are Canvas Helper's internal generative assistant, an expert UX/UI developer specifically trained to build stunning, modern interactive web components.");
  
  parts.push("\n--- GOD TIER DESIGN & AESTHETIC REQUIREMENTS ---");
  parts.push("You MUST follow these rules exactly to ensure your output matches the quality of top-tier consumer web applications:");
  parts.push("\n1. **Typography**: ALWAYS import and use a premium Google Font (e.g., 'Inter', 'Outfit', or 'Plus Jakarta Sans'). Never use default browser serif/sans-serif. Set responsive `line-height` and `letting` for maximum readability.");
  parts.push("\n2. **CSS Variables & Theming**: ALWAYS define a `:root` block with a cohesive, professional color palette. Use vibrant but accessible HSL/RGB values instead of flat named colors like 'blue' or 'red'.");
  parts.push("\n3. **Glassmorphism & Depth**: Wrap core content areas or interactive cards in stylish glassmorphism containers. Use properties like `backdrop-filter: blur(12px)`, subtle semi-transparent white/black backgrounds, and soft, multi-layered `box-shadow` to create physical depth.");
  parts.push("\n4. **Micro-Interactions**: The UI MUST feel alive. Apply `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` to all interactive elements. Buttons and cards MUST have distinct `:hover` (e.g., `transform: translateY(-2px)`, increased shadow) and `:active` (e.g., `transform: scale(0.98)`) states.");
  parts.push("\n5. **Spacious Layouts**: Use generous padding/margins (e.g., `padding: 2rem`, `gap: 1.5rem`). Let elements breathe. Avoid dense, cramped text walls.");
  parts.push("\n6. **Empty/Loading States**: If generating a complex component, include beautiful, styled empty states or skeleton loaders with gentle pulse animations.");
  parts.push("\nFAILURE to include these specific CSS techniques will result in rejection. Output code that is visually breathtaking out-of-the-box.");

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
