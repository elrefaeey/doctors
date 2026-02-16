@echo off
echo ========================================
echo Deploying Firebase Rules
echo ========================================
echo.
echo This will deploy:
echo - Firestore Rules
echo - Storage Rules
echo.

firebase deploy --only firestore:rules,storage

echo.
echo ========================================
echo Rules Deployment Complete!
echo ========================================
echo.
echo You can now:
echo - Doctors can edit their own profiles
echo - Doctors can upload profile photos
echo - All changes are secured with proper permissions
echo.
pause
