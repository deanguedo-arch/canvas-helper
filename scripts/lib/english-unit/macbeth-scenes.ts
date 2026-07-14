import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import * as cheerio from "cheerio";

import type { EnglishShakespeareScene } from "./activity-profile-renderers.js";

const SCENE_COUNTS = [7, 4, 6, 3, 8] as const;
const MIT_MACBETH_BASE = "https://shakespeare.mit.edu/macbeth";

const SCENE_GUIDANCE: Record<string, { summary: string; focus: string }> = {
  "1.1": { summary: "The Witches arrange to meet Macbeth after the battle and establish a world of reversal.", focus: "Paradox, weather, rhythm, and the idea that appearances cannot be trusted." },
  "1.2": { summary: "A wounded captain and Ross report Macbeth's courage, and Duncan rewards him with Cawdor's title.", focus: "Public reputation, violent imagery, loyalty, and dramatic irony." },
  "1.3": { summary: "The Witches greet Macbeth and Banquo with prophecies; Macbeth begins imagining kingship.", focus: "Equivocation, ambition, Banquo as foil, and Macbeth's first aside." },
  "1.4": { summary: "Duncan names Malcolm heir while Macbeth hides the desire that now obstructs him.", focus: "Duncan's trust, appearance versus reality, and Macbeth's concealed ambition." },
  "1.5": { summary: "Lady Macbeth reads Macbeth's letter, calls on dark forces, and directs his performance.", focus: "Gender expectations, invocation, persuasion, and the language of concealment." },
  "1.6": { summary: "Duncan arrives at Inverness and misreads the castle and its hosts as welcoming.", focus: "Dramatic irony, hospitality, setting, and deceptive appearances." },
  "1.7": { summary: "Macbeth weighs the murder's consequences, then yields to Lady Macbeth's attack on his resolve.", focus: "Soliloquy, moral reasoning, persuasion, masculinity, and choice." },
  "2.1": { summary: "Banquo resists troubled thoughts while Macbeth follows an imagined dagger toward Duncan.", focus: "Hallucination, darkness, free choice, and the boundary between thought and action." },
  "2.2": { summary: "After Duncan's murder, Macbeth is overwhelmed by guilt while Lady Macbeth manages the evidence.", focus: "Sleep, blood, sound, differing reactions, and the point of no return." },
  "2.3": { summary: "The Porter delays discovery; Macduff finds Duncan, and Macbeth kills the guards.", focus: "Comic relief, hell imagery, performance, suspicion, and escalating disorder." },
  "2.4": { summary: "Ross and the Old Man describe unnatural events as Duncan's sons flee and Macbeth takes the crown.", focus: "Natural disorder, symbolism, public explanation, and political consequence." },
  "3.1": { summary: "Banquo suspects Macbeth; Macbeth fears Banquo's heirs and hires murderers.", focus: "Kingship without security, manipulation, fear, and the next chosen crime." },
  "3.2": { summary: "Macbeth conceals the plan against Banquo from Lady Macbeth as their partnership changes.", focus: "Isolation, secrecy, scorpion imagery, and shifting power in the marriage." },
  "3.3": { summary: "The murderers kill Banquo, but Fleance escapes.", focus: "Light and darkness, incomplete control, and the threat of the prophecy." },
  "3.4": { summary: "Banquo's ghost disrupts the banquet and exposes Macbeth's private terror before the court.", focus: "Public performance, guilt, staging, kingship, and Lady Macbeth's damage control." },
  "3.5": { summary: "Hecate criticizes the Witches and plans to lure Macbeth into false confidence.", focus: "Control, spectacle, overconfidence, and the scene's disputed authorship." },
  "3.6": { summary: "Lennox and a lord use guarded irony to reveal Scotland's suffering and Macduff's resistance.", focus: "Political language, irony, tyranny, and the growth of opposition." },
  "4.1": { summary: "The apparitions offer Macbeth dangerous assurances; he responds by choosing immediate violence.", focus: "Equivocation, spectacle, false security, and Macbeth's decision about Macduff." },
  "4.2": { summary: "Lady Macduff condemns her husband's flight before murderers attack her household.", focus: "Innocence, loyalty, domestic cost, and onstage violence." },
  "4.3": { summary: "Malcolm tests Macduff, Ross reports the slaughter, and Macduff turns grief toward justice.", focus: "Trust, leadership, grief, masculinity, and the ethics of revenge." },
  "5.1": { summary: "Lady Macbeth sleepwalks, reenacts fragments of the crimes, and reveals guilt she cannot control.", focus: "Prose, repetition, blood, sleep, fragmented memory, and reversal." },
  "5.2": { summary: "Scottish nobles gather against Macbeth and describe his failing rule through clothing imagery.", focus: "Metaphor, legitimacy, loyalty, and the contrast between title and fitness." },
  "5.3": { summary: "Macbeth clings to the prophecies while confronting fear, isolation, and what his rule has cost.", focus: "False confidence, aging, honour, medical imagery, and self-knowledge." },
  "5.4": { summary: "Malcolm orders each soldier to carry a branch from Birnam Wood as camouflage.", focus: "Strategy, prophecy, appearance, and the movement of the natural world." },
  "5.5": { summary: "Macbeth hears of Lady Macbeth's death, reflects on time and meaning, then learns Birnam Wood seems to move.", focus: "The tomorrow soliloquy, nihilism, time imagery, and collapsing certainty." },
  "5.6": { summary: "Malcolm's army throws down its branches and begins the assault.", focus: "Swift staging, fulfilled prediction, and the transition from sign to action." },
  "5.7": { summary: "Macbeth fights on, kills Young Siward, and still trusts the assurance about his birth.", focus: "Courage, desperation, prophecy, and the difference between bravery and justice." },
  "5.8": { summary: "Macduff reveals the truth of his birth, kills Macbeth, and Malcolm restores lawful rule.", focus: "Equivocation resolved, tragic responsibility, justice, and political restoration." }
};

const DRAFT_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bwherefore\b/gi, "why"],
  [/\bere\b/gi, "before"],
  [/\banon\b/gi, "soon"],
  [/\bhath\b/gi, "has"],
  [/\bdoth\b/gi, "does"],
  [/\bdost\b/gi, "do"],
  [/\bart\b/gi, "are"],
  [/\bthou\b/gi, "you"],
  [/\bthee\b/gi, "you"],
  [/\bthy\b/gi, "your"],
  [/\bthine\b/gi, "yours"],
  [/\bthyself\b/gi, "yourself"],
  [/\bye\b/gi, "you"],
  [/\b'tis\b/gi, "it is"],
  [/\b'twas\b/gi, "it was"],
  [/\bwouldst\b/gi, "would"],
  [/\bcouldst\b/gi, "could"],
  [/\bshouldst\b/gi, "should"],
  [/\bcanst\b/gi, "can"],
  [/\bwilt\b/gi, "will"],
  [/\bshalt\b/gi, "shall"],
  [/\bknow'st\b/gi, "know"],
  [/\bthink'st\b/gi, "think"],
  [/\bspeak'st\b/gi, "speak"],
  [/\bcome hither\b/gi, "come here"],
  [/\bhence\b/gi, "away"],
  [/\bwhence\b/gi, "from where"],
  [/\bwhither\b/gi, "to where"]
];

function draftPlainLanguage(original: string) {
  let companion = original;
  for (const [pattern, replacement] of DRAFT_REPLACEMENTS) companion = companion.replace(pattern, replacement);
  return companion.replace(/\s+([,.;:!?])/g, "$1").replace(/[ \t]+/g, " ").trim();
}

function sceneUrl(act: number, scene: number) {
  return `${MIT_MACBETH_BASE}/macbeth.${act}.${scene}.html`;
}

async function fetchScene(act: number, scene: number): Promise<EnglishShakespeareScene> {
  const url = sceneUrl(act, scene);
  const response = await fetch(url, { headers: { "user-agent": "Canvas Helper English intake" } });
  if (!response.ok) throw new Error(`Macbeth source request failed (${response.status}): ${url}`);
  const html = await response.text();
  const $ = cheerio.load(html);
  const guidance = SCENE_GUIDANCE[`${act}.${scene}`];
  if (!guidance) throw new Error(`Missing Macbeth scene guidance for Act ${act}, Scene ${scene}.`);
  const passages: EnglishShakespeareScene["passages"] = [];
  $("a[name^='speech']").each((_index, anchor) => {
    const speaker = $(anchor).text().replace(/\s+/g, " ").trim();
    const block = $(anchor).nextAll("blockquote").first();
    const lines = block
      .find("a[name]")
      .toArray()
      .map((line) => $(line).text().replace(/\s+/g, " ").trim())
      .filter(Boolean);
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
  if (!passages.length) throw new Error(`No Macbeth speeches were parsed from ${url}.`);
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
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

export function validateMacbethSceneData(value: unknown): asserts value is EnglishShakespeareScene[] {
  if (!Array.isArray(value) || value.length !== 28) throw new Error("Macbeth scene component must contain all 28 scenes.");
  const expected = new Set(SCENE_COUNTS.flatMap((count, actIndex) => Array.from({ length: count }, (_item, sceneIndex) => `${actIndex + 1}.${sceneIndex + 1}`)));
  for (const scene of value as EnglishShakespeareScene[]) {
    const locator = `${scene.act}.${scene.scene}`;
    if (!expected.delete(locator)) throw new Error(`Macbeth scene component contains an unexpected or duplicate locator: ${locator}.`);
    if (!scene.passages?.length || scene.passages.some((passage) => !passage.original?.trim() || !passage.companion?.trim())) {
      throw new Error(`Macbeth scene ${locator} does not contain complete side-by-side passage data.`);
    }
  }
  if (expected.size) throw new Error(`Macbeth scene component is missing: ${[...expected].join(", ")}.`);
}

export async function readMacbethSceneComponent(componentPath: string) {
  const parsed = JSON.parse(await readFile(componentPath, "utf8"));
  const scenes = Array.isArray(parsed) ? parsed : parsed.scenes;
  validateMacbethSceneData(scenes);
  return scenes;
}

/** Fetches public-domain source only during intake and never overwrites editable scene data. */
export async function ensureMacbethSceneComponent(input: { projectDir: string }) {
  const componentPath = path.join(input.projectDir, "workspace", "components", "shakespeare-side-by-side", "scenes.json");
  if (await fileExists(componentPath)) {
    const scenes = await readMacbethSceneComponent(componentPath);
    return { componentPath, scenes, created: false };
  }
  const locators = SCENE_COUNTS.flatMap((count, actIndex) =>
    Array.from({ length: count }, (_item, sceneIndex) => ({ act: actIndex + 1, scene: sceneIndex + 1 }))
  );
  const scenes: EnglishShakespeareScene[] = [];
  for (const locator of locators) scenes.push(await fetchScene(locator.act, locator.scene));
  validateMacbethSceneData(scenes);
  await mkdir(path.dirname(componentPath), { recursive: true });
  await writeFile(
    componentPath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        play: "Macbeth",
        source: MIT_MACBETH_BASE,
        editorialStatus: "needs-editorial",
        editorialNote: "Every companion is an intake-time machine-normalized draft. Review every scene before changing the unit to ready-for-export.",
        scenes
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  return { componentPath, scenes, created: true };
}

export const macbethSceneInternals = { SCENE_COUNTS, SCENE_GUIDANCE, draftPlainLanguage, sceneUrl };
