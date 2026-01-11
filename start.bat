@echo off
REM Fashion Design Studio - Startup Script for Windows
REM Double-click this file to start the application

echo.
echo Starting Fashion Design Studio...
echo.

REM Run setup if .env doesn't exist
if not exist ".env" (
    echo Running one-time setup...
    call setup.bat
)

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules\" (
    echo First time setup - installing dependencies...
    echo This will take a few minutes...
    call npm install
    echo.
)

echo Starting the application...
echo.
echo Once started, open your web browser and go to:
echo    http://localhost:3000
echo.
echo Press Ctrl+C to stop the application
echo.

npm run dev

pause
