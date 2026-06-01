@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
set "PROJECT_DIR=%ROOT_DIR%projects\next-step-simple-ops-webapp"

cd /d "%ROOT_DIR%"

call npm.cmd run verify -- --project next-step-simple-ops-webapp
if errorlevel 1 exit /b %errorlevel%

call npm.cmd run build:studio
if errorlevel 1 exit /b %errorlevel%

cd /d "%PROJECT_DIR%"

call npx.cmd firebase deploy --only hosting:nextstepclassroom --project calm-module-one --non-interactive
if errorlevel 1 exit /b %errorlevel%

echo Published Next Step Simple Ops to https://nextstepclassroom.web.app
endlocal
exit /b 0
