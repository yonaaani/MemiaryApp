import Constants from "expo-constants";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: Constants.expoConfig?.extra?.apiKey || "",
    authDomain: Constants.expoConfig?.extra?.authDomain || "",
    projectId: Constants.expoConfig?.extra?.projectId || "",
    storageBucket: Constants.expoConfig?.extra?.storageBucket || "",
    messagingSenderId: Constants.expoConfig?.extra?.messagingSenderId || "",
    appId: Constants.expoConfig?.extra?.appId || "",
    measurementId: Constants.expoConfig?.extra?.measurementId || "",
};

if (!firebaseConfig.apiKey) {
    throw new Error("Firebase config is missing! Check your Expo extra settings.");
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };