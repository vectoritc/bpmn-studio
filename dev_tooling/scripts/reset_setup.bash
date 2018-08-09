#!/bin/bash

_VERSION="0.0.2"

############
# This script resets the current setup by deleting the Node Modules,
# the package-lock file and clearing the npm cache.
############

# Remove the node modules folder if it exists.
if [[ -e "node_modules" ]]; then
  echo "Removing Node Modules...."
  rm -rf node_modules/
fi

# Remove the package-lock file if it exists.
if [[ -e "package-lock.json" ]]; then
  echo "Removing package lock file..."
  rm package-lock.json
fi

# Clear the npm cache
echo "Clearing npm cache..."
npm cache clean --force
