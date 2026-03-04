# Agent Prompt Templates

Use these prompts to speed up coding sessions and keep requests precise.

## 1) Content-Only Edit

```text
Project: <slug>
Task: Update wording in section "<section heading>".
Constraints:
- Do not change layout, classes, scripts, or behavior.
- Edit only workspace files.
- Keep heading hierarchy and style tokens consistent with style-guide.md.
Deliver:
- Exact files changed
- Short diff summary
- Quick visual check steps in studio
```

## 2) Behavior + UX Fix

```text
Project: <slug>
Task: Fix interaction bug in "<feature>".
Symptoms: <what is broken>
Expected behavior: <target behavior>
Constraints:
- Keep Brightspace compatibility.
- Preserve CDN dependencies unless absolutely required.
- Edit workspace only.
Deliver:
- Root cause
- Code fix
- Verification steps (raw vs workspace)
```

## 3) Reference Alignment Pass

```text
Project: <slug>
Task: Align activity text with reference docs.
Source priority:
1) references/extracted
2) references/raw only if needed
Constraints:
- Preserve page structure and interactions.
- No broad rewrites outside targeted sections.
Deliver:
- Sections updated
- Reference source mapping
- Any unresolved ambiguity
```

## 4) Export Readiness Pass

```text
Project: <slug>
Task: Prepare Brightspace-ready export.
Run:
- analyze
- refs (if new docs)
- export:brightspace
Deliver:
- Issues found (if any)
- Export path
- Upload notes
```

## 5) Session Handoff

```text
Project: <slug>
Task: Create handoff-ready state.
Actions:
- Save Studio Session Log
- Summarize completed changes
- Summarize pending work as numbered next actions
- Include exact commands for next session
```
