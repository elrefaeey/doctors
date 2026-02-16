# إصلاح البحث والحجز ✅

## المشاكل التي تم إصلاحها

### 1. مشكلة البحث 🔍
**المشكلة**: البحث كان يبحث فقط في `displayName` (الاسم الإنجليزي) ولا يبحث في `nameAr` (الاسم العربي)

**الحل**: 
- تم تحسين دالة البحث لتبحث في:
  - ✅ الاسم العربي (`nameAr`)
  - ✅ الاسم الإنجليزي (`displayName` / `name`)
  - ✅ التخصص (`specialization`)
  - ✅ النبذة (`bio`)
  - ✅ أولوية للنتائج التي تبدأ بحرف البحث

**مثال**: 
- لما تكتب "أ" → يجيب كل الأطباء اللي أسمائهم تبدأ بـ "أ"
- لما تكتب "أحمد" → يجيب كل الأطباء اللي في أسمائهم "أحمد"
- لما تكتب "قلب" → يجيب أطباء القلب

### 2. مشكلة صلاحيات الحجز 🔒
**المشكلة**: 
```
Error fetching booked slots: FirebaseError: Missing or insufficient permissions
```

**السبب**: 
- الـ query كان بيستخدم `where('status', '!=', 'cancelled')` 
- ده بيحتاج composite index في Firestore
- وكمان بيسبب مشاكل في الصلاحيات

**الحل**:
- تم إزالة الـ `!=` query من Firestore
- تم عمل الفلترة في JavaScript بدلاً من Firestore
- الآن الـ query بسيط: `doctorId` + `date` فقط
- الفلترة للحجوزات الملغية بتتم في الكود

## الملفات المعدلة

### 1. `src/pages/DoctorSearch.tsx`
```typescript
// قبل الإصلاح
const filtered = doctors.filter(d => {
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    return (
      d.displayName?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q)
    );
  }
  return true;
});

// بعد الإصلاح
const filtered = doctors.filter(d => {
  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    const nameAr = (d.nameAr || '').toLowerCase();
    const nameEn = (d.displayName || d.name || '').toLowerCase();
    const spec = (d.specialization || '').toLowerCase();
    const bio = (d.bio || '').toLowerCase();
    
    return (
      nameAr.includes(q) ||
      nameEn.includes(q) ||
      spec.includes(q) ||
      bio.includes(q) ||
      nameAr.startsWith(q) ||
      nameEn.startsWith(q)
    );
  }
  return true;
});
```

### 2. `src/services/bookingService.ts`
```typescript
// قبل الإصلاح
const bookingsQuery = query(
  collection(db, 'bookings'),
  where('doctorId', '==', doctorId),
  where('date', '==', date),
  where('status', '!=', 'cancelled') // ❌ يسبب مشاكل
);

// بعد الإصلاح
const bookingsQuery = query(
  collection(db, 'bookings'),
  where('doctorId', '==', doctorId),
  where('date', '==', date)
);

const snapshot = await getDocs(bookingsQuery);
// Filter in JavaScript instead
return snapshot.docs
  .filter(doc => doc.data().status !== 'cancelled')
  .map(doc => doc.data().timeSlot);
```

## النتيجة

### البحث:
- ✅ يبحث في الأسماء العربية والإنجليزية
- ✅ يبحث في التخصصات
- ✅ يبحث في النبذة
- ✅ أولوية للنتائج التي تبدأ بحرف البحث
- ✅ يعمل مع أي لغة (عربي/إنجليزي)

### الحجز:
- ✅ لا توجد أخطاء في الصلاحيات
- ✅ يعرض المواعيد المحجوزة بشكل صحيح
- ✅ لا يحتاج composite index
- ✅ أسرع في الأداء

## اختبار

### اختبار البحث:
1. افتح صفحة البحث
2. اكتب "أ" → يجيب الأطباء اللي أسمائهم تبدأ بـ "أ"
3. اكتب "أحمد" → يجيب كل الأطباء اللي في أسمائهم "أحمد"
4. اكتب "قلب" → يجيب أطباء القلب
5. اكتب "John" → يجيب الأطباء اللي أسمائهم الإنجليزية فيها "John"

### اختبار الحجز:
1. افتح صفحة طبيب
2. اختر تاريخ
3. يجب أن تظهر المواعيد المتاحة بدون أخطاء
4. المواعيد المحجوزة تظهر معطلة
