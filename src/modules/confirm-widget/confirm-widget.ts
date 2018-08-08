import {UserTaskConfig, UserTaskFormField, UserTaskFormFieldType} from '@process-engine/management_api_contracts';
import {bindable, inject} from 'aurelia-framework';
import {NotificationType} from '../../contracts/index';
import {NotificationService} from '../notification/notification.service';

@inject('NotificationService')
export class ConfirmWidget {

  @bindable()
  public userTaskConfig: UserTaskConfig;
  public formFields: Array<UserTaskFormField>;
  public confirmMessage: string;

  private _notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this._notificationService = notificationService;
  }

  public attached(): void {
    const booleanFormField: UserTaskFormField = this._getBooleanFormField();
    const hasUserTaskBooleanFormField: boolean = booleanFormField !== undefined;

    if (hasUserTaskBooleanFormField) {
      this.confirmMessage = booleanFormField.label;
    }

    this.formFields = this.userTaskConfig.formFields.slice(1);
  }

  public getFieldControl(field: UserTaskFormField): string {
    switch (field.type) {
      case UserTaskFormFieldType.enum:
        return 'dropdown';
      case UserTaskFormFieldType.string:
        return 'textbox';
      case UserTaskFormFieldType.boolean:
        return 'checkbox';
      case UserTaskFormFieldType.long:
        return 'number';
      default:
        const notSupportedType: string = field.type !== undefined ? field.type : 'Custom Type';
        const errorMessage: string = `Not supported form field type: ${notSupportedType}.`
                                   + `</br>Please change the form field type with id "${field.id}".`;

        this._notificationService.showNotification(NotificationType.ERROR, errorMessage);
        return null;
    }
  }

  private _getBooleanFormField(): UserTaskFormField {
    const formFields: Array<UserTaskFormField> = this.userTaskConfig.formFields;

    return formFields.find((formField: UserTaskFormField): boolean => {
      return formField.type === UserTaskFormFieldType.boolean;
    });
  }
}
