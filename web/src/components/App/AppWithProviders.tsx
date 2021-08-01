import React, { useState, useEffect } from 'react'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    // Redirect,
} from "react-router-dom"

import { ROUTES } from '../../constants'
import { HomePage } from '../Home'
import { useFirebase } from '../Firebase'
import { useSession, SessionContext } from '../Session/'
import { ConfigData, SessionObject } from '../Session/useSession';
import Spinner from 'react-bootstrap/Spinner'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import styles from './AppWithProviders.module.css'
import { globalStyles, joinStyles } from '../Utilities/joinStyles';
import { CameraProfile, UserProfile } from '../Types/Types'
// import { Landing } from '../Landing'
import { LoginPage } from '../Landing/Login'

const AppWithRoutes: React.FC = () => {
    const session = useSession()

    if (session.initializing) {
        return (
            <Row className={joinStyles("justify-content-center align-items-center", styles.fullHeight)}>
                <Col xs="auto" >
                    <Spinner variant={"primary"} animation={"border"} />
                </Col>
            </Row>
        )
    }

    return (
        <Row className={joinStyles("justify-content-center", globalStyles.noMargin)}>
            <Col className={joinStyles(styles.window, globalStyles.noSidePadding)}>
                <Router>
                    <Switch>
                        {/* <Route path={ROUTES.LOGIN}>
                            {session.auth ?
                                <Redirect to={ROUTES.ROOT} />
                                :
                                <LoginPage />
                            }
                        </Route> */}


                        <Route path={ROUTES.ROOT}>
                            {session.auth ?
                                <HomePage />

                                :
                                <LoginPage />
                            }
                        </Route>
                        {/* TODO: events have their separate page */}
                        {/* <Route path={ROUTES.EVENT}>
                    <EventPage />
                </Route> */}
                    </Switch>
                </Router>
            </Col>
        </Row>
    )
}

const AppWithAuth: React.FC = () => {
    const firebase = useFirebase()
    const [session, setSession] = useState<SessionObject>({
        initializing: true,
        auth: null,
        prof: null,
        config: null,
    } as SessionObject)

    useEffect(() => {
        // Retrieve the logged in user's profile
        let unsubscribeProfile = () => { }
        let unsubscribeCameras = () => { }

        // Runs when auth change
        async function onAuthChange(newUser: any) {
            if (newUser === null) {
                // Not authenticated
                unsubscribeCameras()
                unsubscribeProfile()
                setSession({ initializing: false, config: null, auth: null, prof: null, cameras: [] })
                return
            }

            let currSessionObject: SessionObject = {
                initializing: false,
                auth: newUser,
                config: null,
                prof: null,
                cameras: []
            }

            // Get config 
            try {
                const configData = (await firebase.db.collection('config').doc('config').get()).data() as ConfigData
                currSessionObject = { ...currSessionObject, config: configData }
            } catch (e) {
                console.error('Couldn\'t access config', e)
            }

            // Attach Profile listener
            unsubscribeProfile = firebase.db.collection('users').doc(newUser.uid).onSnapshot(async function (profileDoc) {
                console.log('Retrieved Profile')
                const profileData = profileDoc.data() as UserProfile
                currSessionObject = { ...currSessionObject, prof: profileData }

                // Attach Camera listener
                unsubscribeCameras = firebase.db.collection('cameras').where("ownerUid", '==', newUser.uid).onSnapshot(async function (cameraDocs) {
                    console.log('Retrieved Cameras')
                    const cameraDataArr = cameraDocs.docs.map(cameraDoc => cameraDoc.data()) as Array<CameraProfile>
                    currSessionObject = { ...currSessionObject, cameras: cameraDataArr, initializing: false }
                    setSession(currSessionObject)
                }, (e) => {
                    console.error('Couldn\'t access cameras. Error: ', e)
                    currSessionObject = { ...currSessionObject, initializing: false }
                    setSession(currSessionObject)

                })

            }, (e) => {
                console.error('Couldn\'t access profile. Error: ', e)
                currSessionObject = { ...currSessionObject, initializing: false }
                setSession(currSessionObject)
            })
        }

        // listen for auth state changes
        const unsubscribe = firebase.auth.onAuthStateChanged(onAuthChange)

        return () => {
            unsubscribeCameras()
            unsubscribeProfile()
            unsubscribe()
        }
    }, [firebase])

    return (
        <SessionContext.Provider value={session}>
            <AppWithRoutes />
        </SessionContext.Provider>
    )
}

export { AppWithAuth } 