export function normalizeActiveHandoffProject(projectLabel: string): string {
  const trimmed = projectLabel.trim();
  const backtickedSlug = trimmed.match(/^`([^`]+)`/);
  if (backtickedSlug) {
    return backtickedSlug[1].trim();
  }

  return trimmed.split(/\s+/)[0]?.replace(/^`|`$/g, "") ?? "";
}
