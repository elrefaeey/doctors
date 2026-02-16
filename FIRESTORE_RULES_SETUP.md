# Firestore Security Rules Setup

## Quick Fix for Permission Errors

If you're seeing "Missing or insufficient permissions" errors, you need to update your Firestore security rules.

## Option 1: Using Firebase Console (Recommended - 2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/project/doctor-20c9d/firestore/rules)
2. Click on the "Rules" tab
3. Replace ALL existing rules with the content from `firestore.rules` file in this project
4. Click "Publish"

## Option 2: Using Firebase CLI

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firestore (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## What These Rules Do

### Public Read Access (No Authentication Required)
- ✅ `doctors` - Anyone can search and view doctors
- ✅ `specializations` - Anyone can see medical specializations
- ✅ `subscriptionPlans` - Anyone can view pricing plans
- ✅ `translations` - Anyone can access UI translations
- ✅ `reviews` - Anyone can read doctor reviews

### Authenticated Access Required
- 🔐 `users` - Users can read all users, update own profile
- 🔐 `appointments` - Users can only see their own appointments
- 🔐 `notifications` - Users can only see their own notifications

### Admin Only
- 👑 `users` - Delete users
- 👑 `doctors` - Create, update, delete doctors
- 👑 `pendingRequests` - Approve/reject requests
- 👑 `subscriptionPlans` - Manage plans
- 👑 `specializations` - Manage specializations
- 👑 `translations` - Update translations

## Verify Rules Are Working

After updating rules, refresh your application. You should see:
- ✅ No permission errors in console
- ✅ Doctors loading on homepage
- ✅ Specializations displaying
- ✅ Translations working

## Current Rules File Location

The correct rules are in: `firestore.rules`

## Important Notes

1. **Public Read is Safe**: Doctors, specializations, and translations are meant to be public
2. **Write Protection**: Only admins can modify core data
3. **User Privacy**: Users can only access their own appointments and notifications
4. **Admin Role**: First admin must be created manually in Firestore

## Troubleshooting

### Still Getting Permission Errors?

1. **Check Rules Published**: Go to Firebase Console → Firestore → Rules tab
2. **Verify Rules Match**: Compare with `firestore.rules` in this project
3. **Clear Cache**: Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check Collection Names**: Ensure collections exist in Firestore

### Rules Not Deploying?

```bash
# Check Firebase project
firebase projects:list

# Use correct project
firebase use doctor-20c9d

# Deploy again
firebase deploy --only firestore:rules
```

## Security Best Practices

✅ Public read for search functionality
✅ Authentication required for user actions
✅ Role-based access control
✅ Owner-only access for personal data
✅ Admin-only access for management

## Next Steps After Updating Rules

1. ✅ Update Firestore rules (you're doing this now)
2. Run `npm run seed` to populate database
3. Create admin user in Firebase Console
4. Start using the application

---

**Need Help?**

If you're still having issues:
1. Check Firebase Console for error details
2. Verify your Firebase project ID is correct
3. Ensure you're logged into the correct Firebase account
4. Check browser console for specific error messages
