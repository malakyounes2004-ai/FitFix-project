// src/controllers/chatController.js
import admin from 'firebase-admin';
import { db } from '../firebase.js';

const FieldValue = admin.firestore.FieldValue;

/**
 * Generate a unique chat ID between two users based on their roles
 * Format: admin_{adminId}__emp_{employeeId} | emp_{employeeId}__user_{userId} | admin_{adminId}__user_{userId}
 * Always sorts to ensure consistent chat ID regardless of who initiates
 */
export async function generateChatId(userId1, userId2) {
  // Get roles for both users
  const user1Doc = await db.collection('users').doc(userId1).get();
  const user2Doc = await db.collection('users').doc(userId2).get();
  
  if (!user1Doc.exists || !user2Doc.exists) {
    // Fallback to old format if users not found
    const sorted = [userId1, userId2].sort();
    return `${sorted[0]}_${sorted[1]}`;
  }
  
  const role1 = user1Doc.data().role || 'user';
  const role2 = user2Doc.data().role || 'user';
  
  // Create role-prefixed IDs
  const prefix1 = role1 === 'admin' ? `admin_${userId1}` : role1 === 'employee' ? `emp_${userId1}` : `user_${userId1}`;
  const prefix2 = role2 === 'admin' ? `admin_${userId2}` : role2 === 'employee' ? `emp_${userId2}` : `user_${userId2}`;
  
  // Sort to ensure consistent order (admin < emp < user)
  const roleOrder = { admin: 0, employee: 1, user: 2 };
  const order1 = roleOrder[role1] || 2;
  const order2 = roleOrder[role2] || 2;
  
  if (order1 < order2 || (order1 === order2 && prefix1 < prefix2)) {
    return `${prefix1}__${prefix2}`;
  } else {
    return `${prefix2}__${prefix1}`;
  }
}

/**
 * Synchronous version for backward compatibility (uses simple format)
 * Use generateChatIdAsync for role-based format
 */
export function generateChatIdSync(userId1, userId2) {
  const sorted = [userId1, userId2].sort();
  return `${sorted[0]}_${sorted[1]}`;
}

/**
 * Send a message
 * POST /api/chat/send
 */
export async function sendMessage(req, res) {
  try {
    const { recipientId, content, type = 'text' } = req.body;
    const senderId = req.user.uid;
    const senderRole = req.user.role;

    if (!recipientId || !content) {
      return res.status(400).json({
        success: false,
        message: 'recipientId and content are required'
      });
    }

    // Validate chat participants based on roles
    if (senderRole === 'admin') {
      // Admin can chat with employees and users
      const recipientDoc = await db.collection('users').doc(recipientId).get();
      if (!recipientDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Recipient not found'
        });
      }
      const recipientRole = recipientDoc.data().role;
      if (recipientRole !== 'employee' && recipientRole !== 'user') {
        return res.status(403).json({
          success: false,
          message: 'Admin can only chat with employees and users'
        });
      }
    } else if (senderRole === 'employee') {
      // Employee can chat with admin and assigned users
      const recipientDoc = await db.collection('users').doc(recipientId).get();
      if (!recipientDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Recipient not found'
        });
      }
      const recipientRole = recipientDoc.data().role;
      if (recipientRole === 'user') {
        // Check if user is assigned to this employee
        const userData = recipientDoc.data();
        if (userData.assignedEmployeeId !== senderId) {
          return res.status(403).json({
            success: false,
            message: 'You can only chat with users assigned to you'
          });
        }
      } else if (recipientRole === 'admin') {
        // Employee can chat with admin
        // Allow this
      } else {
        return res.status(403).json({
          success: false,
          message: 'Employees can only chat with admin and assigned users'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only admin and employees can send messages'
      });
    }

    const chatId = await generateChatId(senderId, recipientId);
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // Create message object
    // Note: Cannot use FieldValue.serverTimestamp() inside arrays, so use Timestamp.now()
    const now = admin.firestore.Timestamp.now();
    const messageData = {
      messageId,
      chatId,
      senderId,
      senderRole,
      recipientId,
      content,
      type,
      read: false,
      readAt: null,
      createdAt: now,
      reactions: {} // Initialize empty reactions object
    };

    // Update or create chat document
    const chatRef = db.collection('chats').doc(chatId);
    const chatDoc = await chatRef.get();

    const chatData = {
      chatId,
      participants: [senderId, recipientId].sort(),
      lastMessage: {
        content,
        senderId,
        senderRole,
        createdAt: FieldValue.serverTimestamp()
      },
      lastActivity: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    if (!chatDoc.exists) {
      // Create new chat
      chatData.createdAt = FieldValue.serverTimestamp();
      chatData.unreadCount = {
        [senderId]: 0,
        [recipientId]: 1
      };
      await chatRef.set(chatData);
    } else {
      // Update existing chat
      const existingData = chatDoc.data();
      const unreadCount = existingData.unreadCount || {};
      unreadCount[senderId] = 0;
      unreadCount[recipientId] = (unreadCount[recipientId] || 0) + 1;
      
      await chatRef.update({
        ...chatData,
        unreadCount
      });
    }

    // Store message in subcollection: chats/{chatId}/messages/{messageId}
    const messageRef = chatRef.collection('messages').doc(messageId);
    await messageRef.set(messageData);

    // Also save to messages collection for backup and easier querying
    try {
      await db.collection('messages').doc(messageId).set(messageData);
    } catch (msgError) {
      console.warn('Failed to save message to messages collection (non-critical):', msgError);
    }

    // Create notification for recipient
    try {
      const recipientDoc = await db.collection('users').doc(recipientId).get();
      const recipientData = recipientDoc.data();
      const senderDoc = await db.collection('users').doc(senderId).get();
      const senderData = senderDoc.data();

      await db.collection('notifications').add({
        type: 'message',
        title: `New message from ${senderData?.displayName || senderData?.email || 'Someone'}`,
        message: content.length > 100 ? content.substring(0, 100) + '...' : content,
        userId: recipientId,
        chatId,
        messageId,
        seen: false,
        createdAt: FieldValue.serverTimestamp(),
        meta: {
          senderId,
          senderRole,
          chatType: 'message'
        }
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
      // Don't fail the message send if notification fails
    }

    // Convert Timestamp to Date for API response
    const createdAtDate = messageData.createdAt.toDate ? messageData.createdAt.toDate() : new Date();

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        messageId,
        chatId,
        senderId,
        senderRole,
        recipientId,
        content,
        type,
        read: false,
        readAt: null,
        createdAt: createdAtDate
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message'
    });
  }
}

/**
 * Get all chats for current user
 * GET /api/chat/chats
 */
export async function getChats(req, res) {
  try {
    const userId = req.user.uid;
    const userRole = req.user.role;

    // Get all chats where user is a participant
    // Fetch without orderBy to avoid index requirement, then sort manually
    // This works without needing to create a composite index in Firestore
    const chatsSnapshot = await db
      .collection('chats')
      .where('participants', 'array-contains', userId)
      .get();

    const chats = [];
    
    for (const chatDoc of chatsSnapshot.docs) {
      const chatData = chatDoc.data();
      const otherParticipantId = chatData.participants.find(id => id !== userId);
      
      if (!otherParticipantId) continue;

      // Get other participant's info
      const otherParticipantDoc = await db.collection('users').doc(otherParticipantId).get();
      if (!otherParticipantDoc.exists) continue;

      const otherParticipantData = otherParticipantDoc.data();
      const unreadCount = chatData.unreadCount?.[userId] || 0;

      chats.push({
        chatId: chatData.chatId,
        otherParticipant: {
          uid: otherParticipantId,
          displayName: otherParticipantData.displayName || otherParticipantData.email,
          email: otherParticipantData.email,
          role: otherParticipantData.role,
          photoURL: otherParticipantData.photoURL
        },
        lastMessage: chatData.lastMessage,
        unreadCount,
        lastActivity: chatData.lastActivity,
        createdAt: chatData.createdAt
      });
    }

    // Sort manually (always sort to ensure consistent ordering)
    if (chats.length > 0) {
      chats.sort((a, b) => {
        // Get timestamps, handling various Firestore Timestamp formats
        const getTimestamp = (item) => {
          if (!item) return 0;
          // Firestore Timestamp object
          if (item.toDate && typeof item.toDate === 'function') {
            return item.toDate().getTime();
          }
          // Already a Date
          if (item instanceof Date) {
            return item.getTime();
          }
          // Timestamp with seconds
          if (item.seconds) {
            return item.seconds * 1000 + (item.nanoseconds || 0) / 1000000;
          }
          // String or number
          if (typeof item === 'string' || typeof item === 'number') {
            return new Date(item).getTime();
          }
          return 0;
        };
        
        const aTime = getTimestamp(a.lastActivity) || getTimestamp(a.createdAt) || 0;
        const bTime = getTimestamp(b.lastActivity) || getTimestamp(b.createdAt) || 0;
        return bTime - aTime; // Descending order (newest first)
      });
    }

    return res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Get chats error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch chats'
    });
  }
}

/**
 * Create or get chat between two users
 * POST /api/chat/create-or-get
 */
export async function createOrGetChat(req, res) {
  try {
    const { otherUserId } = req.body;
    const currentUserId = req.user.uid;
    const currentUserRole = req.user.role;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'otherUserId is required'
      });
    }

    // Validate participants based on roles
    const otherUserDoc = await db.collection('users').doc(otherUserId).get();
    if (!otherUserDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Other user not found'
      });
    }

    const otherUserRole = otherUserDoc.data().role;

    // Role validation
    if (currentUserRole === 'admin') {
      if (otherUserRole !== 'employee' && otherUserRole !== 'user') {
        return res.status(403).json({
          success: false,
          message: 'Admin can only chat with employees and users'
        });
      }
    } else if (currentUserRole === 'employee') {
      if (otherUserRole === 'user') {
        const userData = otherUserDoc.data();
        if (userData.assignedEmployeeId !== currentUserId) {
          return res.status(403).json({
            success: false,
            message: 'You can only chat with users assigned to you'
          });
        }
      } else if (otherUserRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Employees can only chat with admin and assigned users'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only admin and employees can create chats'
      });
    }

    const chatId = await generateChatId(currentUserId, otherUserId);
    const chatRef = db.collection('chats').doc(chatId);
    const chatDoc = await chatRef.get();

    if (chatDoc.exists) {
      // Chat already exists, return it
      const chatData = chatDoc.data();
      const otherParticipantData = otherUserDoc.data();

      return res.json({
        success: true,
        data: {
          chatId: chatData.chatId,
          otherParticipant: {
            uid: otherUserId,
            displayName: otherParticipantData.displayName || otherParticipantData.email,
            email: otherParticipantData.email,
            role: otherParticipantData.role,
            photoURL: otherParticipantData.photoURL
          },
          lastMessage: chatData.lastMessage,
          unreadCount: chatData.unreadCount?.[currentUserId] || 0,
          lastActivity: chatData.lastActivity,
          createdAt: chatData.createdAt
        }
      });
    }

    // Create new empty chat
    const otherParticipantData = otherUserDoc.data();
    const newChatData = {
      chatId,
      participants: [currentUserId, otherUserId].sort(),
      lastMessage: null,
      lastActivity: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      unreadCount: {
        [currentUserId]: 0,
        [otherUserId]: 0
      }
    };

    await chatRef.set(newChatData);

    return res.json({
      success: true,
      data: {
        chatId,
        otherParticipant: {
          uid: otherUserId,
          displayName: otherParticipantData.displayName || otherParticipantData.email,
          email: otherParticipantData.email,
          role: otherParticipantData.role,
          photoURL: otherParticipantData.photoURL
        },
        lastMessage: null,
        unreadCount: 0,
        lastActivity: null,
        createdAt: null
      }
    });
  } catch (error) {
    console.error('Create or get chat error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create or get chat'
    });
  }
}

/**
 * Helper function to convert Firestore Timestamp to Date
 */
function convertTimestamp(timestamp) {
  if (!timestamp) return null;
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (timestamp.seconds) {
    // Firestore Timestamp object
    return new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
  }
  return null;
}

/**
 * Get messages for a specific chat
 * GET /api/chat/messages/:chatId
 */
export async function getMessages(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.uid;

    console.log(`[getMessages] Fetching messages for chatId: ${chatId}, userId: ${userId}`);

    // Verify user is a participant in this chat
    const chatDoc = await db.collection('chats').doc(chatId).get();
    if (!chatDoc.exists) {
      console.log(`[getMessages] Chat not found: ${chatId}`);
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const chatData = chatDoc.data();
    if (!chatData.participants || !chatData.participants.includes(userId)) {
      console.log(`[getMessages] Access denied for userId: ${userId} in chat: ${chatId}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get messages from subcollection: chats/{chatId}/messages/
    let messages = [];
    const chatRef = db.collection('chats').doc(chatId);
    
    try {
      const messagesSnapshot = await chatRef
        .collection('messages')
        .orderBy('createdAt', 'asc')
        .limit(100)
        .get();

      messages = messagesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          messageId: data.messageId,
          chatId: data.chatId,
          senderId: data.senderId,
          senderRole: data.senderRole,
          recipientId: data.recipientId,
          content: data.content,
          type: data.type,
          read: data.read || false,
          readAt: convertTimestamp(data.readAt),
          createdAt: convertTimestamp(data.createdAt),
          reactions: data.reactions || {}
        };
      });
      console.log(`[getMessages] Found ${messages.length} messages in subcollection`);
    } catch (msgError) {
      console.error('[getMessages] Failed to get messages from subcollection:', msgError);
      // Fallback: Try messages collection
      try {
        const messagesSnapshot = await db
          .collection('messages')
          .where('chatId', '==', chatId)
          .orderBy('createdAt', 'asc')
          .limit(100)
          .get();

        messages = messagesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            messageId: data.messageId,
            chatId: data.chatId,
            senderId: data.senderId,
            senderRole: data.senderRole,
            recipientId: data.recipientId,
            content: data.content,
            type: data.type,
            read: data.read || false,
            readAt: convertTimestamp(data.readAt),
            createdAt: convertTimestamp(data.createdAt),
            reactions: data.reactions || {}
          };
        });
        console.log(`[getMessages] Found ${messages.length} messages in messages collection (fallback)`);
      } catch (fallbackError) {
        console.error('[getMessages] Failed to get messages from fallback collection:', fallbackError);
        messages = [];
      }
    }

    // Mark messages as read if they were sent to current user
    const unreadMessages = messages.filter(
      msg => msg.recipientId === userId && !msg.read
    );

    if (unreadMessages.length > 0) {
      console.log(`[getMessages] Marking ${unreadMessages.length} messages as read`);
      try {
        const now = admin.firestore.Timestamp.now();
        const batch = db.batch();
        
        // Update messages in subcollection
        unreadMessages.forEach(msg => {
          const messageRef = chatRef.collection('messages').doc(msg.messageId);
          batch.update(messageRef, {
            read: true,
            readAt: now
          });
        });

        // Update unread count in chat document
        const unreadCount = chatData.unreadCount || {};
        unreadCount[userId] = 0;
        batch.update(chatRef, { unreadCount });

        await batch.commit();

        // Also update in messages collection if it exists
        try {
          const backupBatch = db.batch();
          unreadMessages.forEach(msg => {
            const msgRef = db.collection('messages').doc(msg.messageId);
            backupBatch.update(msgRef, {
              read: true,
              readAt: now
            });
          });
          await backupBatch.commit();
        } catch (msgError) {
          console.warn('[getMessages] Failed to update messages in messages collection (non-critical):', msgError);
        }
      } catch (updateError) {
        console.error('[getMessages] Failed to mark messages as read:', updateError);
        // Don't fail the request if marking as read fails
      }
    }

    console.log(`[getMessages] Returning ${messages.length} messages`);
    return res.json({
      success: true,
      data: messages // Already sorted oldest first
    });
  } catch (error) {
    console.error('[getMessages] Error:', error);
    console.error('[getMessages] Error stack:', error.stack);
    console.error('Get messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
}

/**
 * Mark messages as read
 * POST /api/chat/mark-read/:chatId
 */
export async function markMessagesAsRead(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.uid;

    // Verify user is a participant
    const chatDoc = await db.collection('chats').doc(chatId).get();
    if (!chatDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const chatData = chatDoc.data();
    if (!chatData.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get unread messages from subcollection
    const chatRef = db.collection('chats').doc(chatId);
    const messagesSnapshot = await chatRef
      .collection('messages')
      .where('recipientId', '==', userId)
      .where('read', '==', false)
      .get();

    const unreadMessages = messagesSnapshot.docs.map(doc => ({
      messageId: doc.id,
      ...doc.data()
    }));

    if (unreadMessages.length === 0) {
      return res.json({
        success: true,
        message: 'No unread messages'
      });
    }

    // Mark as read in subcollection
    const now = admin.firestore.Timestamp.now();
    const batch = db.batch();
    
    unreadMessages.forEach(msg => {
      const messageRef = chatRef.collection('messages').doc(msg.messageId);
      batch.update(messageRef, {
        read: true,
        readAt: now
      });
    });

    // Update unread count in chat document
    const unreadCount = chatData.unreadCount || {};
    unreadCount[userId] = 0;
    batch.update(chatRef, { unreadCount });

    await batch.commit();

    // Also update in messages collection if it exists
    try {
      const backupBatch = db.batch();
      unreadMessages.forEach(msg => {
        const msgRef = db.collection('messages').doc(msg.messageId);
        backupBatch.update(msgRef, {
          read: true,
          readAt: now
        });
      });
      await backupBatch.commit();
    } catch (msgError) {
      console.warn('Failed to update messages in messages collection (non-critical):', msgError);
    }

    return res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
}

/**
 * Get unread message count
 * GET /api/chat/unread-count
 */
export async function getUnreadCount(req, res) {
  try {
    const userId = req.user.uid;

    const chatsSnapshot = await db
      .collection('chats')
      .where('participants', 'array-contains', userId)
      .get();

    let totalUnread = 0;
    chatsSnapshot.forEach(doc => {
      const chatData = doc.data();
      totalUnread += chatData.unreadCount?.[userId] || 0;
    });

    return res.json({
      success: true,
      data: { unreadCount: totalUnread }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
}

/**
 * Update user presence (online/offline)
 * POST /api/chat/presence
 */
export async function updatePresence(req, res) {
  try {
    const userId = req.user.uid;
    const { status } = req.body; // 'online' or 'offline'

    const presenceRef = db.collection('presence').doc(userId);
    
    if (status === 'online') {
      await presenceRef.set({
        status: 'online',
        lastSeen: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    } else {
      await presenceRef.set({
        status: 'offline',
        lastSeen: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    }

    return res.json({
      success: true,
      message: 'Presence updated'
    });
  } catch (error) {
    console.error('Update presence error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update presence'
    });
  }
}

/**
 * Get user presence
 * GET /api/chat/presence/:userId
 */
export async function getPresence(req, res) {
  try {
    const { userId } = req.params;

    const presenceRef = db.collection('presence').doc(userId);
    const presenceDoc = await presenceRef.get();

    if (!presenceDoc.exists) {
      return res.json({
        success: true,
        data: { status: 'offline', lastSeen: null }
      });
    }

    const presenceData = presenceDoc.data();
    
    // Check if user is still online (within last 30 seconds)
    const lastSeen = presenceData.lastSeen?.toDate?.() || new Date();
    const now = new Date();
    const diffSeconds = (now - lastSeen) / 1000;
    
    const isOnline = presenceData.status === 'online' && diffSeconds < 30;

    return res.json({
      success: true,
      data: {
        status: isOnline ? 'online' : 'offline',
        lastSeen: lastSeen.toISOString()
      }
    });
  } catch (error) {
    console.error('Get presence error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get presence'
    });
  }
}

/**
 * Set typing status
 * POST /api/chat/typing
 */
export async function setTyping(req, res) {
  try {
    const { chatId, isTyping } = req.body;
    const userId = req.user.uid;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'chatId is required'
      });
    }

    // Verify user is a participant
    const chatDoc = await db.collection('chats').doc(chatId).get();
    if (!chatDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const chatData = chatDoc.data();
    if (!chatData.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const typingRef = db.collection('typing').doc(chatId);
    
    if (isTyping) {
      await typingRef.set({
        [userId]: true,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    } else {
      const typingDoc = await typingRef.get();
      if (typingDoc.exists) {
        const typingData = typingDoc.data();
        delete typingData[userId];
        if (Object.keys(typingData).length === 1 && typingData.updatedAt) {
          // Only updatedAt left, delete the document
          await typingRef.delete();
        } else {
          await typingRef.update({
            [userId]: FieldValue.delete(),
            updatedAt: FieldValue.serverTimestamp()
          });
        }
      }
    }

    return res.json({
      success: true,
      message: 'Typing status updated'
    });
  } catch (error) {
    console.error('Set typing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update typing status'
    });
  }
}

/**
 * Add or remove reaction to a message
 * POST /api/chat/reaction
 */
export async function toggleReaction(req, res) {
  try {
    const { chatId, messageId, emoji } = req.body;
    const userId = req.user.uid;

    if (!chatId || !messageId || !emoji) {
      return res.status(400).json({
        success: false,
        message: 'chatId, messageId, and emoji are required'
      });
    }

    // Validate emoji
    const allowedEmojis = ['❤️', '😂', '👍', '😢', '😡', '🙏'];
    if (!allowedEmojis.includes(emoji)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid emoji. Allowed: ❤️ 😂 👍 😢 😡 🙏'
      });
    }

    // Verify user is a participant
    const chatDoc = await db.collection('chats').doc(chatId).get();
    if (!chatDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const chatData = chatDoc.data();
    if (!chatData.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get message from subcollection
    const chatRef = db.collection('chats').doc(chatId);
    const messageRef = chatRef.collection('messages').doc(messageId);
    const messageDoc = await messageRef.get();
    
    if (!messageDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const message = messageDoc.data();
    const reactions = message.reactions || {};
    const emojiReactions = reactions[emoji] || [];

    // Toggle reaction: if user already reacted, remove; otherwise add
    let updatedReactions;
    if (emojiReactions.includes(userId)) {
      // Remove reaction
      const filtered = emojiReactions.filter(uid => uid !== userId);
      if (filtered.length === 0) {
        // Remove emoji key if no reactions left
        const { [emoji]: removed, ...rest } = reactions;
        updatedReactions = rest;
      } else {
        updatedReactions = { ...reactions, [emoji]: filtered };
      }
    } else {
      // Add reaction
      updatedReactions = { ...reactions, [emoji]: [...emojiReactions, userId] };
    }

    // Update message in subcollection
    await messageRef.update({
      reactions: updatedReactions
    });

    // Also update in messages collection if it exists
    try {
      const msgRef = db.collection('messages').doc(messageId);
      await msgRef.update({
        reactions: updatedReactions
      });
    } catch (msgError) {
      console.warn('Failed to update reaction in messages collection (non-critical):', msgError);
    }

    return res.json({
      success: true,
      message: 'Reaction updated',
      data: {
        messageId,
        reactions: updatedReactions
      }
    });
  } catch (error) {
    console.error('Toggle reaction error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update reaction'
    });
  }
}

