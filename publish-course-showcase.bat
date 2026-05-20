@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
set "EXPORT_DIR=%ROOT_DIR%projects\course-showcase\exports\google-hosted"
set "META_FIREBASE_CONFIG=%ROOT_DIR%projects\course-showcase\meta\google-hosted.firebase-config.json"
set "META_FIREBASERC=%ROOT_DIR%projects\course-showcase\meta\google-hosted.firebaserc"
cd /d "%ROOT_DIR%"

echo [1/2] Exporting Google Hosted bundle for "course-showcase"...
call npm.cmd run export:google-hosted -- --project course-showcase
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

echo [2/2] Deploying "course-showcase" to Firebase Hosting target "courseshowcasenextstep"...
call npm.cmd run deploy:google-hosted -- --project course-showcase
if errorlevel 1 (
  echo Deploy failed.
  endlocal
  exit /b 1
)

echo Publish complete for "course-showcase".
endlocal
exit /b 0
