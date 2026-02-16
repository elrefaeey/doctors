import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    writeBatch,
    increment,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Chat, ChatMessage } from '@/types/firebase';

// ============================================
// CHAT REQUEST SERVICES (NEW SYSTEM)
// ============================================

/**
 * Create initial chat request from patient to doctor
 * Patient can only send ONE initial message
 */
export const createChatRequest = async (
    doctorId: string,
    patientId: string,
    doctorName: string,
    patientName: string,
    initialMessage: string
): Promise<string> => {
    try {
        // Check if chat request already exists
        const existingQuery = query(
            collection(db, 'chats'),
            where('doctorId', '==', doctorId),
            where('patientId', '==', patientId)
        );
        
        const snapshot = await getDocs(existingQuery);
        
        if (!snapshot.empty) {
            const existingChat = snapshot.docs[0];
            const chatData = existingChat.data();
            
            // If rejected, don't allow new request
            if (chatData.status === 'rejected') {
                throw new Error('لا يمكنك إرسال رسالة لهذا الطبيب');
            }
            
            // If pending or accepted, return existing chat
            return existingChat.id;
        }
        
        // Create new chat request
        const chatData = {
            doctorId,
            patientId,
            doctorName,
            patientName,
            status: 'pending', // pending, accepted, rejected
            initialMessage,
            lastMessage: initialMessage,
            lastMessageTime: serverTimestamp(),
            unreadCount: {
                doctor: 1,
                patient: 0,
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        
        const chatRef = await addDoc(collection(db, 'chats'), chatData);
        
        // Add initial message
        await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
            senderId: patientId,
            senderRole: 'patient',
            senderName: patientName,
            text: initialMessage,
            createdAt: serverTimestamp(),
            read: false,
        });
        
        return chatRef.id;
    } catch (error) {
        console.error('Error creating chat request:', error);
        throw error;
    }
};

/**
 * Accept chat request (Doctor only)
 */
export const acceptChatRequest = async (chatId: string): Promise<void> => {
    try {
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, {
            status: 'accepted',
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error accepting chat request:', error);
        throw error;
    }
};

/**
 * Reject chat request (Doctor only)
 * This will delete the chat from doctor's view
 */
export const rejectChatRequest = async (chatId: string): Promise<void> => {
    try {
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, {
            status: 'rejected',
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error rejecting chat request:', error);
        throw error;
    }
};

/**
 * Delete chat conversation (User can delete from their view)
 * Messages remain in database but chat is removed from user's list
 */
export const deleteChatConversation = async (
    chatId: string,
    userId: string,
    role: 'doctor' | 'patient'
): Promise<void> => {
    try {
        const chatRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);
        
        if (!chatDoc.exists()) {
            throw new Error('Chat not found');
        }
        
        const chatData = chatDoc.data();
        
        // Mark as deleted for this user
        await updateDoc(chatRef, {
            [`deletedBy.${role}`]: true,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error deleting chat:', error);
        throw error;
    }
};

/**
 * Get all chats for a user (doctor or patient)
 * Filters out rejected chats for doctors and deleted chats
 */
export const getUserChats = (
    userId: string,
    role: 'doctor' | 'patient',
    callback: (chats: Chat[]) => void
) => {
    const field = role === 'doctor' ? 'doctorId' : 'patientId';
    
    const chatsQuery = query(
        collection(db, 'chats'),
        where(field, '==', userId),
        orderBy('lastMessageTime', 'desc')
    );
    
    return onSnapshot(chatsQuery, (snapshot) => {
        const chats = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
            }))
            .filter(chat => {
                // Filter out deleted chats
                if (chat.deletedBy && chat.deletedBy[role]) {
                    return false;
                }
                
                // Filter out rejected chats for doctors
                if (role === 'doctor' && chat.status === 'rejected') {
                    return false;
                }
                
                return true;
            }) as Chat[];
        
        callback(chats);
    });
};

/**
 * Send a message in a chat (only if accepted)
 */
export const sendMessage = async (
    chatId: string,
    senderId: string,
    senderRole: 'doctor' | 'patient',
    senderName: string,
    text: string
): Promise<void> => {
    try {
        // Check if chat is accepted
        const chatDoc = await getDoc(doc(db, 'chats', chatId));
        if (!chatDoc.exists()) {
            throw new Error('Chat not found');
        }
        
        const chatData = chatDoc.data();
        
        // Only allow messages if chat is accepted
        if (chatData.status !== 'accepted') {
            throw new Error('Chat must be accepted before sending messages');
        }
        
        const batch = writeBatch(db);
        
        // Add message to subcollection
        const messageRef = doc(collection(db, 'chats', chatId, 'messages'));
        batch.set(messageRef, {
            senderId,
            senderRole,
            senderName,
            text,
            createdAt: serverTimestamp(),
            read: false,
        });
        
        // Update chat's last message
        const chatRef = doc(db, 'chats', chatId);
        const otherRole = senderRole === 'doctor' ? 'patient' : 'doctor';
        
        batch.update(chatRef, {
            lastMessage: text,
            lastMessageTime: serverTimestamp(),
            updatedAt: serverTimestamp(),
            [`unreadCount.${otherRole}`]: increment(1),
        });
        
        await batch.commit();
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

/**
 * Listen to messages in a chat
 */
export const listenToMessages = (
    chatId: string,
    callback: (messages: ChatMessage[]) => void
) => {
    const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as ChatMessage[];
        
        callback(messages);
    });
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (
    chatId: string,
    userId: string,
    role: 'doctor' | 'patient'
): Promise<void> => {
    try {
        const batch = writeBatch(db);
        
        // Get unread messages
        const messagesQuery = query(
            collection(db, 'chats', chatId, 'messages'),
            where('read', '==', false),
            where('senderId', '!=', userId)
        );
        
        const snapshot = await getDocs(messagesQuery);
        
        // Mark each message as read
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });
        
        // Reset unread count for this user
        const chatRef = doc(db, 'chats', chatId);
        batch.update(chatRef, {
            [`unreadCount.${role}`]: 0,
        });
        
        await batch.commit();
    } catch (error) {
        console.error('Error marking messages as read:', error);
        throw error;
    }
};

/**
 * Get chat by ID
 */
export const getChatById = async (chatId: string): Promise<Chat | null> => {
    try {
        const chatDoc = await getDoc(doc(db, 'chats', chatId));
        if (chatDoc.exists()) {
            return {
                id: chatDoc.id,
                ...chatDoc.data(),
            } as Chat;
        }
        return null;
    } catch (error) {
        console.error('Error fetching chat:', error);
        throw error;
    }
};

/**
 * Check if user has access to chat
 */
export const hasAccessToChat = async (
    chatId: string,
    userId: string
): Promise<boolean> => {
    try {
        const chat = await getChatById(chatId);
        if (!chat) return false;
        
        return chat.doctorId === userId || chat.patientId === userId;
    } catch (error) {
        console.error('Error checking chat access:', error);
        return false;
    }
};
