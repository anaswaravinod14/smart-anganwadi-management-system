@echo off
title SAMS - Django Backend Server
cd /d "%~dp0smart_anganwadi\backend"
if exist "env\Scripts\activate.bat" (
    call env\Scripts\activate.bat
)
echo ====================================================
echo Starting Smart Anganwadi Django Backend on port 8000
echo ====================================================
python manage.py runserver 127.0.0.1:8000
pause
