import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {
  ForbiddenError,
  isError,
  NotFoundError,
  UnauthorizedError,
} from '@essential-projects/errors_ts';
import {
  IManagementApiService,
  ManagementContext,
  ProcessModelExecution,
  UserTask,
  UserTaskList,
} from '@process-engine/management_api_contracts';

import {
  IAuthenticationService,
  NotificationType,
} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

interface IUserTaskWithProcessModel {
  userTask: UserTask;
  processModel: ProcessModelExecution.ProcessModel;
}

@inject('ManagementApiClientService', 'NotificationService', 'AuthenticationService', Router)
export class Dashboard {

  public showTaskList: boolean = false;
  public showProcessList: boolean = false;
  // TODO: Refactor this into a dashboard config in the environment.
  // https://github.com/process-engine/bpmn-studio/issues/798
  public currentPage: number = 0;
  public pageSize: number = 10;
  public totalItems: number;
  public successfullyRequested: boolean = false;

  private _managementApiService: IManagementApiService;
  private _notificationService: NotificationService;
  private _authenticationService: IAuthenticationService;
  private _router: Router;
  private _userTasks: Array<IUserTaskWithProcessModel>;
  private _getUserTasksIntervalId: number;
  private _getUserTasks: () => Promise<Array<IUserTaskWithProcessModel>>;

  constructor(managementApiService: IManagementApiService,
              notificationService: NotificationService,
              authenticationService: IAuthenticationService,
              router: Router) {

    this._managementApiService = managementApiService;
    this._notificationService = notificationService;
    this._authenticationService = authenticationService;
    this._router = router;
  }

  public async canActivate(): Promise<boolean> {
    const managementContext: ManagementContext = this._getManagementContext();

    const hasClaimsForTaskList: boolean = await this._hasClaimsForTaskList(managementContext);
    const hasClaimsForProcessList: boolean = await this._hasClaimsForProcessList(managementContext);

    if (!hasClaimsForProcessList && !hasClaimsForTaskList) {
      this._notificationService.showNotification(NotificationType.ERROR, 'You don\'t have the permission to use the dashboard features.');
      this._router.navigateToRoute('start-page');

      return false;
    }

    this.showTaskList = hasClaimsForTaskList;
    this.showProcessList = hasClaimsForProcessList;

    return true;
  }

  public async activate(): Promise<void> {
    this._getUserTasks = this._getAllUserTasks;
    this._updateUserTasks();
  }

  public attached(): void {
    this._getUserTasksIntervalId = window.setInterval(() => {
      this._updateUserTasks();
    }, environment.processengine.processModelPollingIntervalInMs);
  }

  public detached(): void {
    clearInterval(this._getUserTasksIntervalId);
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

  public continueUserTask(userTaskWithProcessModel: IUserTaskWithProcessModel): void {
    const {userTask, processModel} = userTaskWithProcessModel;

    const processModelId: string = processModel.id;
    const userTaskId: string = userTask.id;

    this._router.navigateToRoute('task-dynamic-ui', {
      processModelId: processModelId,
      userTaskId: userTaskId,
    });
  }

  private async _hasClaimsForTaskList(managementContext: ManagementContext): Promise<boolean> {
    try {
      // TODO: Refactor; this is not how we want to do our claim checks.
      // Talk to Sebastian or Christoph first.

      await this._managementApiService.getProcessModels(managementContext);
      await this._managementApiService.getAllActiveCorrelations(managementContext);

    } catch (error) {
      const errorIsForbiddenError: boolean = isError(error, ForbiddenError);
      const errorIsUnauthorizedError: boolean = isError(error, UnauthorizedError);

      if (errorIsForbiddenError || errorIsUnauthorizedError) {
        return false;
      }
    }

    return true;
  }

  private async _hasClaimsForProcessList(managementContext: ManagementContext): Promise<boolean> {
    try {

      await this._managementApiService.getAllActiveCorrelations(managementContext);

    } catch (error) {
      const errorIsForbiddenError: boolean = isError(error, ForbiddenError);
      const errorIsUnauthorizedError: boolean = isError(error, UnauthorizedError);

      if (errorIsForbiddenError || errorIsUnauthorizedError) {
        return false;
      }
    }

    return true;
  }

  // TODO: Move this method into a service.
  private _getManagementContext(): ManagementContext {
    const accessToken: string = this._authenticationService.getAccessToken();
    const context: ManagementContext = {
      identity: accessToken,
    };

    return context;
  }

  private async _getAllUserTasks(): Promise<Array<IUserTaskWithProcessModel>> {
    const managementApiContext: ManagementContext = this._getManagementContext();

    const allProcessModels: ProcessModelExecution.ProcessModelList = await this._managementApiService.getProcessModels(managementApiContext);

    // TODO (ph): This will create 1 + n http requests, where n is the number of process models in the processengine.
    const promisesForAllUserTasks: Array<Promise<Array<IUserTaskWithProcessModel>>> = allProcessModels.processModels
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

    const userTaskListArray: Array<Array<IUserTaskWithProcessModel>> = await Promise.all(promisesForAllUserTasks);

    const flattenedUserTasks: Array<IUserTaskWithProcessModel> = [].concat(...userTaskListArray);

    return flattenedUserTasks;
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

  private async _updateUserTasks(): Promise<void> {
    try {
      this._userTasks = await this._getUserTasks();
      this.successfullyRequested = true;
    } catch (error) {
      if (isError(error, UnauthorizedError)) {
        this._notificationService.showNotification(NotificationType.ERROR, 'You don\'t have the permission to view the task list.');
        this._router.navigateToRoute('start-page');
      } else {
        this._notificationService.showNotification(NotificationType.ERROR, `Error receiving task list: ${error.message}`);
      }
    }

    this.totalItems = this.tasks.length;
  }

}
