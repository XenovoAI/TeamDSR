import { initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys: Array<keyof FirebaseOptions> = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

const hasRequiredFirebaseConfig = requiredKeys.every((key) => {
  const value = firebaseConfig[key];
  return typeof value === "string" && value.trim().length > 0;
});

export const firebaseApp: FirebaseApp | null = hasRequiredFirebaseConfig
  ? initializeApp(firebaseConfig)
  : null;
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const googleAuthProvider = firebaseApp ? new GoogleAuthProvider() : null;
export const firebaseDb = firebaseApp ? getFirestore(firebaseApp) : null;

if (!hasRequiredFirebaseConfig) {
  console.warn(
    "Firebase config is incomplete. Add the VITE_FIREBASE_* variables to enable the Firebase SDK.",
  );
}

export { firebaseConfig, hasRequiredFirebaseConfig };
