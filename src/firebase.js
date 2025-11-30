// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAB_EqbtABPmIY3lRvwg-lv_l6ZLoFYvgM",
  authDomain: "tutormanagement-8c359.firebaseapp.com",
  projectId: "tutormanagement-8c359",
  storageBucket: "tutormanagement-8c359.firebasestorage.app",
  messagingSenderId: "983339269230",
  appId: "1:983339269230:web:17f866d1181655b7b63a7f"
};

const app = initializeApp(firebaseConfig);

// 🔥 These exports are needed for the rest of the app
export const auth = getAuth(app);
export const db = getFirestore(app);