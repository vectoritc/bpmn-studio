// TODO: Refactor the Process Definition List entirely
//       The big issue with this file is: it is the main
//       anchor for the studio; but it is not apparent why.
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {ForbiddenError, isError, UnauthorizedError} from '@essential-projects/errors_ts';
import {IManagementApi, ProcessModelExecution} from '@process-engine/management_api_contracts';

import {IIdentity} from '@essential-projects/iam_contracts';
import {AuthenticationStateEvent, IAuthenticationService, ISolutionEntry, ISolutionService, NotificationType} from '../../../contracts/index';
import environment from '../../../environment';
import {NotificationService} from '../../notification/notification.service';

@inject(EventAggregator, Router, 'AuthenticationService', 'ManagementApiClientService', 'NotificationService', 'SolutionService')
export class ProcessDefList {

  public allProcessModels: Array<ProcessModelExecution.ProcessModel>;
  public activeSolution: ISolutionEntry;

  private _authenticationService: IAuthenticationService;
  private _managementApiClient: IManagementApi;
  private _notificationService: NotificationService;
  private _eventAggregator: EventAggregator;
  private _router: Router;
  private _subscriptions: Array<Subscription>;
  private _getProcessesIntervalId: number;
  private _solutionService: ISolutionService;

  constructor(eventAggregator: EventAggregator,
              router: Router,
              authenticationService: IAuthenticationService,
              managementApiClient: IManagementApi,
              notificationService: NotificationService,
              solutionService: ISolutionService) {

    this._eventAggregator = eventAggregator;
    this._router = router;
    this._authenticationService = authenticationService;
    this._managementApiClient = managementApiClient;
    this._notificationService = notificationService;
    this._solutionService = solutionService;

    this._eventAggregator.publish(environment.events.refreshProcessDefs);
  }

  public async canActivate(): Promise<boolean> {

    const hasClaimsForProcessDefList: boolean = await this._hasClaimsForProcessDefList(this._identity);

    if (!hasClaimsForProcessDefList) {
      this._notificationService.showNotification(NotificationType.ERROR, 'You don\'t have the permission to use the planning feature.');
      this._router.navigateToRoute('start-page');

      return false;
    }

    return true;
  }

  public attached(): void {
    const remoteSolutionUri: string = window.localStorage.getItem('processEngineRoute');
    this.activeSolution = this._solutionService.getSolutionEntryForUri(remoteSolutionUri);

    this._getAllProcessModels();

    this._getProcessesIntervalId = window.setInterval(() => {
      this._getAllProcessModels();
      this._eventAggregator.publish(environment.events.refreshProcessDefs);
      // tslint:disable-next-line
    }, environment.processengine.processDefListPollingIntervalInMs);

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
    this._router.navigateToRoute('diagram-detail', {
      diagramName: processModelId,
      solutionUri: this.activeSolution.uri,
    });
  }

  private async _hasClaimsForProcessDefList(identity: IIdentity): Promise<boolean> {
    try {
      await this._managementApiClient.getProcessModels(identity);
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
    const processModelExecution: ProcessModelExecution.ProcessModelList = await this._managementApiClient.getProcessModels(this._identity);

    const listWasUpdated: boolean = JSON.stringify(processModelExecution.processModels) !== JSON.stringify(this.allProcessModels);

    if (listWasUpdated) {
      this.allProcessModels = processModelExecution.processModels;
    }

  }

  private get _identity(): IIdentity {
    return this._getIdentity();
  }

  private _getIdentity(): IIdentity {
    const accessToken: string = this._authenticationService.getAccessToken();
    const identity: IIdentity = {
      token: accessToken,
    };

    return identity;
  }
}
