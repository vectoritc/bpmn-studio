import {BpmnStudioClient, IUserTaskConfig} from '@process-engine/bpmn-studio_client';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {NotificationType} from '../../contracts/index';
import {NotificationService} from '../notification/notification.service';

@inject(Router, 'BpmnStudioClient', 'NotificationService')
export class WaitingRoom {

  private router: Router;
  private bpmnStudioClient: BpmnStudioClient;
  private processInstanceId: string;
  private notificationService: NotificationService;

  constructor(router: Router, bpmnStudioClient: BpmnStudioClient, notificationService: NotificationService) {
    this.router = router;
    this.bpmnStudioClient = bpmnStudioClient;
    this.notificationService = notificationService;
  }

  private renderUserTaskCallback: any = (userTaskConfig: IUserTaskConfig): void => {
    this.notificationService.showNotification(NotificationType.SUCCESS, 'Process continued');
    if (userTaskConfig.userTaskEntity.process.id === this.processInstanceId) {
      this.router.navigate(`/task/${userTaskConfig.id}/dynamic-ui`);
      this.bpmnStudioClient.off('renderUserTask', this.renderUserTaskCallback);
    }
  }

  private processEndCallback: any = (processInstanceId: string): void => {
    this.notificationService.showNotification(NotificationType.WARNING, 'Process stopped');
    if (processInstanceId === this.processInstanceId) {
      this.router.navigate('task');
      this.bpmnStudioClient.off('processEnd', this.processEndCallback);
    }
  }

  public activate(routeParameters: {processInstanceId: string}): void {
    this.processInstanceId = routeParameters.processInstanceId;

    this.bpmnStudioClient.on('processEnd', this.processEndCallback);
    this.bpmnStudioClient.on('renderUserTask', this.renderUserTaskCallback);
  }

  public navigateToTaskList(): void {
    this.router.navigate('task');
    this.bpmnStudioClient.off('processEnd', this.processEndCallback);
    this.bpmnStudioClient.off('renderUserTask', this.renderUserTaskCallback);
  }
}
