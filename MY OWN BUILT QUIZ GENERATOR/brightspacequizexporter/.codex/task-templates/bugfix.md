Task: [bug name]

Objective:
Fix the observed behavior without broad refactoring.

Allowed scope:
- [folder/file]

Do not modify:
- [folder/file]

Requirements:
- reproduce the issue first
- patch the narrowest layer that owns the bug
- preserve documented behavior elsewhere

Acceptance criteria:
- bug is covered by a regression test
- fix stays within allowed scope

Tests:
- add/update regression test

Notes:
- do not weaken validation or error handling to hide the issue
