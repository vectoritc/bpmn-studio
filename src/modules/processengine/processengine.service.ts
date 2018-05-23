import {IProcessDefEntity, IUserTaskEntity} from '@process-engine/process_engine_contracts';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {IFileInfo, IPagination, IProcessEngineRepository, IProcessEngineService, IProcessEntity, NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from './../notification/notification.service';

@inject('ProcessEngineRepository', 'FileContent', 'NotificationService', EventAggregator)
export class ProcessEngineService implements IProcessEngineService {

  private repository: IProcessEngineRepository;
  private fileInfo: IFileInfo;
  private notificationService: NotificationService;
  private _eventAggregator: EventAggregator;

  constructor(repository: IProcessEngineRepository, fileInfo: IFileInfo, notificationService: NotificationService, eventAggregator: EventAggregator) {
    this.repository = repository;
    this.fileInfo = fileInfo;
    this.notificationService = notificationService;
    this._eventAggregator = eventAggregator;
    if (this.fileInfo.content !== undefined) {
      this.createAndPublish();
    }
  }

  private async createAndPublish(): Promise<void> {
    try {
      await this.createProcessfromXML(this.fileInfo.content);
      this._eventAggregator.publish(environment.events.refreshProcessDefs);
      this.notificationService.showNotification(NotificationType.SUCCESS, 'Diagram successfully imported!');
    } catch (error) {
      this.notificationService.showNotification(NotificationType.ERROR,  `Error while importing file: ${error.message}`);
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

  public createProcessfromXML(xml: string, name?: string): Promise<any> {
    return this.repository.createProcessfromXML(xml, name);
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
