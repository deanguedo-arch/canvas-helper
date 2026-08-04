import type { IncomingMessage } from "node:http";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function toRequestOrigin(request: IncomingMessage) {
  const host = request.headers.host;
  if (!host) {
    return null;
  }

  return `http://${host}`;
}

export function isUnsafeStudioRequest(request: IncomingMessage) {
  return !SAFE_METHODS.has((request.method || "GET").toUpperCase());
}

export function hasTrustedStudioMutationOrigin(request: IncomingMessage) {
  if (!isUnsafeStudioRequest(request)) {
    return true;
  }

  const expectedOrigin = toRequestOrigin(request);
  const origin = request.headers.origin;
  return Boolean(expectedOrigin && origin && origin === expectedOrigin);
}
