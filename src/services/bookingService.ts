import {
    collection,
    doc,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    Timestamp,
    deleteDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

// Generate random booking number
const generateBookingNumber = (): string => {
    return 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Create booking without account
export const createGuestBooking = async (
    doctorId: string,
    doctorName: string,
    date: string,
    timeSlot: string,
    patientName: string,
    patientMobile: string,
    patientEmail: string,
    caseDescription: string
): Promise<{ bookingNumber: string; bookingId: string }> => {
    try {
        const bookingNumber = generateBookingNumber();
        
        const bookingData = {
            doctorId,
            doctorName,
            date,
            timeSlot,
            patientName,
            patientMobile,
            patientEmail: patientEmail || '',
            caseDescription: caseDescription || '',
            bookingNumber,
            status: 'pending',
            isGuest: true,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'bookings'), bookingData);
        
        return {
            bookingNumber,
            bookingId: docRef.id,
        };
    } catch (error) {
        console.error('Error creating guest booking:', error);
        throw error;
    }
};

// Get bookings for a doctor
export const getDoctorBookings = async (doctorId: string): Promise<any[]> => {
    try {
        const bookingsQuery = query(
            collection(db, 'bookings'),
            where('doctorId', '==', doctorId)
        );

        const snapshot = await getDocs(bookingsQuery);
        const bookings = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
        }));

        // Sort by date and time
        return bookings.sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.timeSlot).getTime();
            const dateB = new Date(b.date + ' ' + b.timeSlot).getTime();
            return dateB - dateA;
        });
    } catch (error) {
        console.error('Error fetching doctor bookings:', error);
        return [];
    }
};

// Get booked slots for a specific date
export const getBookedSlots = async (doctorId: string, date: string): Promise<string[]> => {
    try {
        const bookingsQuery = query(
            collection(db, 'bookings'),
            where('doctorId', '==', doctorId),
            where('date', '==', date)
        );

        const snapshot = await getDocs(bookingsQuery);
        // Filter out cancelled bookings in JavaScript instead of Firestore query
        return snapshot.docs
            .filter(doc => doc.data().status !== 'cancelled')
            .map(doc => doc.data().timeSlot);
    } catch (error) {
        console.error('Error fetching booked slots:', error);
        return [];
    }
};

// Delete old messages (older than 1 week)
export const deleteOldMessages = async (): Promise<void> => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        // Get all chats
        const chatsSnapshot = await getDocs(collection(db, 'chats'));
        
        for (const chatDoc of chatsSnapshot.docs) {
            const messagesQuery = query(
                collection(db, 'chats', chatDoc.id, 'messages'),
                where('createdAt', '<', Timestamp.fromDate(oneWeekAgo))
            );
            
            const messagesSnapshot = await getDocs(messagesQuery);
            
            // Delete old messages
            const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            
            console.log(`Deleted ${messagesSnapshot.size} old messages from chat ${chatDoc.id}`);
        }
    } catch (error) {
        console.error('Error deleting old messages:', error);
        throw error;
    }
};

// Send confirmation email (placeholder - needs email service integration)
export const sendBookingConfirmationEmail = async (
    email: string,
    bookingDetails: {
        bookingNumber: string;
        doctorName: string;
        date: string;
        timeSlot: string;
        patientName: string;
    }
): Promise<void> => {
    // This would integrate with an email service like SendGrid, AWS SES, etc.
    // For now, we'll just log it
    console.log('Sending confirmation email to:', email);
    console.log('Booking details:', bookingDetails);
    
    // TODO: Integrate with email service
    // Example with SendGrid:
    // await sendEmail({
    //     to: email,
    //     subject: `Booking Confirmation - ${bookingDetails.bookingNumber}`,
    //     html: `...email template...`
    // });
};
