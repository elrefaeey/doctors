import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User as FirebaseUser,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User, UserRole } from '@/types/firebase';

interface UserData extends User {
    name?: string; // Alias for displayName for backward compatibility
    languagePreference?: string;
}

interface AuthContextType {
    currentUser: FirebaseUser | null;
    userData: UserData | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string, role: UserRole, additionalData?: { phone?: string; dateOfBirth?: string }) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    isAdmin: boolean;
    isDoctor: boolean;
    isPatient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user data from Firestore
    const fetchUserData = async (uid: string) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const displayName = data.displayName || data.name || '';
                setUserData({
                    uid,
                    name: displayName,
                    displayName: displayName,
                    email: data.email,
                    role: data.role,
                    subscriptionPlan: data.subscriptionPlan,
                    verifiedBadge: data.verifiedBadge,
                    createdAt: data.createdAt?.toDate(),
                    languagePreference: data.languagePreference || data.language || 'en',
                });
            }
        } catch (error: any) {
            console.error('Error fetching user data:', error);
            // If permission denied, set basic user data from auth
            if (error.code === 'permission-denied') {
                console.warn('Permission denied reading user data. Using basic auth info.');
                setUserData({
                    uid,
                    name: currentUser?.displayName || '',
                    displayName: currentUser?.displayName || '',
                    email: currentUser?.email || '',
                    role: 'patient', // Default role
                    createdAt: new Date(),
                    languagePreference: 'en',
                });
            }
        }
    };

    // Sign in with email and password
    const signIn = async (email: string, password: string) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await fetchUserData(result.user.uid);
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    // Sign up with email and password
    const signUp = async (email: string, password: string, name: string, role: UserRole, additionalData?: { phone?: string; dateOfBirth?: string }) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Create user document in Firestore
            const userDoc: any = {
                uid: result.user.uid,
                name,
                displayName: name,
                email,
                role,
                phone: additionalData?.phone || '',
                dateOfBirth: additionalData?.dateOfBirth || '',
                createdAt: serverTimestamp(),
                language: 'en',
            };
            
            // Only add subscriptionPlan for doctors
            if (role === 'doctor') {
                userDoc.subscriptionPlan = 'Silver';
            }

            await setDoc(doc(db, 'users', result.user.uid), userDoc);

            // If doctor, create doctor profile
            if (role === 'doctor') {
                const doctorDoc = {
                    userId: result.user.uid,
                    displayName: name,
                    email,
                    specialization: '',
                    bio: '',
                    clinicAddress: '',
                    consultationPrice: 0,
                    experience: 0,
                    subscriptionType: 'silver',
                    rating: 0,
                    totalReviews: 0,
                    verificationStatus: 'pending',
                    isSuspended: false,
                    workingHours: {},
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                };
                await setDoc(doc(db, 'doctors', result.user.uid), doctorDoc);
            }

            await fetchUserData(result.user.uid);
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUserData(null);
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    // Reset password
    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchUserData(user.uid);
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value: AuthContextType = {
        currentUser,
        userData,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        isAdmin: userData?.role === 'admin',
        isDoctor: userData?.role === 'doctor',
        isPatient: userData?.role === 'patient',
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
