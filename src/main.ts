import {Aurelia} from 'aurelia-framework';

import {IIdentity} from '@essential-projects/core_contracts';
import {SolutionExplorerFileSystemRepository} from '@process-engine/solutionexplorer.repository.filesystem';
import {SolutionExplorerProcessEngineRepository} from '@process-engine/solutionexplorer.repository.processengine';
import {SolutionExplorerService} from '@process-engine/solutionexplorer.service';

import {NotificationType} from './contracts/index';
import {IFileInfo} from './contracts/processengine/index';
import {NotificationService} from './modules/notification/notification.service';
import {TokenRepository} from './modules/token-repository/token.repository';

import environment from './environment';
import {oidcConfig} from './open-id-connect-configuration';

export function configure(aurelia: Aurelia): void {

  const tokenRepository: TokenRepository = new TokenRepository();
  aurelia.container.registerInstance('TokenRepository', tokenRepository);

  if (navigator.cookieEnabled === false) {
    const url: string = location.href;
    throw new Error(`In order to use the web version of BPMN Studio please enable cookies for this URL: ${url}.`);
  }

  if ((<any> window).nodeRequire) {
    const ipcRenderer: any = (<any> window).nodeRequire('electron').ipcRenderer;
    const newHost: string = ipcRenderer.sendSync('get_host');
    const fileInfo: IFileInfo = ipcRenderer.sendSync('get_opened_file');
    aurelia.container.registerInstance('FileContent', fileInfo);
    /**
     * Currently the internal PE is always connected via http.
     * This will be subject to change.
     */
    localStorage.setItem('processEngineRoute', `http://${newHost}`);

    // Register SolutionExplorerFileSystemService
    const fileSystemrepository: SolutionExplorerFileSystemRepository = new SolutionExplorerFileSystemRepository();
    const filesystemSolutionexplorerService: SolutionExplorerService = new SolutionExplorerService(fileSystemrepository);
    aurelia.container.registerInstance('SolutionExplorerServiceFileSystem', filesystemSolutionexplorerService);
  }
  const processengineRepository: SolutionExplorerProcessEngineRepository = new SolutionExplorerProcessEngineRepository();
  const solutionexplorerService: SolutionExplorerService = new SolutionExplorerService(processengineRepository);
  aurelia.container.registerInstance('SolutionExplorerServiceProcessEngine', solutionexplorerService);

  if (window.localStorage.getItem('processEngineRoute')) {
    const processEngineRoute: string = window.localStorage.getItem('processEngineRoute');
    environment.bpmnStudioClient.baseRoute = processEngineRoute;
    environment.processengine.routes.processes = `${processEngineRoute}/datastore/ProcessDef`;
    environment.processengine.routes.iam = `${processEngineRoute}/iam`;
    environment.processengine.routes.messageBus = `${processEngineRoute}/mb`;
    environment.processengine.routes.processInstances = `${processEngineRoute}/datastore/Process`;
    environment.processengine.routes.startProcess = `${processEngineRoute}/processengine/start`;
    environment.processengine.routes.userTasks =  `${processEngineRoute}/datastore/UserTask`;
    environment.processengine.routes.importBPMN = `${processEngineRoute}/processengine/create_bpmn_from_xml`;
  }

  /**
   * Register Fake Identity for SolutionExplorer.
   * TODO: Get real identity when IAM is finished.
  */
  const fakeIdentity: IIdentity = {
    name: 'fakeIdentity',
    id: 'fakeIdentity',
    roles: [],
  };
  aurelia.container.registerInstance('Identity', fakeIdentity);

  aurelia.use
    .standardConfiguration()
    .feature('modules/dynamic-ui')
    .feature('modules/processengine')
    .feature('modules/notification')
    .feature('modules/authentication')
    .feature('modules/bpmn-studio_client', tokenRepository)
    .feature('resources')
    .plugin('aurelia-bootstrap')
    .plugin('aurelia-validation')
    .plugin('aurelia-open-id-connect', () => oidcConfig);

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

  aurelia.start().then(() => {
    aurelia.setRoot();

    // check if the processengine started successfull
    if ((<any> window).nodeRequire) {

      const ipcRenderer: any = (<any> window).nodeRequire('electron').ipcRenderer;
      // subscribe to processengine status
      ipcRenderer.send('add_internal_processengine_status_listener');
      // wait for status to be reported

      ipcRenderer.on('internal_processengine_status', (event: any, status: string, error: string) => {
        if (status !== 'error') {
          return;
        }
        /* This is the URL to an issue in GitHub, describing
         * what the user can do about this failure.
         *
         * TODO: Implement a proper FAQ section and link to that.
         */
        // tslint:disable-next-line: max-line-length
        const targetHref: string = `<a href="javascript:nodeRequire('open')('https://github.com/process-engine/bpmn-studio/issues/316')">click here</a>`;

        const errorMessage: string = `Failed to start ProcessEngine. For further information ${targetHref}.`;
        const notificationService: NotificationService = aurelia.container.get('NotificationService');

        notificationService.showNonDisappearingNotification(NotificationType.ERROR, errorMessage);
      });
    }
  });
}
