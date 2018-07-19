import {IProcessDefEntity, IProcessEntity, IUserTaskEntity} from '@process-engine/process_engine_contracts';
import {IIdentity} from '../../../node_modules/@process-engine/bpmn-studio_client';
import {IPagination} from './IPagination';
import {IResponse} from './IResponse';

export interface IProcessEngineService {
  getProcessDefById(processDefId: string): Promise<IProcessDefEntity>;
  updateProcessDef(processDef: IProcessDefEntity, xml: string): Promise<IResponse>;
  createProcessfromXML(xml: string, name?: string): Promise<IProcessDefEntity>;
  deleteProcessDef(processId: string): Promise<void>;
  getIdentity(): Promise<IIdentity>;
  getProcesses(): Promise<IPagination<IProcessEntity>>;
  getProcessesByProcessDefId(processDefId: string): Promise<IPagination<IProcessEntity>>;
  getProcessById(processId: string): Promise<IProcessEntity>;
  getUserTasks(limit: number, offset: number): Promise<IPagination<IUserTaskEntity>>;
  getUserTasksByProcessDefId(processDefId: string): Promise<IPagination<IUserTaskEntity>>;
  getUserTasksByProcessId(processId: string): Promise<IPagination<IUserTaskEntity>>;
  getUserTaskById(userTaskId: string): Promise<IUserTaskEntity>;
}
