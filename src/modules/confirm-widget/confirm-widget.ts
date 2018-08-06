import {UserTaskConfig, UserTaskFormFieldType} from '@process-engine/consumer_api_contracts';
import { UserTaskFormField } from '@process-engine/management_api_contracts';
import {bindable} from 'aurelia-framework';

export class ConfirmWidget {

  @bindable()
  public userTaskConfig: UserTaskConfig;
  public confirmMessage: string;

  public activate(userTaskConfig: UserTaskConfig): void {
    this.userTaskConfig = userTaskConfig;

    const booleanFormField: UserTaskFormField = this._getBooleanFormField();
    const hasUserTaskBooleanFormField: boolean = booleanFormField !== undefined;
    if (hasUserTaskBooleanFormField) {
      this.confirmMessage = booleanFormField.label;
    }
  }

  private _getBooleanFormField(): UserTaskFormField {
    const formFields: Array<UserTaskFormField> = this.userTaskConfig.formFields;

    return formFields.find((formField: UserTaskFormField): boolean => {
      return formField.type === UserTaskFormFieldType.boolean;
    });
  }

}
