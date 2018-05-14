// TODO: Refector the Process Definition List entirely
//       The big issue with this file is: it is the main
//       anchor for the studio; but it is not aaparent why.
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, inject, observable} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {
  BpmnStudioClient,
  IPagination,
  IProcessDefEntity,
  IUserTaskConfig,
} from '@process-engine/bpmn-studio_client';

import {
  AuthenticationStateEvent,
  IProcessEngineService,
  NotificationType,
} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

@inject(EventAggregator, 'BpmnStudioClient', Router, 'ProcessEngineService', 'NotificationService')
export class ProcessDefList {
  private _processEngineService: IProcessEngineService;
  private _bpmnStudioClient: BpmnStudioClient;
  private _eventAggregator: EventAggregator;
  private _router: Router;
  private _notificationService: NotificationService;

  private _processes: IPagination<IProcessDefEntity>;
  private _subscriptions: Array<Subscription>;
  private _fileReader: FileReader = new FileReader();
  private _offset: number;
  private _getProcessesIntervalId: number;

  @bindable()
  public selectedFiles: FileList;
  public fileInput: HTMLInputElement;
  public showOverwriteDialog: boolean;
  public showDiagramNameDialog: boolean;
  // TODO: Put this into an interface IBpmnDiagramm and into the contracts folder
  public newDiagramName: string;
  private _newDiagramXml: string;

  @observable public currentPage: number = 1;
  public pageSize: number = 10;
  public totalItems: number;
  public showSolutionExplorer: boolean = false;

  constructor(eventAggregator: EventAggregator,
              bpmnStudioClient: BpmnStudioClient,
              router: Router,
              processEngineService: IProcessEngineService,
              notificationService: NotificationService) {
    this._processEngineService = processEngineService;
    this._eventAggregator = eventAggregator;
    this._bpmnStudioClient = bpmnStudioClient;
    this._router = router;
    this._notificationService = notificationService;

    this.refreshProcesslist();

    this._fileReader.onload = async(fileInformations: any): Promise<void> => {
      this._newDiagramXml = fileInformations.target.result;
      const fileName: string = this.selectedFiles[0].name;
      this.newDiagramName = fileName.substring(0, fileName.lastIndexOf('.'));
      this.showDiagramNameDialog  = true;
      this.fileInput.value = '';
    };
  }

  public async importNewDiagram(): Promise<void> {
    try{
      const isDiagramNameUnique: boolean = await this._isDiagramNameUniqueOrEmpty();

      this.showDiagramNameDialog = false;

      if (!isDiagramNameUnique) {
        this.showOverwriteDialog = true;
        return;
      }

      this._saveNewDiagram();
    } catch(error) {
      this._notificationService.showNotification(NotificationType.ERROR, 'Name can not be empty');
      return;
    }
  }

  private async _saveNewDiagram(): Promise<void> {
    try {
      const response: any = await this._processEngineService.createProcessfromXML(this._newDiagramXml, this.newDiagramName);
      this.refreshProcesslist();
      this._notificationService.showNotification(NotificationType.SUCCESS, 'Diagram successfully imported!');
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, `Error while importing file: ${error.message}`);
    }
    this.newDiagramName = undefined;
    this._newDiagramXml = undefined;
  }

  private async _isDiagramNameUniqueOrEmpty(): Promise<boolean> {
    if (this.newDiagramName === '' || this.newDiagramName === undefined) {
      throw new Error('Name can not be empty');
    }

    const isNameUnique: boolean = await this.checkIfProcessDefNameUnique(this.newDiagramName);
    return isNameUnique;
  }

  public cancelImport(): void {
    this.newDiagramName = undefined;
    this._newDiagramXml = undefined;
    this.showDiagramNameDialog = false;
  }

  public overwriteDiagram(): void {
    this._saveNewDiagram();
    this.showOverwriteDialog = false;
  }

  public async changeNewDiagramName(): Promise<void> {
    this.showOverwriteDialog = false;
    this.showDiagramNameDialog = true;
  }

  public async checkIfProcessDefNameUnique(processDefName: string): Promise<boolean> {
    const processes: IPagination<IProcessDefEntity> = await this._bpmnStudioClient.getProcessDefList();
    const existingProcess: IProcessDefEntity = processes.data.find((process: IProcessDefEntity) => {
      return process.name === processDefName;
    });

    if (existingProcess === undefined) {
      return true;
    }

    return false;
  }

  public selectedFilesChanged(): void {
    if (this.selectedFiles !== undefined && this.selectedFiles.length > 0) {
      this._fileReader.readAsText(this.selectedFiles[0]);
    }
  }

  public currentPageChanged(newValue: number, oldValue: number): void {
    if (oldValue !== undefined && oldValue !== null) {
      this.refreshProcesslist();
    }
  }

  public async getProcessesFromService(): Promise<void> {
    const processCount: IPagination<IProcessDefEntity> = await this._bpmnStudioClient.getProcessDefList();
    this.totalItems = processCount.count;
    this._processes = await this._bpmnStudioClient.getProcessDefList(this.pageSize, this.pageSize * (this.currentPage - 1));
  }

  public attached(): void {
    this._getProcessesIntervalId = window.setInterval(() => {
      this.getProcessesFromService();
      // tslint:disable-next-line
    }, environment.processengine.poolingInterval);

    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this.refreshProcesslist();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this.refreshProcesslist();
      }),
    ];
  }

  public detached(): void {
    clearInterval(this._getProcessesIntervalId);
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  private refreshProcesslist(): void {
    this.getProcessesFromService();
  }

  public get processes(): Array<IProcessDefEntity> {
    if (this._processes === undefined) {
      return [];
    }
    return this._processes.data;
  }

  public async createProcess(): Promise<void> {
    const processesDefList: IPagination<IProcessDefEntity> = await this._bpmnStudioClient.getProcessDefList();
    const processes: Array<IProcessDefEntity> = processesDefList.data;

    const processId: string = processes.find((process: IProcessDefEntity) => {
      return process.key === 'CreateProcessDef';
    }).id;

    this._router.navigate(`processdef/${processId}/start`);
  }

  public startProcess(processId: string): void {
    this._router.navigate(`processdef/${processId}/start`);
  }

  public showDetails(processId: string): void {
    this._router.navigate(`processdef/${processId}/detail`);
  }

  public toggleSolutionExplorer(): void {
    this.showSolutionExplorer = !this.showSolutionExplorer;
  }

}
