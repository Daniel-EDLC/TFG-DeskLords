// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOLEn8DaMry_j8W9vPKyf3fvddFg0XKIU",
  authDomain: "tfg-desklords.firebaseapp.com",
  projectId: "tfg-desklords",
  storageBucket: "tfg-desklords.firebasestorage.app",
  messagingSenderId: "999011285282",
  appId: "1:999011285282:web:128537aa304e44c39f4d7b",
  measurementId: "G-9DYVKDHNRV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;