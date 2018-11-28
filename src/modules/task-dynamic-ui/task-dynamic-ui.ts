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
  correlationId: string;
  processModelId: string;
  taskId: string;
}

@inject(EventAggregator, 'DynamicUiService', Router, 'NotificationService', 'AuthenticationService')
export class TaskDynamicUi {

  public dynamicUiWrapper: DynamicUiWrapper;

  private _correlationId: string;
  private _processModelId: string;
  private _taskId: string;

  private _eventAggregator: EventAggregator;
  private _router: Router;
  private _notificationService: NotificationService;
  private _authenticationService: AuthenticationService;
  private _dynamicUiService: IDynamicUiService;
  private _subscriptions: Array<Subscription>;
  private _userTask: UserTask;
  private _manualTask: ManualTask;

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

    this._correlationId = routeParameters.correlationId;
    this._processModelId = routeParameters.processModelId;
    this._taskId = routeParameters.taskId;

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

    this._router.navigateToRoute('live-execution-tracker', {
      correlationId: task.correlationId,
      processModelId: task.processModelId,
    });
  }

  private async getTask(): Promise<void> {
    const identity: IIdentity = this._getIdentity();

    try {
      const correlationNotGiven: boolean = this._correlationId === undefined;
      const processModelIdNotGiven: boolean = this._processModelId === undefined;

      if (correlationNotGiven) {
        throw Error(`Invalid Correlation ID: ${this._correlationId}`);
      }
      if (processModelIdNotGiven) {
        throw Error(`Invalid ProcessModel ID: ${this._processModelId}`);
      }

      this._userTask = await this._dynamicUiService
                                  .getUserTask(identity, this._correlationId, this._processModelId, this._taskId);

      const userTaskFound: boolean = this._userTask !== undefined;
      if (userTaskFound) {
        this.setDynamicUIWrapperUserTask();

        return;
      }

      this._manualTask = await this._dynamicUiService
                                    .getManualTask(identity, this._correlationId, this._processModelId, this._taskId);

      const manualTaskFound: boolean = this._manualTask !== undefined;
      if (manualTaskFound) {
        this.setDynamicUIWrapperManualTask();

        return;
      }

      throw new Error(`No UserTask or ManualTask with ID ${this._taskId} found!`);
    } catch (error) {
      this._notificationService.showNotification(NotificationType.ERROR, `Failed to refresh task: ${error.message}`);
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
