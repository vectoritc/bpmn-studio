import {inject} from 'aurelia-framework';
import {OpenIdConnect} from 'aurelia-open-id-connect';
import {Router, RouterConfiguration} from 'aurelia-router';
import {NewAuthenticationService} from './modules/authentication/new_authentication.service';

@inject(OpenIdConnect, 'NewAuthenticationService')
export class App {
  private _openIdConnect: OpenIdConnect;
  private _authenticationService: NewAuthenticationService;
  private _router: Router;

  constructor(openIdConnect: OpenIdConnect, authenticationService: NewAuthenticationService) {
    this._openIdConnect = openIdConnect;
    this._authenticationService = authenticationService;
  }

  private _parseDeepLinkingUrl(url: string): string {
    const customProtocolPrefix: string = 'bpmn-studio://';
    const urlFragment: string = url.substring(customProtocolPrefix.length);
    return urlFragment;
  }

  private _processDeepLinkingRequest(url: string): void {
    const urlFragment: string = this._parseDeepLinkingUrl(url);
    this._router.navigate(urlFragment);
  }

  public configureRouter(config: RouterConfiguration, router: Router): void {
    this._router = router;

    const isRunningInElectron: boolean = !!(<any> window).nodeRequire;

    if (isRunningInElectron) {
      const ipcRenderer: any = (<any> window).nodeRequire('electron').ipcRenderer;
      ipcRenderer.on('deep-linking-request-in-runtime', (event: any, url: string) => {
        this._processDeepLinkingRequest(url);
      });
      ipcRenderer.on('deep-linking-request', async(event: any, url: string) => {
        const urlFragment: string = this._parseDeepLinkingUrl(url);
        this._authenticationService.loginViaDeepLink(urlFragment);
        this._router.navigate('/');
      });
      ipcRenderer.send('deep-linking-ready');
    }

    if (!isRunningInElectron) {
      config.options.pushState = true;
      config.options.baseRoute = '/';
    }

    config.title = 'BPMN-Studio';

    config.map([
      {
        route: [''],
        title: 'Start Page',
        name: 'start-page',
        moduleId: 'modules/start-page/start-page',
      },
      {
        route: ['processdef', 'processdef/:page?'],
        title: 'Process Definition List',
        name: 'processdef-list',
        moduleId: 'modules/processdef-list/processdef-list',
        nav: true,
      },
      {
        route: ['dashboard'],
        title: 'Dashboard',
        name: 'dashboard',
        moduleId: 'modules/dashboard/dashboard',
        nav: true,
      },
      {
        route: ['task', 'processdef/:processModelId/task'],
        title: 'Task List',
        name: 'task-list-processmodel',
        moduleId: 'modules/task-list/task-list',
        nav: false,
      },
      {
        route: ['correlation/:correlationId/task'],
        title: 'Task List',
        name: 'task-list-correlation',
        moduleId: 'modules/task-list/task-list',
        nav: false,
      },
      {
        route: ['process', 'processdef/:processModelId/process'],
        title: 'Process Instance List',
        name: 'process-list',
        moduleId: 'modules/process-list/process-list',
        nav: true,
      },
      {
        route: ['processdef/:processModelId/task/:userTaskId/dynamic-ui',
                'correlation/:correlationId/task/:userTaskId/dynamic-ui'],
        title: 'Task Dynamic UI',
        name: 'task-dynamic-ui',
        moduleId: 'modules/task-dynamic-ui/task-dynamic-ui',
      },
      {
        route: ['processdef/:processKey/detail'],
        title: 'ProcessDef Detail',
        name: 'processdef-detail',
        moduleId: 'modules/processdef-detail/processdef-detail',
      },
      {
        route: ['diagram/detail'],
        title: 'Diagram Detail',
        name: 'diagram-detail',
        moduleId: 'modules/diagram-detail/diagram-detail',
      },
      {
        route: 'processdef/:processDefId/start',
        title: 'ProcessDef Start',
        name: 'processdef-start',
        moduleId: 'modules/processdef-start/processdef-start',
      },
      {
        route: 'configuration',
        title: 'Configuration',
        name: 'configuration',
        moduleId: 'modules/config-panel/config-panel',
      },
      {
        route: 'waitingroom/:processInstanceId',
        title: 'Waiting Room',
        name: 'waiting-room',
        moduleId: 'modules/waiting-room/waiting-room',
      },
    ]);

    this._openIdConnect.configure(config);
  }
}
