import { autoinject } from 'aurelia-framework';
import { OpenIdConnect } from 'aurelia-open-id-connect';
import {Router, RouterConfiguration} from 'aurelia-router';
import { User } from 'oidc-client';

@autoinject()
export class App {
  private _router: Router;
  private _openIdConnect: OpenIdConnect;
  private _user: User;

  constructor(openIdConnect: OpenIdConnect) {
    this._openIdConnect = openIdConnect;
    this._openIdConnect.observeUser((user: User) => this._user = user);
  }

  public configureRouter(config: RouterConfiguration, router: Router): void {
    this._router = router;

    config.options.pushState = true;
    config.title = 'BPMN-Studio';

    config.map([
      {
        route: ['', 'processdef', 'processdef/:page'],
        title: 'Process Definition List',
        name: 'processdef-list',
        moduleId: 'modules/processdef-list/processdef-list',
        nav: true,
      },
      {
        route: ['task', 'processdef/:processDefId/task', 'process/:processId/task'],
        title: 'Task List',
        name: 'task-list',
        moduleId: 'modules/task-list/task-list',
        nav: true,
      },
      {
        route: ['process', 'processdef/:processDefId/process'],
        title: 'Process Instance List',
        name: 'process-list',
        moduleId: 'modules/process-list/process-list',
        nav: true,
      },
      {
        route: ['task/:userTaskId/dynamic-ui'],
        title: 'Task Dynamic UI',
        name: 'task-dynamic-ui',
        moduleId: 'modules/task-dynamic-ui/task-dynamic-ui',
      },
      {
        route: ['processdef/:processDefId/detail'],
        title: 'ProcessDef Detail',
        name: 'processdef-detail',
        moduleId: 'modules/processdef-detail/processdef-detail',
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
