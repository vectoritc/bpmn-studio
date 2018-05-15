#!/usr/bin/env node

const server = require('node-http-server');
const config = new server.Config;
const open = require('open');

const defaultPort = 17290;

config.root = __dirname + '/..';
config.contentType.woff2 = 'application/font-woff2';
config.contentType.woff = 'application/font-woff';
config.contentType.ttf = 'application/x-font-ttf';
config.contentType.svg = 'image/svg+xml';

const port = _getPortFromArgv();
config.port = port ? port : defaultPort;

server.deploy(config, (result) => {
  const url = `http://localhost:${result.config.port}/`;
  console.log(`BPMN-Studio started at '${url}'`);
  console.log(`Press CRTL+C to exit.`);
  open(url);
});

/**
 * Get the port from the argv.
 *
 * Example:
 *
 * > npm start port=12345
 *
 * 'port=12345' will be parsed to 12345; this will be the port of this application.
 */
function _getPortFromArgv() {
  const customPort = process.argv.find((entry) => {
    return entry.includes('--port=');
  });

  if (!customPort) {
    return "";
  }

  const portNumber = customPort.substr(7);
  return portNumber;
}
