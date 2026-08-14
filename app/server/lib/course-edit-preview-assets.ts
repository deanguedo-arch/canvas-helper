import { createHash, randomUUID } from "node:crypto";
import path from "node:path";

import type {
  CourseEditPendingAssetReference,
  CourseEditTargetIdentity
} from "../../shared/course-editing.js";
import { normalizePreviewPageIdentity, parsePreviewCapabilityPath } from "../../shared/preview-path.js";
import { validateCourseEditImage, type ValidatedCourseEditImage } from "./course-edit-image";

const PENDING_IMAGE_IDLE_TTL_MS = 10 * 60 * 1_000;
const PENDING_IMAGE_ABSOLUTE_TTL_MS = 30 * 60 * 1_000;
const PENDING_IMAGE_MAX_PER_SESSION = 5;
const PENDING_IMAGE_MAX_SESSION_BYTES = 25 * 1024 * 1024;
const PENDING_IMAGE_MAX_TOTAL_BYTES = 256 * 1024 * 1024;
const PENDING_IMAGE_MAX_ENTRIES = 256;
const PENDING_IMAGE_TOKEN_PATTERN = /^[A-Za-z0-9-]{16,96}$/;

export type PendingCourseEditImageBinding = {
  projectSlug: string;
  htmlPath: string;
  targetId: string;
  sourceDigest: string;
  targetNodeId: string;
  previewSessionId: string;
  pageIdentity: string;
};

type PendingCourseEditImage = PendingCourseEditImageBinding & {
  id: string;
  ownerPreviewSessionId: string;
  capabilityToken: string;
  publicPrefix: string;
  previewOrigin: string;
  bytes: Buffer;
  image: ValidatedCourseEditImage;
  digest: string;
  finalSrc: string;
  createdAt: number;
  lastUsedAt: number;
};

const pendingImages = new Map<string, PendingCourseEditImage>();
let pendingImageBytes = 0;

function removePendingImage(id: string) {
  const existing = pendingImages.get(id);
  if (!existing) return false;
  pendingImages.delete(id);
  pendingImageBytes = Math.max(0, pendingImageBytes - existing.bytes.length);
  return true;
}

function retireExpiredPendingImages(now = Date.now()) {
  for (const [id, entry] of pendingImages) {
    if (
      entry.lastUsedAt > now ||
      entry.createdAt > now ||
      now - entry.lastUsedAt > PENDING_IMAGE_IDLE_TTL_MS ||
      now - entry.createdAt > PENDING_IMAGE_ABSOLUTE_TTL_MS
    ) removePendingImage(id);
  }
}

function requirePreviewBinding(binding: PendingCourseEditImageBinding) {
  const normalizedPageIdentity = normalizePreviewPageIdentity(binding.pageIdentity);
  if (!normalizedPageIdentity || normalizedPageIdentity !== binding.pageIdentity) {
    throw new Error("The image preview is not bound to a current isolated learner page.");
  }
  const url = new URL(normalizedPageIdentity);
  const capability = parsePreviewCapabilityPath(url.pathname);
  if (!capability || capability.scope !== `project:workspace:${binding.projectSlug}`) {
    throw new Error("The image preview capability does not belong to this course workspace.");
  }
  const expectedPrefix = `/preview/workspace/${encodeURIComponent(binding.projectSlug)}/`;
  if (!capability.previewPath.startsWith(expectedPrefix)) {
    throw new Error("The image preview page does not belong to this course.");
  }
  const encodedHtmlPath = capability.previewPath.slice(expectedPrefix.length);
  let decodedHtmlPath = "";
  try {
    decodedHtmlPath = encodedHtmlPath.split("/").map(decodeURIComponent).join("/");
  } catch {
    throw new Error("The image preview page path is invalid.");
  }
  if (decodedHtmlPath !== binding.htmlPath) {
    throw new Error("The image preview page no longer matches this edit target.");
  }
  return { url, capability };
}

function bindingMatches(entry: PendingCourseEditImage, binding: PendingCourseEditImageBinding) {
  return (
    entry.projectSlug === binding.projectSlug &&
    entry.htmlPath === binding.htmlPath &&
    entry.targetId === binding.targetId &&
    entry.sourceDigest === binding.sourceDigest &&
    entry.targetNodeId === binding.targetNodeId &&
    entry.previewSessionId === binding.previewSessionId &&
    entry.pageIdentity === binding.pageIdentity
  );
}

function referenceFor(entry: PendingCourseEditImage): CourseEditPendingAssetReference {
  return {
    kind: "image",
    id: entry.id,
    previewSessionId: entry.ownerPreviewSessionId,
    digest: entry.digest,
    finalSrc: entry.finalSrc,
    mimeType: entry.image.mimeType,
    width: entry.image.width,
    height: entry.image.height,
    byteLength: entry.bytes.length
  };
}

function referenceMatches(entry: PendingCourseEditImage, reference: CourseEditPendingAssetReference) {
  const expected = referenceFor(entry);
  return Object.keys(expected).every((key) => (
    expected[key as keyof CourseEditPendingAssetReference] === reference[key as keyof CourseEditPendingAssetReference]
  ));
}

export async function storePendingCourseEditImage(input: PendingCourseEditImageBinding & { bytes: Buffer }) {
  retireExpiredPendingImages();
  const { url, capability } = requirePreviewBinding(input);
  const image = await validateCourseEditImage(input.bytes);
  const sessionEntries = [...pendingImages.values()].filter((entry) => entry.previewSessionId === input.previewSessionId);
  const sessionBytes = sessionEntries.reduce((total, entry) => total + entry.bytes.length, 0);
  if (sessionEntries.length >= PENDING_IMAGE_MAX_PER_SESSION) {
    throw new Error(`One edit preview can hold at most ${PENDING_IMAGE_MAX_PER_SESSION} pending images.`);
  }
  if (sessionBytes + input.bytes.length > PENDING_IMAGE_MAX_SESSION_BYTES) {
    throw new Error("Pending images for one edit preview must stay under 25 MB.");
  }
  if (pendingImages.size >= PENDING_IMAGE_MAX_ENTRIES || pendingImageBytes + input.bytes.length > PENDING_IMAGE_MAX_TOTAL_BYTES) {
    throw new Error("Studio's temporary image preview memory is full. Clear another preview and try again.");
  }
  const now = Date.now();
  const id = randomUUID();
  const digest = createHash("sha256").update(input.bytes).digest("hex");
  const filename = `${digest}.${image.extension}`;
  const workspaceRelative = `assets/custom/studio/${filename}`;
  const finalSrc = path.posix.relative(path.posix.dirname(input.htmlPath), workspaceRelative) || filename;
  const entry: PendingCourseEditImage = {
    ...input,
    id,
    ownerPreviewSessionId: input.previewSessionId,
    capabilityToken: capability.token,
    publicPrefix: capability.publicPrefix,
    previewOrigin: url.origin,
    bytes: Buffer.from(input.bytes),
    image,
    digest,
    finalSrc,
    createdAt: now,
    lastUsedAt: now
  };
  pendingImages.set(id, entry);
  pendingImageBytes += entry.bytes.length;
  return {
    ...referenceFor(entry),
    previewSrc: `${url.origin}${capability.publicPrefix}/edit-images/${id}`,
  };
}

export function bindPendingCourseEditImage(
  reference: CourseEditPendingAssetReference,
  binding: PendingCourseEditImageBinding
) {
  retireExpiredPendingImages();
  const { url, capability } = requirePreviewBinding(binding);
  const entry = pendingImages.get(reference.id);
  if (
    !entry ||
    !referenceMatches(entry, reference) ||
    entry.projectSlug !== binding.projectSlug ||
    entry.htmlPath !== binding.htmlPath ||
    entry.targetId !== binding.targetId ||
    entry.sourceDigest !== binding.sourceDigest ||
    entry.targetNodeId !== binding.targetNodeId
  ) {
    throw new Error("This pending image is missing, expired, or belongs to a different course element. Upload it again.");
  }
  entry.previewSessionId = binding.previewSessionId;
  entry.pageIdentity = binding.pageIdentity;
  entry.capabilityToken = capability.token;
  entry.publicPrefix = capability.publicPrefix;
  entry.previewOrigin = url.origin;
  entry.lastUsedAt = Date.now();
  return entry;
}

export function getPendingCourseEditImageForApply(
  reference: CourseEditPendingAssetReference,
  identity: CourseEditTargetIdentity
) {
  retireExpiredPendingImages();
  const entry = pendingImages.get(reference.id);
  if (
    !entry ||
    !referenceMatches(entry, reference) ||
    entry.projectSlug !== identity.projectSlug ||
    entry.htmlPath !== identity.htmlPath ||
    entry.targetId !== identity.targetId ||
    entry.sourceDigest !== identity.sourceDigest ||
    entry.targetNodeId !== identity.nodeId
  ) {
    throw new Error("A pending image is missing, expired, or no longer matches this draft. Upload it again before applying.");
  }
  entry.lastUsedAt = Date.now();
  return entry;
}

export function consumePendingCourseEditImage(reference: CourseEditPendingAssetReference) {
  const entry = pendingImages.get(reference.id);
  if (!entry || !referenceMatches(entry, reference)) return false;
  return removePendingImage(entry.id);
}

export function getPendingCourseEditImage(id: string, binding: PendingCourseEditImageBinding) {
  retireExpiredPendingImages();
  if (!PENDING_IMAGE_TOKEN_PATTERN.test(id)) throw new Error("The pending image identifier is invalid.");
  const entry = pendingImages.get(id);
  if (!entry || !bindingMatches(entry, binding)) {
    throw new Error("This pending image no longer belongs to the active edit preview.");
  }
  entry.lastUsedAt = Date.now();
  return entry;
}

export function readPendingCourseEditImageForPreview(capabilityToken: string, id: string) {
  retireExpiredPendingImages();
  if (!PENDING_IMAGE_TOKEN_PATTERN.test(id)) return null;
  const entry = pendingImages.get(id);
  if (!entry || entry.capabilityToken !== capabilityToken) return null;
  entry.lastUsedAt = Date.now();
  return {
    bytes: entry.bytes,
    mimeType: entry.image.mimeType,
    byteLength: entry.bytes.length
  };
}

export function removePendingCourseEditImage(id: string, binding: PendingCourseEditImageBinding) {
  const entry = getPendingCourseEditImage(id, binding);
  return removePendingImage(entry.id);
}

export function clearPendingCourseEditImagesForSession(previewSessionId: string, retainIds: readonly string[] = []) {
  retireExpiredPendingImages();
  const retained = new Set(retainIds);
  let removed = 0;
  for (const [id, entry] of pendingImages) {
    if (entry.previewSessionId === previewSessionId && !retained.has(id) && removePendingImage(id)) removed += 1;
  }
  return removed;
}

export function parsePendingCourseEditImagePath(pathname: string) {
  const match = pathname.match(/^\/_canvas-helper\/p\/([A-Za-z0-9-]+)\/edit-images\/([A-Za-z0-9-]+)$/);
  if (!match || !PENDING_IMAGE_TOKEN_PATTERN.test(match[2])) return null;
  return { capabilityToken: match[1], imageId: match[2] };
}

export function pendingCourseEditImageStateForTests() {
  retireExpiredPendingImages();
  return { entries: pendingImages.size, bytes: pendingImageBytes };
}
