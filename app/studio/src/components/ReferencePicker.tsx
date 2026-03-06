import type { ReferenceTarget } from "../lib/types";

type ReferencePickerProps = {
  target: ReferenceTarget;
  projectOptions: string[];
  htmlOptions: string[];
  resourceOptions: string[];
  onProjectChange: (slug: string) => void;
  onSourceChange: (source: "html" | "resource") => void;
  onRootChange: (root: "raw" | "workspace") => void;
  onHtmlChange: (htmlPath: string) => void;
  onResourceRootChange: (root: "raw" | "extracted") => void;
  onResourcePathChange: (resourcePath: string) => void;
};

export function ReferencePicker({
  target,
  projectOptions,
  htmlOptions,
  resourceOptions,
  onProjectChange,
  onSourceChange,
  onRootChange,
  onHtmlChange,
  onResourceRootChange,
  onResourcePathChange
}: ReferencePickerProps) {
  return (
    <div className="reference-picker">
      <label className="mini-field">
        <span>Project</span>
        <select className="mini-select" value={target.projectSlug} onChange={(event) => onProjectChange(event.target.value)}>
          {projectOptions.map((slug) => (
            <option key={slug} value={slug}>
              {slug}
            </option>
          ))}
        </select>
      </label>

      <label className="mini-field">
        <span>Source</span>
        <select
          className="mini-select"
          value={target.source}
          onChange={(event) => onSourceChange(event.target.value === "resource" ? "resource" : "html")}
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
            <select className="mini-select" value={target.htmlPath} onChange={(event) => onHtmlChange(event.target.value)}>
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
            <span>Ref Root</span>
            <select
              className="mini-select"
              value={target.resourceRoot}
              onChange={(event) => onResourceRootChange(event.target.value === "extracted" ? "extracted" : "raw")}
            >
              <option value="raw">references/raw</option>
              <option value="extracted">references/extracted</option>
            </select>
          </label>

          <label className="mini-field mini-field-wide">
            <span>Resource</span>
            <select
              className="mini-select"
              value={target.resourcePath}
              onChange={(event) => onResourcePathChange(event.target.value)}
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
    </div>
  );
}
