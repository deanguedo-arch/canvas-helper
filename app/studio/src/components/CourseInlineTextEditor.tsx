import { useEffect, useMemo, useRef } from "react";

import type { PreviewInspectPayload, SafePresentationSnapshot } from "../../../shared/preview-bridge.js";
import type { CourseEditInlineEditorState } from "../hooks/useCourseEditing";

type CourseInlineTextEditorProps = {
  editor: CourseEditInlineEditorState;
  selection: PreviewInspectPayload | null;
  frame: HTMLIFrameElement | null;
  onChange: (text: string) => void;
  onSave: () => Promise<boolean>;
  onCancel: () => void;
  onActivate: () => void;
};

function plainTextFromElement(element: HTMLElement) {
  return (element.innerText || element.textContent || "").replace(/\r\n?/g, "\n");
}

function placeCaretAtEnd(element: HTMLElement) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function presentationStyle(presentation?: SafePresentationSnapshot) {
  if (!presentation) return {};
  return {
    fontFamily: presentation.fontFamily,
    fontSize: presentation.fontSize,
    fontWeight: presentation.fontWeight,
    fontStyle: presentation.fontStyle,
    lineHeight: presentation.lineHeight,
    letterSpacing: presentation.letterSpacing,
    textAlign: presentation.textAlign,
    color: presentation.color,
    whiteSpace: presentation.whiteSpace === "nowrap" ? "pre-wrap" : presentation.whiteSpace
  } as const;
}

/**
 * This editor belongs to Studio, above the iframe. It never writes to or
 * dispatches keyboard events into the learner page below it.
 */
export function CourseInlineTextEditor({
  editor,
  selection,
  frame,
  onChange,
  onSave,
  onCancel,
  onActivate
}: CourseInlineTextEditorProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const focusedTargetRef = useRef("");
  const value = editor.rawDocument?.text ?? "";
  const targetId = editor.target?.identity?.targetId ?? "";
  const allowsLineBreaks = editor.target?.editor?.allowsLineBreaks ?? false;
  const placement = useMemo(() => {
    if (!frame || !selection || !selection.nodeId || !targetId || selection.nodeId !== editor.target?.identity?.nodeId) return null;
    const widthScale = frame.clientWidth / Math.max(1, selection.viewport.width);
    const heightScale = frame.clientHeight / Math.max(1, selection.viewport.height);
    return {
      left: frame.offsetLeft + selection.geometry.x * widthScale,
      top: frame.offsetTop + selection.geometry.y * heightScale,
      width: Math.max(1, selection.geometry.width * widthScale),
      minHeight: Math.max(1, selection.geometry.height * heightScale)
    };
  }, [editor.target?.identity?.nodeId, frame, selection, targetId]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || element.textContent === value) return;
    element.textContent = value;
  }, [value]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !targetId || focusedTargetRef.current === targetId) return;
    focusedTargetRef.current = targetId;
    const timer = window.requestAnimationFrame(() => {
      element.focus({ preventScroll: true });
      placeCaretAtEnd(element);
    });
    return () => window.cancelAnimationFrame(timer);
  }, [targetId]);

  if (!placement || editor.previewOwner !== "parent-inline" || editor.status === "detached") return null;

  const sync = () => {
    const element = elementRef.current;
    if (element && !element.hasAttribute("data-composing")) onChange(plainTextFromElement(element));
  };

  return (
    <div
      className="course-inline-text-editor"
      style={{ ...placement, ...presentationStyle(selection?.presentation) }}
      data-testid="course-inline-text-editor"
      data-inline-editor-status={editor.status}
    >
      <div
        ref={elementRef}
        className="course-inline-text-editor-field"
        contentEditable="true"
        data-canvas-helper-plain-text-fallback="true"
        tabIndex={0}
        role="textbox"
        aria-multiline={allowsLineBreaks}
        aria-label="Edit course text in place"
        suppressContentEditableWarning
        onFocus={onActivate}
        onInput={sync}
        onCompositionStart={() => { elementRef.current?.setAttribute("data-composing", "true"); }}
        onCompositionEnd={() => {
          elementRef.current?.removeAttribute("data-composing");
          sync();
        }}
        onPaste={(event) => {
          event.preventDefault();
          const text = event.clipboardData.getData("text/plain").replace(/\r\n?/g, "\n");
          document.execCommand("insertText", false, allowsLineBreaks ? text : text.replace(/\n/g, " "));
          sync();
        }}
        onBeforeInput={(event) => {
          const inputType = event.nativeEvent.inputType ?? "";
          if (inputType === "insertFromDrop" || inputType === "insertFromPaste" || inputType.startsWith("format")) event.preventDefault();
        }}
        onDrop={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
            return;
          }
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            void onSave();
            return;
          }
          if (event.key === "Enter" && !allowsLineBreaks) event.preventDefault();
        }}
      />
      <span className="course-inline-text-editor-state" aria-live="polite">
        {editor.status === "normalizing" ? "Checking…" : editor.status === "saved" ? "Saved draft" : "Draft"}
      </span>
    </div>
  );
}
