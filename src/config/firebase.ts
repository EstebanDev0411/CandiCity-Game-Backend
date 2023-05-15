import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
});

const firebaseConfig = {
  apiKey: "AIzaSyBYXjfeiHMrvroRFi-Cip0hf-dbpARWDe8",
  authDomain: "candy-bubble-f6f67.firebaseapp.com",
  projectId: "candy-bubble-f6f67",
  storageBucket: "candy-bubble-f6f67.appspot.com",
  messagingSenderId: "833592959022",
  appId: "1:833592959022:web:14c86c2b7a3f992d7dbfbf",
  measurementId: "G-NMCJZ85MK1"
};

firebase.initializeApp(firebaseConfig);

export default firebase;
