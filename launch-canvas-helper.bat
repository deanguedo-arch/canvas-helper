@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

set "STUDIO_HOST=127.0.0.1"
set "STUDIO_PORT="
set "STUDIO_URL="
set "NPM_CMD="
set "LEARNER_MODE_DISPLAY=<repo default from config/intelligence.json>"
if defined LEARNER_MODE set "LEARNER_MODE_DISPLAY=%LEARNER_MODE%"
if not defined LEARNER_MODE set "LEARNER_MODE_DISPLAY=collect (safe default)"

if /I "%~1"=="studio" goto studio_only
if /I "%~1"=="import" goto import_studio
if /I "%~1"=="export" goto export_only
if /I "%~1"=="exit" goto end

:menu
cls
echo ==============================================
echo   Canvas Helper Launcher
echo ==============================================
echo.
echo   Learner Mode: %LEARNER_MODE_DISPLAY%
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
call :warn_if_no_projects
call :resolve_studio_port || goto failed
call :open_studio_when_ready
echo.
echo Starting studio with incoming watcher on %STUDIO_URL%...
call "%NPM_CMD%" run studio:auto -- --host "%STUDIO_HOST%" --port "%STUDIO_PORT%"
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
call "%NPM_CMD%" run import -- "%IMPORT_SOURCE%" --slug "%IMPORT_SLUG%" || goto failed

call :resolve_studio_port || goto failed
call :open_studio_when_ready
echo.
echo Starting studio with incoming watcher on %STUDIO_URL%...
call "%NPM_CMD%" run studio:auto -- --host "%STUDIO_HOST%" --port "%STUDIO_PORT%"
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
call "%NPM_CMD%" run export:brightspace -- --project "%EXPORT_SLUG%" || goto failed
echo.
echo Export complete: projects\%EXPORT_SLUG%\exports\brightspace
goto pause_return

:ensure_deps
call :ensure_layout || exit /b 1
call :resolve_node || exit /b 1
if exist "node_modules\" goto deps_ok
echo.
echo Installing dependencies first (node_modules missing)...
call "%NPM_CMD%" install || exit /b 1
:deps_ok
exit /b 0

:ensure_layout
if not exist "projects" mkdir "projects"
if not exist "projects\_incoming" mkdir "projects\_incoming"
if not exist "projects\_incoming\gemini" mkdir "projects\_incoming\gemini"
exit /b 0

:resolve_node
if defined NPM_CMD if exist "%NPM_CMD%" exit /b 0

where npm.cmd >nul 2>nul
if not errorlevel 1 (
  for /f "delims=" %%I in ('where npm.cmd') do (
    set "NPM_CMD=%%~fI"
    exit /b 0
  )
)

if defined NODEJS_HOME if exist "%NODEJS_HOME%\npm.cmd" (
  set "NPM_CMD=%NODEJS_HOME%\npm.cmd"
  set "PATH=%NODEJS_HOME%;%PATH%"
  exit /b 0
)

if exist "%LOCALAPPDATA%\Programs\nodejs\npm.cmd" (
  set "NPM_CMD=%LOCALAPPDATA%\Programs\nodejs\npm.cmd"
  set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
  exit /b 0
)

for /d %%D in ("%LOCALAPPDATA%\Programs\node-v*-win-x64") do (
  if exist "%%~fD\npm.cmd" (
    set "NPM_CMD=%%~fD\npm.cmd"
    set "PATH=%%~fD;%PATH%"
    exit /b 0
  )
)

echo.
echo Node.js / npm was not found.
echo Expected npm.cmd in PATH, NODEJS_HOME, or %%LOCALAPPDATA%%\Programs\nodejs.
exit /b 1

:warn_if_no_projects
set "HAS_PROJECTS="
for /d %%D in ("projects\*") do (
  if /I not "%%~nxD"=="_incoming" set "HAS_PROJECTS=1"
)

if defined HAS_PROJECTS exit /b 0

echo.
echo No imported projects were found under projects\.
echo Use option 2 to import one now, or drop a folder into projects\_incoming\.
echo.
exit /b 0

:resolve_studio_port
set "STUDIO_PORT="
for %%P in (5173 5174 5175 5176 5177 5178 5179 5180 5181 5182 5183 5184 5185 5186 5187 5188 5189 5190 5191 5192 5193) do (
  call :is_port_free %%P && (
    set "STUDIO_PORT=%%P"
    goto studio_port_found
  )
)

echo.
echo Could not find a free Studio port between 5173 and 5193.
exit /b 1

:studio_port_found
set "STUDIO_URL=http://%STUDIO_HOST%:%STUDIO_PORT%"
exit /b 0

:is_port_free
netstat -ano -p tcp | findstr /R /C:":%~1 .*LISTENING" >nul
if errorlevel 1 exit /b 0
exit /b 1

:open_studio_when_ready
start "" "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command "$url='%STUDIO_URL%'; for ($i = 0; $i -lt 120; $i++) { try { $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1; if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { Start-Process $url; exit 0 } } catch {}; Start-Sleep -Milliseconds 500 }; Start-Process $url"
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
