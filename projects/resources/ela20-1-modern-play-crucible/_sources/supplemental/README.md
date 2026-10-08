# The Crucible Supplemental Intake

This folder is the immutable-source boundary for the additional Next Step Crucible materials imported on 2026-07-16.

- `originals/` preserves the supplied files byte-for-byte.
- `derived/` contains learner-facing conversions.
- `manifest.json` records hashes, roles, duplicate handling, and transformations.
- The editable placement decisions remain in `projects/ela20-1-modern-play-crucible/meta/english-unit.json`.

The Act 1 PDF is byte-identical to the existing teacher-archive Act 1 sheet. It is retained for traceability and intentionally not placed twice.

The learner guide keeps the instructional content and all 62 act questions. Obsolete exam submission directions were removed from the learner-facing DOCX/PDF derivatives.

The original film is preserved in the approved external Project Archives registry; the learner derivative remains in place. From the repository root, resolve and verify the original with:

```bash
npx --no-install tsx scripts/resolve-project-archive.ts --source "projects/resources/ela20-1-modern-play-crucible/_sources/supplemental/originals/The Crucible Movie source.mp4" --path-only
```

Use the returned absolute filename as the input to the historical conversion command below. Set `CANVAS_HELPER_ARCHIVE_ROOT` on another computer if its Project Archives folder differs. This resolver reads/verifies only; it does not regenerate a course or restore files automatically.

The film derivative was generated with:

```bash
ffmpeg -ignore_editlist 1 -i "originals/The Crucible Movie source.mp4" \
  -map 0:v:0 -map 0:a:0 \
  -vf "scale=720:404:flags=lanczos,setsar=1" \
  -af "aresample=async=1:first_pts=0" \
  -r 30000/1001 -fps_mode cfr \
  -c:v libx264 -preset veryfast -crf 23 -profile:v high -level 3.1 -pix_fmt yuv420p \
  -c:a aac -b:a 96k -ac 2 -ar 48000 \
  -movflags +faststart -map_metadata -1 \
  "derived/The Crucible Movie - H264 AAC.mp4"
```

Final publication still requires confirmation of school redistribution rights and a caption/transcript accommodation.
