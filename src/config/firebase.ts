// Firebase Configuration and Initialization
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
export const firebaseConfig = {
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

// Initialize Firebase services
export const auth = getAuth(app);

// Set authentication persistence to LOCAL (keeps user logged in)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Initialize Firebase Cloud Messaging (only if supported)
let messaging: any = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

export { messaging };
export default app;
