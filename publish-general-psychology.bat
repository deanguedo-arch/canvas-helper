@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo [1/2] Exporting Google Hosted bundle for "general-psychology-20-independent-studies-202633108"...
call npm.cmd run export:google-hosted -- --project general-psychology-20-independent-studies-202633108
if errorlevel 1 (
  echo Export failed.
  endlocal
  exit /b 1
)

echo [2/2] Deploying "general-psychology-20-independent-studies-202633108" to Firebase Hosting...
call npm.cmd run deploy:google-hosted -- --project general-psychology-20-independent-studies-202633108
if errorlevel 1 (
  echo Deploy failed.
  endlocal
  exit /b 1
)

echo Publish complete for "general-psychology-20-independent-studies-202633108".
endlocal
exit /b 0
