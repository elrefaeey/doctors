# Firestore Indexes Required

## المشكلة
بعض الاستعلامات تحتاج إلى indexes في Firestore. هذه الـ indexes مطلوبة لتحسين الأداء.

## الحل السريع ⚡

### الطريقة الأولى: استخدام الروابط المباشرة
عند ظهور الخطأ في Console، اضغط على الرابط المعطى لإنشاء الـ index تلقائياً.

### الطريقة الثانية: إنشاء يدوي

اذهب إلى Firebase Console:
https://console.firebase.google.com/project/doctor-20c9d/firestore/indexes

## الـ Indexes المطلوبة

### 1. Reviews Index
**Collection**: `reviews`
**Fields**:
- `doctorId` (Ascending)
- `createdAt` (Descending)

### 2. Notifications Index
**Collection**: `notifications`
**Fields**:
- `userId` (Ascending)
- `createdAt` (Descending)

### 3. Appointments Index (Optional - تم تعطيله في الكود)
**Collection**: `appointments`
**Fields**:
- `doctorId` (Ascending)
- `date` (Descending)

## كيفية إنشاء Index يدوياً

1. اذهب إلى Firebase Console
2. اختر Firestore Database
3. اضغط على Indexes
4. اضغط على "Create Index"
5. اختر Collection
6. أضف Fields حسب الجدول أعلاه
7. اضغط Create

## ملاحظات مهمة

### تم تعطيل بعض الـ Indexes
لتجنب مشاكل الـ indexes، تم تعديل الكود ليستخدم:
- ✅ استعلامات بسيطة بدون `orderBy`
- ✅ ترتيب البيانات في الذاكرة (in-memory sorting)
- ✅ إرجاع مصفوفة فارغة عند الخطأ بدلاً من throw error

### الاستعلامات المعدلة:
1. `getAppointmentsByPatient` - بدون orderBy
2. `getAppointmentsByDoctor` - بدون orderBy
3. `getAllAppointments` - بدون orderBy

## التحقق من عمل الـ Indexes

بعد إنشاء الـ indexes:
1. انتظر 2-5 دقائق حتى يتم بناء الـ index
2. أعد تحميل الصفحة
3. تحقق من Console - يجب ألا تظهر أخطاء indexes

## الأخطاء الشائعة

### Error: The query requires an index
**الحل**: اضغط على الرابط في رسالة الخطأ لإنشاء الـ index

### Error: Index is still building
**الحل**: انتظر بضع دقائق حتى ينتهي بناء الـ index

### Error: Permission denied
**الحل**: تحقق من Firestore Rules

## التاريخ
تم التوثيق: 14 فبراير 2026
