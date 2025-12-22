@echo off
REM Windows build script for Alan Mariner Database
REM Run this on your Windows PC to build the installer

echo ========================================
echo Building Alan Mariner Database for Windows
echo ========================================
echo.

echo Step 1: Installing dependencies...
call yarn install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Step 2: Building the application...
call yarn build
if errorlevel 1 (
    echo ERROR: Failed to build application
    pause
    exit /b 1
)
echo.

echo Step 3: Creating Windows installer...
call yarn electron-builder --win --x64
if errorlevel 1 (
    echo ERROR: Failed to create installer
    pause
    exit /b 1
)
echo.

echo ========================================
echo SUCCESS! Installer created in dist-installer/
echo ========================================
echo.

explorer dist-installer
pause
