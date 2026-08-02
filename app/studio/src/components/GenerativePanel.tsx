import { useEffect, useState } from "react";
import type { ProjectBundle } from "../lib/types";

export interface GenerativePanelProps {
  selectedProject: ProjectBundle | null;
  onClose: () => void;
}

export function GenerativePanel({ selectedProject, onClose }: GenerativePanelProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [contextIdInput, setContextIdInput] = useState("");
  const [provider, setProvider] = useState<"gemini" | "openai">("gemini");

  useEffect(() => {
    setContextIdInput("");
    setResult(null);
    setError(null);
  }, [selectedProject?.manifest.slug]);

  if (!selectedProject) {
    return (
      <aside className="inspector-panel">
        <div className="panel-header">
          <h2>Generative Engine</h2>
          <button type="button" onClick={onClose} aria-label="Close Generative Engine">✕</button>
        </div>
        <div className="panel-content">
          <p>Select a project first.</p>
        </div>
      </aside>
    );
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: selectedProject.manifest.slug,
          prompt,
          contextIds: contextIdInput.split(/[\s,]+/).filter(Boolean),
          provider
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const contextNote = typeof data.contextBytes === "number" ? ` using ${data.contextBytes.toLocaleString()} bytes of selected context` : "";
      setResult(`Applied changes to ${data.appliedFiles?.length || 0} file(s) in workspace${contextNote}.`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <aside className="inspector-panel" style={{ width: 400, display: "flex", flexDirection: "column" }}>
      <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", padding: "1rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Assistant</h2>
        <button type="button" onClick={onClose} aria-label="Close Assistant">✕</button>
      </div>

      <div className="panel-content" style={{ padding: "1rem", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        <div>
          <h3 style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.5rem" }}>Model Provider</h3>
          <select 
            value={provider} 
            onChange={(e) => setProvider(e.target.value as "gemini" | "openai")}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", backgroundColor: "var(--bg-layer-2)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
          >
            <option value="gemini">Google Gemini (Gemini 2.5 Pro)</option>
            <option value="openai">OpenAI (GPT-4o)</option>
          </select>
        </div>

        <div>
          <h3 style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.5rem" }}>Optional evidence IDs</h3>
          <textarea
            value={contextIdInput}
            onChange={(event) => setContextIdInput(event.target.value)}
            style={{ width: "100%", minHeight: "74px", padding: "0.5rem", resize: "vertical" }}
            placeholder="unit:unit-1, lesson:lesson-id"
            aria-label="Optional evidence IDs"
          />
          <p style={{ margin: "0.35rem 0 0", color: "#666", fontSize: "0.8rem", lineHeight: 1.35 }}>
            Comma-separate exact IDs as unit:, outcome:, resource:, or lesson:. No blueprint, catalog, or lesson packet is loaded unless you name it.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "0.5rem" }}>
          <h3 style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>Prompt</h3>
          <textarea 
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            style={{ flex: 1, width: "100%", padding: "0.5rem", resize: "none", minHeight: "150px" }}
            placeholder="E.g., Build a drag and drop interactive practice activity for the chemistry lesson."
          />
        </div>

        <button 
          type="button" 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt.trim()}
          style={{ width: "100%", padding: "0.75rem", backgroundColor: "#0056b3", color: "#fff", border: "none", borderRadius: "4px", cursor: isGenerating ? "wait" : "pointer" }}
        >
          {isGenerating ? "Generating..." : "Generate and Apply"}
        </button>

        {result && (
          <div style={{ padding: "0.75rem", backgroundColor: "#d4edda", color: "#155724", borderRadius: "4px" }}>
            {result}
            <div style={{ marginTop: "0.5rem", fontSize: "0.85em" }}>Refresh the preview pane to see changes.</div>
          </div>
        )}
        {error && (
          <div style={{ padding: "0.75rem", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "4px" }}>
            {error}
          </div>
        )}

      </div>
    </aside>
  );
}
