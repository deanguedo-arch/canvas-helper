@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
set "LEARNER_MODE=collect"

call "%ROOT_DIR%launch-canvas-helper.bat" studio
