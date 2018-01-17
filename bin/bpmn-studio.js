#!/usr/bin/env node

const server = require('node-http-server');
const config = new server.Config;
const open = require('open');

config.root = __dirname + '/..';
config.contentType.woff2 = 'application/font-woff2';
config.contentType.woff = 'application/font-woff';
config.contentType.ttf = 'application/x-font-ttf';

server.deploy(config, (result) => {
  const url = `http://localhost:${result.config.port}/`;
  console.log(`BPMN-Studio started at ${url}`);
  console.log(`Press CRTL+C to exit.`);
  open(url);
});
