import { useEffect, useMemo, useState } from "react";

import {
  COURSE_EDIT_ALIGNMENTS,
  COURSE_EDIT_FONT_FAMILIES,
  COURSE_EDIT_FONT_SIZES,
  COURSE_EDIT_SPACING,
  COURSE_EDIT_TEXT_STYLES,
  COURSE_EDIT_TEXT_TONES,
  type CourseEditDraft,
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
  exportsOutOfDate: boolean;
  staleExportTargets: string[];
  onSaveTarget: (patch: CourseEditPatch) => boolean;
  onUpdateDraft: (draft: CourseEditDraft) => void;
  onRemoveDraft: (id: string) => void;
  onReorderDraft: (id: string, direction: -1 | 1) => void;
  onApply: () => void;
  onUndo: () => void;
};

const LABELS: Record<string, string> = {
  default: "Default",
  heading: "Heading",
  subheading: "Subheading",
  body: "Body",
  caption: "Caption",
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

function plainText(html: string) {
  const document = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  return document.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function wrapSelection(textarea: HTMLTextAreaElement | null, tagName: "strong" | "em" | "ul" | "ol", value: string) {
  if (!textarea) return value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end) || (tagName === "ul" || tagName === "ol" ? "List item" : "text");
  const replacement = tagName === "ul" || tagName === "ol"
    ? `<${tagName}><li>${selected}</li></${tagName}>`
    : `<${tagName}>${selected}</${tagName}>`;
  return `${value.slice(0, start)}${replacement}${value.slice(end)}`;
}

function StyleControls({ value, onChange }: { value: Required<CourseEditStylePatch>; onChange: (style: Required<CourseEditStylePatch>) => void }) {
  const field = <K extends keyof CourseEditStylePatch>(key: K, options: readonly Required<CourseEditStylePatch>[K][], label: string) => (
    <label className="edit-select-field">
      <span>{label}</span>
      <select value={value[key]} onChange={(event) => onChange({ ...value, [key]: event.target.value })}>
        {options.map((option) => <option key={option} value={option}>{LABELS[String(option)] ?? option}</option>)}
      </select>
    </label>
  );
  return (
    <div className="course-edit-style-grid">
      {field("textStyle", COURSE_EDIT_TEXT_STYLES, "Style")}
      {field("fontFamily", COURSE_EDIT_FONT_FAMILIES, "Font")}
      {field("fontSize", COURSE_EDIT_FONT_SIZES, "Size")}
      {field("textTone", COURSE_EDIT_TEXT_TONES, "Colour")}
      {field("alignment", COURSE_EDIT_ALIGNMENTS, "Align")}
      {field("spacing", COURSE_EDIT_SPACING, "Spacing")}
    </div>
  );
}

function TargetEditor({ target, busy, onSave }: { target: CourseEditTarget; busy: boolean; onSave: (patch: CourseEditPatch) => void }) {
  const [html, setHtml] = useState(target.originalHtml);
  const [href, setHref] = useState(target.attributes.href);
  const [src, setSrc] = useState(target.attributes.src);
  const [alt, setAlt] = useState(target.attributes.alt);
  const [title, setTitle] = useState(target.attributes.title);
  const [style, setStyle] = useState(target.currentStyle);
  const editorId = `course-edit-${target.identity?.targetId ?? "unsupported"}`;

  useEffect(() => {
    setHtml(target.originalHtml);
    setHref(target.attributes.href);
    setSrc(target.attributes.src);
    setAlt(target.attributes.alt);
    setTitle(target.attributes.title);
    setStyle(target.currentStyle);
  }, [target]);

  const patch = (): CourseEditPatch => ({
    ...(target.capabilities.richText ? { html } : {}),
    ...(target.capabilities.link ? { href } : {}),
    ...(target.capabilities.image ? { src, alt } : {}),
    ...(title !== target.attributes.title ? { title } : {}),
    ...(target.capabilities.styles ? { style } : {})
  });

  return (
    <fieldset className="course-edit-composer" data-testid="course-edit-composer" disabled={busy} aria-busy={busy}>
      <div className="section-header">
        <div><h3>Edit selection</h3><p>{target.originalText || target.identity?.tagName}</p></div>
      </div>
      {target.capabilities.richText ? (
        <>
          <div className="course-edit-format-bar" role="toolbar" aria-label="Text formatting">
            <button type="button" onClick={() => setHtml((value) => wrapSelection(document.querySelector(`#${editorId}`), "strong", value))}><strong>B</strong></button>
            <button type="button" onClick={() => setHtml((value) => wrapSelection(document.querySelector(`#${editorId}`), "em", value))}><em>I</em></button>
            <button type="button" onClick={() => setHtml((value) => wrapSelection(document.querySelector(`#${editorId}`), "ul", value))}>Bullets</button>
            <button type="button" onClick={() => setHtml((value) => wrapSelection(document.querySelector(`#${editorId}`), "ol", value))}>Numbers</button>
          </div>
          <label className="course-edit-field">
            <span>Text</span>
            <textarea id={editorId} rows={6} value={html} onChange={(event) => setHtml(event.target.value)} data-testid="course-edit-html" />
            <small>Safe formatting: bold, italic, lists, line breaks, and links.</small>
          </label>
        </>
      ) : null}
      {target.capabilities.link ? (
        <label className="course-edit-field"><span>Link destination</span><input value={href} onChange={(event) => setHref(event.target.value)} placeholder="https://… or a course file" /></label>
      ) : null}
      {target.capabilities.image ? (
        <>
          <label className="course-edit-field"><span>Image</span><input value={src} onChange={(event) => setSrc(event.target.value)} placeholder="https://… or a course image" /></label>
          <label className="course-edit-field"><span>Alt text</span><textarea rows={3} value={alt} onChange={(event) => setAlt(event.target.value)} /></label>
        </>
      ) : null}
      <label className="course-edit-field"><span>Tooltip or title</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      {target.capabilities.styles ? <StyleControls value={style} onChange={setStyle} /> : null}
      <div className="course-edit-before-after">
        <div><span>Before</span><p>{target.originalText || "—"}</p></div>
        <div><span>After</span><p>{target.capabilities.richText ? plainText(html) : alt || href || target.originalText || "—"}</p></div>
      </div>
      <button type="button" className="primary-button" onClick={() => onSave(patch())}>Save draft change</button>
    </fieldset>
  );
}

function DraftCard({ draft, index, count, busy, onChange, onRemove, onReorder }: {
  draft: CourseEditDraft;
  index: number;
  count: number;
  busy: boolean;
  onChange: (draft: CourseEditDraft) => void;
  onRemove: () => void;
  onReorder: (direction: -1 | 1) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [html, setHtml] = useState(draft.patch.html ?? "");
  useEffect(() => setHtml(draft.patch.html ?? ""), [draft]);
  return (
    <article className="course-edit-draft" data-testid="course-edit-draft">
      <div className="course-edit-draft-heading">
        <strong>{index + 1}. {draft.identity.tagName.toUpperCase()}</strong>
        <div>
          <button type="button" className="ghost-button compact" disabled={busy || index === 0} onClick={() => onReorder(-1)} aria-label="Move draft up">↑</button>
          <button type="button" className="ghost-button compact" disabled={busy || index === count - 1} onClick={() => onReorder(1)} aria-label="Move draft down">↓</button>
          {draft.patch.html !== undefined ? <button type="button" className="ghost-button compact" disabled={busy} onClick={() => setEditing((value) => !value)}>{editing ? "Close" : "Edit"}</button> : null}
          <button type="button" className="ghost-button compact danger" disabled={busy} onClick={onRemove}>Remove</button>
        </div>
      </div>
      <div className="course-edit-before-after compact">
        <div><span>Before</span><p>{draft.beforeText || "—"}</p></div>
        <div><span>After</span><p>{draft.afterText || "—"}</p></div>
      </div>
      {editing ? (
        <div className="course-edit-inline-editor">
          <textarea rows={4} value={html} disabled={busy} onChange={(event) => setHtml(event.target.value)} />
          <button type="button" disabled={busy} onClick={() => { onChange({ ...draft, patch: { ...draft.patch, html }, afterText: plainText(html) }); setEditing(false); }}>Update draft</button>
        </div>
      ) : null}
    </article>
  );
}

export function CourseEditPanel(props: CourseEditPanelProps) {
  const statusClass = props.feedback.tone === "neutral" ? "" : ` ${props.feedback.tone}`;
  const targetKey = props.target?.identity?.targetId ?? "";
  const selectedDraft = useMemo(() => props.drafts.find((draft) => draft.identity.targetId === targetKey), [props.drafts, targetKey]);
  return (
    <section className="panel-card course-edit-panel" aria-label="Draft Changes" data-testid="course-edit-panel">
      <div className="section-header">
        <div><h3>Draft Changes</h3><p>{props.drafts.length} waiting to apply</p></div>
        {props.canUndo ? <button type="button" className="ghost-button compact" disabled={props.busy} onClick={props.onUndo} data-testid="course-edit-undo">Undo last batch</button> : null}
      </div>
      {!props.enabled && !props.drafts.length ? <p className="course-edit-intro">Turn on Edit, click course content, and make a quick change here.</p> : null}
      {props.resolving ? <p className="course-edit-status progress">Checking this element…</p> : null}
      {props.target?.eligibility === "unsupported" ? <p className="course-edit-status warning">{props.target.reason}</p> : null}
      {props.target?.eligibility === "editable" ? (
        <TargetEditor key={props.target.identity?.targetId} target={props.target} busy={props.busy} onSave={props.onSaveTarget} />
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
              onChange={props.onUpdateDraft}
              onRemove={() => props.onRemoveDraft(draft.id)}
              onReorder={(direction) => props.onReorderDraft(draft.id, direction)}
            />
          ))}
          <button type="button" className="primary-button course-edit-apply" disabled={props.busy} onClick={props.onApply} data-testid="course-edit-apply">
            {props.busy ? "Working…" : `Apply ${props.drafts.length} ${props.drafts.length === 1 ? "change" : "changes"}`}
          </button>
          <p className="course-edit-apply-note">Studio checkpoints the course, applies this batch, rebuilds if needed, and checks the result.</p>
        </div>
      ) : null}
      {props.exportsOutOfDate ? (
        <p className="course-edit-status warning">Exports are out of date: {props.staleExportTargets.join(", ")}. Publish them again when you are ready.</p>
      ) : null}
      {props.feedback.message ? <p className={`course-edit-status${statusClass}`} role="status">{props.feedback.message}</p> : null}
    </section>
  );
}
