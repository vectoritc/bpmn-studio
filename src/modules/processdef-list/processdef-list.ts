import {BpmnStudioClient, IPagination, IProcessDefEntity, IUserTaskConfig} from '@process-engine/bpmn-studio_client';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, inject, observable} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {AuthenticationStateEvent, IProcessEngineService, NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

@inject(EventAggregator, 'BpmnStudioClient', Router, 'ProcessEngineService', 'NotificationService')
export class ProcessDefList {
  private processEngineService: IProcessEngineService;
  private bpmnStudioClient: BpmnStudioClient;
  private eventAggregator: EventAggregator;
  private router: Router;
  private notificationService: NotificationService;

  private offset: number;
  private _processes: IPagination<IProcessDefEntity>;
  private getProcessesIntervalId: number;
  private subscriptions: Array<Subscription>;

  @bindable()
  public selectedFiles: FileList;
  public fileInput: HTMLInputElement;
  private reader: FileReader = new FileReader();
  public diagrammToOverride: any;
  public diagrammToImport: any;

  @observable public currentPage: number = 1;
  public pageSize: number = 10;
  public totalItems: number;
  public solutionExplorerIsShown: boolean = false;

  constructor(eventAggregator: EventAggregator, bpmnStudioClient: BpmnStudioClient, router: Router, processEngineService: IProcessEngineService,
              notificationService: NotificationService) {
    this.processEngineService = processEngineService;
    this.eventAggregator = eventAggregator;
    this.bpmnStudioClient = bpmnStudioClient;
    this.router = router;
    this.notificationService = notificationService;

    this.refreshProcesslist();
    this.reader.onload = async(fileInformations: any): Promise<void> => {
      const xml: string = fileInformations.target.result;
      const processId: string = this._getProcessIdFromXml(xml);
      this.diagrammToImport = {name: processId, xml: xml};
    };
  }

  private async _importProcess(name: string, xml: string): Promise<void> {
    try {
      const response: any = await this.processEngineService.createProcessfromXML(name, xml);
      this.refreshProcesslist();
      this.notificationService.showNotification(NotificationType.SUCCESS, 'Diagram successfully imported!');
    } catch (error) {
      this.notificationService.showNotification(NotificationType.ERROR, `Error while importing file: ${error.message}`);
    }
  }

  public async checkDiagrammName(): Promise<void> {
    const diagramm: any = this.diagrammToImport;
    if (diagramm.name === '' || diagramm.name === undefined) {
      this.notificationService.showNotification(NotificationType.ERROR, 'Name can not be empty');
      this.diagrammToImport.name = this._getProcessIdFromXml(diagramm.xml);
      return;
    }
    this.diagrammToImport = undefined;

    const isNameUnique: boolean = await this.checkIfProcessDefNameUnique(diagramm.name);
    if (!isNameUnique) {
      this.diagrammToOverride = {name: diagramm.name, xml: diagramm.xml};
      return;
    }

    this._importProcess(diagramm.name, diagramm.xml);
  }

  public cancelImport(): void {
    this.diagrammToImport = undefined;
  }

  private _getProcessIdFromXml(xml: string): string {
    let processId: RegExpExecArray = /<bpmn:process id="[^"]+" name="(.*?)"/.exec(xml);
    if (processId === null) {
      processId = /<bpmn:process id="(.*?)"/.exec(xml);
    }

    return processId[1];
  }

  public overrideDiagramm(diagramm: any): void {
    this._importProcess(diagramm.name, diagramm.xml);
    this.diagrammToOverride = undefined;
  }

  public cancelOverride(): void {
    this.diagrammToOverride = undefined;
  }

  public async changeName(diagramm: any): Promise<void> {
    this.diagrammToOverride = undefined;
    this.diagrammToImport = {name: diagramm.name, xml: diagramm.xml};
  }

  public async checkIfProcessDefNameUnique(processDefName: string): Promise<boolean> {
    const processes: IPagination<IProcessDefEntity> = await this.bpmnStudioClient.getProcessDefList();
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
      this.reader.readAsText(this.selectedFiles[0]);
    }
  }

  public currentPageChanged(newValue: number, oldValue: number): void {
    if (oldValue !== undefined && oldValue !== null) {
      this.refreshProcesslist();
    }
  }

  public async getProcessesFromService(): Promise<void> {
    const processCount: IPagination<IProcessDefEntity> = await this.bpmnStudioClient.getProcessDefList();
    this.totalItems = processCount.count;
    this._processes = await this.bpmnStudioClient.getProcessDefList(this.pageSize, this.pageSize * (this.currentPage - 1));
  }

  public attached(): void {
    this.getProcessesIntervalId = window.setInterval(() => {
      this.getProcessesFromService();
      // tslint:disable-next-line
    }, environment.processengine.poolingInterval);

    this.subscriptions = [
      this.eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this.refreshProcesslist();
      }),
      this.eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this.refreshProcesslist();
      }),
    ];
  }

  public detached(): void {
    clearInterval(this.getProcessesIntervalId);
    for (const subscription of this.subscriptions) {
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
    const processesDefList: IPagination<IProcessDefEntity> = await this.bpmnStudioClient.getProcessDefList();
    const processes: Array<IProcessDefEntity> = processesDefList.data;

    const processId: string = processes.find((process: IProcessDefEntity) => {
      return process.key === 'CreateProcessDef';
    }).id;

    this.router.navigate(`processdef/${processId}/start`);
  }

  public startProcess(processId: string): void {
    this.router.navigate(`processdef/${processId}/start`);
  }

  public showDetails(processId: string): void {
    this.router.navigate(`processdef/${processId}/detail`);
  }

  public toggleSolutionExplorer(): void {
    this.solutionExplorerIsShown = !this.solutionExplorerIsShown;
  }

}
