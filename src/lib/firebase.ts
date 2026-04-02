import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

// Validate environment variables early for clearer errors in dev
const requiredEnv = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

const missing = requiredEnv.filter((k) => !import.meta.env[k as keyof ImportMetaEnv])
if (missing.length) {
  const msg = `Missing Firebase env vars: ${missing.join(", ")}.\n` +
    `Create a .env.local file in the project root with your Firebase config using VITE_ prefixed keys.\n` +
    `Example:\n` +
    `VITE_FIREBASE_API_KEY=...\nVITE_FIREBASE_AUTH_DOMAIN=...\nVITE_FIREBASE_PROJECT_ID=...\nVITE_FIREBASE_STORAGE_BUCKET=...\nVITE_FIREBASE_MESSAGING_SENDER_ID=...\nVITE_FIREBASE_APP_ID=...\nVITE_FIREBASE_MEASUREMENT_ID=... (optional)`
  throw new Error(msg)
}

const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string).trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string).trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string).trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string).trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string).trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string).trim(),
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined)?.trim(),
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Configure auth settings
const authInstance = getAuth(app);
// Set language code if needed
authInstance.languageCode = 'en';

let analytics: ReturnType<typeof getAnalytics> | undefined;
if (typeof window !== "undefined") {
  analyticsSupported().then((ok) => {
    if (ok && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
      analytics = getAnalytics(app);
    }
  });
}

export const firebaseApp = app;
export const auth = authInstance;
export const db = getFirestore(app);
export { analytics, doc, setDoc, serverTimestamp, getDoc };
