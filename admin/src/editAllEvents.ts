import * as admin from 'firebase-admin'

/*
 Written on date: 

 Reason: 

 Related Commit:
*/

export default async function editAllEvents(firebaseAdmin: admin.app.App) {
    const db = firebaseAdmin.firestore()

    // All users
    const allUsers = await db.collection('users').get()
    for (const userDoc of allUsers.docs) {
        const userData = userDoc.data()
        const { uid } = userData
        // All events
        const allUserEvents = await db.collection('users').doc(uid).collection('events').get()
        for (const eventDoc of allUserEvents.docs) {
            // Do something
            console.log(eventDoc.data())
        }
    }

}
