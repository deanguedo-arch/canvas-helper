@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo [1/2] Exporting Google Hosted bundle for "forensicstudiesoption2"...
call npm.cmd run export:google-hosted -- --project forensicstudiesoption2
if errorlevel 1 (
  echo Export failed.
  endlocal
  exit /b 1
)

echo [2/2] Deploying "forensicstudiesoption2" to Firebase Hosting...
call npm.cmd run deploy:google-hosted -- --project forensicstudiesoption2
if errorlevel 1 (
  echo Deploy failed.
  endlocal
  exit /b 1
)

echo Publish complete for "forensicstudiesoption2".
endlocal
exit /b 0
