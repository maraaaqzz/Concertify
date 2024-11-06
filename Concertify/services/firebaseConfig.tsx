// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBc4Nr6LTJc1JwSafBdSLJRyr4EL_H2cJI",
  authDomain: "concertify-ef51d.firebaseapp.com",
  projectId: "concertify-ef51d",
  storageBucket: "concertify-ef51d.appspot.com",
  messagingSenderId: "788216928993",
  appId: "1:788216928993:web:4cfffb723555225cd035a0",
  measurementId: "G-72JFLKMP19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });


export {app,db};