import React from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from 'react-bootstrap/Image'
import styles from './Landing.module.css'

import { joinStyles } from '../Utilities'
import useWindowSize from 'react-use/lib/useWindowSize'
import { Legal } from './Legal'
// import {
//     isBrowser,
// } from "react-device-detect";

import slopesTop from '../../assets/slopesTop.svg'
import slopesBottom from '../../assets/slopesBottom.svg'
import { TopNavbar } from './TopNavbar'
import { globalStyles } from '../Utilities/joinStyles'
import windowImage from '../../assets/window.jpg'
import berryImage from '../../assets/berry.jpg'


const Steps: React.FC = () => {
    const { width } = useWindowSize()

    const example1 = <p className={styles.example}>"Text me when a human is detected between 9am-5pm."</p>
    const example2 = <p className={styles.example}>"Call me when my pet is detected."</p>
    const example3 = <p className={styles.example}>"Upload recorded videos to my Google Drive."</p>
    const example4 = <p className={styles.example}>"Turn on a light if motion is detected at night."</p>


    if (width < 700) {
        return (
            <div className="text-center justify-content-center">
                {example1}
                <div className={globalStyles.marginBottom3} />
                {example2}
                <div className={globalStyles.marginBottom3} />
                {example3}
                <div className={globalStyles.marginBottom3} />
                {example4}
            </div>
        )
    } else {
        return (
            <div id="example-fade-text">
                <Row >
                    <Col className="text-center" >
                        {example1}
                    </Col>
                    <Col className="text-center " >
                        {example2}
                    </Col>
                    <Col className="text-center">
                        {example3}
                    </Col>
                    <Col className="text-center">
                        {example4}
                    </Col>
                </Row>
            </div>
        )
    }
}

const Landing: React.FC = () => {


    return (
        <>

            <TopNavbar />

            {/* 1. Hero */}
            <div className={globalStyles.sidePaddingLite}>
                <Row className={joinStyles(styles.reverse)}>
                    <Col xs={12} md={6} className={globalStyles.marginTop2}>
                        <Image src={windowImage} className={styles.demoImg} />
                    </Col>
                    <Col xs={1} />
                    <Col xs={12} md={5} className={joinStyles(styles.featuresCol, globalStyles.marginTop2)}>
                        <h2 className={joinStyles(styles.largeText, globalStyles.marginBottom2)}>the Aeronaut Zero</h2>
                        <h4 className={globalStyles.colorGray}>Simple Setup.</h4>
                        <h3 className={globalStyles.colorBlue}>Custom Intelligence.</h3>
                        <div className={joinStyles(styles.launchDealBox)}>
                            <h5>Exclusive Launch Deal: $29.99</h5>
                            <p className={globalStyles.colorBlue}>1 Aeronaut Zero Camera</p>
                            <p className={globalStyles.colorBlue}>w/ Starter Plan, free forever</p>
                            <p className={joinStyles(globalStyles.colorGray, globalStyles.marginTop1)}>(first 20 customers)</p>
                        </div>


                        <div className={globalStyles.marginTop4}>
                            <h4>Intelligence</h4>
                            <p className={styles.feature}>Smart Notifications based on what your camera sees</p>
                            <p className={styles.feature}>Recognize and count people, cars, and animals</p>
                            <p className={styles.feature}>Run custom Logic Programs based on detected people, time of day, text/call notifications, and more</p>
                            <p className={styles.feature}>Tell us your feature request, and we'll build it for you! Email us at <a href="mailto:launch@aeronautgrub.com">launch@aeronautgrub.com</a>!</p>
                        </div>

                        <div className={globalStyles.marginTop2}>
                            <h4>Security and Privacy</h4>
                            <p className={styles.feature}>Privacy Promise: We will never sell your data.</p>
                            <p className={styles.feature}>Your control when photos and videos are automatically deleted, where to export them, and more</p>
                            <p className={styles.feature}>Connects via WiFi. Photos and videos are not stored on device</p>
                        </div>

                        <div className={globalStyles.marginTop2}>
                            <h4 className="colorGray">More Details</h4>
                            <p className={styles.feature}><b>No night vision</b> (coming soon)</p>
                            <p className={styles.feature}>Lifetime warranty and support, 90 day refund</p>
                            <p className={styles.feature}>Direct Customer Support</p>
                            <p className={styles.feature}>Powered via electrical outlet</p>
                            <p className={styles.feature}>Suction cup for indoor placement on window</p>
                        </div>

                    </Col>

                </Row>
            </div>

            {/* Divider */}
            <div className={globalStyles.centerText}>
                <div className={styles.sectionLine} />
            </div>

            {/* 2. Customization */}
            <Image src={slopesTop} className={styles.slopesTop} />
            <div className={styles.grayRow} >
                <div className={globalStyles.sidePaddingLite}>
                    <h2 className={joinStyles(styles.howTitle, globalStyles.marginBottom3)}>Custom Logic Programs</h2>
                    <Steps />
                </div>
            </div>
            <Image src={slopesBottom} className={styles.slopesBottom} />

            {/* Divider */}
            <div className={globalStyles.centerText}>
                <div className={styles.sectionLine} />
            </div>


            {/* 3. Purchase */}
            <div className={joinStyles(globalStyles.sidePaddingLite)}>
                <Row >
                    <Col xs={12} sm={3} className={globalStyles.marginTop2}>
                        <Image src={berryImage} className={styles.demoImg} />
                    </Col>
                    <Col xs={1} />
                    <Col xs={12} sm={8} className={globalStyles.marginTop2}>
                        <h2 className={globalStyles.marginBottom1}>Available Plans</h2>
                        <Row className={joinStyles(globalStyles.marginBottom1)}>
                            <Col xs={12} md={6} className={globalStyles.centerText}>
                                <p className={joinStyles(styles.featureTableLabel, styles.featureTableTop,)}>&nbsp;</p>
                            </Col>
                            <Col xs={6} md={3} className={globalStyles.centerText}>
                                <h5 className={globalStyles.marginBottom0}>Basic</h5>
                                <p>(included)</p>
                            </Col>
                            <Col xs={6} md={3} className={globalStyles.centerText}>
                                <h5 className={globalStyles.marginBottom0}>Starter</h5>
                                <p>($5/mo)</p>
                            </Col>
                        </Row>

                        <Row className={styles.featureRow}>
                            <Col xs={12} md={6} className={globalStyles.centerText}>
                                <p className={styles.featureTableLabel}>Smart Notifications</p>
                            </Col>
                            <Col xs={6} md={3}>
                                <h2 className={joinStyles(globalStyles.colorGreen, globalStyles.centerText)}>✓</h2>
                            </Col>
                            <Col xs={6} md={3}>
                                <h2 className={joinStyles(globalStyles.colorGreen, globalStyles.centerText)}>✓</h2>
                            </Col>
                        </Row>

                        <Row className={styles.featureRow}>
                            <Col xs={12} md={6} className={globalStyles.centerText}>
                                <p className={styles.featureTableLabel}>Video saving and sharing</p>
                            </Col>
                            <Col xs={6} md={3}>
                                <h2 className={joinStyles(globalStyles.colorGreen, globalStyles.centerText)}>✓</h2>
                            </Col>
                            <Col xs={6} md={3}>
                                <h2 className={joinStyles(globalStyles.colorGreen, globalStyles.centerText)}>✓</h2>
                            </Col>
                        </Row>


                        <Row className={styles.featureRow}>
                            <Col xs={12} md={6} className={globalStyles.centerText}>
                                <p className={styles.featureTableLabel}>Privacy Controls</p>
                            </Col>
                            <Col xs={6} md={3}>
                                <h2 className={joinStyles(globalStyles.colorGreen, globalStyles.centerText)}>✓</h2>
                            </Col>
                            <Col xs={6} md={3}>
                                <h2 className={joinStyles(globalStyles.colorGreen, globalStyles.centerText)}>✓</h2>
                            </Col>
                        </Row>

                        <Row className={styles.featureRow}>
                            <Col xs={12} md={6} className={globalStyles.centerText}>
                                <p className={styles.featureTableLabel}>Extended Warranty</p>
                            </Col>
                            <Col xs={6} md={3}>
                            </Col>
                            <Col xs={6} md={3}>
                                <h2 className={joinStyles(globalStyles.colorGreen, globalStyles.centerText)}>✓</h2>
                            </Col>
                        </Row>

                        <Row className={joinStyles("align-items-center", styles.featureRow)}>
                            <Col xs={12} md={6} className={globalStyles.centerText}>
                                <p className={styles.featureTableLabel}>Custom Logic Programs</p>
                            </Col>
                            <Col xs={6} md={3}>
                                <p className={globalStyles.centerText}>1</p>
                            </Col>
                            <Col xs={6} md={3}>
                                <p className={globalStyles.centerText}>Unlimited</p>
                            </Col>
                        </Row>

                        <Row className={joinStyles("align-items-center", styles.featureRow)}>
                            <Col xs={12} md={6} className={globalStyles.centerText}>
                                <p className={styles.featureTableLabel}>Event History</p>
                            </Col>
                            <Col xs={6} md={3}>
                                <p className={globalStyles.centerText}>7 days</p>
                            </Col>
                            <Col xs={6} md={3}>
                                <p className={globalStyles.centerText}>Unlimited</p>
                            </Col>
                        </Row>



                    </Col>
                </Row>
            </div>


            {/* 5. Footer */}
            <div className={joinStyles(styles.footer, globalStyles.marginTop2)}>
                <div className={globalStyles.sidePaddingLite}>
                    <Legal />
                </div>
            </div>
        </>
    )
}


export { Landing }