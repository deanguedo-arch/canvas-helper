import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import * as cheerio from "cheerio";

import type { EnglishShakespeareScene } from "./activity-profile-renderers.js";

const SCENE_COUNTS = [3, 9, 5, 2, 1] as const;
const MIT_MERCHANT_BASE = "https://shakespeare.mit.edu/merchant";

const SCENE_GUIDANCE: Record<string, { summary: string; focus: string }> = {
  "1.1": { summary: "Antonio cannot explain his sadness, while Bassanio asks for help pursuing Portia.", focus: "Melancholy, friendship, money, obligation, and the contrast between Antonio and Gratiano." },
  "1.2": { summary: "Portia and Nerissa review the unwanted suitors and the conditions of Portia's father's will.", focus: "Choice and control, comic characterization, prejudice, and Portia's limited agency." },
  "1.3": { summary: "Bassanio seeks a loan from Shylock, and Antonio agrees to the bond secured by a pound of flesh.", focus: "Religious prejudice, money, revenge, dramatic irony, and the language of risk." },
  "2.1": { summary: "Morocco asks Portia not to judge him by his complexion before accepting the casket test.", focus: "Appearance and judgment, courtship, risk, and the test imposed by Portia's father." },
  "2.2": { summary: "Launcelot debates leaving Shylock, confuses his father, and joins Bassanio's service.", focus: "Comic prose, conscience, disguise, social status, and loyalty." },
  "2.3": { summary: "Jessica gives Launcelot a letter for Lorenzo and admits her shame about her father's household.", focus: "Family conflict, identity, secrecy, conversion, and the cost of escape." },
  "2.4": { summary: "Lorenzo and his friends plan the masque and Jessica's escape from Shylock's house.", focus: "Disguise, planning, loyalty, dramatic suspense, and the ethics of the elopement." },
  "2.5": { summary: "Shylock reluctantly leaves for dinner and warns Jessica to secure the house against the masque.", focus: "Foreboding, dreams, trust, household authority, and dramatic irony." },
  "2.6": { summary: "Jessica escapes disguised as a boy, takes money and jewels, and leaves with Lorenzo.", focus: "Disguise, love, theft, identity, and the contrast between romance and betrayal." },
  "2.7": { summary: "Morocco chooses the gold casket and discovers that outward value does not guarantee worth.", focus: "Appearance and reality, desire, moral judgment, and the casket inscriptions." },
  "2.8": { summary: "Salerio and Solanio report Jessica's flight, Shylock's reaction, and concern for Antonio's ships.", focus: "Public ridicule, stereotype, loss, friendship, and the bond's growing danger." },
  "2.9": { summary: "Arragon chooses the silver casket, fails the test, and a messenger announces Bassanio's arrival.", focus: "Desert and entitlement, appearance, self-knowledge, and dramatic anticipation." },
  "3.1": { summary: "News of Antonio's losses reaches Venice; Shylock defends his humanity and vows revenge before hearing about Jessica.", focus: "Prejudice, shared humanity, revenge, grief, money, and the 'Hath not a Jew eyes?' speech." },
  "3.2": { summary: "Bassanio chooses the lead casket, wins Portia, and then learns that Antonio's bond has come due.", focus: "Appearance and reality, music, marriage, rings, friendship, and competing obligations." },
  "3.3": { summary: "Shylock refuses Antonio's pleas and insists that the bond must be enforced.", focus: "Justice and mercy, power, dehumanization, and Antonio's resignation." },
  "3.4": { summary: "Portia places Lorenzo and Jessica in charge of Belmont while secretly preparing to travel to Venice.", focus: "Agency, disguise, planning, generosity, and Portia's control of the action." },
  "3.5": { summary: "Launcelot teases Jessica about conversion before Lorenzo and Jessica discuss Portia.", focus: "Comic prejudice, conversion, wordplay, marriage, and judgments of character." },
  "4.1": { summary: "At the trial, Portia argues for mercy, finds the legal limits of the bond, and turns the law against Shylock.", focus: "Justice and mercy, legal language, performance, prejudice, power, and forced conversion." },
  "4.2": { summary: "Portia and Nerissa obtain the rings from Bassanio and Gratiano and plan the final test at Belmont.", focus: "Rings, promises, disguise, dramatic irony, and control of knowledge." },
  "5.1": { summary: "The couples reunite at Belmont, the ring dispute is resolved, and Portia delivers news about Antonio's ships.", focus: "Music, harmony, fidelity, dramatic irony, restoration, and unresolved tensions in the comic ending." }
};

const DRAFT_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bwherefore\b/gi, "why"], [/\bere\b/gi, "before"], [/\banon\b/gi, "soon"],
  [/\bhath\b/gi, "has"], [/\bdoth\b/gi, "does"], [/\bdost\b/gi, "do"],
  [/\bart\b/gi, "are"], [/\bthou\b/gi, "you"], [/\bthee\b/gi, "you"],
  [/\bthy\b/gi, "your"], [/\bthine\b/gi, "yours"], [/\bthyself\b/gi, "yourself"],
  [/\bye\b/gi, "you"], [/\b'tis\b/gi, "it is"], [/\b'twas\b/gi, "it was"],
  [/\bwouldst\b/gi, "would"], [/\bcouldst\b/gi, "could"], [/\bshouldst\b/gi, "should"],
  [/\bcanst\b/gi, "can"], [/\bwilt\b/gi, "will"], [/\bshalt\b/gi, "shall"],
  [/\bcome hither\b/gi, "come here"], [/\bhence\b/gi, "away"],
  [/\bwhence\b/gi, "from where"], [/\bwhither\b/gi, "to where"]
];

function draftPlainLanguage(original: string) {
  let companion = original;
  for (const [pattern, replacement] of DRAFT_REPLACEMENTS) companion = companion.replace(pattern, replacement);
  return companion.replace(/\s+([,.;:!?])/g, "$1").replace(/[ \t]+/g, " ").trim();
}

function sceneUrl(act: number, scene: number) {
  return `${MIT_MERCHANT_BASE}/merchant.${act}.${scene}.html`;
}

async function fetchScene(act: number, scene: number): Promise<EnglishShakespeareScene> {
  const url = sceneUrl(act, scene);
  let response: Response | undefined;
  let failure: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      response = await fetch(url, {
        headers: { "user-agent": "Canvas Helper English intake", connection: "close" },
        signal: AbortSignal.timeout(30_000)
      });
      break;
    } catch (error) {
      failure = error;
    }
  }
  if (!response) throw new Error(`Merchant of Venice source request failed after three attempts: ${url}`, { cause: failure });
  if (!response.ok) throw new Error(`Merchant of Venice source request failed (${response.status}): ${url}`);
  const html = await response.text();
  const $ = cheerio.load(html);
  const guidance = SCENE_GUIDANCE[`${act}.${scene}`];
  if (!guidance) throw new Error(`Missing Merchant of Venice scene guidance for Act ${act}, Scene ${scene}.`);
  const passages: EnglishShakespeareScene["passages"] = [];
  $("a[name^='speech']").each((_index, anchor) => {
    const speaker = $(anchor).text().replace(/\s+/g, " ").trim();
    const block = $(anchor).nextAll("blockquote").first();
    const lines = block.find("a[name]").toArray().map((line) => $(line).text().replace(/\s+/g, " ").trim()).filter(Boolean);
    if (!speaker || !lines.length) return;
    const original = lines.join("\n");
    passages.push({
      id: `speech-${passages.length + 1}`,
      speaker,
      original,
      companion: draftPlainLanguage(original),
      note: "Machine-normalized editorial draft; review meaning, tone, and line breaks before final packaging."
    });
  });
  if (!passages.length) throw new Error(`No Merchant of Venice speeches were parsed from ${url}.`);
  return {
    id: `act-${act}-scene-${scene}`,
    act,
    scene,
    title: $("h3").first().text().replace(/\s+/g, " ").trim() || `Act ${act}, Scene ${scene}`,
    summary: guidance.summary,
    focus: guidance.focus,
    editorialStatus: "needs-editorial",
    sourceHref: url,
    passages
  };
}

async function fileExists(filePath: string) {
  try { return (await stat(filePath)).isFile(); } catch { return false; }
}

export function validateMerchantSceneData(value: unknown): asserts value is EnglishShakespeareScene[] {
  if (!Array.isArray(value) || value.length !== 20) throw new Error("Merchant of Venice scene component must contain all 20 scenes.");
  const expected = new Set(SCENE_COUNTS.flatMap((count, actIndex) => Array.from({ length: count }, (_item, sceneIndex) => `${actIndex + 1}.${sceneIndex + 1}`)));
  for (const scene of value as EnglishShakespeareScene[]) {
    const locator = `${scene.act}.${scene.scene}`;
    if (!expected.delete(locator)) throw new Error(`Merchant of Venice scene component contains an unexpected or duplicate locator: ${locator}.`);
    if (!scene.passages?.length || scene.passages.some((passage) => !passage.original?.trim() || !passage.companion?.trim())) {
      throw new Error(`Merchant of Venice scene ${locator} does not contain complete side-by-side passage data.`);
    }
  }
  if (expected.size) throw new Error(`Merchant of Venice scene component is missing: ${[...expected].join(", ")}.`);
}

export async function readMerchantSceneComponent(componentPath: string) {
  const parsed = JSON.parse(await readFile(componentPath, "utf8"));
  const scenes = Array.isArray(parsed) ? parsed : parsed.scenes;
  validateMerchantSceneData(scenes);
  return scenes;
}

/** Fetches public-domain source only during intake and never overwrites editable scene data. */
export async function ensureMerchantSceneComponent(input: { projectDir: string }) {
  const componentPath = path.join(input.projectDir, "workspace", "components", "shakespeare-side-by-side", "scenes.json");
  if (await fileExists(componentPath)) return { componentPath, scenes: await readMerchantSceneComponent(componentPath), created: false };
  const locators = SCENE_COUNTS.flatMap((count, actIndex) => Array.from({ length: count }, (_item, sceneIndex) => ({ act: actIndex + 1, scene: sceneIndex + 1 })));
  const scenes: EnglishShakespeareScene[] = [];
  for (const locator of locators) scenes.push(await fetchScene(locator.act, locator.scene));
  validateMerchantSceneData(scenes);
  await mkdir(path.dirname(componentPath), { recursive: true });
  await writeFile(componentPath, `${JSON.stringify({
    schemaVersion: 1,
    play: "The Merchant of Venice",
    source: MIT_MERCHANT_BASE,
    editorialStatus: "needs-editorial",
    editorialNote: "Every companion is an intake-time machine-normalized draft. Review every scene before changing the unit to ready-for-export.",
    scenes
  }, null, 2)}\n`, "utf8");
  return { componentPath, scenes, created: true };
}

export const merchantSceneInternals = { SCENE_COUNTS, SCENE_GUIDANCE, draftPlainLanguage, sceneUrl };
