import * as bundle from '@process-engine/bpmn-js-custom-bundle';
import {bindable} from 'aurelia-framework';
import {ElementDistributeOptions,
        IBpmnFunction,
        IBpmnModeler,
        IModdleElement,
        IModeling,
        IShape} from '../../contracts';
import environment from '../../environment';

export class BpmnIo {

  @bindable() public xml: string;
  public modeler: IBpmnModeler;
  private toggled: boolean = false;

  public created(): void {
    this.modeler = new bundle.modeler({
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

  public attached(): void {
    this.modeler.attachTo('#canvas');
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

    const selectedElements: Array<IShape> = this.getSelectedElements();

    distribute.trigger(selectedElements, option);
  }

  public setColor(fillColor: string, strokeColor: string): void {
    const modeling: IModeling = this.modeler.get('modeling');

    const selectedElements: Array<IShape> = this.getSelectedElements();

    if (selectedElements.length > 0) {
      modeling.setColor(selectedElements, {
        fill: fillColor,
        stroke: strokeColor,
      });
    }
  }

  public getColors(): Array<string> {
    const selectedElements: Array<IShape> = this.getSelectedElements();

    if (!selectedElements || !selectedElements[0]) {
      return [undefined, undefined];
    }

    const firstElement: IModdleElement = selectedElements[0].businessObject;
    const fillColor: string = firstElement.di.fill;
    const borderColor: string = firstElement.di.stroke;

    return [fillColor, borderColor];
  }

  private getSelectedElements(): Array<IShape> {
    return this.modeler.get('selection')._selectedElements;
  }

  private togglePanel(): void {
    const toggleBtn: HTMLElement = document.getElementById('toggle_panel');
    const panel: HTMLElement = document.getElementById('js-properties-panel');
    const canvas: HTMLElement = document.getElementById('canvas');
    if (this.toggled === true) {
      panel.style.display = 'inline';
      toggleBtn.style.right = '337px';
      toggleBtn.textContent = 'Hide';
      canvas.style.right = '350px';
      this.toggled = false;
    } else {
      panel.style.display = 'none';
      toggleBtn.style.right = '-16px';
      toggleBtn.textContent = 'Show';
      canvas.style.right = '1px';
      this.toggled = true;
    }
  }

}
