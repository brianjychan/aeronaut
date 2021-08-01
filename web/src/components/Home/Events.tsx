import React, { useEffect, useState } from 'react'
import { useFirebase } from '../Firebase'
import { useSession } from '../Session'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'

import styles from './Events.module.css'
import { firestore } from 'firebase'
import { globalStyles, joinStyles } from '../Utilities/joinStyles'
import Spinner from 'react-bootstrap/Spinner';
// @ts-ignore
import { Player } from 'video-react';
import "../../../node_modules/video-react/dist/video-react.css"; // import css
import { ObjectLocalization, SentinelEvent } from '../Types/Types'





const EVENTS_PER_RETRIEVE = 10
interface EventsProps {
    setShowHeader: React.Dispatch<React.SetStateAction<boolean>>
}
const Events: React.FC<EventsProps> = ({ setShowHeader }) => {
    const firebase = useFirebase()
    const session = useSession()

    // Event Data
    const [events, setEvents] = useState<Array<SentinelEvent>>([])
    const [oldestSeen, setOldestSeen] = useState(firestore.Timestamp.now())
    const [status, setStatus] = useState('load')
    const [listen, setListen] = useState(false)
    const [noMoreEvents, setNoMoreEvents] = useState(false)

    // UI 
    const [selectedEvent, setSelectedEvent] = useState<null | SentinelEvent>(null)



    // Request Data
    useEffect(() => {
        const getEvents = async () => {
            if (!session.auth) {
                return
            }
            if (status !== 'load') {
                return
            }

            setStatus('loading')
            console.log('Requesting Events...')
            try {
                const recentEventsDocs = await firebase.db.collection('users').doc(session.auth?.uid).collection('events').orderBy('time', 'desc').startAfter(oldestSeen).limit(EVENTS_PER_RETRIEVE).get()
                const recentEventsData = recentEventsDocs.docs.map(doc => doc.data() as SentinelEvent)
                setEvents(prev => [...prev, ...recentEventsData])
                if (recentEventsData.length) {
                    setOldestSeen(recentEventsData[recentEventsData.length - 1].time)
                }
                if (recentEventsData.length < EVENTS_PER_RETRIEVE) {
                    setNoMoreEvents(true)
                }
                setStatus('ready')
                // Changes listen state on first run
                setListen(prev => prev ? prev : true)
            } catch (e) {
                console.log(e)
                setStatus('error')
            }
        }

        getEvents()
    }, [session, firebase, status, oldestSeen])

    const requestOlderEvents = () => {
        setStatus('load')
    }

    // Listen new events
    useEffect(() => {
        let unsubscribe = () => { }
        if (!session.auth) {
            return
        }
        // Only attach listener after initial retrieval
        if (!listen) {
            return
        }
        unsubscribe = firebase.db.collection('users').doc(session.auth?.uid).collection('events').orderBy('time', 'desc').limit(1).onSnapshot(function (snapshot) {
            console.log('Listening for new events...')
            snapshot.docChanges().forEach(change => {
                const newEventData = change.doc.data() as SentinelEvent
                // First initial (added)-load is ignored
                // First event upload (type added) is ignored because no photo ulr
                if (change.type === "modified") {
                    setEvents(prev => {
                        const latestLocalEvent = prev[0]
                        console.log('------')
                        console.log(newEventData)
                        if (latestLocalEvent.id !== newEventData.id) {
                            // First modification with photoURL
                            console.log('Received event update with photo URL')
                            return [newEventData, ...prev]
                        } else if (!latestLocalEvent.videoPreviewUrl && newEventData.videoPreviewUrl) {
                            // third modification with video filename
                            console.log('Received event update video URL')
                            setSelectedEvent(prevSelectedEvent => {
                                if (prevSelectedEvent?.id === newEventData.id) {
                                    console.log('Updating currently viewed event')
                                    return newEventData
                                }
                                return prevSelectedEvent
                            })
                            return [newEventData, ...(prev.slice(1))]
                        } else {
                            // second modification with video filename
                            console.log('Not updating')
                            return prev
                        }
                    })
                }
            })
        })

        return () => {
            unsubscribe()
        }

    }, [firebase, session, listen])

    const cardSizeXs = 12
    const cardSizeMd = 4
    const cardSizeXl = 4


    const getConfidences = (detection: ObjectLocalization, index: number) => {
        const { score, name } = detection
        const scorePercent = (score * 100).toFixed(0)

        return (
            <p key={index}>{name}: {scorePercent}%</p>
        )
    }


    const renderedEvents = events.map((event, index) => {
        const { photoPreviewUrl, time, detectionsOfInterest, allDetections, id, motionPercent } = event

        const deleteEvent = async () => {
            setEvents(prev => prev.filter(event => event.id !== id))
            await firebase.db.collection('users').doc(session.auth?.uid).collection('events').doc(id).delete()
        }
        const timeText = firebase.getTimeText(time)

        const interestConfidences = detectionsOfInterest.map(getConfidences)
        const allConfidences = allDetections.map(getConfidences)

        const viewVideo = () => {
            setSelectedEvent(event)
            setShowHeader(false)
        }

        return (
            <Col xs={cardSizeXs} md={cardSizeMd} xl={cardSizeXl} key={index}>
                <Card className={globalStyles.marginBottom1} >
                    <div className={globalStyles.pointer} onClick={viewVideo}>
                        {photoPreviewUrl ?
                            <Card.Img variant="top" src={photoPreviewUrl} />
                            :
                            <div className={joinStyles(globalStyles.centerText, styles.noPhotoPreview)} >
                                <p>No photo available (please let Brian know)</p>
                            </div>
                        }
                    </div>
                    <Card.Body>
                        <Row>
                            <Col>
                                <Card.Title>{timeText}</Card.Title>
                            </Col>
                        </Row>
                        <Row className={globalStyles.marginTop1}>
                            <Col className={globalStyles.pointer} onClick={viewVideo}>
                                {detectionsOfInterest.length > 0 ?
                                    <div className="">
                                        <span className="colorGray">Notified</span>
                                        <span className={styles.interestText}>{interestConfidences}</span>
                                    </div>
                                    :
                                    <p className="colorGray">No notifications</p>
                                }
                            </Col>
                            <Col>
                                {allDetections.length > 0 ?
                                    <div className="colorGray">
                                        <span>All Detections</span>
                                        {allConfidences}
                                    </div>
                                    :
                                    <p className="colorGray">No Detections</p>
                                }
                            </Col>
                        </Row>
                        <Row className={globalStyles.marginTop2}>
                            <Col >
                                <Button variant="outline-secondary" onClick={deleteEvent}>Delete</Button>
                            </Col>
                            <Col >
                                <div className="colorGray">
                                    <p>Motion: {(motionPercent * 100).toFixed(0)}%</p>
                                </div>
                            </Col>
                        </Row>
                        <link rel="stylesheet" href="/css/video-react.css" />
                    </Card.Body>
                </Card>
            </Col>
        )
    })



    if (selectedEvent) {
        const { photoPreviewUrl, videoPreviewUrl, time, allDetections } = selectedEvent as SentinelEvent
        const timeText = firebase.getTimeText(time)

        const goBackToEventsPage = () => {
            setSelectedEvent(null)
            setShowHeader(true)
        }

        const allConfidences = allDetections.map(getConfidences)


        return (
            <div className={styles.selectedEventPage}>
                <div className={globalStyles.marginBottom2}>
                    <Button variant="outline-primary" onClick={goBackToEventsPage} className={globalStyles.link}>&lt; Back to All Events</Button>
                </div>
                <div className={globalStyles.marginBottom2}>
                    <h3>{timeText}</h3>
                    <p className={globalStyles.colorGray}>{time.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>

                </div>
                <div className={globalStyles.marginBottom2}>
                    <Card.Subtitle className={"mb-2 text-muted"}>Detected: {allConfidences}</Card.Subtitle>
                </div>
                <div className={globalStyles.centerText}>
                    <div className={styles.videoHolder}>
                        {videoPreviewUrl ? <Player
                            playsInline
                            poster={photoPreviewUrl}
                            src={videoPreviewUrl}
                        /> :
                            <>
                                <h6>Aeronaut is recording and uploading this video....</h6>
                                <Spinner variant={"secondary"} animation={"border"} />
                                <p className="colorGray">It will be ready in about 10 seconds.</p>
                            </>
                        }
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Row className="align-items-end">
                <Col xs={"auto"} >
                    <h3>Recent Events </h3>
                </Col>
                <Col xs="auto" >
                    <p className={"colorGray"}>(automatically updated)</p>
                </Col>
            </Row>
            {status === 'error' && <p className="colorError">Error loading events. Please ask Brian for help or try again later</p>}
            <div className={globalStyles.marginTop1}>
                <Row>
                    {renderedEvents}
                    <Col xs={cardSizeXs} md={cardSizeMd} xl={cardSizeXl} className={"align-items-center"}>
                        {(status === 'loading' || status === 'load') &&
                            <Spinner variant={"primary"} animation={"border"} />}

                        {(status === 'ready' && !noMoreEvents) &&
                            <div className={joinStyles(globalStyles.fullWidth, globalStyles.centerText, styles.emptyCard)}>
                                <Button onClick={requestOlderEvents}>Load Older Events</Button>
                            </div>}

                        {status === 'ready' && renderedEvents.length === 0 &&
                            <div className={joinStyles(globalStyles.fullWidth, globalStyles.centerText, styles.emptyCard)}>
                                <p className="colorGray">No events yet</p>
                            </div>
                        }
                    </Col>
                </Row>
            </div>
        </div >

    )
}

export { Events }