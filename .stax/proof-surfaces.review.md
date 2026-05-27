## Repo Proof Surface Candidate

Repo: canvas-helper
Confidence: high
Status: candidate

## Detected Stack
- html-css
- node
- playwright
- python
- vite

## Detected Proof Commands
- deploy-google-hosted.bat
- deploy-google-hosted.sh
- npm run assessment-map
- npm run assessment:export
- npm run blueprint
- npm run build:course-shell
- npm run build:studio
- npm run deploy:google-hosted
- npm run export:apps-script
- npm run export:brightspace
- npm run export:brightspace:zip
- npm run export:google-hosted
- npm run export:html
- npm run export:scorm
- npm run lesson-packets
- npm run library
- npm run smoke:pipeline
- npm run sync:course-images
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
- publish-ai-course-building-resources.bat
- publish-course-showcase.bat
- publish-experimental-psychology.bat
- publish-experimental-psychology.sh
- publish-forensics.bat
- publish-forensics.sh
- publish-forensics35.bat
- publish-forensics35.sh
- publish-general-psychology.bat
- publish-general-psychology.sh
- publish-learning-strategies-15.bat
- publish-learning-strategies-25.bat
- publish-learning-strategies-35.bat
- publish-learning-strategies.bat
- publish-mental-health-wellness.bat
- publish-sportswellness.bat
- publish-worldreligions30-option1.bat

## Detected Risky Actions
- deploy-google-hosted.bat requires explicit human approval, non-mutating preflight proof, target validation
- deploy-google-hosted.sh requires explicit human approval, non-mutating preflight proof, target validation
- npm run deploy:google-hosted requires explicit human approval, non-mutating preflight proof, target validation
- npm run export:apps-script requires explicit human approval, non-mutating preflight proof, target validation
- npm run export:google-hosted requires explicit human approval, non-mutating preflight proof, target validation
- npm run sync:course-images requires explicit human approval, non-mutating preflight proof, target validation
- publish-ai-course-building-resources.bat requires explicit human approval, non-mutating preflight proof, target validation
- publish-course-showcase.bat requires explicit human approval, non-mutating preflight proof, target validation
- publish-experimental-psychology.bat requires explicit human approval, non-mutating preflight proof, target validation
- publish-experimental-psychology.sh requires explicit human approval, non-mutating preflight proof, target validation
- publish-forensics.bat requires explicit human approval, non-mutating preflight proof, target validation
- publish-forensics.sh requires explicit human approval, non-mutating preflight proof, target validation
- publish-forensics35.bat requires explicit human approval, non-mutating preflight proof, target validation
- publish-forensics35.sh requires explicit human approval, non-mutating preflight proof, target validation
- publish-general-psychology.bat requires explicit human approval, non-mutating preflight proof, target validation
- publish-general-psychology.sh requires explicit human approval, non-mutating preflight proof, target validation
- publish-learning-strategies-15.bat requires explicit human approval, non-mutating preflight proof, target validation
- publish-learning-strategies-25.bat requires explicit human approval, non-mutating preflight proof, target validation
- publish-learning-strategies-35.bat requires explicit human approval, non-mutating preflight proof, target validation
- publish-learning-strategies.bat requires explicit human approval, non-mutating preflight proof, target validation
- publish-mental-health-wellness.bat requires explicit human approval, non-mutating preflight proof, target validation
- publish-sportswellness.bat requires explicit human approval, non-mutating preflight proof, target validation
- publish-worldreligions30-option1.bat requires explicit human approval, non-mutating preflight proof, target validation

## Proposed Proof Rules
- build_ready: require local_command_output, target_repo_cwd (package.json scripts)
- tests_passed: require local_command_output, target_repo_cwd (package.json scripts)
- visual_ready: require rendered_screenshot, visual_checklist (workspace/config/script detection)
- course_deploy_ready: require workspace_source_diff, export_regenerated, stax_collected_deploy_command, live_target_fetch, rendered_screenshot, visual_checklist, target_site_identity (course export/deploy script and visual workspace detection)
- publish_sync_deploy_ready: require human_approval, non_mutating_preflight, target_validation (risky package script detection)
- data_pipeline_ready: require schema_or_fixture_validation, quality_command_output (data script/path detection)
- gold_fixture_update: require source_truth_reference, separate_human_approval, validation_command_output (gold/fixture script or path detection)
- repo_identity: require target_repo_cwd, matching_repo_path, matching_worktree_fingerprint (generic STAX sidecar rule)

## Unknowns
- No unknowns recorded.

## Decision Needed
Approve this proof surface, edit it, or keep it candidate-only.
