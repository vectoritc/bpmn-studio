import {BpmnStudioClient, IUserTaskEntity} from '@process-engine/bpmn-studio_client';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {AuthenticationStateEvent, IPagination, NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

interface ITaskListRouteParameters {
  processDefId?: string;
  processId?: string;
}

@inject(EventAggregator, 'BpmnStudioClient', Router, 'NotificationService')
export class TaskList {

  public currentPage: number = 0;
  public pageSize: number = 10;
  public totalItems: number;
  public solutionExplorerIsShown: boolean = false;
  public succesfullRequested: boolean = false;

  private _eventAggregator: EventAggregator;
  private _bpmnStudioClient: BpmnStudioClient;
  private _notificationService: NotificationService;
  private _subscriptions: Array<Subscription>;
  private _userTasks: IPagination<IUserTaskEntity>;
  private _getUserTasksIntervalId: number;
  private _getUserTasks: () => Promise<IPagination<IUserTaskEntity>>;
  private _router: Router;

  constructor(eventAggregator: EventAggregator, bpmnStudioClient: BpmnStudioClient, router: Router, notificationService: NotificationService) {
    this._eventAggregator = eventAggregator;
    this._bpmnStudioClient = bpmnStudioClient;
    this._router = router;
    this._notificationService = notificationService;
  }

  private async updateUserTasks(): Promise<void> {
    try {
      this._userTasks = await this._getUserTasks();
      this.succesfullRequested = true;
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, error.message);
    }

    this.totalItems = this.tasks.length;
  }

  public activate(routeParameters: ITaskListRouteParameters): void {
    if (routeParameters.processDefId) {
      this._getUserTasks = (): Promise<IPagination<IUserTaskEntity>> => {
        return this._getUserTasksForProcessDef(routeParameters.processDefId);
      };
    } else if (routeParameters.processId) {
      this._getUserTasks = (): Promise<IPagination<IUserTaskEntity>> => {
        return this._getUserTasksForProcess(routeParameters.processId);
      };
    } else {
      this._getUserTasks = this._getAllUserTasks;
    }
    this.updateUserTasks();
  }

  public attached(): void {
    this._getUserTasksIntervalId = window.setInterval(() => {
      this.updateUserTasks();
    }, environment.processengine.poolingInterval);

    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this.updateUserTasks();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this.updateUserTasks();
      }),
    ];
  }

  public detached(): void {
    clearInterval(this._getUserTasksIntervalId);
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  public goBack(): void {
    this._router.navigateBack();
  }

  public get shownTasks(): Array<IUserTaskEntity> {
    return this.tasks.slice((this.currentPage - 1) * this.pageSize, this.pageSize * this.currentPage);
  }

  public get tasks(): Array<IUserTaskEntity> {
    if (this._userTasks === undefined) {
      return [];
    }
    return this._userTasks.data.filter((entry: IUserTaskEntity): boolean => {
      return entry.state === 'wait';
    });
  }

  public toggleSolutionExplorer(): void {
    this.solutionExplorerIsShown = !this.solutionExplorerIsShown;
  }

  private _getAllUserTasks(): Promise<IPagination<IUserTaskEntity>> {
    return this._bpmnStudioClient.getUserTaskList();
  }

  private _getUserTasksForProcessDef(processDefId: string): Promise<IPagination<IUserTaskEntity>> {
    return this._bpmnStudioClient.getUserTaskListByProcessDefId(processDefId);
  }

  private _getUserTasksForProcess(processId: string): Promise<IPagination<IUserTaskEntity>> {
    return this._bpmnStudioClient.getUserTaskListByProcessInstanceId(processId);
  }
}
