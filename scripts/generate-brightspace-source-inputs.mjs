import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function getFlagValue(args, name) {
  const index = args.indexOf(`--${name}`);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}

const fontStack = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
const pageStyle = `margin:0; color:#191C1C; font-family:${fontStack}; font-size:16px; line-height:1.6; background:#F9F9F8;`;
const mainStyle = "max-width:1200px; margin:0 auto; background:#F9F9F8; padding:24px;";
const skipStyle =
  "display:inline-block; margin:0 0 16px 0; padding:8px 12px; background:#155608; color:#FFFFFF; text-decoration:none; border-radius:6px; font-weight:700;";
const headerStyle =
  "background:#155608; color:#FFFFFF; border:1px solid #155608; border-radius:10px; padding:28px; margin:0 0 24px 0; box-shadow:0 6px 18px #DDE2DD;";
const h1Style = "margin:0; color:#FFFFFF; font-size:34px; line-height:1.2; font-weight:800;";
const h2Style =
  "margin:0 0 18px 0; color:#155608; font-size:28px; line-height:1.25; font-weight:800; border-bottom:4px solid #59A844; padding-bottom:10px;";
const cardStyle =
  "background:#FFFFFF; border:1px solid #DDE2DD; border-radius:10px; padding:24px; margin:0 0 22px 0; box-shadow:0 6px 18px #DDE2DD;";
const contentStyle = "display:block;";
const paragraphStyle = "margin:0 0 14px 0; color:#191C1C; font-size:16px; line-height:1.6;";
const linkStyle = "color:#155608; text-decoration:underline; font-weight:700;";
const figureStyle =
  "margin:20px 0; padding:16px; background:#EAF7E6; border:1px solid #DDE2DD; border-left:6px solid #59A844; border-radius:10px;";
const iframeStyle = "width:100%; max-width:100%; aspect-ratio:16/9; border:0; border-radius:8px; background:#FFFFFF;";
const captionStyle = "margin-top:10px; color:#40493B; font-size:14px; line-height:1.5;";
const mediaNoteStyle =
  "margin:16px 0; padding:14px 16px; background:#FFF0CF; border-left:6px solid #FDBF3F; color:#191C1C; font-size:16px; line-height:1.6;";

function stripClassAttributes(html) {
  return html.replace(/\sclass="[^"]*"/g, "");
}

function styleUnitSection(section, title) {
  let styled = stripClassAttributes(section);
  styled = styled.replace(/<h2>.*?<\/h2>/, `<h2 style="${h2Style}">${title}</h2>`);
  styled = styled.replace('<div>', `<div style="${contentStyle}">`);
  styled = styled.replace(/<p>((?:(?!<\/p>).)*?\.mp4)<\/p>/g, `<div style="${mediaNoteStyle}">$1</div>`);
  styled = styled.replace(/<p>/g, `<p style="${paragraphStyle}">`);
  styled = styled.replace(/<a /g, `<a style="${linkStyle}" `);
  styled = styled.replace(/<figure>/g, `<figure style="${figureStyle}">`);
  styled = styled.replace(/<figcaption>/g, `<figcaption style="${captionStyle}">`);
  styled = styled.replace(/<iframe /g, `<iframe style="${iframeStyle}" `);
  styled = styled.replace(/<section id="[^"]+">/, `<section id="content" aria-labelledby="unit-title" style="${cardStyle}">`);
  return styled;
}

async function main() {
  const projectSlug = getFlagValue(process.argv.slice(2), "project");
  if (!projectSlug) {
    throw new Error("Usage: node scripts/generate-brightspace-source-inputs.mjs --project <slug>");
  }

  const projectRoot = path.resolve("projects", projectSlug);
  const sourcePath = path.join(projectRoot, "workspace", "index.html");
  const outDir = path.join(projectRoot, "workspace", "brightspace-source-inputs");

  const titles = [
    "Unit 1: Properties of Matter",
    "Unit 2: Energy Transfer Technologies",
    "Unit 3: Matter and Energy in Living Systems",
    "Unit 4: Matter and Energy in the Environment",
  ];

  const fileNames = [
    "unit-1-properties-of-matter.html",
    "unit-2-energy-transfer-technologies.html",
    "unit-3-matter-and-energy-in-living-systems.html",
    "unit-4-matter-and-energy-in-the-environment.html",
  ];

  const source = await readFile(sourcePath, "utf8");
  const sections = [...source.matchAll(/<section class="unit" id="[^"]+">[\s\S]*?<\/section>/g)];

  if (sections.length !== titles.length) {
    throw new Error(`Expected ${titles.length} unit sections in ${sourcePath}, found ${sections.length}.`);
  }

  await mkdir(outDir, { recursive: true });

  for (let i = 0; i < sections.length; i += 1) {
    const section = styleUnitSection(sections[i][0], titles[i]);

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${titles[i]}</title>
</head>
<body style="${pageStyle}">
  <a href="#content" style="${skipStyle}">Skip to content</a>
  <main style="${mainStyle}">
    <header style="${headerStyle}">
      <h1 id="unit-title" style="${h1Style}">${titles[i]}</h1>
    </header>
    ${section}
  </main>
</body>
</html>
`;

    await writeFile(path.join(outDir, fileNames[i]), html, "utf8");
  }

  console.log(`Generated ${sections.length} Brightspace source input file(s) in ${outDir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
