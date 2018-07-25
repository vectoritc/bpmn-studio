import {ForbiddenError, isError, UnauthorizedError} from '@essential-projects/errors_ts';
import {Correlation, IManagementApiService, ManagementContext} from '@process-engine/management_api_contracts';
import {inject, observable} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {
  AuthenticationStateEvent,
  IAuthenticationService,
  NotificationType,
} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

@inject('ManagementApiClientService', 'NotificationService', 'NewAuthenticationService')
export class Dashboard {

  public showTaskList: boolean = false;
  public showProcessList: boolean = false;

  private _managementApiService: IManagementApiService;
  private _notificationService: NotificationService;
  private _authenticationService: IAuthenticationService;

  constructor(managementApiService: IManagementApiService,
              notificationService: NotificationService,
              authenticationService: IAuthenticationService,
  ) {
    this._managementApiService = managementApiService;
    this._notificationService = notificationService;
    this._authenticationService = authenticationService;
  }

  public async canActivate(): Promise<boolean> {
    const notLoggedIn: boolean = this._authenticationService.getAccessToken() === undefined || this._authenticationService.getAccessToken() === null;

    if (notLoggedIn) {
      this._notificationService.showNotification(NotificationType.ERROR, 'You have to be logged in to use the dashboard feature.');
      return false;
    }

    const managementContext: ManagementContext = this._getManagementContext();

    const hasClaimsForTaskList: boolean = await this._hasClaimsForTaskList(managementContext);
    const hasClaimsForProcessList: boolean = await this._hasClaimsForProcessList(managementContext);

    if (!hasClaimsForProcessList && !hasClaimsForTaskList) {
      this._notificationService.showNotification(NotificationType.ERROR, 'You dont have the permission to use the planning feature.');
      return false;
    }

    this.showTaskList = hasClaimsForTaskList;
    this.showProcessList = hasClaimsForProcessList;

    return true;
  }

  private async _hasClaimsForTaskList(managementContext: ManagementContext): Promise<boolean> {
    try {

      await this._managementApiService.getProcessModels(managementContext);
      await this._managementApiService.getUserTasksForProcessModel(managementContext, undefined);
      await this._managementApiService.getUserTasksForCorrelation(managementContext, undefined);

      return true;

    } catch (error) {
      const errorIsNotForbiddenError: boolean = !isError(error, ForbiddenError);
      if (errorIsNotForbiddenError) {
        return true;
      }
    }

    return false;
  }

  private async _hasClaimsForProcessList(managementContext: ManagementContext): Promise<boolean> {
    try {

      await this._managementApiService.getAllActiveCorrelations(managementContext);

      return true;

    } catch (error) {
      const errorIsNotForbiddenError: boolean = !isError(error, ForbiddenError);
      if (errorIsNotForbiddenError) {
        return true;
      }
    }

    return false;
  }

  // TODO: Move this method into a service.
  private _getManagementContext(): ManagementContext {
    const accessToken: string = this._authenticationService.getAccessToken();
    const context: ManagementContext = {
      identity: accessToken,
    };

    return context;
  }
}
