@echo off
echo ========================================
echo    FACILITY HUB - GITHUB SETUP
echo ========================================
echo.

REM Check if Git is available
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not available! Please restart PowerShell/CMD after Git installation.
    echo.
    echo 💡 To fix:
    echo    1. Close this window
    echo    2. Open new PowerShell/CMD as Administrator
    echo    3. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ Git is available

REM Check if already a git repository
if exist ".git" (
    echo ℹ️  Git repository already exists
) else (
    echo 📦 Initializing Git repository...
    git init
    if %errorlevel% neq 0 (
        echo ❌ Failed to initialize Git repository
        pause
        exit /b 1
    )
    echo ✅ Git repository initialized
)

REM Check Git config
git config --global user.name >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ⚙️  Git configuration needed
    set /p username="Enter your name: "
    set /p email="Enter your email: "
    git config --global user.name "%username%"
    git config --global user.email "%email%"
    echo ✅ Git configured
)

echo.
echo 📁 Checking files to commit...
git status --porcelain

echo.
echo 🚀 Adding files to Git...
git add .
if %errorlevel% neq 0 (
    echo ❌ Failed to add files
    pause
    exit /b 1
)

echo ✅ Files added

echo.
echo 📝 Creating initial commit...
git commit -m "🎉 Initial commit: Facility Hub v1.0 with Supabase integration"
if %errorlevel% neq 0 (
    echo ❌ Failed to create commit
    pause
    exit /b 1
)

echo ✅ Initial commit created

echo.
echo ========================================
echo     🎉 LOCAL GIT SETUP COMPLETE!
echo ========================================
echo.
echo 🌐 Next steps for GitHub:
echo.
echo 1. Go to: https://github.com/new
echo 2. Repository name: facility-hub
echo 3. Description: 🏢 Modern Facility Management System with Next.js ^& Supabase
echo 4. Choose Public or Private
echo 5. Do NOT add README or .gitignore (we already have them)
echo 6. Click "Create repository"
echo.
echo 7. Then run these commands (replace YOUR_USERNAME):
echo    git remote add origin https://github.com/YOUR_USERNAME/facility-hub.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 📚 Full guide: GITHUB_SETUP_GUIDE.md
echo.
pause
