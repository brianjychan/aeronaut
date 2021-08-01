import React, { useEffect } from 'react'
import { useFirebase } from '../Firebase'
import { useSession } from '../Session'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

// import styles from './Template.module.css'


const Template: React.FC = () => {
    const firebase = useFirebase()
    const session = useSession()

    useEffect(() => {
        console.log('loaded')
        console.log(firebase)
        console.log(session)
    }, [firebase, session])

    return (
        <Row>
            <Col>
            </Col>
        </Row>
    )
}

export { Template }