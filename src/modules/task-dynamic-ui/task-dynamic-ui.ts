import {ManagementContext, UserTask} from '@process-engine/management_api_contracts';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {computedFrom, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {AuthenticationStateEvent, IDynamicUiService, NotificationType} from '../../contracts/index';
import {NewAuthenticationService} from '../authentication/new_authentication.service';
import {DynamicUiWrapper} from '../dynamic-ui-wrapper/dynamic-ui-wrapper';
import {NotificationService} from '../notification/notification.service';

@inject(EventAggregator, 'DynamicUiService', Router, 'NotificationService', 'NewAuthenticationService')
export class TaskDynamicUi {

  public dynamicUiWrapper: DynamicUiWrapper;

  private _eventAggregator: EventAggregator;
  private _router: Router;
  private _notificationService: NotificationService;
  private _authenticationService: NewAuthenticationService;
  private _dynamicUiService: IDynamicUiService;
  private _subscriptions: Array<Subscription>;
  private _userTask: UserTask;
  private _userTaskId: string;
  private _correlationId: string;
  private _processDefId: string;

  constructor(eventAggregator: EventAggregator,
              dynamicUiService: IDynamicUiService,
              router: Router,
              notificationService: NotificationService,
              authenticationService: NewAuthenticationService) {

    this._eventAggregator = eventAggregator;
    this._dynamicUiService = dynamicUiService;
    this._router = router;
    this._notificationService = notificationService;
    this._authenticationService = authenticationService;
  }

  public activate(routeParameters: {userTaskId: string, correlationId?: string, processDefId?: string}): void {
    this._userTaskId = routeParameters.userTaskId;
    this._correlationId = routeParameters.correlationId;
    this._processDefId = routeParameters.processDefId;

    this.refreshUserTask();
  }

  public attached(): void {
    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this.refreshUserTask();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this.refreshUserTask();
      }),
    ];
    this.dynamicUiWrapper.onButtonClick = (action: string): void => {
      this.finishTask(action);
    };
    this.trySettingWidget();
  }

  public detached(): void {
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  private finishTask(action: string): void {
    this._router.navigateToRoute('waiting-room', {
      processInstanceId: this._userTask.userTaskEntity.process.id,
    });
  }

  private async refreshUserTask(): Promise<void> {
    const managementContext: ManagementContext = this._getManagementContext();

    try {
      if (this._correlationId !== undefined) {
        this.userTask = await this._dynamicUiService.getUserTaskByCorrelationId(managementContext,
                                                                                 this._userTaskId,
                                                                                 this._correlationId);
      } else if (this._processModelId !== undefined) {
        this.userTask =  await this._dynamicUiService.getUserTaskByProcessModelId(managementContext,
                                                                                  this._userTaskId,
                                                                                  this._processModelId);
      } else {
        // TODO
      }
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, `Failed to refresh user task: ${error.message}`);
      throw error;
    }
  }

  private async trySettingWidget(): Promise<void> {
    if (!this.dynamicUiWrapper) {
      return;
    }

    if (!this._userTask) {
      return;
    }

    this.dynamicUiWrapper.currentUserTask = this._userTask;
    this.dynamicUiWrapper.currentCorrelationId = this._correlationId;
  }

  public set userTask(userTask: UserTask) {
    this._userTask = userTask;
    this.trySettingWidget();
  }

  @computedFrom('_userTask')
  public get userTask(): UserTask {
    return this._userTask;
  }

  private _getManagementContext(): ManagementContext {
    const accessToken: string = this._authenticationService.getAccessToken();
    const context: ManagementContext = {
      identity: accessToken,
    };

    return context;
  }
}
