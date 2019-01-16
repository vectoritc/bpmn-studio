'use strict';

const Promise = require('pinkie-promise');
const queryString = require('querystring');
const fetch = require('node-fetch');
const objectAssign = require('object-assign');
const nodeUrl = require('url');
const electron = require('electron');
const session = electron.session;
const BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;

module.exports = function (config, windowParams) {
  function getAuthorizationCode(opts) {
    opts = opts || {};

    var urlParams = {
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: config.responseType,
      scope: config.scope,
      state: config.state,
      nonce: config.nonce,
    };

    if (opts.scope) {
      urlParams.scope = opts.scope;
    }

    if (opts.accessType) {
      urlParams.access_type = opts.accessType;
    }

    var url = config.authorizationUrl + '?' + queryString.stringify(urlParams);

    return new Promise(function (resolve, reject) {
      const authWindow = new BrowserWindow(windowParams || {'use-content-size': true});

      authWindow.loadURL(url);
      authWindow.show();

      authWindow.on('closed', () => {
        reject(new Error('window was closed by user'));
      });

      function onCallback(url) {
        var url_parts = nodeUrl.parse(url, true);
        var href = url_parts.href;
        var error = url_parts.error;
        }
      }
};
