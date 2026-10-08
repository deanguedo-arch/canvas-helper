# Static Preview Rendering Note

The exact mockup authority is the executable HTML/CSS under each game's `04_MOCKUPS/html/` folder. This environment blocked direct browser navigation to local/localhost pages, so the supplied PNG files were rendered deterministically from that source with a standards-based static HTML renderer. They are visual reference previews, not a claim of browser-runtime testing.

During implementation Codex must:
1. open the supplied mockup HTML in the same target browser used for QA;
2. capture target-browser baselines;
3. compare production screens to those baselines;
4. treat unexplained layout drift as a failure.
