import {isError, NotFoundError, UnauthorizedError} from '@essential-projects/errors_ts';
import {IIdentity} from '@essential-projects/iam_contracts';
import {
  Correlation,
  IManagementApi,
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

@inject(EventAggregator, 'ManagementApiClientService', Router, 'NotificationService', 'AuthenticationService')
export class TaskList {

  public currentPage: number = 0;
  public pageSize: number = 10;
  public totalItems: number;

  public successfullyRequested: boolean = false;

  private _eventAggregator: EventAggregator;
  private _managementApiService: IManagementApi;
  private _router: Router;
  private _notificationService: NotificationService;
  private _authenticationService: IAuthenticationService;

  private _subscriptions: Array<Subscription>;
  private _userTasks: Array<IUserTaskWithProcessModel>;
  private _getUserTasksIntervalId: number;
  private _getUserTasks: () => Promise<Array<IUserTaskWithProcessModel>>;

  constructor(eventAggregator: EventAggregator,
              managementApiService: IManagementApi,
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

  public initializeTaskList(routeParameters: ITaskListRouteParameters): void {
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

    this._updateUserTasks();
  }

  public attached(): void {
    const getUserTasksIsUndefined: boolean = this._getUserTasks === undefined;

    if (getUserTasksIsUndefined) {
      this._getUserTasks = this._getAllUserTasks;
      this._updateUserTasks();
    }

    this._getUserTasksIntervalId = window.setInterval(() => {
      this._updateUserTasks();
    }, environment.processengine.dashboardPollingIntervalInMs);

    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this._updateUserTasks();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this._updateUserTasks();
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
    const {userTask, processModel} = userTaskWithProcessModel;

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
    const identity: IIdentity = this._getIdentity();

    const allProcessModels: ProcessModelExecution.ProcessModelList = await this._managementApiService.getProcessModels(identity);

    // TODO (ph): This will create 1 + n http reqeusts, where n is the number of process models in the processengine.
    const promisesForAllUserTasks: Array<Promise<Array<IUserTaskWithProcessModel>>> = allProcessModels.processModels
      .map(async(processModel: ProcessModelExecution.ProcessModel): Promise<Array<IUserTaskWithProcessModel>> => {
        try {
          const userTaskList: UserTaskList = await this._managementApiService.getUserTasksForProcessModel(identity, processModel.id);

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

    const userTaskListArray: Array<Array<IUserTaskWithProcessModel>> = await Promise.all(promisesForAllUserTasks);

    const flattenedUserTasks: Array<IUserTaskWithProcessModel> = [].concat(...userTaskListArray);

    return flattenedUserTasks;
  }

  private async _getUserTasksForProcessModel(processModelId: string): Promise<Array<IUserTaskWithProcessModel>> {
    const identity: IIdentity = this._getIdentity();

    const processModel: ProcessModelExecution.ProcessModel = await
      this
      ._managementApiService
      .getProcessModelById(identity, processModelId);

    let userTaskList: UserTaskList;
    try {
      userTaskList = await this._managementApiService.getUserTasksForProcessModel(identity, processModelId);

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
    const identity: IIdentity = this._getIdentity();

    const userTaskList: UserTaskList = await this._managementApiService.getUserTasksForCorrelation(identity, correlationId);

    const runningCorrelations: Array<Correlation> = await this._managementApiService.getActiveCorrelations(identity);

    const correlation: Correlation = runningCorrelations.find((otherCorrelation: Correlation) => {
      return otherCorrelation.id === correlationId;
    });

    const correlationWasNotFound: boolean = correlation === undefined || correlation === null;
    if (correlationWasNotFound) {
      throw new NotFoundError(`No correlation found with id ${correlationId}.`);
    }

    // TODO: This needs to be refactored so that the correct ProcessModel will be used depending on the user task
    const processModelOfCorrelation: ProcessModelExecution.ProcessModel = await
      this
      ._managementApiService
      .getProcessModelById(identity, correlation.processModels[0].name);

    const userTasksAndProcessModels: Array<IUserTaskWithProcessModel> = this._addProcessModelToUserTasks(userTaskList, processModelOfCorrelation);

    return userTasksAndProcessModels;
  }

  private _addProcessModelToUserTasks(
    userTaskList: UserTaskList,
    processModel: ProcessModelExecution.ProcessModel,
  ): Array<IUserTaskWithProcessModel> {

    const userTasksAndProcessModels: Array<IUserTaskWithProcessModel> = userTaskList.userTasks
      .map((userTask: UserTask): IUserTaskWithProcessModel => ({
          processModel: processModel,
          userTask: userTask,
      }));

    return userTasksAndProcessModels;
  }

  // TODO: Move this method into a service.
  private _getIdentity(): IIdentity {
    const accessToken: string = this._authenticationService.getAccessToken();
    const identity: IIdentity = {
      token: accessToken,
    };

    return identity;
  }

  private async _updateUserTasks(): Promise<void> {
    try {

      this._userTasks = await this._getUserTasks();
      this.successfullyRequested = true;

    } catch (error) {

      if (isError(error, UnauthorizedError)) {

        this._notificationService.showNotification(NotificationType.ERROR, 'You don\'t have permission to view the task list.');
        this._router.navigateToRoute('start-page');

      } else {

        this._notificationService.showNotification(NotificationType.ERROR, `Error receiving task list: ${error.message}`);

      }
    }

    this.totalItems = this.tasks.length;
  }
}
