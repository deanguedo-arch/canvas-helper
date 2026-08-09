import { randomUUID } from "node:crypto";
import { mkdir, readdir, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  REVIEW_SCREENSHOT_MAX_BYTES,
  REVIEW_SCREENSHOT_MAX_DIMENSION,
  REVIEW_SCREENSHOT_MAX_FILES_PER_SESSION,
  REVIEW_SCREENSHOT_MAX_PIXELS
} from "../../shared/inspection.js";
import { repoRoot } from "../../../scripts/lib/paths.ts";

import { isPathInside, isSafeProjectSlug } from "./validation";

export const REVIEW_SCREENSHOT_RETENTION_MS = 7 * 24 * 60 * 60 * 1_000;
export const reviewScreenshotRoot = path.join(repoRoot, ".runtime", "studio-review-sets");

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const SAFE_SESSION = /^[A-Za-z0-9-]{16,80}$/;
const SAFE_ITEM = /^[A-Za-z0-9-]{1,160}$/;

type SaveReviewScreenshotOptions = {
  rootDir?: string;
  now?: number;
};

export function isReviewScreenshotSessionId(value: unknown): value is string {
  return typeof value === "string" && SAFE_SESSION.test(value);
}

export function isReviewScreenshotItemId(value: unknown): value is string {
  return typeof value === "string" && SAFE_ITEM.test(value);
}

function inspectPng(buffer: Buffer) {
  if (buffer.length < 24 || buffer.length > REVIEW_SCREENSHOT_MAX_BYTES || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error("Invalid bounded PNG screenshot.");
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (
    width <= 0 ||
    height <= 0 ||
    width > REVIEW_SCREENSHOT_MAX_DIMENSION ||
    height > REVIEW_SCREENSHOT_MAX_DIMENSION ||
    width * height > REVIEW_SCREENSHOT_MAX_PIXELS
  ) {
    throw new Error("Screenshot dimensions exceed the bounded Review Set limit.");
  }
  return { width, height };
}

async function latestSessionMtime(sessionDir: string) {
  const sessionStats = await stat(sessionDir);
  const entries = await readdir(sessionDir, { withFileTypes: true });
  const fileMtimes = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => (await stat(path.join(sessionDir, entry.name))).mtimeMs)
  );
  return Math.max(sessionStats.mtimeMs, ...fileMtimes);
}

export async function cleanupExpiredReviewScreenshotSessions(options: SaveReviewScreenshotOptions = {}) {
  const rootDir = options.rootDir ?? reviewScreenshotRoot;
  const now = options.now ?? Date.now();
  let entries;
  try {
    entries = await readdir(rootDir, { withFileTypes: true });
  } catch {
    return;
  }

  await Promise.all(
    entries.map(async (entry) => {
      if (!entry.isDirectory() || !isReviewScreenshotSessionId(entry.name)) {
        return;
      }
      const sessionDir = path.join(rootDir, entry.name);
      try {
        if (now - await latestSessionMtime(sessionDir) > REVIEW_SCREENSHOT_RETENTION_MS) {
          await rm(sessionDir, { recursive: true, force: true });
        }
      } catch {
        // A concurrent save or cleanup can remove a session between listing and inspection.
      }
    })
  );
}

export async function saveReviewScreenshot(input: {
  sessionId: string;
  projectSlug: string;
  itemId: string;
  png: Buffer;
}, options: SaveReviewScreenshotOptions = {}) {
  if (
    !isReviewScreenshotSessionId(input.sessionId) ||
    !isSafeProjectSlug(input.projectSlug) ||
    input.projectSlug.length > 160 ||
    !isReviewScreenshotItemId(input.itemId)
  ) {
    throw new Error("Invalid Review Set screenshot identity.");
  }
  const dimensions = inspectPng(input.png);
  const rootDir = options.rootDir ?? reviewScreenshotRoot;
  await cleanupExpiredReviewScreenshotSessions({ rootDir, now: options.now });

  const sessionDir = path.join(rootDir, input.sessionId);
  await mkdir(rootDir, { recursive: true });
  await mkdir(sessionDir, { recursive: true });
  const [resolvedRoot, resolvedSession] = await Promise.all([realpath(rootDir), realpath(sessionDir)]);
  if (!isPathInside(resolvedRoot, resolvedSession) || resolvedRoot === resolvedSession) {
    throw new Error("Review Set screenshot storage escaped its local cache boundary.");
  }
  const fileName = `${input.projectSlug}-${input.itemId}.png`;
  const existingFiles = (await readdir(resolvedSession, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".png"))
    .map((entry) => entry.name);
  if (existingFiles.includes(fileName)) {
    throw new Error("This Review Set screenshot was already saved.");
  }
  if (existingFiles.length >= REVIEW_SCREENSHOT_MAX_FILES_PER_SESSION) {
    throw new Error("This Review Set already has its maximum number of screenshots.");
  }

  const absolutePath = path.join(resolvedSession, fileName);
  const temporaryPath = path.join(resolvedSession, `.${fileName}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporaryPath, input.png, { flag: "wx" });
    await rename(temporaryPath, absolutePath);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
  return {
    absolutePath,
    path: [".runtime", "studio-review-sets", input.sessionId, fileName].join("/"),
    byteLength: input.png.length,
    ...dimensions
  };
}
