@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

call "%ROOT_DIR%publish-learning-strategies-15.bat"
if errorlevel 1 exit /b %errorlevel%

call "%ROOT_DIR%publish-learning-strategies-25.bat"
if errorlevel 1 exit /b %errorlevel%

call "%ROOT_DIR%publish-learning-strategies-35.bat"
if errorlevel 1 exit /b %errorlevel%

echo Published Learning Strategies 15, 25, and 35.
endlocal
exit /b 0
