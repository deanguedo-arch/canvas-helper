import { useMemo } from "react";

import type {
  CourseEditDraft,
  CourseEditPendingAssetReference,
  CourseEditPendingImage,
  CourseEditPatch,
  CourseEditTarget
} from "../../../shared/course-editing.js";
import type { PreviewInspectPayload } from "../../../shared/preview-bridge.js";
import { CourseEditTargetComposer } from "./CourseEditPanel";

type CourseInlineTargetEditorProps = {
  target: CourseEditTarget | null;
  drafts: CourseEditDraft[];
  selection: PreviewInspectPayload | null;
  frame: HTMLIFrameElement | null;
  busy: boolean;
  onSave: (patch: CourseEditPatch, pendingAsset?: CourseEditPendingAssetReference) => Promise<boolean>;
  onUploadImage: (file: File, htmlPath: string) => Promise<CourseEditPendingImage | null>;
  onPreview: (patch: CourseEditPatch, pendingAsset?: CourseEditPendingAssetReference) => void;
  onClose: () => void;
};

/**
 * A Studio-owned capability editor anchored to the selected learner element.
 * It opens directly for structured content, or after the teacher chooses
 * Format & options from a safe plain-text caret.
 * It is deliberately outside the iframe: course scripts never see its focus,
 * keyboard, paste, or file-picker events.
 */
export function CourseInlineTargetEditor({
  target,
  drafts,
  selection,
  frame,
  busy,
  onSave,
  onUploadImage,
  onPreview,
  onClose
}: CourseInlineTargetEditorProps) {
  const placement = useMemo(() => {
    if (
      !target?.identity ||
      target.eligibility !== "editable" ||
      !frame ||
      !selection?.nodeId ||
      selection.nodeId !== target.identity.nodeId
    ) return null;

    const widthScale = frame.clientWidth / Math.max(1, selection.viewport.width);
    const heightScale = frame.clientHeight / Math.max(1, selection.viewport.height);
    const targetLeft = frame.offsetLeft + selection.geometry.x * widthScale;
    const targetTop = frame.offsetTop + selection.geometry.y * heightScale;
    const targetBottom = targetTop + Math.max(1, selection.geometry.height * heightScale);
    const width = Math.min(460, Math.max(220, frame.clientWidth - 16));
    const left = Math.max(frame.offsetLeft + 8, Math.min(targetLeft, frame.offsetLeft + frame.clientWidth - width - 8));
    // The full composer needs enough vertical room to stay usable. When the
    // selected element is low in the viewport, place the surface above it
    // instead of clipping the controls below the preview canvas.
    const placeAbove = targetBottom + 300 > frame.offsetTop + frame.clientHeight;
    return {
      left,
      top: placeAbove ? Math.max(frame.offsetTop + 8, targetTop - 360) : targetBottom + 8,
      width
    };
  }, [frame, selection, target]);

  if (!placement || !target?.identity || target.eligibility !== "editable") return null;
  const draft = drafts.find((entry) => entry.identity.targetId === target.identity?.targetId);

  return (
    <section
      className="course-inline-target-editor"
      style={placement}
      data-testid="course-inline-target-editor"
      aria-label="Edit selected course content in place"
    >
      <button type="button" className="course-inline-target-editor-close" onClick={onClose} aria-label="Close in-place editor">Close</button>
      <CourseEditTargetComposer
        key={`${target.identity.targetId}:${draft?.id ?? "new"}`}
        target={target}
        draft={draft}
        busy={busy}
        onSave={onSave}
        onUploadImage={onUploadImage}
        onPreview={onPreview}
      />
    </section>
  );
}
