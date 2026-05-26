import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration for commodity database
const firebaseConfig = {
  apiKey: "AIzaSyBHKhTQORbB5BXAz99OtI0zuelW4-rNImg",
  authDomain: "commodity-e673f.firebaseapp.com",
  projectId: "commodity-e673f",
  storageBucket: "commodity-e673f.firebasestorage.app",
  messagingSenderId: "447549262580",
  appId: "1:447549262580:web:05a0d75afb1059a51eeca1",
  measurementId: "G-ZKXC64K2JQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;