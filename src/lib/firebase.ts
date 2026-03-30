// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhfgH92kzbVMya86Cl7nYVmVUW513XfVY",
  authDomain: "taherbiosafe.firebaseapp.com",
  projectId: "taherbiosafe",
  storageBucket: "taherbiosafe.firebasestorage.app", // Using user's provided value
  messagingSenderId: "711312604367",
  appId: "1:711312604367:web:e799261430a74804e50bba",
  measurementId: "G-L042FZ351N"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);

// We are not initializing analytics here as it's not currently used by the app.
// If needed in the future, you can add:
// import { getAnalytics } from "firebase/analytics";
// const analytics = getAnalytics(app);

export { app, auth, db };
