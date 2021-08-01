#!/bin/bash -e


# Compile typescript
tsc

printf 'Build succeeded! \n\n'

# Save logs from previous dev runs
# if [ -d "./aeronaut-build" ]; then
#     mv ./aeronaut-build/logs/* ./dev-logs
# fi

# Create new build folder
rm -rf ./aeronaut-build
mkdir ./aeronaut-build

# Move items into build folder
# js
mv ./js ./aeronaut-build/
# config
cp ./{package.json,package-lock.json,.gitignore} ./aeronaut-build/
# scripts
cp ./{init-1.1-config-pi.sh,init-1-install-aeronaut.sh,run.sh} ./aeronaut-build/
# systemd service
cp ./aeronaut.service ./aeronaut-build/
# docs
# cp ./release-README.md ./aeronaut-build/README.md
# logs folder (empty save for .gitignore)
cp -r ./logs ./aeronaut-build/
# videos folder (empty save for .gitignore)
cp -r ./videos ./aeronaut-build/
# curr date
echo Built on: "$(date)" >./aeronaut-build/built.txt

# `./build.sh local litecamera.local
# `./build.sh local litecamera.local 22 1`
KEYNAME=$1
HOST=$2
PORT=$3
NEWPI=$4

if [ -z "$PORT" ]; then
    PORT=22
fi

# Check vars
if [ -z "$KEYNAME" ] || [ -z "$HOST" ]; then
    echo 'Check args'
    exit 1
fi

echo "Sending build with key $KEYNAME to host $HOST and port $PORT"

# Service account key for vision. TODO: move vision to cloud functionos
mkdir "./aeronaut-build/keys"
cp "./keys/gcloudSA.json" "./aeronaut-build/keys/gcloudSA.json"

# Give firebaseConfig key
cp -f "./keys/$KEYNAME.json" "./aeronaut-build/js/firebaseConfig.json"

echo "Build complete"
# By now we have the built folder at ./aeronaut/aeronaut-build

# scp the build dir to the destination
if [ "$NEWPI" = 1 ]; then
    # If new pi, give new password
    echo "New pi. Giving password"
    cp "./pi-passwd" "./aeronaut-build"
fi

# doesn't overwite the files at remote that do not exist locally
scp -r -P "$PORT" "./aeronaut-build" pi@"$HOST":~/