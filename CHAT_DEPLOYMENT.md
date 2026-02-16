# Chat System Deployment Guide

## Prerequisites
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project initialized
- Logged in to Firebase CLI (`firebase login`)

## Deployment Steps

### 1. Deploy Firestore Security Rules

The updated Firestore rules include chat permissions. Deploy them using:

```bash
firebase deploy --only firestore:rules
```

### 2. Verify Deployment

After deployment, verify the rules in the Firebase Console:
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Click on "Rules" tab
4. Verify the chat rules are present

### 3. Test the Chat System

#### Create Test Accounts
1. Create a patient account
2. Create a doctor account

#### Create an Appointment
1. Log in as patient
2. Book an appointment with the doctor
3. Log in as admin (or doctor) and confirm the appointment

#### Test Chat
1. Log in as patient
2. Go to dashboard
3. Find the confirmed appointment
4. Click the "Chat" button
5. Send a message
6. Log in as doctor
7. Go to dashboard → Appointments
8. Click the "محادثة" (Chat) button
9. Verify you can see the patient's message
10. Reply to the message
11. Log back in as patient and verify real-time updates

### 4. Verify Security Rules

Test that security rules are working:

#### Test 1: Unauthorized Access
- Try to access a chat that doesn't belong to you
- Should receive "Permission denied" error

#### Test 2: Admin Cannot Access Chat
- Log in as admin
- Try to navigate to `/chat`
- Should be redirected to admin dashboard

#### Test 3: Message Validation
- Try to send a message with a different senderId
- Should be rejected by security rules

## Firestore Indexes

The chat system uses the following queries that may require indexes:

### Chats Collection
```
Collection: chats
Fields: doctorId (Ascending), lastMessageTime (Descending)
Fields: patientId (Ascending), lastMessageTime (Descending)
```

### Messages Subcollection
```
Collection: chats/{chatId}/messages
Fields: createdAt (Ascending)
Fields: read (Ascending), senderId (Ascending)
```

### Create Indexes

If you encounter "index required" errors, create indexes using:

1. Click the error link in the browser console
2. Or manually create in Firebase Console:
   - Go to Firestore Database
   - Click "Indexes" tab
   - Click "Create Index"
   - Add the required fields

Alternatively, use the Firebase CLI:

```bash
firebase deploy --only firestore:indexes
```

## Monitoring

### Check Chat Activity
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Browse the `chats` collection
4. Check individual chat documents and their `messages` subcollection

### Monitor Real-time Listeners
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Click "Usage" tab
4. Monitor read/write operations

## Troubleshooting

### Chat Button Not Showing
- Verify appointment status is "confirmed"
- Check that both doctorId and patientId exist
- Verify user is logged in

### Messages Not Appearing
- Check browser console for errors
- Verify Firestore rules are deployed
- Check that user has permission to access the chat
- Verify internet connection

### Permission Denied Errors
- Ensure Firestore rules are deployed correctly
- Verify user is authenticated
- Check that user is either the doctor or patient of the chat

### Real-time Updates Not Working
- Check that onSnapshot listeners are properly set up
- Verify Firestore connection is active
- Check browser console for WebSocket errors

## Performance Optimization

### Limit Message History
To prevent loading too many messages, consider adding pagination:

```typescript
const messagesQuery = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(50)
);
```

### Clean Up Old Chats
Consider implementing a cleanup function for old completed appointments:

```typescript
// Delete chats for appointments older than 6 months
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
```

## Security Best Practices

1. Never expose sensitive patient information in chat
2. Implement message content moderation if needed
3. Consider adding message encryption for sensitive data
4. Regularly audit chat access logs
5. Implement rate limiting to prevent spam

## Backup and Recovery

### Backup Chat Data
Use Firebase's export feature:

```bash
gcloud firestore export gs://[BUCKET_NAME]/[EXPORT_FOLDER]
```

### Restore Chat Data
```bash
gcloud firestore import gs://[BUCKET_NAME]/[EXPORT_FOLDER]
```

## Support

For issues or questions:
1. Check Firebase Console logs
2. Review Firestore security rules
3. Check browser console for errors
4. Verify network connectivity
5. Test with different user accounts

## Next Steps

After successful deployment:
1. Monitor chat usage and performance
2. Gather user feedback
3. Consider implementing additional features:
   - Typing indicators
   - Image uploads
   - Push notifications
   - Message search
   - File attachments
