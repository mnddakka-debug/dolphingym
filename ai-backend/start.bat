@echo off
echo ============================================
echo   AI Coach Backend - Keyless GPT Server
echo ============================================
echo.
echo [1/2] Installing required packages...
py -m pip install -U g4f fastapi uvicorn httpx pydantic fake-useragent --quiet
if errorlevel 1 (
    python -m pip install -U g4f fastapi uvicorn httpx pydantic fake-useragent --quiet
)
echo.
echo [2/2] Starting AI server on http://localhost:1337
echo       Keep this window open while using the app!
echo.
py server_g4f.py 2>nul || python server_g4f.py
pause
