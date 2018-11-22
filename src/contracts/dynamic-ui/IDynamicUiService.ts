import {IIdentity} from '@essential-projects/iam_contracts';
import {ManualTask, UserTask, UserTaskResult} from '@process-engine/management_api_contracts';

export interface IDynamicUiService {
  finishUserTask(identity: IIdentity,
                 processInstanceId: string,
                 correlationId: string,
                 userTaskInstanceId: string,
                 userTaskResult: UserTaskResult): void;

  getUserTaskByCorrelationId(identity: IIdentity,
                             userTaskId: string,
                             correlationId: string): Promise<UserTask>;

  getUserTaskByProcessModelId(identity: IIdentity,
                              userTaskId: string,
                              processModelId: string): Promise<UserTask>;

  finishManualTask(identity: IIdentity,
                   processInstanceId: string,
                   correlationId: string,
                   manualTaskInstanceId: string): void;

  getManualTaskByCorrelationId(identity: IIdentity,
                               manualTaskId: string,
                               correlationId: string): Promise<ManualTask>;

  getManualTaskByProcessModelId(identity: IIdentity,
                                manualTaskId: string,
                                processModelId: string): Promise<ManualTask>;
}
