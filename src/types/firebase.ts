export type UserRole = 'admin' | 'doctor' | 'patient';

export type SubscriptionPlan = 'gold' | 'silver' | 'verified';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type RequestType = 'profile_update' | 'subscription_upgrade' | 'new_doctor';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface User {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    phoneNumber?: string;
    phone?: string;
    photoURL?: string;
    dateOfBirth?: string;
    createdAt: any; // Firestore Timestamp
    language?: 'ar' | 'en';
}

export interface Doctor extends User {
    specialization: string;
    clinicAddress: string;
    consultationPrice: number;
    experience: number; // Years of experience
    bio: string;
    subscriptionType: SubscriptionPlan;
    isSuspended: boolean;
    rating: number;
    totalReviews: number;
    workingHours: {
        [day: string]: { start: string; end: string }[];
    };
    nameAr?: string;
    phone?: string;
    governorate?: string;
    showInSearch?: boolean;
    schedule?: any;
    totalEarnings?: number;
    subscription?: {
        planId: string;
        planName: string;
        startDate: any;
        endDate: any;
        status: string;
    };
    totalPatients?: number;
    name?: string; // Legacy/Alias for displayName
}

export interface Patient extends User {
    medicalHistory?: string[];
}

export interface Appointment {
    id: string;
    doctorId: string;
    patientId: string;
    doctorName: string;
    patientName: string;
    date: string; // ISO string 2024-05-10
    time: string; // 14:00
    status: AppointmentStatus;
    notes?: string;
    createdAt: any;
}

export interface PendingRequest {
    id: string;
    doctorId: string;
    requestType: RequestType;
    requestedData: any;
    status: RequestStatus;
    reviewedBy?: string;
    reviewedAt?: Date;
    createdAt: Date;
    rejectionReason?: string;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'booking' | 'approval' | 'rejection' | 'reminder' | 'broadcast';
    read: boolean;
    createdAt: Date;
    relatedId?: string; // appointment or request ID
}

export interface Chat {
    id: string;
    doctorId: string;
    patientId: string;
    doctorName: string;
    patientName: string;
    status: 'pending' | 'accepted' | 'rejected';
    initialMessage: string;
    lastMessage: string;
    lastMessageTime: any; // Firestore Timestamp
    unreadCount: {
        doctor: number;
        patient: number;
    };
    deletedBy?: {
        doctor?: boolean;
        patient?: boolean;
    };
    createdAt: any;
    updatedAt: any;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderRole: 'doctor' | 'patient';
    senderName: string;
    text: string;
    imageUrl?: string;
    createdAt: any; // Firestore Timestamp
    read: boolean;
}
