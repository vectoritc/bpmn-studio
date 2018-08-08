
import {bindable, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {
  ManagementContext,
  UserTask,
  UserTaskFormField,
  UserTaskFormFieldType,
  UserTaskResult,
} from '@process-engine/management_api_contracts';

import {
  IBooleanFormField,
  IDynamicUiService,
  IEnumFormField,
  IStringFormField,
} from '../../contracts';
import {AuthenticationService} from '../authentication/authentication.service';

@inject('DynamicUiService', 'AuthenticationService', Router)
export class DynamicUiWrapper {

  public cancelButtonText: string = 'Cancel';
  public confirmButtonText: string = 'Continue';
  public declineButtonText: string = 'Decline';
  public onButtonClick: (action: 'cancel' | 'proceed' | 'decline') => void;
  @bindable({changeHandler: 'userTaskChanged'}) public currentUserTask: UserTask;
  @bindable() public currentControlType: string;

  private _router: Router;

  private _dynamicUiService: IDynamicUiService;
  private _authenticationService: AuthenticationService;

  constructor(dynamicUiService: IDynamicUiService,
              authenticationService: AuthenticationService,
              router: Router) {

    this._dynamicUiService = dynamicUiService;
    this._authenticationService = authenticationService;
    this._router = router;
  }

  public async handleButtonClick(action: 'cancel' | 'proceed'): Promise<void> {
    const actionCanceled: boolean = action === 'cancel';

    if (this.currentControlType === 'confirm') {
      const formFields: Array<UserTaskFormField> = this.currentUserTask.data.formFields;

      const booleanFormFieldIndex: number = formFields.findIndex((formField: UserTaskFormField) => {
        return formField.type === UserTaskFormFieldType.boolean;
      });

      const hasBooleanFormField: boolean = formFields[booleanFormFieldIndex] !== undefined;

      if (hasBooleanFormField) {
        (formFields[booleanFormFieldIndex] as IBooleanFormField).value = action === 'proceed';
      }
    }

    if (actionCanceled) {
      this._cancelUserTask();
      return;
    }

    this._finishUserTask(action);
  }

  public userTaskChanged(newUserTask: UserTask): void {
    const isUserTaskEmpty: boolean = newUserTask === undefined;
    if (isUserTaskEmpty) {
      return;
    }

    this.currentControlType = newUserTask.data.preferredControl;

    if (this.currentControlType === 'confirm') {
      this.confirmButtonText = 'Confirm';
    } else {
      this.confirmButtonText = 'Continue';
    }
  }

  private _cancelUserTask(): void {
    this._router.navigateToRoute('task-list-correlation', {
      correlationId: this.currentUserTask.correlationId,
    });
  }

  private _finishUserTask(action: 'cancel' | 'proceed'): void {
    const hasNoCurrentUserTask: boolean = this.currentUserTask === undefined;

    if (hasNoCurrentUserTask) {
      return;
    }

    const hasOnButtonClickFunction: boolean = this.onButtonClick !== undefined;
    if (hasOnButtonClickFunction) {
      this.onButtonClick(action);
    }

    const managementContext: ManagementContext = this._getManagementContext();

    const correlationId: string = this.currentUserTask.correlationId;
    const processModelId: string = this.currentUserTask.processModelId;
    const userTaskId: string = this.currentUserTask.id;
    const userTaskResult: UserTaskResult = this._getUserTaskResults();

    this._dynamicUiService.finishUserTask(managementContext,
                                          processModelId,
                                          correlationId,
                                          userTaskId,
                                          userTaskResult);

    this.currentUserTask = undefined;
  }

  private _getUserTaskResults(): UserTaskResult {
    const userTaskResult: UserTaskResult = {
      formFields: {},
    };

    const currentFormFields: Array<UserTaskFormField> = this.currentUserTask.data.formFields;

    currentFormFields.forEach((formField: IStringFormField | IEnumFormField | IBooleanFormField) => {
      const formFieldId: string = formField.id;

      const formFieldValue: string | boolean = formField.value;
      const formFieldStringValue: string = formFieldValue !== undefined ? formFieldValue.toString() : undefined;

      userTaskResult.formFields[formFieldId] = formFieldStringValue;
    });

    return userTaskResult;
  }

  private _getManagementContext(): ManagementContext {
    const accessToken: string = this._authenticationService.getAccessToken();
    const context: ManagementContext = {
      identity: accessToken,
    };

    return context;
  }
}
