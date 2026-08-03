import assert from "node:assert/strict";
import test from "node:test";

import { parseNsoPodcastText, youtubeVideoIdFromHref } from "./nso-podcasts.js";

test("extracts only the requested Social course podcasts and removes duplicate videos", () => {
  const entries = parseNsoPodcastText(
    [
      "Social Studies 10",
      "Loyalities - https://youtu.be/abc123",
      "Duplicate link https://www.youtube.com/watch?v=abc123",
      "Social Studies 20",
      "Should not appear https://youtu.be/other"
    ].join("\n"),
    "Social Studies 10"
  );

  assert.deepEqual(entries, [
    {
      title: "Loyalties Podcast",
      href: "https://youtu.be/abc123",
      sourceLine: 2
    }
  ]);
});

test("recognizes common YouTube URL forms", () => {
  assert.equal(youtubeVideoIdFromHref("https://youtu.be/short-id?t=12"), "short-id");
  assert.equal(youtubeVideoIdFromHref("https://www.youtube.com/watch?v=watch-id"), "watch-id");
  assert.equal(youtubeVideoIdFromHref("https://www.youtube-nocookie.com/embed/embed-id?rel=0"), "embed-id");
  assert.equal(youtubeVideoIdFromHref("not a URL"), undefined);
});
