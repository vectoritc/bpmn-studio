#!/bin/bash

_VERSION="0.0.1"

############
# This script resets your develop setup by
#   * Deletes the node_modules directory
#   * Deletes the package-lock file (if it exists)
#   * Clears the NPM - Cache
#
# Note: Please DO NOT ADD THIS SCRIPT TO THE Jenkinsfile!
#
# This script is meant to give you, the human developer, a convenient way, to
# reinstall your setup. Adding this script to the jenkinsfile would not make
# that much sense, because:
#   * The Jenkins *should* offer a clean setup anyway
############

# Remove the node modules folder if it exists.
if [[ -e "node_modules" ]]; then
  echo "Removing Node Modules..."
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
