import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {ForbiddenError, isError, UnauthorizedError} from '@essential-projects/errors_ts';
import {IManagementApiService, ManagementContext} from '@process-engine/management_api_contracts';

import {IAuthenticationService, NotificationType} from '../../contracts/index';
import {NotificationService} from '../notification/notification.service';
import {TaskList} from '../task-list/task-list';

interface ITaskListRouteParameters {
  processModelId?: string;
  correlationId?: string;
}

@inject('NotificationService', Router, 'ManagementApiClientService', 'AuthenticationService')
export class TaskListContainer {

  public showTaskList: boolean = false;
  public tasklist: TaskList;

  private _routeParameters: ITaskListRouteParameters;
  private _notificationService: NotificationService;
  private _router: Router;
  private _managementApiService: IManagementApiService;
  private _authenticationService: IAuthenticationService;

  constructor(
    notificationService: NotificationService,
    router: Router,
    managementApiService: IManagementApiService,
    authenticationService: IAuthenticationService,
  ) {
    this._notificationService = notificationService;
    this._router = router;
    this._managementApiService = managementApiService;
    this._authenticationService = authenticationService;
  }

  public async canActivate(): Promise<boolean> {
    const managementContext: ManagementContext = this._getManagementContext();

    const hasClaimsForTaskList: boolean = await this._hasClaimsForTaskList(managementContext);

    if (!hasClaimsForTaskList) {
      this._notificationService.showNotification(NotificationType.ERROR, 'You don\'t have the permission to use the dashboard features.');
      this._router.navigateToRoute('start-page');

      return false;
    }

    this.showTaskList = hasClaimsForTaskList;

    return true;
  }

  public activate(routeParameters: ITaskListRouteParameters): void {
    this._routeParameters = routeParameters;
  }

  public attached(): void {
    this.tasklist.initializeTaskList(this._routeParameters);
  }

  private _getManagementContext(): ManagementContext {
    const accessToken: string = this._authenticationService.getAccessToken();
    const context: ManagementContext = {
      identity: accessToken,
    };

    return context;
  }

  private async _hasClaimsForTaskList(managementContext: ManagementContext): Promise<boolean> {
    try {
      // TODO: Refactor; this is not how we want to do our claim checks.
      // Talk to Sebastian or Christoph first.

      await this._managementApiService.getProcessModels(managementContext);
      await this._managementApiService.getAllActiveCorrelations(managementContext);

    } catch (error) {
      const errorIsForbiddenError: boolean = isError(error, ForbiddenError);
      const errorIsUnauthorizedError: boolean = isError(error, UnauthorizedError);

      if (errorIsForbiddenError || errorIsUnauthorizedError) {
        return false;
      }
    }

    return true;
  }
}
