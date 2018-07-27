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

  public set currentUserTask(userTask: UserTask) {
    this._currentUserTask = userTask;
  }

  public get currentUserTask(): UserTask {
    return this._currentUserTask;
  }

  private _getManagementContext(): ManagementContext {
    const accessToken: string = this._authenticationService.getAccessToken();
    const context: ManagementContext = {
      identity: accessToken,
    };

    return context;
  }
}
