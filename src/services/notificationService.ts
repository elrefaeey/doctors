import { getToken, onMessage } from 'firebase/messaging';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { messaging, db } from '@/config/firebase';
import type { Notification } from '@/types/firebase';

// Request permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
    try {
        if (!messaging) {
            console.warn('Firebase Messaging is not supported in this browser');
            return null;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: 'YOUR_VAPID_KEY_HERE', // Add your VAPID key from Firebase Console
            });
            return token;
        }
        return null;
    } catch (error) {
        console.error('Error getting notification permission:', error);
        return null;
    }
};

// Listen for foreground messages
export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;

        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });

// Create notification in Firestore
export const createNotification = async (
    userId: string,
    title: string,
    message: string,
    type: Notification['type'],
    relatedId?: string
): Promise<void> => {
    try {
        await addDoc(collection(db, 'notifications'), {
            userId,
            title,
            message,
            type,
            relatedId,
            read: false,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Notification templates
export const notificationTemplates = {
    newBooking: (doctorName: string, patientName: string) => ({
        title: 'New Appointment',
        message: `${patientName} has booked an appointment with you.`,
    }),

    appointmentReminder: (doctorName: string, date: string) => ({
        title: 'Appointment Reminder',
        message: `You have an appointment with Dr. ${doctorName} on ${date}.`,
    }),

    requestApproved: (requestType: string) => ({
        title: 'Request Approved',
        message: `Your ${requestType} request has been approved by admin.`,
    }),

    requestRejected: (requestType: string, reason: string) => ({
        title: 'Request Rejected',
        message: `Your ${requestType} request was rejected. Reason: ${reason}`,
    }),

    appointmentStatusChanged: (status: string) => ({
        title: 'Appointment Update',
        message: `Your appointment status has been changed to ${status}.`,
    }),
};

// Send notification to user
export const sendNotificationToUser = async (
    userId: string,
    title: string,
    message: string,
    type: Notification['type'],
    relatedId?: string
): Promise<void> => {
    try {
        await createNotification(userId, title, message, type, relatedId);

        // In production, you would also send a push notification via Firebase Cloud Functions
        // This is just storing the notification in Firestore
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
};

// Broadcast notification to all users (admin only)
export const broadcastNotification = async (
    title: string,
    message: string
): Promise<void> => {
    try {
        // This should be implemented as a Cloud Function
        // For now, we'll just create a broadcast notification
        await addDoc(collection(db, 'broadcasts'), {
            title,
            message,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error broadcasting notification:', error);
        throw error;
    }
};
