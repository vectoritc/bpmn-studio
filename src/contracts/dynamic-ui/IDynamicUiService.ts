import {UserTask, UserTaskResult} from '@process-engine/management_api_contracts';

export interface IDynamicUiService {
  sendProceedAction(processModelKey: string,  correlationId: string, userTaskId: string, userTaskResult: UserTaskResult): void;
  getUserTaskById(userTaskId: string, correlationId: string): Promise<UserTask>;
}
