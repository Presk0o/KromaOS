@echo off
cd /d "%~dp0"
echo KromaOS - Connexion OpenAI locale
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-openai-key.ps1"
