import React from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { useHistory } from 'react-router-dom'


import {
    isBrowser,
} from "react-device-detect";

import styles from './TopNavbar.module.css'
import { joinStyles } from '../Utilities'
import { ROUTES } from '../../constants'
import { globalStyles } from '../Utilities/joinStyles';

const TopNavbar: React.FC = () => {
    const history = useHistory()

    const goToLink = (path: string) => () => {
        history.push(path)
    }


    const landingNavBarStyle = joinStyles(styles.topNav, globalStyles.sidePaddingLite)
    const loginColStyle = isBrowser ? styles.loginCol : 'noPadding'

    return (
        <div className={landingNavBarStyle} >
            <Row className={"align-items-center"}>
                <Col >
                    <div>
                        <h3 className={joinStyles(globalStyles.colorBlue, globalStyles.pointer)} onClick={goToLink(ROUTES.ROOT)}>Aeronaut Grub</h3>
                    </div>
                </Col>
                <Col xs={"auto"} className={loginColStyle}>
                    <Row className="justify-content-end">
                        <Col xs={12}>
                            <LoginButton />
                        </Col>
                    </Row>

                </Col>

            </Row>
        </div>
    )
}

export const LoginButton = () => {
    const history = useHistory()

    const goToLink = (path: string) => () => {
        history.push(path)
    }
    return (
        <p className={globalStyles.link} onClick={goToLink(ROUTES.LOGIN)}>Log in</p>)
}

export { TopNavbar }