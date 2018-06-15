import {BpmnStudioClient, IUserTaskConfig} from '@process-engine/bpmn-studio_client';
import {IProcessDefEntity} from '@process-engine/process_engine_contracts';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {computedFrom, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {AuthenticationStateEvent, IProcessEngineService, NotificationType} from '../../contracts/index';
import {DynamicUiWrapper} from '../dynamic-ui-wrapper/dynamic-ui-wrapper';
import {NotificationService} from './../notification/notification.service';

@inject('ProcessEngineService', EventAggregator, Router, 'BpmnStudioClient', 'NotificationService')
export class ProcessDefStart {
  public solutionExplorerIsShown: boolean = false;

  private processEngineService: IProcessEngineService;
  private notificationService: NotificationService;
  private eventAggregator: EventAggregator;
  private dynamicUiWrapper: DynamicUiWrapper;
  private subscriptions: Array<Subscription>;
  private processDefId: string;
  private _process: IProcessDefEntity;
  private router: Router;
  private bpmnStudioClient: BpmnStudioClient;

  constructor(processEngineService: IProcessEngineService,
              eventAggregator: EventAggregator,
              router: Router,
              bpmnStudioClient: BpmnStudioClient,
              notificationService: NotificationService) {
    this.processEngineService = processEngineService;
    this.eventAggregator = eventAggregator;
    this.router = router;
    this.bpmnStudioClient = bpmnStudioClient;
    this.notificationService = notificationService;
  }

  public detached(): void {
    for (const subscription of this.subscriptions) {
      subscription.dispose();
    }
  }

  @computedFrom('_process')
  public get process(): IProcessDefEntity {
    return this._process;
  }

  public startProcess(): void {
    this.bpmnStudioClient.startProcessByKey(this.process.key);
  }

  // TODO: Delete this! It shouldn't be here.
  public toggleSolutionExplorer(): void {
    this.solutionExplorerIsShown = !this.solutionExplorerIsShown;
  }

  // TODO: Delete this! It shouldn't be here.
  public goBack(): void {
    this.router.navigateBack();
  }

  private async activate(routeParameters: {processDefId: string}): Promise<void> {
    this.processDefId = routeParameters.processDefId;
    await this.refreshProcess();
    this.startProcess();

    this.subscriptions = [
      this.eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this.refreshProcess();
      }),
      this.eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this.refreshProcess();
      }),
      this.eventAggregator.subscribe('render-dynamic-ui', (message: IUserTaskConfig) => {
        this.dynamicUiWrapper.currentConfig = message;
      }),
      this.eventAggregator.subscribe('closed-process', (message: any) => {
        this.router.navigateBack();
      }),
    ];
  }

  private async refreshProcess(): Promise<void> {
    try {
      this._process = await this.processEngineService.getProcessDefById(this.processDefId);
    } catch (error) {
      this.notificationService.showNotification(NotificationType.ERROR, `Failed to refresh process: ${error.message}`);
      throw error;
    }
  }

}
