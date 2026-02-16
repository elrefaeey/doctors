#!/bin/bash

echo "========================================"
echo "   نشر Cloud Functions"
echo "========================================"
echo ""

echo "[1/5] التحقق من Firebase CLI..."
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI غير مثبت!"
    echo ""
    echo "يرجى تثبيته أولاً:"
    echo "npm install -g firebase-tools"
    echo ""
    exit 1
fi
echo "✅ Firebase CLI مثبت"

echo ""
echo "[2/5] التحقق من تسجيل الدخول..."
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  غير مسجل دخول. جاري تسجيل الدخول..."
    firebase login
    if [ $? -ne 0 ]; then
        echo "❌ فشل تسجيل الدخول"
        exit 1
    fi
fi
echo "✅ تم تسجيل الدخول"

echo ""
echo "[3/5] التحقق من مجلد functions..."
if [ ! -d "functions" ]; then
    echo "⚠️  مجلد functions غير موجود. جاري الإنشاء..."
    mkdir -p functions
fi
echo "✅ مجلد functions موجود"

echo ""
echo "[4/5] تثبيت Dependencies..."
cd functions
if [ -f "package.json" ]; then
    echo "جاري تثبيت الحزم..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ فشل تثبيت الحزم"
        cd ..
        exit 1
    fi
    echo "✅ تم تثبيت الحزم"
else
    echo "❌ ملف package.json غير موجود!"
    cd ..
    exit 1
fi
cd ..

echo ""
echo "[5/5] نشر Functions على Firebase..."
echo "⏳ قد يستغرق هذا 2-5 دقائق..."
firebase deploy --only functions
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ فشل النشر!"
    echo ""
    echo "الحلول المحتملة:"
    echo "1. تأكد من اتصالك بالإنترنت"
    echo "2. تأكد من صلاحياتك على المشروع"
    echo "3. جرب: firebase login --reauth"
    echo ""
    exit 1
fi

echo ""
echo "========================================"
echo "   ✅ تم النشر بنجاح!"
echo "========================================"
echo ""
echo "Functions المنشورة:"
echo "- onUserDeleted (حذف تلقائي من Authentication)"
echo ""
echo "يمكنك التحقق من:"
echo "https://console.firebase.google.com"
echo ""
