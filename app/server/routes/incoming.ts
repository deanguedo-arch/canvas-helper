import type { IncomingMessage, ServerResponse } from "node:http";

import { IncomingLockError, runIncomingRefresh, withIncomingLock } from "../../../scripts/lib/incoming-intake.js";
import type { IncomingRefreshSummary } from "../../../scripts/lib/incoming-intake.js";

import { sendJson } from "../lib/response";

type IncomingRouteDependencies = {
  runIncomingRefresh: () => Promise<IncomingRefreshSummary>;
  withIncomingLock: <T>(callback: () => Promise<T>) => Promise<T>;
};

export function createIncomingRouteHandler(dependencies: IncomingRouteDependencies = {
  runIncomingRefresh,
  withIncomingLock
}) {
  return async function handleIncomingRoute(url: string, request: IncomingMessage, response: ServerResponse) {
    if (url !== "/api/incoming/refresh") {
      return false;
    }

    if (request.method !== "POST") {
      sendJson(response, 405, {
        error: "Method not allowed."
      });
      return true;
    }

    try {
      const summary = await dependencies.withIncomingLock(() => dependencies.runIncomingRefresh());
      sendJson(response, 200, summary);
    } catch (error) {
      if (error instanceof IncomingLockError) {
        sendJson(response, 409, {
          error: error.message
        });
        return true;
      }

      sendJson(response, 500, {
        error: error instanceof Error ? error.message : "Failed to refresh incoming intake."
      });
    }

    return true;
  };
}

export const handleIncomingRoute = createIncomingRouteHandler();
