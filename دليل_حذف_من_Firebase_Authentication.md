# دليل حذف المستخدمين من Firebase Authentication 🔥

## المشكلة

عند حذف مستخدم من الموقع:
- ✅ يتم حذفه من Firestore (قاعدة البيانات)
- ❌ لا يتم حذفه من Firebase Authentication
- ❌ يظل موجوداً في قائمة المستخدمين في Firebase Console

**النتيجة:** المستخدم يمكنه تسجيل الدخول مرة أخرى!

---

## الحل: Cloud Functions ☁️

تم إنشاء Cloud Function تحذف المستخدم تلقائياً من Firebase Authentication عند حذفه من Firestore.

---

## 📁 الملفات المضافة

### 1. `functions/index.js`
يحتوي على:
- **`deleteUserAuth`**: Function يدوية (اختياري)
- **`onUserDeleted`**: Function تلقائية (تعمل عند حذف user من Firestore)

### 2. `functions/package.json`
يحتوي على dependencies المطلوبة

---

## 🚀 خطوات التفعيل

### الخطوة 1: تثبيت Firebase CLI (إذا لم يكن مثبتاً)

```bash
npm install -g firebase-tools
```

### الخطوة 2: تسجيل الدخول

```bash
firebase login
```

### الخطوة 3: تهيئة Functions (إذا لم تكن مهيأة)

```bash
firebase init functions
```

اختر:
- ✅ JavaScript
- ✅ ESLint (اختياري)
- ✅ Install dependencies

### الخطوة 4: نسخ الملفات

انسخ الملفات التالية إلى مجلد `functions`:
- `functions/index.js`
- `functions/package.json`

### الخطوة 5: تثبيت Dependencies

```bash
cd functions
npm install
cd ..
```

### الخطوة 6: نشر Functions

```bash
firebase deploy --only functions
```

**الانتظار:** قد يستغرق 2-5 دقائق

### الخطوة 7: التحقق

افتح Firebase Console:
1. اذهب إلى **Functions**
2. تأكد من ظهور:
   - `deleteUserAuth`
   - `onUserDeleted`

---

## 🎯 كيف يعمل؟

### السيناريو 1: الحذف التلقائي (الموصى به)

```
1. Admin يحذف مستخدم من الموقع
   ↓
2. يتم حذف user من Firestore
   ↓
3. Cloud Function (onUserDeleted) تُشغل تلقائياً
   ↓
4. تحذف المستخدم من Firebase Authentication
   ↓
5. ✅ تم الحذف الكامل!
```

### السيناريو 2: الحذف اليدوي (اختياري)

إذا أردت استدعاء Function يدوياً:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const deleteUserAuth = httpsCallable(functions, 'deleteUserAuth');

await deleteUserAuth({ userId: 'user-id-here' });
```

---

## 🔒 الأمان

### الحماية المدمجة:

1. **التحقق من تسجيل الدخول:**
   ```javascript
   if (!context.auth) {
     throw new functions.https.HttpsError('unauthenticated');
   }
   ```

2. **التحقق من دور Admin:**
   ```javascript
   if (callerDoc.data().role !== 'admin') {
     throw new functions.https.HttpsError('permission-denied');
   }
   ```

3. **منع حذف الحساب الخاص:**
   ```javascript
   if (userId === callerUid) {
     throw new functions.https.HttpsError('permission-denied');
   }
   ```

---

## 📊 السجلات (Logs)

### عرض السجلات:

```bash
firebase functions:log
```

### ما ستراه:

```
Successfully deleted user xyz123 from Authentication
Auto-deleted user abc456 from Authentication
```

---

## 🧪 الاختبار

### اختبار الحذف:

1. افتح لوحة التحكم
2. اذهب إلى "المستخدمين"
3. احذف مستخدم (ليس حسابك)
4. انتظر 2-3 ثواني
5. افتح Firebase Console → Authentication
6. تحقق من حذف المستخدم

### اختبار متقدم:

```bash
# في terminal
firebase functions:log --only onUserDeleted

# احذف مستخدم من الموقع
# شاهد السجلات في الوقت الفعلي
```

---

## ⚠️ ملاحظات مهمة

### 1. التأخير
- قد يستغرق الحذف من Authentication 1-3 ثواني
- هذا طبيعي (Cloud Functions تحتاج وقت للتشغيل)

### 2. الفشل في الحذف
إذا فشل الحذف من Authentication:
- ✅ لن يؤثر على حذف Firestore
- ✅ يمكن حذفه يدوياً من Firebase Console
- ✅ Function ستحاول مرة أخرى

### 3. المستخدمين القدامى
المستخدمين المحذوفين قبل تفعيل Functions:
- ❌ لن يتم حذفهم تلقائياً
- ✅ يمكن حذفهم يدوياً من Firebase Console

---

## 🛠️ استكشاف الأخطاء

### المشكلة: Function لا تعمل

**الحلول:**
1. تحقق من نشر Functions:
   ```bash
   firebase deploy --only functions
   ```

2. تحقق من السجلات:
   ```bash
   firebase functions:log
   ```

3. تحقق من Firebase Console → Functions

### المشكلة: خطأ في الصلاحيات

**الحلول:**
1. تأكد من تسجيل الدخول كـ Admin
2. تحقق من دور المستخدم في Firestore
3. تحقق من قواعد Firestore

### المشكلة: المستخدم لا يزال موجوداً

**الحلول:**
1. انتظر 5 ثواني وحدث الصفحة
2. تحقق من السجلات
3. احذف يدوياً من Firebase Console

---

## 🔧 الصيانة

### تحديث Function:

1. عدل `functions/index.js`
2. نشر التحديثات:
   ```bash
   firebase deploy --only functions
   ```

### حذف Function:

```bash
firebase functions:delete onUserDeleted
firebase functions:delete deleteUserAuth
```

---

## 💰 التكلفة

### Cloud Functions Pricing:

- **2 مليون استدعاء مجاناً** شهرياً
- بعد ذلك: $0.40 لكل مليون استدعاء

**مثال:**
- 100 مستخدم محذوف شهرياً = 100 استدعاء
- التكلفة: **مجاناً** ✅

---

## 📚 المراجع

- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Delete Users](https://firebase.google.com/docs/auth/admin/manage-users#delete_a_user)

---

## ✅ الخلاصة

بعد تفعيل Cloud Functions:
- ✅ حذف تلقائي من Firestore
- ✅ حذف تلقائي من Authentication
- ✅ آمن ومحمي
- ✅ لا حاجة لتعديل الكود

**كل شيء يعمل تلقائياً!** 🎉

---

## 🚨 حل بديل (بدون Cloud Functions)

إذا لم تستطع استخدام Cloud Functions، يمكنك:

### الحل اليدوي:

1. احذف المستخدم من الموقع
2. افتح Firebase Console
3. اذهب إلى Authentication
4. ابحث عن المستخدم
5. احذفه يدوياً

**عيوب:**
- ❌ يدوي (غير تلقائي)
- ❌ يستغرق وقتاً
- ❌ قد تنسى

**لذلك، Cloud Functions هو الحل الأفضل!** ✅
