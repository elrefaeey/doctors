/**
 * Create Admin User Script
 * 
 * This script creates a single admin user in Firebase Authentication
 * and sets up their profile in Firestore.
 * 
 * Admin credentials:
 * Email: admin@admin.com
 * Password: admin123
 * 
 * Usage: npx tsx scripts/createAdmin.ts
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Your Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

// Admin credentials
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';

async function createAdmin() {
  console.log('👤 Creating admin user...\n');

  try {
    // Create admin user in Firebase Authentication
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}\n`);
    
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );

    const user = userCredential.user;
    console.log(`✓ Admin user created with UID: ${user.uid}\n`);

    // Create admin profile in Firestore
    console.log('📝 Creating admin profile in Firestore...');
    await setDoc(doc(db, 'users', user.uid), {
      email: ADMIN_EMAIL,
      role: 'admin',
      createdAt: new Date().toISOString(),
      displayName: 'System Administrator'
    });

    console.log('✓ Admin profile created in Firestore\n');
    console.log('✅ Admin user setup completed successfully!\n');
    console.log('📋 Admin Login Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}\n`);
    console.log('🔐 Please change the password after first login for security.');
    
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log('   You can use this account to login.\n');
    } else {
      console.error('\n❌ Error creating admin user:', error.message);
      throw error;
    }
  }
}

// Run the function
createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
