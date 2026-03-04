@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

set "STUDIO_URL=http://127.0.0.1:5173"

:menu
cls
echo ==============================================
echo   Canvas Helper Launcher
echo ==============================================
echo.
echo   1. Studio only
echo   2. Import + Analyze + Refs + Studio
echo   3. Export Brightspace
echo   4. Exit
echo.
set /p CHOICE=Select an option [1-4]: 

if "%CHOICE%"=="1" goto studio_only
if "%CHOICE%"=="2" goto import_studio
if "%CHOICE%"=="3" goto export_only
if "%CHOICE%"=="4" goto end

echo.
echo Invalid option. Try again.
timeout /t 2 >nul
goto menu

:studio_only
call :ensure_deps || goto failed
start "" "%STUDIO_URL%"
echo.
echo Starting studio server...
call npm.cmd run studio -- --host 127.0.0.1 --port 5173
goto end

:import_studio
call :ensure_deps || goto failed
echo.
set /p IMPORT_SOURCE=Enter source path (html, txt, or folder): 
if "%IMPORT_SOURCE%"=="" (
  echo Source path is required.
  goto pause_return
)
set /p IMPORT_SLUG=Enter project slug: 
if "%IMPORT_SLUG%"=="" (
  echo Project slug is required.
  goto pause_return
)

echo.
echo Running import...
call npm.cmd run import -- "%IMPORT_SOURCE%" --slug "%IMPORT_SLUG%" || goto failed
echo Running analyze...
call npm.cmd run analyze -- --project "%IMPORT_SLUG%" || goto failed
echo Running refs...
call npm.cmd run refs -- --project "%IMPORT_SLUG%" || goto failed

start "" "%STUDIO_URL%"
echo.
echo Starting studio server...
call npm.cmd run studio -- --host 127.0.0.1 --port 5173
goto end

:export_only
call :ensure_deps || goto failed
echo.
set /p EXPORT_SLUG=Enter project slug to export: 
if "%EXPORT_SLUG%"=="" (
  echo Project slug is required.
  goto pause_return
)

echo.
call npm.cmd run export:brightspace -- --project "%EXPORT_SLUG%" || goto failed
echo.
echo Export complete: projects\%EXPORT_SLUG%\exports\brightspace
goto pause_return

:ensure_deps
if exist "node_modules\" goto deps_ok
echo.
echo Installing dependencies first (node_modules missing)...
call npm.cmd install || exit /b 1
:deps_ok
exit /b 0

:failed
echo.
echo Command failed. Review output above.
goto pause_return

:pause_return
echo.
pause
goto menu

:end
endlocal
