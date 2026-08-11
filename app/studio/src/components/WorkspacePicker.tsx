import type { ProjectBundle } from "../lib/types";
import { getProjectLabel, getProjectSubjectGroups } from "../lib/project-display";

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
  const projectGroups = getProjectSubjectGroups(projects);

  const pageLabel = (file: string) => {
    if (file === "index.html") return "Course overview";
    const stem = file.replace(/\.html?$/i, "").split("/").pop() ?? file;
    return stem
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <div className="workspace-picker">
      <label className="mini-field">
        <span>Course</span>
        <select
          className="mini-select"
          value={selectedSlug}
          onChange={(event) => onProjectChange(event.target.value)}
          data-testid="workspace-project-select"
        >
          {projectGroups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.projects.map((project) => (
                <option key={project.manifest.id} value={project.manifest.slug}>
                  {getProjectLabel(project.manifest.slug)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label className="mini-field page-field">
        <span>Page</span>
        <select
          className="mini-select"
          value={resolvedWorkspaceHtmlPath}
          onChange={(event) => onHtmlChange(event.target.value)}
          data-testid="workspace-html-select"
        >
          {workspaceFileOptions.length ? (
            workspaceFileOptions.map((file) => (
              <option key={file} value={file} title={file}>
                {pageLabel(file)}
              </option>
            ))
          ) : (
            <option value={resolvedWorkspaceHtmlPath}>{pageLabel(resolvedWorkspaceHtmlPath)}</option>
          )}
        </select>
      </label>

      <button
        className="picker-refresh"
        type="button"
        onClick={onRefresh}
        data-testid="workspace-refresh-button"
        aria-label="Refresh course list"
        title="Refresh course list"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path d="M15.2 7A5.75 5.75 0 1 0 16 11M15.2 7V3.8M15.2 7H12" />
        </svg>
      </button>
    </div>
  );
}
