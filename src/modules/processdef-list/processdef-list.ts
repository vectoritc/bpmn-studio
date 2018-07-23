// TODO: Refactor the Process Definition List entirely
//       The big issue with this file is: it is the main
//       anchor for the studio; but it is not aaparent why.
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject, observable} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {IManagementApiService, ManagementContext, ProcessModelExecution} from '@process-engine/management_api_contracts';

import {AuthenticationStateEvent, IAuthenticationService} from '../../contracts/index';
import environment from '../../environment';

@inject(EventAggregator, Router,  'NewAuthenticationService', 'ManagementApiClientService')
export class ProcessDefList {

  @observable public currentPage: number = 1;
  public pageSize: number = 10;
  public totalItems: number;
  public allProcessModels: ProcessModelExecution.ProcessModelList;

  private _authenticationService: IAuthenticationService;
  private _managementApiClient: IManagementApiService;
  private _eventAggregator: EventAggregator;
  private _router: Router;
  private _subscriptions: Array<Subscription>;
  private _getProcessesIntervalId: number;

  constructor(eventAggregator: EventAggregator,
              router: Router,
              authenticationService: IAuthenticationService,
              managementApiClient: IManagementApiService) {

    this._eventAggregator = eventAggregator;
    this._router = router;
    this._authenticationService = authenticationService;
    this._managementApiClient = managementApiClient;

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

  public showDetails(processId: string): void {
    this._router.navigate(`processdef/${processId}/detail`);
  }

  private async _getAllProcessModels(): Promise<void> {
    this.allProcessModels = await this._managementApiClient.getProcessModels(this._managementContext);
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
