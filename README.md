# Aeronaut Platform

Aeronaut is a DIY smart doorbell replicating the base functionality of products like Ring or Nest doorbell cameras. It's implemented using a Raspberry Pi Zero, GCP, and Telegram. 

This repo contains the code and guides for setting up all the related tooling, infrastructure, and functionality.

Raspberry Pi Zero - device compute and camera
GCP: Image processing and data storage
Telegram: Notifications about visitors

Files of note
```md

ROOT (`aeronaut-release`)
├── `README.md` (YOU ARE HERE)
├── `admin` (ad-hoc corrective admin scripting for Firestore)
├── `functions` (deployed to Firebase Cloud Functions)
├── `web` (web app)
├── `aeronaut` (camera)
│   ├── `aeronaut-build` (the compiled build to deploy to the device)
│   ├── `src` (source for `aeronaut`)
│   │   └── `index.ts` (program entry point)
│   └── `./build.sh` (build script)

```

# Setup steps

Clone this repo.
`git clone https://github.com/brianjychan/aeronaut-release`

Creating Firebase
1. Create a new Firebase project at https://console.firebase.google.com/u/0/. 
   - You can skip the Google Analytics setup.
2. Install the firebase CLI and login. Learn more here: [Firebase CLI reference](https://firebase.google.com/docs/cli)
3. Take note of the `projectId`. In this dir, run `firebase use --add {projectID}`, replacing {projectID} with your projectId.

Configuring Firebase
1. In the Firebase Console, register a new app (use "Web"). You can nickname it `camera`. When you are given the `firebaseConfig` in step 2, paste the corresponding values to `./aeronaut/keys/myAeronaut.json`
   - Leave Firebase Hosting unchecked.
2. Open the Firebase "Authentication" tab. Enable "Email/Password" as a sign in method.
3. Create an account that the **camera** will operate under. Add that email and password to the appropriate fields in `./aeronaut/keys/myAeronaut.json`. 
   - You can use something like "`YOUR-ADDRESS-HERE`+camera@gmail.com". You can use any values here, but be sure to save them for later. 
4. Create an account that the **user** will operate under. You will be logging into the web portal with these credentials, so remember them.
5. Click "Create database" in the "Cloud Firestore" tab.
6. Storage in the "Storage" tab.
7.  Enable the Vision API. Click "Enable the Vision API" here https://cloud.google.com/vision/docs/setup


Setting up each parts
1.  Download the service account key, and save the file in two copies: one at `./admin/keys/dev-service-account-key.json`, the other at `./aeronaut/keys/gcloudSA.json`
2.  Initialize your Firebase project with data. Follow `./admin/README.md`
3.  Deploy the backend functions. Follow `./functions/README.md`.
4.  Deploy the website. Follow `./web/README.md`.
5.  Set up the camera! Follow `./aeronaut/README.md`.

s
# Confirm everything works
1. Walk in front of the camera and make sure you got a Telegram text! To check for errors on the camera, use `ssh`, to check for errors in processing, check the Firebase Functions console.

# Usage 
You now have two ways of connecting:
1. Use the console from the website you deployed earlier (in `./web`).
2. `ssh` directly to the camera when on the same network. (e.g. `ssh pi@aeronaut.local`)


Enjoy! Let Brian know if you have any questions or run into any complications at all.


