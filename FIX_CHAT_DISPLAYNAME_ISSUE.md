# إصلاح مشكلة displayName في نظام المحادثات

## المشكلة
عند محاولة إرسال رسالة محادثة للطبيب، كان يظهر خطأ:
```
Unsupported field value: undefined (found in field patientName)
```

السبب: حقل `displayName` كان غير موجود أو فارغ في بيانات المستخدم.

## الحل المطبق

### 1. تحديث AuthContext.tsx
- إضافة حقل `displayName` بشكل صريح في `userData`
- التأكد من حفظ كل من `name` و `displayName` عند جلب بيانات المستخدم
- إضافة دعم للتوافق مع الإصدارات القديمة

```typescript
const displayName = data.displayName || data.name || '';
setUserData({
    uid,
    name: displayName,
    displayName: displayName,
    // ... rest of fields
});
```

### 2. تحديث PatientSettings.tsx
- حفظ كل من `name` و `displayName` عند تحديث الملف الشخصي
- إعادة تحميل الصفحة بعد الحفظ لتحديث البيانات في السياق

### 3. التحقق في DoctorProfile.tsx
الكود الحالي يتحقق من وجود `displayName` قبل إرسال الرسالة:
```typescript
if (!userData.displayName) {
    alert('الرجاء تحديث اسمك في الإعدادات أولاً');
    navigate('/patient/settings');
    return;
}
```

## خطوات الإصلاح للمستخدمين الحاليين

### الطريقة 1: من خلال صفحة الإعدادات
1. سجل دخول كمريض
2. اذهب إلى صفحة الإعدادات: `/patient/settings`
3. تأكد من إدخال اسمك الكامل
4. اضغط "حفظ التغييرات"
5. سيتم تحديث الصفحة تلقائياً

### الطريقة 2: تشغيل سكريبت الإصلاح (للمطورين)
إذا كان لديك مستخدمين كثيرين بحاجة للإصلاح:

1. افتح ملف `scripts/fixUserDisplayNames.ts`
2. أضف بيانات Firebase الخاصة بك
3. شغل السكريبت:
```bash
npx ts-node scripts/fixUserDisplayNames.ts
```

السكريبت سيقوم بـ:
- البحث عن جميع المستخدمين الذين ليس لديهم `displayName`
- نسخ القيمة من `name` إلى `displayName` (أو العكس)
- إذا كان كلاهما فارغ، سيستخدم اسم المستخدم من البريد الإلكتروني

### الطريقة 3: الإصلاح اليدوي من Firebase Console
1. افتح Firebase Console
2. اذهب إلى Firestore Database
3. افتح مجموعة `users`
4. لكل مستخدم ليس لديه `displayName`:
   - أضف حقل جديد: `displayName` (string)
   - انسخ القيمة من حقل `name`
   - احفظ التغييرات

## التحقق من نجاح الإصلاح

1. سجل دخول كمريض
2. اذهب إلى صفحة طبيب
3. اضغط "إرسال رسالة"
4. اكتب رسالة واضغط "إرسال"
5. يجب أن تظهر رسالة نجاح: "✅ تم إرسال رسالتك بنجاح!"

## ملاحظات مهمة

- جميع المستخدمين الجدد سيتم حفظ `displayName` تلقائياً عند التسجيل
- المستخدمون الحاليون يحتاجون لتحديث بياناتهم مرة واحدة فقط
- النظام يدعم كل من `name` و `displayName` للتوافق مع الإصدارات القديمة
- إذا لم يكن لدى المستخدم اسم، سيتم توجيهه لصفحة الإعدادات تلقائياً

## الملفات المعدلة

1. `src/contexts/AuthContext.tsx` - إضافة دعم displayName
2. `src/pages/PatientSettings.tsx` - حفظ كل من name و displayName
3. `scripts/fixUserDisplayNames.ts` - سكريبت إصلاح البيانات القديمة
4. `FIX_CHAT_DISPLAYNAME_ISSUE.md` - هذا الملف (التوثيق)

## الخلاصة

✅ تم إصلاح المشكلة بالكامل
✅ المستخدمون الجدد لن يواجهوا هذه المشكلة
✅ المستخدمون الحاليون يمكنهم الإصلاح من صفحة الإعدادات
✅ يوجد سكريبت للإصلاح الجماعي إذا لزم الأمر
