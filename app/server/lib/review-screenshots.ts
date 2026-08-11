import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
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
export const REVIEW_SCREENSHOT_MAX_TOTAL_FILES = 150;
export const REVIEW_SCREENSHOT_MAX_TOTAL_BYTES = 100 * 1024 * 1024;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const SAFE_SESSION = /^[A-Za-z0-9-]{16,80}$/;
const SAFE_ITEM = /^[A-Za-z0-9-]{1,160}$/;
const SAFE_SCREENSHOT_PATH = /^\.runtime\/studio-review-sets\/([A-Za-z0-9-]{16,80})\/([A-Za-z0-9._-]+\.png)$/;
let reviewScreenshotMutationTail = Promise.resolve();

type SaveReviewScreenshotOptions = {
  rootDir?: string;
  now?: number;
};

async function withReviewScreenshotMutation<T>(operation: () => Promise<T>) {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const previous = reviewScreenshotMutationTail;
  reviewScreenshotMutationTail = previous.then(() => gate);
  await previous;
  try {
    return await operation();
  } finally {
    release();
  }
}

export function isReviewScreenshotSessionId(value: unknown): value is string {
  return typeof value === "string" && SAFE_SESSION.test(value);
}

export function isReviewScreenshotItemId(value: unknown): value is string {
  return typeof value === "string" && SAFE_ITEM.test(value);
}

export function isReviewScreenshotPath(value: unknown): value is string {
  return typeof value === "string" && SAFE_SCREENSHOT_PATH.test(value);
}

function isReviewScreenshotNodeId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 160 && !/[\u0000-\u001f]/.test(value);
}

function screenshotOwnerHash(input: { sessionId: string; projectSlug: string; itemId: string; ownerNodeId: string }) {
  return createHash("sha256")
    .update(`${input.sessionId}\u0000${input.projectSlug}\u0000${input.itemId}\u0000${input.ownerNodeId}`)
    .digest("hex")
    .slice(0, 32);
}

function screenshotIdentityHash(screenshotId: string) {
  return createHash("sha256").update(screenshotId).digest("hex").slice(0, 16);
}

function assertReviewScreenshotOwner(input: {
  repoRelativePath: string;
  sessionId: string;
  projectSlug: string;
  itemId: string;
  ownerNodeId: string;
}) {
  if (
    !isReviewScreenshotPath(input.repoRelativePath) ||
    !isReviewScreenshotSessionId(input.sessionId) ||
    !isSafeProjectSlug(input.projectSlug) ||
    input.projectSlug.length > 160 ||
    !isReviewScreenshotItemId(input.itemId) ||
    !isReviewScreenshotNodeId(input.ownerNodeId)
  ) {
    throw new Error("Invalid Review Set screenshot owner.");
  }
  const match = input.repoRelativePath.match(SAFE_SCREENSHOT_PATH);
  const fileName = match?.[2] ?? "";
  const expectedPrefix = `${input.projectSlug}-${screenshotOwnerHash(input)}-`;
  const screenshotHash = fileName.slice(expectedPrefix.length, -4);
  if (
    match?.[1] !== input.sessionId ||
    !fileName.startsWith(expectedPrefix) ||
    !fileName.endsWith(".png") ||
    !/^[a-f0-9]{16}$/.test(screenshotHash)
  ) {
    throw new Error("Review Set screenshot does not belong to this annotation.");
  }
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
        const latestMtime = await latestSessionMtime(sessionDir);
        if (latestMtime > now + 60_000 || now - latestMtime > REVIEW_SCREENSHOT_RETENTION_MS) {
          await rm(sessionDir, { recursive: true, force: true });
        }
      } catch {
        // A concurrent save or cleanup can remove a session between listing and inspection.
      }
    })
  );
}

async function inspectReviewScreenshotBudget(rootDir: string) {
  let fileCount = 0;
  let byteLength = 0;
  let sessions;
  try {
    sessions = await readdir(rootDir, { withFileTypes: true });
  } catch {
    return { fileCount, byteLength };
  }
  for (const session of sessions) {
    if (!session.isDirectory() || !isReviewScreenshotSessionId(session.name)) continue;
    const sessionDir = path.join(rootDir, session.name);
    let files;
    try {
      files = await readdir(sessionDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith(".png")) continue;
      try {
        const fileStats = await stat(path.join(sessionDir, file.name));
        fileCount += 1;
        byteLength += fileStats.size;
      } catch {
        // A concurrent cleanup can remove a file while the budget is being counted.
      }
    }
  }
  return { fileCount, byteLength };
}

export async function saveReviewScreenshot(input: {
  sessionId: string;
  projectSlug: string;
  itemId: string;
  screenshotId: string;
  ownerNodeId: string;
  png: Buffer;
}, options: SaveReviewScreenshotOptions = {}) {
  if (
    !isReviewScreenshotSessionId(input.sessionId) ||
    !isSafeProjectSlug(input.projectSlug) ||
    input.projectSlug.length > 160 ||
    !isReviewScreenshotItemId(input.itemId) ||
    !isReviewScreenshotItemId(input.screenshotId) ||
    !isReviewScreenshotNodeId(input.ownerNodeId)
  ) {
    throw new Error("Invalid Review Set screenshot identity.");
  }
  const dimensions = inspectPng(input.png);
  const rootDir = options.rootDir ?? reviewScreenshotRoot;
  return withReviewScreenshotMutation(async () => {
    await cleanupExpiredReviewScreenshotSessions({ rootDir, now: options.now });

    const sessionDir = path.join(rootDir, input.sessionId);
    await mkdir(rootDir, { recursive: true, mode: 0o700 });
    await mkdir(sessionDir, { recursive: true, mode: 0o700 });
    const [resolvedRoot, resolvedSession] = await Promise.all([realpath(rootDir), realpath(sessionDir)]);
    if (!isPathInside(resolvedRoot, resolvedSession) || resolvedRoot === resolvedSession) {
      throw new Error("Review Set screenshot storage escaped its local cache boundary.");
    }
    const budget = await inspectReviewScreenshotBudget(resolvedRoot);
    if (
      budget.fileCount >= REVIEW_SCREENSHOT_MAX_TOTAL_FILES ||
      budget.byteLength + input.png.length > REVIEW_SCREENSHOT_MAX_TOTAL_BYTES
    ) {
      throw new Error("Review Set screenshot storage has reached its bounded local limit.");
    }
    const fileName = `${input.projectSlug}-${screenshotOwnerHash(input)}-${screenshotIdentityHash(input.screenshotId)}.png`;
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
      await writeFile(temporaryPath, input.png, { flag: "wx", mode: 0o600 });
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
  });
}

export async function replaceReviewScreenshot(input: {
  repoRelativePath: string;
  sessionId: string;
  projectSlug: string;
  itemId: string;
  screenshotId: string;
  ownerNodeId: string;
  png: Buffer;
}, options: SaveReviewScreenshotOptions = {}) {
  assertReviewScreenshotOwner(input);
  if (!isReviewScreenshotItemId(input.screenshotId)) {
    throw new Error("Invalid replacement screenshot identity.");
  }
  const dimensions = inspectPng(input.png);
  const match = input.repoRelativePath.match(SAFE_SCREENSHOT_PATH);
  const expectedName = `${input.projectSlug}-${screenshotOwnerHash(input)}-${screenshotIdentityHash(input.screenshotId)}.png`;
  if (!match || match[1] !== input.sessionId || match[2] !== expectedName) {
    throw new Error("The replacement screenshot does not match its existing owner.");
  }
  const rootDir = options.rootDir ?? reviewScreenshotRoot;
  return withReviewScreenshotMutation(async () => {
    await cleanupExpiredReviewScreenshotSessions({ rootDir, now: options.now });
    const absolutePath = path.join(rootDir, match[1], match[2]);
    const [resolvedRoot, resolvedFile] = await Promise.all([realpath(rootDir), realpath(absolutePath)]);
    if (!isPathInside(resolvedRoot, resolvedFile) || resolvedRoot === resolvedFile) {
      throw new Error("Review Set screenshot replacement escaped its local cache boundary.");
    }
    const [budget, existing] = await Promise.all([inspectReviewScreenshotBudget(resolvedRoot), stat(resolvedFile)]);
    if (budget.byteLength - existing.size + input.png.length > REVIEW_SCREENSHOT_MAX_TOTAL_BYTES) {
      throw new Error("Review Set screenshot storage has reached its bounded local limit.");
    }
    const temporaryPath = path.join(path.dirname(resolvedFile), `.${path.basename(resolvedFile)}.${randomUUID()}.tmp`);
    try {
      await writeFile(temporaryPath, input.png, { flag: "wx", mode: 0o600 });
      await rename(temporaryPath, resolvedFile);
    } catch (error) {
      await rm(temporaryPath, { force: true });
      throw error;
    }
    return {
      absolutePath: resolvedFile,
      path: input.repoRelativePath,
      byteLength: input.png.length,
      ...dimensions
    };
  });
}

export async function readReviewScreenshot(repoRelativePath: string, options: SaveReviewScreenshotOptions = {}) {
  const match = repoRelativePath.match(SAFE_SCREENSHOT_PATH);
  if (!match) {
    throw new Error("Invalid Review Set screenshot path.");
  }
  const rootDir = options.rootDir ?? reviewScreenshotRoot;
  const now = options.now ?? Date.now();
  await cleanupExpiredReviewScreenshotSessions({ rootDir, now });
  const absolutePath = path.join(rootDir, match[1], match[2]);
  const [resolvedRoot, resolvedFile] = await Promise.all([realpath(rootDir), realpath(absolutePath)]);
  if (!isPathInside(resolvedRoot, resolvedFile) || resolvedRoot === resolvedFile) {
    throw new Error("Review Set screenshot escaped its local cache boundary.");
  }
  const fileStats = await stat(resolvedFile);
  if (fileStats.mtimeMs > now + 60_000 || now - fileStats.mtimeMs > REVIEW_SCREENSHOT_RETENTION_MS) {
    throw new Error("Review Set screenshot is outside its retention window.");
  }
  const png = await readFile(resolvedFile);
  return { png, ...inspectPng(png) };
}

export async function verifyReviewScreenshot(input: {
  repoRelativePath: string;
  sessionId: string;
  projectSlug: string;
  itemId: string;
  ownerNodeId: string;
}, options: SaveReviewScreenshotOptions = {}) {
  assertReviewScreenshotOwner(input);
  const result = await readReviewScreenshot(input.repoRelativePath, options);
  return {
    path: input.repoRelativePath,
    byteLength: result.png.length,
    width: result.width,
    height: result.height
  };
}

export async function deleteReviewScreenshots(
  screenshots: Array<{
    repoRelativePath: string;
    sessionId: string;
    projectSlug: string;
    itemId: string;
    ownerNodeId: string;
  }>,
  options: SaveReviewScreenshotOptions = {}
) {
  if (screenshots.length > REVIEW_SCREENSHOT_MAX_FILES_PER_SESSION) {
    throw new Error("Invalid bounded Review Set screenshot deletion.");
  }
  screenshots.forEach(assertReviewScreenshotOwner);
  const rootDir = options.rootDir ?? reviewScreenshotRoot;
  await withReviewScreenshotMutation(async () => {
    let resolvedRoot: string;
    try {
      resolvedRoot = await realpath(rootDir);
    } catch {
      return;
    }
    await Promise.all(screenshots.map(async ({ repoRelativePath }) => {
      const match = repoRelativePath.match(SAFE_SCREENSHOT_PATH);
      if (!match) return;
      const absolutePath = path.join(rootDir, match[1], match[2]);
      try {
        const resolvedFile = await realpath(absolutePath);
        if (!isPathInside(resolvedRoot, resolvedFile) || resolvedRoot === resolvedFile) return;
        await rm(resolvedFile, { force: true });
      } catch {
        // Deletion is idempotent; a missing or concurrently removed screenshot is already reclaimed.
      }
    }));
  });
}
