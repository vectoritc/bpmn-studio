import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';

import {IIdentity} from '@essential-projects/iam_contracts';
import {ManagementApiClientService} from '@process-engine/management_api_client';
import {UserTask, UserTaskList, UserTaskResult} from '@process-engine/management_api_contracts';

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

  public finishUserTask(identity: IIdentity,
                        processInstanceId: string,
                        correlationId: string,
                        userTaskInstanceId: string,
                        userTaskResult: UserTaskResult): void {

    this._managementApiClient.finishUserTask(identity,
                                            processInstanceId,
                                            correlationId,
                                            userTaskInstanceId,
                                            userTaskResult);
  }

  public async getUserTaskByCorrelationId(identity: IIdentity,
                                          userTaskId: string,
                                          correlationId: string): Promise<UserTask> {

    const userTaskList: UserTaskList = await this._managementApiClient.getUserTasksForCorrelation(identity, correlationId);

    return  userTaskList.userTasks.find((userTask: UserTask) => {
      return userTask.id === userTaskId;
    });
  }

  public async getUserTaskByProcessModelId(identity: IIdentity,
                                           userTaskId: string,
                                           processModelId: string): Promise<UserTask> {

    const userTaskList: UserTaskList = await this._managementApiClient.getUserTasksForProcessModel(identity, processModelId);

    return  userTaskList.userTasks.find((userTask: UserTask) => {
      return userTask.id === userTaskId;
    });
  }
}
