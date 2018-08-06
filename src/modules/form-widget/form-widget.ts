import {UserTaskConfig, UserTaskFormField, UserTaskFormFieldType} from '@process-engine/management_api_contracts';
import {bindable, inject} from 'aurelia-framework';
import {UserTaskConfig} from '../../../node_modules/@process-engine/consumer_api_contracts';
import {NotificationType} from '../../contracts/index';
import {NotificationService} from '../notification/notification.service';

@inject('NotificationService')
export class FormWidget {

  @bindable()
  public userTaskConfig: UserTaskConfig;
  private _notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this._notificationService = notificationService;
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
}
