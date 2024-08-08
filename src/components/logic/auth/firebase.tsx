import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBibBf1rCwT_GPBkvYuBBRlT2a3-OWx1M8",
  authDomain: "simple-idea-ranker.firebaseapp.com",
  projectId: "simple-idea-ranker",
  storageBucket: "simple-idea-ranker.appspot.com",
  messagingSenderId: "487526503239",
  appId: "1:487526503239:web:4839a3e677f565b604b262",
  measurementId: "G-L5XGC7ZE3V",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);