import {
  Correlation,
  IManagementApiService,
  ManagementContext,
  UserTask,
  UserTaskList,
} from '@process-engine/management_api_contracts';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {IAuthenticationService, NotificationType} from '../../contracts/index';
import {NotificationService} from '../notification/notification.service';

const POLLING_INTERVAL: number = 4000;

interface RouteParameters {
  correlationId: string;
}

@inject(Router, 'NotificationService', 'AuthenticationService', 'ManagementApiClientService')
export class WaitingRoom {

  private _router: Router;
  private _correlationId: string;
  private _notificationService: NotificationService;
  private _authenticationService: IAuthenticationService;
  private _managementApiClient: IManagementApiService;
  private _pollingTimeout: NodeJS.Timer;

  constructor(router: Router,
              notificationService: NotificationService,
              authenticationService: IAuthenticationService,
              managementApiClient: IManagementApiService) {

    this._router = router;
    this._notificationService = notificationService;
    this._authenticationService = authenticationService;
    this._managementApiClient = managementApiClient;
  }

  public activate(routeParameters: RouteParameters): void {
    this._correlationId = routeParameters.correlationId;

    this._startPolling();
  }

  public detached(): void {
    this._stopPolling();
  }

  private _stopPolling(): void {
    clearInterval(this._pollingTimeout);
  }

  private async _startPolling(): Promise<void> {
    this._pollingTimeout = setTimeout(() => {
      this._pollUserTasksForCorrelation();
      this._pollIsCorrelationStillActive();
    }, POLLING_INTERVAL);
  }

  private async _pollUserTasksForCorrelation(): Promise<void> {

    const userTasksForCorrelation: UserTaskList = await this._managementApiClient.getUserTasksForCorrelation(this._managementContext,
                                                                                                             this._correlationId);

    const userTaskListHasNoUserTask: boolean = userTasksForCorrelation.userTasks.length > 0;
    if (userTaskListHasNoUserTask) {
      return;
    }

    const nextUserTask: UserTask = userTasksForCorrelation.userTasks[0];

    this._renderUserTaskCallback(nextUserTask);
  }

  private async _pollIsCorrelationStillActive(): Promise<void> {

    const allActiveCorrelations: Array<Correlation> = await this._managementApiClient.getAllActiveCorrelations(this._managementContext);

    const correlationIsNotActive: boolean = !allActiveCorrelations.some((activeCorrelation: Correlation) => {
      return activeCorrelation.id === this._correlationId;
    });

    if (correlationIsNotActive) {
      this._correlationEndCallback(this._correlationId);
    }
  }

  public navigateToTaskList(): void {
    this._router.navigateToRoute('task-list-correlation', {
      correlationId: this._correlationId,
    });
  }

  private _renderUserTaskCallback(userTask: UserTask): void {
    this._notificationService.showNotification(NotificationType.SUCCESS, 'Process continued.');

    this._router.navigateToRoute('task-dynamic-ui', {
      processModelId: userTask.processModelId,
      userTaskId: userTask.id,
    });
  }

  private _correlationEndCallback: ((correlationId: string) => void) = (correlationId: string): void => {
    this._notificationService.showNotification(NotificationType.INFO, 'Process stopped.');

    this._router.navigateToRoute('dashboard');
  }

  private get _managementContext(): ManagementContext {
    return this._getManagementContext();
  }

  private _getManagementContext(): ManagementContext {
    const accessToken: string = this._authenticationService.getAccessToken();
    const context: ManagementContext = {
      identity: accessToken,
    };
    return context;
  }
}
