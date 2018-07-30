import {ManagementApiClientService} from '@process-engine/management_api_client';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {UserTask} from '../../../node_modules/@process-engine/management_api_contracts';
import {NotificationType} from '../../contracts/index';
import {NotificationService} from '../notification/notification.service';

interface RouteParameters {
  processModelId: string;
}

@inject(Router, 'ManagementApiClientService', 'NotificationService')
export class WaitingRoom {

  private _router: Router;
  private _managementApiClient: ManagementApiClientService;
  private _processModelId: string;
  private _notificationService: NotificationService;

  constructor(router: Router, managementApiClient: ManagementApiClientService, notificationService: NotificationService) {
    this._router = router;
    this._managementApiClient = managementApiClient;
    this._notificationService = notificationService;
  }

  public activate(routeParameters: RouteParameters): void {
    this._processModelId = routeParameters.processModelId;

    // this._bpmnStudioClient.on('processEnd', this._processEndCallback);
    // this._bpmnStudioClient.on('renderUserTask', this._renderUserTaskCallback);
  }

  public navigateToTaskList(): void {
    this._router.navigateToRoute('task-list');
    // this._bpmnStudioClient.off('processEnd', this._processEndCallback);
    // this._bpmnStudioClient.off('renderUserTask', this._renderUserTaskCallback);
  }

  private _renderUserTaskCallback: ((userTask: UserTask) => void) = (userTask: UserTask): void => {
    this._notificationService.showNotification(NotificationType.SUCCESS, 'Process continued');
    if (userTask.processModelId === this._processModelId) {
      this._router.navigateToRoute('task-dynamic-ui', {
        userTaskId: userTask.id,
      });
      // this._bpmnStudioClient.off('renderUserTask', this._renderUserTaskCallback);
    }
  }

  private _processEndCallback: ((processInstanceId: string) => void) = (processInstanceId: string): void => {
    this._notificationService.showNotification(NotificationType.WARNING, 'Process stopped');
    if (processInstanceId === this._processModelId) {
      this._router.navigateToRoute('task-list');
      // this._bpmnStudioClient.off('processEnd', this._processEndCallback);
    }
  }
}
