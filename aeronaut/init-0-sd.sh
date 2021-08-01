#!/bin/bash
# Before running this script:
# 1. Flash Raspbian lite to an SD card
# 1.5 Remount SD
# 2. Name it aeronaut

# This script copies files to the SD
# 1. connect the pi zero to wifi
# 2. enable ssh for the default pi@raspberry.local user

if [ -d "/Volumes/aeronaut" ]; then
    cp .keys/wpa_supplicant.conf /Volumes/aeronaut/wpa_supplicant.conf
    touch /Volumes/aeronaut/ssh
    echo 'Successfully enabled wifi and ssh on the pi.'

    echo 'Eject the SD card, place it in the pi, and then turn the pi on.'

else
    echo "ERROR: volume named 'aeronaut' not found. Name the SD card to 'aeronaut' for safety."
    exit
fi

echo -n "Preparing to connect to pi. Did you turn it on yet? (y/n) "
read -r yesno </dev/tty

if [ "x$yesno" = "xy" ]; then
    ./s1-install-aeronaut.sh
else
    # No
    echo 'Fine, you can run ./s1-install-aeronaut.sh yourself'
fi
