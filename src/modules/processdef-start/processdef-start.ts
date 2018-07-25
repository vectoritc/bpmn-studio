import {ManagementApiClientService} from '@process-engine/management_api_client';
import {ManagementContext, ProcessModelExecution, UserTask, UserTaskList} from '@process-engine/management_api_contracts';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {computedFrom, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {AuthenticationStateEvent, IProcessEngineService, NotificationType} from '../../contracts/index';
import {NewAuthenticationService} from '../authentication/new_authentication.service';
import {DynamicUiWrapper} from '../dynamic-ui-wrapper/dynamic-ui-wrapper';
import {NotificationService} from '../notification/notification.service';

@inject('ProcessEngineService', EventAggregator, Router, 'NotificationService', 'ManagementApiClientService', 'NewAuthenticationService')
export class ProcessDefStart {
  public dynamicUiWrapper: DynamicUiWrapper;

  private _processEngineService: IProcessEngineService;
  private _notificationService: NotificationService;
  private _eventAggregator: EventAggregator;
  private _subscriptions: Array<Subscription>;
  private _processModelId: string;
  private _processModel: ProcessModelExecution.ProcessModel;
  private _router: Router;
  private _managementApiClient: ManagementApiClientService;
  private _authenticationService: NewAuthenticationService;

  constructor(processEngineService: IProcessEngineService,
              eventAggregator: EventAggregator,
              router: Router,
              notificationService: NotificationService,
              managementApiClient: ManagementApiClientService,
              authenticationService: NewAuthenticationService) {

    this._processEngineService = processEngineService;
    this._eventAggregator = eventAggregator;
    this._router = router;
    this._notificationService = notificationService;
    this._managementApiClient = managementApiClient;
    this._authenticationService = authenticationService;
  }

  // TODO: Add a usefull comment here; what does it do? what is it good for? when is this invoked?
  public async activate(routeParameters: {processKey: string}): Promise<void> {
    this._processModelId = routeParameters.processKey;

    const managementContext: ManagementContext = this._getManagementContext();

    const userTaskList: UserTaskList = await this._managementApiClient.getUserTasksForProcessModel(managementContext, this._processModelId);

    console.log(userTaskList);

    // this.dynamicUiWrapper.currentUserTask = data.userTask;
    // this.dynamicUiWrapper.currentCorrelationId = data.correlationId;
    this.dynamicUiWrapper.currentProcessModelKey = this._processModelId;
    // TODO! basically this needs to happen:
    this._eventAggregator.publish('render-dynamic-ui', null);
    // TODO! Find out how to get new usertask

    await this._refreshProcess();

    this._subscriptions = [
      /*
       * If the user this login/logout we need to refresh the process;
       * mainly due to a possible the change in access rights.
       */
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this._refreshProcess();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this._refreshProcess();
      }),

      this._eventAggregator.subscribe('render-dynamic-ui', (data: any) => {
        this.dynamicUiWrapper.currentUserTask = data.userTask;
        this.dynamicUiWrapper.currentCorrelationId = data.correlationId;
        this.dynamicUiWrapper.currentProcessModelKey = data.processModelKey;
      }),
      /*
       * The closed-process event is thrown at the end of a process run;
       * we then use the router to navigate to the prvious view-- this could be the
       * design view-- but any other last view will work as well.
       */
      this._eventAggregator.subscribe('closed-process', () => {
        this._router.navigateBack();
      }),
    ];
  }

  public detached(): void {
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  @computedFrom('_processModel')
  public get processModel(): ProcessModelExecution.ProcessModel {
    return this._processModel;
  }

  private async _refreshProcess(): Promise<void> {
    try {
      this._processModel = await this._processEngineService.getProcessDefById(this._processModelId);
      const managementContext: ManagementContext = this._getManagementContext();

      this._processModel = await this._managementApiClient.getProcessModelById(managementContext, this._processModelId);
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, `Failed to refresh process: ${error.message}`);
      throw error;
    }
  }

  private _getManagementContext(): ManagementContext {
    const accessToken: string = this._authenticationService.getAccessToken();
    const context: ManagementContext = {
      identity: accessToken,
    };

    return context;
  }
}
