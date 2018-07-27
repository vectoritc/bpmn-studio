import {bindable} from 'aurelia-framework';
import {IBooleanFormField} from '../../contracts/index';

export class DynamicUiCheckboxElement {

  @bindable()
  public field: IBooleanFormField;

  public activate(field: IBooleanFormField): void {
    this.field = field;

    const fieldHasNoValue: boolean = this.field.value === undefined || this.field.value === null;
    if (fieldHasNoValue) {
      this.field.value = Boolean(this.field.defaultValue);
    }
  }
}
