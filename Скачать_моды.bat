@echo off
title Arcanopolis - Download Mods
cd /d "%~dp0"
echo ==============================================
echo   ARCANOPOLIS: download mods
echo   Minecraft 1.20.1 / Forge
echo ==============================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "tools\download_mods.ps1" -NoPause
echo.
pause
