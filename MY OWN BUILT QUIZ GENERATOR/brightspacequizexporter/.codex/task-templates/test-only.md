Task: [test task name]

Objective:
Add or improve tests without changing production behavior.

Allowed scope:
- [test files]
- [fixtures]

Do not modify:
- [production modules unless required for testability and approved]

Requirements:
- use realistic fixtures where appropriate
- keep assertions tied to observable behavior

Acceptance criteria:
- new tests fail before the fix or coverage gap is addressed
- tests document expected behavior clearly

Tests:
- add/update only the necessary tests
