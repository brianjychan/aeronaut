#!/bin/bash -e

# This is the driver code to run the Aeronaut program

# cd to the script dir
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

# Export google key env var for Vision API
export GOOGLE_APPLICATION_CREDENTIALS="./keys/gcloudSA.json"

# Cat build version
cat ./built.txt

# Run aeronaut script
node ./js/index.js