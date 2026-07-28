import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import * as cheerio from "cheerio";

import type { EnglishBuiltLesson } from "./types.js";

export const MERCHANT_FOUNDATION_LESSON_IDS = [
  "merchant-foundation-1-introduction",
  "merchant-foundation-2-life-times-themes",
  "merchant-foundation-3-understanding-shakespeare",
  "merchant-foundation-4-globe-theatre",
  "merchant-foundation-5-shakespeares-world",
  "merchant-foundation-6-literary-devices"
] as const;

export const MERCHANT_FOUNDATION_LESSON_TITLES = [
  "Shakespearean Drama - Introduction",
  "Shakespeare's Life, Times, and Themes",
  "Understanding Shakespeare",
  "The Globe Theatre",
  "Shakespeare's World",
  "Shakespearean Drama Literary Devices"
] as const;

const CUSTOM_ASSET_ROOT = "assets/custom/shakespeare-foundations";
const DONOR_ASSETS = [
  "shakespeare-head.jpg",
  "globe-painting.jpg",
  "shakes-blocks.jpg",
  "tudor-cottage.jpg",
  "elizabeth.jpg",
  "shakes-life-times-themes-clip-image002.jpg",
  "shakes-life-times-themes-clip-image004.jpg"
] as const;

function lesson(
  index: number,
  title: string,
  html: string,
  sourceHref: string
): EnglishBuiltLesson {
  const $ = cheerio.load(`<main>${html}</main>`);
  return {
    id: MERCHANT_FOUNDATION_LESSON_IDS[index]!,
    title,
    sourceHref,
    html,
    text: $("main").text().replace(/\s+/g, " ").trim(),
    supportingResources: []
  };
}

function curatedLessons(): EnglishBuiltLesson[] {
  return [
    lesson(0, MERCHANT_FOUNDATION_LESSON_TITLES[0], `
      <h1>Introduction to Shakespearean Drama</h1>
      <p>Shakespeare wrote plays to be performed for a live audience. In this unit, you will read <em>The Merchant of Venice</em> as both literature and theatre: words on a page that become choices in voice, movement, staging, timing, and design.</p>
      <section class="lesson-callout"><h2>I can...</h2><ul>
        <li>read a dramatic script critically and visualize how it could work on stage.</li>
        <li>explain how dialogue, stage directions, structure, and performance choices create meaning.</li>
        <li>use precise evidence to build a critical response to a play.</li>
      </ul></section>
      <h2>How to approach this unit</h2>
      <ul>
        <li>Study the Shakespeare and drama foundations before beginning the play.</li>
        <li>Preview the act questions so you know which characters, conflicts, ideas, and language choices to notice.</li>
        <li>Read each scene in the Side-by-Side Reader, but return to the original wording whenever you collect evidence.</li>
        <li>Use the Character Notes and Evidence Bank to keep important patterns visible across acts.</li>
      </ul>
      <h2>Your text for this unit</h2>
      <p>You will study <strong><em>The Merchant of Venice</em></strong>. The play moves between commercial Venice and romantic Belmont while examining friendship, money, promises, prejudice, justice, mercy, disguise, and belonging.</p>
      <p class="CentreAlign"><img class="source-image" src="${CUSTOM_ASSET_ROOT}/shakespeare-head.jpg" alt="Engraved portrait of William Shakespeare" loading="eager"></p>
      <h2>Choose a reading method that works</h2>
      <p>Decide whether you will read mostly on screen, from a print copy, or by combining both. Choose a method that lets you look back, annotate, compare lines, and sustain attention. Notes and plain-language support should help you enter the original text, not replace it.</p>
    `, "cbe-ela10://3329+othello-foundation-1"),
    lesson(1, MERCHANT_FOUNDATION_LESSON_TITLES[1], `
      <h1>Shakespeare's Life, Times, and Themes</h1>
      <p class="CentreAlign"><img class="source-image" src="${CUSTOM_ASSET_ROOT}/globe-painting.jpg" alt="Historical painting of an Elizabethan public theatre" loading="lazy"></p>
      <h2>Why study Shakespeare?</h2>
      <p>William Shakespeare was born in Stratford-upon-Avon in 1564. His plays remain powerful because they turn lasting human pressures into dramatic action: love and loyalty, ambition and fear, prejudice and belonging, power and responsibility, justice and mercy.</p>
      <p>In <em>The Merchant of Venice</em>, those pressures appear through contracts, money, friendship, courtship, religious difference, disguise, and a trial. The play invites difficult questions rather than simple answers.</p>
      <section class="lesson-callout"><h2>Questions to carry into the play</h2><ul>
        <li>When does justice become cruelty, and when does mercy become power?</li>
        <li>How do social expectations shape the choices available to a person?</li>
        <li>What happens when friendship, love, money, and obligation compete?</li>
        <li>How does comedy make room for ideas that remain uncomfortable or unresolved?</li>
      </ul></section>
      <h2>Where did Shakespeare find his ideas?</h2>
      <p>Shakespeare drew on grammar-school study, Roman drama and mythology, translated histories, popular stories, religious debate, London life, and the practical demands of his acting company. He reshaped sources for the stage rather than simply copying them.</p>
      <h2>The theatre business</h2>
      <p>Public theatres welcomed a mixed audience. Groundlings stood near the stage while wealthier patrons sat in galleries. Shakespeare wrote for actors he knew, for spectators who expected language and action, and for a company that depended on successful performances.</p>
    `, "cbe-ela10://3329+othello-foundation-2"),
    lesson(2, MERCHANT_FOUNDATION_LESSON_TITLES[2], `
      <h1>Understanding Shakespeare</h1>
      <p class="CentreAlign"><img class="source-image" src="${CUSTOM_ASSET_ROOT}/shakes-blocks.jpg" alt="Shakespeare's portrait assembled from letter blocks" loading="lazy"></p>
      <p>A dramatic script gives you less explanation than a novel. You must infer motive, relationships, tone, and offstage events from speech, action, silence, entrances, exits, and stage directions.</p>
      <h2>Before reading a scene</h2>
      <ol>
        <li>Read the scene focus and identify where the scene takes place.</li>
        <li>Scan the speakers and recall what each person wants.</li>
        <li>Review what changed in the previous scene.</li>
        <li>Predict which conflict or relationship may develop.</li>
      </ol>
      <h2>During the first reading</h2>
      <ul>
        <li>Read for the general movement of the scene. You do not need to solve every word immediately.</li>
        <li>Follow punctuation rather than stopping at the end of every printed line.</li>
        <li>Hear the dialogue and visualize the actors' positions, gestures, pauses, and reactions.</li>
        <li>Notice repeated images, contrasts, questions, jokes, insults, promises, and changes between verse and prose.</li>
        <li>Delay a final judgment about a character until later evidence complicates or confirms your first impression.</li>
      </ul>
      <h2>During a second reading</h2>
      <ul>
        <li>Read important exchanges aloud and experiment with tone and emphasis.</li>
        <li>Ask what the scene accomplishes for plot, character, conflict, and theme.</li>
        <li>Record a precise line or stage action and explain why it matters.</li>
        <li>Compare the original language with the companion, then make your interpretation from the original.</li>
      </ul>
      <section class="lesson-callout"><h2>Reading a performance</h2><p>A film or stage production is an interpretation. Compare casting, delivery, blocking, costume, setting, lighting, music, and cuts with the version you imagined while reading.</p></section>
    `, "cbe-ela10://3332+3333+3334+othello-foundation-3"),
    lesson(3, MERCHANT_FOUNDATION_LESSON_TITLES[3], `
      <h1>The Globe Theatre</h1>
      <p class="CentreAlign"><img class="source-image" src="${CUSTOM_ASSET_ROOT}/tudor-cottage.jpg" alt="Timber-framed buildings from Tudor England" loading="lazy"></p>
      <p>Shakespeare's plays were shaped by the spaces in which they were performed. The Globe was an open-air theatre with a thrust stage extending into the audience, galleries around the yard, and limited scenery.</p>
      <h2>How the stage shaped the writing</h2>
      <table><thead><tr><th>Stage condition</th><th>Effect on the script</th></tr></thead><tbody>
        <tr><td>Audience close to the actors</td><td>Asides and direct address could create an immediate relationship with spectators.</td></tr>
        <tr><td>Little scenery</td><td>Dialogue established place, weather, time, atmosphere, and imagined action.</td></tr>
        <tr><td>Daylight performance</td><td>Language and costume carried much of the visual information.</td></tr>
        <tr><td>Visible entrances and exits</td><td>Timing, concealment, discovery, and dramatic irony became powerful tools.</td></tr>
        <tr><td>No modern sound system</td><td>Rhythm, repetition, contrast, and rhetorical structure helped ideas land clearly.</td></tr>
      </tbody></table>
      <h2>Apply the stage lens</h2>
      <p>As you read <em>The Merchant of Venice</em>, ask what an audience would see before anyone speaks, which characters possess information others lack, and how a director could stage the contrast between Venice and Belmont.</p>
      <section class="lesson-callout"><h2>Performance vocabulary</h2><p><strong>Blocking</strong> is planned actor movement. <strong>Props</strong> are objects handled on stage. <strong>Stage directions</strong> guide action and production. <strong>Entrances and exits</strong> can change power, knowledge, or tension.</p></section>
    `, "cbe-ela10://3331+othello-foundation-4"),
    lesson(4, MERCHANT_FOUNDATION_LESSON_TITLES[4], `
      <h1>Shakespeare's World</h1>
      <p class="CentreAlign"><img class="source-image" src="${CUSTOM_ASSET_ROOT}/elizabeth.jpg" alt="Portrait of Queen Elizabeth I" loading="lazy"></p>
      <p>Every writer reflects the assumptions and conflicts of a particular society. Historical context helps us recognize what an early audience may have expected, but it does not require us to accept the period's beliefs.</p>
      <h2>Order, status, and authority</h2>
      <p>Many Elizabethans imagined society as a fixed hierarchy sanctioned by God. Rank, gender, religion, occupation, and wealth shaped a person's legal rights and social power. Disorder on stage could therefore feel political, moral, and cosmic.</p>
      <h2>A world in change</h2>
      <p>England was moving between medieval and early modern ways of understanding the world. Trade expanded, printed texts circulated, scientific ideas challenged inherited beliefs, and religious conflict remained intense. Plague repeatedly closed theatres, while public punishment and animal baiting existed alongside poetry, music, and elaborate court culture.</p>
      <h2>Context for <em>The Merchant of Venice</em></h2>
      <ul>
        <li><strong>Commerce and credit:</strong> Venice was imagined as a wealthy trading centre where ships, loans, contracts, and risk connected private relationships to public law.</li>
        <li><strong>Religious prejudice:</strong> Early audiences brought anti-Jewish stereotypes to the theatre. A modern reading must examine how the play uses, reinforces, and complicates those attitudes.</li>
        <li><strong>Gender and disguise:</strong> Women's choices were restricted, all female roles were originally played by boys, and disguise could temporarily rearrange power.</li>
        <li><strong>Comedy and resolution:</strong> Marriage, reunion, and restored social order often close a comedy, but Shylock's treatment makes this ending ethically unsettled.</li>
      </ul>
      <section class="lesson-callout"><h2>Use context critically</h2><p>Context can explain why a text was written and received in a particular way. It does not erase the impact of prejudice or prevent a present-day audience from challenging the values a production communicates.</p></section>
    `, "cbe-ela10://3329+othello-foundation-5"),
    lesson(5, MERCHANT_FOUNDATION_LESSON_TITLES[5], `
      <h1>Shakespearean Drama - Literary Devices</h1>
      <p>Use these terms as analytical tools. Naming a device is only the first step; explain what it reveals, changes, emphasizes, or makes the audience understand.</p>
      <h2>Dramatic script terminology</h2>
      <dl>
        <dt><strong>Aside</strong></dt><dd>A brief comment heard by the audience or selected characters but not by others on stage.</dd>
        <dt><strong>Soliloquy</strong></dt><dd>A speech that reveals a character's private thoughts while the character is alone or believes no one else can hear.</dd>
        <dt><strong>Monologue</strong></dt><dd>An extended speech delivered by one character to other characters or an audience.</dd>
        <dt><strong>Stage direction</strong></dt><dd>An instruction about movement, setting, sound, appearance, entrance, exit, or delivery.</dd>
        <dt><strong>Dramatic irony</strong></dt><dd>A gap between what a character understands and what the audience knows.</dd>
        <dt><strong>Foil</strong></dt><dd>A character whose contrast with another character makes important traits or choices clearer.</dd>
      </dl>
      <h2>Language and structure</h2>
      <dl>
        <dt><strong>Blank verse</strong></dt><dd>Unrhymed iambic pentameter, often used for elevated or controlled speech.</dd>
        <dt><strong>Prose</strong></dt><dd>Speech without a regular metrical line; shifts between prose and verse can signal status, intimacy, comedy, or emotional change.</dd>
        <dt><strong>Meter</strong></dt><dd>A repeated pattern of stressed and unstressed syllables.</dd>
        <dt><strong>Motif</strong></dt><dd>A recurring image, word, situation, or idea that develops meaning across the play.</dd>
        <dt><strong>Juxtaposition</strong></dt><dd>Placing characters, settings, actions, or ideas side by side so their similarities or differences become clearer.</dd>
        <dt><strong>Conceit</strong></dt><dd>An extended or striking comparison that develops an idea through multiple details.</dd>
      </dl>
      <p class="CentreAlign"><img class="source-image" src="${CUSTOM_ASSET_ROOT}/shakes-life-times-themes-clip-image004.jpg" alt="A diagram showing stressed and unstressed syllables in poetic meter" loading="lazy"></p>
      <h2>Character, conflict, and meaning</h2>
      <dl>
        <dt><strong>Protagonist</strong></dt><dd>A central character whose goals and conflicts organize much of the action.</dd>
        <dt><strong>Antagonist</strong></dt><dd>A character, institution, circumstance, or internal pressure that opposes a protagonist's goal.</dd>
        <dt><strong>Foreshadowing</strong></dt><dd>A detail that prepares the audience for a later development.</dd>
        <dt><strong>Symbol</strong></dt><dd>A concrete object, action, place, or image that carries meaning beyond its literal role.</dd>
        <dt><strong>Nemesis</strong></dt><dd>An opponent or force of retribution that contributes to a character's defeat; it is not the same as a tragic flaw.</dd>
      </dl>
      <section class="lesson-callout"><h2>Analyze a soliloquy or extended speech</h2><ol>
        <li>Identify the situation that causes the speech.</li>
        <li>State the speaker's central tension, desire, fear, or decision.</li>
        <li>Trace a pattern in imagery, diction, rhythm, repetition, or contrast.</li>
        <li>Explain what the speech reveals about character and how it affects the plot or audience.</li>
      </ol></section>
    `, "cbe-ela10://3330+3335+othello-foundation-6")
  ];
}

async function fileExists(filePath: string) {
  try { return (await stat(filePath)).isFile(); } catch { return false; }
}

export function validateMerchantFoundationLessons(value: unknown): asserts value is EnglishBuiltLesson[] {
  if (!Array.isArray(value) || value.length !== MERCHANT_FOUNDATION_LESSON_IDS.length) {
    throw new Error("Merchant foundation component must contain exactly six lessons.");
  }
  value.forEach((entry, index) => {
    const item = entry as EnglishBuiltLesson;
    if (item.id !== MERCHANT_FOUNDATION_LESSON_IDS[index] || item.title !== MERCHANT_FOUNDATION_LESSON_TITLES[index]) {
      throw new Error(`Merchant foundation lesson ${index + 1} does not match the required donor sequence.`);
    }
    if (!item.html?.trim() || !item.text?.trim()) throw new Error(`Merchant foundation lesson ${item.id} is empty.`);
    if (/\b(?:Othello|Romeo and Juliet|ELA 20-1|ELA 30-1|Diploma|editorial review|admin note)\b/i.test(`${item.title} ${item.html}`)) {
      throw new Error(`Merchant foundation lesson ${item.id} contains donor or administrative contamination.`);
    }
    const $ = cheerio.load(item.html);
    if ($("a[href], iframe, script").length) throw new Error(`Merchant foundation lesson ${item.id} contains an unapproved link, embed, or script.`);
    $("img").each((_imageIndex, image) => {
      const src = $(image).attr("src") ?? "";
      const alt = $(image).attr("alt") ?? "";
      if (!src.startsWith(`${CUSTOM_ASSET_ROOT}/`) || !alt.trim()) {
        throw new Error(`Merchant foundation lesson ${item.id} contains an invalid image reference or empty alt text.`);
      }
    });
  });
}

export async function readMerchantFoundationLessons(componentPath: string) {
  const parsed = JSON.parse(await readFile(componentPath, "utf8"));
  const lessons = Array.isArray(parsed) ? parsed : parsed.lessons;
  validateMerchantFoundationLessons(lessons);
  return lessons;
}

/** Creates the curated CBE + Othello foundation once; ordinary rebuilds preserve later editorial changes. */
export async function ensureMerchantFoundationLessons(input: {
  repoRoot: string;
  projectDir: string;
  cbeArchivePath?: string;
}) {
  const componentPath = path.join(input.projectDir, "workspace", "components", "shakespeare-foundation-lessons", "lessons.json");
  const assetDir = path.join(input.projectDir, "workspace", "assets", "custom", "shakespeare-foundations");
  const supplementalArchivePath = path.join(input.repoRoot, "projects", "resources", "ela10-1-shakespeare-merchant-of-venice", "_sources", "supplemental", "cbe-system-ela10-shakespeare.zip");
  if (await fileExists(componentPath)) {
    const missingAssets = [];
    for (const asset of DONOR_ASSETS) {
      if (!(await fileExists(path.join(assetDir, asset)))) missingAssets.push(asset);
    }
    if (missingAssets.length) {
      throw new Error(`Merchant foundation component is missing preserved assets: ${missingAssets.join(", ")}`);
    }
    return { componentPath, lessons: await readMerchantFoundationLessons(componentPath), created: false, supplementalArchivePath };
  }

  const lessons = curatedLessons();
  validateMerchantFoundationLessons(lessons);
  await mkdir(path.dirname(componentPath), { recursive: true });
  await mkdir(assetDir, { recursive: true });
  const donorAssetDir = path.join(input.repoRoot, "projects", "ela30-1-shakespeare-othello", "workspace", "assets", "source");
  for (const asset of DONOR_ASSETS) await copyFile(path.join(donorAssetDir, asset), path.join(assetDir, asset));
  if (input.cbeArchivePath && await fileExists(input.cbeArchivePath)) {
    await mkdir(path.dirname(supplementalArchivePath), { recursive: true });
    await copyFile(input.cbeArchivePath, supplementalArchivePath);
  }
  await writeFile(componentPath, `${JSON.stringify({
    schemaVersion: 1,
    unit: "The Merchant of Venice",
    lessonAuthority: "CBE System ELA 10-1 Shakespearean Drama module",
    presentationDonor: "ELA 30-1 Othello lessons 1-6",
    sourceArchive: "projects/resources/ela10-1-shakespeare-merchant-of-venice/_sources/supplemental/cbe-system-ela10-shakespeare.zip",
    editorialPolicy: "Learner-facing lessons are Merchant-specific, link-safe, and editable. Rebuilds do not overwrite this component.",
    lessons
  }, null, 2)}\n`, "utf8");
  return { componentPath, lessons, created: true, supplementalArchivePath };
}

export const merchantFoundationInternals = { CUSTOM_ASSET_ROOT, DONOR_ASSETS, curatedLessons };
