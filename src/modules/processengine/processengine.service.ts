import {IProcessDefEntity, IUserTaskEntity} from '@process-engine/process_engine_contracts';
import {inject} from 'aurelia-framework';
import {IPagination, IProcessEngineRepository, IProcessEngineService, IProcessEntity} from '../../contracts';

@inject('ProcessEngineRepository', 'FileContent')
export class ProcessEngineService implements IProcessEngineService {

  private repository: IProcessEngineRepository;
  private fileInfo: any = undefined;

  constructor(repository: IProcessEngineRepository, fileInfo: any) {
    this.repository = repository;
    this.fileInfo = fileInfo;
    if (this.fileInfo !== undefined) {
      this.createProcessfromXML(this.fileInfo.content);
    }
  }

  public deleteProcessDef(processId: string): Promise<void> {
    return this.repository.deleteProcessDef(processId);
  }

  public getProcessDefById(processDefId: string): Promise<IProcessDefEntity> {
    return this.repository.getProcessDefById(processDefId);
  }

  public updateProcessDef(processDef: IProcessDefEntity, xml: string): Promise<any> {
    return this.repository.updateProcessDef(processDef, xml);
  }

  public createProcessfromXML(xml: string): Promise<any> {
    return this.repository.createProcessfromXML(xml);
  }

  public getIdentity(): Promise<any> {
    return this.repository.getIdentity();
  }

  public getUserTasks(limit: number, offset: number): Promise<IPagination<IUserTaskEntity>> {
    return this.repository.getUserTasks(limit, offset);
  }

  public getUserTaskById(userTaskId: string): Promise<IUserTaskEntity> {
    return this.repository.getUserTaskById(userTaskId);
  }

  public getUserTasksByProcessDefId(processDefId: string): Promise<IPagination<IUserTaskEntity>> {
    return this.repository.getUserTasksByProcessDefId(processDefId);
  }

  public getUserTasksByProcessId(processId: string): Promise<IPagination<IUserTaskEntity>> {
    return this.repository.getUserTasksByProcessId(processId);
  }

  public getProcesses(): Promise<IPagination<IProcessEntity>> {
    return this.repository.getProcesses();
  }

  public getProcessById(processId: string): Promise<IProcessEntity> {
    return this.repository.getProcessById(processId);
  }

  public getProcessesByProcessDefId(processDefId: string): Promise<IPagination<IProcessEntity>> {
    return this.repository.getProcessesByProcessDefId(processDefId);
  }
}
