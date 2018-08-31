#!/bin/bash
_VERSION="0.0.1"

############
# This script reinstalls the current developement setup by:
#   * Resetting your configuration by calling the npm reset script
#     that:
#       * Deletes the node_modules directory
#       * Deletes the package-lock file (if it exists)
#       * Clears the NPM - Cache
#   * Reinstalling all required node modules
#   * Rebuilding
#
# Note: Please DO NOT ADD THIS SCRIPT TO THE Jenkinsfile!
#
# This script is meant to give you, the human developer, a convenient way, to
# reinstall your setup. Adding this script to the jenkinsfile would not make
# that much sense, because:
#   * The Jenkins *should* offer a clean setup anyway
#   * The Jenkins already executes npm install (Since npm does not seems to that
#     consistent, a multiple execution of npm install may lead to an undefined
#     behavior and is pointless anyways).
############

# Reset the current setup
echo "Cleaning setup..."
npm run reset

# Reinstalling your node modules
echo "Installing node modules..."

NPM_INSTALL_COMMAND="install --no-package-lock"
NPM_NODE_MODULES="node_modules/npm/bin/npm-cli.js"
NPM_NVM=$(ls -d ~/.nvm/versions/node/* | head -n 1)"/lib/$NPM_NODE_MODULES"
NPM_GLOBAL="/usr/local/lib/$NPM_NODE_MODULES"

if [[ -x "$NPM_NVM" ]]; then
  "$NPM_NVM" $NPM_INSTALL_COMMAND
elif [[ -x "$NPM_GLOBAL" ]]; then
  "$NPM_GLOBAL" $NPM_INSTALL_COMMAND
else
  echo "No npm installation found"
  exit 1
fi

# If npm install fails, its likely that also the build process would fail,
# so we can exit here.
if [[ $? -ne 0 ]]; then
  echo "Error while running npm install. Exiting..."
  exit 1
fi

# Build all modules
echo "Building..."
npm run build
