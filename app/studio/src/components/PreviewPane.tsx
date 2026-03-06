import type { CSSProperties, ReactNode } from "react";

import { getReferenceResourceRenderMode } from "../reference-resource-preview";
import { DEVICE_PRESETS, type PreviewLayoutPreferences, type PreviewMode } from "../lib/types";

type PreviewPaneProps = {
  mode: PreviewMode;
  previewMode: PreviewMode;
  layoutPreferences: PreviewLayoutPreferences;
  controlsVisible: boolean;
  onToggleControls: (mode: PreviewMode) => void;
  onMatch: (mode: PreviewMode) => void;
  onFit: (mode: PreviewMode) => void;
  onDeviceChange: (mode: PreviewMode, device: "desktop" | "tablet" | "mobile") => void;
  onZoomChange: (mode: PreviewMode, zoom: number) => void;
  registerPreviewFrame: (mode: PreviewMode, node: HTMLIFrameElement | null) => void;
  onPreviewLoad: (mode: PreviewMode) => void;
  previewSrc: string;
  picker: ReactNode;
  toolbar?: ReactNode;
  resourcePreview?: {
    resourcePath: string;
    resourceRoot: "raw" | "extracted";
    previewUrl: string;
    extractedFallbackPath: string;
    onOpenExtractedText: () => void;
    isViewingSelectedExtractedText: boolean;
  };
};

export function PreviewPane({
  mode,
  previewMode,
  layoutPreferences,
  controlsVisible,
  onToggleControls,
  onMatch,
  onFit,
  onDeviceChange,
  onZoomChange,
  registerPreviewFrame,
  onPreviewLoad,
  previewSrc,
  picker,
  toolbar,
  resourcePreview
}: PreviewPaneProps) {
  const devicePreset = DEVICE_PRESETS[layoutPreferences.devices[mode]];
  const zoomScale = layoutPreferences.zooms[mode] / 100;
  const previewCanvasStyle = {
    "--device-width": devicePreset.width,
    "--zoom-scale": String(zoomScale)
  } as CSSProperties;

  const title = mode === "workspace" ? "Workspace" : "Reference";
  const resourceRenderMode = resourcePreview
    ? getReferenceResourceRenderMode(resourcePreview.resourcePath, resourcePreview.resourceRoot)
    : "fallback";
  const shouldUsePdfResourcePreview = Boolean(resourcePreview && resourceRenderMode === "inline-pdf");
  const shouldUseResourceFallback = Boolean(resourcePreview && resourceRenderMode === "fallback");

  return (
    <article key={mode} className="preview-pane">
      <div className="preview-pane-header">
        <h3>{title}</h3>

        <div className="pane-header-actions">
          {mode === "reference" && resourcePreview?.extractedFallbackPath ? (
            <button
              type="button"
              className="ghost-button compact pane-utility-button"
              disabled={resourcePreview.isViewingSelectedExtractedText}
              onClick={resourcePreview.onOpenExtractedText}
            >
              {resourcePreview.isViewingSelectedExtractedText ? "Viewing Text" : "Extracted Text"}
            </button>
          ) : null}

          {layoutPreferences.compareMode ? (
            <button type="button" className="ghost-button compact pane-match-button" onClick={() => onMatch(mode)}>
              Match
            </button>
          ) : null}

          <button type="button" className="ghost-button compact pane-toggle-button" onClick={() => onToggleControls(mode)}>
            {controlsVisible ? "Hide Controls" : "Show Controls"}
          </button>
        </div>
      </div>

      {controlsVisible ? picker : null}

      {controlsVisible ? (
        <div className="preview-pane-controls">
          <div className="segmented-control compact">
            {Object.entries(DEVICE_PRESETS).map(([deviceMode, preset]) => (
              <button
                key={`${mode}:${deviceMode}`}
                type="button"
                className={layoutPreferences.devices[mode] === deviceMode ? "segmented-button active" : "segmented-button"}
                onClick={() => onDeviceChange(mode, deviceMode as "desktop" | "tablet" | "mobile")}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="zoom-controls">
            <button type="button" className="ghost-button compact fit-button" onClick={() => onFit(mode)}>
              Fit
            </button>
            <label className="zoom-control">
              <span>Zoom</span>
              <input
                className="zoom-slider"
                type="range"
                min="60"
                max="140"
                step="5"
                value={layoutPreferences.zooms[mode]}
                onChange={(event) => onZoomChange(mode, Number(event.target.value))}
              />
              <strong>{layoutPreferences.zooms[mode]}%</strong>
            </label>
          </div>
        </div>
      ) : null}

      <div className="preview-stage">
        {shouldUseResourceFallback && resourcePreview ? (
          <div className="preview-canvas-shell" data-preview-shell={mode}>
            <div className={`preview-canvas preview-canvas-${layoutPreferences.devices[mode]}`} style={previewCanvasStyle}>
              <div className="resource-fallback">
                <h4>Inline preview unavailable</h4>
                <p>
                  {resourcePreview.resourcePath
                    ? `This file type does not render reliably in the embedded frame: ${resourcePreview.resourcePath}`
                    : "No indexed resource file is available for this selection."}
                </p>
                <div className="resource-fallback-actions">
                  {resourcePreview.extractedFallbackPath ? (
                    <button type="button" className="ghost-button compact" onClick={resourcePreview.onOpenExtractedText}>
                      Open Extracted Text
                    </button>
                  ) : null}

                  {resourcePreview.previewUrl ? (
                    <a className="ghost-button compact linkish" href={resourcePreview.previewUrl} target="_blank" rel="noreferrer">
                      Open In New Tab
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : shouldUsePdfResourcePreview && resourcePreview ? (
          <div className="preview-canvas-shell" data-preview-shell={mode}>
            <div className={`preview-canvas preview-canvas-${layoutPreferences.devices[mode]}`} style={previewCanvasStyle}>
              <object
                key={`${mode}:${resourcePreview.previewUrl}`}
                className="preview-frame"
                data={resourcePreview.previewUrl}
                type="application/pdf"
                aria-label={`${resourcePreview.resourcePath} preview`}
              >
                <div className="resource-fallback">
                  <h4>Inline PDF preview unavailable</h4>
                  <p>
                    {resourcePreview.resourcePath
                      ? `Your browser did not embed this PDF: ${resourcePreview.resourcePath}`
                      : "No indexed PDF file is available for this selection."}
                  </p>
                  <div className="resource-fallback-actions">
                    {resourcePreview.extractedFallbackPath ? (
                      <button type="button" className="ghost-button compact" onClick={resourcePreview.onOpenExtractedText}>
                        Open Extracted Text
                      </button>
                    ) : null}

                    {resourcePreview.previewUrl ? (
                      <a className="ghost-button compact linkish" href={resourcePreview.previewUrl} target="_blank" rel="noreferrer">
                        Open In New Tab
                      </a>
                    ) : null}
                  </div>
                </div>
              </object>
            </div>
          </div>
        ) : (
          <div className="preview-canvas-shell" data-preview-shell={mode}>
            <div className={`preview-canvas preview-canvas-${layoutPreferences.devices[mode]}`} style={previewCanvasStyle}>
              <iframe
                key={`${mode}:${previewSrc}`}
                ref={(node) => registerPreviewFrame(mode, node)}
                className={layoutPreferences.compareMode || previewMode === mode ? "preview-frame" : "preview-frame is-hidden"}
                src={previewSrc}
                title={`${mode} preview`}
                sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups allow-downloads"
                aria-hidden={!layoutPreferences.compareMode && previewMode !== mode}
                onLoad={() => onPreviewLoad(mode)}
              />
            </div>
          </div>
        )}
      </div>

      {toolbar}
    </article>
  );
}
