import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainRuntimePath = path.resolve("projects/sportswellness/workspace/main.js");

test("sportswellness workspace persists and syncs preview navigation state across same-origin views", async () => {
  const runtime = await readFile(mainRuntimePath, "utf8");

  const expectedSnippets = [
    "const UI_STATE_KEY = 'sportswellness.ui-state.v1';",
    "function normalizeUiState(rawState)",
    "function persistUiState()",
    "localStorage.setItem(UI_STATE_KEY, JSON.stringify({",
    "activeFilmRoomVideoId: FILM_ROOM_VIDEOS.some((item) => item.id === rawState.activeFilmRoomVideoId)",
    "function restoreUiState()",
    "restoreUiState();",
    "window.addEventListener('storage', (event) => {",
    "event.key !== UI_STATE_KEY",
    "applyUiStateSnapshot(nextState);",
    "state.section = 'assignment';",
    "state.activeFilmRoomVideoId = snapshot.activeFilmRoomVideoId;"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(runtime, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
