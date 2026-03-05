import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDPbLpO2kSt_muQ_7Er13USJ0LnuRRdR2k",
  authDomain: "dolphingym-404d7.firebaseapp.com",
  projectId: "dolphingym-404d7",
  storageBucket: "dolphingym-404d7.appspot.com",
  messagingSenderId: "692631659482",
  appId: "1:692631659482:web:1642aa4a5d7ada65d916e3",
  measurementId: "G-81ZC99CQ8Q"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
