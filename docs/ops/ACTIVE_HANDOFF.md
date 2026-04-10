# Handoff

- Project: hss1010
- Task: Begin Canvas Builder editing with original visual style preserved
- Status: ready

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\hss1010\meta\project.json
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md

## Verification run
- `npm.cmd run verify -- --project hss1010` (passed)
- project discovery check confirms `hss1010` present

## Known risks / follow-up
- Provided source folder `canvas code and references/HSS1010` currently has no importable HTML/TXT input (empty `HSSCODE`), so no new import was run from that location.

## Source-of-truth location
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\hss1010\workspace\index.html
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\hss1010\workspace\main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\hss1010\meta\project.json

## Fragile areas / what might drift
- External image/font/script dependencies are network-hosted.
- Re-import with `--force` can replace workspace source.

## Next prompt assumptions
- Keep original HSS1010 style intact.
- Limit changes to content/organization/functionality unless user requests design changes.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\hss1010\workspace\index.html`
