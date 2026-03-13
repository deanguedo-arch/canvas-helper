import { readFile } from "node:fs/promises";

import { writeJsonFile, writeTextFile } from "../../fs.js";
import { getProjectPaths } from "../../paths.js";
import { getStringFlag, hasFlag, type ParsedArgs } from "../../cli.js";
import type {
  AuthoringDeviation,
  AuthoringDeviationAcceptance,
  AuthoringDeviationReport,
  AuthoringPreferences,
  AuthoringSurfaceInput,
  AuthoringRuleSeverity
} from "../../types.js";
import {
  resolveAuthoringPreferences,
  updateAuthoringPreferences,
  type ResolveAuthoringPreferencesOptions
} from "../config/authoring-preferences.js";

export type RunAuthoringDeviationGateOptions = ResolveAuthoringPreferencesOptions & {
  projectSlug: string;
  preferences?: AuthoringPreferences;
  surfaces: AuthoringSurfaceInput[];
  acceptance?: AuthoringDeviationAcceptance;
};

export type AuthoringDeviationGateResult = AuthoringDeviationReport & {
  blockingDeviations: AuthoringDeviation[];
  reportJsonPath: string;
  reportMarkdownPath: string;
  acceptedDeviations: AuthoringDeviation[];
};

function parsePreferenceScope(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  if (value === "repo" || value === "project") {
    return value;
  }

  throw new Error(`Invalid --preference-scope value: ${JSON.stringify(value)}. Expected "repo" or "project".`);
}

function parseAcceptDeviations(value: string | undefined): string[] | "all" | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "all") {
    return "all";
  }

  const ruleIds = value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  if (ruleIds.length === 0) {
    throw new Error('Invalid "--accept-deviations" value. Use "all" or a comma-separated list of rule IDs.');
  }

  return ruleIds;
}

export function readDeviationAcceptanceFromCli(parsedArgs: ParsedArgs): AuthoringDeviationAcceptance | undefined {
  const acceptDeviations = parseAcceptDeviations(getStringFlag(parsedArgs, "accept-deviations"));
  const because = getStringFlag(parsedArgs, "because");
  const updatePreferences = hasFlag(parsedArgs, "update-preferences");
  const preferenceScope = parsePreferenceScope(getStringFlag(parsedArgs, "preference-scope"));

  const hasAnyValue = Boolean(acceptDeviations || because || updatePreferences || preferenceScope);
  if (!hasAnyValue) {
    return undefined;
  }

  if (!acceptDeviations) {
    throw new Error('Using deviation override flags requires "--accept-deviations".');
  }

  return {
    acceptDeviations,
    ...(because ? { because } : {}),
    ...(updatePreferences ? { updatePreferences: true } : {}),
    ...(preferenceScope ? { preferenceScope } : {})
  };
}

function normalizeSeverity(value: AuthoringRuleSeverity | undefined): AuthoringRuleSeverity {
  return value === "warn" ? "warn" : "error";
}

function countParagraphBlocks(content: string) {
  return (content.match(/<p\b/gi) ?? []).length;
}

function toEvidenceSnippet(content: string, pattern: string) {
  const patternIndex = content.toLowerCase().indexOf(pattern.toLowerCase());
  if (patternIndex < 0) {
    return `Missing pattern: ${pattern}`;
  }

  const start = Math.max(0, patternIndex - 60);
  const end = Math.min(content.length, patternIndex + pattern.length + 60);
  return content.slice(start, end).replace(/\s+/g, " ").trim();
}

function toLocation(surface: AuthoringSurfaceInput) {
  return surface.filePath;
}

function toMarkdownReport(report: AuthoringDeviationReport) {
  const lines: string[] = [
    "# Authoring Deviation Report",
    "",
    `- Project: ${report.projectSlug}`,
    `- Generated: ${report.generatedAt}`,
    `- Pass: ${report.pass ? "yes" : "no"}`,
    `- Deviations: ${report.deviations.length}`,
    `- Accepted deviations: ${report.acceptedDeviations.length}`,
    ""
  ];

  if (report.deviations.length === 0) {
    lines.push("No deviations detected.");
    lines.push("");
    return lines.join("\n");
  }

  lines.push("## Deviations");
  lines.push("");
  for (const deviation of report.deviations) {
    lines.push(`### ${deviation.ruleId}`);
    lines.push(`- Severity: ${deviation.severity}`);
    lines.push(`- Surface: ${deviation.surface}`);
    lines.push(`- Location: ${deviation.location}`);
    lines.push(`- Why: ${deviation.why}`);
    lines.push(`- Evidence: ${deviation.evidence}`);
    lines.push("");
  }

  if (report.acceptedDeviations.length > 0) {
    lines.push("## Accepted Deviations");
    lines.push("");
    for (const accepted of report.acceptedDeviations) {
      lines.push(`- ${accepted.ruleId} (${accepted.location})`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function isAcceptedRuleId(ruleId: string, acceptance: AuthoringDeviationAcceptance | undefined) {
  if (!acceptance) {
    return false;
  }

  if (acceptance.acceptDeviations === "all") {
    return true;
  }

  return acceptance.acceptDeviations.includes(ruleId);
}

function validateAcceptance(acceptance: AuthoringDeviationAcceptance | undefined) {
  if (!acceptance) {
    return;
  }

  if (!acceptance.because || acceptance.because.trim().length === 0) {
    throw new Error('Using "--accept-deviations" requires "--because".');
  }
}

async function evaluateSurface(
  surface: AuthoringSurfaceInput,
  preferences: AuthoringPreferences,
  acceptedRuleIds: Set<string>
) {
  const content = typeof surface.content === "string" ? surface.content : await readFile(surface.filePath, "utf8");
  const deviations: AuthoringDeviation[] = [];

  for (const rule of preferences.rules?.require ?? []) {
    if (acceptedRuleIds.has(rule.id)) {
      continue;
    }
    if (content.toLowerCase().includes(rule.pattern.toLowerCase())) {
      continue;
    }
    deviations.push({
      ruleId: rule.id,
      severity: normalizeSeverity(rule.severity),
      surface: surface.kind,
      location: toLocation(surface),
      why: `Required pattern "${rule.pattern}" is missing.`,
      evidence: toEvidenceSnippet(content, rule.pattern)
    });
  }

  for (const rule of preferences.rules?.forbid ?? []) {
    if (acceptedRuleIds.has(rule.id)) {
      continue;
    }
    if (!content.toLowerCase().includes(rule.pattern.toLowerCase())) {
      continue;
    }
    deviations.push({
      ruleId: rule.id,
      severity: normalizeSeverity(rule.severity),
      surface: surface.kind,
      location: toLocation(surface),
      why: `Forbidden pattern "${rule.pattern}" is present.`,
      evidence: toEvidenceSnippet(content, rule.pattern)
    });
  }

  if (typeof preferences.quality?.maxConsecutiveParagraphBlocks === "number") {
    const paragraphCount = countParagraphBlocks(content);
    const maxAllowed = preferences.quality.maxConsecutiveParagraphBlocks;
    if (paragraphCount > maxAllowed && !acceptedRuleIds.has("quality-max-consecutive-paragraph-blocks")) {
      deviations.push({
        ruleId: "quality-max-consecutive-paragraph-blocks",
        severity: "warn",
        surface: surface.kind,
        location: toLocation(surface),
        why: `Detected ${paragraphCount} paragraph blocks but max allowed is ${maxAllowed}.`,
        evidence: `<p> count = ${paragraphCount}`
      });
    }
  }

  return deviations;
}

async function persistAcceptedRules(options: {
  projectSlug: string;
  preferences: AuthoringPreferences;
  acceptedDeviations: AuthoringDeviation[];
  acceptance: AuthoringDeviationAcceptance;
  repoPreferencesPath?: string;
  projectPreferencesPath?: string;
}) {
  if (!options.acceptance.updatePreferences || options.acceptedDeviations.length === 0) {
    return null;
  }

  const scope = options.acceptance.preferenceScope ?? options.preferences.learning.defaultScope;
  const reason = options.acceptance.because?.trim();
  if (!reason) {
    return null;
  }

  const updatedAt = new Date().toISOString();
  const acceptedRuleIds = [...new Set(options.acceptedDeviations.map((deviation) => deviation.ruleId))];

  return updateAuthoringPreferences({
    projectSlug: options.projectSlug,
    scope,
    repoPreferencesPath: options.repoPreferencesPath,
    projectPreferencesPath: options.projectPreferencesPath,
    update: (current) => {
      const existing = current.rules?.accepted ?? [];
      const merged = new Map(existing.map((entry) => [entry.ruleId, entry]));
      for (const ruleId of acceptedRuleIds) {
        merged.set(ruleId, {
          ruleId,
          reason,
          updatedAt,
          scope
        });
      }

      return {
        ...current,
        rules: {
          require: current.rules?.require ?? [],
          forbid: current.rules?.forbid ?? [],
          accepted: [...merged.values()].sort((left, right) => left.ruleId.localeCompare(right.ruleId))
        }
      };
    }
  });
}

export async function runAuthoringDeviationGate(
  options: RunAuthoringDeviationGateOptions
): Promise<AuthoringDeviationGateResult> {
  validateAcceptance(options.acceptance);

  const resolved = options.preferences
    ? {
        preferences: options.preferences,
        sourceOrder: [] as const
      }
    : await resolveAuthoringPreferences({
        projectSlug: options.projectSlug,
        repoPreferencesPath: options.repoPreferencesPath,
        projectPreferencesPath: options.projectPreferencesPath,
        benchmarkSelectionPath: options.benchmarkSelectionPath,
        cliOverride: options.cliOverride
      });

  const acceptedRuleIds = new Set((resolved.preferences.rules?.accepted ?? []).map((entry) => entry.ruleId));
  const deviations = (
    await Promise.all(options.surfaces.map((surface) => evaluateSurface(surface, resolved.preferences, acceptedRuleIds)))
  ).flat();

  const acceptedDeviations = deviations.filter((deviation) => isAcceptedRuleId(deviation.ruleId, options.acceptance));
  const blockingDeviations = deviations.filter(
    (deviation) => deviation.severity === "error" && !isAcceptedRuleId(deviation.ruleId, options.acceptance)
  );
  const pass = blockingDeviations.length === 0;

  await persistAcceptedRules({
    projectSlug: options.projectSlug,
    preferences: resolved.preferences,
    acceptedDeviations,
    acceptance: options.acceptance ?? {
      acceptDeviations: []
    },
    repoPreferencesPath: options.repoPreferencesPath,
    projectPreferencesPath: options.projectPreferencesPath
  });

  const projectPaths = getProjectPaths(options.projectSlug);
  const report: AuthoringDeviationReport = {
    schemaVersion: 1,
    projectSlug: options.projectSlug,
    generatedAt: new Date().toISOString(),
    pass,
    deviations,
    acceptedDeviations
  };

  await writeJsonFile(projectPaths.deviationReportJsonPath, report);
  await writeTextFile(projectPaths.deviationReportMarkdownPath, `${toMarkdownReport(report)}\n`);

  return {
    ...report,
    blockingDeviations,
    reportJsonPath: projectPaths.deviationReportJsonPath,
    reportMarkdownPath: projectPaths.deviationReportMarkdownPath
  };
}
