@echo off
REM HorarioCentros - Localhost Setup Script for Windows
REM This script sets up everything needed to run the app locally

echo.
echo ====================================
echo  HorarioCentros Localhost Setup
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    echo         Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detected: 
node -v
echo.

REM Install root dependencies
echo [STEP 1/3] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)
echo.

REM Setup server
echo [STEP 2/3] Setting up server...
cd server

if not exist .env (
    echo Creating server .env file from template...
    copy .env.example .env
    echo [OK] Server .env created
) else (
    echo [OK] Server .env already exists
)

echo Installing server dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install server dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

REM Setup client
echo [STEP 3/3] Setting up client...
cd client

if not exist .env (
    echo Creating client .env file from template...
    copy .env.example .env
    echo [OK] Client .env created
) else (
    echo [OK] Client .env already exists
)

echo Installing client dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install client dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo ====================================
echo  Setup Complete!
echo ====================================
echo.
echo Next steps:
echo.
echo   1. Start the development server:
echo      npm run dev
echo.
echo   2. Open your browser:
echo      - Frontend: http://localhost:5173
echo      - Backend API: http://localhost:3000
echo.
echo   3. Default credentials (after registration):
echo      - Admin role will be assigned to first user
echo.
echo Useful commands:
echo   - npm run dev           Run both client and server
echo   - npm run client:dev    Run only client
echo   - npm run server:dev    Run only server
echo   - npm run build         Build for production
echo   - npm test              Run tests
echo.
echo For more details, see QUICKSTART.md
echo.
pause
