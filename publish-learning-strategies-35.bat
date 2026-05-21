@echo off
setlocal EnableExtensions

set "PROJECT_SLUG=learning-strategies-35"
set "ROOT_DIR=%~dp0"
set "EXPORT_DIR=%ROOT_DIR%projects\%PROJECT_SLUG%\exports\google-hosted"
set "FIREBASE_CONFIG=%ROOT_DIR%projects\%PROJECT_SLUG%\meta\google-hosted.firebase-config.json"
set "FIREBASERC=%ROOT_DIR%projects\%PROJECT_SLUG%\meta\google-hosted.firebaserc"

cd /d "%ROOT_DIR%"

call npm.cmd run export:google-hosted -- --project %PROJECT_SLUG%
if errorlevel 1 exit /b %errorlevel%

copy /Y "%FIREBASE_CONFIG%" "%EXPORT_DIR%\firebase-config.json" >nul
if errorlevel 1 exit /b %errorlevel%

copy /Y "%FIREBASERC%" "%EXPORT_DIR%\.firebaserc" >nul
if errorlevel 1 exit /b %errorlevel%

call npm.cmd run deploy:google-hosted -- --project %PROJECT_SLUG%
if errorlevel 1 exit /b %errorlevel%

echo Published %PROJECT_SLUG% to https://learningstrategies35.web.app
endlocal
exit /b 0
