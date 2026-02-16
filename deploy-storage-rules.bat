@echo off
echo ========================================
echo Deploying Firebase Storage Rules
echo ========================================
echo.

firebase deploy --only storage

echo.
echo ========================================
echo Storage Rules Deployment Complete!
echo ========================================
pause
