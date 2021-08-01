// Helper functions

import { firestore } from "firebase";

export function getCurrDateString() {
    const d = new Date(),
        year = d.getFullYear()

    let month = '' + (d.getMonth() + 1),
        day = '' + d.getDate()

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

export const sleep = (seconds: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1000);
    })
}

export const getMsFromTimestamp = (timestamp: firestore.Timestamp) => {
    return String(timestamp.toDate().getTime())
}

export const timeOutAwait = async (argPromise: Promise<any>, secondsTimeOut: number) => {
    const timeoutPromise = new Promise((resolve, _) => {
        setTimeout(resolve, secondsTimeOut * 1000, { timeout: true });
    });

    const result = await Promise.race([argPromise, timeoutPromise])
    return result
}