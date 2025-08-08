
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1ZRfoKob48xHOVwDHOB4WOa5z5VhRIZQ",
  authDomain: "allano-ba62a.firebaseapp.com",
  projectId: "allano",
  storageBucket: "allano-ba62a.firebasestorage.app",
  messagingSenderId: "913700661186",
  appId: "1:913700661186:web:1ac3f6021d69ceb6fb985b",
  measurementId: "G-XBKS2ZKYFK"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
