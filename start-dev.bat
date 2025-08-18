@echo off
echo Starting Facility Hub Development Server...
echo.

REM Add Node.js to PATH for this session
set PATH=C:\Program Files\nodejs;%PATH%

REM Change to project directory
cd /d E:\Website

REM Start development server using npx next directly
"C:\Program Files\nodejs\npx.cmd" next dev

pause
