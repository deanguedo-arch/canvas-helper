# Contributing

## Workflow

1. Read `AGENTS.md`, `ARCHITECTURE.md`, and the relevant docs for the task.
2. Identify the smallest affected folder set.
3. Implement the change in that scope only.
4. Update tests and fixtures with any behavior change.
5. Report changed files and follow-up work separately.

## Task Shape

Every serious task should define:

- objective
- allowed scope
- forbidden scope
- acceptance criteria
- tests required
- non-goals

## Standards

- TypeScript for app and shared logic
- Zod for runtime schema validation in schema tasks
- Vitest for unit and integration tests
- deterministic exporter behavior
- no catch-all utility files
