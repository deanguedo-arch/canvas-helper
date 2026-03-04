import { useEffect, useMemo, useState } from "react";

type SectionManifest = {
  id: string;
  label: string;
  file: string;
  headingText?: string;
  sourceKind: "function" | "dom" | "heuristic";
  editable: boolean;
};

type ReferenceManifest = {
  id: string;
  originalPath: string;
  kind: string;
  extractionStatus: string;
  extractedTextPath?: string;
};

type ProjectBundle = {
  manifest: {
    id: string;
    slug: string;
    sourcePath: string;
    createdAt: string;
    updatedAt: string;
  };
  sectionMap: {
    sections: SectionManifest[];
  } | null;
  referenceIndex: {
    references: ReferenceManifest[];
  } | null;
  paths: {
    root: string;
    rawEntrypoint: string;
    workspaceEntrypoint: string;
    workspaceScript?: string;
    workspaceStyles?: string;
    metaDir: string;
    referencesDir: string;
  };
  styleGuide: string;
  importLog: string;
  revisions: {
    raw: number;
    workspace: number;
  };
};

function formatTimestamp(isoString: string) {
  return new Date(isoString).toLocaleString();
}

function toCursorHref(filePath: string) {
  const normalizedPath = filePath.replace(/\\/g, "/");
  return `cursor://file/${encodeURI(normalizedPath)}`;
}

async function fetchProjects() {
  const response = await fetch("/api/projects");
  if (!response.ok) {
    throw new Error("Failed to load projects.");
  }

  return (await response.json()) as ProjectBundle[];
}

export function App() {
  const [projects, setProjects] = useState<ProjectBundle[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<"raw" | "workspace">("workspace");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        const bundles = await fetchProjects();
        if (cancelled) {
          return;
        }

        setProjects(bundles);
        setSelectedSlug((currentSlug) => {
          if (currentSlug && bundles.some((bundle) => bundle.manifest.slug === currentSlug)) {
            return currentSlug;
          }

          return bundles[0]?.manifest.slug ?? "";
        });
        setErrorMessage("");
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load projects.");
        }
      }
    };

    void loadProjects();

    if (import.meta.hot) {
      import.meta.hot.on("projects:changed", () => {
        void loadProjects();
      });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedProject = useMemo(
    () => projects.find((project) => project.manifest.slug === selectedSlug) ?? null,
    [projects, selectedSlug]
  );

  const previewSrc = useMemo(() => {
    if (!selectedProject) {
      return "";
    }

    const revision = selectedProject.revisions[previewMode];
    const defaultFile = previewMode === "raw" ? "original.html" : "index.html";
    return `/preview/${previewMode}/${selectedProject.manifest.slug}/${defaultFile}?rev=${revision}`;
  }, [previewMode, selectedProject]);

  const sourceFiles = selectedProject
    ? [
        selectedProject.paths.rawEntrypoint,
        selectedProject.paths.workspaceEntrypoint,
        selectedProject.paths.workspaceScript,
        selectedProject.paths.workspaceStyles
      ].filter(Boolean) as string[]
    : [];

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">Local Studio</p>
          <h1>Canvas Helper</h1>
          <p className="lede">
            Import Canvas exports, keep a faithful raw copy, and edit the workspace version directly in Cursor/Codex.
          </p>
        </div>

        <div className="sidebar-section">
          <div className="section-header">
            <h2>Projects</h2>
            <button className="ghost-button" type="button" onClick={() => void fetchProjects().then(setProjects)}>
              Refresh
            </button>
          </div>

          {projects.length === 0 ? <p className="empty-state">No imported projects yet.</p> : null}

          <div className="project-list">
            {projects.map((project) => (
              <button
                key={project.manifest.id}
                type="button"
                className={project.manifest.slug === selectedSlug ? "project-card active" : "project-card"}
                onClick={() => setSelectedSlug(project.manifest.slug)}
              >
                <span className="project-title">{project.manifest.slug}</span>
                <span className="project-meta">Updated {formatTimestamp(project.manifest.updatedAt)}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Preview</p>
            <h2>{selectedProject?.manifest.slug ?? "No project selected"}</h2>
            {selectedProject ? <p className="source-path">{selectedProject.manifest.sourcePath}</p> : null}
          </div>

          <div className="mode-toggle" role="tablist" aria-label="Preview mode">
            <button
              type="button"
              className={previewMode === "raw" ? "mode-button active" : "mode-button"}
              onClick={() => setPreviewMode("raw")}
            >
              Raw
            </button>
            <button
              type="button"
              className={previewMode === "workspace" ? "mode-button active" : "mode-button"}
              onClick={() => setPreviewMode("workspace")}
            >
              Workspace
            </button>
          </div>
        </header>

        {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

        <div className="content-grid">
          <section className="preview-card">
            {selectedProject ? (
              <iframe
                key={previewSrc}
                className="preview-frame"
                src={previewSrc}
                title={`${selectedProject.manifest.slug} preview`}
                sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups allow-downloads"
              />
            ) : (
              <div className="empty-preview">Import a project to start previewing it here.</div>
            )}
          </section>

          <section className="inspector">
            <div className="panel-card">
              <div className="section-header">
                <h3>Source Files</h3>
              </div>
              {sourceFiles.length === 0 ? <p className="empty-state">No source files available yet.</p> : null}
              {sourceFiles.map((filePath) => (
                <div key={filePath} className="file-row">
                  <code>{filePath}</code>
                  <div className="file-actions">
                    <button type="button" className="ghost-button" onClick={() => void copyToClipboard(filePath)}>
                      Copy
                    </button>
                    <a className="ghost-button linkish" href={toCursorHref(filePath)}>
                      Cursor
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="panel-card">
              <div className="section-header">
                <h3>Sections</h3>
              </div>
              {selectedProject?.sectionMap?.sections.length ? (
                <div className="token-list">
                  {selectedProject.sectionMap.sections.map((section) => (
                    <div key={section.id} className="token-card">
                      <strong>{section.label}</strong>
                      {section.headingText ? <span>{section.headingText}</span> : <span>{section.file}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No structured sections detected yet.</p>
              )}
            </div>

            <div className="panel-card">
              <div className="section-header">
                <h3>References</h3>
              </div>
              {selectedProject?.referenceIndex?.references.length ? (
                <div className="token-list">
                  {selectedProject.referenceIndex.references.map((reference) => (
                    <div key={reference.id} className="token-card">
                      <strong>{reference.kind}</strong>
                      <span>{reference.extractionStatus}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">Drop files into the project references/raw folder and run `npm run refs`.</p>
              )}
            </div>

            <div className="panel-card">
              <div className="section-header">
                <h3>Style Guide</h3>
              </div>
              <pre className="document-view">{selectedProject?.styleGuide ?? ""}</pre>
            </div>

            <div className="panel-card">
              <div className="section-header">
                <h3>Import Log</h3>
              </div>
              <pre className="document-view">{selectedProject?.importLog ?? ""}</pre>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
