import {BpmnStudioClient, IUserTaskConfig} from '@process-engine/bpmn-studio_client';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import environment from '../../environment';
import {AuthenticationStateEvent} from './../../contracts/index';
import {NotificationType} from './../../contracts/index';
import {NotificationService} from './../notification/notification.service';

@inject(Router, 'BpmnStudioClient', 'NotificationService', EventAggregator)
export class ConfigPanel {

  private _router: Router;
  private _bpmnStudioClient: BpmnStudioClient;
  private _notificationService: NotificationService;
  private _eventAggregator: EventAggregator;

  public config: any = environment.bpmnStudioClient;

  constructor(router: Router,
              bpmnStudioClient: BpmnStudioClient,
              notificationService: NotificationService,
              eventAggregator: EventAggregator) {
    this._router = router;
    this._bpmnStudioClient = bpmnStudioClient;
    this.config.processEngineRoute = environment.bpmnStudioClient.baseRoute;
    this._notificationService = notificationService;
    this._eventAggregator = eventAggregator;
  }

  public updateSettings(): void {
    this._eventAggregator.publish('user-login:triggerlogout');
    environment.bpmnStudioClient.baseRoute = this.config.processEngineRoute;
    window.localStorage.setItem('processEngineRoute', this.config.processEngineRoute);
    environment.processengine.routes.processes = `${this.config.processEngineRoute}/datastore/ProcessDef`;
    environment.processengine.routes.iam = `${this.config.processEngineRoute}/iam`;
    environment.processengine.routes.messageBus = `${this.config.processEngineRoute}/mb`;
    environment.processengine.routes.processInstances = `${this.config.processEngineRoute}/datastore/Process`;
    environment.processengine.routes.startProcess = `${this.config.processEngineRoute}/processengine/start`;
    environment.processengine.routes.userTasks =  `${this.config.processEngineRoute}/datastore/UserTask`;
    environment.processengine.routes.importBPMN = `${this.config.processEngineRoute}/processengine/create_bpmn_from_xml`;
    this._bpmnStudioClient.updateConfig(this.config);
    this._notificationService.showNotification(NotificationType.SUCCESS, 'Sucessfully saved settings!');
    this._eventAggregator.publish('statusbar:processEngineRoute:update', this.config.processEngineRoute);
    this._router.navigateBack();
  }

  public cancelUpdate(): void {
    this._notificationService.showNotification(NotificationType.WARNING, 'Settings dismissed!');
    this._router.navigateBack();
  }

}
