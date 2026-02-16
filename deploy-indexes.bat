@echo off
echo Deploying Firestore Indexes...
firebase deploy --only firestore:indexes
echo.
echo Done!
pause
