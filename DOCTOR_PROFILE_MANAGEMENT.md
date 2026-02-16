# نظام إدارة ملف الطبيب الشخصي

## الميزات المضافة

### 1. صفحة إعدادات الطبيب (`/doctor/settings`)
صفحة شاملة تسمح للطبيب بإدارة حسابه بالكامل:

#### رفع الصورة الشخصية
- رفع صورة من الجهاز إلى Firebase Storage
- معاينة الصورة قبل الحفظ
- دعم JPG, PNG, GIF

#### تعديل المعلومات الأساسية
- الاسم بالعربية والإنجليزية
- التخصص (قائمة منسدلة)
- رقم الهاتف
- عنوان العيادة
- سعر الكشف
- سنوات الخبرة
- نبذة عن الطبيب

#### إدارة مواعيد العمل
- تحديد أيام العمل (الأحد - السبت)
- تحديد ساعات العمل لكل يوم
- تفعيل/تعطيل أيام محددة

#### طلب ترقية الاشتراك
- عرض الاشتراك الحالي
- زر لطلب الترقية
- يتم إرسال الطلب للأدمن للموافقة

### 2. تحديثات لوحة التحكم
- زر "تحديث الملف" في البانر العلوي
- تحسين عرض الملف الشخصي في قسم Profile
- عرض الصورة الشخصية والإحصائيات
- زر للانتقال لصفحة الإعدادات

### 3. الصلاحيات والأمان

#### Firestore Rules
```
- الأطباء يمكنهم تحديث ملفاتهم الشخصية
- القراءة عامة للبحث
- الحذف للأدمن فقط
```

#### Storage Rules
```
- الأطباء يمكنهم رفع صور في مجلد doctors/{doctorId}/
- القراءة عامة للصور
- الكتابة للطبيب صاحب الملف أو الأدمن
```

## الملفات المضافة/المعدلة

### ملفات جديدة
1. `src/pages/DoctorSettings.tsx` - صفحة إعدادات الطبيب
2. `storage.rules` - قواعد Firebase Storage
3. `deploy-rules.bat` - سكريبت نشر القواعد
4. `deploy-storage-rules.bat` - سكريبت نشر قواعد Storage

### ملفات معدلة
1. `src/App.tsx` - إضافة route للإعدادات
2. `src/pages/DoctorDashboard.tsx` - إضافة زر الإعدادات
3. `firestore.rules` - تحديث صلاحيات الأطباء

## خطوات النشر

### 1. نشر القواعد (Firestore + Storage)
```bash
# Windows
deploy-rules.bat

# أو يدوياً
firebase deploy --only firestore:rules,storage
```

### 2. نشر الموقع
```bash
npm run build
firebase deploy --only hosting
```

## كيفية الاستخدام

### للطبيب:
1. تسجيل الدخول إلى لوحة التحكم
2. الضغط على "تعديل الملف الشخصي" أو الذهاب لقسم "الملف الشخصي"
3. تحديث المعلومات المطلوبة
4. رفع صورة شخصية (اختياري)
5. تحديد مواعيد العمل
6. الضغط على "حفظ التعديلات"

### طلب ترقية الاشتراك:
1. في صفحة الإعدادات، قسم "الاشتراك الحالي"
2. الضغط على "طلب ترقية"
3. يتم إرسال الطلب للأدمن
4. الأدمن يوافق/يرفض من لوحة التحكم

## التخصصات المتاحة
- طب الأسنان
- طب الأطفال
- الجراحة العامة
- طب العيون
- طب الأنف والأذن والحنجرة
- طب القلب
- طب الجلدية
- طب النساء والتوليد
- طب العظام
- الطب النفسي

## البيانات المحفوظة في Firestore

### مجموعة `doctors`
```javascript
{
  displayName: string,
  nameAr: string,
  specialization: string,
  phone: string,
  clinicAddress: string,
  bio: string,
  consultationPrice: number,
  experience: number,
  photoURL: string,
  workingHours: {
    sunday: { enabled: boolean, start: string, end: string },
    monday: { enabled: boolean, start: string, end: string },
    // ... باقي الأيام
  },
  updatedAt: timestamp
}
```

### مجموعة `subscriptionRequests`
```javascript
{
  doctorId: string,
  doctorName: string,
  currentLevel: string,
  targetLevel: string,
  status: 'pending' | 'approved' | 'rejected',
  createdAt: timestamp
}
```

## Firebase Storage Structure
```
doctors/
  {doctorId}/
    profile.jpg
```

## ملاحظات مهمة

1. **الصور**: يتم رفع الصور إلى Firebase Storage وحفظ الرابط في Firestore
2. **التحديثات**: يتم تحديث كل من `doctors` و `users` collections
3. **الصلاحيات**: الطبيب يمكنه فقط تعديل ملفه الشخصي
4. **طلبات الترقية**: تذهب للأدمن للموافقة
5. **مواعيد العمل**: يتم حفظها كـ object في Firestore

## الدعم والمساعدة

إذا واجهت أي مشاكل:
1. تأكد من نشر القواعد بنجاح
2. تحقق من صلاحيات Firebase Storage
3. راجع console للأخطاء
4. تأكد من تسجيل الدخول كطبيب
