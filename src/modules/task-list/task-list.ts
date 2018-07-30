import {isError, NotFoundError, UnauthorizedError} from '@essential-projects/errors_ts';
import {
  Correlation,
  IManagementApiService,
  ManagementContext,
  ProcessModelExecution,
  UserTask,
  UserTaskList,
} from '@process-engine/management_api_contracts';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {
  AuthenticationStateEvent,
  IAuthenticationService,
  NotificationType,
} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

interface ITaskListRouteParameters {
  processModelId?: string;
  correlationId?: string;
}

interface IUserTaskWithProcessModel {
  userTask: UserTask;
  processModel: ProcessModelExecution.ProcessModel;
}

@inject(EventAggregator, 'ManagementApiClientService', Router, 'NotificationService', 'NewAuthenticationService')
export class TaskList {

  public currentPage: number = 0;
  public pageSize: number = 10;
  public totalItems: number;

  public succesfullRequested: boolean = false;

  private _eventAggregator: EventAggregator;
  private _managementApiService: IManagementApiService;
  private _router: Router;
  private _notificationService: NotificationService;
  private _authenticationService: IAuthenticationService;

  private _subscriptions: Array<Subscription>;
  private _userTasks: Array<IUserTaskWithProcessModel>;
  private _getUserTasksIntervalId: number;
  private _getUserTasks: () => Promise<Array<IUserTaskWithProcessModel>>;

  constructor(eventAggregator: EventAggregator,
              managementApiService: IManagementApiService,
              router: Router,
              notificationService: NotificationService,
              authenticationService: IAuthenticationService,
  ) {
    this._eventAggregator = eventAggregator;
    this._managementApiService = managementApiService;
    this._router = router;
    this._notificationService = notificationService;
    this._authenticationService = authenticationService;
  }

  private async updateUserTasks(): Promise<void> {
    try {
      this._userTasks = await this._getUserTasks();
      this.succesfullRequested = true;
    } catch (error) {
      if (isError(error, UnauthorizedError)) {
        this._notificationService.showNotification(NotificationType.ERROR, 'You dont have permission to view the task list.');
      } else {
        this._notificationService.showNotification(NotificationType.ERROR, `Error receiving task list: ${error.message}`);
      }
    }

    this.totalItems = this.tasks.length;
  }

  public activate(routeParameters: ITaskListRouteParameters): void {
    if (routeParameters.processModelId) {
      this._getUserTasks = (): Promise<Array<IUserTaskWithProcessModel>> => {
        return this._getUserTasksForProcessModel(routeParameters.processModelId);
      };
    } else if (routeParameters.correlationId) {
      this._getUserTasks = (): Promise<Array<IUserTaskWithProcessModel>> => {
        return this._getUserTasksForCorrelation(routeParameters.correlationId);
      };
    } else {
      this._getUserTasks = this._getAllUserTasks;
    }
    this.updateUserTasks();
  }

  public attached(): void {
    if (!this._getUserTasks) {
      this._getUserTasks = this._getAllUserTasks;
    }

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

  public continueUserTask(userTaskWithProcessModel: IUserTaskWithProcessModel): void {
    const userTask: UserTask = userTaskWithProcessModel.userTask;
    const processModel: ProcessModelExecution.ProcessModel = userTaskWithProcessModel.processModel;

    const processModelId: string = processModel.id;
    const userTaskId: string = userTask.id;

    this._router.navigateToRoute('task-dynamic-ui', {
      processModelId: processModelId,
      userTaskId: userTaskId,
    });
  }

  public get shownTasks(): Array<IUserTaskWithProcessModel> {
    return this.tasks.slice((this.currentPage - 1) * this.pageSize, this.pageSize * this.currentPage);
  }

  public get tasks(): Array<IUserTaskWithProcessModel> {
    if (this._userTasks === undefined) {
      return [];
    }
    // TODO: Reimplement filtering
    // return this._userTasks.filter((entry: UserTask): boolean => {
    //   return entry.state === 'wait';
    // });
    return this._userTasks;
  }

  private async _getAllUserTasks(): Promise<Array<IUserTaskWithProcessModel>> {
    const managementApiContext: ManagementContext = this._getManagementContext();

    const allProcesModels: ProcessModelExecution.ProcessModelList = await this._managementApiService.getProcessModels(managementApiContext);

    // TODO (ph): This will create 1 + n http reqeusts, where n is the number of process models in the processengine.
    const promisesForAllUserTasks: Array<Promise<Array<IUserTaskWithProcessModel>>> = allProcesModels.processModels
      .map(async(processModel: ProcessModelExecution.ProcessModel): Promise<Array<IUserTaskWithProcessModel>> => {
        try {
          const userTaskList: UserTaskList = await this._managementApiService.getUserTasksForProcessModel(managementApiContext, processModel.id);

          const userTasksAndProcessModels: Array<IUserTaskWithProcessModel> = this._addProcessModelToUserTasks(userTaskList, processModel);

          return userTasksAndProcessModels;

        } catch (error) {
          if (isError(error, NotFoundError)) {
            // the management api returns a 404 if there is no instance of a process model running.
            return Promise.resolve([]);
          }
          throw error;
        }
      });

    const userTaksListArray: Array<Array<IUserTaskWithProcessModel>> = await Promise.all(promisesForAllUserTasks);

    const flatternedUserTasks: Array<IUserTaskWithProcessModel> = [].concat(...userTaksListArray);

    return flatternedUserTasks;
  }

  private async _getUserTasksForProcessModel(processModelId: string): Promise<Array<IUserTaskWithProcessModel>> {
    const managementApiContext: ManagementContext = this._getManagementContext();

    const processModel: ProcessModelExecution.ProcessModel = await
      this
      ._managementApiService
      .getProcessModelById(managementApiContext, processModelId);

    let userTaskList: UserTaskList;
    try {
      userTaskList = await this._managementApiService.getUserTasksForProcessModel(managementApiContext, processModelId);

    } catch (error) {
      if (isError(error, NotFoundError)) {
        // the management api returns a 404 if there is no instance of a process model running.
        return Promise.resolve([]);
      }
      throw error;
    }

    const userTasksAndProcessModels: Array<IUserTaskWithProcessModel> = this._addProcessModelToUserTasks(userTaskList, processModel);

    return userTasksAndProcessModels;
  }

  private async _getUserTasksForCorrelation(correlationId: string): Promise<Array<IUserTaskWithProcessModel>> {
    const managementApiContext: ManagementContext = this._getManagementContext();

    const userTaskList: UserTaskList = await this._managementApiService.getUserTasksForCorrelation(managementApiContext, correlationId);

    const runningCorrelations: Array<Correlation> = await this._managementApiService.getAllActiveCorrelations(managementApiContext);

    const correlation: Correlation = runningCorrelations.find((otherCorrelation: Correlation) => {
      return otherCorrelation.id === correlationId;
    });

    const correlationWasNotFound: boolean = correlation === undefined || correlation === null;
    if (correlationWasNotFound) {
      throw new NotFoundError(`Not correlation found with id ${correlationId}`);
    }

    const processModelOfCorrelation: ProcessModelExecution.ProcessModel = await
      this
      ._managementApiService
      .getProcessModelById(managementApiContext, correlation.processModelId);

    const userTasksAndProcessModels: Array<IUserTaskWithProcessModel> = this._addProcessModelToUserTasks(userTaskList, processModelOfCorrelation);

    return userTasksAndProcessModels;
  }

  private _addProcessModelToUserTasks(
    userTaskList: UserTaskList,
    processModel: ProcessModelExecution.ProcessModel,
  ): Array<IUserTaskWithProcessModel> {

    const userTasksAndProcessModels: Array<IUserTaskWithProcessModel> = userTaskList.userTasks
      .map((userTask: UserTask): IUserTaskWithProcessModel => {
        return {
          processModel,
          userTask,
        };
      });

    return userTasksAndProcessModels;
  }

  // TODO: Move this method into a service.
  private _getManagementContext(): ManagementContext {
    const accessToken: string = this._authenticationService.getAccessToken();
    const context: ManagementContext = {
      identity: accessToken,
    };

    return context;
  }
}
