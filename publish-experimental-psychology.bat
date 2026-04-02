@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo [1/2] Exporting Google Hosted bundle for "experimental-psych-30-per-1-a-b-sec-s-202632352"...
call npm.cmd run export:google-hosted -- --project experimental-psych-30-per-1-a-b-sec-s-202632352
if errorlevel 1 (
  echo Export failed.
  endlocal
  exit /b 1
)

echo [2/2] Deploying "experimental-psych-30-per-1-a-b-sec-s-202632352" to Firebase Hosting...
call npm.cmd run deploy:google-hosted -- --project experimental-psych-30-per-1-a-b-sec-s-202632352
if errorlevel 1 (
  echo Deploy failed.
  endlocal
  exit /b 1
)

echo Publish complete for "experimental-psych-30-per-1-a-b-sec-s-202632352".
endlocal
exit /b 0
