# Doctor Registration Request System

## Overview
This system allows doctors to submit registration requests that must be reviewed and approved by administrators before accounts are created.

## Features Implemented

### 1. Doctor Request Form
**Location:** `src/components/DoctorRequestForm.tsx`

**Fields:**
- Full Name (required)
- Specialization (dropdown from Firestore, required)
- Short Bio
- Phone Number (required)
- Consultation Price
- Governorate (dropdown of Egyptian governorates, required)
- Detailed Address
- Additional Information (long description)

**Validation:**
- Checks for duplicate phone numbers in pending requests
- All required fields must be filled

**User Flow:**
1. Doctor visits Doctor Login page
2. Clicks "املأ بياناتك للانضمام" (Fill Your Information) button
3. Fills out the request form
4. Submits the form
5. Receives confirmation message: "طلبك قيد المراجعة من قبل الإدارة" (Your request is under review)

### 2. Admin Dashboard - Doctor Requests Page
**Location:** `src/pages/DoctorRequests.tsx`

**Features:**
- View all doctor requests with filtering (All, Pending, Approved, Rejected)
- Display request details including:
  - Name, Specialization, Phone, Governorate, Price
  - Bio and Additional Information
  - Request submission date
  - Status badge (Pending/Approved/Rejected)
- Approve or Reject requests
- View detailed information in modal

**Admin Actions:**

#### Approve Request:
When admin approves a request, the system automatically:
1. Generates email: `doctorname@doctor.com` (lowercase, no spaces)
2. Generates secure random password (10 characters, mixed case + numbers)
3. Creates Firebase Authentication account
4. Creates user document in `users/{uid}` collection
5. Creates doctor profile in `doctors/{uid}` collection
6. Updates request status to "approved"
7. Creates notification with credentials for admin reference

**Generated Data Structure:**

```javascript
// users/{uid}
{
  uid: string,
  email: "generatedEmail@doctor.com",
  displayName: string,
  name: string,
  role: "doctor",
  createdAt: serverTimestamp(),
  language: "ar"
}

// doctors/{uid}
{
  id: uid,
  userId: uid,
  email: "generatedEmail@doctor.com",
  displayName: string,
  name: string,
  nameAr: string,
  specialization: string,
  bio: string,
  phone: string,
  consultationPrice: number,
  governorate: string,
  clinicAddress: string,
  address: string,
  additionalInfo: string,
  subscriptionType: "silver",
  isSuspended: false,
  verificationStatus: "verified",
  rating: 0,
  totalReviews: 0,
  totalPatients: 0,
  experience: 0,
  workingHours: {},
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}

// doctorRequests/{requestId}
{
  ...originalRequestData,
  status: "approved",
  doctorId: uid,
  generatedEmail: "email@doctor.com",
  approvedAt: serverTimestamp()
}
```

#### Reject Request:
- Updates request status to "rejected"
- Optionally adds rejection reason
- No account is created

### 3. Doctor Password Management
**Location:** `src/components/ChangePasswordModal.tsx`

**Features:**
- Accessible from Doctor Dashboard → Profile section
- Requires current password for security
- New password must be at least 8 characters
- Password confirmation validation
- Re-authentication before password change
- Success/error feedback

**Security:**
- Uses Firebase `reauthenticateWithCredential()` before password change
- Uses Firebase `updatePassword()` for secure password updates
- Passwords are never stored in Firestore
- Only Firebase Authentication stores password hashes

### 4. Firestore Security Rules
**Location:** `firestore.rules`

**New Collections:**

```javascript
// Doctor Requests - Anyone can submit, only admin can read/update
match /doctorRequests/{requestId} {
  allow read: if isAdmin();
  allow create: if true; // Anyone can submit
  allow update: if isAdmin();
  allow delete: if isAdmin();
}

// Subscription Requests
match /subscriptionRequests/{requestId} {
  allow read: if isSignedIn();
  allow create: if isDoctor();
  allow update: if isAdmin();
  allow delete: if isAdmin();
}

// Platform Settings
match /settings/{settingId} {
  allow read: if true; // Public read
  allow write: if isAdmin();
}
```

## File Structure

```
src/
├── components/
│   ├── DoctorRequestForm.tsx          # Doctor registration request form
│   └── ChangePasswordModal.tsx        # Password change modal for doctors
├── pages/
│   ├── DoctorLogin.tsx                # Updated with request button
│   ├── DoctorRequests.tsx             # Admin page for managing requests
│   ├── AdminDashboard.tsx             # Updated with doctor requests section
│   └── DoctorDashboard.tsx            # Updated with password change
└── services/
    └── doctorRequestService.ts        # Service for doctor request operations

firestore.rules                         # Updated security rules
firebase.json                           # Firebase configuration
```

## Services

### doctorRequestService.ts

**Functions:**

1. `submitDoctorRequest(data)` - Submit new doctor request
2. `getDoctorRequests(status?)` - Get all requests (optionally filtered by status)
3. `approveDoctorRequest(requestId, requestData)` - Approve request and create account
4. `rejectDoctorRequest(requestId, reason?)` - Reject request
5. `generateDoctorEmail(name)` - Generate email from doctor name
6. `generateSecurePassword()` - Generate random secure password

## Email Generation Logic

```javascript
// Example: "Ahmed Ali" → "ahmedali@doctor.com"
const generateDoctorEmail = (name: string): string => {
  const cleanName = name.trim().toLowerCase().replace(/\s+/g, '');
  const latinName = cleanName.replace(/[^\w]/g, '');
  return `${latinName}@doctor.com`;
};
```

## Password Generation Logic

```javascript
// Generates 10-character password with:
// - At least 1 uppercase letter
// - At least 1 lowercase letter
// - At least 1 number
// - Randomly shuffled
const generateSecurePassword = (): string => {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  // ... implementation
};
```

## Deployment

### Deploy Firestore Rules:
```bash
firebase deploy --only firestore:rules
```

### Deploy Full Application:
```bash
npm run build
firebase deploy
```

## Testing Checklist

### Doctor Flow:
- [ ] Doctor can access request form from login page
- [ ] All required fields are validated
- [ ] Specializations load from Firestore
- [ ] Egyptian governorates dropdown works
- [ ] Duplicate phone number check works
- [ ] Success message displays after submission
- [ ] Request appears in admin dashboard

### Admin Flow:
- [ ] Admin can view all requests
- [ ] Filter by status works (All/Pending/Approved/Rejected)
- [ ] Request details modal displays correctly
- [ ] Approve creates account successfully
- [ ] Generated credentials are stored in notification
- [ ] Reject updates status correctly
- [ ] Status badges display correctly

### Doctor Password Change:
- [ ] Password modal opens from profile section
- [ ] Current password validation works
- [ ] New password length validation (min 8 chars)
- [ ] Password confirmation matching works
- [ ] Re-authentication works correctly
- [ ] Password update succeeds
- [ ] Success message displays
- [ ] Doctor can login with new password

### Security:
- [ ] Unauthenticated users cannot read doctor requests
- [ ] Only admins can approve/reject requests
- [ ] Passwords are not stored in Firestore
- [ ] Re-authentication required for password change

## Future Enhancements

1. **Email/SMS Notifications:**
   - Send credentials to doctor's phone/email after approval
   - Use Firebase Cloud Functions + SendGrid/Twilio

2. **Credential Management:**
   - Admin interface to view generated credentials
   - Resend credentials functionality
   - Password reset for doctors

3. **Request Management:**
   - Edit request before approval
   - Request additional information from doctor
   - Bulk approve/reject

4. **Analytics:**
   - Track request approval rates
   - Monitor request processing time
   - Doctor onboarding metrics

## Notes

- Credentials are currently stored in notifications for admin reference
- In production, implement proper email/SMS delivery
- Consider adding email verification step
- Monitor for duplicate email generation edge cases
- Implement rate limiting for request submissions
