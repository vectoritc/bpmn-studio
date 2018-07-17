import {IProcessDefEntity, IUserTaskEntity} from '@process-engine/process_engine_contracts';
import {inject} from 'aurelia-framework';
import {IErrorResponse, IIdentity, IPagination, IProcessEngineRepository, IProcessEngineService, IProcessEntity} from '../../contracts/index';

@inject('ProcessEngineRepository')
export class ProcessEngineService implements IProcessEngineService {

  private _repository: IProcessEngineRepository;

  constructor(repository: IProcessEngineRepository) {
    this._repository = repository;
  }

  public deleteProcessDef(processId: string): Promise<void> {
    return this._repository.deleteProcessDef(processId);
  }

  public getProcessDefById(processDefId: string): Promise<IProcessDefEntity> {
    return this._repository.getProcessDefById(processDefId);
  }

  public updateProcessDef(processDef: IProcessDefEntity, xml: string): Promise<Response | IErrorResponse> {
    return this._repository.updateProcessDef(processDef, xml);
  }

  public createProcessfromXML(xml: string, name?: string): Promise<IProcessDefEntity> {
    return this._repository.createProcessfromXML(xml, name);
  }

  public getIdentity(): Promise<IIdentity> {
    return this._repository.getIdentity();
  }

  public getUserTasks(limit: number, offset: number): Promise<IPagination<IUserTaskEntity>> {
    return this._repository.getUserTasks(limit, offset);
  }

  public getUserTaskById(userTaskId: string): Promise<IUserTaskEntity> {
    return this._repository.getUserTaskById(userTaskId);
  }

  public getUserTasksByProcessDefId(processDefId: string): Promise<IPagination<IUserTaskEntity>> {
    return this._repository.getUserTasksByProcessDefId(processDefId);
  }

  public getUserTasksByProcessId(processId: string): Promise<IPagination<IUserTaskEntity>> {
    return this._repository.getUserTasksByProcessId(processId);
  }

  public getProcesses(): Promise<IPagination<IProcessEntity>> {
    return this._repository.getProcesses();
  }

  public getProcessById(processId: string): Promise<IProcessEntity> {
    return this._repository.getProcessById(processId);
  }

  public getProcessesByProcessDefId(processDefId: string): Promise<IPagination<IProcessEntity>> {
    return this._repository.getProcessesByProcessDefId(processDefId);
  }
}
