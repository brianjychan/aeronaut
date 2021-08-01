import * as admin from 'firebase-admin'

// --- Edit below ---
const USER_UID = '' // the user account's uid
const USER_NICKNAME = '' // a nickname for the user

const CAMERA_UID = '' // the camera account's ui
const CAMERA_NAME = '' // give the camera a nickname

// --- Only Edit above ---


const CAMERA_ACCOUNT_INFO = {
    ownerUid: USER_UID,
    enableTexts: true,
    haltReceived: false,
    name: CAMERA_NAME
}

const CAMERA_CONFIG = {
    confidenceThreshold: 0.5,
    motionThreshold: 0.08,
    midsToDetect: {
        '/m/01g317': 'Person',
        '/m/01bjv': 'Bus',
        '/m/0h8p55j': 'Shipping box',
        '/m/0jbk': 'Animal',
        '/m/083wq': 'Wheel',
        '/m/01yrx': 'Cat',
        '/m/015p6': 'Bird',
        '/m/07r04': 'Truck',
        '/m/0h9mv': 'Tire',
        '/m/025dyy': 'Box',
        '/m/071qp': 'Squirrel',
        '/m/050k8': 'Mobile phone',
        '/m/0bt9lr': 'Dog',
        '/m/0199g': 'Bicycle',
        '/m/0k4j': 'Car',
        '/j/5qg9b8': 'Packaged goods'
    }
}

const USER_ACCOUNT_INFO = {
    name: USER_NICKNAME,
    uid: USER_UID
}

export default async function editAllEvents(firebaseAdmin: admin.app.App) {
    const db = firebaseAdmin.firestore()

    if (!USER_UID || !CAMERA_UID || !CAMERA_NAME) {
        console.log('Please fill out the settings')
    }

    console.log('Setup starting.')
    await db.collection('cameras').doc(CAMERA_UID).create(CAMERA_ACCOUNT_INFO)
    await db.collection('config').doc('config').create(CAMERA_CONFIG)

    await db.collection('users').doc(USER_UID).create(USER_ACCOUNT_INFO)
    console.log('Setup done.')
}
