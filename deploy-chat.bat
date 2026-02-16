@echo off
REM Chat System Deployment Script for Windows
REM This script deploys the Firestore security rules for the chat system

echo.
echo ========================================
echo   Chat System Deployment
echo ========================================
echo.

echo Deploying Firestore security rules...
firebase deploy --only firestore:rules

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Deployment Successful!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Test the chat system
    echo 2. Create test accounts if needed
    echo 3. Book and confirm an appointment
    echo 4. Click the chat button
    echo 5. Send messages and verify real-time updates
    echo.
) else (
    echo.
    echo ========================================
    echo   Deployment Failed
    echo ========================================
    echo.
    echo Please check:
    echo 1. Firebase CLI is installed: npm install -g firebase-tools
    echo 2. You are logged in: firebase login
    echo 3. Firebase project is initialized: firebase init
    echo.
)

pause
