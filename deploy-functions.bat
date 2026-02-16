@echo off
echo ========================================
echo   نشر Cloud Functions
echo ========================================
echo.

echo [1/5] التحقق من Firebase CLI...
where firebase >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI غير مثبت!
    echo.
    echo يرجى تثبيته أولاً:
    echo npm install -g firebase-tools
    echo.
    pause
    exit /b 1
)
echo ✅ Firebase CLI مثبت

echo.
echo [2/5] التحقق من تسجيل الدخول...
firebase projects:list >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  غير مسجل دخول. جاري تسجيل الدخول...
    firebase login
    if %errorlevel% neq 0 (
        echo ❌ فشل تسجيل الدخول
        pause
        exit /b 1
    )
)
echo ✅ تم تسجيل الدخول

echo.
echo [3/5] التحقق من مجلد functions...
if not exist "functions" (
    echo ⚠️  مجلد functions غير موجود. جاري الإنشاء...
    mkdir functions
    copy /Y functions\index.js functions\index.js >nul 2>nul
    copy /Y functions\package.json functions\package.json >nul 2>nul
)
echo ✅ مجلد functions موجود

echo.
echo [4/5] تثبيت Dependencies...
cd functions
if exist "package.json" (
    echo جاري تثبيت الحزم...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ فشل تثبيت الحزم
        cd ..
        pause
        exit /b 1
    )
    echo ✅ تم تثبيت الحزم
) else (
    echo ❌ ملف package.json غير موجود!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [5/5] نشر Functions على Firebase...
echo ⏳ قد يستغرق هذا 2-5 دقائق...
firebase deploy --only functions
if %errorlevel% neq 0 (
    echo.
    echo ❌ فشل النشر!
    echo.
    echo الحلول المحتملة:
    echo 1. تأكد من اتصالك بالإنترنت
    echo 2. تأكد من صلاحياتك على المشروع
    echo 3. جرب: firebase login --reauth
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ تم النشر بنجاح!
echo ========================================
echo.
echo Functions المنشورة:
echo - onUserDeleted (حذف تلقائي من Authentication)
echo.
echo يمكنك التحقق من:
echo https://console.firebase.google.com
echo.
pause
