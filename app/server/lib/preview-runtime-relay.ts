import type { IncomingMessage, ServerResponse } from "node:http";
import { parse } from "@babel/parser";

import {
  PREVIEW_CAPABILITY_PATH_PREFIX,
  PREVIEW_CAPABILITY_TOKEN_PATTERN
} from "../../shared/preview-path.js";

const ALLOWED_PREVIEW_RUNTIME_HOSTS = new Set([
  "ajax.googleapis.com",
  "cdn.jsdelivr.net",
  "cdn.tailwindcss.com",
  "cdnjs.cloudflare.com",
  "esm.sh",
  "unpkg.com"
]);

const MAX_PREVIEW_RUNTIME_BYTES = 6 * 1024 * 1024;
const MAX_PREVIEW_RUNTIME_REDIRECTS = 4;
const MAX_PREVIEW_RUNTIME_CACHE_BYTES = 48 * 1024 * 1024;
const MAX_PREVIEW_RUNTIME_CACHE_ENTRIES = 128;
const MAX_PREVIEW_RUNTIME_PENDING_FETCHES = 8;
export const MAX_PREVIEW_LOCAL_SCRIPT_PARSE_BYTES = 512 * 1024;
const MAX_PREVIEW_RUNTIME_MODULE_PARSE_BYTES = 2 * 1024 * 1024;
const PREVIEW_RUNTIME_CACHE_TTL_MS = 8 * 60 * 60 * 1_000;
const PREVIEW_RUNTIME_FETCH_TIMEOUT_MS = 12_000;
const PREVIEW_RUNTIME_CONTENT_TYPE = "text/javascript; charset=utf-8";
const PREVIEW_RUNTIME_PREFIX_PLACEHOLDER = "/_canvas-helper/p/00000000-0000-0000-0000-000000000000";
const APPROVED_PREVIEW_RUNTIME_CONTENT_TYPES = new Set([
  "application/ecmascript",
  "application/javascript",
  "text/ecmascript",
  "text/javascript"
]);

const APPROVED_UNPKG_PATHS = new Set([
  "/@babel/standalone@7.28.5/babel.min.js",
  "/lucide@0.542.0/dist/umd/lucide.js",
  "/react@18.3.1/umd/react.development.js",
  "/react@18.3.1/umd/react.production.min.js",
  "/react-dom@18.3.1/umd/react-dom.development.js",
  "/react-dom@18.3.1/umd/react-dom.production.min.js"
]);

const APPROVED_CDNJS_PATHS = new Set([
  "/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js",
  "/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
]);

const APPROVED_ESM_PACKAGE_PATH = /^\/(?:react@19\.1\.1|react-dom@19\.1\.1|scheduler@(?:\^|%5e)?0\.26\.0|lucide-react@0\.542\.0|pdfjs-dist@4\.10\.38)(?:\/[-A-Za-z0-9._~!$&'()*+,;=:@%/]+)?$/i;
const APPROVED_ESM_NODE_PATH = /^\/node\/[-a-z0-9._]+\.mjs$/i;
const APPROVED_TAILWIND_PLUGINS = new Set(["forms", "forms,container-queries"]);
const APPROVED_ESM_TARGETS = new Set(["es2022"]);
const APPROVED_ESM_REACT_DEPENDENCIES = new Set(["react@19.1.1"]);

type PreviewRuntimeCacheEntry = {
  body: Buffer;
  byteLength: number;
  contentType: string;
  discoveredSources: string[];
  lastUsedAt: number;
  rewrittenTemplate: string | null;
  sourceUrl: string;
};

export type PreviewRuntimeRelayPath = {
  token: string;
  publicPrefix: string;
};

export type PreviewRuntimeSourceRegistrar = (source: string) => boolean | void;

type RuntimeSyntaxNode = {
  type?: string;
  start?: number | null;
  end?: number | null;
  value?: unknown;
  source?: RuntimeSyntaxNode | null;
  callee?: RuntimeSyntaxNode | null;
  arguments?: Array<RuntimeSyntaxNode | null>;
  argument?: RuntimeSyntaxNode | null;
  left?: RuntimeSyntaxNode | null;
  right?: RuntimeSyntaxNode | null;
  property?: RuntimeSyntaxNode | null;
  quasis?: RuntimeSyntaxNode[];
  computed?: boolean;
  name?: string;
  [key: string]: unknown;
};

type RuntimeLiteralReplacement = {
  start: number;
  end: number;
  value: string;
};

const runtimeCache = new Map<string, PreviewRuntimeCacheEntry>();
const pendingRuntimeFetches = new Map<string, Promise<PreviewRuntimeCacheEntry>>();
let runtimeCacheBytes = 0;

function pinKnownPreviewRuntimeSource(url: URL) {
  if (url.hostname === "cdn.tailwindcss.com" && url.pathname === "/") {
    url.pathname = "/3.4.17";
    return;
  }
  if (url.hostname !== "unpkg.com") return;
  const pinnedPaths = new Map([
    ["/@babel/standalone/babel.min.js", "/@babel/standalone@7.28.5/babel.min.js"],
    ["/lucide@latest", "/lucide@0.542.0/dist/umd/lucide.js"],
    ["/react@18/umd/react.development.js", "/react@18.3.1/umd/react.development.js"],
    ["/react@18/umd/react.production.min.js", "/react@18.3.1/umd/react.production.min.js"],
    ["/react-dom@18/umd/react-dom.development.js", "/react-dom@18.3.1/umd/react-dom.development.js"],
    ["/react-dom@18/umd/react-dom.production.min.js", "/react-dom@18.3.1/umd/react-dom.production.min.js"]
  ]);
  const pinned = pinnedPaths.get(url.pathname);
  if (pinned) url.pathname = pinned;
}

function hasNoRuntimeQuery(url: URL) {
  return [...url.searchParams].length === 0;
}

function hasOneRuntimeQuery(url: URL, key: string, allowedValues: Set<string>) {
  const entries = [...url.searchParams];
  return entries.length === 1 && entries[0][0] === key && allowedValues.has(entries[0][1]);
}

function isApprovedPreviewRuntimeSource(url: URL) {
  switch (url.hostname) {
    case "ajax.googleapis.com":
      return url.pathname === "/ajax/libs/jquery/3.1.1/jquery.min.js" && hasNoRuntimeQuery(url);
    case "cdn.jsdelivr.net":
      return (
        url.pathname === "/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js" &&
        hasNoRuntimeQuery(url)
      );
    case "cdn.tailwindcss.com":
      return (
        url.pathname === "/3.4.17" &&
        (hasNoRuntimeQuery(url) ||
          hasOneRuntimeQuery(url, "plugins", APPROVED_TAILWIND_PLUGINS))
      );
    case "cdnjs.cloudflare.com":
      return APPROVED_CDNJS_PATHS.has(url.pathname) && hasNoRuntimeQuery(url);
    case "esm.sh":
      return (
        (APPROVED_ESM_PACKAGE_PATH.test(url.pathname) || APPROVED_ESM_NODE_PATH.test(url.pathname)) &&
        (hasNoRuntimeQuery(url) ||
          hasOneRuntimeQuery(url, "target", APPROVED_ESM_TARGETS) ||
          hasOneRuntimeQuery(url, "deps", APPROVED_ESM_REACT_DEPENDENCIES))
      );
    case "unpkg.com":
      return APPROVED_UNPKG_PATHS.has(url.pathname) && hasNoRuntimeQuery(url);
    default:
      return false;
  }
}

export function parsePreviewRuntimeRelayPath(pathname: string): PreviewRuntimeRelayPath | null {
  const match = pathname.match(/^\/_canvas-helper\/p\/([A-Za-z0-9-]{16,80})\/runtime$/);
  if (!match || !PREVIEW_CAPABILITY_TOKEN_PATTERN.test(match[1])) return null;
  return {
    token: match[1],
    publicPrefix: `${PREVIEW_CAPABILITY_PATH_PREFIX}${match[1]}`
  };
}

export function normalizePreviewRuntimeSource(value: string | null | undefined) {
  if (!value || value.length > 4_096) return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      (url.port && url.port !== "443") ||
      !ALLOWED_PREVIEW_RUNTIME_HOSTS.has(url.hostname)
    ) {
      return null;
    }
    pinKnownPreviewRuntimeSource(url);
    if (!isApprovedPreviewRuntimeSource(url)) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export function buildPreviewRuntimeRelayUrl(
  publicPrefix: string,
  source: string,
  registerSource?: PreviewRuntimeSourceRegistrar
) {
  const normalized = normalizePreviewRuntimeSource(source);
  if (!normalized || !/^\/_canvas-helper\/p\/[A-Za-z0-9-]{16,80}$/.test(publicPrefix)) {
    return null;
  }
  if (registerSource?.(normalized) === false) return null;
  return `${publicPrefix}/runtime?source=${encodeURIComponent(normalized)}`;
}

function runtimeMemberName(node: RuntimeSyntaxNode | null | undefined) {
  if (!node) return "";
  if (!node.computed && node.property?.type === "Identifier") return node.property.name ?? "";
  if (node.property?.type === "StringLiteral" && typeof node.property.value === "string") {
    return node.property.value;
  }
  return "";
}

function runtimeStringLiteral(node: RuntimeSyntaxNode | null | undefined) {
  return node?.type === "StringLiteral" &&
    typeof node.value === "string" &&
    typeof node.start === "number" &&
    typeof node.end === "number"
    ? node
    : null;
}

function prefixedInternalPreviewPath(value: string, publicPrefix: string) {
  return /^\/preview\/(?:raw|workspace|references\/(?:raw|extracted))\//.test(value)
    ? `${publicPrefix}${value}`
    : null;
}

function rewriteRuntimeSyntax(
  source: string,
  publicPrefix: string,
  sourceUrl?: string,
  registerSource?: PreviewRuntimeSourceRegistrar,
  maxParseBytes = MAX_PREVIEW_LOCAL_SCRIPT_PARSE_BYTES
) {
  if (Buffer.byteLength(source, "utf8") > maxParseBytes) {
    return source;
  }
  let syntax: RuntimeSyntaxNode;
  try {
    syntax = parse(source, {
      sourceType: "unambiguous",
      allowAwaitOutsideFunction: true,
      allowReturnOutsideFunction: true,
      errorRecovery: true,
      plugins: ["jsx", "typescript", "dynamicImport", "importAttributes"]
    }) as unknown as RuntimeSyntaxNode;
  } catch {
    return source;
  }

  const normalizedSource = sourceUrl ? normalizePreviewRuntimeSource(sourceUrl) : null;
  const esmSource = normalizedSource && new URL(normalizedSource).hostname === "esm.sh"
    ? normalizedSource
    : null;
  const replacements = new Map<number, RuntimeLiteralReplacement>();

  const addInternalPreviewReplacement = (node: RuntimeSyntaxNode | null | undefined) => {
    if (!node) return;
    if (typeof node.start !== "number" || typeof node.end !== "number") return;
    if (node.type === "StringLiteral" && typeof node.value === "string") {
      const prefixed = prefixedInternalPreviewPath(node.value, publicPrefix);
      if (prefixed) {
        replacements.set(node.start, {
          start: node.start,
          end: node.end,
          value: JSON.stringify(prefixed)
        });
      }
      return;
    }
    if (node.type !== "TemplateLiteral") return;
    const firstQuasi = node.quasis?.[0];
    if (
      !firstQuasi ||
      typeof firstQuasi.start !== "number" ||
      typeof firstQuasi.end !== "number" ||
      !firstQuasi.value ||
      typeof firstQuasi.value !== "object"
    ) {
      return;
    }
    const raw = (firstQuasi.value as { raw?: unknown }).raw;
    if (typeof raw !== "string") return;
    const prefixed = prefixedInternalPreviewPath(raw, publicPrefix);
    if (prefixed) {
      replacements.set(firstQuasi.start, {
        start: firstQuasi.start,
        end: firstQuasi.end,
        value: prefixed
      });
    }
  };

  const addReplacement = (literal: RuntimeSyntaxNode | null, moduleSpecifier: boolean) => {
    const value = typeof literal?.value === "string" ? literal.value : "";
    if (!value || typeof literal?.start !== "number" || typeof literal.end !== "number") return;
    let absolute = value;
    if (!/^https:\/\//i.test(value)) {
      if (!moduleSpecifier || !esmSource || (!value.startsWith("/") && !value.startsWith("./") && !value.startsWith("../"))) {
        return;
      }
      absolute = new URL(value, esmSource).toString();
    }
    const relayUrl = buildPreviewRuntimeRelayUrl(publicPrefix, absolute, registerSource);
    if (!relayUrl) return;
    replacements.set(literal.start, { start: literal.start, end: literal.end, value: JSON.stringify(relayUrl) });
  };

  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    const node = value as RuntimeSyntaxNode;
    if (
      node.type === "ImportDeclaration" ||
      node.type === "ExportAllDeclaration" ||
      node.type === "ExportNamedDeclaration"
    ) {
      addInternalPreviewReplacement(node.source);
      addReplacement(runtimeStringLiteral(node.source), true);
    } else if (node.type === "ImportExpression") {
      addInternalPreviewReplacement(node.source);
      addReplacement(runtimeStringLiteral(node.source), true);
    } else if (node.type === "CallExpression" && node.callee?.type === "Import") {
      addInternalPreviewReplacement(node.arguments?.[0]);
      addReplacement(runtimeStringLiteral(node.arguments?.[0]), true);
    } else if (node.type === "ReturnStatement") {
      addInternalPreviewReplacement(node.argument);
    } else if (
      node.type === "CallExpression" &&
      ((node.callee?.type === "Identifier" && (node.callee.name === "fetch" || node.callee.name === "open")) ||
        (node.callee?.type === "MemberExpression" &&
          ["assign", "open", "replace"].includes(runtimeMemberName(node.callee))))
    ) {
      addInternalPreviewReplacement(node.arguments?.[0]);
    } else if (
      node.type === "NewExpression" &&
      node.callee?.type === "Identifier" &&
      (node.callee.name === "URL" || node.callee.name === "Worker" || node.callee.name === "SharedWorker")
    ) {
      addInternalPreviewReplacement(node.arguments?.[0]);
      addReplacement(runtimeStringLiteral(node.arguments?.[0]), false);
    } else if (
      node.type === "AssignmentExpression" &&
      node.left?.type === "MemberExpression" &&
      ["action", "data", "href", "poster", "src", "workerSrc"].includes(runtimeMemberName(node.left))
    ) {
      addInternalPreviewReplacement(node.right);
      addReplacement(runtimeStringLiteral(node.right), false);
    }

    for (const [key, child] of Object.entries(node)) {
      if (["loc", "comments", "errors", "tokens", "extra"].includes(key)) continue;
      visit(child);
    }
  };

  visit(syntax);
  let rewritten = source;
  for (const replacement of [...replacements.values()].sort((left, right) => right.start - left.start)) {
    rewritten = `${rewritten.slice(0, replacement.start)}${replacement.value}${rewritten.slice(replacement.end)}`;
  }
  return rewritten;
}

export function rewritePreviewHtmlRuntimeScripts(
  html: string,
  publicPrefix: string,
  registerSource?: PreviewRuntimeSourceRegistrar
) {
  const rewriteAttributes = (markup: string) => markup
    .replace(
      /(<[^>]+\b(?:src|href|action|poster|data)\s*=\s*)(["'])(\/preview\/(?:raw|workspace|references\/(?:raw|extracted))\/[^"']*)\2/gi,
      (_match, before: string, quote: string, previewPath: string) =>
        `${before}${quote}${publicPrefix}${previewPath}${quote}`
    )
    .replace(
      /(<script\b[^>]*\bsrc\s*=\s*)(["'])(https:\/\/[^"']+)\2/gi,
      (match, before: string, quote: string, source: string) => {
        const relayUrl = buildPreviewRuntimeRelayUrl(publicPrefix, source, registerSource);
        return relayUrl ? `${before}${quote}${relayUrl}${quote}` : match;
      }
    );

  let rewritten = "";
  let cursor = 0;
  for (const match of html.matchAll(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi)) {
    const index = match.index ?? cursor;
    rewritten += rewriteAttributes(html.slice(cursor, index));
    rewritten += `${rewriteAttributes(match[1])}${rewriteRuntimeSyntax(
      match[2],
      publicPrefix,
      undefined,
      registerSource
    )}${match[3]}`;
    cursor = index + match[0].length;
  }
  return rewritten + rewriteAttributes(html.slice(cursor));
}

export function rewritePreviewRuntimeJavaScript(
  source: string,
  publicPrefix: string,
  sourceUrl?: string,
  registerSource?: PreviewRuntimeSourceRegistrar
) {
  return rewriteRuntimeSyntax(source, publicPrefix, sourceUrl, registerSource);
}

function pruneRuntimeCache(now = Date.now()) {
  for (const [key, entry] of runtimeCache) {
    if (entry.lastUsedAt > now || now - entry.lastUsedAt > PREVIEW_RUNTIME_CACHE_TTL_MS) {
      runtimeCache.delete(key);
      runtimeCacheBytes -= entry.byteLength;
    }
  }
  while (
    runtimeCache.size > MAX_PREVIEW_RUNTIME_CACHE_ENTRIES ||
    runtimeCacheBytes > MAX_PREVIEW_RUNTIME_CACHE_BYTES
  ) {
    const oldest = [...runtimeCache.entries()].sort((left, right) => left[1].lastUsedAt - right[1].lastUsedAt)[0];
    if (!oldest) break;
    runtimeCache.delete(oldest[0]);
    runtimeCacheBytes -= oldest[1].byteLength;
  }
}

async function readBoundedRuntimeBody(response: Response) {
  const declaredLength = Number(response.headers.get("content-length") || "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_PREVIEW_RUNTIME_BYTES) {
    await response.body?.cancel();
    throw new Error("The preview runtime dependency is too large.");
  }
  if (!response.body) return Buffer.alloc(0);

  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_PREVIEW_RUNTIME_BYTES) {
        await reader.cancel();
        throw new Error("The preview runtime dependency is too large.");
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, total);
}

async function fetchPreviewRuntime(source: string, signal: AbortSignal, redirectCount = 0): Promise<{
  body: Buffer;
  contentType: string;
  sourceUrl: string;
}> {
  const response = await fetch(source, {
    method: "GET",
    credentials: "omit",
    headers: {
      Accept: "text/javascript, application/javascript, application/ecmascript"
    },
    redirect: "manual",
    signal
  });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    await response.body?.cancel();
    if (!location || redirectCount >= MAX_PREVIEW_RUNTIME_REDIRECTS) {
      throw new Error("The preview runtime dependency redirected too many times.");
    }
    const redirected = normalizePreviewRuntimeSource(new URL(location, source).toString());
    if (!redirected) {
      throw new Error("The preview runtime dependency redirected outside the approved hosts.");
    }
    return fetchPreviewRuntime(redirected, signal, redirectCount + 1);
  }

  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`The preview runtime dependency returned HTTP ${response.status}.`);
  }

  const contentType = (response.headers.get("content-type") || "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (!APPROVED_PREVIEW_RUNTIME_CONTENT_TYPES.has(contentType)) {
    await response.body?.cancel();
    throw new Error("The preview runtime dependency did not return JavaScript.");
  }
  const body = await readBoundedRuntimeBody(response);
  return { body, contentType: PREVIEW_RUNTIME_CONTENT_TYPE, sourceUrl: response.url || source };
}

async function loadPreviewRuntime(source: string) {
  const now = Date.now();
  pruneRuntimeCache(now);
  const cached = runtimeCache.get(source);
  if (cached) {
    cached.lastUsedAt = now;
    return cached;
  }

  const pending = pendingRuntimeFetches.get(source);
  if (pending) return pending;
  if (pendingRuntimeFetches.size >= MAX_PREVIEW_RUNTIME_PENDING_FETCHES) {
    throw new Error("Too many preview runtime dependencies are loading.");
  }

  const loading = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PREVIEW_RUNTIME_FETCH_TIMEOUT_MS);
    try {
      const loaded = await fetchPreviewRuntime(source, controller.signal);
      const loadedSource = normalizePreviewRuntimeSource(loaded.sourceUrl);
      const isEsmModule = loadedSource && new URL(loadedSource).hostname === "esm.sh";
      if (isEsmModule && loaded.body.length > MAX_PREVIEW_RUNTIME_MODULE_PARSE_BYTES) {
        throw new Error("The preview runtime module is too large to transform safely.");
      }
      const discoveredSources = new Set<string>();
      const rewrittenTemplate = isEsmModule
        ? rewriteRuntimeSyntax(
            loaded.body.toString("utf8"),
            PREVIEW_RUNTIME_PREFIX_PLACEHOLDER,
            loaded.sourceUrl,
            (runtimeSource) => {
              discoveredSources.add(runtimeSource);
              return true;
            },
            MAX_PREVIEW_RUNTIME_MODULE_PARSE_BYTES
          )
        : null;
      const templateBytes = rewrittenTemplate ? Buffer.byteLength(rewrittenTemplate, "utf8") : 0;
      const entry = {
        body: loaded.body,
        byteLength: loaded.body.length + templateBytes,
        contentType: loaded.contentType,
        discoveredSources: [...discoveredSources],
        lastUsedAt: Date.now(),
        rewrittenTemplate,
        sourceUrl: loaded.sourceUrl
      };
      runtimeCache.set(source, entry);
      runtimeCacheBytes += entry.byteLength;
      pruneRuntimeCache();
      return entry;
    } finally {
      clearTimeout(timeout);
      pendingRuntimeFetches.delete(source);
    }
  })();

  pendingRuntimeFetches.set(source, loading);
  return loading;
}

export async function handlePreviewRuntimeRelay(
  request: IncomingMessage,
  response: ServerResponse,
  publicPrefix: string,
  allowedSources: ReadonlySet<string>,
  registerSource?: PreviewRuntimeSourceRegistrar
) {
  const requestUrl = new URL(request.url || "/", "http://preview.local");
  const source = normalizePreviewRuntimeSource(requestUrl.searchParams.get("source"));
  if (!source) {
    response.statusCode = 400;
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.end("Unsupported preview runtime dependency");
    return;
  }
  if (!allowedSources.has(source)) {
    response.statusCode = 403;
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.end("Preview runtime dependency denied");
    return;
  }

  try {
    const method = (request.method || "GET").toUpperCase();
    pruneRuntimeCache();
    const runtime = method === "HEAD" ? runtimeCache.get(source) : await loadPreviewRuntime(source);
    if (!runtime) {
      response.statusCode = 404;
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      response.end();
      return;
    }
    runtime.lastUsedAt = Date.now();
    response.statusCode = 200;
    response.setHeader("Content-Type", PREVIEW_RUNTIME_CONTENT_TYPE);
    response.setHeader("X-Canvas-Helper-Preview-Runtime", "relayed");
    if (method === "HEAD") {
      response.end();
      return;
    }
    if (runtime.rewrittenTemplate) {
      for (const discoveredSource of runtime.discoveredSources) {
        if (registerSource?.(discoveredSource) === false) {
          throw new Error("The preview runtime dependency set is too large.");
        }
      }
    }
    const body = runtime.rewrittenTemplate
      ? Buffer.from(
          runtime.rewrittenTemplate.replaceAll(PREVIEW_RUNTIME_PREFIX_PLACEHOLDER, publicPrefix),
          "utf8"
        )
      : runtime.body;
    response.end(body);
  } catch {
    response.statusCode = 502;
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.end("Preview runtime dependency unavailable");
  }
}
