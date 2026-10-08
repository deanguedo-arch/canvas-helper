# Asset usage

The six WebP files in `game/assets/` are contextual image crops from the supplied B2 concept screen. Exact crop bounds and the source hash are recorded in `ASSET_PROVENANCE.json`. The community-centre scene and five device thumbnails are decorative context; power, quantity, run time, energy, budget, service status and answer feedback are authored HTML values derived from the model, not image pixels.

Additional fan, projector and motor illustrations and interface icons are simple original SVG definitions in `game/app.js`. They are deterministic scalable interface artwork, not unreviewed generated scientific diagrams. The schedule, service checklist, energy bars and replay use HTML/SVG controls rather than an external game engine.

The build script embeds the same image bytes into `game/assets.js` and the standalone `PLAY.html`. Rebuild instead of manually editing the embedded data URLs.

Typography uses a system sans-serif stack. **No font binaries or external font services are included.** The Next Step text/chevrons follow the supplied visual concept; they are not a claim that a newly invented institutional logo has been approved. The unmodified canonical A1 image remains in `references/` for comparison only and is not the game background.

Source textbook/workbook images and assessment keys are not distributed in this package.
