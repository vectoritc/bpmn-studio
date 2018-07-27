import {BpmnStudioClient, IUserTaskConfig} from '@process-engine/bpmn-studio_client';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {NotificationType} from '../../contracts/index';
import {NotificationService} from '../notification/notification.service';

interface RouteParameters {
  processInstanceId: string;
}

@inject(Router, 'BpmnStudioClient', 'NotificationService')
export class WaitingRoom {

  private _router: Router;
  private _bpmnStudioClient: BpmnStudioClient;
  private _processInstanceId: string;
  private _notificationService: NotificationService;

  constructor(router: Router, bpmnStudioClient: BpmnStudioClient, notificationService: NotificationService) {
    this._router = router;
    this._bpmnStudioClient = bpmnStudioClient;
    this._notificationService = notificationService;
  }

  public activate(routeParameters: RouteParameters): void {
    this._processInstanceId = routeParameters.processInstanceId;

    this._bpmnStudioClient.on('processEnd', this._processEndCallback);
    this._bpmnStudioClient.on('renderUserTask', this._renderUserTaskCallback);
  }

  public navigateToTaskList(): void {
    this._router.navigateToRoute('task-list');
    this._bpmnStudioClient.off('processEnd', this._processEndCallback);
    this._bpmnStudioClient.off('renderUserTask', this._renderUserTaskCallback);
  }

  private _renderUserTaskCallback: ((userTaskConfig: IUserTaskConfig) => void) = (userTaskConfig: IUserTaskConfig): void => {
    this._notificationService.showNotification(NotificationType.SUCCESS, 'Process continued');
    if (userTaskConfig.userTaskEntity.process.id === this._processInstanceId) {
      this._router.navigateToRoute('task-dynamic-ui', {
        userTaskId: userTaskConfig.id,
      });
      this._bpmnStudioClient.off('renderUserTask', this._renderUserTaskCallback);
    }
  }

  private _processEndCallback: ((processInstanceId: string) => void) = (processInstanceId: string): void => {
    this._notificationService.showNotification(NotificationType.WARNING, 'Process stopped');
    if (processInstanceId === this._processInstanceId) {
      this._router.navigateToRoute('task-list');
      this._bpmnStudioClient.off('processEnd', this._processEndCallback);
    }
  }
}
