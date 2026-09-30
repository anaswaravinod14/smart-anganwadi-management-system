@echo off
title SAMS - Launch Full System
echo =========================================================
echo Launching Smart Anganwadi Management System (SAMS)
echo =========================================================
start "SAMS Backend (Django)" cmd /k "%~dp0run_backend.bat"
start "SAMS Frontend (React Vite)" cmd /k "%~dp0run_frontend.bat"
echo Servers are launching in separate windows!
echo Backend:  http://127.0.0.1:8000/
echo Frontend: http://localhost:5173/
echo.
timeout /t 3 >nul
start http://localhost:5173/
exit
