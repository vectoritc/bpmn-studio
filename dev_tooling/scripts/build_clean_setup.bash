#!/bin/bash

_VERSION="0.0.1"

############
# This Script builds a clean setup of the BPMN - Studio.
# Keep in mind that your npm cache will be cleaned.
############

# Remove the node modules folder
echo "Removing Node Modules...."
rm -rf node_modules/

# Remove the package-lock file if it exists.
if [[ -e "package-lock.json" ]]; then
  echo "Removing package lock file..."
  rm package-lock.json
fi

# Clear the npm cache
echo "Clearing npm cache..."
npm cache clean --force
