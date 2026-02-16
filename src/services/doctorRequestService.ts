import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db, firebaseConfig } from '@/config/firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

export interface DoctorRequestData {
  nameAr: string;
  nameEn: string;
  email: string;
  specialization: string;
  bio: string;
  phone: string;
  price: string;
  governorate: string;
  address: string;
  additionalInfo: string;
}

export interface DoctorRequest extends DoctorRequestData {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  doctorId?: string;
  generatedEmail?: string;
  generatedPassword?: string; // Password for admin to send to doctor
}

// Submit a new doctor request
export const submitDoctorRequest = async (data: DoctorRequestData): Promise<string> => {
  try {
    const requestData = {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'doctorRequests'), requestData);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting doctor request:', error);
    throw error;
  }
};

// Get all doctor requests (for admin)
export const getDoctorRequests = async (status?: string): Promise<DoctorRequest[]> => {
  try {
    let q = collection(db, 'doctorRequests');

    if (status) {
      q = query(collection(db, 'doctorRequests'), where('status', '==', status)) as any;
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as DoctorRequest[];
  } catch (error: any) {
    console.error('Error fetching doctor requests:', error);

    // Check if it's a permission error
    if (error.code === 'permission-denied') {
      throw new Error('ليس لديك صلاحية للوصول إلى هذه الصفحة. يجب أن تكون مسؤولاً (Admin).');
    }

    throw error;
  }
};

// Generate random secure password
const generateSecurePassword = (): string => {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';

  // Ensure at least one uppercase, one lowercase, and one number
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];

  // Fill the rest randomly
  for (let i = 3; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Approve doctor request and create account
export const approveDoctorRequest = async (requestId: string, requestData: DoctorRequest): Promise<void> => {
  let secondaryApp;

  try {
    // Validate email exists
    if (!requestData.email || !requestData.email.trim()) {
      throw new Error('البريد الإلكتروني مطلوب لإنشاء الحساب');
    }

    // Use doctor's email from request and generate password
    const doctorEmail = requestData.email.trim();
    const generatedPassword = generateSecurePassword();

    // Initialize secondary Firebase app
    const appName = 'secondaryApp-' + new Date().getTime();
    secondaryApp = initializeApp(firebaseConfig, appName);
    const secondaryAuth = getAuth(secondaryApp);

    // Create Firebase Authentication account
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      doctorEmail,
      generatedPassword
    );
    const { uid } = userCredential.user;

    // Create user document
    await setDoc(doc(db, 'users', uid), {
      uid,
      email: doctorEmail,
      displayName: requestData.nameAr,
      name: requestData.nameAr,
      role: 'doctor',
      createdAt: serverTimestamp(),
      language: 'ar',
    });

    // Create doctor profile
    await setDoc(doc(db, 'doctors', uid), {
      id: uid,
      userId: uid,
      email: doctorEmail,
      displayName: requestData.nameAr,
      name: requestData.nameEn,
      nameAr: requestData.nameAr,
      nameEn: requestData.nameEn,
      specialization: requestData.specialization,
      bio: requestData.bio || '',
      phone: requestData.phone,
      consultationPrice: Number(requestData.price) || 0,
      governorate: requestData.governorate,
      clinicAddress: requestData.address || '',
      address: requestData.address || '',
      additionalInfo: requestData.additionalInfo || '',
      subscriptionType: 'silver',
      isSuspended: false,
      verificationStatus: 'verified',
      rating: 0,
      totalReviews: 0,
      totalPatients: 0,
      experience: 0,
      workingHours: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update request status with credentials
    await updateDoc(doc(db, 'doctorRequests', requestId), {
      status: 'approved',
      doctorId: uid,
      generatedEmail: doctorEmail,
      generatedPassword, // Store password for admin to send to doctor
      approvedAt: serverTimestamp(),
    });

    // Create notification for admin (to send credentials)
    await addDoc(collection(db, 'notifications'), {
      userId: 'admin',
      type: 'doctor_approved',
      title: 'تم إنشاء حساب طبيب جديد',
      message: `تم إنشاء حساب للطبيب ${requestData.nameAr}`,
      doctorId: uid,
      doctorName: requestData.nameAr,
      doctorEmail: doctorEmail,
      doctorPassword: generatedPassword,
      doctorPhone: requestData.phone,
      read: false,
      createdAt: serverTimestamp(),
    });

    console.log('Doctor account created:', {
      uid,
      email: doctorEmail,
      password: generatedPassword,
      phone: requestData.phone,
    });

    // In a real application, you would send an email/SMS here
    // For now, we'll store the credentials in the notification

  } catch (error) {
    console.error('Error approving doctor request:', error);
    throw error;
  } finally {
    if (secondaryApp) {
      try {
        await deleteApp(secondaryApp);
      } catch (cleanupError) {
        console.warn('Secondary app cleanup warning:', cleanupError);
      }
    }
  }
};

// Reject doctor request
export const rejectDoctorRequest = async (requestId: string, reason?: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'doctorRequests', requestId), {
      status: 'rejected',
      rejectionReason: reason || '',
      rejectedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error rejecting doctor request:', error);
    throw error;
  }
};

// Delete doctor request
export const deleteDoctorRequest = async (requestId: string): Promise<void> => {
  try {
    const { deleteDoc, doc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'doctorRequests', requestId));
  } catch (error) {
    console.error('Error deleting doctor request:', error);
    throw error;
  }
};
