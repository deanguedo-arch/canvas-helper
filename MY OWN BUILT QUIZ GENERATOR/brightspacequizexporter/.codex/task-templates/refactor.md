Task: [refactor name]

Objective:
Improve structure in a narrowly defined area without changing behavior.

Allowed scope:
- [folder/file]

Do not modify:
- [folder/file]

Requirements:
- preserve behavior
- keep public interfaces stable unless explicitly required
- reduce coupling or clarify ownership

Acceptance criteria:
- tests still pass
- behavior is unchanged
- scope remains narrow

Tests:
- run affected unit and integration tests

Notes:
- do not mix refactor work with new feature work
