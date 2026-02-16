# Firestore Database Structure

This document describes the complete Firestore database structure for the MedBook application. All data must be stored in Firebase - no hardcoded data should exist in the codebase.

## Collections

### 1. `users`
Stores all user accounts (patients, doctors, admins)

```typescript
{
  uid: string;                    // Firebase Auth UID
  email: string;
  displayName: string;
  role: 'patient' | 'doctor' | 'admin';
  photoURL?: string;
  createdAt: Timestamp;
  language: 'en' | 'ar';          // User's preferred language
}
```

### 2. `doctors`
Stores doctor-specific profile information

```typescript
{
  id: string;                     // Same as user UID
  userId: string;                 // Reference to users collection
  email: string;
  displayName: string;
  specialization: string;         // e.g., 'cardiology', 'dermatology'
  clinicAddress: string;
  consultationPrice: number;
  experience: number;             // Years of experience
  bio: string;
  subscriptionType: 'silver' | 'gold' | 'verified';
  isSuspended: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rating: number;                 // Average rating (0-5)
  totalReviews: number;
  workingHours: {
    [day: string]: {              // e.g., 'monday', 'tuesday'
      start: string;              // e.g., '09:00'
      end: string;                // e.g., '17:00'
      available: boolean;
    }
  };
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3. `appointments`
Stores all appointment bookings

```typescript
{
  id: string;
  doctorId: string;               // Reference to doctors collection
  patientId: string;              // Reference to users collection
  doctorName: string;             // Denormalized for quick access
  patientName: string;            // Denormalized for quick access
  date: string;                   // ISO date string
  time: string;                   // e.g., '10:00 AM'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  notes?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### 4. `pendingRequests`
Stores doctor profile update requests awaiting admin approval

```typescript
{
  id: string;
  doctorId: string;
  requestType: 'profileUpdate' | 'scheduleChange' | 'subscriptionUpgrade';
  requestedData: any;             // The data being requested to change
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
  reviewedBy?: string;            // Admin UID who reviewed
  reviewedAt?: Timestamp;
  rejectionReason?: string;
}
```

### 5. `subscriptionPlans`
Stores available subscription plans for doctors

```typescript
{
  id: string;
  name: string;                   // e.g., 'Silver', 'Gold', 'Blue Verified'
  level: 'silver' | 'gold' | 'verified';
  priceMonthly: number;
  priority: number;               // Search ranking priority (1 = highest)
  features: string[];             // Array of feature descriptions
  badge?: string;                 // Badge icon or identifier
}
```

### 6. `specializations`
Stores medical specializations

```typescript
{
  id: string;
  key: string;                    // e.g., 'cardiology', 'dermatology'
  icon: string;                   // Emoji or icon identifier
  order: number;                  // Display order
}
```

### 7. `translations`
Stores UI translations for internationalization

Document IDs: `en`, `ar`

```typescript
{
  // Nested object structure matching the translation keys
  common: {
    appName: string;
    loading: string;
    // ... etc
  };
  auth: {
    email: string;
    password: string;
    // ... etc
  };
  // ... all other translation sections
}
```

### 8. `notifications`
Stores user notifications

```typescript
{
  id: string;
  userId: string;                 // User who receives the notification
  title: string;
  message: string;
  type: 'appointment' | 'approval' | 'system' | 'reminder';
  read: boolean;
  createdAt: Timestamp;
  readAt?: Timestamp;
  relatedId?: string;             // ID of related appointment/request
}
```

### 9. `reviews`
Stores patient reviews for doctors

```typescript
{
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  rating: number;                 // 1-5
  comment: string;
  appointmentId?: string;
  createdAt: Timestamp;
}
```

## Initial Data Setup

To populate your Firestore database with initial data, you can use the Firebase Console or create a script. Here's what you need:

### Specializations
```javascript
[
  { key: 'cardiology', icon: '❤️', order: 1 },
  { key: 'dermatology', icon: '🧴', order: 2 },
  { key: 'neurology', icon: '🧠', order: 3 },
  { key: 'orthopedics', icon: '🦴', order: 4 },
  { key: 'pediatrics', icon: '👶', order: 5 },
  { key: 'ophthalmology', icon: '👁️', order: 6 },
  { key: 'dentistry', icon: '🦷', order: 7 },
  { key: 'psychiatry', icon: '🧘', order: 8 }
]
```

### Subscription Plans
```javascript
[
  {
    name: 'Silver',
    level: 'silver',
    priceMonthly: 49,
    priority: 3,
    features: ['Basic listing', 'Up to 20 appointments/month', 'Standard support']
  },
  {
    name: 'Gold',
    level: 'gold',
    priceMonthly: 99,
    priority: 2,
    features: ['Featured listing', 'Unlimited appointments', 'Priority support', 'Analytics dashboard']
  },
  {
    name: 'Blue Verified',
    level: 'verified',
    priceMonthly: 199,
    priority: 1,
    features: ['Top search results', 'Verified badge', 'Unlimited appointments', 'Premium support', 'Advanced analytics', 'Custom profile']
  }
]
```

### Translations
Copy the content from `src/locales/en.json` and `src/locales/ar.json` into Firestore documents with IDs `en` and `ar` respectively in the `translations` collection.

## Security Rules

Update your `firestore.rules` file to secure the database:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isDoctor() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Doctors collection
    match /doctors/{doctorId} {
      allow read: if true; // Public read for search
      allow create: if isAdmin();
      allow update: if isOwner(doctorId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Appointments collection
    match /appointments/{appointmentId} {
      allow read: if isSignedIn() && 
                     (resource.data.patientId == request.auth.uid || 
                      resource.data.doctorId == request.auth.uid ||
                      isAdmin());
      allow create: if isSignedIn();
      allow update: if isSignedIn() && 
                       (resource.data.patientId == request.auth.uid || 
                        resource.data.doctorId == request.auth.uid ||
                        isAdmin());
      allow delete: if isAdmin();
    }
    
    // Pending requests
    match /pendingRequests/{requestId} {
      allow read: if isAdmin() || (isDoctor() && resource.data.doctorId == request.auth.uid);
      allow create: if isDoctor();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Subscription plans (public read, admin write)
    match /subscriptionPlans/{planId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Specializations (public read, admin write)
    match /specializations/{specId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Translations (public read, admin write)
    match /translations/{lang} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Notifications
    match /notifications/{notificationId} {
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isAdmin();
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow delete: if isAdmin();
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if true; // Public read
      allow create: if isSignedIn();
      allow update: if isOwner(resource.data.patientId) || isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

## Notes

1. **No Hardcoded Data**: All data must come from Firestore. If the database is empty, the website will appear empty.

2. **Translations**: UI translations are stored in Firestore for dynamic updates without code deployment.

3. **Denormalization**: Some data (like doctor/patient names) is denormalized in appointments for performance.

4. **Admin Role**: The first admin must be created manually in Firebase Console by setting `role: 'admin'` in the users collection.

5. **Data Migration**: Use the Firebase Admin SDK or Console to import initial data (specializations, subscription plans, translations).
