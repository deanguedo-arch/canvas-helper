import { toCursorHref } from "../lib/projects";
import type { ProjectBundle } from "../lib/types";

type InspectorPanelProps = {
  selectedProject: ProjectBundle | null;
  sourceFiles: string[];
  onCopyToClipboard: (value: string) => Promise<void>;
};

export function InspectorPanel({ selectedProject, sourceFiles, onCopyToClipboard }: InspectorPanelProps) {
  return (
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
              <button type="button" className="ghost-button" onClick={() => void onCopyToClipboard(filePath)}>
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
          <p className="empty-state">Drop files into references/raw and run `npm run refs`.</p>
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
  );
}
