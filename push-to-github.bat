@echo off
echo Pushing to GitHub...
echo.
echo If this fails, please use one of these alternatives:
echo 1. GitHub Desktop (recommended)
echo 2. GitHub CLI: gh repo create elrefaeey/doctor --public --source=. --push
echo 3. Try SSH instead of HTTPS
echo.
pause

git config http.postBuffer 524288000
git config http.version HTTP/1.1
git config --global core.compression 0

echo Attempting push...
git push origin clean-main:main --force --progress

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Push failed. Please try:
    echo 1. Install GitHub Desktop from: https://desktop.github.com/
    echo 2. Or install GitHub CLI from: https://cli.github.com/
    echo.
    pause
)
