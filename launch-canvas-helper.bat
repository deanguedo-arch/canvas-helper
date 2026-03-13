@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

set "STUDIO_HOST=127.0.0.1"
set "STUDIO_PORT="
set "STUDIO_URL="
set "NPM_CMD="
if /I "%~1"=="watch" goto watch_only
if /I "%~1"=="refresh" goto refresh_only
if /I "%~1"=="studio" goto studio_only
if /I "%~1"=="help" goto show_help
if /I "%~1"=="--help" goto show_help
if /I "%~1"=="-h" goto show_help

:studio_only
call :ensure_deps || goto failed
call :warn_if_no_projects
call :resolve_studio_port || goto failed
call :open_studio_when_ready
echo.
echo ==============================================
echo   Canvas Helper Launcher
echo ==============================================
echo.
if defined LEARNER_MODE (
  echo Learner Mode override: %LEARNER_MODE%
) else (
  echo Learner Mode: repo/project policy
)
echo Studio URL: %STUDIO_URL%
echo.
echo Starting stable Studio session...
call "%NPM_CMD%" run studio -- --host "%STUDIO_HOST%" --port "%STUDIO_PORT%"
goto end

:refresh_only
call :ensure_deps || goto failed
echo.
echo Refreshing incoming and resources once...
call "%NPM_CMD%" run incoming:refresh
goto end

:watch_only
call :ensure_deps || goto failed
echo.
echo Starting incoming watcher (optional mode)...
call "%NPM_CMD%" run watch:incoming
goto end

:show_help
echo.
echo Usage:
echo   launch-canvas-helper.bat             Start Studio only (default)
echo   launch-canvas-helper.bat studio      Start Studio only
echo   launch-canvas-helper.bat refresh     Run one intake refresh and exit
echo   launch-canvas-helper.bat watch       Run incoming watcher only
echo.
goto end

:ensure_deps
call :ensure_layout || exit /b 1
call :resolve_node || exit /b 1
if exist "node_modules\" goto deps_ok
echo.
echo Installing dependencies first (node_modules missing)...
call "%NPM_CMD%" install || exit /b 1
:deps_ok
echo.
echo Normalizing project layout...
call "%NPM_CMD%" run migrate:projects || exit /b 1
exit /b 0

:ensure_layout
if not exist "projects" mkdir "projects"
if not exist "projects\incoming" mkdir "projects\incoming"
if not exist "projects\processed" mkdir "projects\processed"
if not exist "projects\resources" mkdir "projects\resources"
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
  if /I not "%%~nxD"=="incoming" if /I not "%%~nxD"=="processed" if /I not "%%~nxD"=="resources" set "HAS_PROJECTS=1"
)

if defined HAS_PROJECTS exit /b 0

echo.
echo No imported projects were found under projects\.
echo Drop a folder into projects\incoming\ and run `launch-canvas-helper.bat refresh`.
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
goto end

:end
endlocal
