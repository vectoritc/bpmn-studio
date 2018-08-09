#!/bin/bash

_VERSION="0.0.1"

############
# This script resets your develop setup by
#   * Deleting your node_modules
#   * Deleting your package-lock file (if it exists)
#   * Clearing your NPM - Cache
#
# Note: Please DO NOT ADD THIS SCRIPT TO THE JENKINSFILE!
#
# This script is meant to give you, the human developer, a convenient way, to
# reinstall your setup. Adding this script to the jenkinsfile would not make
# that much sense, because:
#   * The jenkins *should* offer a clean setup anyway
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
