# Quick Setup Guide - Doctor Request System

## What Was Added

### New Files Created:
1. `src/components/DoctorRequestForm.tsx` - Doctor registration form
2. `src/services/doctorRequestService.ts` - Service for handling requests
3. `src/pages/DoctorRequests.tsx` - Admin page for managing requests
4. `src/components/ChangePasswordModal.tsx` - Password change modal
5. `firebase.json` - Firebase configuration
6. `firestore.indexes.json` - Firestore indexes configuration

### Modified Files:
1. `src/pages/DoctorLogin.tsx` - Added request form button
2. `src/pages/AdminDashboard.tsx` - Added doctor requests section
3. `src/pages/DoctorDashboard.tsx` - Added password change functionality
4. `firestore.rules` - Added security rules for new collections

## Setup Steps

### 1. Install Dependencies (if needed)
```bash
npm install
```

### 2. Deploy Firestore Rules
```bash
firebase login
firebase deploy --only firestore:rules
```

### 3. Build and Test Locally
```bash
npm run dev
```

### 4. Test the Flow

#### As a Doctor:
1. Go to `/doctor/login`
2. Click "املأ بياناتك للانضمام"
3. Fill out the form with test data
4. Submit and verify success message

#### As an Admin:
1. Login to admin dashboard
2. Navigate to "طلبات الأطباء" (Doctor Requests)
3. View the submitted request
4. Click "عرض التفاصيل" (View Details)
5. Click "الموافقة وإنشاء الحساب" (Approve and Create Account)
6. Check notifications for generated credentials

#### As the New Doctor:
1. Go to `/doctor/login`
2. Login with generated email and password
3. Navigate to Profile section
4. Click "تغيير كلمة المرور" (Change Password)
5. Change password successfully

### 5. Deploy to Production
```bash
npm run build
firebase deploy
```

## Firestore Collections

The system will automatically create these collections:

### doctorRequests
Stores all doctor registration requests
```
doctorRequests/{requestId}
  - name: string
  - specialization: string
  - bio: string
  - phone: string
  - price: string
  - governorate: string
  - address: string
  - additionalInfo: string
  - status: "pending" | "approved" | "rejected"
  - createdAt: timestamp
  - doctorId?: string (after approval)
  - generatedEmail?: string (after approval)
```

### notifications
Stores admin notifications with generated credentials
```
notifications/{notificationId}
  - userId: "admin"
  - type: "doctor_approved"
  - doctorName: string
  - doctorEmail: string
  - doctorPassword: string (temporary storage)
  - doctorPhone: string
  - read: boolean
  - createdAt: timestamp
```

## Security Rules Summary

```javascript
// Anyone can submit doctor requests
match /doctorRequests/{requestId} {
  allow read: if isAdmin();
  allow create: if true;
  allow update: if isAdmin();
  allow delete: if isAdmin();
}

// Subscription requests
match /subscriptionRequests/{requestId} {
  allow read: if isSignedIn();
  allow create: if isDoctor();
  allow update: if isAdmin();
  allow delete: if isAdmin();
}

// Platform settings
match /settings/{settingId} {
  allow read: if true;
  allow write: if isAdmin();
}
```

## Environment Variables

Make sure your Firebase configuration is set in `src/config/firebase.ts`:
```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

## Troubleshooting

### Issue: "Permission denied" when submitting request
**Solution:** Deploy Firestore rules using `firebase deploy --only firestore:rules`

### Issue: Specializations not loading
**Solution:** Make sure you have specializations in Firestore:
```javascript
// Add via Admin Dashboard → Specializations
// Or manually in Firestore console
```

### Issue: Email generation creates duplicates
**Solution:** The system uses name-based email generation. For duplicate names, consider:
- Adding a number suffix
- Using phone number in email
- Manual email entry by admin

### Issue: Password change fails
**Solution:** 
- Ensure current password is correct
- New password must be at least 8 characters
- Check Firebase Authentication is properly configured

## Admin Access

To create an admin user, you need to manually set the role in Firestore:

1. Create a user account normally
2. Go to Firestore Console
3. Navigate to `users/{userId}`
4. Set `role: "admin"`

Or use the admin creation script:
```bash
npm run create-admin
```

## Next Steps

1. **Email Integration:**
   - Set up SendGrid or similar service
   - Create Firebase Cloud Function to send credentials
   - Update `approveDoctorRequest` to trigger email

2. **SMS Integration:**
   - Set up Twilio or similar service
   - Send credentials via SMS to doctor's phone

3. **Monitoring:**
   - Set up Firebase Analytics
   - Track request submission rates
   - Monitor approval/rejection rates

4. **Backup:**
   - Set up automated Firestore backups
   - Store credentials securely (consider encryption)

## Support

For issues or questions:
1. Check the documentation files:
   - `DOCTOR_REQUEST_SYSTEM.md` (English)
   - `نظام_طلبات_الأطباء.md` (Arabic)
2. Review Firestore rules
3. Check browser console for errors
4. Verify Firebase configuration

## Testing Checklist

- [ ] Doctor can submit request
- [ ] Request appears in admin dashboard
- [ ] Admin can approve request
- [ ] Account is created successfully
- [ ] Credentials are generated correctly
- [ ] Doctor can login with generated credentials
- [ ] Doctor can change password
- [ ] Admin can reject requests
- [ ] Status badges display correctly
- [ ] Filtering works in admin dashboard
