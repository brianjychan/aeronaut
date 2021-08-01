import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions'

admin.initializeApp()
const auth = admin.auth()
const db = admin.firestore();
const storage = admin.storage()
const logger = functions.logger

export { auth, db, storage, logger }