@echo off
REM Windows batch script to stop all Grocery Tracker services

echo.
echo ========================================
echo   Grocery Tracker - Service Shutdown
echo ========================================
echo.

echo Stopping Node.js processes...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Node.js processes stopped successfully
) else (
    echo ℹ️  No Node.js processes were running
)

echo.
echo Checking for processes using port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process %%a on port 3000...
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo Stopping any nodemon processes...
taskkill /f /im nodemon.exe >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Nodemon processes stopped
) else (
    echo ℹ️  No nodemon processes were running
)

echo.
echo Cleaning up any remaining grocery-tracker processes...
wmic process where "commandline like '%%grocery-tracker%%'" delete >nul 2>&1

echo.
echo ========================================
echo   🛑 All Grocery Tracker services stopped
echo ========================================
echo.
echo You can now safely:
echo - Close VS Code
echo - Restart the application
echo - Shutdown your computer
echo.
pause