import { getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  signInAnonymously,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

let servicesPromise;

export function hasFirebaseMultiplayerConfig() {
  return Boolean(
    firebaseConfig.apiKey
    && firebaseConfig.authDomain
    && firebaseConfig.projectId
    && firebaseConfig.appId,
  );
}

export async function getFirebaseMultiplayerServices() {
  if (!hasFirebaseMultiplayerConfig()) {
    throw new Error('Firebase multiplayer environment variables are not configured.');
  }

  if (!servicesPromise) {
    servicesPromise = (async () => {
      const app = getApps()[0] || initializeApp(firebaseConfig);
      const auth = getAuth(app);
      await setPersistence(auth, browserLocalPersistence);
      const user = auth.currentUser || (await signInAnonymously(auth)).user;
      return {
        app,
        auth,
        db: getFirestore(app),
        user,
      };
    })();
  }

  return servicesPromise;
}
