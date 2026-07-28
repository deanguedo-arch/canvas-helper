import assert from "node:assert/strict";
import test from "node:test";
import { renderShakespeareReaderPage, SHAKESPEARE_READER_RUNTIME, SHAKESPEARE_READER_STYLES } from "./shakespeare-reader-renderer.js";
import type { EnglishShakespeareProfile } from "./activity-profile-renderers.js";

const profile: EnglishShakespeareProfile = {
  kind: "shakespeare-drama",
  namespace: "ela20-1-macbeth",
  courseCode: "ELA 20-1",
  unitTitle: "Shakespearean Drama - Macbeth",
  playTitle: "Macbeth",
  materials: [],
  actQuestionSets: [],
  characters: [],
  characterFields: [],
  writingTools: [],
  scenes: [{
    id: "act-1-scene-1",
    act: 1,
    scene: 1,
    title: "The witches meet",
    summary: "The Weird Sisters plan another meeting.",
    focus: "Watch how paradox establishes uncertainty.",
    editorialStatus: "needs-editorial",
    sourceHref: "https://example.org/macbeth/1/1",
    passages: [
      { id: "anchor-1", speaker: "WITCHES", original: "Fair is foul.", companion: "What seems good may be bad.", note: "The paradox frames the play." },
      { id: "anchor-2", speaker: "WITCHES", original: "Hover through the fog.", companion: "Move through the fog.", note: "Machine-normalized editorial draft; review before final packaging." }
    ]
  }]
};

test("Shakespeare reader renders donor-parity comparison, recap, and deliberate evidence capture", () => {
  const html = renderShakespeareReaderPage(profile);
  assert.match(html, /parallel-reading-toolbar/);
  assert.match(html, /Original Shakespeare text/);
  assert.match(html, /Plain-language companion/);
  assert.match(html, /Use as evidence/);
  assert.match(html, /Scene recap/);
  assert.match(html, /data-save-evidence-note/);
  assert.match(html, /The paradox frames the play/);
  assert.doesNotMatch(html, /Companion needs editorial review|Machine-normalized|final packaging|data-editorial-status/);
  assert.match(html, /data-english-activity-panel-group/);
  assert.match(SHAKESPEARE_READER_STYLES, /grid-template-columns: repeat\(2/);
  assert.match(SHAKESPEARE_READER_RUNTIME, /data-reader-anchor/);
});
