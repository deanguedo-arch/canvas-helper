import { useEffect, useMemo, useRef, useState } from "react";

import {
  COURSE_EDIT_ALIGNMENTS,
  COURSE_EDIT_FONT_FAMILIES,
  COURSE_EDIT_FONT_SIZES,
  COURSE_EDIT_SPACING,
  COURSE_EDIT_TEXT_TONES,
  type CourseEditCapabilities,
  type CourseEditDraft,
  type CourseEditDraftBaseline,
  type CourseEditPendingAssetReference,
  type CourseEditPendingImage,
  type CourseEditPatch,
  type CourseEditStylePatch,
  type CourseEditTarget
} from "../../../shared/course-editing.js";

type CourseEditPanelProps = {
  enabled: boolean;
  target: CourseEditTarget | null;
  resolving: boolean;
  drafts: CourseEditDraft[];
  busy: boolean;
  feedback: { message: string; tone: "neutral" | "progress" | "success" | "warning" | "error" };
  canUndo: boolean;
  undoUnavailableReason: string;
  canRenameCourse: boolean;
  courseTitle: string;
  exportsOutOfDate: boolean;
  staleExportTargets: string[];
  previewFeedback: { message: string; tone: "neutral" | "progress" | "success" | "warning" | "error"; latencyMs: number | null };
  hasLivePreview: boolean;
  onPreviewTarget: (patch: CourseEditPatch, pendingAsset?: CourseEditPendingAssetReference) => void;
  onClearLivePreview: () => void;
  onSaveTarget: (patch: CourseEditPatch, pendingAsset?: CourseEditPendingAssetReference) => Promise<boolean>;
  onUpdateDraft: (draft: CourseEditDraft) => void;
  onReopenDraft: (draft: CourseEditDraft) => void;
  onRemoveDraft: (id: string) => void;
  onReorderDraft: (id: string, direction: -1 | 1) => void;
  onApply: () => void;
  onUndo: () => void;
  onExportDrafts: () => string;
  onImportDrafts: (source: string) => boolean;
  onUploadImage: (file: File, htmlPath: string) => Promise<CourseEditPendingImage | null>;
  onRenameCourse: (title: string) => Promise<boolean>;
  onAnnotateTarget: () => void;
};

const LABELS: Record<string, string> = {
  default: "Default",
  "readable-sans": "Readable sans",
  "book-serif": "Book serif",
  small: "Small",
  large: "Large",
  "x-large": "Extra large",
  ink: "Ink",
  muted: "Muted",
  accent: "Accent",
  left: "Left",
  center: "Centre",
  right: "Right",
  compact: "Compact",
  relaxed: "Relaxed"
};

const STYLE_OPTIONS = {
  fontFamily: COURSE_EDIT_FONT_FAMILIES,
  fontSize: COURSE_EDIT_FONT_SIZES,
  textTone: COURSE_EDIT_TEXT_TONES,
  alignment: COURSE_EDIT_ALIGNMENTS,
  spacing: COURSE_EDIT_SPACING
} satisfies Partial<Record<keyof CourseEditStylePatch, readonly string[]>>;

const STYLE_LABELS: Partial<Record<keyof CourseEditStylePatch, string>> = {
  fontFamily: "Font",
  fontSize: "Size",
  textTone: "Colour",
  alignment: "Align",
  spacing: "Spacing"
};

const STYLE_ATTRIBUTES: Partial<Record<keyof CourseEditStylePatch, string>> = {
  fontFamily: "data-canvas-helper-font",
  fontSize: "data-canvas-helper-font-size",
  textTone: "data-canvas-helper-text-tone",
  alignment: "data-canvas-helper-align",
  spacing: "data-canvas-helper-spacing"
};

function plainText(html: string) {
  const document = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  return document.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function changedPatch(input: {
  baseline: CourseEditDraftBaseline;
  html: string;
  href: string;
  src: string;
  alt: string;
  title: string;
  style: Required<CourseEditStylePatch>;
}) {
  const { baseline } = input;
  const patch: CourseEditPatch = {};
  if (baseline.capabilities.richText && input.html !== baseline.originalHtml) patch.html = input.html;
  if (baseline.capabilities.link && input.href !== baseline.attributes.href) patch.href = input.href;
  if (baseline.capabilities.image) {
    if (input.src !== baseline.attributes.src) patch.src = input.src;
    if (input.alt !== baseline.attributes.alt) patch.alt = input.alt;
  }
  if (input.title !== baseline.attributes.title) patch.title = input.title;
  const style: CourseEditStylePatch = {};
  for (const key of baseline.capabilities.styleKeys) {
    if (input.style[key] !== baseline.currentStyle[key]) Object.assign(style, { [key]: input.style[key] });
  }
  if (Object.keys(style).length) patch.style = style;
  return patch;
}

function RichTextEditor({ value, onChange, editorId }: { value: string; onChange: (value: string) => void; editorId: string }) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const selectionRef = useRef<Range | null>(null);
  const [link, setLink] = useState("");

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
  }, [value]);

  const rememberSelection = () => {
    const selection = window.getSelection();
    if (selection?.rangeCount && editorRef.current?.contains(selection.anchorNode)) selectionRef.current = selection.getRangeAt(0).cloneRange();
  };

  const command = (name: string, argument?: string) => {
    editorRef.current?.focus();
    if (selectionRef.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(selectionRef.current);
    }
    document.execCommand(name, false, argument);
    onChange(editorRef.current?.innerHTML ?? "");
    rememberSelection();
  };

  return (
    <div className="course-edit-rich-editor">
      <div className="course-edit-format-bar" role="toolbar" aria-label="Text formatting">
        <button type="button" onClick={() => command("bold")} aria-label="Bold"><strong>B</strong></button>
        <button type="button" onClick={() => command("italic")} aria-label="Italic"><em>I</em></button>
        <button type="button" onClick={() => command("insertUnorderedList")}>Bullets</button>
        <button type="button" onClick={() => command("insertOrderedList")}>Numbers</button>
      </div>
      <div
        id={editorId}
        ref={editorRef}
        className="course-edit-contenteditable"
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Course text"
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
        data-testid="course-edit-html"
      />
      <div className="course-edit-link-tool">
        <input value={link} onChange={(event) => setLink(event.target.value)} placeholder="Link selected text to https://…" aria-label="Link selected text" />
        <button type="button" className="ghost-button compact" disabled={!link.trim()} onClick={() => { command("createLink", link.trim()); setLink(""); }}>Add link</button>
      </div>
      <small>Use bold, italic, lists, and links. Studio removes unsafe markup before applying.</small>
    </div>
  );
}

function StyleControls({ capabilities, value, onChange }: {
  capabilities: CourseEditCapabilities;
  value: Required<CourseEditStylePatch>;
  onChange: (style: Required<CourseEditStylePatch>) => void;
}) {
  return (
    <div className="course-edit-style-grid">
      {capabilities.styleKeys.map((key) => {
        const options = (STYLE_OPTIONS as Partial<Record<keyof CourseEditStylePatch, readonly string[]>>)[key];
        if (!options) return null;
        return (
          <label className="edit-select-field" key={key}>
            <span>{STYLE_LABELS[key]}</span>
            <select value={value[key]} onChange={(event) => onChange({ ...value, [key]: event.target.value })}>
              {options.map((option) => <option key={option} value={option}>{LABELS[String(option)] ?? option}</option>)}
            </select>
          </label>
        );
      })}
    </div>
  );
}

function previewDocument(input: {
  tagName: string;
  baseline: CourseEditDraftBaseline;
  patch: CourseEditPatch;
}) {
  const tagName = /^[a-z][a-z0-9-]{0,23}$/.test(input.tagName) ? input.tagName : "p";
  const document = window.document.implementation.createHTMLDocument("Course edit preview");
  const element = document.createElement(tagName);
  const html = input.patch.html ?? input.baseline.originalHtml;
  if (tagName !== "img") element.innerHTML = html;
  for (const name of ["href", "src", "alt", "title"] as const) {
    const patched = input.patch[name];
    const value = patched === undefined ? input.baseline.attributes[name] : patched ?? "";
    if (value) element.setAttribute(name, value);
    else element.removeAttribute(name);
  }
  const style = { ...input.baseline.currentStyle, ...(input.patch.style ?? {}) };
  for (const key of input.baseline.capabilities.styleKeys) {
    const attribute = STYLE_ATTRIBUTES[key];
    if (!attribute) continue;
    const value = style[key];
    if (value && value !== "default") element.setAttribute(attribute, value);
  }
  const safeElement = element.outerHTML.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https:; style-src 'unsafe-inline'"><style>
body{margin:0;padding:16px;background:#fff;color:#172033;font:16px/1.5 system-ui,sans-serif}.stage{min-height:72px;display:flex;align-items:center}.stage>*{max-width:100%}img{max-width:100%;height:auto}
[data-canvas-helper-font="readable-sans"]{font-family:system-ui,sans-serif}[data-canvas-helper-font="book-serif"]{font-family:Georgia,serif}[data-canvas-helper-font-size="small"]{font-size:.875em}[data-canvas-helper-font-size="large"]{font-size:1.18em}[data-canvas-helper-font-size="x-large"]{font-size:1.4em}[data-canvas-helper-text-tone="ink"]{color:#172033}[data-canvas-helper-text-tone="muted"]{color:#5f6b7a}[data-canvas-helper-text-tone="accent"]{color:#1769aa}[data-canvas-helper-align="left"]{text-align:left}[data-canvas-helper-align="center"]{text-align:center}[data-canvas-helper-align="right"]{text-align:right}[data-canvas-helper-spacing="compact"]{margin-block:.35em}[data-canvas-helper-spacing="relaxed"]{margin-block:1.25em}
</style></head><body><div class="stage">${safeElement}</div></body></html>`;
}

function VisualPreview({ label, tagName, baseline, patch }: {
  label: string;
  tagName: string;
  baseline: CourseEditDraftBaseline;
  patch: CourseEditPatch;
}) {
  const previewText = tagName === "img"
    ? (patch.alt === undefined ? baseline.attributes.alt : patch.alt ?? "") || "Image without alt text"
    : plainText(patch.html ?? baseline.originalHtml) || `${tagName.toUpperCase()} without text`;
  return (
    <div className="course-edit-visual">
      <span>{label}</span>
      <p className="course-edit-preview-caption">{previewText}</p>
      <iframe title={`${label} course edit preview`} sandbox="" srcDoc={previewDocument({ tagName, baseline, patch })} />
    </div>
  );
}

function EditComposer({ target, baseline, initialPatch = {}, initialPendingAsset, busy, submitLabel, onSave, onUploadImage, onPreview }: {
  target: Pick<CourseEditTarget, "identity" | "originalText">;
  baseline: CourseEditDraftBaseline;
  initialPatch?: CourseEditPatch;
  initialPendingAsset?: CourseEditPendingAssetReference;
  busy: boolean;
  submitLabel: string;
  onSave: (patch: CourseEditPatch, pendingAsset?: CourseEditPendingAssetReference) => void;
  onUploadImage?: (file: File, htmlPath: string) => Promise<CourseEditPendingImage | null>;
  onPreview?: (patch: CourseEditPatch, pendingAsset?: CourseEditPendingAssetReference) => void;
}) {
  const [html, setHtml] = useState(initialPatch.html ?? baseline.originalHtml);
  const [href, setHref] = useState(initialPatch.href ?? baseline.attributes.href);
  const [src, setSrc] = useState(initialPatch.src ?? baseline.attributes.src);
  const [alt, setAlt] = useState(initialPatch.alt ?? baseline.attributes.alt);
  const [title, setTitle] = useState(initialPatch.title ?? baseline.attributes.title);
  const [style, setStyle] = useState({ ...baseline.currentStyle, ...(initialPatch.style ?? {}) });
  const [pendingImage, setPendingImage] = useState<CourseEditPendingAssetReference | null>(initialPendingAsset ?? null);
  const skipInitialPreviewRef = useRef(Object.keys(initialPatch).length > 0);
  const editorId = `course-edit-${target.identity?.targetId ?? "unsupported"}`;
  const patch = changedPatch({ baseline, html, href: href ?? "", src: src ?? "", alt: alt ?? "", title: title ?? "", style });
  const serializedPatch = JSON.stringify(patch);
  const tagName = target.identity?.tagName ?? "p";

  useEffect(() => {
    if (!onPreview) return;
    if (skipInitialPreviewRef.current) {
      skipInitialPreviewRef.current = false;
      return;
    }
    const timer = window.setTimeout(() => onPreview(patch, pendingImage ?? undefined), 180);
    return () => window.clearTimeout(timer);
  }, [onPreview, pendingImage?.id, serializedPatch]);

  return (
    <fieldset className="course-edit-composer" data-testid="course-edit-composer" disabled={busy} aria-busy={busy}>
      {baseline.capabilities.richText ? (
        <label className="course-edit-field">
          <span>Text and formatting</span>
          <RichTextEditor editorId={editorId} value={html} onChange={setHtml} />
        </label>
      ) : null}
      {baseline.capabilities.link ? (
        <label className="course-edit-field"><span>Link destination</span><input value={href ?? ""} onChange={(event) => setHref(event.target.value)} placeholder="https://… or a course file" /></label>
      ) : null}
      {baseline.capabilities.image ? (
        <>
          <label className="course-edit-field"><span>Image path</span><input value={src ?? ""} onChange={(event) => { setPendingImage(null); setSrc(event.target.value); }} placeholder="Upload an image or use an existing course image" /></label>
          {onUploadImage && target.identity ? (
            <label className="course-edit-upload">
              <span>Upload a course image</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void onUploadImage(file, target.identity!.htmlPath).then((prepared) => {
                    if (!prepared) return;
                    const reference: CourseEditPendingAssetReference = {
                      kind: prepared.kind,
                      id: prepared.id,
                      previewSessionId: prepared.previewSessionId,
                      digest: prepared.digest,
                      finalSrc: prepared.finalSrc,
                      mimeType: prepared.mimeType,
                      width: prepared.width,
                      height: prepared.height,
                      byteLength: prepared.byteLength
                    };
                    setPendingImage(reference);
                    setSrc(prepared.finalSrc);
                  });
                  event.target.value = "";
                }}
              />
              <small>PNG, JPEG, or GIF; 10 MB maximum. The bytes stay in memory until you Apply the draft.</small>
            </label>
          ) : null}
          <label className="course-edit-field"><span>Alt text</span><textarea rows={3} value={alt ?? ""} onChange={(event) => setAlt(event.target.value)} /></label>
        </>
      ) : null}
      <label className="course-edit-field"><span>Tooltip or title</span><input value={title ?? ""} onChange={(event) => setTitle(event.target.value)} /></label>
      {baseline.capabilities.styles ? <StyleControls capabilities={baseline.capabilities} value={style} onChange={setStyle} /> : null}
      {onPreview ? (
        <p className="course-edit-live-preview-note">Changes appear directly over the selected learner-page element after Studio checks them. Course files remain unchanged.</p>
      ) : (
        <div className="course-edit-before-after" aria-label="Visual before and after preview">
          <VisualPreview label="Before" tagName={tagName} baseline={baseline} patch={{}} />
          <VisualPreview label="After" tagName={tagName} baseline={baseline} patch={patch} />
        </div>
      )}
      <button type="button" className="primary-button" disabled={!Object.keys(patch).length} onClick={() => onSave(patch, pendingImage ?? undefined)}>{submitLabel}</button>
    </fieldset>
  );
}

function TargetEditor({ target, draft, busy, onSave, onUploadImage, onPreview }: {
  target: CourseEditTarget;
  draft?: CourseEditDraft;
  busy: boolean;
  onSave: CourseEditPanelProps["onSaveTarget"];
  onUploadImage: CourseEditPanelProps["onUploadImage"];
  onPreview: CourseEditPanelProps["onPreviewTarget"];
}) {
  const baseline: CourseEditDraftBaseline = {
    originalHtml: target.originalHtml,
    attributes: target.attributes,
    currentStyle: target.currentStyle,
    capabilities: target.capabilities
  };
  return (
    <div className="course-edit-target-editor">
      <div className="section-header"><div><h3>Edit selection</h3><p>{target.originalText || target.identity?.tagName}</p></div></div>
      <EditComposer
        target={target}
        baseline={baseline}
        initialPatch={draft?.patch}
        initialPendingAsset={draft?.pendingAssets?.[0]}
        busy={busy}
        submitLabel={draft ? "Update draft" : "Save draft change"}
        onSave={(patch, pendingAsset) => { void onSave(patch, pendingAsset); }}
        onUploadImage={onUploadImage}
        onPreview={onPreview}
      />
    </div>
  );
}

function DraftCard({ draft, index, count, busy, onReopen, onRemove, onReorder }: {
  draft: CourseEditDraft;
  index: number;
  count: number;
  busy: boolean;
  onReopen: () => void;
  onRemove: () => void;
  onReorder: (direction: -1 | 1) => void;
}) {
  return (
    <article className="course-edit-draft" data-testid="course-edit-draft">
      <div className="course-edit-draft-heading">
        <strong>{index + 1}. {draft.identity.tagName.toUpperCase()}</strong>
        <div>
          <button type="button" className="ghost-button compact" disabled={busy || index === 0} onClick={() => onReorder(-1)} aria-label="Move draft up">↑</button>
          <button type="button" className="ghost-button compact" disabled={busy || index === count - 1} onClick={() => onReorder(1)} aria-label="Move draft down">↓</button>
          <button type="button" className="ghost-button compact" disabled={busy} onClick={onReopen}>Reopen on page</button>
          <button type="button" className="ghost-button compact danger" disabled={busy} onClick={onRemove}>Remove</button>
        </div>
      </div>
      <div className="course-edit-before-after compact">
        <VisualPreview label="Before" tagName={draft.identity.tagName} baseline={draft.baseline} patch={{}} />
        <VisualPreview label="After" tagName={draft.identity.tagName} baseline={draft.baseline} patch={draft.patch} />
      </div>
      {draft.pendingAssets?.length ? <small>This draft's image remains temporary until Apply. Re-upload is required if the Studio server restarts or the preview expires.</small> : null}
    </article>
  );
}

export function CourseEditPanel(props: CourseEditPanelProps) {
  const statusClass = props.feedback.tone === "neutral" ? "" : ` ${props.feedback.tone}`;
  const targetKey = props.target?.identity?.targetId ?? "";
  const selectedDraft = useMemo(() => props.drafts.find((draft) => draft.identity.targetId === targetKey), [props.drafts, targetKey]);
  const importRef = useRef<HTMLInputElement | null>(null);
  const [courseTitle, setCourseTitle] = useState(props.courseTitle);

  useEffect(() => setCourseTitle(props.courseTitle), [props.courseTitle]);

  const downloadBackup = () => {
    const blob = new Blob([props.onExportDrafts()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `course-edit-drafts-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="panel-card course-edit-panel" aria-label="Draft Changes" data-testid="course-edit-panel">
      <div className="section-header">
        <div><h3>Draft Changes</h3><p>{props.drafts.length} waiting to apply</p></div>
        {props.canUndo ? <button type="button" className="ghost-button compact" disabled={props.busy} onClick={props.onUndo} data-testid="course-edit-undo">Undo last batch</button> : null}
      </div>
      {!props.canUndo && props.undoUnavailableReason && props.undoUnavailableReason !== "There is no applied Studio edit batch to undo." ? (
        <p className="course-edit-status warning">{props.undoUnavailableReason}</p>
      ) : null}
      <div className="course-edit-backup-actions">
        <button type="button" className="ghost-button compact" disabled={!props.drafts.length} onClick={downloadBackup}>Export drafts</button>
        <button type="button" className="ghost-button compact" onClick={() => importRef.current?.click()}>Import drafts</button>
        <input
          ref={importRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void file.text().then(props.onImportDrafts);
            event.target.value = "";
          }}
        />
      </div>
      {props.canRenameCourse ? (
        <div className="course-edit-rename">
          <label className="course-edit-field">
            <span>Course title</span>
            <input value={courseTitle} maxLength={160} onChange={(event) => setCourseTitle(event.target.value)} />
          </label>
          <button
            type="button"
            className="ghost-button compact"
            disabled={props.busy || !courseTitle.trim() || courseTitle.trim() === props.courseTitle}
            onClick={() => void props.onRenameCourse(courseTitle)}
          >
            Rename course everywhere
          </button>
          <small>Updates the sidebar, overview heading, browser title, project metadata, and declared runtime course data together.</small>
        </div>
      ) : null}
      {!props.enabled && !props.drafts.length ? <p className="course-edit-intro">Turn on Edit, click course content, and make a quick change here.</p> : null}
      {props.resolving ? <p className="course-edit-status progress">Checking this element…</p> : null}
      {props.target?.eligibility === "unsupported" ? (
        <div className="course-edit-unsupported" data-testid="course-edit-unsupported">
          <p className="course-edit-status warning">{props.target.reason}</p>
          <button type="button" className="ghost-button compact" onClick={props.onAnnotateTarget} data-testid="course-edit-annotate-target">
            Annotate this for Codex
          </button>
        </div>
      ) : null}
      {props.target?.eligibility === "editable" ? (
        <TargetEditor
          key={props.target.identity?.targetId}
          target={props.target}
          draft={selectedDraft}
          busy={props.busy}
          onSave={props.onSaveTarget}
          onUploadImage={props.onUploadImage}
          onPreview={props.onPreviewTarget}
        />
      ) : null}
      {props.previewFeedback.message ? (
        <div className="course-edit-live-preview-status">
          <p className={`course-edit-status ${props.previewFeedback.tone}`} role="status">
            {props.previewFeedback.message}
            {props.previewFeedback.latencyMs !== null ? ` (${props.previewFeedback.latencyMs} ms)` : ""}
          </p>
          {props.hasLivePreview ? <button type="button" className="ghost-button compact" onClick={() => props.onClearLivePreview()}>Reset live preview</button> : null}
        </div>
      ) : null}
      {selectedDraft && props.target?.eligibility === "editable" ? <p className="course-edit-status neutral">Saving again will update the existing draft for this element.</p> : null}
      {props.drafts.length ? (
        <div className="course-edit-drafts">
          {props.drafts.map((draft, index) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              index={index}
              count={props.drafts.length}
              busy={props.busy}
              onReopen={() => props.onReopenDraft(draft)}
              onRemove={() => props.onRemoveDraft(draft.id)}
              onReorder={(direction) => props.onReorderDraft(draft.id, direction)}
            />
          ))}
          <button type="button" className="primary-button course-edit-apply" disabled={props.busy} onClick={props.onApply} data-testid="course-edit-apply">
            {props.busy ? "Working…" : `Apply ${props.drafts.length} ${props.drafts.length === 1 ? "change" : "changes"}`}
          </button>
          <p className="course-edit-apply-note">Studio checkpoints the course, rebuilds when needed, loads the learner page, and rolls back if the rendered result does not match.</p>
        </div>
      ) : null}
      {props.exportsOutOfDate ? <p className="course-edit-status warning">Exports are out of date: {props.staleExportTargets.join(", ")}. Publish them again when you are ready.</p> : null}
      {props.feedback.message ? <p className={`course-edit-status${statusClass}`} role="status">{props.feedback.message}</p> : null}
    </section>
  );
}
