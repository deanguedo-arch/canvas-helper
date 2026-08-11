import type { PreviewInspectPayload } from "../../../shared/preview-bridge.js";
import { normalizePreviewPageRouteIdentity } from "../../../shared/preview-path.js";

export function hasSamePreviewPageRoute(leftHref: string, rightHref: string) {
  const left = normalizePreviewPageRouteIdentity(leftHref);
  const right = normalizePreviewPageRouteIdentity(rightHref);
  return left !== null && left === right;
}

export function preserveVisualSelection(
  expected: PreviewInspectPayload,
  current: PreviewInspectPayload
): PreviewInspectPayload {
  if (expected.selectionKind !== "area") return current;
  return {
    ...current,
    selectionKind: "area",
    geometry: { ...expected.geometry }
  };
}

export async function runWithCurrentPreviewSelection<Result>(input: {
  expected: Pick<PreviewInspectPayload, "nodeId" | "pageHref">;
  requestCurrent: () => Promise<PreviewInspectPayload>;
  run: (selection: PreviewInspectPayload) => Promise<Result>;
  changedMessage: string;
}) {
  const selection = await input.requestCurrent();
  if (
    !input.expected.nodeId ||
    selection.nodeId !== input.expected.nodeId ||
    !hasSamePreviewPageRoute(selection.pageHref, input.expected.pageHref)
  ) {
    throw new Error(input.changedMessage);
  }
  return input.run(
    "selectionKind" in input.expected && "geometry" in input.expected
      ? preserveVisualSelection(input.expected as PreviewInspectPayload, selection)
      : selection
  );
}
