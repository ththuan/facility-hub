@echo off
echo ========================================
echo       ADDING GIT TO PATH
echo ========================================
echo.

REM Add Git to PATH for current session
set PATH=%PATH%;"C:\Program Files\Git\bin"

REM Test if Git works
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Git is now available in PATH for this session
    git --version
    echo.
    echo 💡 To make this permanent:
    echo 1. Press Win+R, type: sysdm.cpl
    echo 2. Go to Advanced tab ^> Environment Variables
    echo 3. In System Variables, select PATH and click Edit
    echo 4. Add: C:\Program Files\Git\bin
    echo 5. Click OK and restart PowerShell
) else (
    echo ❌ Git still not working. Please check installation.
)

echo.
echo 🚀 You can now use 'git' commands normally in this session
echo.
pause
