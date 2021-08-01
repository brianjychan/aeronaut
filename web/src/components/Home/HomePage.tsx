import React, { useState } from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import styles from './HomePage.module.css'

import { globalStyles } from '../Utilities/joinStyles';
import { Events } from './Events'
import { StatsArea } from './StatsArea'
import { useFirebase } from '../Firebase'

const HomePage: React.FC = () => {
    const [showHeader, setShowHeader] = useState(true)
    const firebase = useFirebase()

    return (
        <Row className={styles.window}>
            <Col>
                {/* Navbar */}
                <Row className={"align-items-end"}>
                    {/* Title */}
                    <Col>
                        <h3 className={globalStyles.colorBlue}>Aeronaut Console</h3>
                    </Col>
                    {showHeader && <Col xs="auto">
                        <p className={globalStyles.link} onClick={() => { firebase.doSignOut() }}>Sign Out</p>
                    </Col>}
                </Row>
                {/* Main Content */}
                <Row className={globalStyles.marginTop2}>
                    <Col xs={12}>
                        {showHeader && <>
                            {/* <div className={joinStyles(globalStyles.marginBottom2, styles.helpCard)}>
                                <div className={globalStyles.marginBottom1}>
                                    <h3 className={joinStyles(styles.feat, "colorGray")}>Hello,{" " + sessionName}!</h3>
                                </div>
                                <p className={globalStyles.marginBottom1}>If you have *any* questions, requests, suggestions, or criticism, call or text Brian at any time (really!) at <a href={"sms:" + phoneNumber}> {phoneNumber}</a>. He is looking for feedback.</p>
                            </div> */}
                            <div className={globalStyles.marginBottom3}>
                                <StatsArea />
                            </div>
                        </>}
                        <div >
                            <Events setShowHeader={setShowHeader} />
                        </div>
                    </Col>
                </Row>
            </Col>
        </Row >
    )
}

export { HomePage }
