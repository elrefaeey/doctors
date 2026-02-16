# Quick Start Guide - Firebase-Powered MedBook

This application is now 100% powered by Firebase with zero hardcoded data.

## 🚀 Quick Setup (5 minutes)

### Step 1: Update Firestore Security Rules (CRITICAL - Do This First!)

**This fixes the "Missing or insufficient permissions" error**

1. Go to [Firebase Console - Firestore Rules](https://console.firebase.google.com/project/doctor-20c9d/firestore/rules)
2. Click on the "Rules" tab
3. Copy ALL content from `firestore.rules` file in this project
4. Paste into Firebase Console (replace everything)
5. Click "Publish"

See `FIRESTORE_RULES_SETUP.md` for detailed instructions.

### Step 2: Install Dependencies
### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Seed the Database
### Step 3: Seed the Database
```bash
npm run seed
```

This populates your Firestore with:
- Medical specializations
- Subscription plans
- UI translations (English & Arabic)

### Step 4: Create Admin User

#### Using Firebase Console:
1. Go to Authentication → Add User
2. Email: `admin@medbook.com`
3. Password: (your choice)
4. Go to Firestore → `users` collection
5. Find the user document
6. Add field: `role` = `admin`

### Step 5: Run the App
```bash
npm run dev
```

Visit: `http://localhost:5173`

## 📋 What to Do Next

### As Admin:
1. Login at `/admin/login`
2. Go to "Doctors" section
3. Click "Add Doctor"
4. Fill in doctor details
5. Doctor account is created automatically

### As Patient:
1. Sign up at `/login/patient`
2. Browse doctors at `/doctors`
3. Book appointments
4. View dashboard at `/patient/dashboard`

### As Doctor:
1. Login with credentials created by admin
2. View dashboard at `/doctor/dashboard`
3. Manage appointments
4. Update profile (requires admin approval)

## 🗄️ Database Structure

Your Firestore now has these collections:

- `users` - All user accounts
- `doctors` - Doctor profiles
- `appointments` - Bookings
- `specializations` - Medical specialties
- `subscriptionPlans` - Pricing tiers
- `translations` - UI text (en/ar)
- `pendingRequests` - Profile update requests
- `notifications` - User notifications

## ✅ Verification Checklist

- [ ] Seeding script ran successfully
- [ ] Firestore has data in collections
- [ ] Security rules updated
- [ ] Admin user created
- [ ] Can login as admin
- [ ] Can add doctors via admin panel
- [ ] Doctors appear in search
- [ ] Can create patient account
- [ ] Can book appointments

## 🔧 Troubleshooting

### "No doctors found"
→ Use admin panel to add doctors

### "Permission denied"
→ Update Firestore security rules

### "Translations not loading"
→ Run `npm run seed` again

### "Can't add doctors"
→ Verify user has `role: "admin"` in Firestore

## 📚 Documentation

- `FIRESTORE_STRUCTURE.md` - Complete database schema
- `FIREBASE_MIGRATION_GUIDE.md` - Detailed migration info
- `README.md` - Project overview

## 🎯 Key Features

✅ 100% Firebase-powered
✅ No hardcoded data
✅ Dynamic translations
✅ Real-time updates
✅ Role-based access (Admin/Doctor/Patient)
✅ Bilingual (English/Arabic)
✅ Empty database = empty website (as designed)

## 🔐 Default Firebase Config

```javascript
Project ID: doctor-20c9d
Auth Domain: doctor-20c9d.firebaseapp.com
```

## 💡 Tips

1. **First Admin**: Must be created manually in Firebase Console
2. **Add Doctors**: Use admin dashboard, not console
3. **Translations**: Stored in Firestore, editable via console
4. **Empty State**: If database is empty, website shows empty states
5. **Security**: Always use Firestore security rules in production

## 🚨 Important Notes

- All data comes from Firebase
- No mock data exists in code
- Empty database is expected behavior
- Admin must add initial doctors
- Translations are in Firestore

## Need Help?

Check the detailed guides:
- Setup issues → `FIREBASE_MIGRATION_GUIDE.md`
- Database schema → `FIRESTORE_STRUCTURE.md`
- General info → `README.md`

---

**Ready to go!** 🎉

Your application is now fully dynamic and powered by Firebase.
