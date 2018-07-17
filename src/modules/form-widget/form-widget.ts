import {FormWidgetFieldType, IFormWidgetConfig, SpecificFormWidgetField} from '@process-engine/bpmn-studio_client';
import {bindable, inject} from 'aurelia-framework';
import {NotificationType} from '../../contracts/index';
import {NotificationService} from '../notification/notification.service';

@inject('NotificationService')
export class FormWidget {

  @bindable()
  private widget: IFormWidgetConfig;
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
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
        this.notificationService.showNotification(NotificationType.ERROR, `Not supported FromWidgetFieldType: ${field.type}`);
        return null;
    }
  }
}
