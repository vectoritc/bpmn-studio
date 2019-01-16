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
  function getAccessToken(opts) {
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

        if (error !== undefined) {
          reject(error);
          authWindow.removeAllListeners('closed');
          setImmediate(function () {
            authWindow.close();
          });
        } else if (href.includes('/connect/authorize/callback')) {

          authWindow.loadURL(href);

        } else if (href.includes(config.redirectUri)) {
          var identityParameter = url_parts.hash;
          var parameterAsArray = identityParameter.split('&');

          var id_token = parameterAsArray[0].split('=')[1];
          var access_token = parameterAsArray[1].split('=')[1];

          resolve(access_token);
          authWindow.removeAllListeners('closed');

          setImmediate(function () {
            authWindow.close();
          });
        }
      }

      authWindow.webContents.on('will-redirect', (event, url) => {
        if (url.includes(config.redirectUri)) {
          event.preventDefault();
        }

        onCallback(url);
      });
    });
  }

  return {
    getAccessToken: getAccessToken,
  };
};
