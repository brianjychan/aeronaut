import * as admin from 'firebase-admin'


export default async function doTest(firebaseAdmin: admin.app.App) {
    const db = firebaseAdmin.firestore()

    const data = (await db.collection('config').doc('config').get()).data()
    console.log(data)

}
