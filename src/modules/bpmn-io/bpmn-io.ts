import * as bundle from '@process-engine/bpmn-js-custom-bundle';
import {bindable} from 'aurelia-framework';
import {ElementDistributeOptions,
        IBpmnFunction,
        IBpmnModeler,
        IBpmnModelerConstructor,
        IEventBus} from '../../contracts';
import { IModdleElement } from '../../contracts/bpmnmodeler/IModdleElement';
import environment from '../../environment';

export class BpmnIo {

  @bindable() public xml: string;
  private modeler: IBpmnModeler;

  public attached(): void {
    this.modeler = new bundle.modeler({
      container: '#canvas',
      propertiesPanel: {
        parent: '#js-properties-panel',
      },
      additionalModules: bundle.additionalModules,
      moddleExtensions: {
        camunda: bundle.camundaModdleDescriptor,
      },
    });

    if (this.xml !== undefined && this.xml !== null) {
      this.modeler.importXML(this.xml, (err: Error) => {
        return 0;
      });
    }
  }

  public xmlChanged(newValue: string, oldValue: string): void {
    if (this.modeler !== undefined && this.modeler !== null) {
      this.modeler.importXML(this.xml, (err: Error) => {
        return 0;
      });
    }
  }

  public getXML(): Promise<string> {
    return new Promise((resolve: Function, reject: Function): void => {
      this.modeler.saveXML({}, (err: Error, result: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  public getSVG(): Promise<string> {
    return new Promise((resolve: Function, reject: Function): void => {
      this.modeler.saveSVG({}, (err: Error, result: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  public distributeElements(option: ElementDistributeOptions): void {
    const distribute: IBpmnFunction = this.modeler.get('distributeElements');
    distribute.trigger(this.modeler.get('selection')._selectedElements, option);
  }

  public setColor(fillColor: string, strokeColor: string): void {
    const modeling = this.modeler.get('modeling');

    modeling.setColor(this.modeler.get('selection')._selectedElements, {
      fill: fillColor,
      stroke: strokeColor,
    });
  }

}
