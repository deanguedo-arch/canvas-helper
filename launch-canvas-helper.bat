@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

set "STUDIO_HOST=127.0.0.1"
set "STUDIO_PORT="
set "STUDIO_URL="

:menu
cls
echo ==============================================
echo   Canvas Helper Launcher
echo ==============================================
echo.
echo   1. Studio + Auto Import Watcher (Recommended)
echo   2. Import Once + Studio + Auto Import Watcher
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
call :resolve_studio_port || goto failed
call :open_studio_when_ready
echo.
echo Starting studio with incoming watcher on %STUDIO_URL%...
call npm.cmd run studio:auto -- --host "%STUDIO_HOST%" --port "%STUDIO_PORT%"
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

call :resolve_studio_port || goto failed
call :open_studio_when_ready
echo.
echo Starting studio with incoming watcher on %STUDIO_URL%...
call npm.cmd run studio:auto -- --host "%STUDIO_HOST%" --port "%STUDIO_PORT%"
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

:resolve_studio_port
set "STUDIO_PORT="
for /f %%I in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "$ports = 5173..5193; foreach ($port in $ports) { if (-not (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)) { Write-Output $port; exit 0 } }; exit 1"') do set "STUDIO_PORT=%%I"
if not defined STUDIO_PORT (
  echo.
  echo Could not find a free Studio port between 5173 and 5193.
  exit /b 1
)
set "STUDIO_URL=http://%STUDIO_HOST%:%STUDIO_PORT%"
exit /b 0

:open_studio_when_ready
start "" powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command "$url='%STUDIO_URL%'; for ($i = 0; $i -lt 120; $i++) { try { $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1; if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { Start-Process $url; exit 0 } } catch {}; Start-Sleep -Milliseconds 500 }; Start-Process $url"
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
