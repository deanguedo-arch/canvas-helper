import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mammoth from "mammoth";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function argValue(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
}

function slugifyDocx(filename) {
  return `${path
    .basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/^\d+\s*-\s*/, "")
    .replace(/\s*-\s*next step redesigned$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-original-format`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeUrl(value) {
  return decodeURIComponent(String(value).replace(/&amp;/g, "&"));
}

function getEmbedInfo(rawUrl) {
  let url;
  try {
    url = decodeUrl(rawUrl);
  } catch {
    url = String(rawUrl).replace(/&amp;/g, "&");
  }

  const youtubeWatch = url.match(/^https?:\/\/(?:www\.)?youtube\.com\/watch\?(.*)$/i);
  if (youtubeWatch) {
    const params = new URLSearchParams(youtubeWatch[1]);
    const id = params.get("v");
    if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}`, label: "Embedded YouTube video" };
  }

  const youtubeShort = url.match(/^https?:\/\/youtu\.be\/([^?&#/]+)/i);
  if (youtubeShort) {
    return { kind: "iframe", src: `https://www.youtube.com/embed/${youtubeShort[1]}`, label: "Embedded YouTube video" };
  }

  if (/^https?:\/\/(?:www\.)?youtube\.com\/embed\//i.test(url)) {
    return { kind: "iframe", src: url, label: "Embedded YouTube video" };
  }

  const vimeo = url.match(/^https?:\/\/(?:www\.)?vimeo\.com\/([0-9]+)/i);
  if (vimeo) {
    return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}`, label: "Embedded Vimeo video" };
  }

  if (/^https?:\/\/docs\.google\.com\/presentation\//i.test(url)) {
    const src = url.includes("/pubembed") ? url : url.replace(/\/pub(\?|$)/, "/pubembed$1");
    return { kind: "iframe", src, label: "Embedded Google Slides" };
  }

  if (/^https?:\/\/phet\.colorado\.edu\/sims\/html\//i.test(url)) {
    return { kind: "iframe", src: url, label: "Embedded PhET simulation" };
  }

  if (/^https?:\/\/interactives\.ck12\.org\/simulations\/embed\.html/i.test(url)) {
    return { kind: "iframe", src: url, label: "Embedded CK-12 simulation" };
  }

  if (/\.mp4(?:$|\?)/i.test(url)) {
    return { kind: "video", src: url, label: "Embedded video" };
  }

  return null;
}

async function findLocalMedia(rawUrl, linkedMediaRoot, mediaOutputDir) {
  let decoded;
  try {
    decoded = decodeUrl(rawUrl);
  } catch {
    decoded = rawUrl;
  }

  let candidate = null;
  const fileMatch = decoded.match(/^file:\/\/\/([a-zA-Z]:[\\/].*\.mp4)$/i);
  if (fileMatch) {
    candidate = fileMatch[1].replace(/\//g, "\\");
  } else {
    const leaf = path.basename(decoded.replace(/\\/g, "/"));
    candidate = path.join(linkedMediaRoot, leaf);
  }

  try {
    await fs.access(candidate);
  } catch {
    return null;
  }

  await fs.mkdir(mediaOutputDir, { recursive: true });
  const destination = path.join(mediaOutputDir, path.basename(candidate));
  await fs.copyFile(candidate, destination);
  return `media/${encodeURIComponent(path.basename(destination))}`;
}

async function convertLinksToEmbeds(html, linkedMediaRoot, mediaOutputDir) {
  const anchorPattern = /<a\b([^>]*?)\bhref=(["'])(.*?)\2([^>]*)>(.*?)<\/a>/gis;
  const replacements = [];
  for (const match of html.matchAll(anchorPattern)) {
    const [full, before, quote, href, after, text] = match;
    const embed = getEmbedInfo(href);
    if (!embed) continue;

    let replacement;
    if (embed.kind === "video") {
      const local = await findLocalMedia(href, linkedMediaRoot, mediaOutputDir);
      const src = local ?? embed.src;
      replacement = `<div class="brightspace-embedded-media" style="margin: 1rem 0;"><video controls style="width: 100%; max-width: 900px; height: auto; display: block;" src="${escapeHtml(src)}"></video><p style="margin: 0.35rem 0 0; font-size: 0.9em;"><a href="${escapeHtml(decodeUrl(href))}">Open video in a new tab</a></p></div>`;
    } else {
      replacement = `<div class="brightspace-embedded-media" style="margin: 1rem 0;"><iframe title="${escapeHtml(embed.label)}" src="${escapeHtml(embed.src)}" style="width: 100%; max-width: 900px; aspect-ratio: 16 / 9; border: 0; display: block;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen></iframe><p style="margin: 0.35rem 0 0; font-size: 0.9em;"><a href="${escapeHtml(decodeUrl(href))}">Open source in a new tab</a></p></div>`;
    }

    replacements.push({ full, replacement });
  }

  let output = html;
  for (const { full, replacement } of replacements) {
    output = output.replace(full, replacement);
  }
  return output;
}

function wrapBrightspaceHtml(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    .docx-original-format {
      color: #202124;
      font-family: Verdana, Geneva, sans-serif;
      font-size: 12px;
      line-height: 1.55;
      max-width: 980px;
      margin: 0 auto;
      padding: 1rem;
      background: #ffffff;
    }
    .docx-original-format h1,
    .docx-original-format h2,
    .docx-original-format h3 {
      line-height: 1.2;
      margin: 1.2em 0 0.45em;
    }
    .docx-original-format p {
      margin: 0 0 0.85em;
    }
    .docx-original-format table {
      border-collapse: collapse;
      width: 100%;
      margin: 1rem 0;
    }
    .docx-original-format td,
    .docx-original-format th {
      border: 1px solid #d0d7de;
      padding: 0.55rem;
      vertical-align: top;
    }
    .docx-original-format img {
      max-width: 100%;
      height: auto;
    }
    .docx-original-format a {
      color: #0066c0;
    }
    .brightspace-embedded-media {
      clear: both;
    }
  </style>
</head>
<body>
  <div class="docx-original-format">
${bodyHtml}
  </div>
</body>
</html>
`;
}

async function cleanOutput(outputDir) {
  const projectWorkspace = path.resolve(repoRoot, "projects/next-step-redesigned-unit-docs/workspace");
  const resolved = path.resolve(outputDir);
  if (!resolved.toLowerCase().startsWith(projectWorkspace.toLowerCase())) {
    throw new Error(`Refusing to clean output outside project workspace: ${resolved}`);
  }
  await fs.rm(resolved, { recursive: true, force: true });
  await fs.mkdir(resolved, { recursive: true });
}

async function main() {
  const sourceFolder = path.resolve(repoRoot, argValue("--source", "projects/incoming/next-step-redesigned-unit-docs-original-format-source"));
  const outputFolder = path.resolve(repoRoot, argValue("--out", "projects/next-step-redesigned-unit-docs/workspace/brightspace-source-inputs-original-format"));
  const linkedMediaRoot = path.resolve(repoRoot, argValue("--linked-media", "projects/science-10-4-docx-export/exports/upload-package/02_SUPPORTING_FILES_BY_UNIT/Linked Media"));
  const mediaOutputDir = path.join(outputFolder, "media");

  await cleanOutput(outputFolder);

  const files = (await fs.readdir(sourceFolder))
    .filter((file) => file.toLowerCase().endsWith(".docx"))
    .sort();

  const results = [];
  for (const file of files) {
    const source = path.join(sourceFolder, file);
    const slug = slugifyDocx(file);
    const output = path.join(outputFolder, `${slug}.html`);

    const result = await mammoth.convertToHtml(
      { path: source },
      {
        includeDefaultStyleMap: true,
        styleMap: [
          "p[style-name='Title'] => h1:fresh",
          "p[style-name='Subtitle'] => p.subtitle:fresh",
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "b => strong",
          "i => em",
        ],
        convertImage: mammoth.images.imgElement(async (image) => {
          const buffer = await image.read("base64");
          return {
            src: `data:${image.contentType};base64,${buffer}`,
          };
        }),
      },
    );

    const embeddedBody = await convertLinksToEmbeds(result.value, linkedMediaRoot, mediaOutputDir);
    const title = path.basename(file, path.extname(file)).replace(/^\d+\s*-\s*/, "").replace(/\s*-\s*Next Step Redesigned$/, "");
    const html = wrapBrightspaceHtml(title, embeddedBody);
    await fs.writeFile(output, html, "utf8");

    results.push({
      source: file,
      output: path.relative(repoRoot, output).replace(/\\/g, "/"),
      iframes: (html.match(/<iframe\b/gi) ?? []).length,
      videos: (html.match(/<video\b/gi) ?? []).length,
      images: (html.match(/<img\b/gi) ?? []).length,
      warnings: result.messages.length,
    });
  }

  console.log(JSON.stringify({ outputFolder: path.relative(repoRoot, outputFolder).replace(/\\/g, "/"), units: results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
