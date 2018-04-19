import {FormWidgetFieldType, IFormWidgetConfig, SpecificFormWidgetField} from '@process-engine/bpmn-studio_client';
import {bindable} from 'aurelia-framework';
import * as toastr from 'toastr';

export class FormWidget {

  @bindable()
  private widget: IFormWidgetConfig;

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
        toastr.error(`Not supported FromWidgetFieldType: ${field.type}`);
        return null;
    }
  }
}
