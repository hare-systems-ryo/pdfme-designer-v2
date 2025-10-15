@echo off
setlocal enabledelayedexpansion

REM ==== Power Dev Mode ====
@REM # メモリどか食い
set NODE_OPTIONS="--max-old-space-size=32768"
@REM # I/O系の非同期スレッド増やす（Sass/crypto等に効くことがある）
set UV_THREADPOOL_SIZE="64"
@REM # ViteのHMRは通常ポーリング不要（WSL/VM/ネットワークFSは後述）
set CHOKIDAR_USEPOLLING="0"
REM optional: 依存頻繁更新時のみ
REM set VITE_FORCE=true

REM ==== Auto Run ====
set BACKOFF=2
set MAXBACKOFF=10
:loop
if exist stop.nuxt del /q stop.nuxt & goto end
echo [%%date%% %%time%%] Starting Nuxt dev...
call npm run dev

REM --- Free TCP 3000 if stuck (Windows) ---
for /f "tokens=5" %%p in ('netstat -ano ^| find ":3000" ^| find "LISTENING"') do (
  echo Killing PID %%p using :3000
  taskkill /PID %%p /F >nul 2>&1
)

set EXITCODE=!ERRORLEVEL!

REM 正常終了(0)なら抜ける。クラッシュ(非0)なら再起動。
if "!EXITCODE!"=="0" goto end

echo [%%date%% %%time%%] Nuxt crashed (exit=!EXITCODE!). Restarting in !BACKOFF!s...
timeout /t !BACKOFF! >nul

if !BACKOFF! LSS !MAXBACKOFF! set /a BACKOFF+=1
goto loop

:end
echo [%%date%% %%time%%] Stopped (exit=!EXITCODE!).
endlocal

cmd /k
