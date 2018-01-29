import {bindable} from 'aurelia-framework';
import {IBpmnModeler} from '../../contracts';
import {Extensions} from './indextaps/extensions/extensions';
import {Forms} from './indextaps/forms/forms';
import {General} from './indextaps/general/general';

export class PropertyPanel {

  @bindable()
  public modeler: IBpmnModeler;
  private registers: Array<any>;

  public generalRegister: any = new General();
  public formsRegister: any = new Forms();
  public extensionsRegister: any = new Extensions();

  private currentRegister: any = this.generalRegister;

  private attached(): void {
    this.registers = [
      this.generalRegister,
      this.formsRegister,
      this.extensionsRegister,
    ];
  }

  public updateLabel(selectedRegister: any): void {
    this.currentRegister = selectedRegister;
  }
}
