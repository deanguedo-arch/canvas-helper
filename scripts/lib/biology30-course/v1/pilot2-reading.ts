/** Same deterministic estimate as the protected A reference. This diagnoses
 * prose density; it does not certify scientific completeness or comprehension. */
function syllables(raw: string) {
  const word = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  return Math.max(1, word.replace(/(?:[^l]e|ed|es)$/i, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g)?.length ?? 1);
}

export function topicReadingEstimate(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const words = normalized.match(/[A-Za-z][A-Za-z'’-]*/g) ?? [];
  const sentences = Math.max(1, normalized.match(/[.!?]+(?=\s|$)/g)?.length ?? 1);
  const grade = .39 * words.length / sentences + 11.8 * words.reduce((n, word) => n + syllables(word), 0) / Math.max(1, words.length) - 15.59;
  return { words: words.length, sentences, averageSentenceWords: Number((words.length / sentences).toFixed(1)), fleschKincaidGrade: Number(grade.toFixed(1)) };
}

export function inspectTopicReading(parts: { id: string; paragraphs: string[] }[]) {
  const partReports = parts.map(part => ({
    partId: part.id,
    ...topicReadingEstimate(part.paragraphs.join(" ")),
    paragraphs: part.paragraphs.length,
    minParagraphWords: Math.min(...part.paragraphs.map(p => topicReadingEstimate(p).words)),
    maxParagraphWords: Math.max(...part.paragraphs.map(p => topicReadingEstimate(p).words))
  }));
  const failures = partReports.filter(part => !part.words || part.fleschKincaidGrade > 12 || part.averageSentenceWords > 20 || part.maxParagraphWords > 100);
  return { partReports, failures };
}

export function assertTopicReading(parts: { id: string; paragraphs: string[] }[]) {
  const report = inspectTopicReading(parts);
  if (report.failures.length) throw new Error(`Core teaching needs reading revision: ${report.failures.map(part => part.partId).join(", ")}`);
  return report;
}
