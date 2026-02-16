import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp,
    addDoc,
} from 'firebase/firestore';
import { db, auth, firebaseConfig } from '@/config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp, getApp, getApps, deleteApp } from 'firebase/app';
import { Doctor, Appointment, PendingRequest, SubscriptionPlan } from '@/types/firebase';

// ============================================
// DOCTOR SERVICES
// ============================================

export const getDoctorById = async (doctorId: string): Promise<Doctor | null> => {
    try {
        const doctorDoc = await getDoc(doc(db, 'doctors', doctorId));
        if (doctorDoc.exists()) {
            const data = doctorDoc.data();
            return {
                id: doctorDoc.id,
                ...data,
                createdAt: data.createdAt?.toDate(),
            } as unknown as Doctor;
        }
        return null;
    } catch (error) {
        console.error('Error fetching doctor:', error);
        throw error;
    }
};

export const getAllDoctors = async (): Promise<Doctor[]> => {
    try {
        // Simplified query - just get all doctors without complex ordering
        const doctorsQuery = query(
            collection(db, 'doctors')
        );

        const snapshot = await getDocs(doctorsQuery);
        const doctors = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
        })) as unknown as Doctor[];

        // Sort in memory instead of Firestore
        return doctors.sort((a, b) => {
            // Sort by rating first (descending)
            if (b.rating !== a.rating) {
                return (b.rating || 0) - (a.rating || 0);
            }
            // Then by total reviews (descending)
            return (b.totalReviews || 0) - (a.totalReviews || 0);
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        throw error;
    }
};

export const searchDoctors = async (
    searchTerm: string,
    specialization?: string
): Promise<Doctor[]> => {
    try {
        let doctorsQuery = query(
            collection(db, 'doctors'),
            where('isSuspended', '==', false)
        );

        if (specialization) {
            doctorsQuery = query(doctorsQuery, where('specialization', '==', specialization));
        }

        const snapshot = await getDocs(doctorsQuery);
        let doctors = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
        })) as unknown as Doctor[];

        // Filter by search term
        if (searchTerm) {
            doctors = doctors.filter(doctor =>
                doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.displayName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return doctors;
    } catch (error) {
        console.error('Error searching doctors:', error);
        throw error;
    }
};

export const updateDoctorProfile = async (
    doctorId: string,
    updates: Partial<Doctor>
): Promise<void> => {
    try {
        // Create a pending request instead of direct update
        const requestData = {
            doctorId,
            requestType: 'profileUpdate',
            requestedData: updates,
            status: 'pending',
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'pendingRequests'), requestData);
    } catch (error) {
        console.error('Error creating update request:', error);
        throw error;
    }
};

// ============================================
// APPOINTMENT SERVICES
// ============================================

export const createAppointment = async (
    doctorId: string,
    patientId: string,
    date: string,
    time: string,
    notes?: string
): Promise<string> => {
    try {
        // Fetch doctor details from doctors collection
        const doctorDoc = await getDoc(doc(db, 'doctors', doctorId));

        // Fetch patient details from users collection
        const patientDoc = await getDoc(doc(db, 'users', patientId));

        if (!doctorDoc.exists()) {
            throw new Error('Doctor not found');
        }

        if (!patientDoc.exists()) {
            throw new Error('Patient not found');
        }

        const doctorData = doctorDoc.data();
        const patientData = patientDoc.data();

        const appointmentData = {
            doctorId,
            patientId,
            doctorName: doctorData.displayName || doctorData.name || doctorData.nameAr || 'Doctor',
            patientName: patientData.displayName || patientData.name || 'Patient',
            date,
            time,
            status: 'pending',
            notes: notes || '',
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating appointment:', error);
        throw error;
    }
};

export const getAppointmentsByPatient = async (patientId: string): Promise<Appointment[]> => {
    try {
        // Simplified query without orderBy to avoid index requirement
        const appointmentsQuery = query(
            collection(db, 'appointments'),
            where('patientId', '==', patientId)
        );

        const snapshot = await getDocs(appointmentsQuery);
        const appointments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // date is stored as string (ISO format), not Timestamp
                date: data.date,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
            };
        }) as unknown as Appointment[];

        // Sort in memory by date (descending)
        return appointments.sort((a, b) => {
            const dateA = new Date(a.date as any).getTime();
            const dateB = new Date(b.date as any).getTime();
            return dateB - dateA;
        });
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        return []; // Return empty array instead of throwing
    }
};

export const getAppointmentsByDoctor = async (doctorId: string): Promise<Appointment[]> => {
    try {
        // Simplified query without orderBy to avoid index requirement
        const appointmentsQuery = query(
            collection(db, 'appointments'),
            where('doctorId', '==', doctorId)
        );

        const snapshot = await getDocs(appointmentsQuery);
        const appointments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // date is stored as string (ISO format), not Timestamp
                date: data.date,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
            };
        }) as unknown as Appointment[];

        // Sort in memory by date (descending)
        return appointments.sort((a, b) => {
            const dateA = new Date(a.date as any).getTime();
            const dateB = new Date(b.date as any).getTime();
            return dateB - dateA;
        });
    } catch (error) {
        console.error('Error fetching doctor appointments:', error);
        return []; // Return empty array instead of throwing
    }
};

export const updateAppointmentStatus = async (
    appointmentId: string,
    status: Appointment['status']
): Promise<void> => {
    try {
        await updateDoc(doc(db, 'appointments', appointmentId), {
            status,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        throw error;
    }
};

// ============================================
// PENDING REQUEST SERVICES
// ============================================

export const getPendingRequests = async (): Promise<PendingRequest[]> => {
    try {
        const requestsQuery = query(
            collection(db, 'pendingRequests'),
            where('status', '==', 'pending')
        );

        const snapshot = await getDocs(requestsQuery);
        const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            reviewedAt: doc.data().reviewedAt?.toDate(),
        })) as PendingRequest[];

        // Sort by createdAt in memory
        return requests.sort((a, b) => {
            const dateA = a.createdAt?.getTime() || 0;
            const dateB = b.createdAt?.getTime() || 0;
            return dateB - dateA;
        });
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        // Return empty array instead of throwing to prevent app crash
        return [];
    }
};

export const approveRequest = async (
    requestId: string,
    adminId: string
): Promise<void> => {
    try {
        const requestDoc = await getDoc(doc(db, 'pendingRequests', requestId));
        if (!requestDoc.exists()) {
            throw new Error('Request not found');
        }

        const requestData = requestDoc.data() as PendingRequest;

        // Update the doctor's profile with the requested data
        await updateDoc(doc(db, 'doctors', requestData.doctorId), {
            ...requestData.requestedData,
            updatedAt: serverTimestamp(),
        });

        // Mark request as approved
        await updateDoc(doc(db, 'pendingRequests', requestId), {
            status: 'approved',
            reviewedBy: adminId,
            reviewedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error approving request:', error);
        throw error;
    }
};

export const rejectRequest = async (
    requestId: string,
    adminId: string,
    reason: string
): Promise<void> => {
    try {
        await updateDoc(doc(db, 'pendingRequests', requestId), {
            status: 'rejected',
            reviewedBy: adminId,
            reviewedAt: serverTimestamp(),
            rejectionReason: reason,
        });
    } catch (error) {
        console.error('Error rejecting request:', error);
        throw error;
    }
};

// ============================================
// SUBSCRIPTION SERVICES
// ============================================

export const getSubscriptionPlans = async (): Promise<any[]> => {
    try {
        const snapshot = await getDocs(
            query(collection(db, 'subscriptionPlans'), orderBy('priority', 'asc'))
        );
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        throw error;
    }
};

// ============================================
// SPECIALIZATIONS SERVICES
// ============================================

export const getSpecializations = async (): Promise<any[]> => {
    try {
        const snapshot = await getDocs(collection(db, 'specializations'));
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error fetching specializations:', error);
        throw error;
    }
};

export const deleteSpecialization = async (specId: string, specKey: string): Promise<void> => {
    try {
        console.log(`Starting deletion of specialization ${specKey} (${specId})`);

        // 1. Find all doctors with this specialization
        const doctorsQuery = query(
            collection(db, 'doctors'),
            where('specialization', '==', specKey)
        );
        const doctorsSnapshot = await getDocs(doctorsQuery);

        console.log(`Found ${doctorsSnapshot.size} doctors with specialization ${specKey} to delete.`);

        // 2. Delete each doctor (using existing deleteUser function to ensure all related data is cleaned up)
        // We iterate sequentially to avoid overwhelming the system if there are many doctors
        for (const docSnapshot of doctorsSnapshot.docs) {
            const doctorId = docSnapshot.id;
            const doctorName = docSnapshot.data().displayName || 'Unknown';
            console.log(`Deleting doctor ${doctorName} (${doctorId})...`);
            // We use deleteUser with role 'doctor' to handle full cascading delete (appointments, chats, etc.)
            await deleteUser(doctorId, 'doctor');
        }

        // 3. Delete the specialization document itself
        await deleteDoc(doc(db, 'specializations', specId));
        console.log('Specialization document deleted.');

    } catch (error) {
        console.error('Error deleting specialization:', error);
        throw error;
    }
};

export const updateSpecialization = async (specId: string, updates: any): Promise<void> => {
    try {
        await updateDoc(doc(db, 'specializations', specId), {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating specialization:', error);
        throw error;
    }
};

// ============================================
// NOTIFICATIONS SERVICES
// ============================================

export const getNotificationsByUser = async (userId: string): Promise<any[]> => {
    try {
        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            limit(50)
        );

        const snapshot = await getDocs(notificationsQuery);
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
        }));

        // Sort in memory to avoid index requirement
        return notifications.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt.getTime() - a.createdAt.getTime();
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    try {
        await updateDoc(doc(db, 'notifications', notificationId), {
            read: true,
            readAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

export const updateDoctorSubscription = async (
    doctorId: string,
    plan: 'Silver' | 'Gold' | 'Blue'
): Promise<void> => {
    try {
        const priorityMap = { Blue: 1, Gold: 2, Silver: 3 };

        await updateDoc(doc(db, 'doctors', doctorId), {
            subscriptionType: plan.toLowerCase(),
            updatedAt: serverTimestamp(),
        });

        await updateDoc(doc(db, 'users', doctorId), {
            // verifiedBadge: plan === 'Blue', // Removing badge logic for now or mapping it
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        throw error;
    }
};

// ============================================
// ADMIN SERVICES
// ============================================

export const addDoctor = async (doctorData: any) => {
    let secondaryApp;
    try {
        // 1. Initialize a secondary Firebase App to create user without logging out Admin
        const appName = 'secondaryApp-' + new Date().getTime();

        secondaryApp = initializeApp(firebaseConfig, appName);
        const secondaryAuth = (await import('firebase/auth')).getAuth(secondaryApp);

        // 2. Create Authentication User
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, doctorData.email, doctorData.password);
        const { uid } = userCredential.user;

        // 3. Create User Document in 'users' collection
        await setDoc(doc(db, 'users', uid), {
            uid,
            email: doctorData.email,
            displayName: doctorData.name,
            role: 'doctor',
            photoURL: doctorData.photoURL || '',
            createdAt: serverTimestamp(),
            language: 'en'
        });

        // 4. Create Doctor Profile in 'doctors' collection
        await setDoc(doc(db, 'doctors', uid), {
            id: uid,
            userId: uid,
            email: doctorData.email,
            displayName: doctorData.name,
            nameAr: doctorData.nameAr || doctorData.name,
            specialization: doctorData.specialization,
            clinicAddress: doctorData.clinicAddress,
            consultationPrice: Number(doctorData.price) || Number(doctorData.consultationPrice) || 0,
            experience: Number(doctorData.experience) || 0,
            bio: doctorData.bio || '',
            subscriptionType: doctorData.subscriptionType || 'silver',
            isSuspended: false,
            verificationStatus: 'verified', // Auto-verify doctors added by admin
            rating: Number(doctorData.rating) || 0,
            totalReviews: Number(doctorData.totalReviews) || 0,
            totalPatients: Number(doctorData.totalPatients) || 0,
            workingHours: doctorData.workingHours || {},
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            photoURL: doctorData.photoURL || ''
        });

        console.log('Doctor created successfully:', uid);
        return uid;

    } catch (error) {
        console.error('Error creating doctor:', error);
        throw error;
    } finally {
        // 5. Cleanup secondary app
        if (secondaryApp) {
            try {
                await deleteApp(secondaryApp);
            } catch (cleanupError) {
                // Ignore cleanup errors
                console.warn('Secondary app cleanup warning:', cleanupError);
            }
        }
    }
};

export const getAllAppointments = async (): Promise<Appointment[]> => {
    try {
        // Simplified query without orderBy to avoid index requirement
        const snapshot = await getDocs(collection(db, 'appointments'));
        const appointments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate(),
            createdAt: doc.data().createdAt?.toDate(),
        })) as unknown as Appointment[];

        // Sort in memory by createdAt (descending)
        return appointments.sort((a, b) => {
            const dateA = a.createdAt?.getTime() || 0;
            const dateB = b.createdAt?.getTime() || 0;
            return dateB - dateA;
        });
    } catch (error) {
        console.error('Error fetching all appointments:', error);
        return []; // Return empty array instead of throwing
    }
};

export const deleteDoctor = async (doctorId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'doctors', doctorId));
        await updateDoc(doc(db, 'users', doctorId), {
            role: 'patient', // Demote to patient
        });
    } catch (error) {
        console.error('Error deleting doctor:', error);
        throw error;
    }
};

// ... (previous code)

export const updateDoctorInfo = async (
    doctorId: string,
    updates: Partial<Doctor> | any
): Promise<void> => {
    try {
        const updateData: any = {
            ...updates,
            updatedAt: serverTimestamp(),
        };

        // Ensure numeric fields are numbers if provided
        if (updates.experience !== undefined) updateData.experience = Number(updates.experience);
        if (updates.totalPatients !== undefined) updateData.totalPatients = Number(updates.totalPatients);
        if (updates.rating !== undefined) updateData.rating = Number(updates.rating);
        if (updates.consultationPrice !== undefined) updateData.consultationPrice = Number(updates.consultationPrice);
        if (updates.totalReviews !== undefined) updateData.totalReviews = Number(updates.totalReviews);

        // Clean up undefined fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        await updateDoc(doc(db, 'doctors', doctorId), updateData);
    } catch (error) {
        console.error('Error updating doctor info:', error);
        throw error;
    }
};

export const toggleDoctorFeaturedStatus = async (doctorId: string, isFeatured: boolean): Promise<void> => {
    try {
        await updateDoc(doc(db, 'doctors', doctorId), {
            isFeatured: isFeatured,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error toggling doctor featured status:', error);
        throw error;
    }
};

export const getPlatformSettings = async (): Promise<any> => {
    try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
        if (settingsDoc.exists()) {
            return settingsDoc.data();
        }
        return { heroImages: [] };
    } catch (error) {
        console.error('Error fetching platform settings:', error);
        return { heroImages: [] };
    }
};

export const getAllUsers = async (): Promise<any[]> => {
    try {
        const snapshot = await getDocs(collection(db, 'users'));
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

// Delete user and all related data
export const deleteUser = async (userId: string, userRole: string): Promise<void> => {
    try {
        console.log(`Starting deletion of user ${userId} with role ${userRole}`);

        // If doctor, delete doctor profile first
        if (userRole === 'doctor') {
            try {
                const doctorDoc = await getDoc(doc(db, 'doctors', userId));
                if (doctorDoc.exists()) {
                    await deleteDoc(doc(db, 'doctors', userId));
                    console.log('Doctor profile deleted');
                }
            } catch (error) {
                console.warn('Error deleting doctor profile:', error);
            }

            // Delete doctor's appointments
            try {
                const appointmentsQuery = query(
                    collection(db, 'appointments'),
                    where('doctorId', '==', userId)
                );
                const appointmentsSnapshot = await getDocs(appointmentsQuery);
                const deleteAppointments = appointmentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
                await Promise.all(deleteAppointments);
                console.log(`Deleted ${appointmentsSnapshot.size} appointments`);
            } catch (error) {
                console.warn('Error deleting appointments:', error);
            }

            // Delete doctor's subscription requests
            try {
                const subRequestsQuery = query(
                    collection(db, 'subscriptionRequests'),
                    where('doctorId', '==', userId)
                );
                const subRequestsSnapshot = await getDocs(subRequestsQuery);
                const deleteSubRequests = subRequestsSnapshot.docs.map(doc => deleteDoc(doc.ref));
                await Promise.all(deleteSubRequests);
                console.log(`Deleted ${subRequestsSnapshot.size} subscription requests`);
            } catch (error) {
                console.warn('Error deleting subscription requests:', error);
            }
        }

        // If patient, delete patient's appointments
        if (userRole === 'patient') {
            try {
                const appointmentsQuery = query(
                    collection(db, 'appointments'),
                    where('patientId', '==', userId)
                );
                const appointmentsSnapshot = await getDocs(appointmentsQuery);
                const deleteAppointments = appointmentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
                await Promise.all(deleteAppointments);
                console.log(`Deleted ${appointmentsSnapshot.size} appointments`);
            } catch (error) {
                console.warn('Error deleting appointments:', error);
            }

            // Delete user's reviews (if patient)
            try {
                const reviewsQuery = query(
                    collection(db, 'reviews'),
                    where('patientId', '==', userId)
                );
                const reviewsSnapshot = await getDocs(reviewsQuery);
                const deleteReviews = reviewsSnapshot.docs.map(doc => deleteDoc(doc.ref));
                await Promise.all(deleteReviews);
                console.log(`Deleted ${reviewsSnapshot.size} reviews`);
            } catch (error) {
                console.warn('Error deleting reviews:', error);
            }
        }

        // Delete user's chats
        try {
            const chatsQuery = query(
                collection(db, 'chats'),
                where(userRole === 'doctor' ? 'doctorId' : 'patientId', '==', userId)
            );
            const chatsSnapshot = await getDocs(chatsQuery);
            const deleteChats = chatsSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deleteChats);
            console.log(`Deleted ${chatsSnapshot.size} chats`);
        } catch (error) {
            console.warn('Error deleting chats:', error);
        }

        // Delete user's notifications
        try {
            const notificationsQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', userId)
            );
            const notificationsSnapshot = await getDocs(notificationsQuery);
            const deleteNotifications = notificationsSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deleteNotifications);
            console.log(`Deleted ${notificationsSnapshot.size} notifications`);
        } catch (error) {
            console.warn('Error deleting notifications:', error);
        }

        // Delete user document from Firestore (LAST)
        // This will trigger the Cloud Function to delete from Authentication
        await deleteDoc(doc(db, 'users', userId));
        console.log('User document deleted from Firestore');

        console.log(`✅ User ${userId} and all related data deleted successfully`);
        console.log('⏳ Cloud Function will delete user from Firebase Authentication automatically');
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        throw error;
    }
};

export const updatePlatformSettings = async (settings: any): Promise<void> => {
    try {
        await setDoc(doc(db, 'settings', 'general'), {
            ...settings,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    } catch (error) {
        console.error('Error updating platform settings:', error);
        throw error;
    }
};

export const submitSubscriptionRequest = async (doctorId: string, doctorName: string, targetLevel: string): Promise<void> => {
    try {
        await addDoc(collection(db, 'subscriptionRequests'), {
            doctorId,
            doctorName,
            targetLevel,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error submitting subscription request:', error);
        throw error;
    }
};

export const getSubscriptionRequests = async (): Promise<any[]> => {
    try {
        const q = query(collection(db, 'subscriptionRequests'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching subscription requests:', error);
        return [];
    }
};

export const updateSubscriptionRequestStatus = async (requestId: string, doctorId: string, status: 'approved' | 'rejected', level?: string): Promise<void> => {
    try {
        await updateDoc(doc(db, 'subscriptionRequests', requestId), {
            status,
            updatedAt: serverTimestamp(),
        });

        if (status === 'approved' && level) {
            await updateDoc(doc(db, 'doctors', doctorId), {
                subscriptionType: level,
                updatedAt: serverTimestamp(),
            });

            // Add notification for doctor
            await addDoc(collection(db, 'notifications'), {
                userId: doctorId,
                title: 'تمت الموافقة على طلب الاشتراك',
                message: `تمت ترقية حسابك إلى الفئة ${level} بنجاح.`,
                read: false,
                createdAt: serverTimestamp(),
            });
        }
    } catch (error) {
        console.error('Error updating subscription request status:', error);
        throw error;
    }
};

// ============================================
// DOCTOR DASHBOARD PERSISTENCE SERVICES
// ============================================

export const updateDoctorSchedule = async (doctorId: string, schedule: any): Promise<void> => {
    try {
        await updateDoc(doc(db, 'doctors', doctorId), {
            schedule,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating doctor schedule:', error);
        throw error;
    }
};

export const getDoctorReviews = async (doctorId: string): Promise<any[]> => {
    try {
        const q = query(
            collection(db, 'reviews'),
            where('doctorId', '==', doctorId)
        );
        const snapshot = await getDocs(q);
        const reviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
        }));

        // Sort in memory to avoid index requirement
        return reviews.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt.getTime() - a.createdAt.getTime();
        });
    } catch (error) {
        console.error('Error fetching doctor reviews:', error);
        return [];
    }
};

export const getDoctorPatients = async (doctorId: string): Promise<any[]> => {
    try {
        // Get all unique patients from appointments
        const q = query(collection(db, 'appointments'), where('doctorId', '==', doctorId));
        const snapshot = await getDocs(q);
        const appointments = snapshot.docs.map(doc => doc.data());

        const patientIds = [...new Set(appointments.map(a => a.patientId))];
        const patients = [];

        for (const pid of patientIds) {
            const pDoc = await getDoc(doc(db, 'users', pid));
            if (pDoc.exists()) {
                const pData = pDoc.data();
                const pAppointments = appointments.filter(a => a.patientId === pid);
                patients.push({
                    id: pid,
                    ...pData,
                    totalVisits: pAppointments.length,
                    lastVisit: pAppointments.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis())[0]?.date
                });
            }
        }
        return patients;
    } catch (error) {
        console.error('Error fetching doctor patients:', error);
        return [];
    }
};

export const subscribeDoctor = async (doctorId: string, plan: any): Promise<void> => {
    try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + (plan.durationInDays || 30));

        const subscription = {
            planId: plan.id,
            planName: plan.name,
            startDate: Timestamp.fromDate(startDate),
            endDate: Timestamp.fromDate(endDate),
            status: 'active'
        };

        await updateDoc(doc(db, 'doctors', doctorId), {
            subscription,
            subscriptionType: plan.name.toLowerCase(),
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error subscribing doctor:', error);
        throw error;
    }
};

