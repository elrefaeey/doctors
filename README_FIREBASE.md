# 🔥 Firebase Integration - Health Connect Platform

## 🎯 Overview

This is a complete Firebase integration for the Health Connect medical platform, featuring:

- **🔐 Role-Based Authentication** (Admin/Doctor/Patient)
- **🗄️ Firestore Database** with 7 collections
- **🔔 Push Notifications** via Firebase Cloud Messaging
- **🎨 Multi-Language Support** (Arabic/English with RTL)
- **🏆 Subscription System** with ranking algorithm
- **✅ Approval Workflow** for doctor updates
- **🛡️ Comprehensive Security Rules**

---

## 📁 Project Structure

```
health-connect-ui-main/
├── src/
│   ├── config/
│   │   └── firebase.ts                    # Firebase initialization
│   ├── contexts/
│   │   ├── AuthContext.tsx                # Authentication state
│   │   └── LanguageContext.tsx            # Multi-language support
│   ├── services/
│   │   ├── firebaseService.ts             # Database operations
│   │   └── notificationService.ts         # Push notifications
│   ├── hooks/
│   │   └── useFirebase.ts                 # Real-time data hooks
│   ├── types/
│   │   └── firebase.ts                    # TypeScript definitions
│   ├── components/
│   │   └── ProtectedRoute.tsx             # Route guards
│   ├── locales/
│   │   ├── en.json                        # English translations
│   │   └── ar.json                        # Arabic translations
│   └── examples/
│       └── DoctorDashboardExample.tsx     # Complete usage example
├── public/
│   └── firebase-messaging-sw.js           # Service worker for notifications
├── scripts/
│   └── initDatabase.ts                    # Database initialization
├── firestore.rules                        # Security rules
├── FIREBASE_SETUP.md                      # Detailed documentation
├── QUICKSTART.md                          # Quick start guide
└── README_FIREBASE.md                     # This file
```

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 16+ installed
- Firebase project created (`doctor-20c9d`)
- Firebase CLI installed: `npm install -g firebase-tools`

### 2. Firebase Console Setup (5 minutes)

```bash
# 1. Enable Authentication
Go to Firebase Console → Authentication → Sign-in method
Enable "Email/Password"

# 2. Create Firestore Database
Go to Firestore Database → Create database
Start in production mode
Choose location: us-central

# 3. Enable Cloud Messaging
Go to Cloud Messaging → Generate VAPID key
Copy the key for later use

# 4. Enable Storage (optional)
Go to Storage → Get started
```

### 3. Deploy Security Rules

```bash
# Login to Firebase
firebase login

# Initialize Firestore
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### 4. Initialize Database

The subscription plans need to be created manually in Firestore Console:

**Go to Firestore → Start collection → `subscriptionPlans`**

Add 3 documents (see QUICKSTART.md for details):
- `silver` - Basic plan ($99/month)
- `gold` - Premium plan ($199/month)
- `blue` - Elite verified plan ($299/month)

### 5. Create Admin User

```bash
# 1. Run the app
npm run dev

# 2. Sign up with your email
# 3. Go to Firestore Console → users collection
# 4. Edit your user document:
{
  "role": "admin",
  "verifiedBadge": true
}
```

---

## 🏗️ Architecture

### Database Collections

```
📁 Firestore Database
├── 👥 users/                    # User profiles
├── 👨‍⚕️ doctors/                  # Doctor profiles
├── 📅 appointments/             # Appointment bookings
├── ⏳ pendingRequests/          # Doctor update requests
├── 💎 subscriptionPlans/        # Subscription tiers
├── 🔔 notifications/            # User notifications
└── 📢 broadcasts/               # Admin broadcasts
```

### Authentication Flow

```
User Sign Up
    ↓
Create User Document (Firestore)
    ↓
If Doctor → Create Doctor Profile
    ↓
Redirect to Dashboard
```

### Approval Workflow

```
Doctor Requests Update
    ↓
Create Pending Request
    ↓
Admin Reviews Request
    ↓
Approve → Update Doctor Profile → Notify Doctor
    ↓
Reject → Notify Doctor with Reason
```

### Ranking Algorithm

```javascript
doctors.sort((a, b) => {
  // 1. Subscription Priority (Blue=1, Gold=2, Silver=3)
  if (a.subscriptionPriority !== b.subscriptionPriority) {
    return a.subscriptionPriority - b.subscriptionPriority;
  }
  // 2. Rating (highest first)
  if (a.rating !== b.rating) {
    return b.rating - a.rating;
  }
  // 3. Total Bookings (highest first)
  return b.totalBookings - a.totalBookings;
});
```

---

## 🔐 Security

### Role-Based Access Control

| Collection | Admin | Doctor | Patient |
|------------|-------|--------|---------|
| users | Full | Own only | Own only |
| doctors | Full | Read own | Read verified |
| appointments | Full | Own only | Own only |
| pendingRequests | Full | Own only | None |
| subscriptionPlans | Full | Read only | Read only |
| notifications | Full | Own only | Own only |
| broadcasts | Full | Read only | Read only |

### Protected Fields

These fields can only be modified by admins:
- `role` in users
- `subscriptionPlan` in users
- `verifiedBadge` in users
- `subscriptionPriority` in doctors
- `verificationStatus` in doctors

---

## 💻 Usage Examples

### Authentication

```typescript
import { useAuth } from '@/contexts/AuthContext';

function LoginPage() {
  const { signIn, signUp, userData, isAdmin } = useAuth();

  // Sign up
  await signUp('email@example.com', 'password', 'John Doe', 'doctor');

  // Sign in
  await signIn('email@example.com', 'password');

  // Check role
  if (isAdmin) {
    // Admin-specific logic
  }
}
```

### Real-time Data

```typescript
import { useAppointments, useNotifications } from '@/hooks/useFirebase';

function Dashboard() {
  const { appointments, loading } = useAppointments();
  const { notifications, unreadCount } = useNotifications();

  return (
    <div>
      <h2>Appointments: {appointments.length}</h2>
      <h2>Unread: {unreadCount}</h2>
    </div>
  );
}
```

### Database Operations

```typescript
import { 
  createAppointment,
  updateDoctorProfile,
  searchDoctors,
  approveRequest
} from '@/services/firebaseService';

// Create appointment
await createAppointment(doctorId, patientId, date, 'Checkup');

// Update doctor profile (creates pending request)
await updateDoctorProfile(doctorId, { bio: 'New bio', price: 150 });

// Search doctors
const doctors = await searchDoctors('heart', 'Cardiology');

// Admin approves request
await approveRequest(requestId, adminId);
```

### Multi-Language

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function Header() {
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

## 🔔 Notifications

### Setup Push Notifications

1. **Get VAPID Key** from Firebase Console → Cloud Messaging
2. **Update** `src/services/notificationService.ts`:
   ```typescript
   vapidKey: 'YOUR_VAPID_KEY_HERE'
   ```

### Notification Types

- **booking** - New appointment created
- **approval** - Request approved
- **rejection** - Request rejected
- **reminder** - Appointment reminder
- **broadcast** - Admin announcement

### Send Notification

```typescript
import { sendNotificationToUser } from '@/services/notificationService';

await sendNotificationToUser(
  userId,
  'New Appointment',
  'You have a new booking',
  'booking',
  appointmentId
);
```

---

## 🎨 Multi-Language Support

### Supported Languages

- **English** (en) - LTR
- **Arabic** (ar) - RTL

### Translation Files

- `src/locales/en.json` - English translations
- `src/locales/ar.json` - Arabic translations

### Usage

```typescript
const { t } = useLanguage();

// Access translations
t('common.appName')           // "Health Connect"
t('auth.email')               // "Email"
t('doctor.specialization')    // "Specialization"
```

### RTL Support

The app automatically switches to RTL when Arabic is selected:
- `dir` attribute on `<html>`
- CSS automatically adjusts
- All layouts mirror correctly

---

## 👨‍💼 Admin Features

### Capabilities

- ✅ Manage all users
- ✅ Approve/reject doctor verification
- ✅ Change subscription plans
- ✅ Grant/remove verified badges
- ✅ View all appointments
- ✅ Approve/reject pending requests
- ✅ Send broadcast notifications
- ✅ Export reports
- ✅ View system statistics

### Admin Functions

```typescript
import { 
  approveRequest,
  rejectRequest,
  updateDoctorSubscription,
  deleteDoctor
} from '@/services/firebaseService';

// Approve request
await approveRequest(requestId, adminId);

// Reject request
await rejectRequest(requestId, adminId, 'Reason');

// Update subscription
await updateDoctorSubscription(doctorId, 'Blue');

// Delete doctor
await deleteDoctor(doctorId);
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Sign up as patient
- [ ] Sign up as doctor
- [ ] Sign up as admin (manually set role in Firestore)
- [ ] Search for doctors
- [ ] Book appointment as patient
- [ ] Approve appointment as doctor
- [ ] Request profile update as doctor
- [ ] Approve request as admin
- [ ] Change language (EN ↔ AR)
- [ ] Test RTL layout in Arabic
- [ ] Receive notifications
- [ ] Test protected routes

### Test Accounts

Create these test accounts:

```
Admin:
- Email: admin@healthconnect.com
- Role: admin (set manually in Firestore)

Doctor:
- Email: doctor@healthconnect.com
- Role: doctor

Patient:
- Email: patient@healthconnect.com
- Role: patient
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Permission Denied Errors**
- ✅ Deploy Firestore security rules
- ✅ Check user role in Firestore Console
- ✅ Verify user is authenticated

**2. Notifications Not Working**
- ✅ Set VAPID key in notificationService.ts
- ✅ Check service worker is registered
- ✅ Use HTTPS (required for push notifications)

**3. Real-time Updates Not Working**
- ✅ Create Firestore indexes (Firebase Console will prompt)
- ✅ Check collection names match exactly
- ✅ Verify security rules allow reads

**4. Authentication Errors**
- ✅ Enable Email/Password in Firebase Console
- ✅ Check Firebase config in firebase.ts
- ✅ Clear browser cache

---

## 📈 Future Enhancements

### Planned Features

1. **Payment Integration**
   - Stripe/PayPal for subscriptions
   - Appointment payment processing
   - Revenue analytics

2. **Cloud Functions**
   - Automated notifications
   - Scheduled appointment reminders
   - Rating calculations
   - Payment webhooks

3. **Advanced Features**
   - Video consultations
   - Medical records storage
   - Prescription management
   - Analytics dashboard

4. **Mobile App**
   - React Native app
   - Push notifications
   - Offline support

---

## 📚 Documentation

- **QUICKSTART.md** - 5-minute setup guide
- **FIREBASE_SETUP.md** - Comprehensive documentation
- **src/examples/DoctorDashboardExample.tsx** - Complete working example

---

## 🤝 Contributing

When adding new features:

1. Update TypeScript types in `src/types/firebase.ts`
2. Add service functions in `src/services/firebaseService.ts`
3. Update security rules in `firestore.rules`
4. Add translations to `src/locales/en.json` and `src/locales/ar.json`
5. Test with all three roles (admin/doctor/patient)

---

## 📞 Support

For issues:
1. Check browser console for errors
2. Review Firebase Console logs
3. Verify security rules
4. Check all services are enabled in Firebase Console

---

## 📄 License

This Firebase integration is part of the Health Connect platform.

---

**Built with ❤️ using Firebase, React, and TypeScript**

🔥 **Firebase** - Backend infrastructure  
⚛️ **React** - Frontend framework  
📘 **TypeScript** - Type safety  
🎨 **Tailwind CSS** - Styling  
🌍 **i18n** - Multi-language support
