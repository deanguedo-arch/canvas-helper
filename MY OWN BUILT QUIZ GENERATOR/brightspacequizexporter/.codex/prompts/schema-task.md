Focus only on the canonical schema layer under `src/core/schema/`.

Rules:
- schema is the source of truth
- use Zod for runtime validation
- keep question types explicit
- if schema changes, update validators, fixtures, and tests
