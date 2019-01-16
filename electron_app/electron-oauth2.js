'use strict';
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
};
