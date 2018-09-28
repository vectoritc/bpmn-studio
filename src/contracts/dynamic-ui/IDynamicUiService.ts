import {IIdentity} from '@essential-projects/iam_contracts';
import {UserTask, UserTaskResult} from '@process-engine/management_api_contracts';

export interface IDynamicUiService {
  finishUserTask(identity: IIdentity,
                 processModelId: string,
                 correlationId: string,
                 userTaskId: string,
                 userTaskResult: UserTaskResult): void;

  getUserTaskByCorrelationId(identity: IIdentity,
                             userTaskId: string,
                             correlationId: string): Promise<UserTask>;

  getUserTaskByProcessModelId(identity: IIdentity,
                              userTaskId: string,
                              processModelId: string): Promise<UserTask>;
}
