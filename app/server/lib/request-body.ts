import type { IncomingMessage } from "node:http";

export async function readRequestBody(request: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    if (typeof chunk === "string") {
      chunks.push(Buffer.from(chunk));
      continue;
    }

    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

export async function readRequestJson<T>(request: IncomingMessage): Promise<T> {
  const body = await readRequestBody(request);
  if (!body.trim()) {
    return {} as T;
  }

  return JSON.parse(body) as T;
}
