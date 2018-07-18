import {IProcessDefEntity, IProcessEntity, IUserTaskEntity} from '@process-engine/process_engine_contracts';
import {IResponse} from '.';
import {IIdentity} from '../../../node_modules/@essential-projects/core_contracts';
import {IPagination} from './IPagination';

export interface IProcessEngineRepository {
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
