import {
  COURSE_EDIT_CAPABILITY_OPPORTUNITY_KINDS,
  COURSE_EDIT_CANDIDATE_KINDS,
  type CandidateKind,
  type CourseEditCandidate,
  type CourseEditCapabilityOpportunity,
  type CourseEditCapabilityOpportunityKind,
  type CourseEditCoverageBreakdown,
  type CourseEditCoverageRatio,
  type CourseEditCoverageStatus,
  type CourseEditReasonCode,
  type CourseEditRenderedExclusionCode,
  type CourseEditabilityAggregate,
  type CourseEditabilityProjectReport,
  type CourseEditabilitySurfaceReport,
  type LearnerSurfaceInventory
} from "../../../app/shared/course-editability.js";
import type { CourseEditAdapter } from "../../../app/shared/course-editing.js";
import type { RenderedSurfaceCollection } from "./rendered.js";

function increment<K extends string>(record: Partial<Record<K, number>>, key: K, amount = 1) {
  record[key] = (record[key] ?? 0) + amount;
}

function incrementBreakdown<K extends string>(
  record: Partial<Record<K, CourseEditCoverageBreakdown>>,
  key: K,
  supported: boolean
) {
  const current = record[key] ?? { supported: 0, total: 0 };
  record[key] = {
    supported: current.supported + (supported ? 1 : 0),
    total: current.total + 1
  };
}

function ratio(numerator: number, denominator: number): CourseEditCoverageRatio | null {
  return denominator > 0 ? { numerator, denominator } : null;
}

export function scoreRenderedSurface(collection: RenderedSurfaceCollection): CourseEditabilitySurfaceReport {
  const candidatesByKind: Partial<Record<CandidateKind, CourseEditCoverageBreakdown>> = {};
  const capabilitiesByKind: Partial<Record<CourseEditCapabilityOpportunityKind, CourseEditCoverageBreakdown>> = {};
  const reasons: Partial<Record<CourseEditReasonCode, number>> = {};
  const exclusions: Partial<Record<CourseEditRenderedExclusionCode, number>> = {};
  for (const reasonCode of collection.diagnosticReasonCodes ?? []) increment(reasons, reasonCode);
  const incompleteOccurrence = collection.occurrences.find((occurrence) => occurrence.disposition.kind === "incomplete");
  const uncheckedEditable = collection.candidates.find((candidate) => (
    candidate.classification === "editable" && (!candidate.resolveChecked || !candidate.resolveEligible)
  ));
  if (!collection.complete || incompleteOccurrence || uncheckedEditable) {
    increment(reasons, collection.reasonCode ?? "uninspectable-page");
    if (incompleteOccurrence?.disposition.kind === "incomplete") {
      increment(reasons, incompleteOccurrence.disposition.reasonCode);
    }
    if (uncheckedEditable) increment(reasons, "resolve-rejected");
    return {
      surface: collection.surface,
      status: "incomplete",
      blockCoverage: null,
      teacherTextCoverage: null,
      candidatesByKind,
      capabilitiesByKind,
      reasons,
      exclusions,
      renderedOccurrenceCount: 0,
      duplicateOccurrenceCount: 0
    };
  }

  let editableBlocks = 0;
  let totalBlocks = 0;
  let editableText = 0;
  let totalText = 0;
  for (const candidate of collection.candidates) {
    const editable = candidate.classification === "editable" && candidate.resolveChecked && candidate.resolveEligible;
    totalBlocks += 1;
    if (editable) editableBlocks += 1;
    if (candidate.normalizedTextCodeUnits > 0) {
      totalText += candidate.normalizedTextCodeUnits;
      if (editable) editableText += candidate.normalizedTextCodeUnits;
    }
    incrementBreakdown(candidatesByKind, candidate.kind, editable);
    increment(reasons, candidate.reasonCode);
  }
  for (const opportunity of collection.opportunities) {
    incrementBreakdown(capabilitiesByKind, opportunity.kind, opportunity.supported);
  }
  let duplicateOccurrenceCount = 0;
  for (const occurrence of collection.occurrences) {
    if (occurrence.disposition.kind === "duplicate-presentation") duplicateOccurrenceCount += 1;
    if (occurrence.disposition.kind === "excluded") increment(exclusions, occurrence.disposition.exclusionCode);
    if (occurrence.disposition.kind === "incomplete") increment(reasons, occurrence.disposition.reasonCode);
  }
  const status: CourseEditCoverageStatus = totalBlocks ? "complete" : "no-candidates";
  return {
    surface: collection.surface,
    status,
    blockCoverage: status === "complete" ? ratio(editableBlocks, totalBlocks) : null,
    teacherTextCoverage: status === "complete" ? ratio(editableText, totalText) : null,
    candidatesByKind,
    capabilitiesByKind,
    reasons,
    exclusions,
    renderedOccurrenceCount: collection.occurrences.length,
    duplicateOccurrenceCount
  };
}

function mergeBreakdowns<K extends string>(
  target: Partial<Record<K, CourseEditCoverageBreakdown>>,
  source: Partial<Record<K, CourseEditCoverageBreakdown>>
) {
  for (const [key, value] of Object.entries(source) as Array<[K, CourseEditCoverageBreakdown]>) {
    const current = target[key] ?? { supported: 0, total: 0 };
    target[key] = {
      supported: current.supported + value.supported,
      total: current.total + value.total
    };
  }
}

function mergeReasons(
  target: Partial<Record<CourseEditReasonCode, number>>,
  source: Partial<Record<CourseEditReasonCode, number>>
) {
  for (const [key, value] of Object.entries(source) as Array<[CourseEditReasonCode, number]>) {
    increment(target, key, value);
  }
}

function sumRatio(
  reports: Array<{ blockCoverage: CourseEditCoverageRatio | null; teacherTextCoverage: CourseEditCoverageRatio | null }>,
  key: "blockCoverage" | "teacherTextCoverage"
) {
  let numerator = 0;
  let denominator = 0;
  for (const report of reports) {
    const current = report[key];
    if (!current) continue;
    numerator += current.numerator;
    denominator += current.denominator;
  }
  return ratio(numerator, denominator);
}

function candidateGroupKey(candidate: CourseEditCandidate) {
  const identity = candidate.canonicalOwnerDigest
    ? `source:${candidate.canonicalOwnerDigest}`
    : `rendered:${candidate.renderedFingerprint}`;
  return `${candidate.kind}\0${identity}`;
}

function supportedCandidate(candidate: CourseEditCandidate) {
  return candidate.classification === "editable" && candidate.resolveChecked && candidate.resolveEligible;
}

function scoreUniqueProjectUnits(collections: RenderedSurfaceCollection[]) {
  const candidatesByKind: CourseEditabilityProjectReport["candidatesByKind"] = {};
  const capabilitiesByKind: CourseEditabilityProjectReport["capabilitiesByKind"] = {};
  const reasons: CourseEditabilityProjectReport["reasons"] = {};
  const groups = new Map<string, CourseEditCandidate[]>();
  const groupKeyByCandidateId = new Map<string, string>();
  const opportunitiesByGroup = new Map<
    string,
    Map<CourseEditCapabilityOpportunityKind, Map<string, CourseEditCapabilityOpportunity[]>>
  >();

  for (const collection of collections) {
    if (!collection.complete) continue;
    for (const candidate of collection.candidates) {
      const key = candidateGroupKey(candidate);
      const entries = groups.get(key) ?? [];
      entries.push(candidate);
      groups.set(key, entries);
      groupKeyByCandidateId.set(candidate.candidateId, key);
    }
    for (const opportunity of collection.opportunities) {
      const key = groupKeyByCandidateId.get(opportunity.candidateId);
      if (!key) continue;
      const byKind = opportunitiesByGroup.get(key) ?? new Map();
      const byCandidate = byKind.get(opportunity.kind) ?? new Map();
      const entries = byCandidate.get(opportunity.candidateId) ?? [];
      entries.push(opportunity);
      byCandidate.set(opportunity.candidateId, entries);
      byKind.set(opportunity.kind, byCandidate);
      opportunitiesByGroup.set(key, byKind);
    }
  }

  let editableBlocks = 0;
  let totalBlocks = 0;
  let editableText = 0;
  let totalText = 0;
  for (const [key, candidates] of groups) {
    const representative = candidates[0];
    if (!representative) continue;
    const editable = candidates.every(supportedCandidate);
    const textUnits = Math.max(...candidates.map((candidate) => candidate.normalizedTextCodeUnits));
    totalBlocks += 1;
    if (editable) editableBlocks += 1;
    if (textUnits > 0) {
      totalText += textUnits;
      if (editable) editableText += textUnits;
    }
    incrementBreakdown(candidatesByKind, representative.kind, editable);
    if (editable) {
      increment(reasons, "ready");
    } else {
      const reason = [...new Set(candidates
        .filter((candidate) => !supportedCandidate(candidate))
        .map((candidate) => candidate.reasonCode))]
        .sort()[0] ?? "resolve-rejected";
      increment(reasons, reason);
    }

    for (const [kind, byCandidate] of opportunitiesByGroup.get(key) ?? []) {
      const perPresentation = candidates.map((candidate) => byCandidate.get(candidate.candidateId) ?? []);
      const count = Math.max(0, ...perPresentation.map((entries) => entries.length));
      for (let index = 0; index < count; index += 1) {
        const supported = perPresentation.every((entries) => entries[index]?.supported === true);
        incrementBreakdown(capabilitiesByKind, kind, supported);
      }
    }
  }

  return {
    blockCoverage: ratio(editableBlocks, totalBlocks),
    teacherTextCoverage: ratio(editableText, totalText),
    candidatesByKind,
    capabilitiesByKind,
    reasons,
    candidateCount: totalBlocks
  };
}

export function scoreProject(input: {
  projectSlug: string;
  adapter: CourseEditAdapter | null;
  inventory: LearnerSurfaceInventory;
  collections: RenderedSurfaceCollection[];
}): CourseEditabilityProjectReport {
  const surfaces = input.collections.map(scoreRenderedSurface);
  const unique = scoreUniqueProjectUnits(input.collections);
  const reasons = { ...unique.reasons };
  for (const surface of surfaces) {
    if (surface.status === "incomplete" || surface.status === "error") {
      mergeReasons(reasons, surface.reasons);
    } else if (surface.reasons["external-network-attempt"]) {
      increment(reasons, "external-network-attempt", surface.reasons["external-network-attempt"]);
    }
  }
  if (!input.inventory.complete) increment(reasons, "surface-inventory-incomplete");
  const status: CourseEditCoverageStatus = !input.inventory.complete || surfaces.some((surface) => surface.status === "incomplete" || surface.status === "error")
    ? "incomplete"
    : surfaces.length && unique.candidateCount === 0
      ? "no-candidates"
      : surfaces.length
        ? "complete"
        : "incomplete";
  return {
    projectSlug: input.projectSlug,
    adapter: input.adapter,
    inventory: input.inventory,
    status,
    blockCoverage: status === "complete" ? unique.blockCoverage : null,
    teacherTextCoverage: status === "complete" ? unique.teacherTextCoverage : null,
    candidatesByKind: unique.candidatesByKind,
    capabilitiesByKind: unique.capabilitiesByKind,
    reasons,
    surfaces
  };
}

export function scoreAggregate(projects: CourseEditabilityProjectReport[]): CourseEditabilityAggregate {
  const candidatesByKind: CourseEditabilityAggregate["candidatesByKind"] = {};
  const capabilitiesByKind: CourseEditabilityAggregate["capabilitiesByKind"] = {};
  const reasons: CourseEditabilityAggregate["reasons"] = {};
  for (const project of projects) {
    mergeBreakdowns(candidatesByKind, project.candidatesByKind);
    mergeBreakdowns(capabilitiesByKind, project.capabilitiesByKind);
    mergeReasons(reasons, project.reasons);
  }
  const completeProjectCount = projects.filter((project) => project.status === "complete").length;
  const status: CourseEditCoverageStatus = projects.some((project) => project.status === "incomplete" || project.status === "error" || project.status === "no-candidates")
    ? "incomplete"
    : projects.length
      ? "complete"
      : "error";
  return {
    status,
    projectCount: projects.length,
    completeProjectCount,
    blockCoverage: status === "complete" ? sumRatio(projects, "blockCoverage") : null,
    teacherTextCoverage: status === "complete" ? sumRatio(projects, "teacherTextCoverage") : null,
    candidatesByKind,
    capabilitiesByKind,
    reasons
  };
}

export function emptyBreakdowns() {
  return {
    candidates: Object.fromEntries(COURSE_EDIT_CANDIDATE_KINDS.map((kind) => [kind, { supported: 0, total: 0 }])),
    capabilities: Object.fromEntries(COURSE_EDIT_CAPABILITY_OPPORTUNITY_KINDS.map((kind) => [kind, { supported: 0, total: 0 }]))
  };
}
