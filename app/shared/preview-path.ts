import { STUDIO_BRIDGE_LIMITS } from "./studio-quality.js";

export const PREVIEW_CAPABILITY_PATH_PREFIX = "/_canvas-helper/p/";
export const PREVIEW_CAPABILITY_TOKEN_PATTERN = new RegExp(
  `^[A-Za-z0-9-]{${STUDIO_BRIDGE_LIMITS.previewCapabilityTokenMinCodeUnits},${STUDIO_BRIDGE_LIMITS.previewCapabilityTokenMaxCodeUnits}}$`
);
export const PREVIEW_TRANSIENT_QUERY_PARAMETERS = [
  "canvas-helper-capture",
  "canvas-helper-inspect-rejoin",
  "canvas-helper-inspect-session"
] as const;

export type PreviewCapabilityPath = {
  token: string;
  publicPrefix: string;
  previewPath: string;
  scope: string;
};

function previewScope(previewPath: string) {
  const project = previewPath.match(/^\/preview\/(raw|workspace)\/([^/]+)(?:\/|$)/);
  const reference = previewPath.match(/^\/preview\/references\/(raw|extracted)\/([^/]+)(?:\/|$)/);
  const match = project ?? reference;
  if (!match) return null;
  try {
    const slug = decodeURIComponent(match[2]);
    if (!slug || /[\/\\\u0000-\u001f]/.test(slug)) return null;
    return project
      ? `project:${match[1]}:${slug}`
      : `reference:${match[1]}:${slug}`;
  } catch {
    return null;
  }
}

export function parsePreviewCapabilityPath(pathname: string): PreviewCapabilityPath | null {
  const match = pathname.match(/^\/_canvas-helper\/p\/([A-Za-z0-9-]+)(\/preview\/.*)$/);
  if (!match || !PREVIEW_CAPABILITY_TOKEN_PATTERN.test(match[1])) return null;
  const scope = previewScope(match[2]);
  if (!scope) return null;
  return {
    token: match[1],
    publicPrefix: `${PREVIEW_CAPABILITY_PATH_PREFIX}${match[1]}`,
    previewPath: match[2],
    scope
  };
}

export function isCapabilityWorkspacePreviewPath(pathname: string, projectSlug?: string) {
  const parsed = parsePreviewCapabilityPath(pathname);
  if (!parsed || !parsed.scope.startsWith("project:workspace:")) return false;
  return projectSlug === undefined || parsed.scope === `project:workspace:${projectSlug}`;
}

function parsedPreviewUrl(value: string | URL) {
  try {
    const url = new URL(value.toString());
    const capability = parsePreviewCapabilityPath(url.pathname);
    if (!capability) return null;
    for (const parameter of PREVIEW_TRANSIENT_QUERY_PARAMETERS) {
      url.searchParams.delete(parameter);
    }
    return { url, capability };
  } catch {
    return null;
  }
}

/**
 * Exact browser-page identity for a capability-scoped preview. Course query
 * parameters and the hash are state, so only Canvas Helper's one-time bridge
 * and capture parameters are removed.
 */
export function normalizePreviewPageIdentity(value: string | URL) {
  const parsed = parsedPreviewUrl(value);
  return parsed ? parsed.url.toString() : null;
}

/**
 * Stable course-page identity for persisted Review Set metadata. It keeps the
 * scope, file, query, and hash while deliberately excluding the replaceable
 * loopback origin and random capability token.
 */
export function normalizePreviewPageRouteIdentity(value: string | URL) {
  const parsed = parsedPreviewUrl(value);
  if (!parsed) return null;
  return `${parsed.capability.scope}\u001f${parsed.capability.previewPath}${parsed.url.search}${parsed.url.hash}`;
}

/**
 * Move a saved page onto the currently authorized capability without changing
 * its course-owned query or hash state. Only loopback-to-loopback rebases of
 * the same declared scope are accepted, so a restarted preview port is safe.
 */
export function rebasePreviewPageHref(value: string | URL, currentValue: string | URL) {
  const saved = parsedPreviewUrl(value);
  const current = parsedPreviewUrl(currentValue);
  if (
    !saved ||
    !current ||
    saved.url.protocol !== "http:" ||
    saved.url.hostname !== "127.0.0.1" ||
    current.url.protocol !== "http:" ||
    current.url.hostname !== "127.0.0.1" ||
    saved.capability.scope !== current.capability.scope
  ) {
    return null;
  }
  saved.url.protocol = current.url.protocol;
  saved.url.host = current.url.host;
  saved.url.pathname = `${current.capability.publicPrefix}${saved.capability.previewPath}`;
  return saved.url.toString();
}
