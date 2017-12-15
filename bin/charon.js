#!/usr/bin/env node

const server = require('node-http-server');
const open = require('open');
const argv = require('minimist')(process.argv.slice(2));

argv['root'] = __dirname + '/..';

server.deploy(argv, (result) => {
  const url = `http://localhost:${result.config.port}/`;
  console.log(`Charon started at ${url}`);
  console.log(`Press CRTL+C to exit.`);
  open(url);
});
