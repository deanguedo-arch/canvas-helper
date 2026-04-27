@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
set "EXPORT_DIR=%ROOT_DIR%projects\worldreligions30-option1\exports\google-hosted"
set "META_FIREBASE_CONFIG=%ROOT_DIR%projects\worldreligions30-option1\meta\google-hosted.firebase-config.json"
set "META_FIREBASERC=%ROOT_DIR%projects\worldreligions30-option1\meta\google-hosted.firebaserc"
cd /d "%ROOT_DIR%"

echo [1/2] Exporting Google Hosted bundle for "worldreligions30-option1"...
call npm.cmd run export:google-hosted -- --project worldreligions30-option1
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

echo [2/2] Deploying "worldreligions30-option1" to Firebase Hosting...
call npm.cmd run deploy:google-hosted -- --project worldreligions30-option1
if errorlevel 1 (
  echo Deploy failed.
  endlocal
  exit /b 1
)

echo Publish complete for "worldreligions30-option1".
endlocal
exit /b 0
