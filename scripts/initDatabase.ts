/**
 * Firebase Database Initialization Script
 * 
 * This script helps initialize your Firestore database with subscription plans
 * Run this once after setting up Firebase
 * 
 * Usage:
 * 1. Make sure Firebase is configured in src/config/firebase.ts
 * 2. Run: npm run init-db
 */

import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from './src/config/firebase';

const subscriptionPlans = [
    {
        id: 'silver',
        name: 'Silver',
        price: 99,
        priorityLevel: 3,
        features: [
            'Basic profile listing',
            'Standard search visibility',
            'Email support',
            'Up to 50 appointments/month'
        ],
        badgeColor: '#C0C0C0',
        description: 'Perfect for doctors just starting out'
    },
    {
        id: 'gold',
        name: 'Gold',
        price: 199,
        priorityLevel: 2,
        features: [
            'Enhanced profile listing',
            'Higher search ranking',
            'Priority support',
            'Analytics dashboard',
            'Unlimited appointments',
            'Featured in search results'
        ],
        badgeColor: '#FFD700',
        description: 'Best for established doctors seeking more visibility'
    },
    {
        id: 'blue',
        name: 'Blue',
        price: 299,
        priorityLevel: 1,
        features: [
            'Verified badge ✓',
            'Top search ranking',
            '24/7 premium support',
            'Advanced analytics',
            'Featured listing',
            'Unlimited appointments',
            'Priority booking',
            'Custom profile URL'
        ],
        badgeColor: '#1DA1F2',
        description: 'Elite verified status for top-tier doctors'
    }
];

async function initializeDatabase() {
    try {
        console.log('🚀 Starting database initialization...\n');

        // Check if subscription plans already exist
        const plansSnapshot = await getDocs(collection(db, 'subscriptionPlans'));

        if (!plansSnapshot.empty) {
            console.log('⚠️  Subscription plans already exist!');
            console.log('   Found', plansSnapshot.size, 'plans');
            console.log('   Skipping initialization to avoid duplicates.\n');

            const response = prompt('Do you want to overwrite existing plans? (yes/no): ');
            if (response?.toLowerCase() !== 'yes') {
                console.log('❌ Initialization cancelled.\n');
                return;
            }
        }

        // Create subscription plans
        console.log('📦 Creating subscription plans...\n');

        for (const plan of subscriptionPlans) {
            const { id, ...planData } = plan;
            await setDoc(doc(db, 'subscriptionPlans', id), planData);
            console.log(`✅ Created ${plan.name} plan (${plan.badgeColor})`);
            console.log(`   Price: $${plan.price}/month`);
            console.log(`   Priority: ${plan.priorityLevel}`);
            console.log(`   Features: ${plan.features.length}\n`);
        }

        console.log('✨ Database initialization complete!\n');
        console.log('📋 Next steps:');
        console.log('   1. Sign up through the app');
        console.log('   2. Go to Firestore Console');
        console.log('   3. Find your user in the "users" collection');
        console.log('   4. Change role to "admin"\n');
        console.log('🎉 You\'re all set!\n');

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure Firebase is configured in src/config/firebase.ts');
        console.log('   2. Check that Firestore is enabled in Firebase Console');
        console.log('   3. Verify your internet connection');
        console.log('   4. Check Firebase security rules allow writes\n');
    }
}

// Run the initialization
initializeDatabase();
