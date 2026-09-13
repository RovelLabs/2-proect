@echo off
title Складно (Skladno) v0.1.0
cd /d "%~dp0"
node bin\desktop-server.cjs
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Ошибка запуска. Убедитесь, что Node.js установлен (https://nodejs.org).
    pause
)
