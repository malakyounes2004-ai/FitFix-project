# Real-Time Chat System Implementation

## Overview
A complete real-time chat system for employees and admin with instant messaging, real-time updates, and persistent storage.

## Chat ID Format
The system uses role-based chat IDs for consistency:
- **Employee ↔ Admin**: `admin_{adminId}__emp_{employeeId}` (admin always comes first due to role ordering)
- **Employee ↔ User**: `emp_{employeeId}__user_{userId}`
- **Admin ↔ User**: `admin_{adminId}__user_{userId}`

## Firestore Structure

```
chats/
  {chatId}/  (e.g., "admin_abc123__emp_def456")
    participants: [employeeId, adminId]
    lastMessage: {
      content: string
      senderId: string
      senderRole: string
      createdAt: Timestamp
    }
    updatedAt: Timestamp
    lastActivity: Timestamp
    unreadCount: {
      [userId]: number
    }
    messages/  (subcollection)
      {messageId}/
        senderId: string
        senderRole: string
        recipientId: string
        content: string (text field)
        type: string
        read: boolean
        readAt: Timestamp | null
        createdAt: Timestamp
        reactions: {
          "❤️": [userId1, userId2],
          "😂": [userId3]
        }
```

## Features Implemented

### 1. Employee Chat Page
- ✅ Admin always appears as a chat contact
- ✅ Admin shows as clickable if no chat exists
- ✅ Admin chat shows last message and unread count if exists
- ✅ Emerald green styling for admin chat
- ✅ Real-time chat list updates

### 2. Real-Time Messaging
- ✅ Messages appear instantly (optimistic UI)
- ✅ Firestore `onSnapshot` listener for messages subcollection
- ✅ Messages persist in database
- ✅ Auto-scroll to latest message
- ✅ No page refresh needed

### 3. Chat ID Structure
- ✅ Role-based format: `admin_{adminId}__emp_{employeeId}`
- ✅ Consistent generation (always sorted by role order)
- ✅ Unique chats per employee-admin pair

### 4. Additional Features
- ✅ Last message display
- ✅ Unread count badges
- ✅ Sender role badge on messages (Admin/Employee/User)
- ✅ Read receipts (✓ / ✓✓)
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Message reactions
- ✅ Error handling for all operations
- ✅ Loading states

## Backend Endpoints

### POST `/api/chat/send`
Send a message. Creates chat if it doesn't exist.

**Request:**
```json
{
  "recipientId": "user_id",
  "content": "Message text",
  "type": "text"
}
```

### GET `/api/chat/chats`
Get all chats for current user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "chatId": "admin_abc__emp_def",
      "otherParticipant": {
        "uid": "admin_id",
        "displayName": "Admin",
        "email": "admin@example.com",
        "role": "admin",
        "photoURL": "url"
      },
      "lastMessage": {...},
      "unreadCount": 2,
      "lastActivity": "timestamp"
    }
  ]
}
```

### GET `/api/chat/messages/:chatId`
Get messages for a specific chat.

### POST `/api/chat/create-or-get`
Create or get existing chat between two users.

### POST `/api/chat/mark-read/:chatId`
Mark messages as read.

## Frontend Components

### EmployeeChat.jsx
Main chat component for employees with:
- Admin chat always visible
- Real-time message listeners
- Optimistic UI updates
- Auto-scroll functionality
- Error handling

## Real-Time Updates

1. **Message Listener**: Listens to `chats/{chatId}/messages/` subcollection
2. **Chat Listener**: Listens to `chats` collection for lastMessage and unreadCount updates
3. **Presence Listener**: Tracks online/offline status
4. **Typing Listener**: Shows typing indicators

## Error Handling

- Authentication errors → Redirect to login
- Network errors → Show user-friendly messages
- Chat not found → Auto-create chat
- Message send failures → Restore input and show error
- Real-time listener failures → Show notification

## Testing Checklist

- [ ] Admin appears in employee chat list
- [ ] Messages send instantly without refresh
- [ ] Messages persist after page reload
- [ ] Real-time updates work (open in two browsers)
- [ ] Unread counts update correctly
- [ ] Auto-scroll works on new messages
- [ ] Sender role displays correctly
- [ ] Error handling works for all scenarios

