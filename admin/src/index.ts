'use strict';
import * as admin from 'firebase-admin'
let dev_key = {}
// let prod_key = {}
try {
    dev_key = require("../keys/dev-service-account-key.json")
    // prod_key = require("../keys/prod-service-account-key.json")
} catch (error) {
    console.log('Could not find service account keys. Please place them in /keys')
    process.exit()
}

// Code
const args = process.argv.slice(2);
const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
if (args.length !== 2) {
    console.log("Please revise cmd")
    process.exit()
}

console.log('\n\n------------ Preparing to run script ----------\n\n')

// Determine dev or prod environment
console.log('Arguments received: ', args)

const chosenEnvName = args[0]
// admin app instance used to access firebase
let adminApp = {} as admin.app.App
if (chosenEnvName === 'dev') {
    adminApp = admin.initializeApp({
        credential: admin.credential.cert(dev_key),
    });
    console.log('Environment: dev')
} else if (chosenEnvName === 'production') {
    // adminApp = admin.initializeApp({
    //     credential: admin.credential.cert(prod_key),
    // });
    console.log('Environment: production')
    console.log('****** Scripting in prod! CAUTION! *******')
} else {
    console.error('Invalid environment specified')
    process.exit()
}


// Determine which script to run
const scriptName = args[1]
console.log('script name: ', args[1])
console.log('\n')
rl.question("Executing script: " + scriptName + ". Please confirm script name: ", async (confirmation: string) => {
    let confirmed = false
    if (chosenEnvName === 'production') {
        if (confirmation === "confirm production " + scriptName) {
            confirmed = true
        }
    } else if (chosenEnvName === 'dev') {
        if (confirmation === scriptName) {
            confirmed = true
        }
    }
    if (!confirmed) {
        console.log("Was not confirmed correctly")
        rl.close()
        process.exit()
    }
    try {
        // Load file and script
        const module = await import("./" + scriptName)
        const scriptToRun = module.default

        // Run script
        await scriptToRun(adminApp)
    } catch (error) {
        console.log("\x1b[31m") // Switch to red
        console.log('------- Error -------')
        console.log("\x1b[0m") // Switch color back
        console.log(error)
    }

    rl.close()
    process.exit()
})