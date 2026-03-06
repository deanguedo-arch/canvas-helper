import assert from "node:assert/strict";
import type { IncomingMessage, ServerResponse } from "node:http";
import test from "node:test";

import { createIncomingRouteHandler } from "../../app/server/routes/incoming.js";
import { IncomingLockError } from "../lib/incoming-intake.js";

function createResponseRecorder() {
  const headers = new Map<string, string>();
  let body = "";

  const response = {
    statusCode: 200,
    setHeader(name: string, value: string) {
      headers.set(name, value);
    },
    end(value: string) {
      body = value;
    }
  } as unknown as ServerResponse;

  return {
    response,
    headers,
    getBody() {
      return body;
    }
  };
}

test("incoming refresh route returns a structured summary on POST", async () => {
  const summary = {
    startedAt: "2026-03-06T00:00:00.000Z",
    finishedAt: "2026-03-06T00:00:01.000Z",
    mode: "all" as const,
    importedProjects: [{ sourceKey: "calm", requestedSlug: "calm", slug: "calm", archivedTo: "archive", warnings: [] }],
    skippedProjects: [],
    syncedReferences: [],
    failures: [],
    archivedPaths: ["archive"]
  };
  const handleIncomingRoute = createIncomingRouteHandler({
    async runIncomingRefresh() {
      return summary;
    },
    async withIncomingLock<T>(callback: () => Promise<T>) {
      return callback();
    }
  });
  const { response, headers, getBody } = createResponseRecorder();

  const handled = await handleIncomingRoute(
    "/api/incoming/refresh",
    { method: "POST" } as IncomingMessage,
    response
  );

  assert.equal(handled, true);
  assert.equal(response.statusCode, 200);
  assert.equal(headers.get("Content-Type"), "application/json; charset=utf-8");
  assert.deepEqual(JSON.parse(getBody()), summary);
});

test("incoming refresh route returns 405 for non-POST requests", async () => {
  const handleIncomingRoute = createIncomingRouteHandler({
    async runIncomingRefresh() {
      throw new Error("should not run");
    },
    async withIncomingLock<T>(callback: () => Promise<T>) {
      return callback();
    }
  });
  const { response, getBody } = createResponseRecorder();

  const handled = await handleIncomingRoute(
    "/api/incoming/refresh",
    { method: "GET" } as IncomingMessage,
    response
  );

  assert.equal(handled, true);
  assert.equal(response.statusCode, 405);
  assert.match(getBody(), /Method not allowed/);
});

test("incoming refresh route returns 409 when the intake lock is held", async () => {
  const handleIncomingRoute = createIncomingRouteHandler({
    async runIncomingRefresh() {
      throw new Error("should not run");
    },
    async withIncomingLock<T>(_callback: () => Promise<T>) {
      throw new IncomingLockError("C:\\temp\\incoming.lock");
    }
  });
  const { response, getBody } = createResponseRecorder();

  const handled = await handleIncomingRoute(
    "/api/incoming/refresh",
    { method: "POST" } as IncomingMessage,
    response
  );

  assert.equal(handled, true);
  assert.equal(response.statusCode, 409);
  assert.match(getBody(), /already running/);
});
