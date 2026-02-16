# 📋 Subscription Plans Setup Guide

## 🎯 Objective
Add 4 subscription plans through the Admin Dashboard and save them to Firebase.

## 📍 Quick Steps

1. Login as Admin
2. Go to "خطط الاشتراكات" (Subscription Plans)
3. Click "إضافة خطة جديدة" (Add New Plan)
4. Add each plan with the data below
5. Click "حفظ" (Save)

---

## 📦 Plan 1: Basic Plan

```
Arabic Name: الخطة الأساسية
English Name: Basic Plan
Price: 0
Duration: 30 days
Color: #6B7280 (Gray)
Icon: package
Popular: No
```

**Features (Arabic):**
- عرض الملف الشخصي
- معلومات الاتصال الأساسية
- ظهور في نتائج البحث

**Features (English):**
- Profile Display
- Basic Contact Info
- Search Results

---

## 🥈 Plan 2: Silver Plan

```
Arabic Name: الخطة الفضية
English Name: Silver Plan
Price: 499
Duration: 30 days
Color: #C0C0C0 (Silver)
Icon: shield
Popular: No
```

**Features (Arabic):**
- جميع مميزات الخطة الأساسية
- نظام الحجز الإلكتروني
- إدارة المواعيد
- إشعارات الحجوزات
- صفحة ملف شخصي محسّنة

**Features (English):**
- All Basic Features
- Online Booking System
- Appointment Management
- Booking Notifications
- Enhanced Profile Page

---

## 🥇 Plan 3: Gold Plan (POPULAR)

```
Arabic Name: الخطة الذهبية
English Name: Gold Plan
Price: 999
Duration: 30 days
Color: #FFD700 (Gold)
Icon: crown
Popular: YES ✓
```

**Features (Arabic):**
- جميع مميزات الخطة الفضية
- ظهور في الأطباء المميزين
- أولوية في نتائج البحث
- نظام المحادثة مع المرضى
- تقارير وإحصائيات متقدمة
- دعم فني مميز

**Features (English):**
- All Silver Features
- Featured Doctors Section
- Priority in Search Results
- Patient Chat System
- Advanced Reports & Analytics
- Premium Support

---

## 💎 Plan 4: Platinum Plan

```
Arabic Name: الخطة البلاتينية
English Name: Platinum Plan
Price: 1499
Duration: 30 days
Color: #4F46E5 (Premium Blue)
Icon: star
Popular: No
```

**Features (Arabic):**
- جميع مميزات الخطة الذهبية
- ظهور دائم في الصفحة الرئيسية
- شارة "طبيب موثق"
- إعلانات مخصصة
- تحليلات متقدمة للمرضى
- دعم فني على مدار الساعة
- إدارة فريق طبي

**Features (English):**
- All Gold Features
- Homepage Featured Spot
- Verified Doctor Badge
- Custom Advertising
- Advanced Patient Analytics
- 24/7 Premium Support
- Medical Team Management

---

## 🎨 Color Codes

| Plan | Color | Hex Code |
|------|-------|----------|
| Basic | Gray | #6B7280 |
| Silver | Silver | #C0C0C0 |
| Gold | Gold | #FFD700 |
| Platinum | Premium Blue | #4F46E5 |

## 📊 Firebase Structure

Collection: `subscriptionPlans`

```javascript
{
  name: "Gold Plan",
  nameAr: "الخطة الذهبية",
  price: 999,
  duration: 30,
  color: "#FFD700",
  icon: "crown",
  popular: true,
  features: ["All Silver Features", "Featured Doctors Section", ...],
  featuresAr: ["جميع مميزات الخطة الفضية", "ظهور في الأطباء المميزين", ...],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🔄 How It Works

### Subscription Flow:
1. Doctor selects a plan
2. System calculates expiration date:
   ```
   Expiration Date = Subscription Date + Duration (30 days)
   ```
3. Features are activated based on the plan

### Example:
- Subscription Date: March 1, 2024
- Duration: 30 days
- Expiration Date: March 31, 2024

## ✅ Verification Checklist

After adding plans:
- [ ] Basic Plan added
- [ ] Silver Plan added
- [ ] Gold Plan added (marked as popular)
- [ ] Platinum Plan added
- [ ] All plans visible in Firebase Console
- [ ] Prices are correct
- [ ] Duration is 30 days for all
- [ ] Colors are correct
- [ ] Features in both Arabic and English
- [ ] Plans display correctly on website

## 🚀 Next Steps

1. Open Firebase Console
2. Navigate to Firestore Database
3. Check `subscriptionPlans` collection
4. Verify all 4 plans exist
5. Test plan selection on website
6. Verify expiration date calculation

---

**Ready to implement ✅**
