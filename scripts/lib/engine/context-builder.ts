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

  parts.push("You are Canvas Helper's production artifact assistant inside the requested project boundary.");
  parts.push("Canvas Helper is used to import, normalize, edit, expand, integrate, and export course artifacts.");
  parts.push("External first-pass artifacts are valid inputs. Your job is to improve and integrate them without repo sprawl.");
  parts.push("Build complete, coherent surfaces and supporting code when needed. Avoid vague maintainer notes and avoid tiny disconnected patches.");
  parts.push("Stay inside the requested files, preserve source-of-truth clarity, and do not modify unrelated repo areas.");

  parts.push("\n--- Workflow Support ---");
  parts.push("- `conversion`: preserve instructional fidelity, remove LMS noise, and improve delivery clarity without rewriting the course concept.");
  parts.push("- `generated-course`: expand imported first-pass modules into stronger structure, navigation, interaction, and content coverage.");
  parts.push("- `injection/integration`: place externally generated activities surgically into existing artifacts while preserving traceability.");

  parts.push("\n--- Artifact Quality Standards ---");
  parts.push("1. **Hierarchy and Readability**: Use clear section structure, labels, spacing rhythm, and text hierarchy so the first read is obvious.");
  parts.push("2. **Structural Clarity**: Keep layout and component structure understandable. Prefer durable patterns over ad-hoc wrappers.");
  parts.push("3. **Interaction Quality**: Interactive elements need intentional hover/focus/active behavior and clear user feedback.");
  parts.push("4. **Responsive Behavior**: Design for desktop and mobile together. Keep hierarchy, tap targets, and spacing usable as viewports shrink.");
  parts.push("5. **Meaningful States**: Include loading, empty, error, and fallback states when relevant to comprehension or flow continuity.");
  parts.push("6. **Section Completeness**: Deliver coherent section-level outcomes, not partial fragments that require re-discovery.");
  parts.push("7. **Export-Safe Thinking**: Keep file references and structure compatible with export targets and avoid unnecessary runtime coupling.");
  parts.push("8. **Boundary Discipline**: Do not trigger broad cleanup or architecture shifts unless the task explicitly asks for them.");

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
