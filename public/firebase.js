import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import { getFirestore,collection, addDoc ,
   getDocs, doc, getDoc, deleteDoc,
   query, orderBy, limit, startAfter, updateDoc, where} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

//   // TODO: Add SDKs for Firebase products that you want to use
//   // https://firebase.google.com/docs/web/setup#available-libraries

//   // Your web app's Firebase configuration
//   // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCTON5SWOqfe9vnco69ZnX2DHa_dUTTw3k",
    authDomain: "richtexteditor-abc44.firebaseapp.com",
    projectId: "richtexteditor-abc44",
    storageBucket: "richtexteditor-abc44.appspot.com",
    messagingSenderId: "169384796675",
    appId: "1:169384796675:web:cfa85a6e33e7c9b7692436",
    measurementId: "G-XPJLVXQYSJ"
  };


  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getFirestore(app);

  export {collection, addDoc, db, getDocs, doc, getDoc,
     deleteDoc, app, query, orderBy, limit, startAfter, updateDoc, where};