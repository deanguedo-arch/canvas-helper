## Repo Proof Surface Candidate

Repo: canvas-helper
Confidence: high
Status: candidate

## Detected Stack
- html-css
- node
- playwright
- vite

## Detected Proof Commands
- npm run assessment-map
- npm run blueprint
- npm run build:course-shell
- npm run build:studio
- npm run lesson-packets
- npm run library
- npm run smoke:pipeline
- npm run test:apps-script
- npm run test:assessments
- npm run test:course-shell
- npm run test:e2e
- npm run test:e2e:harness
- npm run test:e2e:project
- npm run test:e2e:smoke
- npm run test:exports
- npm run test:forensics35-workspace
- npm run test:google-hosted
- npm run test:learning
- npm run test:metadata-policy
- npm run test:progress-report
- npm run test:report-all-progress
- npm run test:scorm
- npm run typecheck
- npm run validate:manifests
- npm run verify

## Detected Risky Actions
- npm run deploy:google-hosted requires explicit human approval, non-mutating preflight proof, target validation
- npm run export:apps-script requires explicit human approval, non-mutating preflight proof, target validation
- npm run export:google-hosted requires explicit human approval, non-mutating preflight proof, target validation
- npm run sync:course-images requires explicit human approval, non-mutating preflight proof, target validation
- npm run test:apps-script requires explicit human approval, non-mutating preflight proof, target validation
- npm run test:exports requires explicit human approval, non-mutating preflight proof, target validation
- npm run test:google-hosted requires explicit human approval, non-mutating preflight proof, target validation
- npm run test:report-all-progress requires explicit human approval, non-mutating preflight proof, target validation

## Proposed Proof Rules
- build_ready: require local_command_output, target_repo_cwd (package.json scripts)
- tests_passed: require local_command_output, target_repo_cwd (package.json scripts)
- visual_ready: require rendered_screenshot, visual_checklist (workspace/config/script detection)
- publish_sync_deploy_ready: require human_approval, non_mutating_preflight, target_validation (risky package script detection)
- data_pipeline_ready: require schema_or_fixture_validation, quality_command_output (data script/path detection)
- gold_fixture_update: require source_truth_reference, separate_human_approval, validation_command_output (gold/fixture script or path detection)
- repo_identity: require target_repo_cwd, matching_repo_path, matching_worktree_fingerprint (generic STAX sidecar rule)

## Unknowns
- No unknowns recorded.

## Decision Needed
Approve this proof surface, edit it, or keep it candidate-only.
