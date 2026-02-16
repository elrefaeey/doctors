import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    writeBatch,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface FeaturedDoctor {
    id: string;
    doctorId: string;
    doctorName: string;
    doctorNameAr: string;
    specialization: string;
    order: number;
    addedAt: any;
    addedBy: string;
}

// Get all featured doctors ordered by their position
export const getFeaturedDoctors = async (): Promise<FeaturedDoctor[]> => {
    try {
        const featuredQuery = query(
            collection(db, 'featuredDoctors'),
            orderBy('order', 'asc')
        );
        
        const snapshot = await getDocs(featuredQuery);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as FeaturedDoctor[];
    } catch (error) {
        console.error('Error fetching featured doctors:', error);
        return [];
    }
};

// Add doctor to featured list
export const addFeaturedDoctor = async (
    doctorId: string,
    doctorName: string,
    doctorNameAr: string,
    specialization: string,
    adminId: string
): Promise<void> => {
    try {
        // Get current featured doctors to determine next order
        const featured = await getFeaturedDoctors();
        const nextOrder = featured.length > 0 
            ? Math.max(...featured.map(f => f.order)) + 1 
            : 1;
        
        await setDoc(doc(db, 'featuredDoctors', doctorId), {
            doctorId,
            doctorName,
            doctorNameAr,
            specialization,
            order: nextOrder,
            addedAt: serverTimestamp(),
            addedBy: adminId,
        });
    } catch (error) {
        console.error('Error adding featured doctor:', error);
        throw error;
    }
};

// Remove doctor from featured list
export const removeFeaturedDoctor = async (doctorId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'featuredDoctors', doctorId));
    } catch (error) {
        console.error('Error removing featured doctor:', error);
        throw error;
    }
};

// Update order of featured doctors
export const updateFeaturedDoctorsOrder = async (
    doctors: { doctorId: string; order: number }[]
): Promise<void> => {
    try {
        const batch = writeBatch(db);
        
        doctors.forEach(({ doctorId, order }) => {
            const docRef = doc(db, 'featuredDoctors', doctorId);
            batch.update(docRef, { order });
        });
        
        await batch.commit();
    } catch (error) {
        console.error('Error updating featured doctors order:', error);
        throw error;
    }
};

// Move doctor up in the list
export const moveFeaturedDoctorUp = async (doctorId: string): Promise<void> => {
    try {
        const featured = await getFeaturedDoctors();
        const currentIndex = featured.findIndex(f => f.doctorId === doctorId);
        
        if (currentIndex <= 0) return; // Already at top
        
        const current = featured[currentIndex];
        const previous = featured[currentIndex - 1];
        
        // Swap orders
        await updateFeaturedDoctorsOrder([
            { doctorId: current.doctorId, order: previous.order },
            { doctorId: previous.doctorId, order: current.order },
        ]);
    } catch (error) {
        console.error('Error moving featured doctor up:', error);
        throw error;
    }
};

// Move doctor down in the list
export const moveFeaturedDoctorDown = async (doctorId: string): Promise<void> => {
    try {
        const featured = await getFeaturedDoctors();
        const currentIndex = featured.findIndex(f => f.doctorId === doctorId);
        
        if (currentIndex < 0 || currentIndex >= featured.length - 1) return; // Already at bottom
        
        const current = featured[currentIndex];
        const next = featured[currentIndex + 1];
        
        // Swap orders
        await updateFeaturedDoctorsOrder([
            { doctorId: current.doctorId, order: next.order },
            { doctorId: next.doctorId, order: current.order },
        ]);
    } catch (error) {
        console.error('Error moving featured doctor down:', error);
        throw error;
    }
};

// Check if doctor is featured
export const isDoctorFeatured = async (doctorId: string): Promise<boolean> => {
    try {
        const docRef = doc(db, 'featuredDoctors', doctorId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    } catch (error) {
        console.error('Error checking if doctor is featured:', error);
        return false;
    }
};
