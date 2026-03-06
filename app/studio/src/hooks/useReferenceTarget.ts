import { useEffect, useMemo, useState } from "react";

import { loadReferenceTarget, saveReferenceTarget } from "../lib/storage";
import { equalReferenceTargets, normalizeSlashes, toReferenceOptionPath, uniqueStrings } from "../lib/preview-urls";
import type { PreviewRoot, ProjectBundle, ReferenceManifest, ReferenceTarget, ResolvedReference } from "../lib/types";

function findReferenceByTarget(
  references: ReferenceManifest[],
  referencesDir: string,
  target: ReferenceTarget
) {
  const referencesRootPath = normalizeSlashes(referencesDir);
  const referencesRawRoot = `${referencesRootPath}/raw`;
  const referencesExtractedRoot = `${referencesRootPath}/extracted`;

  if (target.resourceRoot === "raw") {
    return (
      references.find(
        (reference) =>
          toReferenceOptionPath(reference.originalPath, referencesRawRoot) === target.resourcePath
      ) ?? null
    );
  }

  return (
    references.find(
      (reference) =>
        toReferenceOptionPath(reference.extractedTextPath, referencesExtractedRoot) === target.resourcePath
    ) ?? null
  );
}

export function useReferenceTarget(projects: ProjectBundle[], selectedSlug: string) {
  const [referenceTarget, setReferenceTarget] = useState<ReferenceTarget>(() => loadReferenceTarget());

  const resolvedReference = useMemo<ResolvedReference>(() => {
    const project = projects.find((bundle) => bundle.manifest.slug === referenceTarget.projectSlug) ?? null;
    const source = referenceTarget.source === "resource" ? "resource" : "html";
    const root: PreviewRoot = referenceTarget.root === "workspace" ? "workspace" : "raw";
    const htmlOptions = project?.htmlFiles?.[root] ?? [];
    const defaultHtmlFile = root === "raw" ? "original.html" : "index.html";
    const htmlPath = htmlOptions.includes(referenceTarget.htmlPath)
      ? referenceTarget.htmlPath
      : htmlOptions.includes(defaultHtmlFile)
        ? defaultHtmlFile
        : htmlOptions[0] ?? defaultHtmlFile;

    const references = project?.referenceIndex?.references ?? [];
    const referencesRootPath = project ? normalizeSlashes(project.paths.referencesDir) : "";
    const referencesRawRoot = referencesRootPath ? `${referencesRootPath}/raw` : "";
    const referencesExtractedRoot = referencesRootPath ? `${referencesRootPath}/extracted` : "";
    const resourcesRaw = uniqueStrings(
      references.map((reference) => toReferenceOptionPath(reference.originalPath, referencesRawRoot))
    );
    const resourcesExtracted = uniqueStrings(
      references.map((reference) => toReferenceOptionPath(reference.extractedTextPath, referencesExtractedRoot))
    );
    const resourceRoot = referenceTarget.resourceRoot === "extracted" ? "extracted" : "raw";
    const resourcesActive = resourceRoot === "raw" ? resourcesRaw : resourcesExtracted;
    const resourcePath = resourcesActive.includes(referenceTarget.resourcePath)
      ? referenceTarget.resourcePath
      : resourcesActive[0] ?? "";

    return {
      project,
      target: {
        projectSlug: referenceTarget.projectSlug,
        source,
        root,
        htmlPath,
        resourceRoot,
        resourcePath
      },
      options: {
        html: htmlOptions,
        resourcesRaw,
        resourcesExtracted,
        resourcesActive
      }
    };
  }, [projects, referenceTarget]);

  useEffect(() => {
    const fallbackSlug =
      referenceTarget.projectSlug && projects.some((project) => project.manifest.slug === referenceTarget.projectSlug)
        ? referenceTarget.projectSlug
        : selectedSlug;

    if (!fallbackSlug && !referenceTarget.projectSlug) {
      return;
    }

    const root: PreviewRoot = referenceTarget.root === "workspace" ? "workspace" : "raw";
    const project = projects.find((bundle) => bundle.manifest.slug === fallbackSlug);
    const list = project?.htmlFiles?.[root] ?? [];
    const defaultFile = root === "raw" ? "original.html" : "index.html";
    const htmlPath = list.includes(referenceTarget.htmlPath)
      ? referenceTarget.htmlPath
      : list.includes(defaultFile)
        ? defaultFile
        : list[0] ?? defaultFile;
    const nextTarget: ReferenceTarget = {
      projectSlug: fallbackSlug,
      source: referenceTarget.source === "resource" ? "resource" : "html",
      root,
      htmlPath,
      resourceRoot: referenceTarget.resourceRoot === "extracted" ? "extracted" : "raw",
      resourcePath: referenceTarget.resourcePath ?? ""
    };

    if (!equalReferenceTargets(referenceTarget, nextTarget)) {
      setReferenceTarget(nextTarget);
    }
  }, [projects, referenceTarget, selectedSlug]);

  useEffect(() => {
    saveReferenceTarget(resolvedReference.target);
  }, [resolvedReference.target]);

  const selectedResourceReference = useMemo(() => {
    if (resolvedReference.target.source !== "resource" || !resolvedReference.project) {
      return null;
    }

    return findReferenceByTarget(
      resolvedReference.project.referenceIndex?.references ?? [],
      resolvedReference.project.paths.referencesDir,
      resolvedReference.target
    );
  }, [resolvedReference]);

  const selectedResourceExtractedPath = useMemo(() => {
    if (!selectedResourceReference || !resolvedReference.project) {
      return "";
    }

    const referencesRootPath = normalizeSlashes(resolvedReference.project.paths.referencesDir);
    return toReferenceOptionPath(
      selectedResourceReference.extractedTextPath,
      `${referencesRootPath}/extracted`
    );
  }, [resolvedReference.project, selectedResourceReference]);

  return {
    referenceTarget,
    setReferenceTarget,
    resolvedReference,
    selectedResourceReference,
    selectedResourceExtractedPath
  };
}
