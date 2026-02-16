# 🔥 Firebase Integration Guide - Health Connect Platform

## 📋 Table of Contents
1. [Firebase Setup](#firebase-setup)
2. [Database Structure](#database-structure)
3. [Security Rules](#security-rules)
4. [Authentication System](#authentication-system)
5. [Notification System](#notification-system)
6. [Subscription & Ranking System](#subscription--ranking-system)
7. [Admin Controls](#admin-controls)
8. [Multi-Language Support](#multi-language-support)
9. [Deployment](#deployment)

---

## 🚀 Firebase Setup

### Step 1: Firebase Console Configuration

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `doctor-20c9d`

### Step 2: Enable Firebase Services

#### Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. (Optional) Enable **Email link (passwordless sign-in)**

#### Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Start in **production mode**
3. Choose your preferred location (e.g., `us-central`)

#### Storage
1. Go to **Storage** → **Get started**
2. Start in **production mode**
3. This will be used for doctor profile photos and documents

#### Cloud Messaging (FCM)
1. Go to **Cloud Messaging** → **Get started**
2. Generate a **VAPID key** for web push notifications
3. Copy the VAPID key and add it to `src/services/notificationService.ts`:
   ```typescript
   vapidKey: 'YOUR_VAPID_KEY_HERE'
   ```

### Step 3: Deploy Security Rules

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Firestore
# - Hosting (optional)
# - Storage (optional)

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### Step 4: Initialize Subscription Plans

Run this script in Firebase Console → Firestore → Add Collection:

**Collection: `subscriptionPlans`**

Document 1 (ID: `silver`):
```json
{
  "name": "Silver",
  "price": 99,
  "priorityLevel": 3,
  "features": [
    "Basic profile listing",
    "Standard search visibility",
    "Email support"
  ],
  "badgeColor": "#C0C0C0",
  "description": "Basic plan for new doctors"
}
```

Document 2 (ID: `gold`):
```json
{
  "name": "Gold",
  "price": 199,
  "priorityLevel": 2,
  "features": [
    "Enhanced profile listing",
    "Higher search ranking",
    "Priority support",
    "Analytics dashboard"
  ],
  "badgeColor": "#FFD700",
  "description": "Premium plan with better visibility"
}
```

Document 3 (ID: `blue`):
```json
{
  "name": "Blue",
  "price": 299,
  "priorityLevel": 1,
  "features": [
    "Verified badge",
    "Top search ranking",
    "24/7 premium support",
    "Advanced analytics",
    "Featured listing"
  ],
  "badgeColor": "#1DA1F2",
  "description": "Elite verified doctor status"
}
```

### Step 5: Create Admin User

1. **Sign up through the app** with your admin email
2. **Go to Firestore Console** → `users` collection
3. **Find your user document** and edit it:
   ```json
   {
     "role": "admin",
     "verifiedBadge": true
   }
   ```

---

## 🗂 Database Structure

### Collections Overview

```
📁 users/
  └── {userId}
      ├── name: string
      ├── email: string
      ├── role: "admin" | "doctor" | "patient"
      ├── subscriptionPlan?: "Silver" | "Gold" | "Blue"
      ├── verifiedBadge: boolean
      ├── languagePreference: "ar" | "en"
      └── createdAt: timestamp

📁 doctors/
  └── {doctorId} (same as userId)
      ├── userId: string
      ├── specialization: string
      ├── bio: string
      ├── clinicLocation: string
      ├── price: number
      ├── rating: number
      ├── subscriptionPriority: 1 | 2 | 3
      ├── verificationStatus: "pending" | "verified" | "rejected"
      ├── totalBookings: number
      ├── photoURL?: string
      ├── availability?: object
      ├── createdAt: timestamp
      └── updatedAt: timestamp

📁 appointments/
  └── {appointmentId}
      ├── doctorId: string
      ├── patientId: string
      ├── date: timestamp
      ├── status: "pending" | "approved" | "rejected" | "completed"
      ├── notes?: string
      ├── createdAt: timestamp
      └── updatedAt: timestamp

📁 pendingRequests/
  └── {requestId}
      ├── doctorId: string
      ├── requestType: "scheduleUpdate" | "profileUpdate" | "priceUpdate"
      ├── requestedData: object
      ├── status: "pending" | "approved" | "rejected"
      ├── reviewedBy?: string
      ├── reviewedAt?: timestamp
      ├── rejectionReason?: string
      └── createdAt: timestamp

📁 subscriptionPlans/
  └── {planId}
      ├── name: string
      ├── price: number
      ├── priorityLevel: number
      ├── features: string[]
      ├── badgeColor: string
      └── description: string

📁 notifications/
  └── {notificationId}
      ├── userId: string
      ├── title: string
      ├── message: string
      ├── type: "booking" | "approval" | "rejection" | "reminder" | "broadcast"
      ├── read: boolean
      ├── relatedId?: string
      └── createdAt: timestamp

📁 broadcasts/
  └── {broadcastId}
      ├── title: string
      ├── message: string
      └── createdAt: timestamp
```

---

## 🔐 Security Rules

The security rules are defined in `firestore.rules`. Key features:

### Role-Based Access Control

- **Admin**: Full access to all collections
- **Doctor**: 
  - Read their own profile
  - Cannot update directly (must create pending requests)
  - Read/update their appointments
- **Patient**:
  - Read/write only their own appointments
  - Read verified doctor profiles

### Protected Fields

Certain fields cannot be modified by users:
- `role` in users collection
- `subscriptionPlan` and `verifiedBadge` (admin only)
- `subscriptionPriority` in doctors collection

### Data Validation

- Appointments must start with `status: "pending"`
- Pending requests must start with `status: "pending"`
- Users can only create documents with their own UID

---

## 🔐 Authentication System

### Implementation

The authentication system is implemented in `src/contexts/AuthContext.tsx`:

```typescript
import { useAuth } from '@/contexts/AuthContext';

// In your component
const { currentUser, userData, signIn, signUp, signOut, isAdmin, isDoctor, isPatient } = useAuth();
```

### Features

1. **Email/Password Authentication**
2. **Automatic User Profile Creation**
3. **Role-Based Helpers**: `isAdmin`, `isDoctor`, `isPatient`
4. **Session Persistence**
5. **Password Reset**

### Usage Example

```typescript
// Sign up
await signUp('email@example.com', 'password123', 'John Doe', 'doctor');

// Sign in
await signIn('email@example.com', 'password123');

// Sign out
await signOut();

// Check role
if (isDoctor) {
  // Doctor-specific logic
}
```

---

## 🔔 Notification System

### Firebase Cloud Messaging Setup

1. **Add firebase-messaging-sw.js** to your `public` folder:

```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBYIxl2jeMTQzsPEg7-Zn5KcvJ_mvuOrds",
  authDomain: "doctor-20c9d.firebaseapp.com",
  projectId: "doctor-20c9d",
  storageBucket: "doctor-20c9d.firebasestorage.app",
  messagingSenderId: "182673156937",
  appId: "1:182673156937:web:48a849d6ff02aabaa98898",
  measurementId: "G-41F0NFLVT8"
});

const messaging = firebase.messaging();
```

### Notification Triggers

Notifications are sent when:

1. **New Booking** → Notify doctor
2. **Appointment Reminder** → Notify patient (24h before)
3. **Request Approved/Rejected** → Notify doctor
4. **Appointment Status Changed** → Notify patient

### Implementation

```typescript
import { sendNotificationToUser, notificationTemplates } from '@/services/notificationService';

// Send notification
await sendNotificationToUser(
  userId,
  'New Appointment',
  'You have a new appointment request',
  'booking',
  appointmentId
);
```

---

## 🎯 Subscription & Ranking System

### Ranking Algorithm

Doctors are ranked by:

1. **Subscription Priority** (1 = Blue, 2 = Gold, 3 = Silver)
2. **Rating** (highest first)
3. **Total Bookings** (highest first)

### Implementation

The ranking is implemented in `src/services/firebaseService.ts`:

```typescript
doctors.sort((a, b) => {
  if (a.subscriptionPriority !== b.subscriptionPriority) {
    return a.subscriptionPriority - b.subscriptionPriority;
  }
  if (a.rating !== b.rating) {
    return b.rating - a.rating;
  }
  return b.totalBookings - a.totalBookings;
});
```

### Subscription Management

```typescript
import { updateDoctorSubscription } from '@/services/firebaseService';

// Admin updates doctor subscription
await updateDoctorSubscription(doctorId, 'Blue');
```

---

## 👨‍💼 Admin Controls

### Admin Capabilities

1. **Manage Users**
   - View all users
   - Change user roles
   - Delete users

2. **Manage Doctors**
   - Approve/reject verification
   - Change subscription plans
   - Grant/remove verified badges
   - Delete doctor profiles

3. **Manage Appointments**
   - View all appointments
   - Update appointment status
   - Delete appointments

4. **Pending Requests**
   - Approve/reject doctor update requests
   - View request history

5. **Broadcast Notifications**
   - Send notifications to all users

6. **System Statistics**
   - Total users, doctors, patients
   - Total appointments
   - Revenue analytics

### Admin Service Functions

```typescript
import { 
  approveRequest, 
  rejectRequest, 
  updateDoctorSubscription,
  deleteDoctor 
} from '@/services/firebaseService';

// Approve a request
await approveRequest(requestId, adminId);

// Reject a request
await rejectRequest(requestId, adminId, 'Reason for rejection');

// Update subscription
await updateDoctorSubscription(doctorId, 'Gold');

// Delete doctor
await deleteDoctor(doctorId);
```

---

## 🌍 Multi-Language Support

### Language Files

- **English**: `src/locales/en.json`
- **Arabic**: `src/locales/ar.json`

### Usage

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

const { t, language, setLanguage, dir } = useLanguage();

// Translate
<h1>{t('common.appName')}</h1>

// Change language
<button onClick={() => setLanguage('ar')}>العربية</button>

// RTL support
<div dir={dir}>Content</div>
```

### RTL Support

The app automatically switches to RTL when Arabic is selected:
- `document.documentElement.setAttribute('dir', 'rtl')`
- CSS automatically adjusts for RTL layout

---

## 🚀 Deployment

### Firebase Hosting

```bash
# Build the app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Environment Variables

For production, consider using environment variables:

```env
VITE_FIREBASE_API_KEY=AIzaSyBYIxl2jeMTQzsPEg7-Zn5KcvJ_mvuOrds
VITE_FIREBASE_AUTH_DOMAIN=doctor-20c9d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=doctor-20c9d
VITE_FIREBASE_STORAGE_BUCKET=doctor-20c9d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=182673156937
VITE_FIREBASE_APP_ID=1:182673156937:web:48a849d6ff02aabaa98898
VITE_FIREBASE_MEASUREMENT_ID=G-41F0NFLVT8
```

Update `src/config/firebase.ts` to use environment variables:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... etc
};
```

---

## 📊 Future Enhancements

### Payment Gateway Integration

The system is prepared for payment integration:

1. **Subscription Payments**: Integrate Stripe/PayPal for subscription plans
2. **Appointment Payments**: Optional payment for appointments
3. **Revenue Tracking**: Admin dashboard for financial analytics

### Cloud Functions

Consider implementing Cloud Functions for:

1. **Automated Notifications**: Trigger notifications on database changes
2. **Scheduled Tasks**: Appointment reminders, subscription renewals
3. **Data Aggregation**: Calculate doctor ratings, statistics
4. **Payment Processing**: Handle payment webhooks

Example Cloud Function:

```javascript
exports.onAppointmentCreated = functions.firestore
  .document('appointments/{appointmentId}')
  .onCreate(async (snap, context) => {
    const appointment = snap.data();
    
    // Send notification to doctor
    await admin.firestore().collection('notifications').add({
      userId: appointment.doctorId,
      title: 'New Appointment',
      message: 'You have a new appointment request',
      type: 'booking',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
```

---

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Firebase domain is whitelisted in Firebase Console
2. **Permission Denied**: Check Firestore security rules
3. **Authentication Errors**: Verify Email/Password is enabled in Firebase Console
4. **Notifications Not Working**: Check VAPID key and service worker registration

### Debug Mode

Enable Firebase debug mode:

```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  console.error('Persistence error:', err);
});
```

---

## 📞 Support

For issues or questions:
- Check Firebase Console logs
- Review Firestore security rules
- Check browser console for errors
- Verify all Firebase services are enabled

---

**Built with ❤️ for Health Connect Platform**
