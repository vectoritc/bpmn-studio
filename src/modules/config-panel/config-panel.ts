import {BpmnStudioClient, IUserTaskConfig} from '@process-engine/bpmn-studio_client';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import environment from '../../environment';
import {NotificationType} from './../../contracts/index';
import {NotificationService} from './../notification/notification.service';

@inject(Router, 'BpmnStudioClient', 'NotificationService')
export class ConfigPanel {

  private router: Router;
  private bpmnStudioClient: BpmnStudioClient;
  private notificationService: NotificationService;

  public config: any = environment.bpmnStudioClient;

  constructor(router: Router, bpmnStudioClient: BpmnStudioClient, notificationService: NotificationService) {
    this.router = router;
    this.bpmnStudioClient = bpmnStudioClient;
    this.config.baseRoute = environment.bpmnStudioClient.baseRoute;
    this.notificationService = notificationService;
  }

  public updateSettings(): void {
    environment.bpmnStudioClient.baseRoute = this.config.baseRoute;
    window.localStorage.setItem('baseRoute', this.config.baseRoute);
    environment.processengine.routes.processes = `${this.config.baseRoute}/datastore/ProcessDef`;
    environment.processengine.routes.iam = `${this.config.baseRoute}/iam`;
    environment.processengine.routes.messageBus = `${this.config.baseRoute}/mb`;
    environment.processengine.routes.processInstances = `${this.config.baseRoute}/datastore/Process`;
    environment.processengine.routes.startProcess = `${this.config.baseRoute}/processengine/start`;
    environment.processengine.routes.userTasks =  `${this.config.baseRoute}/datastore/UserTask`;
    this.bpmnStudioClient.updateConfig(this.config);
    this.notificationService.showNotification(NotificationType.SUCCESS, 'Sucessfully saved settings!');
    this.router.navigate('');
  }

  public cancelUpdate(): void {
    this.notificationService.showNotification(NotificationType.WARNING, 'Settings dismissed!');
    this.router.navigate('');
  }

}
