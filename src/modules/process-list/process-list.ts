import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject, observable} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {
  AuthenticationStateEvent,
  IPagination,
  IProcessEngineService,
  IProcessEntity,
  NotificationType,
} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

interface IProcessListRouteParameters {
  processDefId?: string;
}

@inject('ProcessEngineService', EventAggregator, Router, 'NotificationService')
export class ProcessList {

  @observable public currentPage: number = 0;
  public pageSize: number = 10;
  public totalItems: number;
  public solutionExplorerIsShown: boolean = false;
  public instances: Array<IProcessEntity>;
  public status: Array<string> = [];
  public succesfullRequested: boolean = false;
  public selectedState: HTMLSelectElement;

  private _processEngineService: IProcessEngineService;
  private _notificationService: NotificationService;
  private _eventAggregator: EventAggregator;

  private _getProcessesIntervalId: number;
  private _getProcesses: () => Promise<IPagination<IProcessEntity>>;
  private _subscriptions: Array<Subscription>;
  private _processes: IPagination<IProcessEntity>;
  private _router: Router;

  constructor(processEngineService: IProcessEngineService,
              eventAggregator: EventAggregator,
              router: Router,
              notificationService: NotificationService) {
    this._processEngineService = processEngineService;
    this._eventAggregator = eventAggregator;
    this._notificationService = notificationService;
    this._router = router;
  }

  public currentPageChanged(newValue: number, oldValue: number): void {
    if (oldValue !== undefined && oldValue !== null) {
      this.updateProcesses();
    }
  }

  public activate(routeParameters: IProcessListRouteParameters): void {
    if (!routeParameters.processDefId) {
      this._getProcesses = this.getAllProcesses;
    } else {
      this._getProcesses = (): Promise<IPagination<IProcessEntity>> => {
        return this.getProcessesForProcessDef(routeParameters.processDefId);
      };
    }
  }

  public async updateProcesses(): Promise<void> {
    try {
      this._processes = await this._getProcesses();
      this.succesfullRequested = true;
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, error.message);
    }

    for (const instance of this.allInstances) {
      if (!this.status.includes(instance.status)) {
        this.status.push(instance.status);
      }
    }

    if (!this.instances) {
      this.instances = this.allInstances;
    }
    this.totalItems = this.instances.length;
  }

  public updateList(): void {
    if (!this.selectedState || this.selectedState.value === 'all') {
      this.instances = this.allInstances;
      return;
    }
    this.instances = this.allInstances.filter((entry: IProcessEntity): boolean => {
      return entry.status === this.selectedState.value;
    });
  }

  public attached(): void {
    if (!this._getProcesses) {
      this._getProcesses = this.getAllProcesses;
    }
    this.updateProcesses();

    this._getProcessesIntervalId = window.setInterval(async() => {
      await this.updateProcesses();
      this.updateList();
    }, environment.processengine.poolingInterval);

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

  public get shownProcesses(): Array<IProcessEntity> {
    return this.instances.slice((this.currentPage - 1) * this.pageSize, this.pageSize * this.currentPage);
  }

  public get allInstances(): Array<IProcessEntity> {
    return this._processes.data;
  }

  public toggleSolutionExplorer(): void {
    this.solutionExplorerIsShown = !this.solutionExplorerIsShown;
  }

  private async getAllProcesses(): Promise<IPagination<IProcessEntity>> {
    return this._processEngineService.getProcesses();
  }

  private async getProcessesForProcessDef(processDefId: string): Promise<IPagination<IProcessEntity>> {
    return this._processEngineService.getProcessesByProcessDefId(processDefId);
  }
}
