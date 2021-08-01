import React, { useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useFirebase } from '../Firebase'
import Button from 'react-bootstrap/Button'
import { globalStyles, joinStyles } from '../Utilities/joinStyles';
import styles from './Login.module.css'
import { TopNavbar } from './TopNavbar';

export const LoginPage = () => {
    return (
        <div>
            <TopNavbar />
            <div className={globalStyles.sidePaddingLite}>
                <Row className={joinStyles(globalStyles.marginTop4, "justify-content-center", globalStyles.centerText)}>
                    <Col xs={12} sm={6} md={4}>
                        <h5>Welcome Back!</h5>
                        <EmailPwAuth />
                    </Col>
                </Row>
            </div>
        </div>
    )
}


const EmailPwAuth: React.FC = () => {
    const firebase = useFirebase()

    const [inputs, setInputs] = useState({ email: '', pw: '', signInError: false })
    const { email, pw, signInError } = inputs
    // Handle text box change
    const handleInputs = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.persist()
        setInputs(prev => ({ ...prev, [event.target.name]: event.target.value }))
    }
    // Listen for enter key
    const listenEnterKey = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            doSignIn()
        }
    }
    const doSignIn = async () => {
        try {
            setInputs(prev => ({ ...prev, signInError: false }))
            await firebase.doSignInWithEmailAndPassword(email, pw)
        } catch (e) {
            console.error(e)
            setInputs(prev => ({ ...prev, signInError: true }))
        }
    }

    return (
        <div>
            <input name='email' onChange={handleInputs} className={styles.marginTopWidth100PaddingSmall} value={inputs.email} placeholder="email" onKeyDown={listenEnterKey} />
            <input name='pw' onChange={handleInputs} className={styles.marginTopWidth100PaddingSmall} value={inputs.pw} placeholder="password" onKeyDown={listenEnterKey} type="password" />
            {signInError && <p className="colorError">Error signing in!</p>}
            <Button className={globalStyles.marginTop1} onClick={doSignIn}>Log In</Button>
        </div>
    )
}
