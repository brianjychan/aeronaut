import React, { useEffect, useState } from 'react'
import { useFirebase } from '../Firebase'
import { useSession } from '../Session'

// import styles from './Stats.module.css'
import Spinner from 'react-bootstrap/Spinner'
import { globalStyles, joinStyles } from '../Utilities/joinStyles'
import { CameraProfile, Stats } from '../Types/Types'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Button } from 'react-bootstrap'



const StatsArea: React.FC = () => {
    const firebase = useFirebase()
    const session = useSession()

    // Event Data
    const [stats, setStats] = useState<Stats>({} as Stats)
    const [minuteRefresh, setMinuteRefresh] = useState(0)
    const [turnedOff, setTurnedOff] = useState<string[]>([])

    // Request Data
    useEffect(() => {
        console.log('Retrieving Metrics')
        const unsubscribeStats = firebase.db.collection('users').doc(session.auth?.uid).collection('stats').orderBy('timeLastUpdated', 'desc').limit(1).onSnapshot(
            querySnapshot => {
                const recentStatsData = querySnapshot.docs[0].data() as Stats
                setStats(recentStatsData)
            },
            e => {
                console.log(e)
            })

        return () => {
            unsubscribeStats()
        }


    }, [firebase, session])

    // Refresh view of 'x minutes ago' every 15s, even though cameras trigger update every 5m
    useEffect(() => {
        setTimeout(() => {
            console.log('Refreshing Summary')
            setMinuteRefresh(prev => prev + 1)
        }, 15000)

    }, [minuteRefresh])

    const { motionDetections, events } = stats
    const timeStatsLastUpdatedText = stats.timeLastUpdated ? firebase.getTimeText(stats.timeLastUpdated) : ''

    const renderedCameras = session.cameras.map((cameraData, index) => {
        const { name, cameraUid } = cameraData
        const timeCameraLastUpdatedText = cameraData.timeLastUpdated ? firebase.getTimeText(cameraData.timeLastUpdated) : ''


        const doTurnOff = () => {
            firebase.db.collection('cameras').doc(cameraUid).update({
                halt: true
            }).then(() => {
                setTimeout(() => {
                    firebase.db.collection('cameras').doc(cameraUid).get().then((doc) => {
                        const { haltReceived } = doc.data() as CameraProfile
                        if (haltReceived) {
                            setTurnedOff(prev => [...prev, cameraUid])
                        }
                    })
                }, 5000)
            })
        }

        return (
            <Row key={index}>
                <Col >
                    <p className={"colorGray"}>{name}: </p>
                </Col>
                <Col>
                    <p>{timeCameraLastUpdatedText}</p>
                </Col>
                <Col>
                    {turnedOff.includes(cameraUid) ?
                        <p className="colorGray">Off</p>
                        :
                        <Button onClick={doTurnOff} variant="outline-danger">Turn Off</Button>
                    }
                </Col>
            </Row >
        )
    })

    return (
        <div key={minuteRefresh}>
            <Row>
                <Col xs={12} md={6} className={globalStyles.marginBottom2}>
                    <h3 className={globalStyles.marginBottom1}>Today's Summary</h3>
                    {timeStatsLastUpdatedText
                        ?
                        <Row>
                            <Col xs="auto">
                                <p className={"colorGray"}>Motion Events:</p>
                                <p className={"colorGray"}>Events w/ Detections:</p>
                                <p className={"colorGray"}>Last updated:</p>
                            </Col>
                            <Col xs="auto">
                                <p>{motionDetections}</p>
                                <p>{events}</p>
                                <p>{timeStatsLastUpdatedText}</p>
                            </Col>
                        </Row>
                        :
                        <Spinner variant={"primary"} animation={"border"} />
                    }
                </Col>
                <Col xs={12} md={6} className={globalStyles.marginBottom2}>
                    <h3 className={globalStyles.marginBottom1}>Camera Statuses</h3>
                    {renderedCameras}
                    <p className={joinStyles(globalStyles.colorGray, globalStyles.marginTop2)}>(Each camera updates every 5 minutes)</p>
                </Col>
            </Row>
        </div>
    )
}

export { StatsArea }