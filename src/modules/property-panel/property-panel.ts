import {bindable} from 'aurelia-framework';
import {IBpmnModeler} from '../../contracts';
import {Forms} from './indextaps/forms/forms';
import {General} from './indextaps/general/general';

export class PropertyPanel {

  @bindable()
  public modeler: IBpmnModeler;
  private registers: Array<any>;

  public generalRegister: any = new General();
  public formsRegister: any = new Forms();

  private attached(): void {
    this.registers = [
      this.generalRegister,
      this.formsRegister,
    ];
  }
}
