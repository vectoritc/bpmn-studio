'use strict';

const Promise = require('pinkie-promise');
const queryString = require('querystring');
const fetch = require('node-fetch');
const nodeUrl = require('url');
const electron = require('electron');
const BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;

module.exports = function (config, windowParams) {
  function getTokenObject() {
    // Build the Url Params from the Config.
    var urlParams = {
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: config.responseType,
      scope: config.scope,
      state: config.state, //TODO: Make that random.
      nonce: config.nonce, //TODO: Make that random.
    };

    var url = config.authorizationUrl + '?' + queryString.stringify(urlParams);

    return new Promise(function (resolve, reject) {
      // Open a new browser window and load the previously constructed url.
      const authWindow = new BrowserWindow(windowParams || {'use-content-size': true});

      authWindow.loadURL(url);
      authWindow.show();

      // Reject the Promise when the user closes the new window.
      authWindow.on('closed', () => {
        reject(new Error('window was closed by user'));
      });

      // Handle the different callbacks.
      function onCallback(url) {
        // Parse callback url into its parts.
        var url_parts = nodeUrl.parse(url, true);
        var href = url_parts.href;
        var error = url_parts.error;

        /**
         * If there was an error:
         * - Reject the promise with the error.
         * - Close the window.
         *
         * If the href includes the callback uri:
         * - Load that href in the window.
         *
         * If the href includes the specified redirect uri:
         * - Parse the hash into its parts.
         * - Add those parts to new object.
         * - Resolve the promise with this object.
         * - Close the window.
         */
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

          var idToken = parameterAsArray[0].split('=')[1];
          var accessToken = parameterAsArray[1].split('=')[1];

          const tokenObject = {
            idToken,
            accessToken
          }

          resolve(tokenObject);
          authWindow.removeAllListeners('closed');

          setImmediate(function () {
            authWindow.close();
          });
        }
      }

      /**
       * This will trigger everytime the new window will redirect.
       * Important: Not AFTER it redirects but BEFORE.
       * This gives us the possibility to intercept the redirect to
       * the specified redirect uri, which would lead to faulty behaviour
       * due to security speciments in chromium.
       *
       * If that redirect would start we stop it by preventing the default
       * behaviour and instead parse its parameters in the
       * "onCallback"-function.
       */
      authWindow.webContents.on('will-redirect', (event, url) => {
        if (url.includes(config.redirectUri)) {
          event.preventDefault();
        }

        onCallback(url);
      });
    });
  }

  function logout(tokenObject) {

    const urlParams = {
      id_token_hint: tokenObject.idToken,
      post_logout_redirect_uri: config.logoutRedirectUri,
    };

    const endSessionUrl = config.logoutUrl + '?' + queryString.stringify(urlParams);;

    return new Promise(async function (resolve, reject) {

      const response = await fetch(endSessionUrl);

      const logoutWindow = new BrowserWindow(windowParams || {'use-content-size': true});

      logoutWindow.webContents.on('will-navigate', (event, url) => {
        if (url.includes(config.logoutRedirectUri)) {
          event.preventDefault();
          resolve(true);
          logoutWindow.close();
        }
      });

      logoutWindow.on('closed', () => {
        resolve(true);
      });

      logoutWindow.loadURL(response.url);
      logoutWindow.show();
    });
  }

  return {
    getTokenObject: getTokenObject,
    logout: logout,
  };
};
