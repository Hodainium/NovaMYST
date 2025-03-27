import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAwmvwGOjWL1dOZQEhBGUcsvt4vzpaE17o",
  authDomain: "novamyst-5101a.firebaseapp.com",
  projectId: "novamyst-5101a",
  storageBucket: "novamyst-5101a.firebasestorage.app",
  messagingSenderId: "73139586907",
  appId: "1:73139586907:web:9cb518fc4d9af44208fc7e",
  measurementId: "G-PYZCFB1Q4W"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();