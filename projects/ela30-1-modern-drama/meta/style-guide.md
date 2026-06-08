# Style Guide

## Runtime Shape
- Single-file HTML workspace adapted from the FinLit frame.
- Tailwind CDN, Google fonts, and Material Symbols stay external for authoring speed.
- Source Brightspace HTML is cleaned and placed inside route-based lesson panels.

## Visual Signals
- Preserve the FinLit dark sidebar, fixed top bar, white content canvas, and green accent system.
- Use source imagery only where it clarifies the active unit; avoid decorative filler.
- Keep cards compact, readable, and export-safe for Brightspace integration.

## Interaction Notes
- Hash routes drive Overview, Lessons, Writing Studio, Library, Film Room, and Resources.
- Library collects local PDFs/documents, Film Room collects normalized videos, and Resources is reserved for external non-video links.
- Lesson completion uses localStorage for local preview only.
- Sidebar collapse should not change the active route.

## Editing Guidance
- Canonical editable source: workspace/index.html.
- Raw and resources folders are reference-only intake material.
- Regenerate with the command in project.json when starting a fresh frame from the same ZIP.
