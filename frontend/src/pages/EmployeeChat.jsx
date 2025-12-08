import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSend, FiSearch, FiMessageCircle, FiCheck, FiCheckCircle, FiSmile } from 'react-icons/fi';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../context/ThemeContext';
import EmployeeSidebar from '../components/EmployeeSidebar';
// Safely import Firebase - app will work even if Firebase is not configured
import { db } from '../config/firebaseClient.js';
import { collection, query, where, orderBy, onSnapshot, doc } from 'firebase/firestore';

// Helper function to generate consistent chatId (matches backend format)
// Format: admin_{adminId}__emp_{employeeId} | emp_{employeeId}__user_{userId} | admin_{adminId}__user_{userId}
const generateChatId = async (userId1, role1, userId2, role2) => {
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
};

// Synchronous fallback for backward compatibility
const generateChatIdSync = (userId1, userId2) => {
  const sorted = [userId1, userId2].sort();
  return `${sorted[0]}_${sorted[1]}`;
};

// Helper to convert Firestore Timestamp to Date
const convertTimestamp = (ts) => {
  if (!ts) return null;
  if (ts.toDate && typeof ts.toDate === 'function') return ts.toDate();
  if (ts instanceof Date) return ts;
  if (ts.seconds) return new Date(ts.seconds * 1000 + (ts.nanoseconds || 0) / 1000000);
  return null;
};

const EmployeeChat = () => {
  const { showNotification } = useNotification();
  const { isDarkMode } = useTheme();
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminInfo, setAdminInfo] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'users'
  const [onlineStatus, setOnlineStatus] = useState({});
  const [typingStatus, setTypingStatus] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const presenceUnsubscribesRef = useRef({});
  const typingUnsubscribesRef = useRef({});
  const optimisticMessagesRef = useRef(new Map()); // Track optimistic messages
  const [showReactionPicker, setShowReactionPicker] = useState(null); // messageId for which to show picker
  const longPressTimerRef = useRef(null);
  const pollingIntervalRef = useRef(null); // Fallback polling when real-time fails
  const messagesRef = useRef([]); // Keep reference to current messages

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Reaction emojis - must match backend allowed emojis
  const reactionEmojis = ['❤️', '😂', '👍', '😢', '😡', '🙏'];

  // Handle long press for mobile
  const handleLongPress = (messageId, e) => {
    e.preventDefault();
    longPressTimerRef.current = setTimeout(() => {
      setShowReactionPicker(showReactionPicker === messageId ? null : messageId);
    }, 500); // 500ms long press
  };

  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => {
    loadChats();
    loadUsers();
    loadAdminInfo();
    updateMyPresence('online');
    
    // Set up real-time listener for chat list updates (updates lastMessage and unreadCount)
    if (db) {
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', currentUser.uid)
      );
      
      const chatsUnsubscribe = onSnapshot(chatsQuery, (snapshot) => {
        // Update existing chats with new data from Firestore
        setChats(prevChats => {
          const updatedChats = [...prevChats];
          let hasNewChats = false;
          
          snapshot.forEach((doc) => {
            const chatData = doc.data();
            const chatIndex = updatedChats.findIndex(c => c.chatId === chatData.chatId);
            
            if (chatIndex >= 0) {
              // Update existing chat with new lastMessage and unreadCount
              updatedChats[chatIndex] = {
                ...updatedChats[chatIndex],
                lastMessage: chatData.lastMessage,
                unreadCount: chatData.unreadCount?.[currentUser.uid] || 0,
                lastActivity: chatData.lastActivity
              };
            } else {
              // New chat detected - will be added when loadChats is called
              hasNewChats = true;
            }
          });
          
          // If new chats detected, reload chats list to get participant info
          if (hasNewChats) {
            console.log('[EmployeeChat] New chat detected, reloading chats list');
            // Reload chats immediately to show new chats
            loadChats();
          }
          
          return updatedChats;
        });
      }, (error) => {
        console.error('Error listening to chats:', error);
      });
      
      // Store unsubscribe function
      return () => {
        chatsUnsubscribe();
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        updateMyPresence('offline');
        // Clean up presence listeners
        Object.values(presenceUnsubscribesRef.current).forEach(unsub => unsub());
        Object.values(typingUnsubscribesRef.current).forEach(unsub => unsub());
      };
    }
    
    // Set up presence tracking
    const interval = setInterval(() => {
      updateMyPresence('online');
    }, 20000); // Update every 20 seconds
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      updateMyPresence('offline');
      clearInterval(interval);
      // Clean up presence listeners
      Object.values(presenceUnsubscribesRef.current).forEach(unsub => unsub());
      Object.values(typingUnsubscribesRef.current).forEach(unsub => unsub());
    };
  }, []);

  useEffect(() => {
    if (selectedChat && selectedChat.chatId) {
      console.log('[EmployeeChat] Chat selected, loading messages for:', selectedChat.chatId);
      // Clear messages immediately to prevent flicker
      setMessages([]);
      // Load messages and set up listeners immediately
      loadMessages(selectedChat.chatId).then(() => {
        console.log('[EmployeeChat] Messages loaded successfully');
        // Scroll to bottom after messages are loaded
        setTimeout(() => scrollToBottom(), 200);
      }).catch((error) => {
        console.error('[EmployeeChat] Failed to load messages:', error);
      });
      markAsRead(selectedChat.chatId);
      setupPresenceListener(selectedChat.otherParticipant.uid);
      setupTypingListener(selectedChat.chatId);
    }
    
    return () => {
      // Clean up listeners when chat changes
      if (selectedChat) {
        const presenceKey = selectedChat.otherParticipant?.uid;
        const typingKey = selectedChat.chatId;
        if (presenceKey && presenceUnsubscribesRef.current[presenceKey]) {
          presenceUnsubscribesRef.current[presenceKey]();
          delete presenceUnsubscribesRef.current[presenceKey];
        }
        if (typingKey && typingUnsubscribesRef.current[typingKey]) {
          typingUnsubscribesRef.current[typingKey]();
          delete typingUnsubscribesRef.current[typingKey];
        }
      }
      // Clean up message listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      // Clean up polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [selectedChat?.chatId]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        showNotification({ type: 'error', message: 'Not authenticated. Please login again.' });
        return;
      }
      
      const response = await axios.get('http://localhost:3000/api/chat/chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const loadedChats = response.data.data || [];
        console.log('[EmployeeChat] Loaded', loadedChats.length, 'chats from API');
        console.log('[EmployeeChat] Chats:', loadedChats.map(c => ({
          chatId: c.chatId,
          otherParticipant: c.otherParticipant?.displayName || c.otherParticipant?.email,
          role: c.otherParticipant?.role,
          lastMessage: c.lastMessage?.content?.substring(0, 30),
          unreadCount: c.unreadCount
        })));
        setChats(loadedChats);
        console.log('[EmployeeChat] Chats state updated, total:', loadedChats.length);
      } else {
        console.error('API returned error:', response.data);
        showNotification({ 
          type: 'error', 
          message: response.data.message || 'Failed to load chats' 
        });
        setChats([]);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to load chats';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. Make sure the backend is running.';
      }
      
      showNotification({ type: 'error', message: errorMessage });
      // Set empty array so UI doesn't break
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMyPresence = async (status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/chat/presence', 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Failed to update presence:', error);
    }
  };

  const setupPresenceListener = (userId) => {
    if (!db || !userId) return;
    
    // Clean up existing listener
    if (presenceUnsubscribesRef.current[userId]) {
      presenceUnsubscribesRef.current[userId]();
    }

    const presenceRef = doc(db, 'presence', userId);
    const unsubscribe = onSnapshot(presenceRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const lastSeen = data.lastSeen?.toDate?.() || new Date();
        const now = new Date();
        const diffSeconds = (now - lastSeen) / 1000;
        const isOnline = data.status === 'online' && diffSeconds < 30;
        
        setOnlineStatus(prev => ({
          ...prev,
          [userId]: isOnline ? 'online' : 'offline'
        }));
      } else {
        setOnlineStatus(prev => ({
          ...prev,
          [userId]: 'offline'
        }));
      }
    });

    presenceUnsubscribesRef.current[userId] = unsubscribe;
  };

  const setupTypingListener = (chatId) => {
    if (!db || !chatId) return;
    
    // Clean up existing listener
    if (typingUnsubscribesRef.current[chatId]) {
      typingUnsubscribesRef.current[chatId]();
    }

    const typingRef = doc(db, 'typing', chatId);
    const unsubscribe = onSnapshot(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const otherParticipantId = selectedChat?.otherParticipant?.uid;
        if (otherParticipantId && data[otherParticipantId]) {
          setTypingStatus(prev => ({
            ...prev,
            [chatId]: true
          }));
        } else {
          setTypingStatus(prev => ({
            ...prev,
            [chatId]: false
          }));
        }
      } else {
        setTypingStatus(prev => ({
          ...prev,
          [chatId]: false
        }));
      }
    });

    typingUnsubscribesRef.current[chatId] = unsubscribe;
  };

  const handleTyping = (isTypingValue) => {
    if (!selectedChat?.chatId) return;
    
    setIsTyping(isTypingValue);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing status
    const token = localStorage.getItem('token');
    axios.post('http://localhost:3000/api/chat/typing', 
      { chatId: selectedChat.chatId, isTyping: isTypingValue },
      { headers: { Authorization: `Bearer ${token}` } }
    ).catch(err => console.error('Failed to update typing:', err));

    // Auto-stop typing after 3 seconds of no input
    if (isTypingValue) {
      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false);
      }, 3000);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/employee/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersList = response.data.data || [];
      setUsers(usersList);
      
      // Set up presence listeners for all users
      usersList.forEach(user => {
        setupPresenceListener(user.uid);
      });
      
      // Set up presence for admin if available
      if (adminInfo) {
        setupPresenceListener(adminInfo.uid);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      // Not critical, users might not be assigned yet
    }
  };

  const loadAdminInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      // Get admin info using employee endpoint
      const response = await axios.get('http://localhost:3000/api/employee/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.data) {
        const adminData = response.data.data;
        setAdminInfo(adminData);
        setupPresenceListener(adminData.uid);
        console.log('[EmployeeChat] Admin info loaded:', adminData);
      }
    } catch (error) {
      console.error('Failed to load admin info:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification({ type: 'error', message: 'Not authenticated. Please login again.' });
        return;
      }

      console.log(`[EmployeeChat] Loading messages for chatId: ${chatId}`);
      const response = await axios.get(`http://localhost:3000/api/chat/messages/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const messages = response.data.data || [];
        console.log(`[EmployeeChat] Loaded ${messages.length} messages from API`);
        console.log('[EmployeeChat] Messages data:', messages);
        
        // Ensure messages are properly formatted
        const formattedMessages = messages.map(msg => ({
          messageId: msg.messageId || msg._id || `msg_${Date.now()}_${Math.random()}`,
          chatId: msg.chatId || chatId,
          senderId: msg.senderId,
          senderRole: msg.senderRole,
          recipientId: msg.recipientId,
          content: msg.content || msg.text || '',
          type: msg.type || 'text',
          read: msg.read || false,
          readAt: msg.readAt ? convertTimestamp(msg.readAt) : null,
          createdAt: msg.createdAt ? convertTimestamp(msg.createdAt) : new Date(msg.timestamp || Date.now()),
          reactions: msg.reactions || {},
          _optimistic: false
        }));
        
        console.log(`[EmployeeChat] Formatted ${formattedMessages.length} messages`);
        
        // Ensure messages are sorted by createdAt (oldest first)
        formattedMessages.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return aTime - bTime; // Oldest first
        });
        
        console.log('[EmployeeChat] Messages sorted, first message:', formattedMessages[0]?.content?.substring(0, 50));
        console.log('[EmployeeChat] Messages sorted, last message:', formattedMessages[formattedMessages.length - 1]?.content?.substring(0, 50));
        
        messagesRef.current = formattedMessages; // Update ref
        setMessages(formattedMessages);
        
        // Force scroll to bottom after state update
        setTimeout(() => {
          scrollToBottom();
          console.log('[EmployeeChat] Scrolled to bottom after loading messages');
        }, 100);
      } else {
        throw new Error(response.data.message || 'Failed to load messages');
      }

      // Set up real-time listener if Firebase is available
      if (db && collection && query && orderBy && onSnapshot) {
        // Clear any existing polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }

        try {
          // Listen to messages subcollection: chats/{chatId}/messages/
          const messagesRef = collection(db, 'chats', chatId, 'messages');
          const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));
          
          unsubscribeRef.current = onSnapshot(
            messagesQuery,
            (messagesSnapshot) => {
              // Only update if this is still the selected chat
              if (chatId !== selectedChat?.chatId) return;

              // Convert messages from subcollection to the expected format
              const newMessages = messagesSnapshot.docs.map(doc => {
                const msg = doc.data();
                return {
                  messageId: msg.messageId || doc.id,
                  chatId: msg.chatId || chatId,
                  senderId: msg.senderId,
                  senderRole: msg.senderRole,
                  recipientId: msg.recipientId,
                  content: msg.content,
                  type: msg.type,
                  read: msg.read || false,
                  readAt: convertTimestamp(msg.readAt),
                  createdAt: convertTimestamp(msg.createdAt) || new Date(),
                  reactions: msg.reactions || {},
                  _optimistic: false
                };
              });
                
              // Merge with optimistic messages (replace optimistic with real ones)
              const optimisticKey = `chat_${chatId}`;
              const optimisticMsgs = optimisticMessagesRef.current.get(optimisticKey) || [];
              
              // Remove optimistic messages that have been replaced by real ones
              const realMessageIds = new Set(newMessages.map(m => m.messageId));
              const remainingOptimistic = optimisticMsgs.filter(opt => !realMessageIds.has(opt.messageId));
              
              // Combine and sort
              const allMessages = [...newMessages, ...remainingOptimistic];
              allMessages.sort((a, b) => {
                const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return aTime - bTime; // Oldest first
              });
              
              setMessages(allMessages);
              // Auto-scroll to bottom when new messages arrive
              setTimeout(() => scrollToBottom(), 100);
            },
            (error) => {
              console.error('[EmployeeChat] Error listening to messages subcollection:', error);
              console.error('[EmployeeChat] Error details:', {
                code: error.code,
                message: error.message,
                stack: error.stack
              });
              
              // Fallback to polling if real-time fails
              console.log('[EmployeeChat] Falling back to polling for messages');
              setupPollingFallback(chatId);
            }
          );
        } catch (error) {
          console.error('[EmployeeChat] Failed to set up real-time listener:', error);
          // Fallback to polling
          setupPollingFallback(chatId);
        }
      } else {
        console.warn('[EmployeeChat] Firebase not available, using polling fallback');
        setupPollingFallback(chatId);
      }
    } catch (error) {
      console.error('[EmployeeChat] Failed to load messages:', error);
      console.error('[EmployeeChat] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to load messages';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response?.status === 404) {
        errorMessage = 'Chat not found. Starting a new conversation...';
        // Try to create chat if it doesn't exist
        if (selectedChat?.otherParticipant?.uid) {
          setTimeout(() => {
            startChat(selectedChat.otherParticipant);
          }, 1000);
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. Make sure the backend is running.';
      }
      
      showNotification({ type: 'error', message: errorMessage });
      setMessages([]); // Set empty array so UI doesn't break
    }
  };

  // Fallback polling mechanism when real-time fails
  const setupPollingFallback = (chatId) => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll every 2 seconds for new messages
    pollingIntervalRef.current = setInterval(async () => {
      if (selectedChat?.chatId === chatId) {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          
          const response = await axios.get(`http://localhost:3000/api/chat/messages/${chatId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success) {
            const newMessages = response.data.data || [];
            
            // Merge with optimistic messages
            const optimisticKey = `chat_${chatId}`;
            const optimisticMsgs = optimisticMessagesRef.current.get(optimisticKey) || [];
            const realMessageIds = new Set(newMessages.map(m => m.messageId));
            const remainingOptimistic = optimisticMsgs.filter(opt => !realMessageIds.has(opt.messageId));
            
            const allMessages = [...newMessages, ...remainingOptimistic];
            allMessages.sort((a, b) => {
              const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return aTime - bTime;
            });
            
            setMessages(allMessages);
            setTimeout(() => scrollToBottom(), 100);
          }
        } catch (error) {
          console.error('[EmployeeChat] Polling error:', error);
        }
      } else {
        // Stop polling if chat changed
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    }, 2000); // Poll every 2 seconds
  };

  const markAsRead = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/chat/mark-read/${chatId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadChats();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || isSending) return;

    const messageContent = newMessage.trim();
    const recipientId = selectedChat.otherParticipant.uid;
    // Use chatId from selectedChat (backend-generated with role-based format)
    const chatId = selectedChat.chatId;
    if (!chatId) {
      showNotification({ type: 'error', message: 'Chat ID not found. Please select a chat first.' });
      return;
    }
    
    // Create optimistic message
    const optimisticMessageId = `opt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const optimisticMessage = {
      messageId: optimisticMessageId,
      chatId,
      senderId: currentUser.uid,
      senderRole: currentUser.role,
      recipientId,
      content: messageContent,
      type: 'text',
      read: false,
      readAt: null,
      createdAt: new Date(),
      _optimistic: true
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);
    
    // Store optimistic message
    const optimisticKey = `chat_${chatId}`;
    const existingOptimistic = optimisticMessagesRef.current.get(optimisticKey) || [];
    optimisticMessagesRef.current.set(optimisticKey, [...existingOptimistic, optimisticMessage]);

    // Clear input immediately
    setNewMessage('');
    scrollToBottom();

    setIsSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/chat/send',
        {
          recipientId,
          content: messageContent,
          type: 'text'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const realMessage = response.data.data;
        
        // Remove optimistic message
        const updatedOptimistic = existingOptimistic.filter(m => m.messageId !== optimisticMessageId);
        optimisticMessagesRef.current.set(optimisticKey, updatedOptimistic);
        
        // Replace optimistic with real message
        setMessages(prev => {
          const filtered = prev.filter(m => m.messageId !== optimisticMessageId);
          return [...filtered, { ...realMessage, _optimistic: false }].sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return aTime - bTime;
          });
        });

        // Update sidebar immediately with new chat if it's new
        if (!selectedChat.chatId) {
          const newChat = {
            chatId: realMessage.chatId,
            otherParticipant: selectedChat.otherParticipant,
            lastMessage: {
              content: messageContent,
              senderId: currentUser.uid,
              senderRole: currentUser.role,
              createdAt: realMessage.createdAt
            },
            unreadCount: 0,
            lastActivity: realMessage.createdAt,
            createdAt: realMessage.createdAt
          };
          setSelectedChat(newChat);
          setChats(prev => {
            const exists = prev.find(c => c.chatId === newChat.chatId);
            if (exists) {
              // Update existing
              return prev.map(c => c.chatId === newChat.chatId ? newChat : c);
            }
            // Add new
            return [...prev, newChat];
          });
        } else {
          // Update existing chat in sidebar
          setChats(prev => prev.map(chat => 
            chat.chatId === chatId 
              ? {
                  ...chat,
                  lastMessage: {
                    content: messageContent,
                    senderId: currentUser.uid,
                    senderRole: currentUser.role,
                    createdAt: realMessage.createdAt
                  },
                  lastActivity: realMessage.createdAt
                }
              : chat
          ));
        }

        scrollToBottom();
      }
    } catch (error) {
      console.error('[EmployeeChat] Failed to send message:', error);
      
      // Remove optimistic message on error
      const updatedOptimistic = (optimisticMessagesRef.current.get(optimisticKey) || [])
        .filter(m => m.messageId !== optimisticMessageId);
      optimisticMessagesRef.current.set(optimisticKey, updatedOptimistic);
      
      setMessages(prev => prev.filter(m => m.messageId !== optimisticMessageId));
      
      // Restore message input
      setNewMessage(messageContent);
      
      let errorMessage = 'Failed to send message';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        errorMessage = error.response?.data?.message || 'You do not have permission to send messages to this user.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Recipient not found. Please try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      showNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    console.log('[EmployeeChat] Messages state changed:', messages.length, 'messages');
    messagesRef.current = messages; // Keep ref in sync
    if (messages.length > 0) {
      console.log('[EmployeeChat] First message:', messages[0]?.content?.substring(0, 50));
      console.log('[EmployeeChat] Last message:', messages[messages.length - 1]?.content?.substring(0, 50));
    }
    scrollToBottom();
  }, [messages]);

  // Close reaction picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showReactionPicker) {
        const isReactionPicker = e.target.closest('.reaction-picker-container');
        const isReactionButton = e.target.closest('button[title="Add reaction"]');
        const isReactionEmoji = e.target.closest('.reaction-picker-container button');
        
        if (!isReactionPicker && !isReactionButton && !isReactionEmoji) {
          setShowReactionPicker(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showReactionPicker]);

  const startChat = async (participant) => {
    // Find existing chat
    const existingChat = chats.find(
      chat => chat.otherParticipant.uid === participant.uid
    );

    if (existingChat) {
      setSelectedChat(existingChat);
      return;
    }

    // Auto-create chat if it doesn't exist
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification({ type: 'error', message: 'Not authenticated. Please login again.' });
        return;
      }

      // Clear messages immediately
      setMessages([]);

      // Create or get chat from backend
      const response = await axios.post(
        'http://localhost:3000/api/chat/create-or-get',
        { otherUserId: participant.uid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const newChat = response.data.data;
        setSelectedChat(newChat);
        
        // Add to sidebar immediately
        setChats(prev => {
          // Check if already exists (race condition)
          const exists = prev.find(c => c.chatId === newChat.chatId);
          if (exists) return prev;
          return [...prev, newChat];
        });
      } else {
        throw new Error(response.data.message || 'Failed to create chat');
      }
    } catch (error) {
      console.error('[EmployeeChat] Failed to create chat:', error);
      showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to create chat'
      });
    }
  };

  const filteredChats = chats.filter(chat => {
    // Include all chats (admin, users, etc.)
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (chat.otherParticipant.displayName || '').toLowerCase().includes(query) ||
      (chat.otherParticipant.email || '').toLowerCase().includes(query)
    );
  });

  // Check if admin chat exists in the chats list
  const adminChatExists = adminInfo && chats.some(chat => {
    const isAdminChat = chat.otherParticipant?.uid === adminInfo.uid || chat.otherParticipant?.role === 'admin';
    return isAdminChat;
  });
  
  console.log('[EmployeeChat] Admin chat exists:', adminChatExists, 'Total chats:', chats.length, 'Admin info:', adminInfo?.uid);

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (user.displayName || '').toLowerCase().includes(query) ||
      (user.email || '').toLowerCase().includes(query)
    );
  });

  const formatTime = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const handleReactionClick = async (messageId, emoji) => {
    if (!selectedChat?.chatId) return;

    // Optimistic update
    const currentMessage = messages.find(m => m.messageId === messageId);
    const currentReactions = currentMessage?.reactions || {};
    const emojiReactions = currentReactions[emoji] || [];
    const hasReacted = emojiReactions.includes(currentUser.uid);

    // Optimistically update local state
    const updatedReactions = { ...currentReactions };
    if (hasReacted) {
      const filtered = emojiReactions.filter(uid => uid !== currentUser.uid);
      if (filtered.length === 0) {
        delete updatedReactions[emoji];
      } else {
        updatedReactions[emoji] = filtered;
      }
    } else {
      updatedReactions[emoji] = [...emojiReactions, currentUser.uid];
    }

    // Update message in local state
    setMessages(prev => prev.map(msg => 
      msg.messageId === messageId 
        ? { ...msg, reactions: updatedReactions }
        : msg
    ));

    setShowReactionPicker(null);

    // Save to backend
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/chat/reaction',
        {
          chatId: selectedChat.chatId,
          messageId,
          emoji
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // Real-time listener will update with server data
    } catch (error) {
      console.error('[EmployeeChat] Failed to update reaction:', error);
      // Revert optimistic update on error
      setMessages(prev => prev.map(msg => 
        msg.messageId === messageId 
          ? { ...msg, reactions: currentReactions }
          : msg
      ));
      showNotification({
        type: 'error',
        message: 'Failed to update reaction'
      });
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .message-bubble {
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }
        .message-bubble:hover {
          transform: translateY(-1px);
        }
        .typing-dots span {
          animation: typing 1.4s infinite ease-in-out;
        }
        .typing-dots span:nth-child(1) {
          animation-delay: 0s;
        }
        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
      <div className={`min-h-screen flex transition-colors ${
        isDarkMode 
          ? 'bg-[#111b21] text-white' 
          : 'bg-[#e5ddd5] text-gray-900'
      }`}>
      {/* Main Navigation Sidebar */}
      <EmployeeSidebar />
      
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <div className={`w-80 border-r ${
          isDarkMode ? 'border-slate-800 bg-[#0a0a15]' : 'border-gray-200 bg-white'
        } flex flex-col`}>
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-3 px-4 text-sm font-semibold transition ${
                activeTab === 'chats'
                  ? 'bg-[#1f36ff] text-white'
                  : isDarkMode
                  ? 'text-slate-300 hover:bg-slate-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-3 px-4 text-sm font-semibold transition ${
                activeTab === 'users'
                  ? 'bg-[#1f36ff] text-white'
                  : isDarkMode
                  ? 'text-slate-300 hover:bg-slate-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Users
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === 'chats' ? 'Search chats...' : 'Search users...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-700 text-white' 
                    : 'bg-gray-100 border-gray-300 text-gray-900'
                } border focus:outline-none focus:ring-2 focus:ring-[#1f36ff]`}
              />
            </div>
          </div>

          {/* Chats/Users List */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'chats' ? (
              <div className="p-2">
                {/* Show empty state if no chats and no admin */}
                {chats.length === 0 && !adminInfo && (
                  <div className="text-center py-12">
                    <FiMessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No chats yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Start a conversation to see chats here
                    </p>
                  </div>
                )}
                
                {/* Show loading state */}
                {isLoading && chats.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">Loading chats...</p>
                  </div>
                )}

                {/* Admin Chat - Always show if admin exists (either as existing chat or clickable item) */}
                {adminInfo && (() => {
                  // Find the admin chat (should be only one)
                  const allAdminChats = filteredChats.filter(chat => {
                    const isAdminChat = chat.otherParticipant?.uid === adminInfo.uid || 
                                      chat.otherParticipant?.role === 'admin';
                    return isAdminChat;
                  });
                  
                  // Log if there are multiple admin chats (this shouldn't happen)
                  if (allAdminChats.length > 1) {
                    console.warn('[EmployeeChat] Multiple admin chats found:', allAdminChats.length, allAdminChats.map(c => c.chatId));
                  }
                  
                  // Use the first admin chat (or the one with the most recent activity)
                  const adminChat = allAdminChats.length > 0 
                    ? allAdminChats.sort((a, b) => {
                        const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
                        const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
                        return bTime - aTime; // Most recent first
                      })[0]
                    : null;

                  // Show admin chat from list if it exists
                  if (adminChat) {
                    const isSelected = selectedChat?.otherParticipant?.uid === adminChat.otherParticipant.uid;
                    return (
                      <div
                        key={adminChat.chatId}
                        onClick={() => setSelectedChat(adminChat)}
                        className={`p-3 rounded-lg cursor-pointer transition mb-1 ${
                          isSelected
                            ? 'bg-[#1f36ff] text-white'
                            : isDarkMode
                            ? 'hover:bg-slate-800'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {adminChat.otherParticipant.photoURL ? (
                              <img
                                src={adminChat.otherParticipant.photoURL}
                                alt="Admin"
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold flex-shrink-0 ${adminChat.otherParticipant.photoURL ? 'hidden' : ''}`}>
                              A
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">Admin</p>
                              {adminChat.lastMessage ? (
                                <p className={`text-xs truncate ${
                                  isSelected ? 'text-white/80' : 'text-slate-400'
                                }`}>
                                  {adminChat.lastMessage.content}
                                </p>
                              ) : (
                                <p className={`text-xs truncate ${
                                  isSelected ? 'text-white/60' : 'text-slate-500'
                                }`}>
                                  {adminChat.otherParticipant.email}
                                </p>
                              )}
                            </div>
                          </div>
                          {adminChat.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                              {adminChat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Show admin as clickable item if chat doesn't exist
                  return (
                    <div
                      onClick={() => startChat(adminInfo)}
                      className={`p-3 rounded-lg cursor-pointer transition mb-1 ${
                        selectedChat?.otherParticipant?.uid === adminInfo.uid
                          ? 'bg-[#1f36ff] text-white'
                          : isDarkMode
                          ? 'hover:bg-slate-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {adminInfo.photoURL ? (
                          <img
                            src={adminInfo.photoURL}
                            alt="Admin"
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold ${adminInfo.photoURL ? 'hidden' : ''}`}>
                          A
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">Admin</p>
                          <p className="text-xs text-slate-400 truncate">{adminInfo.email}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* User Chats (mobile app users) - Show all user chats */}
                {filteredChats
                  .filter(chat => {
                    // Exclude admin chat (already shown above)
                    const isAdmin = chat.otherParticipant?.role === 'admin' || chat.otherParticipant?.uid === adminInfo?.uid;
                    return !isAdmin;
                  })
                  .map((chat) => {
                    const isSelected = selectedChat?.otherParticipant?.uid === chat.otherParticipant.uid;
                    const isAdminChat = chat.otherParticipant.role === 'admin';
                    return (
                      <div
                        key={chat.chatId}
                        onClick={() => setSelectedChat(chat)}
                        className={`p-3 rounded-lg cursor-pointer transition mb-1 ${
                          isSelected
                            ? 'bg-[#1f36ff] text-white'
                            : isDarkMode
                            ? 'hover:bg-slate-800'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {chat.otherParticipant.photoURL ? (
                              <img
                                src={chat.otherParticipant.photoURL}
                                alt={chat.otherParticipant.displayName || chat.otherParticipant.email}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                              isAdminChat 
                                ? 'bg-emerald-500' 
                                : 'bg-[#1f36ff]'
                            } ${chat.otherParticipant.photoURL ? 'hidden' : ''}`}>
                              {isAdminChat 
                                ? 'A' 
                                : (chat.otherParticipant.displayName || chat.otherParticipant.email || 'U')[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">
                                {isAdminChat ? 'Admin' : (chat.otherParticipant.displayName || chat.otherParticipant.email)}
                              </p>
                              {chat.lastMessage ? (
                                <p className={`text-xs truncate ${
                                  isSelected ? 'text-white/80' : 'text-slate-400'
                                }`}>
                                  {chat.lastMessage.content}
                                </p>
                              ) : (
                                <p className={`text-xs truncate ${
                                  isSelected ? 'text-white/60' : 'text-slate-500'
                                }`}>
                                  {chat.otherParticipant.email}
                                </p>
                              )}
                            </div>
                          </div>
                          {chat.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                
                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="p-2 text-xs text-gray-500 border-t mt-2">
                    <p>Total chats: {chats.length}</p>
                    <p>Filtered chats: {filteredChats.length}</p>
                    <p>Admin exists: {adminChatExists ? 'Yes' : 'No'}</p>
                    <p>Admin info: {adminInfo ? 'Loaded' : 'Not loaded'}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2">
                {/* Admin */}
                {adminInfo && (
                  <div
                    onClick={() => startChat(adminInfo)}
                    className={`p-3 rounded-lg cursor-pointer transition mb-1 ${
                      selectedChat?.otherParticipant?.uid === adminInfo.uid
                        ? 'bg-[#1f36ff] text-white'
                        : isDarkMode
                        ? 'hover:bg-slate-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {adminInfo.photoURL ? (
                        <img
                          src={adminInfo.photoURL}
                          alt="Admin"
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold ${adminInfo.photoURL ? 'hidden' : ''}`}>
                        A
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">Admin</p>
                        <p className="text-xs text-slate-400 truncate">{adminInfo.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Users */}
                {filteredUsers.map((user) => (
                  <div
                    key={user.uid}
                    onClick={() => startChat(user)}
                    className={`p-3 rounded-lg cursor-pointer transition mb-1 ${
                      selectedChat?.otherParticipant?.uid === user.uid
                        ? 'bg-[#1f36ff] text-white'
                        : isDarkMode
                        ? 'hover:bg-slate-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || user.email}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 rounded-full bg-[#1f36ff] flex items-center justify-center text-white font-semibold ${user.photoURL ? 'hidden' : ''}`}>
                          {(user.displayName || user.email || 'U')[0].toUpperCase()}
                        </div>
                        {onlineStatus[user.uid] === 'online' && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {user.displayName || user.email}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header - Enhanced Design */}
              <div className={`px-5 py-3.5 border-b ${
                isDarkMode 
                  ? 'border-slate-700 bg-[#202c33] shadow-lg' 
                  : 'border-gray-200 bg-white shadow-sm'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    {selectedChat.otherParticipant.photoURL ? (
                      <img
                        src={selectedChat.otherParticipant.photoURL}
                        alt={selectedChat.otherParticipant.displayName || selectedChat.otherParticipant.email}
                        className="w-12 h-12 rounded-full object-cover shadow-md"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md ${
                      selectedChat.otherParticipant.role === 'admin' 
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
                        : 'bg-gradient-to-br from-[#1f36ff] to-[#1b2ed1]'
                    } ${selectedChat.otherParticipant.photoURL ? 'hidden' : ''}`}>
                      {(selectedChat.otherParticipant.displayName || selectedChat.otherParticipant.email || (selectedChat.otherParticipant.role === 'admin' ? 'A' : 'U'))[0].toUpperCase()}
                    </div>
                    {onlineStatus[selectedChat.otherParticipant.uid] === 'online' && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-base text-gray-900 dark:text-white truncate">
                        {selectedChat.otherParticipant.displayName || selectedChat.otherParticipant.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {typingStatus[selectedChat.chatId] ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">typing</span>
                          <div className="typing-dots flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                          </div>
                        </div>
                      ) : onlineStatus[selectedChat.otherParticipant.uid] === 'online' ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400">online</p>
                      ) : (
                        <p className="text-xs text-gray-400 dark:text-gray-500">offline</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages - Enhanced Design */}
              <div 
                className="flex-1 overflow-y-auto relative"
                style={{
                  backgroundImage: isDarkMode 
                    ? 'radial-gradient(circle at 20% 50%, rgba(32, 44, 51, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(32, 44, 51, 0.2) 0%, transparent 50%)'
                    : 'radial-gradient(circle at 20% 50%, rgba(240, 242, 245, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(240, 242, 245, 0.3) 0%, transparent 50%)',
                  backgroundSize: '100% 100%',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <div className="px-4 py-3 space-y-2">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      <FiMessageCircle className="text-4xl mx-auto mb-4 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => {
                        const isOwn = message.senderId === currentUser.uid;
                        const reactions = message.reactions || {};
                        const hasReactions = Object.keys(reactions).length > 0;
                        
                        return (
                          <div
                            key={message.messageId}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group animate-fadeIn`}
                            style={{ 
                              animation: `fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.03}s both`
                            }}
                          >
                            <div className="relative max-w-[70%] lg:max-w-[65%] group/message">
                              {/* Message Bubble */}
                              <div 
                                className={`message-bubble relative px-4 py-2.5 rounded-[22px] ${
                                  isOwn
                                    ? 'bg-[#DCF8C6] text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.1)]'
                                    : isDarkMode
                                    ? 'bg-[#2a3942] text-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
                                    : 'bg-white text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                                }`}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  setShowReactionPicker(showReactionPicker === message.messageId ? null : message.messageId);
                                }}
                                onDoubleClick={() => {
                                  setShowReactionPicker(showReactionPicker === message.messageId ? null : message.messageId);
                                }}
                                onTouchStart={(e) => handleLongPress(message.messageId, e)}
                                onTouchEnd={handlePressEnd}
                                onMouseDown={(e) => {
                                  if (e.button === 0) { // Left mouse button
                                    handleLongPress(message.messageId, e);
                                  }
                                }}
                                onMouseUp={handlePressEnd}
                                onMouseLeave={handlePressEnd}
                              >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mb-1">{message.content}</p>
                                
                                {/* Sender Role Badge */}
                                {!isOwn && (
                                  <div className="mb-1">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                      message.senderRole === 'admin'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                                    }`}>
                                      {message.senderRole === 'admin' ? 'Admin' : message.senderRole === 'employee' ? 'Employee' : 'User'}
                                    </span>
                                  </div>
                                )}
                                
                                {/* Timestamp and Read Status */}
                                <div className={`flex items-center justify-end gap-1.5 ${
                                  isOwn ? 'text-gray-600' : 'text-gray-500'
                                }`}>
                                  <span className="text-[11px] opacity-55 font-normal">
                                    {formatTime(message.createdAt)}
                                  </span>
                                  {isOwn && (
                                    <span className="flex items-center">
                                      {message.read ? (
                                        <FiCheckCircle className="w-4 h-4 text-[#53bdeb]" />
                                      ) : (
                                        <FiCheck className="w-4 h-4 text-gray-500" />
                                      )}
                                    </span>
                                  )}
                                </div>

                                {/* Reaction Button - Always visible */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setShowReactionPicker(showReactionPicker === message.messageId ? null : message.messageId);
                                  }}
                                  className={`absolute -bottom-1.5 ${
                                    isOwn ? '-left-1.5' : '-right-1.5'
                                  } opacity-0 group-hover/message:opacity-100 transition-all duration-200 bg-white dark:bg-[#2a3942] rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600 hover:scale-110 hover:shadow-xl z-20`}
                                  title="Add reaction"
                                >
                                  <FiSmile className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                </button>

                                {/* Reaction Picker */}
                                {showReactionPicker === message.messageId && (
                                  <div 
                                    className={`reaction-picker-container absolute bottom-full mb-2 bg-white dark:bg-[#2a3942] rounded-full px-3 py-2.5 shadow-2xl border border-gray-200 dark:border-gray-600 flex gap-2.5 z-30 animate-fadeIn ${
                                      isOwn ? 'left-0' : 'right-0'
                                    }`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {reactionEmojis.map((emoji) => (
                                      <button
                                        key={emoji}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleReactionClick(message.messageId, emoji);
                                        }}
                                        className="text-2xl hover:scale-150 active:scale-125 transition-transform duration-150 p-1.5 cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                        title={emoji}
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Reactions */}
                              {hasReactions && (
                                <div className={`flex gap-1 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                  <div 
                                    className="bg-white dark:bg-[#2a3942] rounded-full px-2.5 py-1 shadow-md border border-gray-200 dark:border-gray-600 flex gap-2 items-center cursor-pointer hover:shadow-lg transition-all duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowReactionPicker(showReactionPicker === message.messageId ? null : message.messageId);
                                    }}
                                  >
                                    {Object.entries(reactions).map(([emoji, userIds]) => {
                                      const count = userIds.length;
                                      const userReacted = userIds.includes(currentUser.uid);
                                      return (
                                        <span 
                                          key={emoji} 
                                          className={`text-sm flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-colors ${
                                            userReacted 
                                              ? 'bg-blue-100 dark:bg-blue-900/50' 
                                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                          }`}
                                        >
                                          <span className="text-base">{emoji}</span>
                                          {count > 1 && (
                                            <span className="text-[10px] opacity-75 font-semibold text-gray-700 dark:text-gray-300">
                                              {count}
                                            </span>
                                          )}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Typing Indicator */}
                      {typingStatus[selectedChat.chatId] && (
                        <div className="flex justify-start animate-fadeIn">
                          <div className={`px-4 py-3 rounded-[22px] rounded-tl-none ${
                            isDarkMode ? 'bg-[#2a3942]' : 'bg-white'
                          } shadow-sm`}>
                            <div className="typing-dots flex gap-1.5">
                              <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                              <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                              <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input - Enhanced Design */}
              <div className={`px-5 py-4 border-t ${
                isDarkMode 
                  ? 'border-slate-700 bg-[#202c33] shadow-lg' 
                  : 'border-gray-200 bg-[#f0f2f5] shadow-sm'
              }`}>
                <form onSubmit={sendMessage} className="flex items-end gap-3">
                  <div className="flex-1 flex items-center gap-3 bg-white dark:bg-[#2a3942] rounded-full px-5 py-3 shadow-inner border border-gray-200 dark:border-gray-600">
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FiSmile className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        if (e.target.value && !isTyping) {
                          handleTyping(true);
                        } else if (!e.target.value && isTyping) {
                          handleTyping(false);
                        }
                      }}
                      onKeyDown={() => {
                        if (!isTyping) handleTyping(true);
                      }}
                      placeholder="Type a message"
                      className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      disabled={isSending}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center shadow-md ${
                      newMessage.trim()
                        ? 'bg-[#25d366] hover:bg-[#20ba5a] active:bg-[#1da851] text-white hover:scale-105 active:scale-95'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <FiMessageCircle className="text-6xl mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default EmployeeChat;

