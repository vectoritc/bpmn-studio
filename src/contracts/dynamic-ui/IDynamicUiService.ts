import {ManagementContext, UserTask, UserTaskResult} from '@process-engine/management_api_contracts';

export interface IDynamicUiService {
  finishUserTask(managementContext: ManagementContext,
                 processModelKey: string,
                 correlationId: string,
                 userTaskId: string,
                 userTaskResult: UserTaskResult): void;

  getUserTaskByCorrelationId(managementContext: ManagementContext,
                             userTaskId: string,
                             correlationId: string): Promise<UserTask>;

  getUserTaskByProcessModelId(managementContext: ManagementContext,
                              userTaskId: string,
                              processModelId: string): Promise<UserTask>;
}
