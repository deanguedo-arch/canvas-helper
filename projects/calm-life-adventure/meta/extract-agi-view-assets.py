#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

EGA_PALETTE = [
    "#000000",
    "#0000aa",
    "#00aa00",
    "#00aaaa",
    "#aa0000",
    "#aa00aa",
    "#aa5500",
    "#aaaaaa",
    "#555555",
    "#5555ff",
    "#55ff55",
    "#55ffff",
    "#ff5555",
    "#ff55ff",
    "#ffff55",
    "#ffffff",
]

DEFAULT_VIEWS = {
    0: "vEgo",
}


def parse_view_names(header_path: Path) -> dict[int, str]:
    pattern = re.compile(r"%view\s+([A-Za-z0-9_]+)\s+(\d+)")
    names: dict[int, str] = {}
    for line in header_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        match = pattern.search(line)
        if match:
            names[int(match.group(2))] = match.group(1)
    return names


def parse_view_file(path: Path) -> dict:
    data = path.read_bytes()
    loop_count = data[2]
    description_offset = int.from_bytes(data[3:5], "little")
    loop_offsets = [int.from_bytes(data[5 + i * 2: 7 + i * 2], "little") for i in range(loop_count)]
    loops = []

    for loop_index, loop_offset in enumerate(loop_offsets):
        cel_count = data[loop_offset]
        cel_offsets = [
            int.from_bytes(data[loop_offset + 1 + i * 2: loop_offset + 3 + i * 2], "little")
            for i in range(cel_count)
        ]
        cels = []

        for cel_index, cel_offset in enumerate(cel_offsets):
            start = loop_offset + cel_offset
            width = data[start]
            height = data[start + 1]
            mirror_info = data[start + 2] >> 4
            transparent = data[start + 2] & 0x0F
            pos = start + 3
            pixels: list[list[int]] = []

            for _ in range(height):
                row: list[int] = []
                while True:
                    value = data[pos]
                    pos += 1
                    if value == 0:
                        break
                    color = value >> 4
                    run = value & 0x0F
                    row.extend([color] * run)

                if len(row) < width:
                    row.extend([transparent] * (width - len(row)))
                else:
                    row = row[:width]

                pixels.append(row)

            cels.append(
                {
                    "index": cel_index,
                    "width": width,
                    "height": height,
                    "mirrorInfo": mirror_info,
                    "transparent": transparent,
                    "pixels": pixels,
                }
            )

        loops.append({"index": loop_index, "cels": cels})

    description = ""
    if description_offset:
        end = data.find(b"\x00", description_offset)
        if end == -1:
            end = len(data)
        description = data[description_offset:end].decode("latin-1", errors="ignore")

    return {
        "path": str(path),
        "loopCount": loop_count,
        "description": description,
        "loops": loops,
    }


def cel_to_svg(cel: dict, pixel_width: int = 2, pixel_height: int = 2) -> str:
    width = cel["width"] * pixel_width
    height = cel["height"] * pixel_height
    transparent = cel["transparent"]
    rects: list[str] = []

    for y, row in enumerate(cel["pixels"]):
        run_color = None
        run_start = 0
        run_length = 0

        for x, color in enumerate(row + [None]):
            if color == run_color:
                run_length += 1
                continue

            if run_color is not None and run_color != transparent and run_length:
                rects.append(
                    f'<rect x="{run_start * pixel_width}" y="{y * pixel_height}" '
                    f'width="{run_length * pixel_width}" height="{pixel_height}" '
                    f'fill="{EGA_PALETTE[run_color]}" />'
                )

            run_color = color
            run_start = x
            run_length = 1

    rect_blob = "\n  ".join(rects)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}" shape-rendering="crispEdges">\n'
        f'  <rect width="{width}" height="{height}" fill="none" />\n'
        f'  {rect_blob}\n'
        f"</svg>\n"
    )


def export_view(source_root: Path, target_root: Path, view_id: int, view_name: str) -> None:
    view_path = source_root / "VIEW" / f"VIEW.{view_id}"
    parsed = parse_view_file(view_path)
    view_dir = target_root / view_name
    view_dir.mkdir(parents=True, exist_ok=True)

    manifest = {
        "viewId": view_id,
        "viewName": view_name,
        "sourceFile": str(view_path),
        "description": parsed["description"],
        "loops": [],
    }

    for loop in parsed["loops"]:
        loop_entry = {"index": loop["index"], "cels": []}
        for cel in loop["cels"]:
            file_name = f"loop{loop['index']}-cel{cel['index']}.svg"
            (view_dir / file_name).write_text(cel_to_svg(cel), encoding="utf-8")
            loop_entry["cels"].append(
                {
                    "index": cel["index"],
                    "file": file_name,
                    "width": cel["width"],
                    "height": cel["height"],
                    "transparent": cel["transparent"],
                    "mirrorInfo": cel["mirrorInfo"],
                }
            )
        manifest["loops"].append(loop_entry)

    (view_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Export AGI VIEW resources to SVG assets.")
    parser.add_argument(
        "--source-root",
        default="/tmp/lsl_source",
        help="Root of the extracted AGI source bundle. Defaults to /tmp/lsl_source.",
    )
    parser.add_argument(
        "--target-root",
        default=str(
            Path(__file__).resolve().parents[1] / "workspace" / "assets" / "agi" / "views"
        ),
        help="Directory to write exported SVG view assets into.",
    )
    parser.add_argument(
        "--view",
        action="append",
        type=int,
        dest="views",
        help="Specific numeric view id to export. Repeatable.",
    )
    args = parser.parse_args()

    source_root = Path(args.source_root)
    target_root = Path(args.target_root)
    header_names = parse_view_names(source_root / "SRC" / "VIEWS.H")
    view_ids = args.views if args.views else sorted(DEFAULT_VIEWS.keys())

    for view_id in view_ids:
        view_name = DEFAULT_VIEWS.get(view_id) or header_names.get(view_id) or f"view{view_id}"
        export_view(source_root, target_root, view_id, view_name)


if __name__ == "__main__":
    main()
