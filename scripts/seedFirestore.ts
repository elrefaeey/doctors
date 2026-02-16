/**
 * Firestore Database Seeding Script
 * 
 * This script populates your Firestore database with initial required data:
 * - Specializations
 * - Subscription Plans
 * - Translations (from locale JSON files)
 * 
 * Run this script once to set up your database.
 * 
 * Usage: npx tsx scripts/seedFirestore.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import enTranslations from '../src/locales/en.json';
import arTranslations from '../src/locales/ar.json';

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
const db = getFirestore(app);

// Specializations data
const specializations = [
  { key: 'cardiology', nameAr: 'أمراض القلب', nameEn: 'Cardiology', icon: '', order: 1 },
  { key: 'dermatology', nameAr: 'الجلدية', nameEn: 'Dermatology', icon: '', order: 2 },
  { key: 'neurology', nameAr: 'المخ والأعصاب', nameEn: 'Neurology', icon: '', order: 3 },
  { key: 'orthopedics', nameAr: 'العظام', nameEn: 'Orthopedics', icon: '', order: 4 },
  { key: 'pediatrics', nameAr: 'الأطفال', nameEn: 'Pediatrics', icon: '', order: 5 },
  { key: 'ophthalmology', nameAr: 'العيون', nameEn: 'Ophthalmology', icon: '', order: 6 },
  { key: 'dentistry', nameAr: 'الأسنان', nameEn: 'Dentistry', icon: '', order: 7 },
  { key: 'psychiatry', nameAr: 'الطب النفسي', nameEn: 'Psychiatry', icon: '', order: 8 },
  { key: 'internal_medicine', nameAr: 'الباطنة', nameEn: 'Internal Medicine', icon: '', order: 9 },
  { key: 'obstetrics_gynecology', nameAr: 'النساء والتوليد', nameEn: 'Obstetrics and Gynecology', icon: '', order: 10 },
  { key: 'urology', nameAr: 'المسالك البولية', nameEn: 'Urology', icon: '', order: 11 },
  { key: 'ear_nose_throat', nameAr: 'الأنف والأذن والحنجرة', nameEn: 'ENT', icon: '', order: 12 },
  { key: 'general_surgery', nameAr: 'الجراحة العامة', nameEn: 'General Surgery', icon: '', order: 13 },
  { key: 'physiotherapy', nameAr: 'العلاج الطبيعي', nameEn: 'Physiotherapy', icon: '', order: 14 },
  { key: 'nutrition', nameAr: 'التغذية', nameEn: 'Nutrition', icon: '', order: 15 },
  { key: 'oncology', nameAr: 'الأورام', nameEn: 'Oncology', icon: '', order: 16 },
  { key: 'radiology', nameAr: 'الأشعة', nameEn: 'Radiology', icon: '', order: 17 },
  { key: 'anesthesia', nameAr: 'التخدير', nameEn: 'Anesthesia', icon: '', order: 18 },
  { key: 'chest_respiratory', nameAr: 'الصدر والجهاز التنفسي', nameEn: 'Chest and Respiratory', icon: '', order: 19 },
  { key: 'liver_gastrointestinal', nameAr: 'الكبد والجهاز الهضمي', nameEn: 'Liver and Gastrointestinal', icon: '', order: 20 },
  { key: 'nephrology', nameAr: 'الكلى', nameEn: 'Nephrology', icon: '', order: 21 }
];

// Subscription plans data
const subscriptionPlans = [
  {
    name: 'Silver',
    level: 'silver',
    priceMonthly: 49,
    priority: 3,
    features: ['Basic listing', 'Up to 20 appointments/month', 'Standard support']
  },
  {
    name: 'Gold',
    level: 'gold',
    priceMonthly: 99,
    priority: 2,
    features: ['Featured listing', 'Unlimited appointments', 'Priority support', 'Analytics dashboard']
  },
  {
    name: 'Blue Verified',
    level: 'verified',
    priceMonthly: 199,
    priority: 1,
    features: ['Top search results', 'Verified badge', 'Unlimited appointments', 'Premium support', 'Advanced analytics', 'Custom profile']
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed Specializations
    console.log('📋 Seeding specializations...');
    for (const spec of specializations) {
      await setDoc(doc(db, 'specializations', spec.key), spec);
      console.log(`  ✓ Added specialization: ${spec.key}`);
    }

    // Seed Subscription Plans
    console.log('\n💳 Seeding subscription plans...');
    for (const plan of subscriptionPlans) {
      await setDoc(doc(db, 'subscriptionPlans', plan.level), plan);
      console.log(`  ✓ Added plan: ${plan.name}`);
    }

    // Seed Translations
    console.log('\n🌐 Seeding translations...');
    await setDoc(doc(db, 'translations', 'en'), enTranslations);
    console.log('  ✓ Added English translations');
    
    await setDoc(doc(db, 'translations', 'ar'), arTranslations);
    console.log('  ✓ Added Arabic translations');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Create an admin user in Firebase Console');
    console.log('  2. Set the user role to "admin" in the users collection');
    console.log('  3. Use the admin dashboard to add doctors');
    console.log('  4. Update Firestore security rules from FIRESTORE_STRUCTURE.md');
    
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seeding function
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
