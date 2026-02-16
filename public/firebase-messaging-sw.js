// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyBYIxl2jeMTQzsPEg7-Zn5KcvJ_mvuOrds",
    authDomain: "doctor-20c9d.firebaseapp.com",
    projectId: "doctor-20c9d",
    storageBucket: "doctor-20c9d.firebasestorage.app",
    messagingSenderId: "182673156937",
    appId: "1:182673156937:web:48a849d6ff02aabaa98898",
    measurementId: "G-41F0NFLVT8"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title || 'Health Connect';
    const notificationOptions = {
        body: payload.notification.body || 'You have a new notification',
        icon: '/logo.png',
        badge: '/badge.png',
        tag: payload.data?.type || 'general',
        data: payload.data,
        requireInteraction: true,
        actions: [
            {
                action: 'open',
                title: 'Open App'
            },
            {
                action: 'close',
                title: 'Dismiss'
            }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click received.');

    event.notification.close();

    if (event.action === 'open' || !event.action) {
        // Open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
