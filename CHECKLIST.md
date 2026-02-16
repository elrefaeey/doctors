# ✅ Firebase Integration Checklist

Use this checklist to ensure your Firebase integration is properly set up and working.

---

## 📋 Pre-Setup Checklist

- [ ] Node.js 16+ installed
- [ ] Firebase project created (`doctor-20c9d`)
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Firebase dependencies installed (`npm install firebase` - ✅ Already done!)
- [ ] Code builds successfully (`npm run build` - ✅ Already done!)

---

## 🔥 Firebase Console Setup

### Authentication
- [ ] Go to Firebase Console → Authentication
- [ ] Click "Get started"
- [ ] Go to "Sign-in method" tab
- [ ] Enable "Email/Password"
- [ ] Click "Save"

### Firestore Database
- [ ] Go to Firebase Console → Firestore Database
- [ ] Click "Create database"
- [ ] Select "Start in production mode"
- [ ] Choose location (e.g., `us-central1`)
- [ ] Click "Enable"

### Cloud Messaging (Optional but Recommended)
- [ ] Go to Firebase Console → Cloud Messaging
- [ ] Click "Get started"
- [ ] Under "Web configuration" → Click "Generate key pair"
- [ ] Copy the VAPID key
- [ ] Update `src/services/notificationService.ts` with the VAPID key

### Storage (Optional)
- [ ] Go to Firebase Console → Storage
- [ ] Click "Get started"
- [ ] Start in production mode
- [ ] Click "Done"

---

## 🛡️ Security Rules Deployment

- [ ] Open terminal in project directory
- [ ] Run: `firebase login`
- [ ] Run: `firebase init firestore`
  - [ ] Select "Use an existing project"
  - [ ] Choose `doctor-20c9d`
  - [ ] Accept default `firestore.rules` file
  - [ ] Accept default `firestore.indexes.json` file
- [ ] Run: `firebase deploy --only firestore:rules`
- [ ] Verify rules deployed successfully

---

## 📦 Database Initialization

### Create Subscription Plans

Go to Firestore Console → Start collection → `subscriptionPlans`

#### Document 1: `silver`
- [ ] Document ID: `silver`
- [ ] Add fields:
  ```
  name: "Silver" (string)
  price: 99 (number)
  priorityLevel: 3 (number)
  features: ["Basic profile listing", "Standard search visibility", "Email support"] (array)
  badgeColor: "#C0C0C0" (string)
  description: "Basic plan for new doctors" (string)
  ```

#### Document 2: `gold`
- [ ] Document ID: `gold`
- [ ] Add fields:
  ```
  name: "Gold" (string)
  price: 199 (number)
  priorityLevel: 2 (number)
  features: ["Enhanced profile listing", "Higher search ranking", "Priority support", "Analytics dashboard"] (array)
  badgeColor: "#FFD700" (string)
  description: "Premium plan with better visibility" (string)
  ```

#### Document 3: `blue`
- [ ] Document ID: `blue`
- [ ] Add fields:
  ```
  name: "Blue" (string)
  price: 299 (number)
  priorityLevel: 1 (number)
  features: ["Verified badge", "Top search ranking", "24/7 premium support", "Advanced analytics", "Featured listing"] (array)
  badgeColor: "#1DA1F2" (string)
  description: "Elite verified doctor status" (string)
  ```

---

## 👤 Create Admin User

- [ ] Run the app: `npm run dev`
- [ ] Sign up with your admin email
- [ ] Go to Firestore Console → `users` collection
- [ ] Find your user document (by email)
- [ ] Click the document to edit
- [ ] Change `role` field to: `"admin"`
- [ ] Change `verifiedBadge` field to: `true`
- [ ] Click "Update"
- [ ] Refresh the app and verify admin access

---

## 🧪 Testing Checklist

### Authentication Tests
- [ ] Sign up as Patient
  - [ ] Email/password works
  - [ ] User document created in Firestore
  - [ ] Redirected to patient dashboard
- [ ] Sign up as Doctor
  - [ ] Email/password works
  - [ ] User document created in `users` collection
  - [ ] Doctor document created in `doctors` collection
  - [ ] Redirected to doctor dashboard
- [ ] Sign in with existing account
  - [ ] Login works
  - [ ] Session persists on page reload
  - [ ] Correct dashboard shown based on role
- [ ] Sign out
  - [ ] Logout works
  - [ ] Redirected to login page
  - [ ] Cannot access protected routes

### Protected Routes Tests
- [ ] Try accessing `/admin/dashboard` as patient → Redirected
- [ ] Try accessing `/doctor/dashboard` as patient → Redirected
- [ ] Try accessing `/patient/dashboard` as doctor → Redirected
- [ ] Admin can access all dashboards
- [ ] Unauthenticated users redirected to login

### Doctor Features Tests
- [ ] Doctor can view their profile
- [ ] Doctor can view their appointments
- [ ] Doctor can request profile update
  - [ ] Creates pending request
  - [ ] Does NOT update profile directly
- [ ] Doctor can approve/reject appointments
- [ ] Doctor receives notifications

### Patient Features Tests
- [ ] Patient can search doctors
- [ ] Doctors ranked correctly (Blue → Gold → Silver)
- [ ] Patient can view doctor profiles
- [ ] Patient can book appointment
- [ ] Patient can view their appointments
- [ ] Patient receives notifications

### Admin Features Tests
- [ ] Admin can view all users
- [ ] Admin can view all doctors
- [ ] Admin can view all appointments
- [ ] Admin can view pending requests
- [ ] Admin can approve pending requests
  - [ ] Doctor profile updates
  - [ ] Doctor receives notification
- [ ] Admin can reject pending requests
  - [ ] Doctor receives notification with reason
- [ ] Admin can change doctor subscription
  - [ ] Subscription priority updates
  - [ ] Verified badge updates for Blue plan
- [ ] Admin can delete doctors
- [ ] Admin can send broadcast notifications

### Multi-Language Tests
- [ ] Switch to Arabic
  - [ ] All text translates
  - [ ] Layout switches to RTL
  - [ ] Language preference saved
- [ ] Switch to English
  - [ ] All text translates
  - [ ] Layout switches to LTR
  - [ ] Language preference saved
- [ ] Reload page
  - [ ] Language preference persists

### Real-time Updates Tests
- [ ] Create appointment → Doctor sees it immediately
- [ ] Approve appointment → Patient sees update immediately
- [ ] Create notification → User sees it immediately
- [ ] Update subscription → Changes reflect immediately

### Notification Tests (Optional)
- [ ] Browser asks for notification permission
- [ ] Permission granted
- [ ] Notifications appear when:
  - [ ] New appointment created
  - [ ] Appointment approved/rejected
  - [ ] Request approved/rejected
  - [ ] Broadcast sent
- [ ] Unread count updates correctly
- [ ] Notifications marked as read

---

## 🔍 Verification Checklist

### Firestore Console Checks
- [ ] `users` collection exists
- [ ] `doctors` collection exists
- [ ] `appointments` collection exists
- [ ] `pendingRequests` collection exists
- [ ] `subscriptionPlans` collection has 3 documents
- [ ] `notifications` collection exists (after first notification)
- [ ] Security rules show as deployed

### Code Checks
- [ ] No TypeScript errors: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] App runs: `npm run dev`
- [ ] No console errors in browser
- [ ] Firebase initialized correctly (check browser console)

### Security Checks
- [ ] Cannot read other users' data
- [ ] Cannot update other users' data
- [ ] Cannot change own role
- [ ] Cannot change own subscription
- [ ] Doctor cannot update profile directly
- [ ] Patient cannot access admin routes
- [ ] Unauthenticated users cannot access protected data

---

## 📊 Performance Checks

- [ ] App loads quickly
- [ ] Real-time updates are instant
- [ ] No unnecessary re-renders
- [ ] Images load properly
- [ ] Translations load correctly
- [ ] No memory leaks (check browser DevTools)

---

## 🚀 Deployment Checklist (Optional)

### Firebase Hosting
- [ ] Run: `firebase init hosting`
- [ ] Select build directory: `dist`
- [ ] Configure as single-page app: Yes
- [ ] Set up automatic builds: No (or Yes if using GitHub)
- [ ] Run: `npm run build`
- [ ] Run: `firebase deploy --only hosting`
- [ ] Visit deployed URL
- [ ] Test all features on deployed site

### Environment Variables (Production)
- [ ] Create `.env.production` file
- [ ] Add Firebase config as environment variables
- [ ] Update `src/config/firebase.ts` to use env vars
- [ ] Rebuild: `npm run build`
- [ ] Redeploy

---

## 🐛 Troubleshooting Checklist

If something doesn't work, check:

### Authentication Issues
- [ ] Email/Password enabled in Firebase Console
- [ ] Firebase config correct in `src/config/firebase.ts`
- [ ] No CORS errors in console
- [ ] User document created in Firestore

### Permission Denied Errors
- [ ] Security rules deployed
- [ ] User is authenticated
- [ ] User has correct role
- [ ] Collection names match exactly

### Real-time Updates Not Working
- [ ] Firestore indexes created (Firebase Console will prompt)
- [ ] No console errors
- [ ] Component using hooks correctly
- [ ] Cleanup functions working

### Notifications Not Working
- [ ] VAPID key set in `notificationService.ts`
- [ ] Service worker registered
- [ ] Using HTTPS (required for push notifications)
- [ ] Permission granted in browser

### Build Errors
- [ ] All dependencies installed: `npm install`
- [ ] No TypeScript errors: `npm run lint`
- [ ] Clear cache: `rm -rf node_modules package-lock.json && npm install`

---

## ✅ Final Verification

Once everything is checked:

- [ ] All features work as expected
- [ ] No console errors
- [ ] No security warnings
- [ ] Performance is good
- [ ] Multi-language works
- [ ] Real-time updates work
- [ ] Notifications work (if enabled)
- [ ] Documentation reviewed
- [ ] Ready for production!

---

## 📚 Documentation Reference

- **QUICKSTART.md** - Quick setup guide
- **FIREBASE_SETUP.md** - Detailed documentation
- **README_FIREBASE.md** - Complete overview
- **IMPLEMENTATION_SUMMARY.md** - What was implemented
- **src/examples/DoctorDashboardExample.tsx** - Code examples

---

## 🎉 Completion

When all items are checked:

✅ **Your Health Connect platform is fully integrated with Firebase and ready to use!**

---

**Need help?** Check the documentation files or review the browser console for specific error messages.
