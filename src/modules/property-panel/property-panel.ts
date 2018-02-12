import {bindable} from 'aurelia-framework';
import {IBpmnModdle,
 IBpmnModeler,
 IDefinition,
 IElementRegistry,
 IModdleElement,
 IModeling,
 IShape} from '../../contracts';
import {Extensions} from './indextabs/extensions/extensions';
import {Forms} from './indextabs/forms/forms';
import {General} from './indextabs/general/general';

export class PropertyPanel {

  @bindable()
  public modeler: IBpmnModeler;
  private moddle: IBpmnModdle;

  public generalRegister: any = new General();
  public formsRegister: any = new Forms();
  public extensionsRegister: any = new Extensions();

  private currentRegister: any = this.generalRegister;
  private registers: Array<any>;

  public attached(): void {
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
