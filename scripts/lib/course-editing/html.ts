import { createHash } from "node:crypto";

import { load } from "cheerio";
import { Parser } from "htmlparser2";

import type { CourseEditPatch, CourseEditStylePatch } from "../../../app/shared/course-editing.js";

export const STUDIO_EDIT_ID_ATTRIBUTE = "data-canvas-helper-edit-id";
export const STUDIO_EDIT_STYLE_MARKER = "data-canvas-helper-studio-edit-styles";

const EDITABLE_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "li", "blockquote", "figcaption", "button", "a", "img", "label", "td", "th",
  "span", "strong", "em", "small"
]);
const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const OPAQUE_TAGS = new Set(["head", "script", "style", "template", "svg", "math"]);
const RICH_TEXT_TAGS = new Set(["strong", "b", "em", "i", "br", "ul", "ol", "li", "a"]);
const RICH_TEXT_VOID_TAGS = new Set(["br"]);

export type EditableHtmlElement = {
  ordinal: number;
  tagName: string;
  pathKey: string;
  stableKey: string;
  editId: string;
  replaySafe: boolean;
  sourceStart: number;
  openEnd: number;
  innerStart: number;
  innerEnd: number;
  sourceEnd: number;
  attributes: Record<string, string>;
};

type ElementFrame = {
  tagName: string;
  pathKey: string;
  opaque: boolean;
  childTagCounts: Map<string, number>;
  editable?: EditableHtmlElement;
};

function hash24(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 24);
}

export function createStudioEditId(projectSlug: string, htmlPath: string, pathKey: string) {
  return `che2:${hash24(`${projectSlug}\u0000${htmlPath}\u0000${pathKey}`)}`;
}

export function isStudioEditId(value: string | undefined | null) {
  return typeof value === "string" && /^che[12]:[a-f0-9]{24}$/.test(value);
}

function normalizedElementText(value: string) {
  return load(`<body>${value}</body>`)("body").text().replace(/\s+/g, " ").trim();
}

function durableElementSignature(element: EditableHtmlElement) {
  const attributes = element.attributes;
  for (const name of ["data-canvas-helper-edit-key", "id", "data-testid", "name"]) {
    const value = attributes[name]?.trim();
    if (value) return `${element.tagName}\u0000${name}\u0000${value}`;
  }
  return null;
}

function semanticElementSignature(html: string, element: EditableHtmlElement) {
  const attributes = element.attributes;
  const inner = html.slice(element.innerStart, element.innerEnd);
  const text = normalizedElementText(inner);
  const semanticAttributes = ["href", "src", "alt", "title", "role", "aria-label"]
    .map((name) => `${name}=${attributes[name] ?? ""}`)
    .join("\u0000");
  return `${element.tagName}\u0000text=${hash24(text)}\u0000${semanticAttributes}`;
}

export function courseEditElementDigest(html: string, element: EditableHtmlElement) {
  return createHash("sha256").update(html.slice(element.sourceStart, element.sourceEnd), "utf8").digest("hex");
}

export function collectEditableHtmlElements(html: string, projectSlug: string, htmlPath: string) {
  const elements: EditableHtmlElement[] = [];
  const stack: ElementFrame[] = [];
  let parseFailed = false;
  let ordinal = 0;
  let parser: Parser;
  parser = new Parser(
    {
      onopentag(tagName, attributes) {
        const normalized = tagName.toLowerCase();
        const parent = stack.at(-1);
        const siblingIndex = (parent?.childTagCounts.get(normalized) ?? 0) + 1;
        parent?.childTagCounts.set(normalized, siblingIndex);
        const pathKey = parent ? `${parent.pathKey}/${normalized}[${siblingIndex}]` : `${normalized}[${siblingIndex}]`;
        const opaque = Boolean(parent?.opaque || OPAQUE_TAGS.has(normalized));
        const frame: ElementFrame = { tagName: normalized, pathKey, opaque, childTagCounts: new Map() };

        if (!opaque && EDITABLE_TAGS.has(normalized)) {
          ordinal += 1;
          const sourceStart = parser.startIndex;
          const openEnd = parser.endIndex;
          if (sourceStart >= 0 && openEnd >= sourceStart && html[openEnd] === ">") {
            frame.editable = {
              ordinal,
              tagName: normalized,
              pathKey,
              stableKey: "",
              editId: "",
              replaySafe: false,
              sourceStart,
              openEnd,
              innerStart: openEnd + 1,
              innerEnd: openEnd + 1,
              sourceEnd: openEnd + 1,
              attributes: Object.fromEntries(Object.entries(attributes).map(([name, value]) => [name.toLowerCase(), value]))
            };
            elements.push(frame.editable);
          }
        }
        stack.push(frame);
      },
      onclosetag(tagName) {
        const normalized = tagName.toLowerCase();
        let index = stack.length - 1;
        while (index >= 0 && stack[index].tagName !== normalized) index -= 1;
        if (index < 0) {
          parseFailed = true;
          return;
        }
        const closingStart = parser.startIndex;
        const closingEnd = parser.endIndex;
        for (let frameIndex = stack.length - 1; frameIndex >= index; frameIndex -= 1) {
          const frame = stack[frameIndex];
          const editable = frame.editable;
          if (!editable) continue;
          const isVoid = VOID_TAGS.has(frame.tagName) || closingStart === editable.sourceStart;
          if (isVoid) {
            editable.innerEnd = editable.innerStart;
            editable.sourceEnd = editable.openEnd + 1;
          } else if (closingStart >= editable.innerStart && closingEnd >= closingStart) {
            editable.innerEnd = closingStart;
            editable.sourceEnd = closingEnd + 1;
          } else {
            parseFailed = true;
          }
        }
        stack.length = index;
      },
      onerror() {
        parseFailed = true;
      }
    },
    { decodeEntities: false, recognizeSelfClosing: true }
  );
  parser.write(html);
  parser.end();
  if (stack.length) parseFailed = true;
  if (parseFailed) return null;
  const signatures = elements.map((element) => durableElementSignature(element) ?? semanticElementSignature(html, element));
  const signatureTotals = new Map<string, number>();
  for (const signature of signatures) signatureTotals.set(signature, (signatureTotals.get(signature) ?? 0) + 1);
  const signatureCounts = new Map<string, number>();
  for (const [index, element] of elements.entries()) {
    const signature = signatures[index];
    const occurrence = (signatureCounts.get(signature) ?? 0) + 1;
    signatureCounts.set(signature, occurrence);
    const existing = element.attributes[STUDIO_EDIT_ID_ATTRIBUTE];
    element.stableKey = isStudioEditId(existing)
      ? `declared\u0000${existing}`
      : `${signature}\u0000occurrence=${occurrence}`;
    element.editId = isStudioEditId(existing) ? existing : createStudioEditId(projectSlug, htmlPath, element.stableKey);
    element.replaySafe = signatureTotals.get(signature) === 1;
  }
  return elements;
}

function escapeHtmlText(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttribute(value: string) {
  return escapeHtmlText(value).replaceAll('"', "&quot;");
}

function stripControlCharacters(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

const URL_CONTROL_CHARACTER = /[\u0000-\u001F\u007F]/;
const URL_INTERNAL_ASCII_WHITESPACE = /[ \t\r\n\f\v]/;
const URL_PERCENT_ENCODED_CONTROL = /%(?:0[0-9a-f]|1[0-9a-f]|7f)/i;
const URL_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const COURSE_URL_BASE = "https://canvas-helper.invalid/course/";

function decodedUrlForSafety(value: string) {
  let decoded = value;
  // A browser will not recursively decode a path for navigation, but checking
  // a small bounded number of layers keeps a double-encoded control or
  // traversal sequence from becoming a future sanitizer bypass.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (URL_CONTROL_CHARACTER.test(decoded) || URL_PERCENT_ENCODED_CONTROL.test(decoded)) {
      throw new Error("Course URLs cannot contain control characters.");
    }
    let next: string;
    try {
      next = decodeURIComponent(decoded);
    } catch {
      throw new Error("Course URLs must use valid percent encoding.");
    }
    if (next === decoded) break;
    decoded = next;
  }
  if (URL_CONTROL_CHARACTER.test(decoded) || URL_PERCENT_ENCODED_CONTROL.test(decoded)) {
    throw new Error("Course URLs cannot contain control characters.");
  }
  return decoded;
}

function rejectUnsafeLocalCourseUrl(value: string, kind: "href" | "src") {
  const decoded = decodedUrlForSafety(value);
  if (
    value.startsWith("/") ||
    value.startsWith("\\") ||
    decoded.startsWith("/") ||
    decoded.startsWith("\\") ||
    value.includes("\\") ||
    decoded.includes("\\") ||
    URL_SCHEME.test(value) ||
    URL_SCHEME.test(decoded)
  ) {
    throw new Error(`Unsupported ${kind === "href" ? "link" : "image"} URL.`);
  }
  const localPath = decoded.split(/[?#]/, 1)[0] ?? "";
  const segments = localPath.split("/");
  if (segments.includes("..")) {
    throw new Error("Local course URLs cannot leave the course workspace.");
  }
}

export function sanitizeCourseEditUrl(value: string, kind: "href" | "src") {
  if (URL_CONTROL_CHARACTER.test(value)) {
    throw new Error("Course URLs cannot contain control characters.");
  }
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (URL_INTERNAL_ASCII_WHITESPACE.test(trimmed) || URL_PERCENT_ENCODED_CONTROL.test(trimmed)) {
    throw new Error("Course URLs cannot contain whitespace or control characters.");
  }
  const decoded = decodedUrlForSafety(trimmed);
  if (trimmed.startsWith("#") && kind === "href") return trimmed;

  const isHttps = /^https:\/\//i.test(trimmed);
  const isMailto = /^mailto:/i.test(trimmed);
  const isTel = /^tel:/i.test(trimmed);
  if (isHttps || isMailto || isTel) {
    if (kind === "src" && !isHttps) throw new Error("Images must use HTTPS or a local course path.");
    try {
      const parsed = new URL(trimmed, COURSE_URL_BASE);
      if (
        (isHttps && (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password)) ||
        (isMailto && parsed.protocol !== "mailto:") ||
        (isTel && parsed.protocol !== "tel:")
      ) {
        throw new Error("Unsupported URL scheme.");
      }
    } catch (error) {
      if (error instanceof Error && /Unsupported URL scheme/.test(error.message)) throw error;
      throw new Error(`Unsupported ${kind === "href" ? "link" : "image"} URL.`);
    }
    return trimmed;
  }

  if (trimmed.startsWith("//") || decoded.startsWith("//") || trimmed.startsWith("/") || decoded.startsWith("/")) {
    throw new Error(`Unsupported ${kind === "href" ? "link" : "image"} URL.`);
  }
  rejectUnsafeLocalCourseUrl(trimmed, kind);
  try {
    const parsed = new URL(trimmed, COURSE_URL_BASE);
    if (parsed.origin !== new URL(COURSE_URL_BASE).origin) {
      throw new Error("Local URLs must resolve inside the course.");
    }
  } catch (error) {
    if (error instanceof Error && /Local URLs must resolve/.test(error.message)) throw error;
    throw new Error(`Unsupported ${kind === "href" ? "link" : "image"} URL.`);
  }
  return trimmed;
}

export function sanitizeCourseEditPlainText(value: string) {
  return stripControlCharacters(value).trim().slice(0, 24_000);
}

/**
 * The inline Studio editor intentionally accepts text rather than HTML. Keep
 * its canonicalization here beside the Apply sanitizer so a browser preview
 * cannot invent markup that the server would later transform or reject.
 */
export function sanitizeCourseEditPlainTextDocument(value: string, options: { allowLineBreaks: boolean }) {
  if (value.length > 24_000) {
    throw new Error("Text is too long. Shorten this edit before saving it.");
  }
  const normalized = value
    .replace(/\r\n?/g, "\n")
    // Preserve LF for paragraph line breaks while stripping every other
    // control character, including tabs and DEL.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  if (!options.allowLineBreaks && normalized.includes("\n")) {
    throw new Error("This course element is a single line. Remove the line break before saving it.");
  }
  if (normalized.length > 24_000) {
    throw new Error("Text is too long. Shorten this edit before saving it.");
  }
  return normalized;
}

export function courseEditPlainTextDocumentHtml(value: string) {
  return escapeHtmlText(value).replaceAll("\n", "<br>");
}

/**
 * A source element is safe for Studio's parent-owned text overlay only when
 * its own content is plain text with optional line breaks. Links, emphasis,
 * controls and arbitrary nested structure stay with the existing panel or
 * Annotation-only flow instead of being flattened by an inline editor.
 */
export function isSafeCourseEditPlainTextSource(value: string) {
  let safe = true;
  let parseFailed = false;
  const parser = new Parser(
    {
      onopentag(tagName) {
        if (tagName.toLowerCase() !== "br") safe = false;
      },
      onerror() {
        parseFailed = true;
      }
    },
    { decodeEntities: false, recognizeSelfClosing: true }
  );
  parser.write(value);
  parser.end();
  return safe && !parseFailed;
}

export function courseEditPlainTextFromHtml(value: string) {
  let output = "";
  const parser = new Parser(
    {
      onopentag(tagName) {
        if (tagName.toLowerCase() === "br") output += "\n";
      },
      ontext(text) {
        // Source formatting whitespace renders as a space in HTML. Only an
        // explicit <br> above becomes a teacher-visible line break.
        output += text.replace(/[\t\r\n\f ]+/g, " ");
      }
    },
    { decodeEntities: true, recognizeSelfClosing: true }
  );
  parser.write(value);
  parser.end();
  return output.replace(/\r\n?/g, "\n");
}

export function sanitizeCourseEditRichText(value: string) {
  let output = "";
  let suppressedDepth = 0;
  const emitted: string[] = [];
  const parser = new Parser(
    {
      onopentag(tagName, attributes) {
        const normalized = tagName.toLowerCase();
        if (["script", "style", "template", "iframe", "object", "embed", "svg", "math"].includes(normalized)) {
          suppressedDepth += 1;
          return;
        }
        if (suppressedDepth > 0 || !RICH_TEXT_TAGS.has(normalized)) return;
        if (normalized === "br") {
          output += "<br>";
          return;
        }
        if (normalized === "a") {
          const href = attributes.href ? sanitizeCourseEditUrl(attributes.href, "href") : "";
          output += href ? `<a href="${escapeAttribute(href)}">` : "<a>";
        } else {
          const semantic = normalized === "b" ? "strong" : normalized === "i" ? "em" : normalized;
          output += `<${semantic}>`;
        }
        emitted.push(normalized === "b" ? "strong" : normalized === "i" ? "em" : normalized);
      },
      ontext(text) {
        if (suppressedDepth === 0) output += escapeHtmlText(text);
      },
      onclosetag(tagName) {
        const normalized = tagName.toLowerCase();
        if (["script", "style", "template", "iframe", "object", "embed", "svg", "math"].includes(normalized)) {
          if (suppressedDepth > 0) suppressedDepth -= 1;
          return;
        }
        if (suppressedDepth > 0 || RICH_TEXT_VOID_TAGS.has(normalized)) return;
        const semantic = normalized === "b" ? "strong" : normalized === "i" ? "em" : normalized;
        const last = emitted.lastIndexOf(semantic);
        if (last >= 0) {
          emitted.splice(last, 1);
          output += `</${semantic}>`;
        }
      }
    },
    { decodeEntities: true, recognizeSelfClosing: true }
  );
  parser.write(value);
  parser.end();
  while (emitted.length) output += `</${emitted.pop()}>`;
  const sanitized = output.trim();
  if (sanitized.length > 24_000) {
    throw new Error("Rich text is too long after sanitization. Shorten this edit before saving it.");
  }
  return sanitized;
}

export function isSafeCourseEditRichTextSource(value: string) {
  let safe = true;
  let suppressedDepth = 0;
  const parser = new Parser(
    {
      onopentag(tagName) {
        const normalized = tagName.toLowerCase();
        if (["script", "style", "template", "iframe", "object", "embed", "svg", "math"].includes(normalized)) {
          suppressedDepth += 1;
          safe = false;
          return;
        }
        if (suppressedDepth === 0 && !RICH_TEXT_TAGS.has(normalized)) safe = false;
      },
      onclosetag(tagName) {
        if (["script", "style", "template", "iframe", "object", "embed", "svg", "math"].includes(tagName.toLowerCase()) && suppressedDepth > 0) {
          suppressedDepth -= 1;
        }
      },
      onerror() {
        safe = false;
      }
    },
    { decodeEntities: false, recognizeSelfClosing: true }
  );
  parser.write(value);
  parser.end();
  return safe && suppressedDepth === 0;
}

function replaceAttribute(openingTag: string, name: string, value: string | null | undefined) {
  if (value === undefined) return openingTag;
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\s+${escapedName}(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+))?`, "i");
  const without = openingTag.replace(pattern, "");
  if (value === null || value === "") return without;
  const insertion = ` ${name}="${escapeAttribute(value)}"`;
  const closeIndex = without.endsWith("/>") ? without.length - 2 : without.length - 1;
  return `${without.slice(0, closeIndex)}${insertion}${without.slice(closeIndex)}`;
}

const STYLE_ATTRIBUTES: Record<keyof CourseEditStylePatch, string> = {
  textStyle: "data-canvas-helper-text-style",
  fontFamily: "data-canvas-helper-font",
  fontSize: "data-canvas-helper-font-size",
  textTone: "data-canvas-helper-text-tone",
  alignment: "data-canvas-helper-align",
  spacing: "data-canvas-helper-spacing"
};

function patchOpeningTag(opening: string, patch: CourseEditPatch, editId?: string) {
  let next = opening;
  if (editId) next = replaceAttribute(next, STUDIO_EDIT_ID_ATTRIBUTE, editId);
  next = replaceAttribute(next, "href", patch.href === null ? null : patch.href === undefined ? undefined : sanitizeCourseEditUrl(patch.href, "href"));
  next = replaceAttribute(next, "src", patch.src === null ? null : patch.src === undefined ? undefined : sanitizeCourseEditUrl(patch.src, "src"));
  next = replaceAttribute(next, "alt", patch.alt === undefined ? undefined : patch.alt === null ? null : sanitizeCourseEditPlainText(patch.alt));
  next = replaceAttribute(next, "title", patch.title === undefined ? undefined : patch.title === null ? null : sanitizeCourseEditPlainText(patch.title));
  if (patch.style) {
    for (const [key, attribute] of Object.entries(STYLE_ATTRIBUTES) as Array<[keyof CourseEditStylePatch, string]>) {
      const value = patch.style[key];
      if (value !== undefined) next = replaceAttribute(next, attribute, value === "default" ? null : value);
    }
  }
  return next;
}

export function applyPatchToEditableElement(html: string, element: EditableHtmlElement, patch: CourseEditPatch, editId?: string) {
  const opening = patchOpeningTag(html.slice(element.sourceStart, element.openEnd + 1), patch, editId);
  const inner = patch.html === undefined
    ? html.slice(element.innerStart, element.innerEnd)
    : sanitizeCourseEditRichText(patch.html);
  const closing = html.slice(element.innerEnd, element.sourceEnd);
  return `${html.slice(0, element.sourceStart)}${opening}${inner}${closing}${html.slice(element.sourceEnd)}`;
}

export function decorateGeneratedCourseHtml(html: string, projectSlug: string, htmlPath = "index.html", includeStyles = false) {
  const elements = collectEditableHtmlElements(html, projectSlug, htmlPath);
  if (!elements) throw new Error("Studio could not establish stable edit identities for generated course HTML.");
  let decorated = html;
  for (const element of [...elements].sort((left, right) => right.sourceStart - left.sourceStart)) {
    if (!element.replaySafe) continue;
    decorated = applyPatchToEditableElement(decorated, element, {}, element.editId);
  }
  return includeStyles ? ensureStudioEditStyles(decorated) : decorated;
}

export function courseEditCapabilitiesForTag(tagName: string) {
  const image = tagName === "img";
  const link = tagName === "a";
  const styleKeys: Array<keyof CourseEditStylePatch> = /^h[1-6]$/.test(tagName)
    ? ["fontFamily", "textTone", "alignment", "spacing"]
    : ["p", "blockquote", "figcaption"].includes(tagName)
      ? ["fontFamily", "fontSize", "textTone", "alignment", "spacing"]
      : tagName === "li"
        ? ["fontFamily", "fontSize", "textTone", "spacing"]
        : ["td", "th"].includes(tagName)
          ? ["textTone", "alignment"]
          : [];
  return {
    richText: !image,
    link,
    image,
    styles: styleKeys.length > 0,
    styleKeys
  };
}

export function currentCourseEditStyle(attributes: Record<string, string>): Required<CourseEditStylePatch> {
  return {
    textStyle: (attributes[STYLE_ATTRIBUTES.textStyle] as Required<CourseEditStylePatch>["textStyle"]) || "default",
    fontFamily: (attributes[STYLE_ATTRIBUTES.fontFamily] as Required<CourseEditStylePatch>["fontFamily"]) || "default",
    fontSize: (attributes[STYLE_ATTRIBUTES.fontSize] as Required<CourseEditStylePatch>["fontSize"]) || "default",
    textTone: (attributes[STYLE_ATTRIBUTES.textTone] as Required<CourseEditStylePatch>["textTone"]) || "default",
    alignment: (attributes[STYLE_ATTRIBUTES.alignment] as Required<CourseEditStylePatch>["alignment"]) || "default",
    spacing: (attributes[STYLE_ATTRIBUTES.spacing] as Required<CourseEditStylePatch>["spacing"]) || "default"
  };
}

export const STUDIO_EDIT_STYLES = `<style ${STUDIO_EDIT_STYLE_MARKER}="v1">
[data-canvas-helper-font="readable-sans"]{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Helvetica Neue",sans-serif!important}
[data-canvas-helper-font="book-serif"]{font-family:Georgia,"Times New Roman",serif!important}
[data-canvas-helper-font-size="small"]{font-size:.875em!important}
[data-canvas-helper-font-size="large"]{font-size:1.18em!important}
[data-canvas-helper-font-size="x-large"]{font-size:1.4em!important}
[data-canvas-helper-text-tone="ink"]{color:#172033!important}
[data-canvas-helper-text-tone="muted"]{color:#5f6b7a!important}
[data-canvas-helper-text-tone="accent"]{color:#1769aa!important}
[data-canvas-helper-align="left"]{text-align:left!important}
[data-canvas-helper-align="center"]{text-align:center!important}
[data-canvas-helper-align="right"]{text-align:right!important}
[data-canvas-helper-spacing="compact"]{margin-block:.35em!important}
[data-canvas-helper-spacing="relaxed"]{margin-block:1.25em!important}
[data-canvas-helper-text-style="heading"]{display:block;font-size:1.65em!important;font-weight:750!important;line-height:1.15!important}
[data-canvas-helper-text-style="subheading"]{display:block;font-size:1.25em!important;font-weight:700!important;line-height:1.25!important}
[data-canvas-helper-text-style="body"]{display:block;font-size:1em!important;font-weight:400!important;line-height:1.55!important}
[data-canvas-helper-text-style="caption"]{display:block;font-size:.875em!important;color:#5f6b7a!important;line-height:1.4!important}
</style>`;

export function ensureStudioEditStyles(html: string) {
  if (html.includes(`${STUDIO_EDIT_STYLE_MARKER}="v1"`)) return html;
  const headClose = html.search(/<\/head\s*>/i);
  if (headClose >= 0) return `${html.slice(0, headClose)}${STUDIO_EDIT_STYLES}${html.slice(headClose)}`;
  return `${STUDIO_EDIT_STYLES}${html}`;
}
