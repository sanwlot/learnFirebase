import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANBJYeomVKHN33JH1FqX34Kdo4fhtXnlo",
  authDomain: "learningfirebase-2076f.firebaseapp.com",
  projectId: "learningfirebase-2076f",
  storageBucket: "learningfirebase-2076f.appspot.com",
  messagingSenderId: "663278339787",
  appId: "1:663278339787:web:91989bed4f25ad71753d4e",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
