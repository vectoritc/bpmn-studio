// TODO: Refactor the Process Definition List entirely
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
  IFileInfo,
  IProcessEngineService,
  NotificationType,
} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

@inject(EventAggregator, 'BpmnStudioClient', 'FileContent', 'NotificationService', Router, 'ProcessEngineService')
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
  private _newDiagramXml: string;

  @bindable()
  public selectedFiles: FileList;
  public fileInput: HTMLInputElement;
  public showOverwriteDialog: boolean;
  public showDiagramNameDialog: boolean;

  // TODO: Put this into an interface IBpmnDiagram and into the contracts folder
  public newDiagramName: string;

  @observable public currentPage: number = 1;
  public pageSize: number = 10;
  public totalItems: number;
  public showSolutionExplorer: boolean = false;

  constructor(eventAggregator: EventAggregator,
              bpmnStudioClient: BpmnStudioClient,
              fileInfo: IFileInfo,
              notificationService: NotificationService,
              router: Router,
              processEngineService: IProcessEngineService) {
    this._processEngineService = processEngineService;
    this._eventAggregator = eventAggregator;
    this._bpmnStudioClient = bpmnStudioClient;
    this._router = router;
    this._notificationService = notificationService;

    const fileHasContent: boolean = fileInfo.content !== undefined;

    if (fileHasContent) {
      // This Regex cuts out the filename from the filepath.
      const filename: string = /[^\\/:*?"<>|\r\n]+$/.exec(fileInfo.path)[0];
      const xml: string = fileInfo.content;

      fileInfo.content = undefined;

      this._importXmlFromFile(filename, xml);
    }

    this._refreshProcesslist();
    this._eventAggregator.publish(environment.events.refreshProcessDefs);

    this._fileReader.onload = async(fileInformations: any): Promise<void> => {
      const xml: string = fileInformations.target.result;
      const filename: string = this.selectedFiles[0].name;

      this.fileInput.value = '';

      this._importXmlFromFile(filename, xml);
    };
  }

  // TODO: This needs to be refactored into an importService;
  //       Therefore it is not very usefuly to engineer too much now.
  public async importNewDiagram(): Promise<void> {
    //  Check is name is empty; do not close dialog if it is {{{ //
    const nameIsEmpty: boolean = this._diagramNameIsEmpty();
    if (nameIsEmpty) {
      this._notificationService
        .showNotification(NotificationType.ERROR, 'Name can not be empty. Please specify a name.');
      return;
    }
    //  }}} Check is name is empty; do not close dialog if it is //

    const diagramNameNotUnique: boolean = ! await this._diagramNameIsUnique();

    //  Close the dialog and check for uniqueness {{{ //
    // close the previous dialog, we do not need it for the next steps.
    this.showDiagramNameDialog = false;

    if (diagramNameNotUnique) {
      this.showOverwriteDialog = true;
      this._notificationService
        .showNotification(NotificationType.WARNING, 'Name is already taken.');
      return;
    } else {
      this._saveNewDiagram();
      return;
    }
    //  }}} Close the dialog and check for uniqueness //
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
    // TODO: Check if IPagination is needed, why can't this be a simple list.
    const processes: IPagination<IProcessDefEntity> = await this._bpmnStudioClient.getProcessDefList();
    const processExists: boolean = processes.data.some((process: IProcessDefEntity) => {
          return process.name === processDefName;
    });
    return !processExists;
  }

  public selectedFilesChanged(): void {
    if (this.selectedFiles !== undefined && this.selectedFiles.length > 0) {
      this._fileReader.readAsText(this.selectedFiles[0]);
    }
  }

  public currentPageChanged(newValue: number, oldValue: number): void {
    if (oldValue !== undefined && oldValue !== null) {
      this._refreshProcesslist();
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
      this._eventAggregator.publish(environment.events.refreshProcessDefs);
      // tslint:disable-next-line
    }, environment.processengine.poolingInterval);

    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this._refreshProcesslist();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this._refreshProcesslist();
      }),
    ];
  }

  public detached(): void {
    clearInterval(this._getProcessesIntervalId);
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
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

  private _importXmlFromFile(filename: string, xml: string): void {
    this._newDiagramXml = xml;
    this.newDiagramName = filename.substring(0, filename.lastIndexOf('.'));

    this.showDiagramNameDialog = true;
  }

  private _refreshProcesslist(): void {
    this.getProcessesFromService();
  }

  private async _saveNewDiagram(): Promise<void> {
    try {
      const response: any = await this._processEngineService.createProcessfromXML(this._newDiagramXml, this.newDiagramName);
      this._refreshProcesslist();
      this._eventAggregator.publish(environment.events.refreshProcessDefs);
      this._notificationService.showNotification(NotificationType.SUCCESS, 'Diagram successfully imported!');
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, `Error while importing file: ${error.message}`);
    }
    this.newDiagramName = undefined;
    this._newDiagramXml = undefined;
  }

  private _diagramNameIsEmpty(): boolean {
    return (this.newDiagramName === '' || this.newDiagramName === undefined);
  }

  private async _diagramNameIsUnique(): Promise<boolean> {
    const isNameUnique: boolean = await this.checkIfProcessDefNameUnique(this.newDiagramName);
    return isNameUnique;
  }

}
