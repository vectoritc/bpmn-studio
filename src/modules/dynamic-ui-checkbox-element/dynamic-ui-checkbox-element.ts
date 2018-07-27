import {bindable} from 'aurelia-framework';
import {IBooleanFormField} from '../../contracts/index';

export class DynamicUiCheckboxElement {

  @bindable()
  public field: IBooleanFormField;

  public activate(field: IBooleanFormField): void {
    this.field = field;
    if (this.field.value === undefined || this.field.value === null) {
      this.field.value = Boolean(this.field.defaultValue);
    }
  }
}
