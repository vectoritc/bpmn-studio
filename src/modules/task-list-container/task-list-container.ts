import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {ForbiddenError, isError, UnauthorizedError} from '@essential-projects/errors_ts';
import {IManagementApi} from '@process-engine/management_api_contracts';

import {IIdentity} from '@essential-projects/iam_contracts';
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
  public taskList: TaskList;

  private _routeParameters: ITaskListRouteParameters;
  private _notificationService: NotificationService;
  private _router: Router;
  private _managementApiService: IManagementApi;
  private _authenticationService: IAuthenticationService;

  constructor(
    notificationService: NotificationService,
    router: Router,
    managementApiService: IManagementApi,
    authenticationService: IAuthenticationService,
  ) {
    this._notificationService = notificationService;
    this._router = router;
    this._managementApiService = managementApiService;
    this._authenticationService = authenticationService;
  }

  public async canActivate(): Promise<boolean> {
    const identity: IIdentity = this._getIdentity();

    const hasNoClaimsForTaskList: boolean = !(await this._hasClaimsForTaskList(identity));

    if (hasNoClaimsForTaskList) {
      this._notificationService.showNotification(NotificationType.ERROR, 'You don\'t have the permission to use the inspect features.');
      this._router.navigateToRoute('start-page');

      return false;
    }

    this.showTaskList = !hasNoClaimsForTaskList;

    return true;
  }

  public activate(routeParameters: ITaskListRouteParameters): void {
    this._routeParameters = routeParameters;
  }

  public attached(): void {
    this.taskList.initializeTaskList(this._routeParameters);
  }

  private _getIdentity(): IIdentity {
    const accessToken: string = this._authenticationService.getAccessToken();
    const identity: IIdentity = {
      token: accessToken,
    };

    return identity;
  }

  private async _hasClaimsForTaskList(identity: IIdentity): Promise<boolean> {
    try {
      // TODO: Refactor; this is not how we want to do our claim checks.
      // Talk to Sebastian or Christoph first.

      await this._managementApiService.getProcessModels(identity);
      await this._managementApiService.getAllActiveCorrelations(identity);

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
