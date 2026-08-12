import {
  capturePreviewScreenshot,
  cropScreenshotPng,
  releaseScreenshotDraft,
  useScreenshotAnnotation
} from "../hooks/useScreenshotAnnotation";
import {
  createReviewScreenshotSessionId,
  deleteReviewScreenshotPaths,
  persistReviewScreenshot,
  replaceReviewScreenshot,
  reviewScreenshotImageUrl,
  verifyReviewScreenshots
} from "./review-screenshots";
import {
  buildReviewSetPacket,
  createReviewSetItem,
  hasSameMaterialResolution,
  reviewSetItemIdentity,
  utf8ByteLength
} from "./review-set";
import {
  createReviewSetBackup,
  createReviewSetSessionId,
  deleteStoredReviewSet,
  listStoredReviewSets,
  loadStoredReviewSet,
  parseReviewSetBackup,
  saveStoredReviewSet
} from "./review-set-storage";

/**
 * The only low-level Review Workbench dependency App.tsx may consume.
 * Each sub-contract stays independently testable while the orchestration layer
 * remains free to change its storage, packet, capture, or screenshot internals.
 */
export const reviewWorkbench = Object.freeze({
  items: Object.freeze({
    create: createReviewSetItem,
    identity: reviewSetItemIdentity,
    hasSameMaterialResolution
  }),
  packet: Object.freeze({
    build: buildReviewSetPacket
  }),
  storage: Object.freeze({
    createBackup: createReviewSetBackup,
    createSessionId: createReviewSetSessionId,
    delete: deleteStoredReviewSet,
    list: listStoredReviewSets,
    load: loadStoredReviewSet,
    parseBackup: parseReviewSetBackup,
    save: saveStoredReviewSet
  }),
  screenshots: Object.freeze({
    createSessionId: createReviewScreenshotSessionId,
    deletePaths: deleteReviewScreenshotPaths,
    imageUrl: reviewScreenshotImageUrl,
    persist: persistReviewScreenshot,
    replace: replaceReviewScreenshot,
    verify: verifyReviewScreenshots
  }),
  capture: Object.freeze({
    capture: capturePreviewScreenshot,
    crop: cropScreenshotPng,
    releaseDraft: releaseScreenshotDraft
  }),
  text: Object.freeze({
    byteLength: utf8ByteLength
  })
});

export {
  REVIEW_SET_LABEL_MAX_BYTES,
  REVIEW_SET_MAX_ITEMS,
  REVIEW_SET_NOTE_MAX_BYTES,
  type PreparedReviewSetPacket,
  type ReviewSetItem,
  type ReviewSetPriority,
  type ReviewSetScreenshot
} from "./review-set";

export {
  REVIEW_SET_MAX_SESSIONS,
  type HydratedReviewSet,
  type ReviewSetSessionSummary
} from "./review-set-storage";

export type {
  OwnedReviewScreenshotPath,
  ReviewScreenshotOwner
} from "./review-screenshots";

export {
  useScreenshotAnnotation,
  type ScreenshotDraft
} from "../hooks/useScreenshotAnnotation";
