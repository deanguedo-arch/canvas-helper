"""Read-only academic source check; writes evidence only to an explicit scratch directory.

No video/audio files, cookies, credentials, learner files, or source archives are written.
Caption-track metadata is not a transcript review. Empty/blocked responses stay unverified.
Run with the bundled Python runtime (pypdf) from the repository root.
"""

import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

from pypdf import PdfReader


PROJECT = Path("projects/biology30-unit-a-pilot-2")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read(), response.status


def review_video(video):
    video_id = video["youtubeId"]
    result = {
        "youtubeId": video_id,
        "routeId": video["routeId"],
        "checkedAt": datetime.now(timezone.utc).isoformat(),
        "url": f"https://www.youtube.com/watch?v={video_id}",
        "transcriptReviewed": False,
        "playbackObserved": False,
    }
    try:
        raw, status = fetch(result["url"])
        text = raw.decode("utf-8", errors="replace")
        match = re.search(r"(?:var )?ytInitialPlayerResponse\s*=\s*", text)
        if not match:
            raise ValueError("No public player response in the returned page")
        player, _ = json.JSONDecoder().raw_decode(text[match.end():])
        details = player.get("videoDetails", {})
        playability = player.get("playabilityStatus", {})
        result.update({
            "httpStatus": status,
            "pageSha256": digest(raw),
            "title": details.get("title"),
            "provider": details.get("author"),
            "durationSeconds": int(details["lengthSeconds"]) if details.get("lengthSeconds") else None,
            "playerStatus": playability.get("status"),
            "playerReason": playability.get("reason"),
            "playableInEmbedReported": playability.get("playableInEmbed"),
        })
        tracks = player.get("captions", {}).get("playerCaptionsTracklistRenderer", {}).get("captionTracks", [])
        result["captionTracks"] = [{"language": t.get("languageCode"), "kind": t.get("kind", "publisher"), "name": t.get("name", {}).get("simpleText")} for t in tracks]
        english = sorted([t for t in tracks if t.get("languageCode", "").startswith("en")], key=lambda t: t.get("kind") == "asr")
        result["captionRetrieval"] = "no-english-track-returned"
        if english:
            # Only the exact public URL returned by YouTube; no account or challenge bypass.
            url = english[0]["baseUrl"]
            if not url.startswith("https://www.youtube.com/api/timedtext?"):
                raise ValueError("Unexpected caption URL origin")
            caption, code = fetch(url)
            result["captionHttpStatus"] = code
            result["captionBytes"] = len(caption)
            result["captionSha256"] = digest(caption)
            if caption.strip():
                root = ET.fromstring(caption)
                result["captionText"] = " ".join("".join(node.itertext()) for node in root.findall(".//text"))
                result["captionRetrieval"] = "text-retrieved-not-yet-reviewed" if result["captionText"] else "no-caption-text"
            else:
                result["captionRetrieval"] = "empty-response-not-a-verified-transcript"
    except (urllib.error.URLError, ValueError, KeyError, ET.ParseError, TimeoutError) as error:
        result["retrievalError"] = str(error)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()
    destination = args.output_dir.resolve()
    if not destination.is_dir() or not str(destination).startswith("/private/tmp/") and not str(destination).startswith("/tmp/"):
        raise SystemExit("Use an existing task-specific /tmp directory")
    html = (PROJECT / "workspace/index.html").read_bytes()
    media_plan = json.loads((PROJECT / "meta/figure-media-plan.json").read_text())
    with ThreadPoolExecutor(max_workers=3) as pool:
        videos = list(pool.map(review_video, media_plan["videos"]))
    textbooks = []
    for chapter, offset in [(11, 359), (12, 403), (13, 433)]:
        path = PROJECT / f"workspace/assets/textbook/chapter-{chapter}.pdf"
        pages = PdfReader(path).pages
        textbooks.append({"chapter": chapter, "path": str(path), "sha256": digest(path.read_bytes()), "pages": [{"printedPage": i + 1 + offset, "physicalPage": i + 1, "text": page.extract_text()} for i, page in enumerate(pages)]})
    evidence = {"schemaVersion": 1, "workspaceSha256": digest(html), "checkedAt": datetime.now(timezone.utc).isoformat(), "videos": videos, "textbooks": textbooks}
    output = destination / "source-evidence.json"
    output.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"output": str(output), "videos": [{k: v for k, v in row.items() if k != "captionText"} for row in videos]}, indent=2))


if __name__ == "__main__":
    main()
