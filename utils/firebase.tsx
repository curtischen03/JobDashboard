import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDs8Us0eaxeVP8b0mD_sU2LT7pOYZpyRbs",
  authDomain: "personal-2722f.firebaseapp.com",
  projectId: "personal-2722f",
  storageBucket: "personal-2722f.firebasestorage.app",
  messagingSenderId: "438663539541",
  appId: "1:438663539541:web:e57fe32e1adbdf47951ddc",
  measurementId: "G-VX55R7P4FD",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
const db = getFirestore(app)

export { app, auth, provider, db }
