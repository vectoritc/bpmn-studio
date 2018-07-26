import {UserTaskConfig, UserTaskFormField, UserTaskFormFieldType} from '@process-engine/management_api_contracts';
import {bindable, inject} from 'aurelia-framework';
import {NotificationType} from '../../contracts/index';
import {NotificationService} from '../notification/notification.service';

@inject('NotificationService')
export class FormWidget {

  @bindable()
  public widget: UserTaskConfig;
  private _notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this._notificationService = notificationService;
  }

  public getFieldControl(field: UserTaskFormField): string {
    // TODO: Support Date and CustomType
    switch (field.type) {
      case UserTaskFormFieldType.enumeration:
        return 'dropdown';
      case UserTaskFormFieldType.string:
        return 'textbox';
      case UserTaskFormFieldType.boolean:
        return 'checkbox';
      case UserTaskFormFieldType.long:
        return 'number';
      default:
        this._notificationService.showNotification(NotificationType.ERROR, `Not supported FromWidgetFieldType: ${field.type}`);
        return null;
    }
  }
}
