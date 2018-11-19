
import {bindable, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {IIdentity} from '@essential-projects/iam_contracts';
import {
  ManualTask,
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
  @bindable({changeHandler: 'manualTaskChanged'}) public currentManualTask: ManualTask;
  @bindable() public showConfirm: boolean = false;
  @bindable() public showForms: boolean = false;

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

  public async handleButtonClick(action: 'cancel' | 'proceed' | 'decline'): Promise<void> {
    const actionCanceled: boolean = action === 'cancel';

    if (actionCanceled) {
      this._cancelTask();
      return;
    }

    if (this.showConfirm) {
      const formFields: Array<UserTaskFormField> = this.currentUserTask.data.formFields;

      const booleanFormFieldIndex: number = formFields.findIndex((formField: UserTaskFormField) => {
        return formField.type === UserTaskFormFieldType.boolean;
      });

      const hasBooleanFormField: boolean = formFields[booleanFormFieldIndex] !== undefined;

      if (hasBooleanFormField) {
        (formFields[booleanFormFieldIndex] as IBooleanFormField).value = action === 'proceed';
      }

      this._finishUserTask(action);
    } else if (this.showForms) {
      this._finishUserTask(action);
    } else {
      this._finishManualTask();
    }
  }

  public userTaskChanged(newUserTask: UserTask): void {
    const isUserTaskEmpty: boolean = newUserTask === undefined;
    if (isUserTaskEmpty) {
      return;
    }

    this.showConfirm = newUserTask.data.preferredControl !== undefined;
    this.showForms = newUserTask.data.preferredControl === undefined;

    if (this.showConfirm) {
      this.confirmButtonText = 'Confirm';
      this.declineButtonText = 'Decline';
    } else {
      this.confirmButtonText = 'Continue';
      this.declineButtonText = '';
    }
  }

  public manualTaskChanged(newManualTask: ManualTask): void {
    const isManualTaskEmpty: boolean = newManualTask === undefined;
    if (isManualTaskEmpty) {
      return;
    }

    this.confirmButtonText = 'Continue';
    this.declineButtonText = '';
  }

  private _cancelTask(): void {
    const correlationId: string = this.currentUserTask ? this.currentUserTask.correlationId : this.currentManualTask.correlationId;
    this._router.navigateToRoute('task-list-correlation', {
      correlationId: correlationId,
    });
  }

  private _finishUserTask(action: 'cancel' | 'proceed' | 'decline'): void {
    const hasNoCurrentUserTask: boolean = this.currentUserTask === undefined;

    if (hasNoCurrentUserTask) {
      return;
    }

    const hasOnButtonClickFunction: boolean = this.onButtonClick !== undefined;
    if (hasOnButtonClickFunction) {
      this.onButtonClick(action);
    }

    const identity: IIdentity = this._getIdentity();

    const correlationId: string = this.currentUserTask.correlationId;
    const processInstanceId: string = this.currentUserTask.processInstanceId;
    const userTaskInstanceId: string = this.currentUserTask.flowNodeInstanceId;
    const userTaskResult: UserTaskResult = this._getUserTaskResults();

    this._dynamicUiService.finishUserTask(identity,
                                          processInstanceId,
                                          correlationId,
                                          userTaskInstanceId,
                                          userTaskResult);

    this.currentUserTask = undefined;
  }

  private _finishManualTask(): void {
    const hasNoCurrentManualTask: boolean = this.currentManualTask === undefined;

    if (hasNoCurrentManualTask) {
      return;
    }

    const hasOnButtonClickFunction: boolean = this.onButtonClick !== undefined;
    if (hasOnButtonClickFunction) {
      this.onButtonClick('proceed');
    }

    const identity: IIdentity = this._getIdentity();

    const correlationId: string = this.currentManualTask.correlationId;
    const processInstanceId: string = this.currentManualTask.processInstanceId;
    const manualTaskInstanceId: string = this.currentManualTask.flowNodeInstanceId;

    this._dynamicUiService.finishManualTask(identity,
                                            processInstanceId,
                                            correlationId,
                                            manualTaskInstanceId);

    this.currentManualTask = undefined;
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

  private _getIdentity(): IIdentity {
    const accessToken: string = this._authenticationService.getAccessToken();
    const identity: IIdentity = {
      token: accessToken,
    };

    return identity;
  }
}
