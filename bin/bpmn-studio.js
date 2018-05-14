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

for (let count = 0; count < process.argv.length; count++) {
  if (process.argv[count].includes('port=')) {
    config.port = process.argv[count].substr(5);
    break;
  } else {
    config.port = defaultPort;
  }
}

server.deploy(config, (result) => {
  const url = `http://localhost:${result.config.port}/`;
  console.log(`BPMN-Studio started at '${url}'`);
  console.log(`Press CRTL+C to exit.`);
  open(url);
});
