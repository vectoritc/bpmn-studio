import {IUserTaskConfig} from '@process-engine/bpmn-studio_client';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {computedFrom, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {AuthenticationStateEvent, IDynamicUiService, NotificationType} from '../../contracts/index';
import {DynamicUiWrapper} from '../dynamic-ui-wrapper/dynamic-ui-wrapper';
import {NotificationService} from '../notification/notification.service';

@inject(EventAggregator, 'DynamicUiService', Router, 'NotificationService')
export class TaskDynamicUi {

  public dynamicUiWrapper: DynamicUiWrapper;

  private _subscriptions: Array<Subscription>;
  private _userTaskId: string;
  private _userTask: IUserTaskConfig;
  private _eventAggregator: EventAggregator;
  private _dynamicUiService: IDynamicUiService;
  private _router: Router;
  private _notificationService: NotificationService;

  constructor(eventAggregator: EventAggregator,
              dynamicUiService: IDynamicUiService,
              router: Router,
              notificationService: NotificationService) {
    this._eventAggregator = eventAggregator;
    this._dynamicUiService = dynamicUiService;
    this._router = router;
    this._notificationService = notificationService;
  }

  private activate(routeParameters: {userTaskId: string}): void {
    this._userTaskId = routeParameters.userTaskId;
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
    try {
      this.userTask = await this._dynamicUiService.getUserTaskConfig(this._userTaskId);
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
    this.dynamicUiWrapper.currentConfig = this._userTask;
  }

  private set userTask(task: IUserTaskConfig) {
    this._userTask = task;
    this.trySettingWidget();
  }

  @computedFrom('_userTask')
  private get userTask(): IUserTaskConfig {
    return this._userTask;
  }
}
