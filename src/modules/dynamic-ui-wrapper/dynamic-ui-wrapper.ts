import {ManagementApiClientService} from '@process-engine/management_api_client';
import {ManagementContext, UserTask, UserTaskResult} from '@process-engine/management_api_contracts';
import {bindable, inject} from 'aurelia-framework';
import {IDynamicUiService} from '../../contracts';
import {NewAuthenticationService} from '../authentication/new_authentication.service';

@inject('DynamicUiService', 'ManagementApiClientService', 'NewAuthenticationService')
export class DynamicUiWrapper {

  public declineButtonText: string = 'Cancel';
  public confirmButtonText: string = 'Continue';
  public onButtonClick: (action: string) => void;

  private _dynamicUiService: IDynamicUiService;
  @bindable() private _currentUserTask: UserTask;
  @bindable() private _currentCorrelationId: string;
  @bindable() private _currentProcessModelKey: string;
  private _managementApiClient: ManagementApiClientService;
  private _authenticationService: NewAuthenticationService;

  constructor(dynamicUiService: IDynamicUiService,
              managementApiClient: ManagementApiClientService,
              newAuthenticationService: NewAuthenticationService) {

    this._dynamicUiService = dynamicUiService;
    this._managementApiClient = managementApiClient;
    this._authenticationService = newAuthenticationService;
  }

  public async handleButtonClick(action: string): Promise<void> {
    if (!this._currentUserTask || !this._currentCorrelationId) {
      return;
    }

    if (this.onButtonClick) {
      this.onButtonClick(action);
    }

    // This happens when clicking on continue on a usertask
    const managementContext: ManagementContext = this._getManagementContext();

    const correlationId: string = this._currentCorrelationId;
    const processModelKey: string = this._currentProcessModelKey;

    const userTaskId: string = this.currentUserTask.id;
    const userTaskResult: UserTaskResult = this.currentUserTask.data;
    console.log(userTaskResult);
    // TODO! check if userTaskResult contains right data

    this._dynamicUiService.finishUserTask(managementContext,
                                          processModelKey,
                                          correlationId,
                                          userTaskId,
                                          userTaskResult);

    this._currentUserTask = null;
    this._currentCorrelationId = null;
  }

  // TODO!
  // WHAT ABOUT WIDGETTYPE?
  // public set currentConfig(userTaskConfig: UserTask) {
    // this._currentConfig = userTaskConfig;
    // if (this._currentConfig.widgetType === WidgetType.confirm) {
    //   this.handleConfirmLayout();
    // } else {
    //   this.confirmButtonText = 'Continue';
    //   this.declineButtonText = 'Cancel';
    // }
  // }

  public set currentUserTask(userTask: UserTask) {
    this._currentUserTask = userTask;
  }

  public get currentUserTask(): UserTask {
    return this._currentUserTask;
  }

  public set currentCorrelationId(correlationId: string) {
    this._currentCorrelationId = this.currentCorrelationId;
  }

  public get currentCorrelationId(): string {
    return this._currentCorrelationId;
  }

  public set currentProcessModelKey(processModelKey: string) {
    this._currentProcessModelKey = this.currentProcessModelKey;
  }

  public get currentProcessModelKey(): string {
    return this._currentProcessModelKey;
  }

  public handleConfirmLayout(): void {
    // TODO!
    // const confirmWidget: IConfirmWidgetConfig = this.currentConfig.widgetConfig as IConfirmWidgetConfig;
    // this.confirmButtonText = null;
    // this.declineButtonText = null;
    // for (const action of confirmWidget.actions) {
    //   if (action.action === UserTaskProceedAction.cancel) {
    //     this.declineButtonText = action.label;
    //   } else if (action.action === UserTaskProceedAction.proceed) {
    //     this.confirmButtonText = action.label;
    //   }
    // }
    console.log('TODO!');
  }

  private _getManagementContext(): ManagementContext {
    const accessToken: string = this._authenticationService.getAccessToken();
    const context: ManagementContext = {
      identity: accessToken,
    };

    return context;
  }
}
