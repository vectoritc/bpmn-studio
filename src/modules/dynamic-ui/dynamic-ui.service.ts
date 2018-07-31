import {ManagementApiClientService} from '@process-engine/management_api_client';
import {ManagementContext, UserTask, UserTaskList, UserTaskResult} from '@process-engine/management_api_contracts';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {IDynamicUiService} from '../../contracts';
import {AuthenticationService} from '../authentication/authentication.service';

@inject(EventAggregator, 'ManagementApiClientService', 'AuthenticationService')
export class DynamicUiService implements IDynamicUiService {

  private _eventAggregator: EventAggregator;
  private _managementApiClient: ManagementApiClientService;
  private _authenticationService: AuthenticationService;

  constructor(eventAggregator: EventAggregator,
              managmentApiClient: ManagementApiClientService,
              authenticationService: AuthenticationService) {

    this._eventAggregator = eventAggregator;
    this._managementApiClient = managmentApiClient;
    this._authenticationService = authenticationService;
  }

  public finishUserTask(managementContext: ManagementContext,
                        processModelId: string,
                        correlationId: string,
                        userTaskId: string,
                        userTaskResult: UserTaskResult): void {

    this._managementApiClient.finishUserTask(managementContext,
                                            processModelId,
                                            correlationId,
                                            userTaskId,
                                            userTaskResult);
  }

  public async getUserTaskByCorrelationId(managementContext: ManagementContext,
                                          userTaskId: string,
                                          correlationId: string): Promise<UserTask> {

    const userTaskList: UserTaskList = await this._managementApiClient.getUserTasksForCorrelation(managementContext, correlationId);

    return  userTaskList.userTasks.find((userTask: UserTask) => {
      return userTask.id === userTaskId;
    });
  }

  public async getUserTaskByProcessModelId(managementContext: ManagementContext,
                                           userTaskId: string,
                                           processModelId: string): Promise<UserTask> {

    const userTaskList: UserTaskList = await this._managementApiClient.getUserTasksForProcessModel(managementContext, processModelId);

    return  userTaskList.userTasks.find((userTask: UserTask) => {
      return userTask.id === userTaskId;
    });
  }
}
