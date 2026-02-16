# 🌐 Bilingual Website Implementation Guide

## ✅ Current Status

The website already has a bilingual system in place:
- ✅ LanguageContext implemented
- ✅ RTL/LTR support
- ✅ Translation files (en.json, ar.json)
- ✅ Language switcher in UI

## 🔍 What Needs to Be Done

### Missing Translations Found:

1. **DoctorSettings Page**
   - "الصورة الشخصية" → "Profile Photo"
   - "رابط الصورة" → "Photo URL"
   - "المعلومات الأساسية" → "Basic Information"
   - "مواعيد العمل" → "Working Hours"
   - "مدة الانتظار لكل موعد" → "Appointment Duration"
   - "حدد أيام وساعات العمل" → "Set Working Days and Hours"
   - "الاشتراك الحالي" → "Current Subscription"
   - "حفظ التعديلات" → "Save Changes"

2. **DoctorProfile Page**
   - "عن الطبيب" → "About Doctor"
   - "الخبرة" → "Experience"
   - "حجز موعد" → "Book Appointment"
   - "سعر الكشف" → "Consultation Fee"
   - "وقت الانتظار" → "Waiting Time"
   - "العيادة" → "Clinic"

3. **AdminDashboard**
   - All section titles
   - All button labels
   - All form fields
   - All status messages

4. **FeaturedDoctorsManagement**
   - "الأطباء المميزين في الصفحة الرئيسية"
   - "إضافة طبيب"
   - "تحريك لأعلى"
   - "تحريك لأسفل"

5. **SubscriptionPlans**
   - "خطط الاشتراكات"
   - "إضافة خطة جديدة"
   - Plan names and features

6. **DoctorRequests**
   - "طلبات الأطباء"
   - "موافقة"
   - "رفض"
   - "إرسال عبر واتساب"

## 📋 Translation Keys to Add

### For DoctorSettings:
```json
"doctorSettings": {
  "title": "Account Settings",
  "profilePhoto": "Profile Photo",
  "photoURL": "Photo URL",
  "photoURLPlaceholder": "https://example.com/image.jpg",
  "updatePhoto": "Update",
  "photoURLHint": "Paste image URL from internet",
  "basicInfo": "Basic Information",
  "nameArabic": "Name (Arabic)",
  "nameEnglish": "Name (English)",
  "phone": "Phone Number",
  "clinicAddress": "Clinic Address",
  "consultationPrice": "Consultation Price",
  "experience": "Years of Experience",
  "bioAbout": "About You",
  "bioPlaceholder": "Write a brief about your experience and qualifications...",
  "workingHours": "Working Hours",
  "appointmentDuration": "Appointment Duration",
  "appointmentDurationHint": "Time between each appointment",
  "setWorkingDays": "Set Working Days and Hours",
  "from": "From",
  "to": "To",
  "howItWorks": "How it works:",
  "selectDays": "Select the days you work",
  "setHours": "Set working hours for each day",
  "setDuration": "Set appointment duration",
  "autoGenerate": "System will generate appointments automatically",
  "currentSubscription": "Current Subscription",
  "upgradeAccount": "Upgrade your account for additional features",
  "requestUpgrade": "Request Upgrade",
  "saveChanges": "Save Changes",
  "saving": "Saving...",
  "backToDashboard": "Back to Dashboard"
}
```

### For DoctorProfile:
```json
"doctorProfile": {
  "aboutDoctor": "About Doctor",
  "experience": "Experience",
  "yearsExperience": "years of experience in",
  "bookAppointment": "Book Appointment",
  "consultationFee": "Consultation Fee",
  "waitingTime": "Waiting Time",
  "clinic": "Clinic",
  "selectDate": "Select Date",
  "selectTime": "Select Time",
  "availableSlots": "Available Slots",
  "bookNow": "Book Now",
  "viewProfile": "View Profile",
  "noSlotsAvailable": "No slots available for this day",
  "bookingForm": "Booking Form",
  "patientName": "Patient Name",
  "mobile": "Mobile Number",
  "email": "Email (optional)",
  "caseDescription": "Case Description (optional)",
  "confirmBooking": "Confirm Booking",
  "bookingConfirmed": "Booking Confirmed",
  "bookingNumber": "Booking Number",
  "thankYou": "Thank you for booking"
}
```

### For AdminDashboard:
```json
"adminDashboard": {
  "title": "Admin Dashboard",
  "overview": "Overview",
  "doctors": "Doctors",
  "featuredDoctors": "Featured Doctors",
  "doctorRequests": "Doctor Requests",
  "specializations": "Specializations",
  "approvals": "Approvals",
  "subscriptionRequests": "Subscription Requests",
  "subscriptionPlans": "Subscription Plans",
  "users": "Users",
  "settings": "Settings",
  "totalDoctors": "Total Doctors",
  "totalUsers": "Total Users",
  "totalPatients": "Total Patients",
  "joinRequests": "Join Requests",
  "featuredCount": "Featured Doctors",
  "addDoctor": "Add Doctor",
  "editDoctor": "Edit Doctor",
  "deleteDoctor": "Delete Doctor",
  "confirmDelete": "Are you sure you want to delete?",
  "addSpecialization": "Add Specialization",
  "heroImages": "Hero Images",
  "addImageURL": "Add Image by URL",
  "imageURL": "Image URL",
  "targetLink": "Target Link (optional)",
  "addImage": "Add Image",
  "removeImage": "Remove Image",
  "changeLanguage": "Change Language"
}
```

### For FeaturedDoctors:
```json
"featuredDoctors": {
  "title": "Featured Doctors on Homepage",
  "subtitle": "Arrange doctors by priority",
  "addDoctor": "Add Doctor",
  "count": "Featured Doctors",
  "noFeatured": "No featured doctors yet",
  "clickToAdd": "Click 'Add Doctor' to start",
  "moveUp": "Move Up",
  "moveDown": "Move Down",
  "remove": "Remove",
  "addToFeatured": "Add to Featured List",
  "selectDoctor": "Select a doctor to add to homepage",
  "search": "Search for doctor...",
  "noDoctorsAvailable": "No doctors available to add",
  "close": "Close"
}
```

### For SubscriptionPlans:
```json
"subscriptionPlans": {
  "title": "Subscription Plans",
  "subtitle": "Manage subscription plans for doctors",
  "addPlan": "Add New Plan",
  "editPlan": "Edit Plan",
  "deletePlan": "Delete Plan",
  "confirmDelete": "Are you sure you want to delete this plan?",
  "planName": "Plan Name",
  "nameArabic": "Name (Arabic)",
  "nameEnglish": "Name (English)",
  "price": "Price",
  "duration": "Duration (days)",
  "color": "Color",
  "icon": "Icon",
  "popular": "Popular",
  "features": "Features",
  "featuresArabic": "Features (Arabic)",
  "featuresEnglish": "Features (English)",
  "addFeature": "Add Feature",
  "save": "Save",
  "cancel": "Cancel",
  "totalRevenue": "Total Revenue",
  "activePlans": "Active Plans",
  "mostPopular": "Most Popular Plan"
}
```

### For DoctorRequests:
```json
"doctorRequests": {
  "title": "Doctor Requests",
  "newRequests": "New Requests",
  "approved": "Approved",
  "rejected": "Rejected",
  "fullName": "Full Name",
  "email": "Email",
  "phone": "Phone",
  "specialization": "Specialization",
  "governorate": "Governorate",
  "clinicAddress": "Clinic Address",
  "experience": "Years of Experience",
  "licenseNumber": "License Number",
  "submittedAt": "Submitted At",
  "approve": "Approve",
  "reject": "Reject",
  "sendWhatsApp": "Send via WhatsApp",
  "copyCredentials": "Copy Credentials",
  "viewDetails": "View Details",
  "closeDetails": "Close Details",
  "loginCredentials": "Login Credentials",
  "generatedPassword": "Generated Password",
  "approveSuccess": "Request approved successfully",
  "rejectSuccess": "Request rejected successfully",
  "confirmApprove": "Are you sure you want to approve this request?",
  "confirmReject": "Are you sure you want to reject this request?"
}
```

## 🔧 Implementation Steps

### Step 1: Update Translation Files

Add all missing keys to both `en.json` and `ar.json`.

### Step 2: Replace Hardcoded Text

Search for hardcoded Arabic/English text in:
- `src/pages/*.tsx`
- `src/components/*.tsx`

Replace with `t('key')` calls.

### Step 3: Test Language Switching

1. Switch to Arabic → Check all pages
2. Switch to English → Check all pages
3. Verify RTL/LTR layout
4. Check all buttons, labels, placeholders

### Step 4: Add Missing Components

Ensure all components use `useLanguage()` hook:
```typescript
const { t, language, dir } = useLanguage();
```

## 📝 Example Conversion

### Before (Hardcoded):
```tsx
<h1>الصورة الشخصية</h1>
<button>حفظ التعديلات</button>
```

### After (Translated):
```tsx
const { t } = useLanguage();

<h1>{t('doctorSettings.profilePhoto')}</h1>
<button>{t('doctorSettings.saveChanges')}</button>
```

## ✅ Checklist

- [ ] Add all missing translation keys
- [ ] Update DoctorSettings page
- [ ] Update DoctorProfile page
- [ ] Update AdminDashboard page
- [ ] Update FeaturedDoctorsManagement page
- [ ] Update SubscriptionPlans page
- [ ] Update DoctorRequests page
- [ ] Update all modals and dialogs
- [ ] Update all alerts and notifications
- [ ] Update all form labels and placeholders
- [ ] Test Arabic language
- [ ] Test English language
- [ ] Test RTL layout
- [ ] Test LTR layout
- [ ] Test language persistence
- [ ] Test all pages and components

## 🚀 Priority Pages

1. **High Priority:**
   - DoctorSettings
   - DoctorProfile
   - AdminDashboard
   - Login pages

2. **Medium Priority:**
   - FeaturedDoctorsManagement
   - SubscriptionPlans
   - DoctorRequests

3. **Low Priority:**
   - Footer
   - Modals
   - Notifications

## 📊 Current Coverage

- ✅ Home page: ~80%
- ✅ Login pages: ~90%
- ⚠️ Doctor pages: ~40%
- ⚠️ Admin pages: ~30%
- ✅ Patient pages: ~70%
- ✅ Navigation: ~90%

## 🎯 Goal

**100% bilingual coverage** across the entire website with proper RTL/LTR support.

---

**Note:** This is a comprehensive guide. Implementation will require updating multiple files systematically.
