@echo off
echo ========================================
echo Deploying Firestore Indexes for Chat
echo ========================================
echo.

echo Deploying indexes...
firebase deploy --only firestore:indexes

echo.
echo ========================================
echo Done!
echo ========================================
echo.
echo Please wait 5-15 minutes for indexes to build.
echo Then refresh your app and try the chat page.
echo.
pause
