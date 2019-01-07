import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject, observable} from 'aurelia-framework';

import {IIdentity} from '@essential-projects/iam_contracts';
import {Correlation, CorrelationProcessModel, IManagementApi} from '@process-engine/management_api_contracts';

import {
  AuthenticationStateEvent,
  ISolutionEntry,
  ISolutionService,
  NotificationType,
} from '../../../contracts/index';
import environment from '../../../environment';
import {NotificationService} from '../../notification/notification.service';

interface IProcessListRouteParameters {
  diagramName?: string;
  solutionUri?: string;
}

@inject('ManagementApiClientService', EventAggregator, 'NotificationService', 'SolutionService')
export class ProcessList {

  @observable public currentPage: number = 0;
  public pageSize: number = 10;
  public totalItems: number;
  public status: Array<string> = [];
  public succesfullRequested: boolean = false;
  public selectedState: HTMLSelectElement;
  public activeSolutionEntry: ISolutionEntry;

  private _managementApiService: IManagementApi;
  private _eventAggregator: EventAggregator;
  private _notificationService: NotificationService;
  private _solutionService: ISolutionService;
  private _activeDiagramName: string;
  private _activeSolutionUri: string;

  private _getCorrelationsIntervalId: number;
  private _getCorrelations: () => Promise<Array<Correlation>>;
  private _subscriptions: Array<Subscription>;
  private _correlations: Array<Correlation> = [];

  constructor(managementApiService: IManagementApi,
              eventAggregator: EventAggregator,
              notificationService: NotificationService,
              solutionService: ISolutionService) {
    this._managementApiService = managementApiService;
    this._eventAggregator = eventAggregator;
    this._notificationService = notificationService;
    this._solutionService = solutionService;
  }

  public async currentPageChanged(newValue: number, oldValue: number): Promise<void> {
    const oldValueIsDefined: boolean = oldValue !== undefined && oldValue !== null;

    if (oldValueIsDefined) {
      this._initializeGetProcesses();
      await this.updateProcesses();
    }
  }

  /**
   * This method only gets called if this component is navigated to directly.
   * If we bind it somewhere via show.bind this method will not be called.
   */
  public activate(routeParameters: IProcessListRouteParameters): void {
    this._activeSolutionUri = routeParameters.solutionUri;
    this._activeDiagramName = routeParameters.diagramName;

    const diagramNameIsNotSet: boolean = this._activeDiagramName === undefined;
    if (diagramNameIsNotSet) {
      this._getCorrelations = this.getAllActiveCorrelations;
    } else {
      this._getCorrelations = (): Promise<Array<Correlation>> => {
        return this.getCorrelationsForProcessModel(this._activeDiagramName);
      };
    }
  }

  public async attached(): Promise<void> {
    const activeSolutionUriIsNotSet: boolean = this._activeSolutionUri === undefined;
    if (activeSolutionUriIsNotSet) {
      this._activeSolutionUri = window.localStorage.getItem('InternalProcessEngineRoute');
    }

    this.activeSolutionEntry = this._solutionService.getSolutionEntryForUri(this._activeSolutionUri);

    this._initializeGetProcesses();

    await this.updateProcesses();

    this._getCorrelationsIntervalId = window.setInterval(async() => {
      await this.updateProcesses();
    }, environment.processengine.dashboardPollingIntervalInMs);

    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this.updateProcesses();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this.updateProcesses();
      }),
    ];
  }

  public detached(): void {
    clearInterval(this._getCorrelationsIntervalId);
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  public async updateProcesses(): Promise<void> {
    try {
      const correlations: Array<Correlation> = await this._getCorrelations();
      const correlationListWasUpdated: boolean = JSON.stringify(correlations) !== JSON.stringify(this._correlations);

      if (correlationListWasUpdated) {
        this._correlations = correlations;
      }

      this.succesfullRequested = true;
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, `Error receiving process list: ${error.message}`);
    }

    const correlationsAreNotSet: boolean = this._correlations === undefined || this._correlations === null;
    if (correlationsAreNotSet) {
      this._correlations = [];
    }

    this.totalItems = this._correlations.length;
  }

  public get correlations(): Array<Correlation> {
    return this._correlations.slice((this.currentPage - 1) * this.pageSize, this.pageSize * this.currentPage);
  }

  private _initializeGetProcesses(): void {
    const getProcessesIsUndefined: boolean = this._getCorrelations === undefined;

    if (getProcessesIsUndefined) {
      this._getCorrelations = this.getAllActiveCorrelations;
    }
  }

  private async getAllActiveCorrelations(): Promise<Array<Correlation>> {
    const identity: IIdentity = this.activeSolutionEntry.identity;

    return this._managementApiService.getActiveCorrelations(identity);
  }

  private async getCorrelationsForProcessModel(processModelId: string): Promise<Array<Correlation>> {
    const identity: IIdentity = this.activeSolutionEntry.identity;

    const runningCorrelations: Array<Correlation> = await this._managementApiService.getActiveCorrelations(identity);

    const correlationsWithId: Array<Correlation> = runningCorrelations.filter((correlation: Correlation) => {
      const processModelWithSearchedId: CorrelationProcessModel =  correlation.processModels.find((processModel: CorrelationProcessModel) => {
        const isSearchedProcessModel: boolean = processModel.processModelId === processModelId;

        return isSearchedProcessModel;
      });

      const processModelFound: boolean = processModelWithSearchedId !== undefined;

      return processModelFound;
    });

    return correlationsWithId;
  }

}
