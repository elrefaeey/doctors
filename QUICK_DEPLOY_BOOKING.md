# Quick Deploy - Booking & Chat System

## 🚀 Deploy in 3 Commands

```bash
# 1. Deploy Firestore Rules
firebase deploy --only firestore:rules

# 2. Build Project
npm run build

# 3. Deploy Website
firebase deploy --only hosting
```

## ✅ What's New

### Guest Booking System
- Anyone can book without account
- Dynamic time slots from doctor schedule
- Unique booking number (BK + random)
- Full patient details saved

### Patient Chat System
- Chat button for logged-in patients
- Real-time messaging
- Auto-delete after 7 days
- Secure and private

### Doctor Dashboard
- New "Bookings" section
- View all bookings
- Patient contact info
- Case descriptions

## 📱 Test It

### Test Booking:
1. Open doctor profile (no login)
2. Select date and time
3. Fill form and submit
4. Get booking number

### Test Chat:
1. Login as patient
2. Click "Chat Doctor"
3. Send message
4. Doctor receives it

## 🔧 Optional: Cloud Functions

**Requires Blaze Plan**

```bash
firebase deploy --only functions
```

This enables automatic message deletion after 7 days.

**Without Blaze Plan:** System works fine, but messages won't auto-delete.

## 📂 Files Changed

### New:
- `src/services/bookingService.ts`

### Modified:
- `src/pages/DoctorProfile.tsx`
- `src/pages/DoctorDashboard.tsx`
- `firestore.rules`
- `functions/index.js`

## 🎯 Key Features

✅ No account required for booking
✅ Dynamic time slots
✅ Unique booking numbers
✅ Patient chat (logged-in)
✅ Auto message cleanup
✅ Mobile responsive
✅ All data from Firebase

## 📚 Full Docs

- `BOOKING_SYSTEM_GUIDE.md` - Complete guide
- `دليل_نشر_نظام_الحجز.md` - Arabic guide
- `BOOKING_CHAT_IMPLEMENTATION_SUMMARY.md` - Technical details

---

**Ready to deploy!** 🎉
