import {IFormWidgetEnumField} from '@process-engine/bpmn-studio_client';
import {bindable} from 'aurelia-framework';

export class DynamicUiDropdownElement {

  @bindable()
  public field: IFormWidgetEnumField;

  public activate(field: IFormWidgetEnumField): void {
    this.field = field;
    if (this.field.value === undefined || this.field.value === null || this.field.value === '') {
      this.field.value = this.field.defaultValue;
    }
  }
}
