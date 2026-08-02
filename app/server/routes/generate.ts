import { Buffer } from "node:buffer";
import type { IncomingMessage, ServerResponse } from "node:http";
import { parse } from "node:url";
import { getProjectPaths } from "../../../scripts/lib/paths.ts";
import { buildGenerationContext, parseGenerationContextIds } from "../../../scripts/lib/engine/context-builder.ts";
import { generateContent, type LlmProvider } from "../../../scripts/lib/engine/llm.ts";
import { applyGeneration, assertGenerationWriteEligible } from "../../../scripts/lib/engine/apply-generation.ts";

// Basic JSON response helper
function jsonResponse(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

export async function handleGenerateRoute(url: string, request: IncomingMessage, response: ServerResponse): Promise<boolean> {
  const parsed = parse(url, true);
  
  if (parsed.pathname !== "/api/generate" || request.method !== "POST") {
    return false;
  }

  let bodyData = "";
  request.on("data", (chunk) => {
    bodyData += chunk.toString();
  });

  request.on("end", async () => {
    try {
      const payload = JSON.parse(bodyData);
      const { slug, prompt, contextIds, provider } = payload;
      
      if (typeof slug !== "string" || typeof prompt !== "string" || !slug.trim() || !prompt.trim()) {
        return jsonResponse(response, 400, { error: "Missing slug or prompt" });
      }
      if (provider !== undefined && provider !== "gemini" && provider !== "openai") {
        return jsonResponse(response, 400, { error: "Unsupported model provider" });
      }

      const roots = getProjectPaths(slug);
      const selectedContextIds = parseGenerationContextIds(contextIds);
      const selectedProvider: LlmProvider = provider === "openai" ? "openai" : "gemini";

      // Reject unsupported project drivers before spending model tokens.
      await assertGenerationWriteEligible({ slug, roots });

      const systemContext = await buildGenerationContext({
        slug,
        roots,
        contextIds: selectedContextIds
      });

      const resultText = await generateContent(systemContext, prompt, selectedProvider);

      // We could optionally just return the response to the UI instead of applying immediately.
      // But let's apply for now, and return what we applied.
      const appliedFiles = await applyGeneration({
        slug,
        roots,
        llmResponse: resultText
      });

      jsonResponse(response, 200, { 
        success: true, 
        appliedFiles,
        rawResponse: resultText,
        contextBytes: Buffer.byteLength(systemContext, "utf8"),
        contextIds: selectedContextIds
      });

    } catch (err: any) {
      console.error("Generate error:", err);
      jsonResponse(response, 500, { error: err.message || "Generate failed" });
    }
  });

  return true;
}
