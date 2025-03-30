import Constants from "expo-constants";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBcsskvFTDWo_UMAgLm9TZbVBxb-QksgZA",
    authDomain: "memiary-3e1d0.firebaseapp.com",
    projectId: "memiary-3e1d0",
    storageBucket: "memiary-3e1d0.appspot.com",
    messagingSenderId: "231274251137",
    appId: "1:231274251137:web:625a32ecacad1c5fcfde80",
    measurementId: "G-QXHK0PVDSB",
};

if (!firebaseConfig.apiKey) {
    throw new Error("Firebase config is missing! Check your Expo extra settings.");
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };