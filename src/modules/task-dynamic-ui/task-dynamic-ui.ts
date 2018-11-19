import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {computedFrom, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {IIdentity} from '@essential-projects/iam_contracts';
import {ManualTask, UserTask} from '@process-engine/management_api_contracts';

import {AuthenticationStateEvent, IDynamicUiService, NotificationType} from '../../contracts/index';
import {AuthenticationService} from '../authentication/authentication.service';
import {DynamicUiWrapper} from '../dynamic-ui-wrapper/dynamic-ui-wrapper';
import {NotificationService} from '../notification/notification.service';

interface RouteParameters {
  taskId: string;
  processModelId: string;
}

@inject(EventAggregator, 'DynamicUiService', Router, 'NotificationService', 'AuthenticationService')
export class TaskDynamicUi {

  public dynamicUiWrapper: DynamicUiWrapper;

  private _eventAggregator: EventAggregator;
  private _router: Router;
  private _notificationService: NotificationService;
  private _authenticationService: AuthenticationService;
  private _dynamicUiService: IDynamicUiService;
  private _subscriptions: Array<Subscription>;
  private _userTask: UserTask;
  private _manualTask: ManualTask;
  private _taskId: string;
  private _processModelId: string;

  constructor(eventAggregator: EventAggregator,
              dynamicUiService: IDynamicUiService,
              router: Router,
              notificationService: NotificationService,
              authenticationService: AuthenticationService) {

    this._eventAggregator = eventAggregator;
    this._dynamicUiService = dynamicUiService;
    this._router = router;
    this._notificationService = notificationService;
    this._authenticationService = authenticationService;
  }

  public activate(routeParameters: RouteParameters): void {
    // This is called when starting tasks

    this._taskId = routeParameters.taskId;
    this._processModelId = routeParameters.processModelId;

    this.getTask();
  }

  public attached(): void {
    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this.getTask();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this.getTask();
      }),
    ];

    this.dynamicUiWrapper.onButtonClick = (action: string): void => {
      this._finishTask(action);
    };

    this.setDynamicUIWrapperUserTask();
    this.setDynamicUIWrapperManualTask();
  }

  public detached(): void {
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  public set userTask(userTask: UserTask) {
    this._userTask = userTask;

    this.setDynamicUIWrapperUserTask();
  }

  @computedFrom('_userTask')
  public get userTask(): UserTask {
    return this._userTask;
  }

  public set manualTask(manualTask: ManualTask) {
    this._manualTask = manualTask;

    this.setDynamicUIWrapperManualTask();
  }

  @computedFrom('_manualTask')
  public get manualTask(): ManualTask {
    return this._manualTask;
  }

  @computedFrom('_userTask', '_manualTask')
  public get taskName(): string {
    const nonWhiteSpaceRegex: RegExp = /\S/;
    const task: UserTask | ManualTask = this._userTask === undefined ? this._manualTask : this._userTask;
    const taskNameIsSet: boolean = nonWhiteSpaceRegex.test(task.name);
    const taskDisplayName: string = taskNameIsSet
      ? task.name
      : task.id;

    return taskDisplayName;
  }

  private _finishTask(action: string): void {
    const task: UserTask | ManualTask = this._userTask === undefined ? this._manualTask : this._userTask;
    this._router.navigateToRoute('waiting-room', {
      correlationId: task.correlationId,
      processModelId: task.processModelId,
    });
  }

  private async getTask(): Promise<void> {
    const identity: IIdentity = this._getIdentity();

    try {
      if (this._processModelId !== undefined) {
        this._userTask = await this._dynamicUiService
                                    .getUserTaskByProcessModelId(identity, this._taskId, this._processModelId);

        this._manualTask = await this._dynamicUiService
                                     .getManualTaskByProcessModelId(identity, this._taskId, this._processModelId);

        this._userTask === undefined ? this.setDynamicUIWrapperManualTask() : this.setDynamicUIWrapperUserTask();

      } else {
        throw Error('CorrelationId or ProcessModelId must be given.');
      }
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, `Failed to refresh user task: ${error.message}`);
      throw error;
    }
  }

  private async setDynamicUIWrapperUserTask(): Promise<void> {
    const dynamicUiWrapperNotExisting: boolean = this.dynamicUiWrapper === undefined;
    const userTaskNotExisting: boolean = this._userTask === undefined;

    if (dynamicUiWrapperNotExisting || userTaskNotExisting) {
      return;
    }

    this.dynamicUiWrapper.currentUserTask = this._userTask;
  }

  private async setDynamicUIWrapperManualTask(): Promise<void> {
    const dynamicUiWrapperNotExisting: boolean = this.dynamicUiWrapper === undefined;
    const manualTaskNotExisting: boolean = this._manualTask === undefined;

    if (dynamicUiWrapperNotExisting || manualTaskNotExisting) {
      return;
    }

    this.dynamicUiWrapper.currentManualTask = this._manualTask;
  }

  private _getIdentity(): IIdentity {
    const accessToken: string = this._authenticationService.getAccessToken();
    const identity: IIdentity = {
      token: accessToken,
    };

    return identity;
  }
}
