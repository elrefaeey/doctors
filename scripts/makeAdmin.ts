import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYIxl2jeMTQzsPEg7-Zn5KcvJ_mvuOrds",
  authDomain: "doctor-20c9d.firebaseapp.com",
  projectId: "doctor-20c9d",
  storageBucket: "doctor-20c9d.firebasestorage.app",
  messagingSenderId: "182673156937",
  appId: "1:182673156937:web:48a849d6ff02aabaa98898",
  measurementId: "G-41F0NFLVT8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function makeAdmin() {
  try {
    // Admin credentials
    const adminEmail = 'admin@doctor.com';
    const adminPassword = 'Admin@123456';
    const adminName = 'Administrator';

    console.log('🔄 Creating/Updating admin user...');

    let userId: string;

    try {
      // Try to create new admin user
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      userId = userCredential.user.uid;
      console.log('✅ New admin user created with UID:', userId);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // User exists, sign in to get UID
        console.log('ℹ️  Admin user already exists, signing in...');
        const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        userId = userCredential.user.uid;
        console.log('✅ Signed in as existing admin with UID:', userId);
      } else {
        throw error;
      }
    }

    // Check if user document exists
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userDocRef, {
        role: 'admin',
        name: adminName,
        displayName: adminName,
        email: adminEmail,
      });
      console.log('✅ Updated existing user document to admin role');
    } else {
      // Create new document
      await setDoc(userDocRef, {
        uid: userId,
        email: adminEmail,
        name: adminName,
        displayName: adminName,
        role: 'admin',
        createdAt: new Date(),
        language: 'ar',
      });
      console.log('✅ Created new user document with admin role');
    }

    console.log('\n✅ Admin user setup complete!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🆔 UID:', userId);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

makeAdmin();
