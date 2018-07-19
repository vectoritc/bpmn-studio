import {FormWidgetFieldType, IFormWidgetConfig, SpecificFormWidgetField} from '@process-engine/bpmn-studio_client';
import {bindable, inject} from 'aurelia-framework';
import {NotificationType} from '../../contracts/index';
import {NotificationService} from '../notification/notification.service';

@inject('NotificationService')
export class FormWidget {

  @bindable()
  public widget: IFormWidgetConfig;
  private _notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this._notificationService = notificationService;
  }

  public getFieldControl(field: SpecificFormWidgetField): string {
    switch (field.type) {
      case FormWidgetFieldType.enumeration:
        return 'dropdown';
      case FormWidgetFieldType.string:
        return 'textbox';
      case FormWidgetFieldType.boolean:
        return 'checkbox';
      case FormWidgetFieldType.long:
        return 'number';
      default:
        this._notificationService.showNotification(NotificationType.ERROR, `Not supported FromWidgetFieldType: ${field.type}`);
        return null;
    }
  }
}
