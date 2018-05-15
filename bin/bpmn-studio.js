#!/usr/bin/env node

const server = require('node-http-server');
const config = new server.Config;
const open = require('open');
const argv = require('minimist')(process.argv.slice(2));
console.dir(argv);

const defaultPort = 17290;

config.root = __dirname + '/..';
config.contentType.woff2 = 'application/font-woff2';
config.contentType.woff = 'application/font-woff';
config.contentType.ttf = 'application/x-font-ttf';
config.contentType.svg = 'image/svg+xml';

config.port = _applicationPortIsValid(argv.port) ? argv.port : defaultPort;

server.deploy(config, (result) => {
  const url = `http://localhost:${result.config.port}/`;
  console.log(`BPMN-Studio started at '${url}'`);
  console.log(`Press CRTL+C to exit.`);
  open(url);
});

/*
 * Check if a given port is okay.
 *
 * This will perform a boundary check for the port, and general sanity checks.
 *
 * @param[in]: port The port, specified from argv.
 * @return true If the everything is okay; false otherwise.
 */
function _applicationPortIsValid(port) {
  if (port === null || port === undefined) {
    return false;
  }
  if (!Number.isInteger(port)) {
    return false;
  }

  const portNumber = parseInt(port);

  // would require more priviledges
  const lowerPortBoundValid = portNumber > 1000;
  const upperPortBoundValid = portNumber < 65535;
  const boundariesInvalid = (!lowerPortBoundValid || !upperPortBoundValid);

  if (boundariesInvalid) {
    return false;
  }

  return true;
}
