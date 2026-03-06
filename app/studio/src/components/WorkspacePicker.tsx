import type { ProjectBundle } from "../lib/types";

type WorkspacePickerProps = {
  selectedSlug: string;
  projects: ProjectBundle[];
  resolvedWorkspaceHtmlPath: string;
  workspaceFileOptions: string[];
  onProjectChange: (slug: string) => void;
  onHtmlChange: (htmlPath: string) => void;
  onRefresh: () => void;
};

export function WorkspacePicker({
  selectedSlug,
  projects,
  resolvedWorkspaceHtmlPath,
  workspaceFileOptions,
  onProjectChange,
  onHtmlChange,
  onRefresh
}: WorkspacePickerProps) {
  return (
    <div className="reference-picker workspace-picker">
      <label className="mini-field">
        <span>Project</span>
        <select className="mini-select" value={selectedSlug} onChange={(event) => onProjectChange(event.target.value)}>
          {projects.map((project) => (
            <option key={project.manifest.id} value={project.manifest.slug}>
              {project.manifest.slug}
            </option>
          ))}
        </select>
      </label>

      <label className="mini-field">
        <span>Root</span>
        <select className="mini-select" value="workspace" disabled>
          <option value="workspace">workspace</option>
        </select>
      </label>

      <label className="mini-field mini-field-wide">
        <span>HTML</span>
        <select className="mini-select" value={resolvedWorkspaceHtmlPath} onChange={(event) => onHtmlChange(event.target.value)}>
          {workspaceFileOptions.length ? (
            workspaceFileOptions.map((file) => (
              <option key={file} value={file}>
                {file}
              </option>
            ))
          ) : (
            <option value={resolvedWorkspaceHtmlPath}>{resolvedWorkspaceHtmlPath}</option>
          )}
        </select>
      </label>

      <button className="ghost-button compact picker-refresh" type="button" onClick={onRefresh}>
        Refresh
      </button>
    </div>
  );
}
