# Chat System - Quick Reference

## 🚀 Quick Start

### Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### Access Chat
- **URL**: `/chat`
- **Patient**: Dashboard → Confirmed Appointment → "Chat" button
- **Doctor**: Dashboard → Appointments → "محادثة" button

## 📋 Key Components

### ChatWindow
- Displays messages in real-time
- Auto-scrolls to latest message
- Marks messages as read
- Send new messages

### ChatList
- Shows all conversations
- Displays unread counts
- Shows last message preview
- Real-time updates

### Chat Page
- Main chat interface
- Responsive layout
- Handles authentication

## 🔑 Key Services

```typescript
// Get or create chat
getOrCreateChat(appointmentId, doctorId, patientId, doctorName, patientName)

// Send message
sendMessage(chatId, senderId, senderRole, senderName, text)

// Listen to messages
listenToMessages(chatId, callback)

// Get user chats
getUserChats(userId, role, callback)

// Mark as read
markMessagesAsRead(chatId, userId, role)
```

## 🗂️ Firestore Structure

```
chats/{chatId}
  - doctorId, patientId, appointmentId
  - doctorName, patientName
  - lastMessage, lastMessageTime
  - unreadCount: {doctor, patient}
  
  messages/{messageId}
    - senderId, senderRole, senderName
    - text, createdAt, read
```

## 🔒 Security Rules

- Only doctor and patient can access their chat
- senderId must match authenticated user
- Admin cannot access chats
- All operations require authentication

## 🎨 UI Features

- WhatsApp-style layout
- Blue bubbles for own messages
- Gray bubbles for received messages
- Unread count badges
- Responsive mobile/desktop

## ✅ Testing Steps

1. Create patient and doctor accounts
2. Book appointment
3. Confirm appointment (status = 'confirmed')
4. Click chat button
5. Send messages
6. Verify real-time updates
7. Check unread counts
8. Test on mobile and desktop

## 📱 Routes

- `/chat` - Main chat page
- Requires authentication
- Redirects admin to dashboard

## 🐛 Troubleshooting

**Chat button not showing?**
- Check appointment status is 'confirmed'

**Permission denied?**
- Deploy Firestore rules
- Verify user authentication

**Messages not updating?**
- Check internet connection
- Verify Firestore listeners

## 📚 Documentation

- `CHAT_SYSTEM_GUIDE.md` - Full documentation
- `CHAT_DEPLOYMENT.md` - Deployment guide
- `CHAT_FEATURE_SUMMARY.md` - Implementation summary
