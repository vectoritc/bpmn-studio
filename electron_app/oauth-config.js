module.exports =  {
  logoutUrl: 'http://localhost:5000/connect/endsession',
  authorizationUrl: 'http://localhost:5000/connect/authorize',
  clientId: 'bpmn_studio',
  redirectUri: 'http://localhost:9000/signin-oidc',
  logoutRedirectUri: 'http://localhost:9000/signout-oidc',
  responseType: 'id_token token',
  scope: 'openid profile test_resource',
  state: '123e92f955134138858c4e5d290fb0c5&',
  nonce: 'e56f9c3f2a13484a89b75bce2866d780'
}
