import {IIdentity} from '@essential-projects/iam_contracts';
import {
  Correlation,
  IManagementApi,
  ManualTask,
  ManualTaskList,
  UserTask,
  UserTaskList,
} from '@process-engine/management_api_contracts';
import {inject} from 'aurelia-framework';
import {activationStrategy, Router} from 'aurelia-router';
import {IAuthenticationService, NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

interface RouteParameters {
  correlationId: string;
  processModelId: string;
}

@inject(Router, 'NotificationService', 'AuthenticationService', 'ManagementApiClientService')
export class WaitingRoom {

  private _router: Router;
  private _correlationId: string;
  private _notificationService: NotificationService;
  private _authenticationService: IAuthenticationService;
  private _managementApiClient: IManagementApi;
  private _pollingTimer: NodeJS.Timer;
  private _processModelId: string;

  constructor(router: Router,
              notificationService: NotificationService,
              authenticationService: IAuthenticationService,
              managementApiClient: IManagementApi) {

    this._router = router;
    this._notificationService = notificationService;
    this._authenticationService = authenticationService;
    this._managementApiClient = managementApiClient;
  }

  public activate(routeParameters: RouteParameters): void {
    this._correlationId = routeParameters.correlationId;
    this._processModelId = routeParameters.processModelId;
  }

  public attached(): void {
    this._startPolling();
  }

  public detached(): void {
    this._stopPolling();
  }

  public determineActivationStrategy(): string {
    return activationStrategy.replace;
  }

  public navigateToDetailView(): void {
    this._router.navigateToRoute('diagram-detail', {
      processModelId: this._processModelId,
    });
  }

  private async _startPolling(): Promise<void> {
    this._pollingTimer = setTimeout(async() => {
      const noUserTaskFound: boolean = !(await this._pollUserTasksForCorrelation());
      const noManualTaskFound: boolean = !(await this._pollManualTasksForCorrelation());
      const correlationIsStillActive: boolean = await this._pollIsCorrelationStillActive();

      const shouldKeepPolling: boolean = noUserTaskFound && noManualTaskFound && correlationIsStillActive;
      if (shouldKeepPolling) {
        this._startPolling();
      }
    }, environment.processengine.waitingRoomPollingIntervalInMs);
  }

  private _stopPolling(): void {
    clearTimeout(this._pollingTimer);
  }

  private async _pollUserTasksForCorrelation(): Promise<boolean> {

    const identity: IIdentity = this._getIdentity();
    const userTasksForCorrelation: UserTaskList = await this._managementApiClient.getUserTasksForCorrelation(identity,
                                                                                                             this._correlationId);

    const userTaskListHasNoUserTask: boolean = userTasksForCorrelation.userTasks.length === 0;
    if (userTaskListHasNoUserTask) {
      return false;
    }

    const nextUserTask: UserTask = userTasksForCorrelation.userTasks[0];

    this._renderUserTaskCallback(nextUserTask);

    return true;
  }

  private async _pollManualTasksForCorrelation(): Promise<boolean> {

    const identity: IIdentity = this._getIdentity();
    const manualTasksForCorrelation: ManualTaskList = await this._managementApiClient
                                                                 .getManualTasksForCorrelation(identity, this._correlationId);

    const manualTaskListIsEmpty: boolean = manualTasksForCorrelation.manualTasks.length === 0;
    if (manualTaskListIsEmpty) {
      return false;
    }

    const nextManualTask: ManualTask = manualTasksForCorrelation.manualTasks[0];

    this._renderManualTaskCallback(nextManualTask);

    return true;
  }

  private async _pollIsCorrelationStillActive(): Promise<boolean> {

    const identity: IIdentity = this._getIdentity();
    const allActiveCorrelations: Array<Correlation> = await this._managementApiClient.getActiveCorrelations(identity);

    const correlationIsNotActive: boolean = !allActiveCorrelations.some((activeCorrelation: Correlation) => {
      return activeCorrelation.id === this._correlationId;
    });

    if (correlationIsNotActive) {
      this._correlationEndCallback(this._correlationId);
    }

    return !correlationIsNotActive;
  }

  private _renderUserTaskCallback(task: UserTask): void {
    this._notificationService.showNotification(NotificationType.SUCCESS, 'Process continued.');

    this._router.navigateToRoute('task-dynamic-ui', {
      processModelId: task.processModelId,
      taskId: task.id,
    });
  }

  private _renderManualTaskCallback(task: ManualTask): void {
    this._notificationService.showNotification(NotificationType.SUCCESS, 'Process continued.');

    this._router.navigateToRoute('task-dynamic-ui', {
      processModelId: task.processModelId,
      taskId: task.id,
    });
  }

  private _correlationEndCallback: ((correlationId: string) => void) = (correlationId: string): void => {
    this._notificationService.showNotification(NotificationType.INFO, 'Process stopped.');

    this._router.navigateToRoute('inspect');
  }

  private _getIdentity(): IIdentity {
    const accessToken: string = this._authenticationService.getAccessToken();
    const identity: IIdentity = {
      token: accessToken,
    };

    return identity;
  }
}
