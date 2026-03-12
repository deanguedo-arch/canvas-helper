const STUDIO_COMMAND_SPECS = [
  {
    id: "analyze",
    label: "Analyze",
    refreshProjects: true,
    args: ["run", "analyze", "--", "--project", "{slug}"]
  },
  {
    id: "refs",
    label: "Refs",
    refreshProjects: true,
    args: ["run", "refs", "--", "--project", "{slug}"]
  },
  {
    id: "verify",
    label: "Verify",
    refreshProjects: false,
    args: ["run", "verify", "--", "--project", "{slug}", "--mode", "workspace"]
  },
  {
    id: "export",
    label: "Export Dir",
    refreshProjects: true,
    args: ["run", "export:brightspace", "--", "--project", "{slug}"]
  },
  {
    id: "package",
    label: "Package",
    refreshProjects: true,
    args: ["run", "export:brightspace:zip", "--", "--project", "{slug}"]
  },
  {
    id: "scorm2004",
    label: "SCORM 2004",
    refreshProjects: true,
    args: ["run", "export:scorm", "--", "--project", "{slug}", "--version", "2004"]
  },
  {
    id: "scorm12",
    label: "SCORM 1.2",
    refreshProjects: true,
    args: ["run", "export:scorm", "--", "--project", "{slug}", "--version", "1.2"]
  },
  {
    id: "googleHosted",
    label: "Google Hosted",
    refreshProjects: true,
    args: ["run", "export:google-hosted", "--", "--project", "{slug}"]
  },
  {
    id: "html",
    label: "HTML",
    refreshProjects: true,
    args: ["run", "export:html", "--", "--project", "{slug}"]
  }
] as const;

export type StudioCommandName = (typeof STUDIO_COMMAND_SPECS)[number]["id"];

export const STUDIO_COMMANDS = STUDIO_COMMAND_SPECS.map(({ id, label }) => ({ id, label })) as Array<{
  id: StudioCommandName;
  label: string;
}>;

const STUDIO_COMMAND_SPEC_BY_ID = Object.fromEntries(
  STUDIO_COMMAND_SPECS.map((spec) => [spec.id, spec])
) as Record<StudioCommandName, (typeof STUDIO_COMMAND_SPECS)[number]>;

export function resolveStudioCommandArgs(slug: string, commandName: StudioCommandName) {
  return STUDIO_COMMAND_SPEC_BY_ID[commandName]?.args.map((value) => (value === "{slug}" ? slug : value)) ?? null;
}

export function shouldRefreshProjectsAfterCommand(commandName: StudioCommandName) {
  return STUDIO_COMMAND_SPEC_BY_ID[commandName]?.refreshProjects ?? false;
}
