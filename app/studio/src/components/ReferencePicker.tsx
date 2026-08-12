import { getProjectLabel, getProjectMetadataGroups } from "../lib/project-display";
import type { ProjectBundle, ReferenceTarget } from "../lib/types";

type ReferencePickerProps = {
  target: ReferenceTarget;
  projects: ProjectBundle[];
  htmlOptions: string[];
  resourceOptions: string[];
  incomingRefreshRunning: boolean;
  incomingRefreshMessage: string;
  incomingRefreshIsError: boolean;
  onProjectChange: (slug: string) => void;
  onSourceChange: (source: "html" | "resource") => void;
  onRootChange: (root: "raw" | "workspace") => void;
  onHtmlChange: (htmlPath: string) => void;
  onResourceRootChange: (root: "raw" | "extracted") => void;
  onResourcePathChange: (resourcePath: string) => void;
  onRefreshIntake: () => void;
};

export function ReferencePicker({
  target,
  projects,
  htmlOptions,
  resourceOptions,
  incomingRefreshRunning,
  incomingRefreshMessage,
  incomingRefreshIsError,
  onProjectChange,
  onSourceChange,
  onRootChange,
  onHtmlChange,
  onResourceRootChange,
  onResourcePathChange,
  onRefreshIntake
}: ReferencePickerProps) {
  const projectGroups = getProjectMetadataGroups(projects);

  return (
    <div className="picker-stack">
      <div className="reference-picker">
        <label className="mini-field">
          <span>Project</span>
          <select
            className="mini-select"
            value={target.projectSlug}
            onChange={(event) => onProjectChange(event.target.value)}
            data-testid="reference-project-select"
          >
            {projectGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.projects.map((project) => (
                  <option key={project.manifest.id} value={project.manifest.slug}>
                    {getProjectLabel(project)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="mini-field">
          <span>Source</span>
          <select
            className="mini-select"
            value={target.source}
            onChange={(event) => onSourceChange(event.target.value === "resource" ? "resource" : "html")}
            data-testid="reference-source-select"
          >
            <option value="html">html</option>
            <option value="resource">resource</option>
          </select>
        </label>

        {target.source === "html" ? (
          <>
            <label className="mini-field">
              <span>Root</span>
              <select
                className="mini-select"
                value={target.root}
                onChange={(event) => onRootChange(event.target.value === "workspace" ? "workspace" : "raw")}
              >
                <option value="raw">raw</option>
                <option value="workspace">workspace</option>
              </select>
            </label>

            <label className="mini-field mini-field-wide">
              <span>HTML</span>
              <select
                className="mini-select"
                value={target.htmlPath}
                onChange={(event) => onHtmlChange(event.target.value)}
                data-testid="reference-html-select"
              >
                {htmlOptions.length ? (
                  htmlOptions.map((file) => (
                    <option key={file} value={file}>
                      {file}
                    </option>
                  ))
                ) : (
                  <option value={target.htmlPath}>{target.htmlPath}</option>
                )}
              </select>
            </label>
          </>
        ) : (
          <>
            <label className="mini-field">
              <span>View</span>
              <select
                className="mini-select"
                value={target.resourceRoot}
                onChange={(event) => onResourceRootChange(event.target.value === "extracted" ? "extracted" : "raw")}
              >
                <option value="raw">Resources</option>
                <option value="extracted">Extracted</option>
              </select>
            </label>

            <label className="mini-field mini-field-wide">
              <span>Resource</span>
              <select
                className="mini-select"
                value={target.resourcePath}
                onChange={(event) => onResourcePathChange(event.target.value)}
                data-testid="reference-resource-select"
              >
                {resourceOptions.length ? (
                  resourceOptions.map((filePath) => (
                    <option key={filePath} value={filePath}>
                      {filePath}
                    </option>
                  ))
                ) : (
                  <option value="">No resources indexed</option>
                )}
              </select>
            </label>
          </>
        )}

        <button className="ghost-button compact picker-refresh" type="button" disabled={incomingRefreshRunning} onClick={onRefreshIntake}>
          {incomingRefreshRunning ? "Refreshing..." : "Refresh Intake"}
        </button>
      </div>

      {incomingRefreshMessage ? (
        <div className={incomingRefreshIsError ? "status-banner error picker-status" : "status-banner picker-status"}>
          {incomingRefreshMessage}
        </div>
      ) : null}
    </div>
  );
}
