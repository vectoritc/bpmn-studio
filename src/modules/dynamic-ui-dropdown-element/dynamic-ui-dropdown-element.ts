import {bindable} from 'aurelia-framework';
import {IEnumFormField} from '../../contracts';

export class DynamicUiDropdownElement {

  @bindable()
  public field: IEnumFormField;

  public activate(field: IEnumFormField): void {
    this.field = field;

    const fieldHasNoValue: boolean = this.field.value === undefined
                                  || this.field.value === null
                                  || this.field.value === '';

    if (fieldHasNoValue) {
      this.field.value = this.field.defaultValue;
    }
  }
}
