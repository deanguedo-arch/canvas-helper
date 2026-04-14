@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

set "GOOGLE_APPLICATION_CREDENTIALS=C:\Users\dean.guedo\Downloads\calm-module-one-firebase-adminsdk-fbsvc-78a77c19c5.json"
set "FIREBASE_PROJECT_ID=calm-module-one"

if not exist "%GOOGLE_APPLICATION_CREDENTIALS%" (
  echo Service account file not found:
  echo %GOOGLE_APPLICATION_CREDENTIALS%
  endlocal
  exit /b 1
)

if not exist "%ROOT_DIR%reports" (
  mkdir "%ROOT_DIR%reports"
)

call npm.cmd run report:all
if errorlevel 1 (
  echo Report export failed.
  endlocal
  exit /b 1
)

echo Progress reports written to "%ROOT_DIR%reports".
endlocal
exit /b 0
