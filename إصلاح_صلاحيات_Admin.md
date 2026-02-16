# إصلاح صلاحيات Admin ✅

## المشكلة
```
FirebaseError: Missing or insufficient permissions
```

عند محاولة إضافة تخصص جديد في لوحة تحكم الإدارة.

## السبب
المستخدم الحالي ليس لديه `role: 'admin'` في مجموعة `users` في Firestore.

## الحل

### الطريقة 1: استخدام السكريبت (موصى به)

1. **تشغيل السكريبت:**
```bash
npx tsx scripts/makeAdmin.ts
```

2. **بيانات الدخول الافتراضية:**
- البريد الإلكتروني: `admin@doctor.com`
- كلمة المرور: `Admin@123456`

3. **تسجيل الدخول:**
- اذهب إلى `/admin/login`
- استخدم البيانات أعلاه
- ⚠️ غيّر كلمة المرور بعد أول تسجيل دخول

### الطريقة 2: يدوياً من Firebase Console

1. **افتح Firebase Console:**
   - اذهب إلى: https://console.firebase.google.com/project/doctor-20c9d/firestore

2. **ابحث عن المستخدم:**
   - افتح مجموعة `users`
   - ابحث عن المستخدم الذي تريد جعله admin

3. **عدّل الحقل:**
   - افتح وثيقة المستخدم
   - أضف أو عدّل حقل `role`
   - اجعل القيمة: `admin`
   - احفظ التغييرات

4. **سجّل الخروج والدخول:**
   - سجّل خروج من التطبيق
   - سجّل دخول مرة أخرى
   - الآن يجب أن تعمل الصلاحيات

### الطريقة 3: إنشاء Admin جديد من الكود

إذا كنت تريد إنشاء admin من داخل التطبيق:

```typescript
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

// بعد إنشاء المستخدم
await setDoc(doc(db, 'users', userId), {
  uid: userId,
  email: 'admin@example.com',
  name: 'Admin Name',
  displayName: 'Admin Name',
  role: 'admin', // ← المهم
  createdAt: new Date(),
  language: 'ar',
});
```

## التحقق من الصلاحيات

### 1. تحقق من وثيقة المستخدم:
```javascript
// في Firebase Console
users/{userId}
{
  uid: "...",
  email: "admin@doctor.com",
  role: "admin", // ← يجب أن تكون "admin"
  name: "...",
  ...
}
```

### 2. تحقق من قواعد Firestore:
```javascript
function isAdmin() {
  return isSignedIn() && 
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### 3. اختبر الصلاحيات:
- ✅ يمكن إضافة تخصص جديد
- ✅ يمكن إضافة طبيب جديد
- ✅ يمكن الموافقة على طلبات الأطباء
- ✅ يمكن تعديل الإعدادات

## قواعد Firestore للتخصصات

```javascript
// Specializations - PUBLIC READ
match /specializations/{specId} {
  allow read: if true; // الجميع يمكنهم القراءة
  allow write: if isAdmin(); // فقط Admin يمكنه الكتابة
}
```

## الصلاحيات المطلوبة للـ Admin

| العملية | الصلاحية |
|---------|----------|
| إضافة تخصص | ✅ Admin فقط |
| إضافة طبيب | ✅ Admin فقط |
| الموافقة على طلبات | ✅ Admin فقط |
| تعديل الإعدادات | ✅ Admin فقط |
| عرض طلبات الأطباء | ✅ Admin فقط |
| تعديل معلومات الأطباء | ✅ Admin فقط |

## استكشاف الأخطاء

### الخطأ: "Missing or insufficient permissions"

**الأسباب المحتملة:**
1. ❌ المستخدم ليس لديه `role: 'admin'`
2. ❌ لم يتم تسجيل الدخول
3. ❌ قواعد Firestore لم يتم نشرها
4. ❌ المستخدم لا يوجد في مجموعة `users`

**الحلول:**
1. ✅ تأكد من وجود `role: 'admin'` في وثيقة المستخدم
2. ✅ سجّل خروج ودخول مرة أخرى
3. ✅ انشر قواعد Firestore: `firebase deploy --only firestore:rules`
4. ✅ تأكد من وجود وثيقة المستخدم في `users/{uid}`

### الخطأ: "User not found"

**الحل:**
```typescript
// أنشئ وثيقة المستخدم
await setDoc(doc(db, 'users', auth.currentUser.uid), {
  uid: auth.currentUser.uid,
  email: auth.currentUser.email,
  role: 'admin',
  name: 'Admin',
  displayName: 'Admin',
  createdAt: new Date(),
  language: 'ar',
});
```

## ملفات السكريبت

### `scripts/makeAdmin.ts`
سكريبت لإنشاء أو تحديث مستخدم admin.

**الاستخدام:**
```bash
npx tsx scripts/makeAdmin.ts
```

**ما يفعله:**
1. يحاول إنشاء مستخدم جديد بالبريد `admin@doctor.com`
2. إذا كان موجوداً، يسجل دخول ويحدث الصلاحيات
3. يضيف أو يحدث `role: 'admin'` في Firestore
4. يعرض بيانات الدخول

## الأمان

⚠️ **مهم:**
1. غيّر كلمة المرور الافتراضية فوراً
2. لا تشارك بيانات الدخول
3. استخدم كلمة مرور قوية
4. فعّل المصادقة الثنائية (2FA) إن أمكن

## الخطوات التالية

1. ✅ شغّل السكريبت أو عدّل يدوياً
2. ✅ سجّل دخول كـ admin
3. ✅ اختبر إضافة تخصص
4. ✅ اختبر باقي الصلاحيات
5. ✅ غيّر كلمة المرور

---

**الحالة:** ✅ الحل جاهز
**التاريخ:** 2024
