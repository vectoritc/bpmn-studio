// TODO: Refactor the Process Definition List entirely
//       The big issue with this file is: it is the main
//       anchor for the studio; but it is not apparent why.
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {ForbiddenError, isError, UnauthorizedError} from '@essential-projects/errors_ts';
import {IIdentity} from '@essential-projects/iam_contracts';
import {IManagementApi, ProcessModelExecution} from '@process-engine/management_api_contracts';
import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';

import {AuthenticationStateEvent, IAuthenticationService, ISolutionEntry, ISolutionService, NotificationType} from '../../../contracts/index';
import environment from '../../../environment';
import {NotificationService} from '../../notification/notification.service';

interface RouteParameters {
  diagramName?: string;
  solutionUri?: string;
}

@inject(EventAggregator, Router, 'AuthenticationService', 'ManagementApiClientService', 'NotificationService', 'SolutionService')
export class ProcessDefList {

  public allProcessModels: Array<ProcessModelExecution.ProcessModel>;
  public allDiagrams: Array<IDiagram>;

  private _authenticationService: IAuthenticationService;
  private _managementApiClient: IManagementApi;
  private _notificationService: NotificationService;
  private _eventAggregator: EventAggregator;
  private _router: Router;
  private _subscriptions: Array<Subscription>;
  private _getProcessesIntervalId: number;
  private _activeSolutionEntry: ISolutionEntry;
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

  public async activate(routeParameters: RouteParameters): Promise<void> {
    let solutionUri: string = routeParameters.solutionUri;
    const solutionUriIsNotSet: boolean = solutionUri === undefined;

    if (solutionUriIsNotSet) {
      solutionUri = window.localStorage.getItem('InternalProcessEngineRoute');
    }

    this._activeSolutionEntry = this._solutionService.getSolutionEntryForUri(solutionUri);
    await this._activeSolutionEntry.service.openSolution(this._activeSolutionEntry.uri, this._activeSolutionEntry.identity);

    await this._updateDiagramList();
  }

  public attached(): void {

    this._updateDiagramList();

    this._getProcessesIntervalId = window.setInterval(() => {
      this._updateDiagramList();
      this._eventAggregator.publish(environment.events.refreshProcessDefs);
      // tslint:disable-next-line
    }, environment.processengine.processDefListPollingIntervalInMs);

    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this._updateDiagramList();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this._updateDiagramList();
      }),
    ];
  }

  public detached(): void {
    clearInterval(this._getProcessesIntervalId);
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  public showDetails(diagramName: string): void {

    this._router.navigateToRoute('diagram-detail', {
      diagramName: diagramName,
      solutionUri: this._activeSolutionEntry.uri,
    });
  }

  private async _updateDiagramList(): Promise<void> {
    const solution: ISolution = await this._activeSolutionEntry.service.loadSolution();
    this.allDiagrams = solution.diagrams;
  }
}
