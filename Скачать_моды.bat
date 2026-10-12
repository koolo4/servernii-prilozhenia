@echo off
chcp 65001 >nul
title ARCANOPOLIS - Скачать моды
cd /d "%~dp0"
echo ==============================================
echo   ARCANOPOLIS: загрузка модов сборки
echo   Minecraft 1.20.1 / Forge
echo ==============================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "tools\download_mods.ps1" -NoPause
echo.
pause
