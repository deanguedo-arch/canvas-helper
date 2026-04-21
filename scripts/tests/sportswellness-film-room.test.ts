import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/sportswellness/workspace/main.js");
const indexPath = path.resolve("projects/sportswellness/workspace/index.html");
const stylesPath = path.resolve("projects/sportswellness/workspace/styles.css");

test("sportswellness icons section is replaced with a film room video catalog and CRT player", async () => {
  const [mainSource, indexSource, stylesSource] = await Promise.all([
    readFile(mainPath, "utf8"),
    readFile(indexPath, "utf8"),
    readFile(stylesPath, "utf8")
  ]);

  const expectedMainSnippets = [
    "const FILM_ROOM_VIDEOS = [",
    "activeFilmRoomVideoId: FILM_ROOM_VIDEOS[0]?.id || null",
    "function getFilmRoomVideoById(videoId)",
    "function selectFilmRoomVideo(id)",
    "refs.sectionTitle.textContent = 'Film Room';",
    "data-film-room-select",
    "film-room-shell",
    "film-room-tv",
    "film-room-screen",
    "film-room-select",
    "How Self-Determination Theory (SDT) Creates Intrinsic Motivation",
    "High Performance: Finding the Balance between Truth and Trust",
    "https://www.youtube.com/embed/${activeVideo.youtubeId}"
  ];

  const expectedIndexSnippets = [
    "id=\"nav-icons\"",
    "Film Room"
  ];

  const expectedStyleSnippets = [
    ".film-room-shell",
    ".film-room-stage",
    ".film-room-tv",
    ".film-room-screen",
    ".film-room-screen iframe",
    ".film-room-select",
    "background: linear-gradient(180deg, rgba(15, 19, 26, 0.96), rgba(11, 17, 26, 0.94));",
    "background: linear-gradient(180deg, #1b2431, #101722);",
    "color: var(--green);",
    "border: 1px solid var(--line);"
  ];

  for (const snippet of expectedMainSnippets) {
    assert.match(mainSource, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const snippet of expectedIndexSnippets) {
    assert.match(indexSource, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const snippet of expectedStyleSnippets) {
    assert.match(stylesSource, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(mainSource, /Reserved for athletic icon sets and quick references\./);
  assert.doesNotMatch(stylesSource, /#ffb84d|#f5e2aa|#f7e4bd|#ff9e1a|#f4d2a4/);
});
