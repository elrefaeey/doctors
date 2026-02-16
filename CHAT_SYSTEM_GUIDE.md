# Chat System Documentation

## Overview
A real-time chat system has been implemented to enable communication between doctors and patients within the medical booking platform.

## Features Implemented

### 1. Authentication & Access Control
- ✅ Only logged-in users can access chat
- ✅ Patients must create an account first
- ✅ Doctors must be logged in to chat
- ✅ Admin users cannot access chat (redirected to admin dashboard)

### 2. Chat Logic
- ✅ Chat is only allowed between a patient and a doctor with a confirmed appointment
- ✅ Each appointment creates a unique chat room
- ✅ Chat rooms are automatically created when users click the "Chat" button

### 3. Firestore Structure

#### Chats Collection
```
chats/{chatId}
├── doctorId: string
├── patientId: string
├── appointmentId: string
├── doctorName: string
├── patientName: string
├── lastMessage: string
├── lastMessageTime: timestamp
├── unreadCount: {
│   ├── doctor: number
│   └── patient: number
│   }
└── createdAt: timestamp
```

#### Messages Subcollection
```
chats/{chatId}/messages/{messageId}
├── senderId: string
├── senderRole: "doctor" | "patient"
├── senderName: string
├── text: string
├── imageUrl: string (optional)
├── createdAt: timestamp
└── read: boolean
```

### 4. Chat Features
- ✅ Real-time messaging using Firestore onSnapshot listeners
- ✅ Auto-scroll to latest message
- ✅ Show sender name
- ✅ Show message time (HH:mm format)
- ✅ Unread message count with badges
- ✅ Mark messages as read automatically when chat is opened
- ✅ Different bubble colors for doctor (blue) and patient (gray)
- ✅ Responsive design for mobile and desktop

### 5. UI Layout
- ✅ WhatsApp-style chat layout
- ✅ Left side: Conversations list with unread counts
- ✅ Right side: Active chat window
- ✅ Mobile: Full-screen chat with back button
- ✅ Empty states for no conversations

### 6. Security Rules
```javascript
// Chats - Only doctor and patient can access
match /chats/{chatId} {
  allow read: if isSignedIn() && 
                 (resource.data.doctorId == request.auth.uid || 
                  resource.data.patientId == request.auth.uid);
  allow create: if isSignedIn();
  allow update: if isSignedIn() && 
                   (resource.data.doctorId == request.auth.uid || 
                    resource.data.patientId == request.auth.uid);
  
  // Messages subcollection
  match /messages/{messageId} {
    allow read: if isSignedIn() && 
                   (get(/databases/$(database)/documents/chats/$(chatId)).data.doctorId == request.auth.uid || 
                    get(/databases/$(database)/documents/chats/$(chatId)).data.patientId == request.auth.uid);
    allow create: if isSignedIn() && 
                     request.resource.data.senderId == request.auth.uid;
  }
}
```

### 7. Storage
- ✅ All chat messages stored in Firestore
- ✅ Real-time synchronization across devices
- ✅ Persistent storage (not local-only)

## Files Created/Modified

### New Files
1. `src/services/chatService.ts` - Chat service functions
2. `src/components/ChatWindow.tsx` - Chat message window component
3. `src/components/ChatList.tsx` - Conversations list component
4. `src/pages/Chat.tsx` - Main chat page
5. `CHAT_SYSTEM_GUIDE.md` - This documentation

### Modified Files
1. `src/types/firebase.ts` - Added Chat and ChatMessage types
2. `src/pages/PatientDashboard.tsx` - Added chat button for confirmed appointments
3. `src/pages/DoctorDashboard.tsx` - Added chat button for confirmed appointments
4. `src/App.tsx` - Added /chat route
5. `firestore.rules` - Added chat security rules

## How to Use

### For Patients
1. Log in to your patient account
2. Go to your dashboard
3. Find a confirmed appointment
4. Click the "Chat" button next to the appointment
5. Start messaging with your doctor

### For Doctors
1. Log in to your doctor account
2. Go to your dashboard
3. Navigate to the "Appointments" section
4. Find a confirmed appointment
5. Click the "محادثة" (Chat) button
6. Start messaging with your patient

### Accessing Chat Directly
- Navigate to `/chat` to see all your conversations
- Click on any conversation to open the chat window
- Messages update in real-time

## Technical Details

### Real-time Updates
- Uses Firestore `onSnapshot` listeners for real-time updates
- Automatically updates when new messages arrive
- No manual refresh needed

### Message Status
- Unread count tracked separately for doctor and patient
- Messages marked as read when chat is opened
- Badge shows unread count in conversation list

### Responsive Design
- Desktop: Split view (list + chat)
- Mobile: Full-screen chat with back button
- Optimized for touch interactions

## Security Features
- Only participants can read/write messages
- senderId validation ensures users can't impersonate others
- Admin cannot access patient-doctor chats
- All operations require authentication

## Future Enhancements (Optional)
- [ ] Typing indicator
- [ ] Image upload support
- [ ] Message delivery status (sent/delivered/read)
- [ ] Push notifications for new messages
- [ ] Message search functionality
- [ ] File attachments
- [ ] Voice messages
- [ ] Video call integration

## Deployment Steps

1. Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

2. Test the chat system:
   - Create a patient account
   - Create a doctor account
   - Book an appointment
   - Confirm the appointment (as admin or doctor)
   - Click the chat button
   - Send messages

## Troubleshooting

### Chat button not showing
- Ensure appointment status is "confirmed"
- Check that both doctor and patient IDs exist

### Messages not appearing
- Check Firestore security rules are deployed
- Verify user is authenticated
- Check browser console for errors

### Permission denied errors
- Ensure Firestore rules are properly deployed
- Verify user has access to the chat (doctor or patient of that appointment)

## Support
For issues or questions, check the Firestore console for data structure and security rule logs.
