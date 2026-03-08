# Brightspace CSV Export

This folder owns Brightspace CSV mapping and export behavior only.

It must adapt from the canonical schema and fail loudly on malformed data.

## Implemented Scope

- validates the canonical project before export
- maps all currently modeled question types to Brightspace CSV rows
- emits explicit warnings for omitted fields and fixed scoring defaults
- returns diagnostics instead of silently degrading malformed data
