#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
from collections import deque
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

DEFAULT_PICTURES = [10, 11, 14, 15]
WIDTH = 160
HEIGHT = 168
PRIORITY_BACKGROUND = 4


def round_agi(value: float, direction: float) -> int:
    import math

    if direction < 0:
      return math.floor(value) if value - math.floor(value) <= 0.501 else math.ceil(value)
    return math.floor(value) if value - math.floor(value) < 0.499 else math.ceil(value)


def draw_line(screen: list[list[int]], x1: int, y1: int, x2: int, y2: int, color: int) -> None:
    width = x2 - x1
    height = y2 - y1
    add_x = 0 if height == 0 else width / abs(height)
    add_y = 0 if width == 0 else height / abs(width)

    def pset(px: int, py: int) -> None:
        if 0 <= px < WIDTH and 0 <= py < HEIGHT:
            screen[py][px] = color

    if abs(width) > abs(height):
        y = float(y1)
        add_x = 0 if width == 0 else width / abs(width)
        x = float(x1)
        while int(x) != x2:
            pset(round_agi(x, add_x), round_agi(y, add_y))
            y += add_y
            x += add_x
        pset(x2, y2)
    else:
        x = float(x1)
        add_y = 0 if height == 0 else height / abs(height)
        y = float(y1)
        while int(y) != y2:
            pset(round_agi(x, add_x), round_agi(y, add_y))
            x += add_x
            y += add_y
        pset(x2, y2)


def flood_fill(
    picture: list[list[int]],
    priority: list[list[int]],
    start_x: int,
    start_y: int,
    picture_enabled: bool,
    priority_enabled: bool,
    picture_color: int,
    priority_color: int,
) -> None:
    if not (0 <= start_x < WIDTH and 0 <= start_y < HEIGHT):
        return

    target_picture = 15
    target_priority = PRIORITY_BACKGROUND
    queue = deque([(start_x, start_y)])
    seen: set[tuple[int, int]] = set()

    while queue:
        x, y = queue.popleft()
        if (x, y) in seen:
            continue
        seen.add((x, y))

        picture_ok = picture[y][x] == target_picture if picture_enabled else False
        priority_ok = priority[y][x] == target_priority if priority_enabled else False

        if picture_enabled and priority_enabled:
            if not picture_ok and not priority_ok:
                continue
        elif picture_enabled and not picture_ok:
            continue
        elif priority_enabled and not priority_ok:
            continue

        if picture_enabled and picture_ok:
            picture[y][x] = picture_color
        if priority_enabled and priority_ok:
            priority[y][x] = priority_color

        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < WIDTH and 0 <= ny < HEIGHT:
                if picture_enabled and priority_enabled:
                    pic_neighbor = picture[ny][nx] == target_picture
                    pri_neighbor = priority[ny][nx] == target_priority
                    if pic_neighbor or pri_neighbor:
                        queue.append((nx, ny))
                elif picture_enabled and picture[ny][nx] == target_picture:
                    queue.append((nx, ny))
                elif priority_enabled and priority[ny][nx] == target_priority:
                    queue.append((nx, ny))


def draw_corner(screen: list[list[int]], action: int, data: bytes, pos: int, color: int) -> tuple[int, int, int]:
    x = data[pos]
    y = data[pos + 1]
    pos += 2
    while pos < len(data) and data[pos] < 0xF0:
        if action == 0xF4:
            new_y = data[pos]
            pos += 1
            draw_line(screen, x, y, x, new_y, color)
            y = new_y
            if pos < len(data) and data[pos] < 0xF0:
                new_x = data[pos]
                pos += 1
                draw_line(screen, x, y, new_x, y, color)
                x = new_x
        else:
            new_x = data[pos]
            pos += 1
            draw_line(screen, x, y, new_x, y, color)
            x = new_x
            if pos < len(data) and data[pos] < 0xF0:
                new_y = data[pos]
                pos += 1
                draw_line(screen, x, y, x, new_y, color)
                y = new_y
    return x, y, pos


def draw_absolute(screen: list[list[int]], data: bytes, pos: int, color: int) -> tuple[int, int, int]:
    x = data[pos]
    y = data[pos + 1]
    pos += 2
    while pos + 1 < len(data) and data[pos] < 0xF0 and data[pos + 1] < 0xF0:
        new_x = data[pos]
        new_y = data[pos + 1]
        draw_line(screen, x, y, new_x, new_y, color)
        x, y = new_x, new_y
        pos += 2
    return x, y, pos


def draw_relative(screen: list[list[int]], data: bytes, pos: int, color: int) -> tuple[int, int, int]:
    x = data[pos]
    y = data[pos + 1]
    pos += 2
    while pos < len(data) and data[pos] < 0xF0:
        value = data[pos]
        pos += 1
        x_sign = -1 if value & 0x80 else 1
        x_disp = (value >> 4) & 0x07
        y_sign = -1 if value & 0x08 else 1
        y_disp = value & 0x07
        new_x = x + (x_disp * x_sign)
        new_y = y + (y_disp * y_sign)
        draw_line(screen, x, y, new_x, new_y, color)
        x, y = new_x, new_y
    return x, y, pos


def decode_pic(path: Path) -> dict:
    data = path.read_bytes()
    picture = [[15 for _ in range(WIDTH)] for _ in range(HEIGHT)]
    priority = [[PRIORITY_BACKGROUND for _ in range(WIDTH)] for _ in range(HEIGHT)]

    picture_enabled = False
    priority_enabled = False
    picture_color = 0
    priority_color = PRIORITY_BACKGROUND
    pos = 0
    unsupported_ops: list[int] = []

    while pos < len(data):
        opcode = data[pos]
        pos += 1

        if opcode == 0xFF:
            break
        if opcode == 0xF0:
            picture_color = data[pos]
            picture_enabled = True
            pos += 1
            continue
        if opcode == 0xF1:
            picture_enabled = False
            continue
        if opcode == 0xF2:
            priority_color = data[pos]
            priority_enabled = True
            pos += 1
            continue
        if opcode == 0xF3:
            priority_enabled = False
            continue
        if opcode in (0xF4, 0xF5):
            if picture_enabled:
                _, _, _ = draw_corner(picture, opcode, data, pos, picture_color)
            if priority_enabled:
                _, _, _ = draw_corner(priority, opcode, data, pos, priority_color)
            _, _, pos = draw_corner([[0] * WIDTH for _ in range(HEIGHT)], opcode, data, pos, 0)
            continue
        if opcode == 0xF6:
            if picture_enabled:
                _, _, _ = draw_absolute(picture, data, pos, picture_color)
            if priority_enabled:
                _, _, _ = draw_absolute(priority, data, pos, priority_color)
            _, _, pos = draw_absolute([[0] * WIDTH for _ in range(HEIGHT)], data, pos, 0)
            continue
        if opcode == 0xF7:
            if picture_enabled:
                _, _, _ = draw_relative(picture, data, pos, picture_color)
            if priority_enabled:
                _, _, _ = draw_relative(priority, data, pos, priority_color)
            _, _, pos = draw_relative([[0] * WIDTH for _ in range(HEIGHT)], data, pos, 0)
            continue
        if opcode == 0xF8:
            while pos + 1 < len(data) and data[pos] < 0xF0 and data[pos + 1] < 0xF0:
                x = data[pos]
                y = data[pos + 1]
                flood_fill(picture, priority, x, y, picture_enabled, priority_enabled, picture_color, priority_color)
                pos += 2
            continue
        if opcode in (0xF9, 0xFA):
            unsupported_ops.append(opcode)
            break
        unsupported_ops.append(opcode)
        break

    return {
        "picture": picture,
        "priority": priority,
        "unsupportedOps": sorted({hex(op) for op in unsupported_ops}),
    }


def raster_to_svg(pixels: list[list[int]], scale_x: int = 4, scale_y: int = 2) -> str:
    rects: list[str] = []
    for y, row in enumerate(pixels):
        run_color = row[0]
        run_start = 0
        for x in range(1, len(row) + 1):
            color = row[x] if x < len(row) else None
            if color == run_color:
                continue
            rects.append(
                f'<rect x="{run_start * scale_x}" y="{y * scale_y}" width="{(x - run_start) * scale_x}" '
                f'height="{scale_y}" fill="{EGA_PALETTE[run_color]}" />'
            )
            run_color = color
            run_start = x
    width = WIDTH * scale_x
    height = HEIGHT * scale_y
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}" shape-rendering="crispEdges">\n'
        + "\n".join(rects)
        + "\n</svg>\n"
    )


def export_picture(source_root: Path, target_root: Path, picture_id: int) -> None:
    pic_path = source_root / "PIC" / f"PIC.{picture_id}"
    decoded = decode_pic(pic_path)
    picture_dir = target_root / f"pic-{picture_id}"
    picture_dir.mkdir(parents=True, exist_ok=True)

    (picture_dir / "visual.svg").write_text(raster_to_svg(decoded["picture"]), encoding="utf-8")
    (picture_dir / "priority.svg").write_text(raster_to_svg(decoded["priority"]), encoding="utf-8")
    (picture_dir / "manifest.json").write_text(
        json.dumps(
            {
                "pictureId": picture_id,
                "sourceFile": str(pic_path),
                "unsupportedOps": decoded["unsupportedOps"],
                "visualFile": "visual.svg",
                "priorityFile": "priority.svg",
            },
            indent=2,
        ),
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Export AGI PIC resources to SVG assets.")
    parser.add_argument("--source-root", default="/tmp/lsl_source")
    parser.add_argument(
        "--target-root",
        default=str(Path(__file__).resolve().parents[1] / "workspace" / "assets" / "agi" / "pics"),
    )
    parser.add_argument("--pic", action="append", type=int, dest="pictures")
    args = parser.parse_args()

    source_root = Path(args.source_root)
    target_root = Path(args.target_root)
    picture_ids = args.pictures if args.pictures else DEFAULT_PICTURES

    for picture_id in picture_ids:
        export_picture(source_root, target_root, picture_id)


if __name__ == "__main__":
    main()
