import {bindable} from 'aurelia-framework';
import {IBpmnModdle,
 IBpmnModeler,
 IDefinition,
 IElementRegistry,
 IModdleElement,
 IModeling,
 IShape} from '../../contracts';
import {Extensions} from './indextaps/extensions/extensions';
import {Forms} from './indextaps/forms/forms';
import {General} from './indextaps/general/general';

export class PropertyPanel {

  @bindable()
  public modeler: IBpmnModeler;
  private moddle: IBpmnModdle;

  public generalRegister: any = new General();
  public formsRegister: any = new Forms();
  public extensionsRegister: any = new Extensions();

  private currentRegister: any = this.generalRegister;
  private registers: Array<any>;

  private attached(): void {
    this.registers = [
      this.generalRegister,
      this.formsRegister,
      this.extensionsRegister,
    ];
    this.setFirstElement();
  }

  public updateLabel(selectedRegister: any): void {
    this.currentRegister = selectedRegister;
  }

  private setFirstElement(): void {
    this.moddle = this.modeler.get('moddle');

    this.moddle.fromXML(this.getXML(), async(err: Error, definitions: IDefinition) => {
      const rootElements: any = definitions.get('rootElements');
      const process: IModdleElement = rootElements.find((element: any) => {
        return element.$type === 'bpmn:Process';
      });

      const elementRegistry: IElementRegistry = this.modeler.get('elementRegistry');
      const elementInPanel: IShape = elementRegistry.get(process.flowElements[0].id);

      this.modeler.get('selection').select(elementInPanel);
    });
  }

  private getXML(): string {
    let xml: string;
    this.modeler.saveXML({format: true}, (err: Error, diagrammXML: string) => {
      xml = diagrammXML;
    });
    return xml;
  }
}
