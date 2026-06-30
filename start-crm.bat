@echo off
cd /d "%~dp0"
echo Kroma CRM local
echo.
echo Serveur : http://localhost:3000/#dashboard
echo Ferme cette fenetre pour arreter le CRM.
echo.
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:3000/#dashboard'"
node server.js
pause
