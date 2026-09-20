# Muse Delegation Task Contract

Use this structure for the prompt passed to Muse. Remove sections that truly do not apply, but never omit the boundary or forbidden actions.

```md
# Objective
<One concrete implementation result.>

# Starting point
- Expected commit: <full Git SHA>
- Canonical source: <repo-relative source files>
- Relevant instructions: <AGENTS/workflow/project files to read>

# Allowed paths
- <exact file or directory>
- <exact file or directory>

# Required behavior
- <observable requirement>
- <compatibility requirement>

# Required evidence
- <focused command or inspection>
- <regression scenario>

# Forbidden actions
- Do not edit outside the allowed paths.
- Do not commit, push, merge, package, deploy, publish, or change branches.
- Do not modify raw, exports, runtime caches, active handoffs, or unrelated files unless one is explicitly allowed above.
- Do not claim Studio, LMS, deployment, accessibility, or teacher acceptance without direct evidence.

# Completion report
- Starting and ending Git status and commit.
- Files changed and why.
- Exact checks and results.
- Backward-compatibility analysis.
- Unresolved risks and untested claims.
```
