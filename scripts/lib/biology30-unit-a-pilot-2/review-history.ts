/** Replace one generated Markdown section without erasing later journal entries. */
export function replaceMarkdownSection(existing: string, heading: string, replacement: string) {
  const start = existing.indexOf(heading);
  if (start < 0) return `${existing.trimEnd()}\n\n${replacement.trim()}\n`;
  const afterHeading = start + heading.length;
  const next = existing.slice(afterHeading).search(/\n## /);
  const end = next < 0 ? existing.length : afterHeading + next;
  return `${existing.slice(0, start)}${replacement.trim()}\n\n${existing.slice(end).trimStart()}`.trimEnd() + "\n";
}

export function appendJournalEntry(existing: string, heading: string, body: string) {
  if (existing.split("\n").includes(heading)) return existing;
  return `${existing.trimEnd()}\n\n${heading}\n\n${body.trim()}\n`;
}
