@echo off
cd /d "%~dp0"
echo Kroma HQ CRM local
echo.
echo Serveur : http://localhost:3000
echo Ferme cette fenetre pour arreter le CRM.
echo.
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:3000'"
node server.js
pause
