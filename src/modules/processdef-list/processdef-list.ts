// TODO: Refactor the Process Definition List entirely
//       The big issue with this file is: it is the main
//       anchor for the studio; but it is not aaparent why.
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject, observable} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {isError, UnauthorizedError} from '@essential-projects/errors_ts';
import {IManagementApiService, ManagementContext, ProcessModelExecution} from '@process-engine/management_api_contracts';

import {AuthenticationStateEvent, IAuthenticationService, NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

@inject(EventAggregator, Router,  'NewAuthenticationService', 'ManagementApiClientService', 'NotificationService')
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

  public attached(): void {

    this._getAllProcessModels();

    this._getProcessesIntervalId = window.setInterval(() => {
      this._getAllProcessModels();
      this._eventAggregator.publish(environment.events.refreshProcessDefs);
      // tslint:disable-next-line
    }, environment.processengine.poolingInterval);

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

  public showDetails(processKey: string): void {
    this._router.navigate(`processdef/${processKey}/detail`);
  }

  private async _getAllProcessModels(): Promise<void> {
    try {
      const processModelExecution: ProcessModelExecution.ProcessModelList = await this._managementApiClient.getProcessModels(this._managementContext);

      this.allProcessModels = processModelExecution.processModels;
      this.totalItems = this.allProcessModels.length;
    } catch (error) {
      if (isError(error, UnauthorizedError)) {
        this._notificationService.showNotification(NotificationType.ERROR, 'You dont have permission to view the planning page');
        this._router.navigate('/');
      } else {
        this._notificationService.showNotification(NotificationType.ERROR, error.message);
      }
    }
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
