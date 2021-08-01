// Polyfills required for running Firebase client in node
(global as any).XMLHttpRequest = require('xhr2');
// (global as any).WebSocket = require('ws'); // May also come in handy

import localConfig from './localConfig.json'
import { Raspistill } from 'node-raspistill';
import vision, { v1 } from '@google-cloud/vision'
import { google } from '@google-cloud/vision/build/protos/protos';
import { Firebase } from './firebase'
import { firestore } from 'firebase';
import { readFileSync, existsSync, createWriteStream, unlinkSync, WriteStream } from 'fs'
import Jimp from 'jimp';
// @ts-ignore
import raspivid from 'raspivid';
import firebaseConfig from './firebaseConfig.json'
import { exec } from 'child_process'
// @ts-ignore
import base64 from 'file-base64'
import internal from 'stream'
import { CamConfigData, CameraDetails, EventData, StatsUpdate } from './types';
import { getCurrDateString, getMsFromTimestamp, sleep, timeOutAwait } from './helpers';
// import gpio from 'rpi-gpio'
// const gpioPromise = gpio.promise

// DEBUG
// import log from 'why-is-node-running';

// Driver code
const deploy = async () => {
    /*---- Log and Process Helpers  --------
    ---------------------------------------*/
    // Set up logs
    const timeStartTimestamp = firestore.Timestamp.now()
    const timeStartDate = timeStartTimestamp.toDate()

    const timeStartLogFilename = [
        timeStartDate.getFullYear(),
        timeStartDate.getMonth(),
        timeStartDate.getDate(),
    ].join('-') + '_' + [
        timeStartDate.getHours(),
        timeStartDate.getMinutes(),
        timeStartDate.getSeconds(),
        timeStartDate.getMilliseconds()
    ].join('-') + '.txt'
    const timeStartLogPath = localConfig.LOGS_DIR + timeStartLogFilename

    const logStream = createWriteStream(timeStartLogPath, { flags: 'a' });
    const logStreamOpened = new Promise<WriteStream>(resolve => {
        logStream.on('open', resolve)
    })
    await logStreamOpened
    const getLogTime = () => { // Return string of current time
        return (new Date()).toLocaleString() + ': '
    }

    // TODO: make the logger start a new file per day locally. also upload the txt sremote. 
    const doLogInfo = (text: any, eventData?: EventData) => { // Log INFO
        const logTime = getLogTime()


        // add event ID
        let message = eventData ?
            ['EVENT', eventData.id].join(' ') +
            [' (', eventData.eventNumber, '/', getMsFromTimestamp(eventData.time), ') '].join(' ') +
            ': '
            :
            ''


        message += text
        logStream.write(logTime + message + "\n")
        console.log(message) // tslint:disable-line
    }
    const doLogError = (text: any, eventData?: EventData) => { // Log ERROR 
        let message = getLogTime()

        // add event id
        message += (eventData ?
            ['EVENT', eventData.id].join(' ') +
            ['(', eventData.eventNumber, '/', getMsFromTimestamp(eventData.time), ')'].join('') +
            ': '
            :
            ''
        )

        message += 'ERROR: '

        message += text
        logStream.write(message + "\n")
        console.error(message) // tslint:disable-line
    }
    const streamToFile = (inputStream: internal.Readable, filePath: string) => {
        return new Promise((resolve, reject) => {
            const fileWriteStream = createWriteStream(filePath)

            inputStream
                .pipe(fileWriteStream)
                .on('finish', () => {
                    inputStream.unpipe(fileWriteStream)
                    resolve(true)
                })
                .on('error', reject)
        })
    }
    process.on('unhandledRejection', async function (e) {
        doLogError('Unhandled rejection')
        doLogError(e)
        await cleanUp()
    });
    process.on('unhandledException', async function (e) {
        doLogError('Unhandled exception')
        doLogError(e)
        await cleanUp()
    });
    const execPromise = (command: string, eventData: EventData) => {
        return new Promise((resolve, reject) => {
            exec(command, (error, _, stderr) => {
                // doLogInfo(stdout)
                if (error) {
                    doLogError('execPromise error: ' + error.message, eventData);
                    reject(error)
                }
                if (stderr) {
                    // doLogInfo('execPromise stderr:' + stderr);
                    // TODO: investigate why this outputs content, and whether to reject instead
                    resolve(stderr)
                }
                resolve(true)
            })
        })
    }

    const cleanUp = async () => { // Close file handlers
        doLogInfo('Cleaning up...')

        doLogInfo('Sending final logs')
        const logPayload = {
            timeStop: firestore.Timestamp.now()
        }
        await currRunLogRemote.update(logPayload)

        doLogInfo('Signing out Firebase...')
        if (firebase.auth) {
            await firebase.auth.signOut() // otherwise there is an active handler. TODO learn about this
        }
        // maybe should use some other client?
        // doLogInfo('Destroying GPIO...')
        // await gpioPromise.destroy()

        // Sleep to allow other threads to resume
        doLogInfo('Waiting on camera processes shut down...')

        while (iRWaitingForCamera || takingPhoto || recordingVideo) {
            doLogInfo('.')
            await sleep(1)
        }

        doLogInfo('Ending log stream...')
        logStream.end() //  Automatically ended anyway
        // -- Debug --
        // log() // Show active handlers
        // // @ts-ignore
        // savedLogFunc(process._getActiveHandles())
        // // @ts-ignore
        // savedErrorFunc(process._getActiveRequests())
        // -----------
    }


    /*-------------- Feature Flags  -----------------
    ---------------------------------------*/

    const ENABLE_TELEMETRY_UPDATES = true
    // const ENABLE_IR_MOTION = false
    const ENABLE_CAMERA_MOTION = true


    /*-------------- Setup  -----------------
    ---------------------------------------*/
    let firebase = {} as Firebase
    let cameraDataRemote: firestore.DocumentReference = {} as firestore.DocumentReference
    let cameraUid = ''
    let ownerUid = ''
    let camConfig: CamConfigData = {} as CamConfigData
    let raspistill: Raspistill = {} as Raspistill
    let visionClient = {} as v1.ImageAnnotatorClient
    let currRunLogRemote: firestore.DocumentReference = {} as firestore.DocumentReference
    let userEventsCollectionRemote: firestore.CollectionReference = {} as firestore.CollectionReference


    try {
        doLogInfo('---- Setup ----')

        // Auth
        firebase = new Firebase()
        doLogInfo('Signing into Firebase...')
        await firebase.doSignIn(firebaseConfig.firebaseAuth.email, firebaseConfig.firebaseAuth.pw)
        cameraUid = firebase.auth.currentUser?.uid as string
        if (!cameraUid) {
            // TODO: report this error
            doLogError('ERROR: Failed to authenticate')

            await cleanUp()
            process.exitCode = 1
            return
        }
        doLogInfo('Authentication successful as ' + cameraUid + '. Determining owner...')
        cameraDataRemote = firebase.db.collection('cameras').doc(cameraUid)
        ownerUid = ((await cameraDataRemote.get()).data() as CameraDetails).ownerUid



        if (!ownerUid) {
            doLogError('No ownerUid')
        }

        try {

            // Update haltReceived
            await cameraDataRemote.update({
                haltReceived: false
            })
        } catch (e) {
            doLogError('problem updating haltReceived')
            doLogError(e)

        }

        // Logs
        doLogInfo('Creating remote log for this run')
        const logPayload = {
            timeStart: timeStartTimestamp,
        }
        currRunLogRemote = await cameraDataRemote.collection('logs').add(logPayload)

        // Config
        doLogInfo('Retrieving Config...')
        camConfig = (await firebase.db.collection('config').doc('config').get()).data() as CamConfigData
        console.log(camConfig) // tslint:disable-line

        // APIs
        visionClient = new vision.ImageAnnotatorClient()
        raspistill = new Raspistill(localConfig.CAMERA_OPTIONS);
        userEventsCollectionRemote = firebase.db.collection('users').doc(ownerUid).collection('events')

        // Data
        doLogInfo('--- Setup successful. Running Aeronaut ---')
    } catch (e) {
        doLogError('Setup failed')
        doLogError(e)

        await cleanUp()
        process.exitCode = 1
        return
    }


    // General vars
    let totalEvents = 0
    const createNewEvent: (trigger: 'od' | 'ir', timestamp?: firestore.Timestamp) => EventData = (trigger, timestamp) => {
        totalEvents += 1
        motionDetectionsSinceLastTelemetryUpdate += 1

        const eventTime = timestamp ?
            timestamp :
            firestore.Timestamp.now()

        return {
            id: userEventsCollectionRemote.doc().id,
            eventNumber: totalEvents,

            time: eventTime,
            trigger: trigger,
            cameraUidOrigin: cameraUid,

            // od
            allDetections: [],
            detectionsOfInterest: [],
            photoFilename: '',
            motionPercent: -1,
        }
    }

    /*----------- Camera-based Motion / Object Detection -----------------
    ---------------------------------------------------------------------*/
    // Telemetry
    let timeLastTelemetryUpdate = firestore.Timestamp.fromMillis(Date.now()
        - (localConfig.ONLINE_UPDATE_INTERVAL + 1) * 60 * 1000) // ensures an update at the start

    // See whether camera is busy
    let takingPhoto = false
    let recordingVideo = false
    let iRWaitingForCamera = false
    // video recording will wait for its turn, while photo taking will skip attempts


    // Camera Data
    let currPhotoBuffer = {} as Buffer
    let currPhotoJimp = {} as Jimp // Jimp object
    let consecutiveVideosRecorded = 0
    let motionDetectionsSinceLastTelemetryUpdate = 0
    let eventsSinceLastLastTelemetryUpdate = 0

    // Process Logic
    let previousPhotoWasOutdated = true
    let currDateString = ''

    // Errors
    let consecutiveTakePhotoErrors = 0

    const cameraSleep = async (seconds: number) => {
        await sleep(seconds)
        previousPhotoWasOutdated = true
    }



    const takePhotoAndRunMotionDetection: (disableMotionDetection: boolean) => Promise<EventData | null> = async (disableMotionDetection) => {
        // Responsible for taking a photo and running motion detection.
        // Returns a new Event if there is one, and null otherwise

        /*----------- Take Photo and Motion Detection  ---------*/
        const previousPhotoJimp = currPhotoJimp
        const photoTimestamp = firestore.Timestamp.now()
        const photoMs = getMsFromTimestamp(photoTimestamp)

        const photoJpgFilename = photoMs + '.jpg'

        while (consecutiveTakePhotoErrors < localConfig.CONSECUTIVE_CAMERA_ERROR_LIMIT) {
            try {
                // Take Photo
                takingPhoto = true
                const raspistillOp = raspistill.takePhoto(photoJpgFilename) // raspistill prepends ./photos/ prefix
                const raspistillResult = await timeOutAwait(raspistillOp, 5)

                if (raspistillResult.timeout) {
                    doLogError('Raspistill timed out')
                    throw Error('Raspistill timed out')
                }
                currPhotoBuffer = raspistillResult
                takingPhoto = false

                // Read with Jimp
                currPhotoJimp = await Jimp.read(currPhotoBuffer)

                // Remove photo
                // TODO: only do this after uploading?
                unlinkSync(localConfig.PHOTOS_DIR + photoJpgFilename) // Populates `currPhotoJimp` and `currPhotoBuffer`

                // Success, so set errors to 0
                consecutiveTakePhotoErrors = 0
                break

            } catch (e) {
                takingPhoto = false
                doLogError('Failed to take photo. Trying again')
                doLogError(e)
                consecutiveTakePhotoErrors += 1
                await sleep(1)
            }
        }


        if (consecutiveTakePhotoErrors >= localConfig.CONSECUTIVE_CAMERA_ERROR_LIMIT) {
            doLogError('CAMERA: error limit exceeded, shutting down')
            await cleanUp()
            process.exit(1)
        }

        if (disableMotionDetection) {
            // This is used when we just want to take a photo and save it in memory,
            // for instance when the previous photo was outdated after taking a video
            return null
        }

        // Calc motion
        const motionPercent = Jimp.diff(currPhotoJimp, previousPhotoJimp, .2).percent
        const hasNewMotion = motionPercent > camConfig.motionThreshold

        if (hasNewMotion) {
            // motion detected
            const newEvent = createNewEvent('od', photoTimestamp)
            newEvent.motionPercent = motionPercent

            doLogInfo('----- NEW EVENT detected from camera. Percent: ' + motionPercent + ' -----', newEvent)
            return newEvent
        }

        return null

    } // end doMotionDetection()

    // Used by IR as well
    const recordAndUploadVideo: (newEvent: EventData) => Promise<void> = async (newEvent) => {
        try {

            let loggedWaiting = false
            while (takingPhoto) {
                if (!loggedWaiting) {
                    doLogInfo('waiting for taking photo...', newEvent)
                    loggedWaiting = true
                }
                iRWaitingForCamera = true
                await sleep(.5)
            }

            // Two requests to record a video still might race after this
            if (recordingVideo) {
                doLogInfo('ignored; video is already recording', newEvent)
                return
            }
            // This thread uses the camera
            iRWaitingForCamera = false
            recordingVideo = true



            const eventMs = getMsFromTimestamp(newEvent.time)
            const eventId = newEvent.id
            // Record Video and Stream to File 
            doLogInfo('video recording...', newEvent)
            let readVideoStream: internal.Readable | null = null

            readVideoStream = raspivid(localConfig.VIDEO_OPTIONS) as internal.Readable
            const videoH264Path = localConfig.VIDEOS_DIR + eventMs + '.h264'
            const raspividStream = streamToFile(readVideoStream, videoH264Path)


            // TODO: right now this analyzes a photo taken from the camera.
            // What we want to do in the future is record the video, then AFTER it is done, analyze its frames for video.
            // so, usingPhotoSettings and this if-block will be deprecated since we perform this analysis on the video (which always happens)

            // TODO: this should always run for a video from a frame, but for now it runs if the trigger is camera, and uses that photo
            if (newEvent.trigger === 'od') {
                /*----------- Object Detection   ---------*/
                let allDetections: google.cloud.vision.v1.ILocalizedObjectAnnotation[] = []
                const detectionsOfInterest: google.cloud.vision.v1.ILocalizedObjectAnnotation[] = []

                try {
                    const request = {
                        image: {
                            content: currPhotoBuffer
                        }
                    }
                    if (!visionClient.objectLocalization) {
                        doLogError('Object Localization not a function', newEvent)

                        await cleanUp()
                        process.exitCode = 1
                        return
                    }
                    const [result] = await visionClient.objectLocalization(request)
                    if (!result.localizedObjectAnnotations) { // should not happen
                        const visionClientErrorMessage = 'PROCESS: ' + newEvent + ':: Error receiving localizedObjectAnnotations'
                        doLogError(visionClientErrorMessage, newEvent)
                        throw Error(visionClientErrorMessage)
                    }
                    allDetections = result.localizedObjectAnnotations
                    const midsToDetect = Object.keys(camConfig.midsToDetect)
                    allDetections.forEach(detection => {
                        const { mid, score } = detection
                        if (!mid || !score) {
                            return
                        }

                        if (midsToDetect.includes(mid)
                            && (score > camConfig.confidenceThreshold)
                        ) {
                            detectionsOfInterest.push(detection)
                        }

                    })
                    if (detectionsOfInterest.length) {
                        const detectedTagString = allDetections.map(detection => detection.name + ': ' + detection.score).join(', ')
                        doLogInfo('Analyzed motion, detected ' + detectedTagString, newEvent)

                    } else {
                        doLogInfo('Analyzed motion, nothing detected')
                    }

                } catch (e) {
                    doLogError('failed to receive object detection', newEvent)
                    doLogError(e, newEvent)
                }

                // After taking a video, our old photo that would have been used for motion comparison is outdated
                previousPhotoWasOutdated = true


                // Upload image
                // Note that we rely on this set of image/upload-event promise to finish before the video upload finishes
                const msNowJpgFilename = eventMs + '.jpg'

                firebase.storage.ref().child('users').child(ownerUid).child('events').child(msNowJpgFilename).put(currPhotoBuffer).then(() => {
                    doLogInfo('image uploaded', newEvent)

                    // Append OD fields to new event
                    newEvent.allDetections = allDetections
                    newEvent.detectionsOfInterest = detectionsOfInterest
                    newEvent.photoFilename = msNowJpgFilename
                }).catch(e => {
                    doLogError('Failed to upload image', newEvent)
                    doLogError(e, newEvent)
                })



            }

            // EVENT CONFIRMED
            // By here, either there were detections from camera, or directly reached from trigger==='ir'
            eventsSinceLastLastTelemetryUpdate += 1

            const raspividResultWithDetections = await timeOutAwait(raspividStream, 20)
            if (raspividResultWithDetections && raspividResultWithDetections.timeout) {
                doLogInfo('Awaiting video timed out', newEvent)
            } else {
                doLogInfo('video recorded', newEvent)
            }
            recordingVideo = false

            // Upload event to Firestore
            userEventsCollectionRemote.doc(eventId).set(newEvent).then(() => {
                doLogInfo('event data uploaded', newEvent)
            }).catch((e) => {
                doLogError('event data failed to upload', newEvent)
                doLogError(e, newEvent)
            })



            // Process and upload video
            doLogInfo('video processing...', newEvent)
            const videoMP4Filename = eventMs + '.mp4'
            const videoMP4Path = localConfig.VIDEOS_DIR + videoMP4Filename
            const execCommand = ['MP4Box', '-add', videoH264Path, videoMP4Path].join(' ')


            execPromise(execCommand, newEvent)
                .catch((e) => {
                    doLogError('failed to process video with execPromise', newEvent)
                    doLogError(e, newEvent)
                })

                .then(() => {
                    doLogInfo('video processed', newEvent)

                    // Remove local h264
                    unlinkSync(videoH264Path)

                    // Upload mp4
                    const fileBuffer = readFileSync(videoMP4Path)
                    const newVideoRef = firebase.storage.ref().child('users')
                        .child(ownerUid).child('events').child(videoMP4Filename)
                    return newVideoRef.put(fileBuffer)
                })
                .catch((e) => {
                    doLogError('failed to process or upload video', newEvent)
                    doLogError(e, newEvent)
                })


                .then(() => {
                    doLogInfo('video uploaded', newEvent)

                    // Remove local mp4
                    unlinkSync(videoMP4Path)

                    // Upload videoFilename
                    const updatePayload = {
                        videoFilename: videoMP4Filename,
                    }
                    return userEventsCollectionRemote.doc(eventId).update(updatePayload)
                }).catch(e => {
                    doLogError('failed to upload videoFilename', newEvent)
                    doLogError(e)
                })

                .then(() => {
                    doLogInfo('videoFilename uploaded', newEvent)
                    doLogInfo('Event concluded ----- ', newEvent)
                    doLogInfo('-')

                }).catch(e => {
                    doLogError('final error', newEvent)
                    doLogError(e, newEvent)
                })

        } catch (e) {
            doLogError(e, newEvent)
            recordingVideo = false
        }


    } // end doRecordAndUploadVideo()

    /*----------- IR-based motion detection  --------------------------
    ----------------------------------------------------------*/
    // const PIR_PIN = 18

    // if (ENABLE_IR_MOTION) {
    //     try {
    //         await gpioPromise.setup(PIR_PIN, gpio.DIR_IN, gpio.EDGE_BOTH)
    //         doLogInfo('PIR listening on port ' + PIR_PIN)
    //     } catch (e) {
    //         doLogError('Failed to setup PIR listener')
    //         doLogError(e)
    //     }

    //     gpio.on('change', async function (_, pinValue) {
    //         // TODO: what if this was equally triggered by a photo being taken + then recorded? should we count it as a separate motion detection?
    //         motionDetectionsSinceLastTelemetryUpdate += 1
    //         if (pinValue) {
    //             const newEvent = createNewEvent('ir')
    //             doLogInfo('----- NEW EVENT detected from IR sensor -----', newEvent)

    //             await recordAndUploadVideo(newEvent)
    //         }
    //     });
    // }

    /*----------- Loop ---------------
    ---------------------------------------*/
    while (true) {
        const loopTimestampNow = firestore.Timestamp.now()

        /*----------- Stop Process?    ---------*/

        let doHalt = false

        // Local turnoff
        try {
            if (existsSync(localConfig.HALT_FILE_PATH)) {
                doLogInfo('PROCESS: Halt file detected. Exiting')
                unlinkSync(localConfig.HALT_FILE_PATH) // remove halt file
            }
        } catch (e) {
            // no Halt file, so process as normal
        }

        // Remote turn off
        try {
            const { halt } = (await cameraDataRemote.get()).data() as CameraDetails
            if (halt) {
                await cameraDataRemote.update({
                    halt: false,
                    haltReceived: true
                })
                doHalt = true
            }
        } catch (e) {
            doLogError(e)
            doLogError('Problem with remote shutoff')
        }

        // Halt?
        if (doHalt) {
            await cleanUp()
            break
        }

        /*----------- Telemetry   ---------*/
        if (ENABLE_TELEMETRY_UPDATES) {
            const shouldUpdateTelemetry = loopTimestampNow.toMillis()
                - timeLastTelemetryUpdate.toMillis() > localConfig.ONLINE_UPDATE_INTERVAL

            if (shouldUpdateTelemetry) {
                try {
                    timeLastTelemetryUpdate = loopTimestampNow
                    const timeLastUpdatedPayload = {
                        timeLastUpdated: loopTimestampNow
                    }

                    // Update the log for this run 
                    await currRunLogRemote.update(timeLastUpdatedPayload)

                    // Update the camera lastOnlineTime itself 
                    await cameraDataRemote.update(timeLastUpdatedPayload)

                    // Upload log files
                    const logFileBuffer = readFileSync(timeStartLogPath)
                    const logFileRemoteRef = firebase.storage.ref().child('users')
                        .child(ownerUid).child('logs').child(timeStartLogFilename)

                    logFileRemoteRef.put(logFileBuffer).then(() => {
                        doLogInfo('Logs uploaded')
                    }).catch(e => {
                        doLogError('Failed to upload logs')
                        doLogError(e)
                    })

                    // Update daily stats
                    // TODO: this is not accurate when motion events occur around midnight
                    // TODO: if multiple cameras request this, they could collide
                    // TODO: change document name from date (hotspotting)
                    const latestDateString = getCurrDateString()
                    const latestDateStatsDocRef = firebase.db.collection('users').doc(ownerUid)
                        .collection('stats').doc(latestDateString)

                    // Payloads for updating day / new day
                    const newStatsPayload: StatsUpdate = { // when new day starts
                        // Be sure to update both new/update when adding new fields!
                        timeLastUpdated: loopTimestampNow,
                        lastUpdateCameraOriginUid: cameraUid,
                        motionDetections: motionDetectionsSinceLastTelemetryUpdate,
                        events: eventsSinceLastLastTelemetryUpdate,
                    }
                    const updateStatsPayload: StatsUpdate = { // updating a day
                        // Be sure to update both new/update when adding new fields!
                        timeLastUpdated: loopTimestampNow,
                        lastUpdateCameraOriginUid: cameraUid,
                        motionDetections: firestore.FieldValue.increment(motionDetectionsSinceLastTelemetryUpdate),
                        events: firestore.FieldValue.increment(eventsSinceLastLastTelemetryUpdate),
                    }


                    if (latestDateString !== currDateString) {
                        const statsDocExists = (await latestDateStatsDocRef.get()).exists
                        if (!statsDocExists) {
                            // Create new day stats doc
                            doLogInfo('LOGS: creating new stats doc')
                            await latestDateStatsDocRef.set(newStatsPayload)
                        } else {
                            // doLogInfo('LOGS: updating stats doc')
                            // Exists. perhaps case of a reset 
                            await latestDateStatsDocRef.update(updateStatsPayload)
                        }
                        currDateString = latestDateString
                    } else {
                        // Update existing day stats doc
                        // doLogInfo('LOGS: updating stats doc')
                        await latestDateStatsDocRef.update(updateStatsPayload)
                    }

                    motionDetectionsSinceLastTelemetryUpdate = 0
                    eventsSinceLastLastTelemetryUpdate = 0


                } catch (e) {
                    doLogError('LOGS: failed to update online status')
                    doLogError(e)
                }


                // Retrieve new camera config
                try {
                    const updatedConfig = (await firebase.db.collection('config').doc('config').get()).data() as CamConfigData
                    camConfig = updatedConfig
                    doLogInfo('Retrieved updated camConfig')
                } catch (e) {
                    doLogError('Failed to update camConfig')
                }

            }
        } // end Telemetry


        if (ENABLE_CAMERA_MOTION) {
            // Check busy
            if (iRWaitingForCamera) {
                doLogInfo('Loop: noticed IR waiting')
                // TODO: better way to do such notifications?
                // Pause this thread to enable IR to use camera
                await cameraSleep(4)
                continue
            }
            if (recordingVideo) {
                doLogInfo('Loop sleeping...')
                await cameraSleep(20) // sleep 20 here since we know, if we see it's busy from here, it is busy taking a video.
                continue // skip requests if camera is busy with video
            }


            // --- Run Camera Motion Detection ---
            try {


                const newEventData = await takePhotoAndRunMotionDetection(previousPhotoWasOutdated)
                if (previousPhotoWasOutdated) { // If we should take another photo to refresh for motion comparison
                    previousPhotoWasOutdated = false
                    continue
                }

                if (!newEventData) { // no event detected
                    consecutiveVideosRecorded = 0
                    continue // This line executes most of the time
                }

                // --- Event detected ---
                const CONSECUTIVE_VIDEOS_LIMIT_REACHED = consecutiveVideosRecorded >= localConfig.CONSECUTIVE_VIDEOS_RECORDED_LIMIT
                if (CONSECUTIVE_VIDEOS_LIMIT_REACHED) {
                    doLogInfo('limit reached for consecutive videos recorded', newEventData)
                    continue
                }

                // Run this async
                consecutiveVideosRecorded += 1
                await recordAndUploadVideo(newEventData)
                // this resolves when the camera is done 
            } catch (e) {
                doLogError('ERROR IN LOOP')
                doLogError(e)
            }
        }

    } // end Event Loop while()

}



// Driver code
deploy()
    .then(() => {
        console.log('Done running') // tslint:disable-line

        // Debug active file handlers
        // log()
    }
    ).catch(e => {
        console.error(' --- TOP LEVEL ERROR ---') // tslint:disable-line
        console.error(e) // tslint:disable-line
        console.error('Stopping.') // tslint:disable-line
        // TODO: cleanup()
    })




