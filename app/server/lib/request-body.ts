import type { IncomingMessage } from "node:http";

const DEFAULT_MAX_REQUEST_BODY_BYTES = 1_048_576;

type RequestBodyOptions = {
  maxBytes?: number;
  description?: string;
};

export async function readRequestBody(request: IncomingMessage, options: RequestBodyOptions = {}) {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_REQUEST_BODY_BYTES;
  const description = options.description ?? "Request body";
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) throw new Error("The request body limit is invalid.");
  const declaredHeader = request.headers["content-length"];
  const declaredValue = Array.isArray(declaredHeader) ? declaredHeader[0] : declaredHeader;
  if (declaredValue !== undefined) {
    const declared = Number(declaredValue);
    if (!Number.isSafeInteger(declared) || declared < 0) throw new Error("The Content-Length header is invalid.");
    if (declared > maxBytes) throw new Error(`${description} must be ${maxBytes} bytes or smaller.`);
  }
  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of request) {
    const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    total += buffer.length;
    if (total > maxBytes) throw new Error(`${description} must be ${maxBytes} bytes or smaller.`);
    chunks.push(buffer);
  }

  return Buffer.concat(chunks).toString("utf8");
}

export async function readRequestJson<T>(request: IncomingMessage, options: RequestBodyOptions = {}): Promise<T> {
  const body = await readRequestBody(request, options);
  if (!body.trim()) {
    return {} as T;
  }

  return JSON.parse(body) as T;
}
