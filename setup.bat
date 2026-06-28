@echo off
REM SVG Studio - One-time Setup Script for Windows

echo ================================
echo SVG Studio Setup
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version and run this script again.
    pause
    exit /b 1
)

echo [OK] Node.js found
node -v
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env >nul
    echo [OK] .env file created
    echo.
)

REM Install dependencies
echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [OK] Dependencies installed
echo.

REM Setup database
echo Setting up database...
call npm run db:migrate
call npm run db:seed

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to setup database
    pause
    exit /b 1
)

echo [OK] Database ready with 80 SVG shapes
echo.

echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next steps:
echo 1. Double-click 'start-server.bat' to start the backend
echo 2. Open Figma Desktop App
echo 3. Go to: Plugins -^> Development -^> Import plugin from manifest
echo 4. Select the 'manifest.json' file from this folder
echo 5. Run SVG Studio from Plugins menu
echo.
pause
