# 🔧 Fix "Missing or insufficient permissions" Error

## The Problem

You're seeing this error in the browser console:
```
Error fetching translations from Firebase: FirebaseError: Missing or insufficient permissions
Error fetching doctors: FirebaseError: Missing or insufficient permissions
Error fetching specializations: FirebaseError: Missing or insufficient permissions
```

## The Solution (2 Minutes)

### Step 1: Open Firebase Console
Go to: https://console.firebase.google.com/project/doctor-20c9d/firestore/rules

### Step 2: Copy the Rules
Open the `firestore.rules` file in this project and copy ALL the content.

### Step 3: Paste in Firebase Console
1. In the Firebase Console, you'll see a text editor
2. Select ALL existing text (Ctrl+A or Cmd+A)
3. Delete it
4. Paste the new rules from `firestore.rules`

### Step 4: Publish
Click the "Publish" button in the top right

### Step 5: Refresh Your App
Go back to your application and refresh the page (F5 or Ctrl+R)

## ✅ Verification

After updating rules, you should see:
- ✅ No error messages in console
- ✅ Homepage loads with content
- ✅ Translations work correctly (not showing keys like "home.heroTitle")

## Why This Happens

By default, Firestore blocks all access for security. The rules we're adding allow:
- **Public read** for doctors, specializations, translations (needed for search)
- **Authenticated access** for appointments and user data
- **Admin only** for management functions

## Still Having Issues?

### Issue: Rules won't publish
**Solution**: Make sure you're logged into the correct Firebase account

### Issue: Still seeing errors after publishing
**Solution**: 
1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Wait 30 seconds for rules to propagate

### Issue: Can't find the Rules tab
**Solution**: 
1. Go to Firebase Console
2. Select project "doctor-20c9d"
3. Click "Firestore Database" in left menu
4. Click "Rules" tab at the top

## Alternative: Use Firebase CLI

If you prefer command line:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

## What's Next?

After fixing permissions:
1. ✅ Rules updated (you just did this!)
2. Run `npm run seed` to add initial data
3. Create admin user in Firebase Console
4. Start using the app

---

**Quick Links:**
- [Firebase Console](https://console.firebase.google.com/project/doctor-20c9d)
- [Firestore Rules](https://console.firebase.google.com/project/doctor-20c9d/firestore/rules)
- [Full Setup Guide](QUICK_START.md)
