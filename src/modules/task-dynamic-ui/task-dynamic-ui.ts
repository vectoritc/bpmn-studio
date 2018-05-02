import {IUserTaskConfig} from '@process-engine/bpmn-studio_client';
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {computedFrom, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {AuthenticationStateEvent, IDynamicUiService, NotificationType} from '../../contracts/index';
import {DynamicUiWrapper} from '../dynamic-ui-wrapper/dynamic-ui-wrapper';
import {NotificationService} from './../notification/notification.service';

@inject(EventAggregator, 'DynamicUiService', Router, 'NotificationService')
export class TaskDynamicUi {

  private eventAggregator: EventAggregator;
  private dynamicUiService: IDynamicUiService;
  private router: Router;
  private notificationService: NotificationService;

  private subscriptions: Array<Subscription>;
  private userTaskId: string;
  private dynamicUiWrapper: DynamicUiWrapper;
  private _userTask: IUserTaskConfig;

  constructor(eventAggregator: EventAggregator,
              dynamicUiService: IDynamicUiService,
              router: Router,
              notificationService: NotificationService) {
    this.eventAggregator = eventAggregator;
    this.dynamicUiService = dynamicUiService;
    this.router = router;
    this.notificationService = notificationService;
  }

  private activate(routeParameters: {userTaskId: string}): void {
    this.userTaskId = routeParameters.userTaskId;
    this.refreshUserTask();
  }

  public attached(): void {
    this.subscriptions = [
      this.eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this.refreshUserTask();
      }),
      this.eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this.refreshUserTask();
      }),
    ];
    this.dynamicUiWrapper.onButtonClick = (action: string): void => {
      this.finishTask(action);
    };
    this.trySettingWidget();
  }

  public detached(): void {
    for (const subscription of this.subscriptions) {
      subscription.dispose();
    }
  }

  private finishTask(action: string): void {
    this.router.navigate(`waitingroom/${this._userTask.userTaskEntity.process.id}`);
  }

  private async refreshUserTask(): Promise<void> {
    try {
      this.userTask = await this.dynamicUiService.getUserTaskConfig(this.userTaskId);
    } catch (error) {
      this.notificationService.showNotification(NotificationType.ERROR, `Failed to refresh user task: ${error.message}`);
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
