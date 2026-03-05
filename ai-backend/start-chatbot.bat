@echo off
title AI Chat Bot - Starting Services
color 0A

echo ============================================
echo    AI Chat Bot - Keyless GPT Wrapper
echo ============================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed!
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [INFO] Python found.
echo.

:: Check and install requirements
echo [INFO] Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo [WARNING] Some dependencies might have failed to install.
)
echo.

echo [INFO] Starting API Server on port 1337...
echo [INFO] Starting Web Server on port 8080...
echo.
echo ============================================
echo    ACCESS YOUR CHAT BOT AT:
echo    http://localhost:8080
echo ============================================
echo.
echo Press Ctrl+C to stop all servers.
echo.

:: Start API server in background
start /B cmd /c "python server.py"

:: Wait a moment for API to start
timeout /t 3 /nobreak >nul

:: Start web server
cd web
python -m http.server 8080

pause
