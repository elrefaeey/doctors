import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { Notification } from '@/types/firebase';

/**
 * Hook to listen to real-time notifications for the current user
 */
export const useNotifications = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
            })) as Notification[];

            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.read).length);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    return { notifications, loading, unreadCount };
};

/**
 * Hook to listen to real-time appointments for a user
 */
export const useAppointments = (userId?: string, role?: 'doctor' | 'patient') => {
    const { currentUser, userData } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const uid = userId || currentUser?.uid;
        const userRole = role || userData?.role;

        if (!uid || !userRole) {
            setAppointments([]);
            setLoading(false);
            return;
        }

        const field = userRole === 'doctor' ? 'doctorId' : 'patientId';
        const appointmentsQuery = query(
            collection(db, 'appointments'),
            where(field, '==', uid),
            orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(appointmentsQuery, (snapshot) => {
            const appts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate(),
            }));

            setAppointments(appts);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, userData, userId, role]);

    return { appointments, loading };
};

/**
 * Hook to listen to real-time pending requests (for doctors and admins)
 */
export const usePendingRequests = (doctorId?: string) => {
    const { currentUser, userData } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setRequests([]);
            setLoading(false);
            return;
        }

        let requestsQuery;

        if (userData?.role === 'admin') {
            // Admin sees all pending requests
            requestsQuery = query(
                collection(db, 'pendingRequests'),
                where('status', '==', 'pending'),
                orderBy('createdAt', 'desc')
            );
        } else if (userData?.role === 'doctor') {
            // Doctor sees only their requests
            const uid = doctorId || currentUser.uid;
            requestsQuery = query(
                collection(db, 'pendingRequests'),
                where('doctorId', '==', uid),
                orderBy('createdAt', 'desc')
            );
        } else {
            setRequests([]);
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
            const reqs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                reviewedAt: doc.data().reviewedAt?.toDate(),
            }));

            setRequests(reqs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, userData, doctorId]);

    return { requests, loading };
};

/**
 * Hook to get real-time doctor profile
 */
export const useDoctorProfile = (doctorId: string) => {
    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!doctorId) {
            setDoctor(null);
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(doc(db, 'doctors', doctorId), (snapshot) => {
            if (snapshot.exists()) {
                setDoctor({
                    id: snapshot.id,
                    ...snapshot.data(),
                    createdAt: snapshot.data().createdAt?.toDate(),
                    updatedAt: snapshot.data().updatedAt?.toDate(),
                });
            } else {
                setDoctor(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [doctorId]);

    return { doctor, loading };
};
