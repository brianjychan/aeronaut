// When updating, be sure all backend versions are updated
import { firestore } from 'firebase';
// Also search through codebase for where the type is used


// This is the format of the document at /users/{uid}
export interface UserProfile {
    // In Data structure
    uid: string;
    name: string;
    phoneNumber: number;
}

export interface Stats {
    timeLastUpdated: firestore.Timestamp,
    motionDetections: number,
    events: number,
}

export interface CameraProfile {
    uid: string,
    ownerUid: string,
    enableTexts: boolean,
    name: string,
    timeLastUpdated: firestore.Timestamp,
    cameraUid: string,
    haltReceived: boolean,
    halt: boolean,
}

export interface ObjectLocalization {
    boundingPoly: Object,
    mid: string
    score: number,
    name: string
}

export interface SentinelEvent {
    photoPreviewUrl?: string,
    videoPreviewUrl: string,
    time: firestore.Timestamp,
    allDetections: Array<ObjectLocalization>,
    detectionsOfInterest: Array<ObjectLocalization>,
    id: string,
    motionPercent: number
}