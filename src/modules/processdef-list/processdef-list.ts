// TODO: Refactor the Process Definition List entirely
//       The big issue with this file is: it is the main
//       anchor for the studio; but it is not aaparent why.
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject, observable} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {ForbiddenError, isError, UnauthorizedError} from '@essential-projects/errors_ts';
import {IManagementApiService, ManagementContext, ProcessModelExecution} from '@process-engine/management_api_contracts';

import {AuthenticationStateEvent, IAuthenticationService, NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

@inject(EventAggregator, Router,  'AuthenticationService', 'ManagementApiClientService', 'NotificationService')
export class ProcessDefList {

  @observable public currentPage: number = 1;
  public pageSize: number = 10;
  public totalItems: number;
  public allProcessModels: Array<ProcessModelExecution.ProcessModel>;

  private _authenticationService: IAuthenticationService;
  private _managementApiClient: IManagementApiService;
  private _notificationService: NotificationService;
  private _eventAggregator: EventAggregator;
  private _router: Router;
  private _subscriptions: Array<Subscription>;
  private _getProcessesIntervalId: number;

  constructor(eventAggregator: EventAggregator,
              router: Router,
              authenticationService: IAuthenticationService,
              managementApiClient: IManagementApiService,
              notificationService: NotificationService) {

    this._eventAggregator = eventAggregator;
    this._router = router;
    this._authenticationService = authenticationService;
    this._managementApiClient = managementApiClient;
    this._notificationService = notificationService;

    this._eventAggregator.publish(environment.events.refreshProcessDefs);
  }

  public async canActivate(): Promise<boolean> {

    const hasClaimsForProcessDefList: boolean = await this._hasClaimsForProcessDefList(this._managementContext);

    if (!hasClaimsForProcessDefList) {
      this._notificationService.showNotification(NotificationType.ERROR, 'You don\'t have the permission to use the planning feature.');
      return false;
    }

    return true;
  }

  public attached(): void {

    this._getAllProcessModels();

    this._getProcessesIntervalId = window.setInterval(() => {
      this._getAllProcessModels();
      this._eventAggregator.publish(environment.events.refreshProcessDefs);
      // tslint:disable-next-line
    }, environment.processengine.pollingIntervalInMs);

    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this._getAllProcessModels();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this._getAllProcessModels();
      }),
    ];
  }

  public detached(): void {
    clearInterval(this._getProcessesIntervalId);
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  public showDetails(processModelId: string): void {
    this._router.navigateToRoute('processdef-detail', {
      processModelId: processModelId,
    });
  }

  private async _hasClaimsForProcessDefList(managementContext: ManagementContext): Promise<boolean> {
    try {
      await this._managementApiClient.getProcessModels(managementContext);
    } catch (error) {
      const errorIsForbiddenError: boolean = isError(error, ForbiddenError);
      const errorIsUnauthorizedError: boolean = isError(error, UnauthorizedError);

      if (errorIsForbiddenError || errorIsUnauthorizedError) {
        return false;
      }
    }

    return true;
  }

  private async _getAllProcessModels(): Promise<void> {

    const processModelExecution: ProcessModelExecution.ProcessModelList = await this._managementApiClient.getProcessModels(this._managementContext);

    this.allProcessModels = processModelExecution.processModels;
    this.totalItems = this.allProcessModels.length;

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
