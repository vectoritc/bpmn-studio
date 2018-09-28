import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject, observable} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {IIdentity} from '@essential-projects/iam_contracts';
import {Correlation, CorrelationProcessModel, IManagementApi} from '@process-engine/management_api_contracts';

import {
  AuthenticationStateEvent,
  IAuthenticationService,
  NotificationType,
} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

interface IProcessListRouteParameters {
  processModelId?: string;
}

@inject('ManagementApiClientService', EventAggregator, Router, 'NotificationService', 'AuthenticationService')
export class ProcessList {

  @observable public currentPage: number = 0;
  public pageSize: number = 10;
  public totalItems: number;
  public instances: Array<Correlation>;
  public status: Array<string> = [];
  public succesfullRequested: boolean = false;
  public selectedState: HTMLSelectElement;

  private _managementApiService: IManagementApi;
  private _eventAggregator: EventAggregator;
  private _router: Router;
  private _notificationService: NotificationService;
  private _authenticationService: IAuthenticationService;

  private _getProcessesIntervalId: number;
  private _getProcesses: () => Promise<Array<Correlation>>;
  private _subscriptions: Array<Subscription>;
  private _processes: Array<Correlation>;

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
      this.updateList();
    }
  }

  public activate(routeParameters: IProcessListRouteParameters): void {
    if (!routeParameters.processModelId) {
      this._getProcesses = this.getAllProcesses;
    } else {
      this._getProcesses = (): Promise<Array<Correlation>> => {
        return this.getProcessesForProcessModel(routeParameters.processModelId);
      };
    }
  }

  public async updateProcesses(): Promise<void> {
    try {
      const processes: Array<Correlation> = await this._getProcesses();
      const processListWasUpdated: boolean = JSON.stringify(processes) !== JSON.stringify(this._processes);

      if (processListWasUpdated) {
        this._processes = processes;
      }

      this.succesfullRequested = true;
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, `Error receiving process list: ${error.message}`);
    }

    if (!this.instances) {
      this.instances = this.allInstances;
    }

    this.totalItems = this.instances.length;
  }

  public updateList(): void {
    this.instances = this.allInstances;
  }

  public async attached(): Promise<void> {
    this._initializeGetProcesses();

    await this.updateProcesses();
    this.updateList();

    this._getProcessesIntervalId = window.setInterval(async() => {
      await this.updateProcesses();
      this.updateList();
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
    clearInterval(this._getProcessesIntervalId);
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  public goBack(): void {
    this._router.navigateBack();
  }

  public get shownProcesses(): Array<Correlation> {
    return this.instances.slice((this.currentPage - 1) * this.pageSize, this.pageSize * this.currentPage);
  }

  public get allInstances(): Array<Correlation> {
    if (!this._processes) {
      return [];
    }

    return this._processes;
  }

  private _initializeGetProcesses(): void {
    const getProcessesIsUndefined: boolean = this._getProcesses === undefined;

    if (getProcessesIsUndefined) {
      this._getProcesses = this.getAllProcesses;
    }
  }

  private async getAllProcesses(): Promise<Array<Correlation>> {
    const identity: IIdentity = this._getIdentity();

    return this._managementApiService.getActiveCorrelations(identity);
  }

  private async getProcessesForProcessModel(processModelId: string): Promise<Array<Correlation>> {
    const identity: IIdentity = this._getIdentity();

    const runningCorrelations: Array<Correlation> = await this._managementApiService.getActiveCorrelations(identity);

    const correlationsWithId: Array<Correlation> = runningCorrelations.filter((correlation: Correlation) => {
      return correlation.processModels.find((processModel: CorrelationProcessModel) => {
        return processModel.name === processModelId;
      });
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
