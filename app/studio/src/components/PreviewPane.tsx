import { useCallback, useState, type CSSProperties, type ReactNode } from "react";

import type { PreviewInspectPayload } from "../../../shared/preview-bridge.js";
import type { CourseEditInlineEditorState } from "../hooks/useCourseEditing";
import { getReferenceResourceRenderMode } from "../reference-resource-preview";
import type { PreviewRecoveryState } from "../lib/preview-recovery";
import { DEVICE_PRESETS, type PreviewLayoutPreferences, type PreviewMode } from "../lib/types";
import { CourseInlineTextEditor } from "./CourseInlineTextEditor";
import { PreviewRecoveryPanel } from "./PreviewRecoveryPanel";

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
  onPreviewFrameLoad: (mode: PreviewMode) => void;
  previewSrc: string;
  recoveryState: PreviewRecoveryState;
  onRetryPreview: (mode: PreviewMode) => void;
  onOpenAnotherPage: (mode: PreviewMode) => void;
  onCopyPreviewIssue: (mode: PreviewMode) => Promise<void>;
  picker?: ReactNode;
  resourcePreview?: {
    resourcePath: string;
    resourceRoot: "raw" | "extracted";
    previewUrl: string;
    extractedFallbackPath: string;
    onOpenExtractedText: () => void;
    isViewingSelectedExtractedText: boolean;
  };
  inlineTextEditor?: {
    editor: CourseEditInlineEditorState;
    selection: PreviewInspectPayload | null;
    onChange: (text: string) => void;
    onSave: () => Promise<boolean>;
    onCancel: () => void;
    onActivate: () => void;
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
  onPreviewFrameLoad,
  previewSrc,
  recoveryState,
  onRetryPreview,
  onOpenAnotherPage,
  onCopyPreviewIssue,
  picker,
  resourcePreview,
  inlineTextEditor
}: PreviewPaneProps) {
  const [frameElement, setFrameElement] = useState<HTMLIFrameElement | null>(null);
  const registerFrame = useCallback((node: HTMLIFrameElement | null) => {
    setFrameElement((current) => current === node ? current : node);
    registerPreviewFrame(mode, node);
  }, [mode, registerPreviewFrame]);
  const devicePreset = DEVICE_PRESETS[layoutPreferences.devices[mode]];
  const zoomScale = layoutPreferences.zooms[mode] / 100;
  const previewCanvasStyle = {
    "--device-width": devicePreset.width,
    "--zoom-scale": String(zoomScale)
  } as CSSProperties;

  const title = mode === "workspace" ? "Current course" : "Original reference";
  const resourceRenderMode = resourcePreview
    ? getReferenceResourceRenderMode(resourcePreview.resourcePath, resourcePreview.resourceRoot)
    : "fallback";
  const shouldUseInlineResourcePreview = Boolean(resourcePreview && resourceRenderMode === "inline-frame");
  const shouldUsePdfResourcePreview = Boolean(resourcePreview && resourceRenderMode === "inline-pdf");
  const shouldUseResourceFallback = Boolean(resourcePreview && resourceRenderMode === "fallback");
  const hasRecoverableRuntimeFailure = recoveryState.phase === "error" && (
    recoveryState.code === "bridge-timeout" ||
    recoveryState.code === "runtime-empty" ||
    recoveryState.code === "runtime-failure"
  );
  const canMountHtmlPreview = Boolean(previewSrc && (
    shouldUseInlineResourcePreview ||
    ["loading", "checking", "ready", "warning"].includes(recoveryState.phase) ||
    hasRecoverableRuntimeFailure
  ));

  return (
    <article key={mode} className="preview-pane" data-testid={`${mode}-preview-pane`}>
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
              <div className="resource-fallback" data-testid="fallback-panel" data-fallback-mode={mode}>
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
                <div className="resource-fallback" data-testid="fallback-panel" data-fallback-mode={mode}>
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
        ) : previewSrc ? (
          <div className="preview-canvas-shell" data-preview-shell={mode}>
            <div className={`preview-canvas preview-canvas-${layoutPreferences.devices[mode]}`} style={previewCanvasStyle}>
              {canMountHtmlPreview ? (
                <iframe
                  key={`${mode}:${previewSrc}:${recoveryState.attempt}`}
                  ref={registerFrame}
                  className={layoutPreferences.compareMode || previewMode === mode ? "preview-frame" : "preview-frame is-hidden"}
                  src={previewSrc}
                  title={`${mode} preview`}
                  data-testid={`${mode}-preview-frame`}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups allow-downloads"
                  aria-hidden={!layoutPreferences.compareMode && previewMode !== mode}
                  onLoad={() => {
                    onPreviewFrameLoad(mode);
                    onPreviewLoad(mode);
                  }}
                />
              ) : null}
              {mode === "workspace" && inlineTextEditor ? (
                <CourseInlineTextEditor
                  editor={inlineTextEditor.editor}
                  selection={inlineTextEditor.selection}
                  frame={frameElement}
                  onChange={inlineTextEditor.onChange}
                  onSave={inlineTextEditor.onSave}
                  onCancel={inlineTextEditor.onCancel}
                  onActivate={inlineTextEditor.onActivate}
                />
              ) : null}
              {!shouldUseInlineResourcePreview && recoveryState.phase !== "ready" ? (
                <div className={
                  recoveryState.phase === "warning"
                    ? "preview-recovery-layer notice"
                    : canMountHtmlPreview
                      ? "preview-recovery-layer"
                      : "preview-recovery-layer inline"
                }>
                  <PreviewRecoveryPanel
                    mode={mode}
                    state={recoveryState}
                    onRetry={() => onRetryPreview(mode)}
                    onOpenAnotherPage={() => onOpenAnotherPage(mode)}
                    onCopyIssue={() => onCopyPreviewIssue(mode)}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="preview-canvas-shell" data-preview-shell={mode}>
            <div className={`preview-canvas preview-canvas-${layoutPreferences.devices[mode]}`} style={previewCanvasStyle}>
              <div className="resource-fallback" data-testid={`${mode}-preview-starting`}>
                <h4>Starting isolated preview</h4>
                <p>Studio is preparing the local course-preview connection.</p>
              </div>
            </div>
          </div>
        )}
      </div>

    </article>
  );
}
