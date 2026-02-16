# 🚀 Quick Start Guide - Health Connect Firebase Integration

## ✅ What's Been Implemented

Your Health Connect platform now has complete Firebase integration with:

### 🔐 Authentication System
- ✅ Email/Password authentication
- ✅ Role-based access (Admin/Doctor/Patient)
- ✅ Protected routes
- ✅ Session persistence
- ✅ Password reset

### 🗄️ Database (Firestore)
- ✅ Complete database structure (7 collections)
- ✅ Security rules with role-based access
- ✅ Real-time data synchronization
- ✅ Optimized queries with indexes

### 🔔 Notifications
- ✅ Firebase Cloud Messaging setup
- ✅ Push notification service worker
- ✅ Notification templates
- ✅ Real-time notification updates

### 🎯 Core Features
- ✅ Doctor search with ranking algorithm
- ✅ Subscription system (Silver/Gold/Blue)
- ✅ Appointment booking system
- ✅ Pending request approval workflow
- ✅ Admin full control panel
- ✅ Multi-language support (Arabic/English)

---

## 📦 Files Created

### Configuration
- `src/config/firebase.ts` - Firebase initialization
- `firestore.rules` - Security rules
- `public/firebase-messaging-sw.js` - Push notifications service worker

### Types & Interfaces
- `src/types/firebase.ts` - TypeScript definitions

### Contexts
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/contexts/LanguageContext.tsx` - Updated for new translations

### Services
- `src/services/firebaseService.ts` - All database operations
- `src/services/notificationService.ts` - Notification handling

### Components
- `src/components/ProtectedRoute.tsx` - Route protection

### Hooks
- `src/hooks/useFirebase.ts` - Real-time data hooks

### Translations
- `src/locales/en.json` - English translations
- `src/locales/ar.json` - Arabic translations

### Examples & Documentation
- `src/examples/DoctorDashboardExample.tsx` - Complete usage example
- `FIREBASE_SETUP.md` - Comprehensive setup guide
- `QUICKSTART.md` - This file

---

## 🏃 Getting Started (5 Minutes)

### Step 1: Install Dependencies ✅
Already done! Firebase is installed.

### Step 2: Firebase Console Setup

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select Project**: `doctor-20c9d`

3. **Enable Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
   - Click Save

4. **Create Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Start in **production mode**
   - Choose location: `us-central` (or your preferred region)

5. **Deploy Security Rules**:
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login
   firebase login
   
   # Initialize (select Firestore only)
   firebase init firestore
   
   # Deploy rules
   firebase deploy --only firestore:rules
   ```

6. **Add Subscription Plans**:
   - Go to Firestore Database
   - Click "Start collection"
   - Collection ID: `subscriptionPlans`
   - Add 3 documents (see below)

### Step 3: Create Subscription Plans

In Firestore Console, create these documents in `subscriptionPlans` collection:

**Document ID: `silver`**
```json
{
  "name": "Silver",
  "price": 99,
  "priorityLevel": 3,
  "features": ["Basic profile listing", "Standard search visibility", "Email support"],
  "badgeColor": "#C0C0C0",
  "description": "Basic plan for new doctors"
}
```

**Document ID: `gold`**
```json
{
  "name": "Gold",
  "price": 199,
  "priorityLevel": 2,
  "features": ["Enhanced profile listing", "Higher search ranking", "Priority support", "Analytics dashboard"],
  "badgeColor": "#FFD700",
  "description": "Premium plan with better visibility"
}
```

**Document ID: `blue`**
```json
{
  "name": "Blue",
  "price": 299,
  "priorityLevel": 1,
  "features": ["Verified badge", "Top search ranking", "24/7 premium support", "Advanced analytics", "Featured listing"],
  "badgeColor": "#1DA1F2",
  "description": "Elite verified doctor status"
}
```

### Step 4: Create Admin User

1. **Run the app**:
   ```bash
   npm run dev
   ```

2. **Sign up** with your admin email through the app

3. **Go to Firestore Console** → `users` collection

4. **Find your user** and click edit

5. **Change role to admin**:
   ```json
   {
     "role": "admin",
     "verifiedBadge": true
   }
   ```

### Step 5: Test the System

1. **Login as Admin** - Access admin dashboard
2. **Create a Doctor Account** - Sign up as doctor
3. **Approve Doctor** - Use admin to verify doctor
4. **Create Patient Account** - Sign up as patient
5. **Book Appointment** - Test the booking flow
6. **Test Notifications** - Check real-time updates

---

## 🎨 Usage Examples

### 1. Authentication

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { userData, signIn, signOut, isAdmin, isDoctor, isPatient } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn('email@example.com', 'password123');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {userData ? (
        <>
          <p>Welcome, {userData.name}!</p>
          <p>Role: {userData.role}</p>
          <button onClick={signOut}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 2. Real-time Data

```typescript
import { useAppointments, useNotifications } from '@/hooks/useFirebase';

function DoctorDashboard() {
  const { appointments, loading } = useAppointments();
  const { notifications, unreadCount } = useNotifications();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Appointments ({appointments.length})</h2>
      <h2>Notifications ({unreadCount} unread)</h2>
    </div>
  );
}
```

### 3. Database Operations

```typescript
import { 
  createAppointment, 
  updateDoctorProfile,
  searchDoctors 
} from '@/services/firebaseService';

// Create appointment
await createAppointment(doctorId, patientId, new Date(), 'Checkup');

// Update doctor profile (creates pending request)
await updateDoctorProfile(doctorId, { bio: 'Updated bio', price: 150 });

// Search doctors
const doctors = await searchDoctors('cardiology', 'Cardiology');
```

### 4. Multi-language

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage, dir } = useLanguage();

  return (
    <div dir={dir}>
      <h1>{t('common.appName')}</h1>
      <button onClick={() => setLanguage('ar')}>العربية</button>
      <button onClick={() => setLanguage('en')}>English</button>
    </div>
  );
}
```

---

## 🔑 Key Concepts

### Role-Based Access

- **Admin**: Full access to everything
- **Doctor**: Can read their data, must request changes via pending requests
- **Patient**: Can book appointments, view their appointments only

### Pending Request Workflow

1. Doctor wants to update profile
2. System creates a `pendingRequest` document
3. Admin reviews and approves/rejects
4. On approval, doctor profile is updated
5. Doctor receives notification

### Ranking Algorithm

Doctors are sorted by:
1. **Subscription Priority** (Blue=1, Gold=2, Silver=3)
2. **Rating** (highest first)
3. **Total Bookings** (highest first)

---

## 🛠️ Common Tasks

### Add a New Admin
```typescript
// In Firestore Console
users/{userId} → Edit
{
  "role": "admin",
  "verifiedBadge": true
}
```

### Change Doctor Subscription
```typescript
import { updateDoctorSubscription } from '@/services/firebaseService';

await updateDoctorSubscription(doctorId, 'Blue');
```

### Approve Pending Request
```typescript
import { approveRequest } from '@/services/firebaseService';

await approveRequest(requestId, adminId);
```

### Send Notification
```typescript
import { sendNotificationToUser } from '@/services/notificationService';

await sendNotificationToUser(
  userId,
  'Title',
  'Message',
  'booking',
  relatedId
);
```

---

## 📱 Push Notifications Setup (Optional)

### Get VAPID Key

1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Under "Web configuration" → Generate key pair
3. Copy the VAPID key

### Update Code

In `src/services/notificationService.ts`, replace:
```typescript
vapidKey: 'YOUR_VAPID_KEY_HERE'
```

With your actual VAPID key.

---

## 🐛 Troubleshooting

### "Permission denied" errors
- Check Firestore security rules are deployed
- Verify user role in Firestore Console
- Make sure user is authenticated

### Notifications not working
- Check VAPID key is set
- Verify service worker is registered
- Check browser console for errors
- Ensure HTTPS (required for push notifications)

### Real-time updates not working
- Check Firestore indexes are created
- Verify collection names match exactly
- Check browser console for errors

### Authentication errors
- Verify Email/Password is enabled in Firebase Console
- Check Firebase config in `src/config/firebase.ts`
- Clear browser cache and try again

---

## 📚 Next Steps

1. **Customize UI**: Update the existing pages to use Firebase data
2. **Add Features**: Implement doctor ratings, reviews, etc.
3. **Cloud Functions**: Add server-side logic for complex operations
4. **Payment Integration**: Add Stripe/PayPal for subscriptions
5. **Analytics**: Implement Firebase Analytics tracking
6. **Storage**: Add profile photo upload functionality

---

## 📖 Full Documentation

For complete documentation, see:
- `FIREBASE_SETUP.md` - Detailed setup and architecture
- `src/examples/DoctorDashboardExample.tsx` - Complete working example

---

## 🎯 Testing Checklist

- [ ] Admin can login
- [ ] Doctor can sign up
- [ ] Patient can sign up
- [ ] Admin can approve doctor verification
- [ ] Patient can search doctors
- [ ] Patient can book appointment
- [ ] Doctor receives notification
- [ ] Doctor can approve/reject appointment
- [ ] Doctor can request profile update
- [ ] Admin can approve/reject requests
- [ ] Language switching works (EN/AR)
- [ ] RTL layout works for Arabic
- [ ] Real-time updates work

---

**🎉 You're all set! Your Health Connect platform is now powered by Firebase!**

For questions or issues, refer to `FIREBASE_SETUP.md` for detailed documentation.
