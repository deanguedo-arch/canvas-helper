# Narrow provenance correction for03–04

The03–04 source-preflight report said the native inline textbook manifest exactly equals authoring/textbook-question-manifest.json. That overstates the comparison.

Correct verified relationship: the inline object has chapter, questions, pages and topics. All four fields equal the corresponding authoring fields. The authoring object additionally includes schemaVersion, sourcePdfSha256, coordinateSystem, contextPolicy and excluded metadata, which are not present in the inline object. Native course-data does equal the entire course-config object.

No actual question, crop, context, mapping, answer or reviewed learner response changes. The prior package bytes remain honestly frozen; this erratum qualifies only its provenance claim. Current05–06 PROTECTION_RECHECK.json records the precise field-level comparison. Do not use object equality as a proxy for runtime behavior.
