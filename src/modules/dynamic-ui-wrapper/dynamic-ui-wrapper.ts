import {ManagementApiClientService} from '@process-engine/management_api_client';
import {ManagementContext, UserTask, UserTaskResult} from '@process-engine/management_api_contracts';
import {bindable, inject} from 'aurelia-framework';
import {IDynamicUiService} from '../../contracts';
import {NewAuthenticationService} from '../authentication/new_authentication.service';

@inject('DynamicUiService', 'ManagementApiClientService', 'NewAuthenticationService')
export class DynamicUiWrapper {

  public declineButtonText: string = 'Cancel';
  public confirmButtonText: string = 'Continue';
  public widgetType: string = 'form';
  public onButtonClick: (action: string) => void;

  private _dynamicUiService: IDynamicUiService;
  @bindable() private _currentUserTask: UserTask;
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
    const hasNoCurrentUserTask: boolean = this._currentUserTask === undefined;
    if (hasNoCurrentUserTask) {
      return;
    }

    const hasOnButtonClickFunction: boolean = this.onButtonClick !== undefined;
    if (hasOnButtonClickFunction) {
      this.onButtonClick(action);
    }

    // This happens when clicking on continue on a usertask
    const managementContext: ManagementContext = this._getManagementContext();

    const correlationId: string = ''; // this._currentUserTask.correlationId;
    const processModelId: string = ''; // this._currentUserTask.processModelId;
    const userTaskId: string = this._currentUserTask.id;
    const userTaskResult: UserTaskResult = this._currentUserTask.data;

    this._dynamicUiService.finishUserTask(managementContext,
                                          processModelId,
                                          correlationId,
                                          userTaskId,
                                          userTaskResult);

    this._currentUserTask = null;
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
