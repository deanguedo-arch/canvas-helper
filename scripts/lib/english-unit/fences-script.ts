export type FencesScriptScene = {
  id: string;
  act: number;
  scene: number;
  title: string;
  text: string;
};

const ROMAN_VALUE: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5 };

function cleanExtractedScript(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sceneTitle(text: string, act: number, scene: number) {
  const firstLine = text.split("\n").map((line) => line.trim()).find(Boolean) ?? "";
  const sentence = firstLine.match(/^.{1,180}?[.!?](?:\s|$)/)?.[0]?.trim();
  return sentence || `Act ${act}, Scene ${scene}`;
}

/** Parse the teacher-supplied Fences PDF extraction into its canonical two acts and nine scenes. */
export function parseFencesScriptScenes(sourceText: string): FencesScriptScene[] {
  const text = cleanExtractedScript(sourceText);
  const marker = /^(?:ACT\s+(I{1,2})\s*$|SCENE\s+(I{1,3}|IV|V)\s*:\s*)/gim;
  const scenes: FencesScriptScene[] = [];
  let currentAct = 0;
  let currentScene: { act: number; scene: number; start: number } | undefined;

  const closeScene = (end: number) => {
    if (!currentScene) return;
    const sceneText = cleanExtractedScript(text.slice(currentScene.start, end));
    if (!sceneText) throw new Error(`Fences Act ${currentScene.act}, Scene ${currentScene.scene} contains no readable text.`);
    scenes.push({
      id: `act-${currentScene.act}-scene-${currentScene.scene}`,
      act: currentScene.act,
      scene: currentScene.scene,
      title: sceneTitle(sceneText, currentScene.act, currentScene.scene),
      text: sceneText
    });
  };

  for (const match of text.matchAll(marker)) {
    if (match[1]) {
      closeScene(match.index);
      currentScene = undefined;
      currentAct = ROMAN_VALUE[match[1].toUpperCase()] ?? 0;
      continue;
    }
    if (!currentAct) throw new Error("Fences script contains a scene before its act heading.");
    closeScene(match.index);
    currentScene = {
      act: currentAct,
      scene: ROMAN_VALUE[(match[2] ?? "").toUpperCase()] ?? 0,
      start: match.index + match[0].length
    };
  }
  closeScene(text.length);

  const expected = ["1.1", "1.2", "1.3", "1.4", "2.1", "2.2", "2.3", "2.4", "2.5"];
  const actual = scenes.map((scene) => `${scene.act}.${scene.scene}`);
  if (actual.join(",") !== expected.join(",")) {
    throw new Error(`Fences script must contain Act I Scenes 1-4 and Act II Scenes 1-5; found ${actual.join(", ") || "none"}.`);
  }
  return scenes;
}
