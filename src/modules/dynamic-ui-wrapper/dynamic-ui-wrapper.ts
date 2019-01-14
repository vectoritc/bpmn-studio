
import {bindable, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {domEventDispatch} from 'dom-event-dispatch';

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

@inject('DynamicUiService', Router, Element)
export class DynamicUiWrapper {

  public cancelButtonText: string = 'Cancel';
  public confirmButtonText: string = 'Continue';
  public declineButtonText: string = 'Decline';
  public onButtonClick: (action: 'cancel' | 'proceed' | 'decline') => void;
  @bindable({changeHandler: 'userTaskChanged'}) public currentUserTask: UserTask;
  @bindable({changeHandler: 'manualTaskChanged'}) public currentManualTask: ManualTask;
  @bindable() public isConfirmUserTask: boolean = false;
  @bindable() public isFormUserTask: boolean = false;
  @bindable() public isModal: boolean;
  private _element: Element;

  private _router: Router;

  private _dynamicUiService: IDynamicUiService;
  private _identity: IIdentity;

  constructor(dynamicUiService: IDynamicUiService,
              router: Router,
              element: Element) {

    this._dynamicUiService = dynamicUiService;
    this._router = router;
    this._element = element;

    this.isModal = false;
  }

  public set identity(identity: IIdentity) {
    this._identity = identity;
  }

  public async handleUserTaskButtonClick(action: 'cancel' | 'proceed' | 'decline'): Promise<void> {
    const actionCanceled: boolean = action === 'cancel';

    if (actionCanceled) {
      this._cancelTask();

      return;
    }

    if (this.isConfirmUserTask) {
      const formFields: Array<UserTaskFormField> = this.currentUserTask.data.formFields;

      const booleanFormFieldIndex: number = formFields.findIndex((formField: UserTaskFormField) => {
        return formField.type === UserTaskFormFieldType.boolean;
      });

      const hasBooleanFormField: boolean = formFields[booleanFormFieldIndex] !== undefined;

      if (hasBooleanFormField) {
        (formFields[booleanFormFieldIndex] as IBooleanFormField).value = action === 'proceed';
      }

      this._finishUserTask(action);
    } else if (this.isFormUserTask) {
      this._finishUserTask(action);
    }
  }

  public async handleManualTaskButtonClick(action: 'cancel' | 'proceed'): Promise<void> {
    const actionCanceled: boolean = action === 'cancel';

    if (actionCanceled) {
      this._cancelTask();

      return;
    }

    this._finishManualTask();
  }

  public userTaskChanged(newUserTask: UserTask): void {
    const isUserTaskEmpty: boolean = newUserTask === undefined;
    if (isUserTaskEmpty) {
      return;
    }

    const preferredControlSet: boolean = newUserTask.data.preferredControl !== undefined;

    this.isConfirmUserTask = preferredControlSet
      ? newUserTask.data.preferredControl.toLowerCase() === 'confirm'
      : false;

    this.isFormUserTask = !this.isConfirmUserTask;

    if (this.isConfirmUserTask) {
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

  public get isHandlingManualTask(): boolean {
    return this.currentManualTask !== undefined;
  }

  public get isHandlingUserTask(): boolean {
    return this.currentUserTask !== undefined;
  }

  private _cancelTask(): void {
    if (this.isModal) {
      domEventDispatch.dispatchEvent(this._element, 'close-modal', {bubbles: true});

      return;
    }

    const correlationId: string = this.currentUserTask ? this.currentUserTask.correlationId : this.currentManualTask.correlationId;

    this._router.navigateToRoute('task-list-correlation', {
      correlationId: correlationId,
    });
  }

  private _finishUserTask(action: 'cancel' | 'proceed' | 'decline'): Promise<void> {
    const noUserTaskKnown: boolean = !this.isHandlingUserTask;

    if (noUserTaskKnown) {
      return;
    }

    const correlationId: string = this.currentUserTask.correlationId;
    const processInstanceId: string = this.currentUserTask.processInstanceId;
    const userTaskInstanceId: string = this.currentUserTask.flowNodeInstanceId;
    const userTaskResult: UserTaskResult = this._getUserTaskResults();

    this._dynamicUiService.finishUserTask(this._identity,
                                          processInstanceId,
                                          correlationId,
                                          userTaskInstanceId,
                                          userTaskResult);

    this.currentUserTask = undefined;

    const buttonClickHandlerExists: boolean = this.onButtonClick !== undefined;
    if (buttonClickHandlerExists) {
      this.onButtonClick(action);
    }
  }

  private _finishManualTask(): Promise<void> {
    const noManualTaskKnown: boolean = !this.isHandlingManualTask;

    if (noManualTaskKnown) {
      return;
    }

    const correlationId: string = this.currentManualTask.correlationId;
    const processInstanceId: string = this.currentManualTask.processInstanceId;
    const manualTaskInstanceId: string = this.currentManualTask.flowNodeInstanceId;

    this._dynamicUiService.finishManualTask(this._identity,
                                            processInstanceId,
                                            correlationId,
                                            manualTaskInstanceId);

    this.currentManualTask = undefined;

    const buttonClickHandlerExists: boolean = this.onButtonClick !== undefined;
    if (buttonClickHandlerExists) {
      this.onButtonClick('proceed');
    }
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

}
