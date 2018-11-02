import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {computedFrom, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {IIdentity} from '@essential-projects/iam_contracts';
import {UserTask} from '@process-engine/management_api_contracts';

import {AuthenticationStateEvent, IDynamicUiService, NotificationType} from '../../contracts/index';
import {AuthenticationService} from '../authentication/authentication.service';
import {DynamicUiWrapper} from '../dynamic-ui-wrapper/dynamic-ui-wrapper';
import {NotificationService} from '../notification/notification.service';

interface RouteParameters {
  userTaskId: string;
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
  private _userTaskId: string;
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
    // This is called when starting usertask

    this._userTaskId = routeParameters.userTaskId;
    this._processModelId = routeParameters.processModelId;

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
      this._finishTask(action);
    };

    this.setDynamicUIWrapperUserTask();
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

  @computedFrom('_userTask')
  public get userTaskName(): string {
    const nonWhiteSpaceRegex: RegExp = /\S/;
    const userTaskNameSet: boolean = nonWhiteSpaceRegex.test(this._userTask.name);
    const userTaskDisplayName: string = userTaskNameSet
      ? this._userTask.name
      : this._userTask.id;

    return userTaskDisplayName;
  }

  private _finishTask(action: string): void {
    this._router.navigateToRoute('waiting-room', {
      correlationId: this._userTask.correlationId,
      processModelId: this._userTask.processModelId,
    });
  }

  private async refreshUserTask(): Promise<void> {
    const identity: IIdentity = this._getIdentity();

    try {
      if (this._processModelId !== undefined) {
        this._userTask =  await this._dynamicUiService.getUserTaskByProcessModelId(identity,
                                                                                  this._userTaskId,
                                                                                  this._processModelId);

        this.setDynamicUIWrapperUserTask();
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

  private _getIdentity(): IIdentity {
    const accessToken: string = this._authenticationService.getAccessToken();
    const identity: IIdentity = {
      token: accessToken,
    };

    return identity;
  }
}
