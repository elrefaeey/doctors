# Quick Admin Setup Guide

## Problem
`FirebaseError: Missing or insufficient permissions` when trying to add specializations or perform admin actions.

## Solution

### Option 1: Run the Script (Recommended)

```bash
npm run make-admin
```

This will:
- Create or update an admin user
- Email: `admin@doctor.com`
- Password: `Admin@123456`

### Option 2: Manual Setup via Firebase Console

1. Go to: https://console.firebase.google.com/project/doctor-20c9d/firestore
2. Open `users` collection
3. Find your user document
4. Add/Edit field: `role` = `admin`
5. Save changes
6. Logout and login again

## Test Admin Access

After setup, you should be able to:
- ✅ Add new specializations
- ✅ Add new doctors
- ✅ Approve doctor requests
- ✅ Modify platform settings

## Important

⚠️ Change the default password after first login!

## Troubleshooting

If still getting permission errors:
1. Logout and login again
2. Check user document has `role: "admin"`
3. Deploy Firestore rules: `firebase deploy --only firestore:rules`
4. Clear browser cache

---

**Status:** ✅ Ready to use
