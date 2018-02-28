import * as bundle from '@process-engine/bpmn-js-custom-bundle';
import {bindable, observable} from 'aurelia-framework';
import { setTimeout } from 'timers';
import * as toastr from 'toastr';
import {ElementDistributeOptions,
        IBpmnFunction,
        IBpmnModeler,
        IDefinition,
        IModdleElement,
        IModeling,
        IShape,
        resizeOptions} from '../../contracts/index';
import environment from '../../environment';

export class BpmnIo {

  private toggled: boolean = false;
  private toggleBtn: HTMLButtonElement;
  private resizeBtn: HTMLButtonElement;
  private panel: HTMLElement;
  private canvasModel: HTMLDivElement;
  private refresh: boolean = true;
  private isResizeClicked: boolean = false;

  private toggleBtnRight: number = 337;
  private resizeBtnRight: number = 331;
  private canvasRight: number = 350;
  private minWidth: number = environment.propertyPanel.minWidth;

  @bindable({changeHandler: 'xmlChanged'}) public xml: string;
  public modeler: IBpmnModeler;

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
      this.modeler.importXML(newValue, (err: Error) => {
        return 0;
      });
      this.xml = newValue;
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

    if (selectedElements.length < 1 || selectedElements.length === 1 && selectedElements[0].$type === 'bpmn:Collaboration') {
      toastr.error(`Error while changing the color: No valid element was selected.`);
      return;
    }

    modeling.setColor(selectedElements, {
      fill: fillColor,
      stroke: strokeColor,
    });
  }

  public getColors(): Array<string> {
    const selectedElements: Array<IShape> = this.getSelectedElements();

    if (!selectedElements || !selectedElements[0] || !selectedElements[0].businessObject) {
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
    if (this.toggled === true) {
      this.panel.style.display = 'inline';
      this.toggleBtn.style.right = `${this.toggleBtnRight}px`;
      this.resizeBtn.style.right = `${this.resizeBtnRight}px`;
      this.canvasModel.style.right = `${this.canvasRight}px`;
      this.toggled = false;
    } else {
      this.panel.style.display = 'none';
      this.toggleBtn.style.right = '-16px';
      this.resizeBtn.style.right = '-18px';
      this.canvasModel.style.right = '1px';
      this.toggled = true;
    }
  }

  private resize(): void {
    this.isResizeClicked = true;
    document.addEventListener('mousemove', (event: any) => {
      if (this.isResizeClicked === true) {
        let currentWidth: number = document.body.clientWidth - event.clientX;

        if (currentWidth < this.minWidth) {
          currentWidth = this.minWidth;
        }

        this.toggleBtnRight = currentWidth - resizeOptions.toggleBtn;
        this.resizeBtnRight = currentWidth - resizeOptions.resizeBtn;
        this.canvasRight = currentWidth;

        this.panel.style.width = `${currentWidth}px`;
        this.toggleBtn.style.right = `${this.toggleBtnRight}px`;
        this.resizeBtn.style.right = `${this.resizeBtnRight}px`;
        this.canvasModel.style.right = `${this.canvasRight}px`;
      }
    });

    document.addEventListener('click', (event: any) => {
      this.isResizeClicked = false;
    }, {once: true});

  }
}
