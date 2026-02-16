# Firebase Migration Guide

This guide explains how the application has been transformed to be 100% Firebase-powered with no hardcoded data.

## What Changed

### ❌ Removed
- `src/data/dummy-data.ts` - All hardcoded doctor, appointment, and subscription data
- `src/data/translations.ts` - Hardcoded translations
- All static data arrays and mock data

### ✅ Added
- Dynamic data fetching from Firestore in all pages
- Translation system powered by Firestore
- Database seeding script
- Comprehensive Firestore structure documentation
- Updated security rules

## Setup Instructions

### 1. Firebase Configuration

Your Firebase configuration is already set in `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBYIxl2jeMTQzsPEg7-Zn5KcvJ_mvuOrds",
  authDomain: "doctor-20c9d.firebaseapp.com",
  projectId: "doctor-20c9d",
  storageBucket: "doctor-20c9d.firebasestorage.app",
  messagingSenderId: "182673156937",
  appId: "1:182673156937:web:48a849d6ff02aabaa98898",
  measurementId: "G-41F0NFLVT8"
};
```

### 2. Install Dependencies

Make sure you have tsx installed for running TypeScript scripts:

```bash
npm install -D tsx
```

### 3. Seed the Database

Run the seeding script to populate your Firestore with initial data:

```bash
npm run seed
```

This will create:
- ✅ Specializations (cardiology, dermatology, etc.)
- ✅ Subscription plans (Silver, Gold, Blue Verified)
- ✅ Translations (English and Arabic)

### 4. Update Firestore Security Rules

Copy the security rules from `FIRESTORE_STRUCTURE.md` to your Firebase Console:

1. Go to Firebase Console → Firestore Database → Rules
2. Replace the existing rules with the rules from the documentation
3. Publish the changes

### 5. Create Admin User

Since there's no hardcoded admin, you need to create one manually:

#### Option A: Firebase Console
1. Go to Firebase Console → Authentication
2. Add a new user with email/password
3. Go to Firestore Database → users collection
4. Find the user document (UID matches Auth UID)
5. Set `role: "admin"`

#### Option B: Using Firebase Admin SDK
```javascript
// Create user in Authentication
const userRecord = await admin.auth().createUser({
  email: 'admin@example.com',
  password: 'securePassword123',
  displayName: 'Admin User'
});

// Create user document in Firestore
await admin.firestore().collection('users').doc(userRecord.uid).set({
  uid: userRecord.uid,
  email: 'admin@example.com',
  displayName: 'Admin User',
  role: 'admin',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  language: 'en'
});
```

### 6. Add Doctors

Once you have an admin account:

1. Login as admin at `/admin/login`
2. Go to the Doctors section
3. Click "Add Doctor"
4. Fill in the doctor details
5. The system will create both Authentication and Firestore records

## How It Works Now

### Data Flow

1. **Homepage (`/`)**
   - Fetches doctors from Firestore (`doctors` collection)
   - Fetches specializations from Firestore (`specializations` collection)
   - Displays featured doctors (Gold/Verified subscriptions)
   - If database is empty, sections won't appear

2. **Doctor Search (`/doctors`)**
   - Fetches all doctors from Firestore
   - Fetches specializations for filters
   - Real-time filtering and search
   - Empty state if no doctors exist

3. **Patient Dashboard**
   - Fetches appointments for logged-in patient
   - Displays upcoming and past appointments
   - Empty state if no appointments

4. **Doctor Dashboard**
   - Fetches doctor profile from Firestore
   - Fetches appointments for the doctor
   - Fetches subscription plans
   - Shows statistics based on real data

5. **Admin Dashboard**
   - Fetches all doctors
   - Fetches pending approval requests
   - Fetches subscription plans
   - Can add/edit/delete doctors

### Translations

Translations are now stored in Firestore (`translations` collection) with documents:
- `en` - English translations
- `ar` - Arabic translations

The `LanguageContext` fetches translations on app load and caches them.

### Authentication

All authentication is handled by Firebase Authentication:
- Sign up creates user in Auth + Firestore
- Sign in validates against Firebase Auth
- User roles stored in Firestore `users` collection
- Protected routes check user role from Firestore

## Empty Database Behavior

If your Firestore database is empty:

- ✅ Homepage will show hero section but no doctors or specializations
- ✅ Doctor search will show "No doctors found"
- ✅ Dashboards will show empty states
- ✅ No errors or crashes
- ✅ Admin can still add doctors

This is the expected behavior - the app is fully dynamic and depends entirely on Firebase data.

## Firestore Collections

See `FIRESTORE_STRUCTURE.md` for complete documentation of all collections and their schemas.

### Core Collections:
- `users` - All user accounts
- `doctors` - Doctor profiles
- `appointments` - Appointment bookings
- `pendingRequests` - Doctor update requests
- `subscriptionPlans` - Subscription tiers
- `specializations` - Medical specializations
- `translations` - UI translations
- `notifications` - User notifications
- `reviews` - Doctor reviews

## Testing the Setup

### 1. Verify Seeding
```bash
npm run seed
```
Check Firebase Console to confirm data was created.

### 2. Test Authentication
- Create a test user via signup
- Verify user appears in Authentication and Firestore

### 3. Test Admin Functions
- Login as admin
- Add a test doctor
- Verify doctor appears in search

### 4. Test Patient Flow
- Login as patient
- Search for doctors
- Book an appointment
- Check appointment in dashboard

## Troubleshooting

### "No doctors found"
- Run `npm run seed` to populate specializations
- Use admin dashboard to add doctors
- Check Firestore security rules allow reading doctors collection

### "Translations not loading"
- Verify `translations` collection exists in Firestore
- Check documents `en` and `ar` exist
- Check browser console for errors

### "Permission denied"
- Update Firestore security rules from `FIRESTORE_STRUCTURE.md`
- Verify user is authenticated
- Check user role in Firestore

### "Admin can't add doctors"
- Verify user has `role: "admin"` in Firestore
- Check browser console for errors
- Verify Firebase Admin SDK is not required (using secondary app pattern)

## Production Checklist

Before deploying to production:

- [ ] Run database seeding script
- [ ] Update Firestore security rules
- [ ] Create admin user
- [ ] Add initial doctors
- [ ] Test all user flows (patient, doctor, admin)
- [ ] Verify translations work in both languages
- [ ] Test appointment booking flow
- [ ] Configure Firebase hosting (optional)
- [ ] Set up Firebase Analytics
- [ ] Configure email templates for password reset

## Support

For issues or questions:
1. Check `FIRESTORE_STRUCTURE.md` for database schema
2. Review Firebase Console for data and errors
3. Check browser console for client-side errors
4. Review Firestore security rules

## Summary

Your application is now 100% Firebase-powered:
- ✅ No hardcoded data
- ✅ All content from Firestore
- ✅ Dynamic translations
- ✅ Firebase Authentication
- ✅ Real-time data updates
- ✅ Scalable architecture
- ✅ Empty database = empty website (as required)
