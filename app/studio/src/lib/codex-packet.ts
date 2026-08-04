import {
  INSPECTION_PACKET_MAX_BYTES,
  type InspectionIssueCategory,
  type InspectionResolution
} from "../../../shared/inspection.js";

type PacketInput = {
  resolution: InspectionResolution;
  teacherNote: string;
  teacherCategory?: InspectionIssueCategory;
};

const encoder = new TextEncoder();

function byteLength(value: string) {
  return encoder.encode(value).byteLength;
}

function inline(value: string, maximum: number) {
  const normalized = value.replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim();
  return truncateUtf8(normalized, maximum);
}

function truncateUtf8(value: string, maximumBytes: number) {
  let output = "";
  for (const character of value) {
    if (byteLength(output + character) > maximumBytes) {
      break;
    }
    output += character;
  }
  return output;
}

function repoPath(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.replaceAll("\\", "/").trim();
  if (!normalized || normalized.startsWith("/") || normalized.startsWith("~") || normalized.includes("../") || /^[A-Za-z]:\//.test(normalized)) {
    return null;
  }
  return normalized;
}

function safeCommand(value: string | null) {
  if (!value) {
    return null;
  }
  const normalized = inline(value, 900);
  return /(?:^|[\s"'])\/?(?:Users|home)\//.test(normalized) || /[A-Za-z]:\\/.test(normalized) ? null : normalized;
}

function appendOptional(lines: string[], omissions: string[], label: string, value: string, maximum: number) {
  const clean = inline(value, maximum);
  if (!clean) {
    return;
  }
  const candidate = `${label}: ${clean}`;
  if (byteLength([...lines, candidate].join("\n")) <= INSPECTION_PACKET_MAX_BYTES - 180) {
    lines.push(candidate);
    if (clean !== value.replace(/\s+/g, " ").trim()) {
      omissions.push(`${label.toLowerCase()} shortened`);
    }
    return;
  }
  omissions.push(`${label.toLowerCase()} omitted to stay within 5 KB`);
}

export function buildCodexPacket({ resolution, teacherNote, teacherCategory = "unsure" }: PacketInput) {
  const primaryEditTarget = repoPath(resolution.primaryEditTarget);
  const contributors = resolution.contributors.map(repoPath).filter((value): value is string => Boolean(value)).slice(0, 3);
  const rebuildCommand = safeCommand(resolution.rebuildCommand);
  const validationCommand = safeCommand(resolution.validationCommand);
  const omissions: string[] = [];

  if (resolution.primaryEditTarget && !primaryEditTarget) omissions.push("unsafe primary target omitted");
  if (resolution.rebuildCommand && !rebuildCommand) omissions.push("unsafe rebuild command omitted");
  if (resolution.validationCommand && !validationCommand) omissions.push("unsafe validation command omitted");

  const lines = [
    "# Canvas Helper inspection handoff",
    `Project: ${inline(resolution.projectSlug, 120)}`,
    `Preview: ${repoPath(resolution.previewPath) ?? "not a safe repo-relative path"}`,
    `Selected element: ${inline(resolution.selection.tagName || "unknown", 48)}${resolution.selection.testId ? ` (data-testid: ${inline(resolution.selection.testId, 120)})` : ""}`,
    `Change focus: ${teacherCategory}`,
    `Resolution: ${resolution.resolution}`,
    `Freshness: ${resolution.freshness}`,
    `Artifact role: ${resolution.artifactRole}`,
    `Generated output: ${resolution.generated ? "yes — do not hand-edit the displayed HTML" : "no"}`,
    `Primary edit target: ${primaryEditTarget ?? "none — investigate source ownership before editing"}`,
    `Rebuild: ${rebuildCommand ?? "not declared"}`,
    `Validate: ${validationCommand ?? "not declared"}`
  ];

  if (byteLength(lines.join("\n")) > INSPECTION_PACKET_MAX_BYTES - 320) {
    throw new Error("The required inspection safety fields exceed the 5 KB packet cap.");
  }

  if (contributors.length) {
    appendOptional(lines, omissions, "Contributing sources", contributors.join(", "), 620);
  }
  appendOptional(lines, omissions, "Visible text excerpt", resolution.selection.visibleText, 700);
  appendOptional(lines, omissions, "Teacher note", teacherNote, 900);
  if (resolution.warnings.length) {
    appendOptional(lines, omissions, "Safety notes", resolution.warnings.map((warning) => inline(warning, 260)).join(" | "), 780);
  }

  if (omissions.length) {
    const omissionLine = `Omissions: ${inline(Array.from(new Set(omissions)).join("; "), 160)}`;
    if (byteLength([...lines, omissionLine].join("\n")) <= INSPECTION_PACKET_MAX_BYTES) {
      lines.push(omissionLine);
    }
  }

  const packet = lines.join("\n");
  if (byteLength(packet) > INSPECTION_PACKET_MAX_BYTES) {
    throw new Error("The inspection packet exceeded the 5 KB cap.");
  }
  return packet;
}
