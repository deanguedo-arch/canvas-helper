@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
set "EXPORT_DIR=%ROOT_DIR%projects\mental-health-wellness\exports\google-hosted"
set "META_FIREBASE_CONFIG=%ROOT_DIR%projects\mental-health-wellness\meta\google-hosted.firebase-config.json"
set "META_FIREBASERC=%ROOT_DIR%projects\mental-health-wellness\meta\google-hosted.firebaserc"
cd /d "%ROOT_DIR%"

echo [1/2] Exporting Google Hosted bundle for "mental-health-wellness"...
call npm.cmd run export:google-hosted -- --project mental-health-wellness
if errorlevel 1 (
  echo Export failed.
  endlocal
  exit /b 1
)

copy /Y "%META_FIREBASE_CONFIG%" "%EXPORT_DIR%\firebase-config.json" >nul
if errorlevel 1 (
  echo Failed to copy Firebase config into the hosted export.
  endlocal
  exit /b 1
)

copy /Y "%META_FIREBASERC%" "%EXPORT_DIR%\.firebaserc" >nul
if errorlevel 1 (
  echo Failed to copy Firebase CLI config into the hosted export.
  endlocal
  exit /b 1
)

echo [2/2] Deploying "mental-health-wellness" to Firebase Hosting...
call npm.cmd run deploy:google-hosted -- --project mental-health-wellness
if errorlevel 1 (
  echo Deploy failed.
  endlocal
  exit /b 1
)

echo Publish complete for "mental-health-wellness".
endlocal
exit /b 0
