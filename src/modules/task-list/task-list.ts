import {
  BpmnStudioClient,
  IConfirmWidgetConfig,
  IUserTaskConfig,
  IUserTaskEntity,
  UserTaskProceedAction,
  WidgetConfig,
  WidgetType,
} from '@process-engine/bpmn-studio_client';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, computedFrom, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {AuthenticationStateEvent, IDynamicUiService, IPagination, IProcessEngineService, NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {DynamicUiWrapper} from '../dynamic-ui-wrapper/dynamic-ui-wrapper';
import {NotificationService} from '../notification/notification.service';

interface ITaskListRouteParameters {
  processDefId?: string;
  processId?: string;
}

@inject(EventAggregator, 'BpmnStudioClient', Router, 'NotificationService')
export class TaskList {

  private eventAggregator: EventAggregator;
  private bpmnStudioClient: BpmnStudioClient;
  private notificationService: NotificationService;

  private succesfullRequested: boolean = false;
  private subscriptions: Array<Subscription>;
  private userTasks: IPagination<IUserTaskEntity>;
  private getUserTasksIntervalId: number;
  private dynamicUiWrapper: DynamicUiWrapper;
  private getUserTasks: () => Promise<IPagination<IUserTaskEntity>>;
  private router: Router;

  public currentPage: number = 0;
  public pageSize: number = 10;
  public totalItems: number;
  public solutionExplorerIsShown: boolean = false;

  constructor(eventAggregator: EventAggregator, bpmnStudioClient: BpmnStudioClient, router: Router, notificationService: NotificationService) {
    this.eventAggregator = eventAggregator;
    this.bpmnStudioClient = bpmnStudioClient;
    this.router = router;
    this.notificationService = notificationService;
  }

  private async updateUserTasks(): Promise<void> {
    try {
      this.userTasks = await this.getUserTasks();
      this.succesfullRequested = true;
    } catch (error) {
      this.notificationService.showNotification(NotificationType.ERROR, error.message);
    }

    this.totalItems = this.tasks.length;
  }

  public activate(routeParameters: ITaskListRouteParameters): void {
    if (routeParameters.processDefId) {
      this.getUserTasks = (): Promise<IPagination<IUserTaskEntity>> => {
        return this.getUserTasksForProcessDef(routeParameters.processDefId);
      };
    } else if (routeParameters.processId) {
      this.getUserTasks = (): Promise<IPagination<IUserTaskEntity>> => {
        return this.getUserTasksForProcess(routeParameters.processId);
      };
    } else {
      this.getUserTasks = this.getAllUserTasks;
    }
    this.updateUserTasks();
  }

  public attached(): void {
    this.getUserTasksIntervalId = window.setInterval(() => {
      this.updateUserTasks();
    }, environment.processengine.poolingInterval);

    this.subscriptions = [
      this.eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this.updateUserTasks();
      }),
      this.eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this.updateUserTasks();
      }),
    ];
  }

  public detached(): void {
    clearInterval(this.getUserTasksIntervalId);
    for (const subscription of this.subscriptions) {
      subscription.dispose();
    }
  }

  public goBack(): void {
    this.router.navigateBack();
  }

  public get shownTasks(): Array<IUserTaskEntity> {
    return this.tasks.slice((this.currentPage - 1) * this.pageSize, this.pageSize * this.currentPage);
  }

  public get tasks(): Array<IUserTaskEntity> {
    if (this.userTasks === undefined) {
      return [];
    }
    return this.userTasks.data.filter((entry: IUserTaskEntity): boolean => {
      return entry.state === 'wait';
    });
  }

  public toggleSolutionExplorer(): void {
    this.solutionExplorerIsShown = !this.solutionExplorerIsShown;
  }

  private getAllUserTasks(): Promise<IPagination<IUserTaskEntity>> {
    return this.bpmnStudioClient.getUserTaskList();
  }

  private getUserTasksForProcessDef(processDefId: string): Promise<IPagination<IUserTaskEntity>> {
    return this.bpmnStudioClient.getUserTaskListByProcessDefId(processDefId);
  }

  private getUserTasksForProcess(processId: string): Promise<IPagination<IUserTaskEntity>> {
    return this.bpmnStudioClient.getUserTaskListByProcessInstanceId(processId);
  }
}
