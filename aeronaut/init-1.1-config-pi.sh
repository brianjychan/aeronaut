#!/bin/bash

# This script is to run on the raspberry pi. It is run automatically at the end of s1. It:
# 0. changes passwd
# 1. enables camera
# 2. Installs dependencies


AERONAUT_HOSTNAME="aeronaut" # if you change this

if [[ $USER != "pi" ]]; then
    echo 'ERR: did not find pi user. Is this running on a pi? Exiting.'
    exit
fi

# ---- OS CONFIG ----
# TODO: move this to a digest
# Install MP4Box
sudo apt-get update
sudo apt install -y gpac

# Set timezone
sudo timedatectl set-timezone America/Los_Angeles

# Replace default password
(
    echo raspberry
    echo $(cat pi-passwd)
    echo $(cat pi-passwd)
) | passwd
rm ./pi-passwd
echo 'Changed password'

# Enable camera
sudo raspi-config nonint do_camera 0
echo 'Enabled Camera'

# Disable display
sudo /usr/bin/tvservice -o

# Disable LED
# echo "dtparam=act_led_trigger=none"  | sudo tee -a  /boot/config.txt
# echo "dtparam=act_led_activelow=on" | sudo tee -a  /boot/config.txt

# Disable BT
echo "dtoverlay=disable-bt" | sudo tee -a  /boot/config.txt
sudo systemctl disable hciuart.service
sudo systemctl disable bluealsa.service
sudo systemctl disable bluetooth.service


# Create systemctl service on boot
sudo cp ./aeronaut.service /etc/systemd/system/aeronaut.service
sudo systemctl enable aeronaut
echo 'Enabled aeronaut service'

# ---- DEPENDENCIES ----

# Install node 15.3.0
curl -o node-v15.3.0-linux-armv6l.tar.gz https://unofficial-builds.nodejs.org/download/release/v15.3.0/node-v15.3.0-linux-armv6l.tar.gz
tar -xzf node-v15.3.0-linux-armv6l.tar.gz
# sudo rm /usr/local/bin/node
sudo cp -r node-v15.3.0-linux-armv6l/* /usr/local/

# Install packages
echo "Installing npm packages..."
npm install

# Set hostname
sudo raspi-config nonint do_hostname $AERONAUT_HOSTNAME

echo 'Configuration done. Now rebooting'

# reboot to trigger changes
sudo reboot
