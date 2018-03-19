import {Aurelia} from 'aurelia-framework';
import environment from './environment';
import {TokenRepository} from './modules/token-repository/token.repository';

if ((<any> window).nodeRequire) {
  const ipcRenderer: any = (<any> window).nodeRequire('electron').ipcRenderer;
  const newHost: string = ipcRenderer.sendSync('get_host');
  localStorage.setItem('baseRoute', `http://${newHost}`);
}

export function configure(aurelia: Aurelia): void {

  const tokenRepository: TokenRepository = new TokenRepository();
  aurelia.container.registerInstance('TokenRepository', tokenRepository);

  if (window.localStorage.getItem('baseRoute')) {
    environment.bpmnStudioClient.baseRoute = window.localStorage.getItem('baseRoute');
  }

  aurelia.use
    .standardConfiguration()
    .feature('modules/dynamic-ui')
    .feature('modules/processengine')
    .feature('modules/authentication')
    .feature('modules/bpmn-studio_client', tokenRepository)
    .feature('resources')
    .plugin('aurelia-bootstrap')
    .plugin('aurelia-validation');

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

  aurelia.start().then(() => aurelia.setRoot());
}
