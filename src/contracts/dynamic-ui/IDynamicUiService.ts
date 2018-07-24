import {ManagementContext, UserTask, UserTaskResult} from '@process-engine/management_api_contracts';

export interface IDynamicUiService {
  finishUserTask(managementContext: ManagementContext,
                 processModelKey: string,
                 correlationId: string,
                 userTaskId: string,
                 userTaskResult: UserTaskResult): void;

  getUserTaskFromCorrelationById(managementContext: ManagementContext,
                                 userTaskId: string,
                                 correlationId: string): Promise<UserTask>;

  getUserTaskFromProcessDefById(managementContext: ManagementContext,
                                userTaskId: string,
                                processDefId: string): Promise<UserTask>;
}
