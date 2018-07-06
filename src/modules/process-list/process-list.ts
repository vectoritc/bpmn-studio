import {INodeInstanceEntity} from '@process-engine/process_engine_contracts';
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

  private processEngineService: IProcessEngineService;
  private notificationService: NotificationService;
  private eventAggregator: EventAggregator;
  private selectedState: HTMLSelectElement;
  private getProcessesIntervalId: number;
  private getProcesses: () => Promise<IPagination<IProcessEntity>>;
  private subscriptions: Array<Subscription>;
  private processes: IPagination<IProcessEntity>;
  private instances: Array<IProcessEntity>;
  private status: Array<string> = [];
  private succesfullRequested: boolean = false;
  private router: Router;

  @observable public currentPage: number = 0;
  public pageSize: number = 10;
  public totalItems: number;
  public solutionExplorerIsShown: boolean = false;

  constructor(processEngineService: IProcessEngineService,
              eventAggregator: EventAggregator,
              router: Router,
              notificationService: NotificationService) {
    this.processEngineService = processEngineService;
    this.eventAggregator = eventAggregator;
    this.notificationService = notificationService;
    this.router = router;
  }

  public currentPageChanged(newValue: number, oldValue: number): void {
    if (oldValue !== undefined && oldValue !== null) {
      this.updateProcesses();
    }
  }

  public activate(routeParameters: IProcessListRouteParameters): void {
    if (!routeParameters.processDefId) {
      this.getProcesses = this.getAllProcesses;
    } else {
      this.getProcesses = (): Promise<IPagination<IProcessEntity>> => {
        return this.getProcessesForProcessDef(routeParameters.processDefId);
      };
    }
    this.updateProcesses();

  }

  public async updateProcesses(): Promise<void> {
    try {
      this.processes = await this.getProcesses();
      this.succesfullRequested = true;
    } catch (error) {
      this.notificationService.showNotification(NotificationType.ERROR, error.message);
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
    if (this.selectedState.value === 'all') {
      this.instances = this.allInstances;
      return;
    }
    this.instances = this.allInstances.filter((entry: IProcessEntity): boolean => {
      return entry.status === this.selectedState.value;
    });
  }

  public attached(): void {
    this.getProcessesIntervalId = window.setInterval(async() => {
      await this.updateProcesses();
      this.updateList();
    }, environment.processengine.poolingInterval);

    this.subscriptions = [
      this.eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this.updateProcesses();
      }),
      this.eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this.updateProcesses();
      }),
    ];
  }

  public detached(): void {
    clearInterval(this.getProcessesIntervalId);
    for (const subscription of this.subscriptions) {
      subscription.dispose();
    }
  }

  public goBack(): void {
    this.router.navigateBack();
  }

  public get shownProcesses(): Array<IProcessEntity> {
    return this.instances.slice((this.currentPage - 1) * this.pageSize, this.pageSize * this.currentPage);
  }

  public get allInstances(): Array<IProcessEntity> {
    return this.processes.data;
  }

  public toggleSolutionExplorer(): void {
    this.solutionExplorerIsShown = !this.solutionExplorerIsShown;
  }

  private async getAllProcesses(): Promise<IPagination<IProcessEntity>> {
    return this.processEngineService.getProcesses();
  }

  private async getProcessesForProcessDef(processDefId: string): Promise<IPagination<IProcessEntity>> {
    return this.processEngineService.getProcessesByProcessDefId(processDefId);
  }
}
