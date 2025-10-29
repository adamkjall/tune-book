import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDsI6Nh0HvRe6olQtS93zFAzNI1e-Jepe0",
  authDomain: "song-practise.firebaseapp.com",
  projectId: "song-practise",
  storageBucket: "song-practise.firebasestorage.app",
  messagingSenderId: "756608057127",
  appId: "1:756608057127:web:8e385bccd1c60fe2ebf302"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
