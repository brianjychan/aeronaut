import { createContext, useContext } from 'react'
import firebase from 'firebase'
import { CameraProfile, UserProfile, } from '../Types/Types';

export interface ConfigData {
    midsToDetect: Map<string, string>,
    phoneNumber: string
}

export interface SessionObject {
    initializing: boolean,
    auth: firebase.User | null,
    prof: UserProfile | null
    config: ConfigData | null
    cameras: Array<CameraProfile>
}

const SessionContext = createContext<SessionObject>({
    initializing: true,
    auth: null,
    config: null,
    prof: null,
    cameras: []
})

const useSession = () => {
    const session = useContext(SessionContext)
    return session
}

export { SessionContext, useSession }

