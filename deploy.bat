@echo off
echo ========================================
echo    FACILITY HUB - PRODUCTION DEPLOY
echo ========================================
echo.

echo 🔍 Checking prerequisites...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed! Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js installed

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not available!
    pause
    exit /b 1
)

echo ✅ npm available

echo.
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)

echo ✅ Dependencies installed

echo.
echo 🏗️  Building production version...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Check the errors above.
    pause
    exit /b 1
)

echo ✅ Build successful

echo.
echo ========================================
echo     🎉 DEPLOYMENT READY!
echo ========================================
echo.
echo Your Facility Hub is ready for production!
echo.
echo 🚀 To start the production server:
echo    npm start
echo.
echo 🛠️  To start development server:  
echo    npm run dev
echo.
echo 📊 System Status: http://localhost:3000/test-connection
echo 📋 Main Dashboard: http://localhost:3000/dashboard  
echo.
echo 📚 Documentation:
echo    - README.md: Basic setup
echo    - SETUP.md: Detailed configuration
echo    - SYSTEM_STATUS_REPORT.md: Full system status
echo.
pause
