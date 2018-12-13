import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject, observable} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {IIdentity} from '@essential-projects/iam_contracts';
import {Correlation, CorrelationProcessModel, IManagementApi} from '@process-engine/management_api_contracts';

import {
  AuthenticationStateEvent,
  IAuthenticationService,
  NotificationType,
} from '../../../contracts/index';
import environment from '../../../environment';
import {NotificationService} from '../../notification/notification.service';

interface IProcessListRouteParameters {
  diagramName?: string;
  solutionUri?: string;
}

@inject('ManagementApiClientService', EventAggregator, Router, 'NotificationService', 'AuthenticationService')
export class ProcessList {

  @observable public currentPage: number = 0;
  public pageSize: number = 10;
  public totalItems: number;
  public status: Array<string> = [];
  public succesfullRequested: boolean = false;
  public selectedState: HTMLSelectElement;

  private _managementApiService: IManagementApi;
  private _eventAggregator: EventAggregator;
  private _router: Router;
  private _notificationService: NotificationService;
  private _authenticationService: IAuthenticationService;

  private _getCorrelationsIntervalId: number;
  private _getCorrelations: () => Promise<Array<Correlation>>;
  private _subscriptions: Array<Subscription>;
  private _correlations: Array<Correlation> = [];

  constructor(managementApiService: IManagementApi,
              eventAggregator: EventAggregator,
              router: Router,
              notificationService: NotificationService,
              authenticationService: IAuthenticationService,
  ) {
    this._managementApiService = managementApiService;
    this._eventAggregator = eventAggregator;
    this._router = router;
    this._notificationService = notificationService;
    this._authenticationService = authenticationService;
  }

  public async currentPageChanged(newValue: number, oldValue: number): Promise<void> {
    const oldValueIsDefined: boolean = oldValue !== undefined && oldValue !== null;

    if (oldValueIsDefined) {
      this._initializeGetProcesses();
      await this.updateProcesses();
    }
  }

  public activate(routeParameters: IProcessListRouteParameters): void {
    if (!routeParameters.processModelId) {
      this._getCorrelations = this.getAllActiveCorrelations;
    } else {
      this._getCorrelations = (): Promise<Array<Correlation>> => {
        return this.getCorrelationsForProcessModel(routeParameters.processModelId);
      };
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

    if (!this._correlations) {
      this._correlations = [];
    }

    this.totalItems = this._correlations.length;
  }

  public async attached(): Promise<void> {
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
    const identity: IIdentity = this._getIdentity();

    return this._managementApiService.getActiveCorrelations(identity);
  }

  private async getCorrelationsForProcessModel(processModelId: string): Promise<Array<Correlation>> {
    const identity: IIdentity = this._getIdentity();

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

  // TODO: Move this method into a service.
  private _getIdentity(): IIdentity {
    const accessToken: string = this._authenticationService.getAccessToken();
    const identity: IIdentity = {
      token: accessToken,
    };

    return identity;
  }
}
