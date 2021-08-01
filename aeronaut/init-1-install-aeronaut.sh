#!/bin/bash -e

# This script is automatically run 20 seconds after s0.

# This script is run on the developer's computer once the fresh pi first connects to the local network. It:
# 1. enables passwordless ssh for the local device
# 2. copies `./s2.aeronaut-init.sh` to the pi and runs it


SSH_KEY_PATH="$HOME/.ssh/id_rsa.pub"
RPI_DEFAULT_DOMAIN="raspberrypi.local"
AERONAUT_HOSTNAME="aeronaut" # be sure to change in init-1.1 too
AERONAUT_CONFIG_SCRIPT="./init-1.1-config-pi.sh"
AERONAUT_BUILD_KEY_NAME="myAeronaut"


# ------
# NOTE: Uncomment these lines if you are setting up multiple aeronauts! Give them different 
# hostnames too; see "$AERONAUT_INIT_SCRIPT"

# Forget old known host fingerprints
# echo 'Old hosts will now be forgotten...'
# ssh-keygen -R $RPI_DEFAULT_DOMAIN
# ssh-keygen -R $AERONAUT_DOMAIN

# -------

echo 'Waiting 2m before connecting due to first pi boot...'
sleep 120

# scp the local ssh key as an authorized key
# No ssh key? Run `ssh-keygen` (see https://superuser.com/questions/8077/how-do-i-set-up-ssh-so-i-dont-have-to-type-my-password)

# No `sshpass`? Run `brew install hudochenkov/sshpass/sshpass`. (see https://stackoverflow.com/a/64734960/10798643)
sshpass -p raspberry ssh-copy-id -o StrictHostKeyChecking=no -i $SSH_KEY_PATH pi@$RPI_DEFAULT_DOMAIN

# Build aeronaut and install it on new pi. Port 22 (default) and $NEW_PI=1
./build.sh "$AERONAUT_BUILD_KEY_NAME" "$RPI_DEFAULT_DOMAIN" 22 1

echo 'Configuring pi'
ssh pi@"$RPI_DEFAULT_DOMAIN" "cd aeronaut-build && $AERONAUT_CONFIG_SCRIPT"

echo 'Pi is rebooting. Waiting 1m before connecting...'
sleep 60

# Pi is now fully configured. ssh and then watch the aeronaut service
echo 'Connecting to aeronaut'
ssh -o StrictHostKeyChecking=no -t pi@$AERONAUT_HOSTNAME 'journalctl -f -u aeronaut'
