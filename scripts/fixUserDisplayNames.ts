import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixUserDisplayNames() {
  console.log('Starting to fix user displayNames...');
  
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let fixed = 0;
    let skipped = 0;
    
    for (const userDoc of snapshot.docs) {
      const data = userDoc.data();
      
      // Check if displayName is missing but name exists
      if (!data.displayName && data.name) {
        await updateDoc(doc(db, 'users', userDoc.id), {
          displayName: data.name
        });
        console.log(`✅ Fixed user ${userDoc.id}: set displayName to "${data.name}"`);
        fixed++;
      } 
      // Check if name is missing but displayName exists
      else if (!data.name && data.displayName) {
        await updateDoc(doc(db, 'users', userDoc.id), {
          name: data.displayName
        });
        console.log(`✅ Fixed user ${userDoc.id}: set name to "${data.displayName}"`);
        fixed++;
      }
      // Check if both are missing
      else if (!data.name && !data.displayName) {
        const fallbackName = data.email?.split('@')[0] || 'User';
        await updateDoc(doc(db, 'users', userDoc.id), {
          name: fallbackName,
          displayName: fallbackName
        });
        console.log(`⚠️ Fixed user ${userDoc.id}: set both name and displayName to "${fallbackName}"`);
        fixed++;
      } else {
        skipped++;
      }
    }
    
    console.log('\n✅ Done!');
    console.log(`Fixed: ${fixed} users`);
    console.log(`Skipped: ${skipped} users (already have both fields)`);
    
  } catch (error) {
    console.error('Error fixing user displayNames:', error);
  }
}

fixUserDisplayNames();
