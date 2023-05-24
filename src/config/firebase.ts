import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  databaseURL: "https://candy-bubble-f6f67-default-rtdb.firebaseio.com",
});
const firebaseConfig = {
  apiKey: "AIzaSyA-l4LH2YA-QWufp8Kv-GuUofjGrrl7muA",
  authDomain: "candy-bubble-f6f67.firebaseapp.com",
  databaseURL: "https://candy-bubble-f6f67-default-rtdb.firebaseio.com",
  projectId: "candy-bubble-f6f67",
  storageBucket: "candy-bubble-f6f67.appspot.com",
  messagingSenderId: "188725186502",
  appId: "1:188725186502:web:631cc58fe865bd79126cc7",
  measurementId: "G-3Q6L5HHM78"
};

firebase.initializeApp(firebaseConfig);

export default firebase;
