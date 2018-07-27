import {IManagementApiService, ManagementContext, ProcessModelExecution, UserTaskConfig} from '@process-engine/management_api_contracts';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {IAuthenticationService, NotificationType} from '../../contracts/index';
import {NotificationService} from '../notification/notification.service';

const POLLING_INTERVAL = 4000;

@inject(Router, 'BpmnStudioClient', 'NotificationService', 'NewAuthenticationService', 'ManagementApiClientService')
export class WaitingRoom {

  private _router: Router;
  private _correlationId: string;
  private _notificationService: NotificationService;
  private _authenticationService: IAuthenticationService;
  private _managementApiClient: IManagementApiService;
  private _pollingTimeout: number;

  constructor(router: Router,
              notificationService: NotificationService,
              authenticationService: IAuthenticationService,
              managementApiClient: IManagementApiService) {
    this._router = router;
    this._notificationService = notificationService;
    this._authenticationService = authenticationService;
    this._managementApiClient = managementApiClient;
  }

  public activate(routeParameters: {correlationId: string}): void {
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

    const userTasksForCorrelation: ProcessModelExecution.UserTaskList = await this._managementApiClient.getUserTasksForCorrelation(this._managementContext, this._correlationId);

    if (userTasksForCorrelation.userTasks.length > 0) {

      const nextUserTask = userTasksForCorrelation.userTasks[0];
      this._renderUserTaskCallback(nextUserTask);
    }
  }

  private async _pollIsCorrelationStillActive(): Promise<void> {

    const allActiveCorrelations: Array<ProcessModelExecution.Correlation> = await this._managementApiClient.getAllActiveCorrelations(this._managementContext);

    const correlationIsStillActive = allActiveCorrelations.some((activeCorrelation) => {
      return activeCorrelation.id === this._correlationId;
    });

    if (!correlationIsStillActive) {
      this._correlationEndCallback(this._correlationId);
    }
  }

  public navigateToTaskList(): void {
    this._router.navigateToRoute('task-list');
  }

  private _renderUserTaskCallback(userTaskConfig: UserTaskConfig): void {
    this._notificationService.showNotification(NotificationType.SUCCESS, 'Process continued');
    this._router.navigateToRoute('task-dynamic-ui', {
      userTaskId: userTaskConfig.id,
    });
  }

  private _correlationEndCallback: ((processInstanceId: string) => void) = (processInstanceId: string): void => {
    this._notificationService.showNotification(NotificationType.WARNING, 'Process stopped');
    this._router.navigateToRoute('task-list');
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
