import mammoth from "mammoth";

export type NsoPodcastEntry = {
  title: string;
  href: string;
  sourceLine: number;
};

function cleanPodcastTitle(value: string) {
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/\s*[-–:]\s*$/, "")
    .replace(/\bLoyalities\b/gi, "Loyalties")
    .replace(/\bInternationallism\b/gi, "Internationalism")
    .replace(/\bSoverreignty\b/gi, "Sovereignty")
    .replace(/\bSustainabilty\b/gi, "Sustainability")
    .replace(/\bNeoconvservatism\b/gi, "Neoconservatism")
    .trim();

  if (!cleaned) return "";
  return /\bpodcast\b/i.test(cleaned) ? cleaned : `${cleaned} Podcast`;
}

export function youtubeVideoIdFromHref(href: string) {
  try {
    const url = new URL(href.replace(/&amp;/g, "&"));
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0];
    if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtube-nocookie.com") {
      return url.pathname.match(/\/embed\/([^/?#]+)/)?.[1] ?? url.searchParams.get("v") ?? undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function parseNsoPodcastText(rawText: string, courseHeading: string): NsoPodcastEntry[] {
  const lines = rawText.split(/\r?\n/);
  const headingPattern = /^Social Studies\s+(\d{2})\b/i;
  const expectedCourse = courseHeading.toLowerCase();
  const entries: NsoPodcastEntry[] = [];
  const seenVideos = new Set<string>();
  let active = false;

  for (const [index, originalLine] of lines.entries()) {
    const line = originalLine.trim();
    if (!line) continue;

    const headingMatch = line.match(headingPattern);
    if (headingMatch) {
      active = line.toLowerCase().startsWith(expectedCourse);
      continue;
    }
    if (!active) continue;

    const urlMatch = line.match(/https?:\/\/\S+/i);
    if (!urlMatch) continue;

    const href = urlMatch[0].replace(/[),.;]+$/, "");
    const title = cleanPodcastTitle(line.slice(0, urlMatch.index).replace(/[-–]\s*$/, ""));
    const videoKey = youtubeVideoIdFromHref(href) ?? href;
    if (!title || seenVideos.has(videoKey)) continue;

    seenVideos.add(videoKey);
    entries.push({ title, href, sourceLine: index + 1 });
  }

  return entries;
}

export async function parseNsoPodcastEntries(sourcePath: string, courseHeading: string): Promise<NsoPodcastEntry[]> {
  const rawText = await mammoth.extractRawText({ path: sourcePath });
  return parseNsoPodcastText(rawText.value, courseHeading);
}
