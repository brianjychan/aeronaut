import firebaseApp from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'
import firebaseConfig from './firebaseConfig.json'

class Firebase {
    auth: firebaseApp.auth.Auth
    db: firebaseApp.firestore.Firestore
    storage: firebaseApp.storage.Storage

    constructor() {
        if (!firebaseApp.apps.length) {
            firebaseApp.initializeApp(firebaseConfig.firebaseConfig)
        }
        this.auth = firebaseApp.auth()
        this.db = firebaseApp.firestore()
        this.storage = firebaseApp.storage()
    }

    doSignIn = (email: string, pw: string) => this.auth.signInWithEmailAndPassword(email, pw)

}

export { Firebase }









