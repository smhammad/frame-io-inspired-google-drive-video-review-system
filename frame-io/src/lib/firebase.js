import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyADcWRdPp5ja7WqvRNBejRRkobh0SEn8N8",
  authDomain: "drive-review-system.firebaseapp.com",
  databaseURL: "https://drive-review-system-default-rtdb.firebaseio.com",
  projectId: "drive-review-system",
  storageBucket: "drive-review-system.firebasestorage.app",
  messagingSenderId: "322989207247",
  appId: "1:322989207247:web:76bd764e6a0fb66dcd51ba"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
