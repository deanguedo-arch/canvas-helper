@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

call npm.cmd run deploy:google-hosted

endlocal
