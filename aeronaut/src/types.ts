import { firestore } from "firebase";
import { google } from '@google-cloud/vision/build/protos/protos';


// Configs 
export interface CamConfigData { //config/config
    midsToDetect: Map<string, string>,
    confidenceThreshold: number,
    motionThreshold: number,
}

export interface CameraDetails { //cameras/{cameraUid}
    ownerUid: string,
    halt: boolean,
    haltReceived: boolean,
}


// Data 
export interface StatsUpdate {
    timeLastUpdated: firestore.Timestamp,
    lastUpdateCameraOriginUid: string,
    motionDetections: firestore.FieldValue | number
    events: firestore.FieldValue | number
}

export interface UsingPhotoSettings {
    motionPercent: number,
    msNow: string,
}


export interface EventData {
    id: string,
    time: firestore.Timestamp,
    eventNumber: number,
    trigger: 'od' | 'ir' | '',
    cameraUidOrigin: string,

    // od
    allDetections: google.cloud.vision.v1.ILocalizedObjectAnnotation[],
    detectionsOfInterest: google.cloud.vision.v1.ILocalizedObjectAnnotation[],
    photoFilename: string,
    motionPercent: number,
}
