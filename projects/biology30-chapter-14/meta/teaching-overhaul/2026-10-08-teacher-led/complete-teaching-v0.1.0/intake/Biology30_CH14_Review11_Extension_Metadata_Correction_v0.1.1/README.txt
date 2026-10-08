Chapter14 route11 and extension metadata correction v0.1.1

This companion corrects a metadata-only hashing-contract defect in the original v0.1.0 conditional handoff. It does not change any teaching, question, key, figure, source owner, runtime or review result.

The original manifest used lxml's default ASCII HTML serialization for original_dom_sha256. Non-ASCII arrows in ch14-l11-teaching-01 and a curly apostrophe in the extension were emitted as numeric entities. The intake used UTF-8 serialization, so two hashes differed despite identical source content. Both forms are reproduced in HASH_CORRECTION_RECEIPT.json. The other two targets are ASCII-only and their hashes do not change.

PRESERVATION_MANIFEST.json now declares UTF-8 HTML serialization without a tail, retains all legacy hashes with explicit provenance, and names metadata v0.1.1 while keeping content candidate v0.1.0. The original manifest is included unchanged as PRESERVATION_MANIFEST_v0.1.0_UNCHANGED.json. The original Library handoff and its ZIP/hash remain the content source; this is a companion correction, not a replacement course package.

Guard: use the exact documented parser/serialization contract if comparing these parsed-target hashes. They are not a substitute for the unchanged full-owner hashes, explicit current-owner reconciliation or protected-content checks. If a target differs, hold it for reconciliation. This correction does not instruct force application or authorize overwriting newer local content.
