import { load } from "cheerio";

import { PREVIEW_BRIDGE_MAX_VISIBLE_TEXT } from "../../../app/shared/preview-bridge.js";

export function catalogPilotVisibleText(innerHtml: string) {
  return load(`<body>${innerHtml}</body>`)("body")
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, PREVIEW_BRIDGE_MAX_VISIBLE_TEXT);
}
