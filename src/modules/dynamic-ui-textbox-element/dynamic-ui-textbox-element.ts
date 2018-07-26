import {IFormWidgetStringField} from '@process-engine/bpmn-studio_client';
import {bindable} from 'aurelia-framework';

export class DynamicUiTextboxElement {

  @bindable()
  public field: IFormWidgetStringField;

    // The textbox sometimes does not get rendered even though the activate function is called

  public activate(field: IFormWidgetStringField): void {
    this.field = field;

    const fieldValueIsNotSet: boolean = this.field.value === undefined || this.field.value === null || this.field.value === '';
    if (fieldValueIsNotSet) {
      this.field.value = this.field.defaultValue;
    }
  }
}
