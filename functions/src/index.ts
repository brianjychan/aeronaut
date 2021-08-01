import { firestore } from 'firebase-admin';
import * as functions from 'firebase-functions';

import { db, storage, logger } from './Firebase';
import * as TelegramBot from 'node-telegram-bot-api'


// THIS IS GUARDIAN
interface ObjectLocalization {
    boundingPoly: Object,
    mid: string
    score: number,
    name: string
}

interface EventDoc {
    time: firestore.Timestamp,
    id: string,
    cameraUidOrigin: string,

    trigger: 'ir' | 'od',
    detections: Array<ObjectLocalization>,
    allDetections: Array<ObjectLocalization>,
    detectionsOfInterest: Array<ObjectLocalization>,
    motionPercent: number,

    photoFilename: string,
    videoFilename?: string,
    photoPreviewUrl?: string,
    videoPreviewUrl?: string,
}


interface CameraConfig {
    enableTexts: boolean
}

const PREVIEW_IMAGE_DAYS_EXPIRES_IN = 7
const telegramToken = functions.config().telegram.token
const telegramChatId = functions.config().telegram.id

function oxfordJoin(arr: Array<string>, sep1: string, sep2: string) {
    return (arr.slice(0, -1).join(sep1).concat(arr.length > 1 ? sep2 : '', arr.slice(-1)[0]));
}

const VOWELS = ['a', 'e', 'i', 'o', 'u']
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const onDetection = functions.firestore.document('users/{uid}/events/{detectionDoc}').onCreate(async (snapshot, context) => {
    const { uid, detectionDoc } = context.params
    const data = snapshot.data() as EventDoc

    // TODO: security review since this is user input

    const { id, trigger, photoFilename, allDetections, detectionsOfInterest, time, cameraUidOrigin } = data
    logger.log('Event', id, 'has', allDetections)

    const cameraConfigRequeset = db.collection('cameras').doc(cameraUidOrigin).get()

    let photoPreviewUrl = ''
    if (trigger === 'od') {
        const bucket = storage.bucket()
        // Get photo preview url
        photoPreviewUrl = (await bucket.file('users/' + uid + '/events/' + photoFilename).getSignedUrl({
            action: "read",
            expires: Date.now() + PREVIEW_IMAGE_DAYS_EXPIRES_IN * 24 * 60 * 60 * 1000, // value in ms
        }))[0]

        // Add photo url to event doc
        await db.collection('users').doc(uid).collection('events').doc(detectionDoc).update({
            photoPreviewUrl,
        })

    }

    if (detectionsOfInterest.length) {
        // Get camera owner info

        let enableTexts = true // default true
        try {
            const cameraConfigDoc = (await cameraConfigRequeset).data() as CameraConfig
            enableTexts = cameraConfigDoc.enableTexts
        } catch (e) {
            logger.error('Failed to retrieve camera config')
            logger.info(e)
        }

        if (enableTexts) {
            // Send text
            const eventIdTag = '#' + id


            const eventDate = time.toDate()
            const eventDayString = [eventDate.getDate(), MONTH_NAMES[eventDate.getMonth()], eventDate.getFullYear(),].join(' ')
            const eventTime = [eventDate.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })]


            const tagArr = detectionsOfInterest.map(object => object.name)
            const firstLabelFirstChar = tagArr[0][0]
            const article = VOWELS.includes(firstLabelFirstChar) ? 'An' : 'A'
            const tagString = [article, oxfordJoin(tagArr, ', ', ', or '), 'detected.'].join(' ')


            const messageBody = [eventIdTag, eventTime, eventDayString, '', tagString,].join('\n')
            logger.log(messageBody)
            // Telegram
            const bot = new TelegramBot(telegramToken)
            await bot.sendMessage(telegramChatId, messageBody)
            await bot.sendPhoto(telegramChatId, photoPreviewUrl )
        }
    }
})

// When a filename is updated, generates the signed URL for it and adds to firestore
const onVideoUpload = functions.firestore.document('users/{uid}/events/{detectionDoc}').onUpdate(async (snapshot, context) => {
    const { uid, detectionDoc } = context.params
    const data = snapshot.after.data() as EventDoc
    const { videoFilename } = data

    // Updated with a video
    if (videoFilename && !data.videoPreviewUrl) {
        // Get video urls
        const bucket = storage.bucket()
        const [videoPreviewUrl] = await bucket.file('users/' + uid + '/events/' + videoFilename).getSignedUrl({
            action: "read",
            expires: Date.now() + PREVIEW_IMAGE_DAYS_EXPIRES_IN * 24 * 60 * 60 * 1000, // value in ms
        })

        // Add photo url to detection event
        await db.collection('users').doc(uid).collection('events').doc(detectionDoc).update({
            videoPreviewUrl,
        })
    }

})

export { onDetection, onVideoUpload }
