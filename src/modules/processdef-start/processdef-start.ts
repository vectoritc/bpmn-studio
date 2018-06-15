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
  private _processEngineService: IProcessEngineService;
  private _notificationService: NotificationService;
  private _eventAggregator: EventAggregator;
  private _dynamicUiWrapper: DynamicUiWrapper;
  private _subscriptions: Array<Subscription>;
  private _processDefId: string;
  private _process: IProcessDefEntity;
  private _router: Router;
  private _bpmnStudioClient: BpmnStudioClient;

  constructor(processEngineService: IProcessEngineService,
              eventAggregator: EventAggregator,
              router: Router,
              bpmnStudioClient: BpmnStudioClient,
              notificationService: NotificationService) {
    this._processEngineService = processEngineService;
    this._eventAggregator = eventAggregator;
    this._router = router;
    this._bpmnStudioClient = bpmnStudioClient;
    this._notificationService = notificationService;
  }

  private async activate(routeParameters: {processDefId: string}): Promise<void> {
    this._processDefId = routeParameters.processDefId;
    await this._refreshProcess();
    this._startProcess();

    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this._refreshProcess();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this._refreshProcess();
      }),
      this._eventAggregator.subscribe('render-dynamic-ui', (message: IUserTaskConfig) => {
        this._dynamicUiWrapper.currentConfig = message;
      }),
      this._eventAggregator.subscribe('closed-process', (message: any) => {
        this._router.navigateBack();
      }),
    ];
  }

  public detached(): void {
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  @computedFrom('_process')
  public get process(): IProcessDefEntity {
    return this._process;
  }

  private async _refreshProcess(): Promise<void> {
    try {
      this._process = await this._processEngineService.getProcessDefById(this._processDefId);
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, `Failed to refresh process: ${error.message}`);
      throw error;
    }
  }

  private _startProcess(): void {
    this._bpmnStudioClient.startProcessByKey(this.process.key);
  }

}
