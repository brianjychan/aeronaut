# Aeronaut Camera Setup

This guide sets up the Aeronaut doorbell program on the Raspberry Pi.

1. In the Firebase Console, register a new app (use "Web"). You can nickname it `camera`. When you are given the `firebaseConfig` in step 2, paste the corresponding values to `./keys/myAeronaut.json`
   - Leave Firebase Hosting unchecked.
2. Open the Firebase "Authentication" tab. Enable "Email/Password" as a sign in method.

5. Add that email and password to the appropriate fields in `./keys/myAeronaut.json`.

6. Make sure you have the service account key in `keys/gcloudSA.json`, from the Admin stage of the setup.

Uploading the Aeronaut program to the camera

1. Run `npm install`.
2. Flash Raspbian Full to an SD card using [ Raspberry Pi Imager](https://www.raspberrypi.org/software/).
3. Remount the SD card and name it `aeronaut`.
4. Give the camera access to wifi by creating `./wpa_supplicant.conf`. Copy the format of `wpa_supplicant-template.conf`. SSID is the WiFi network name, psk is the WPA2 passkey.
    - You must use the 2.4 GHZ band network, not the 5 GHz.
5. Choose what you want the pi's password to be. Create `./pi-passwd` and type that password there, with nothing else.
6. Ensure you have an SSH key in `~/.ssh/id_rsa.pub` to upload to the pi. 
   - If you don't, run `ssh-keygen`. [More info here](https://superuser.com/questions/8077/how-do-i-set-up-ssh-so-i-dont-have-to-type-my-password).
7. Install `sshpass`. On Mac OSX, do this by running `brew install hudochenkov/sshpass/sshpass` [credit](https://stackoverflow.com/questions/32255660/how-to-install-sshpass-on-mac/62623099#62623099)
8. Run `./init-0-sd.sh`. Select `y` once you have put the SD in the pi and turned it on.
9. The rest of the setup scripts will run automatically (takes a few minutes).