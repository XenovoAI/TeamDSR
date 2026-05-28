import { initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

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

// Initialize App Check with ReCAPTCHA v3
if (firebaseApp && typeof window !== "undefined") {
  try {
    // Use debug token in development, ReCAPTCHA v3 in production
    if (import.meta.env.DEV) {
      // Enable debug mode for local development
      (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    
    const recaptchaSiteKey = import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY;
    if (recaptchaSiteKey) {
      initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
      console.log("Firebase App Check initialized successfully");
    } else {
      console.warn("ReCAPTCHA site key not found. App Check will use debug mode.");
    }
  } catch (error) {
    console.error("Failed to initialize App Check:", error);
  }
}

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const googleAuthProvider = firebaseApp ? new GoogleAuthProvider() : null;
export const firebaseDb = firebaseApp ? getFirestore(firebaseApp) : null;

if (!hasRequiredFirebaseConfig) {
  console.warn(
    "Firebase config is incomplete. Add the VITE_FIREBASE_* variables to enable the Firebase SDK.",
  );
}

export { firebaseConfig, hasRequiredFirebaseConfig };
