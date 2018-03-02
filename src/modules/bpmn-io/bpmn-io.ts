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
        IShape} from '../../contracts/index';
import environment from '../../environment';

const toggleButtonWidth: number = 13;
const resizeButtonWidth: number = 19;

export class BpmnIo {

  private toggled: boolean = false;
  private toggleButton: HTMLButtonElement;
  private resizeButton: HTMLButtonElement;
  private panel: HTMLElement;
  private canvasModel: HTMLDivElement;
  private refresh: boolean = true;
  private isResizeClicked: boolean = false;

  private toggleButtonRight: number = 337;
  private resizeButtonRight: number = 331;
  private canvasRight: number = 350;
  private minWidth: number = environment.propertyPanel.minWidth;
  private maxWidth: number = document.body.clientWidth - environment.propertyPanel.maxWidth;

  private toggleMinimap: boolean = false;
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
    const minimap: any = document.getElementsByClassName('djs-minimap')[0];
    const minimapViewport: any = document.getElementsByClassName('djs-minimap-viewport')[0];
    const minimapToggle: any = document.getElementsByClassName('djs-minimap-toggle')[0];
    const minimapArea: any = document.getElementsByClassName('djs-minimap-map')[0];

    minimapArea.style.width = '350px';
    minimapArea.style.height = '200px';
    minimapViewport.style.fill = 'rgba(0, 208, 255, 0.13)';

    const expandIcon: HTMLElement = document.createElement('i');
    expandIcon.id = 'expandIcon';
    expandIcon.className = 'glyphicon glyphicon-resize-full';
    expandIcon.style.marginLeft = '5px';
    expandIcon.style.marginTop = '5px';
    expandIcon.style.fontSize = '36px';
    minimapToggle.appendChild(expandIcon);

    const hideMinimap: HTMLElement = document.createElement('p');
    hideMinimap.id = 'hideMinimap';
    hideMinimap.style.marginLeft = '134px';
    hideMinimap.textContent = 'Hide Minimap';
    hideMinimap.style.display = 'none';
    minimapToggle.appendChild(hideMinimap);
    minimapToggle.addEventListener('click', this.toggleMinimapFunction);

    window.addEventListener('resize', this.resizeEventHandler);
  }

  private toggleMinimapFunction = (): void => {
    const minimapToggle: any = document.getElementsByClassName('djs-minimap-toggle')[0];
    const expandIcon: any = document.getElementById('expandIcon');
    const hideMinimap: any = document.getElementById('hideMinimap');
    if (this.toggleMinimap === false) {
      expandIcon.style.display = 'none';
      hideMinimap.style.display = 'inline';
      minimapToggle.style.height = '20px';
      this.toggleMinimap = true;
    } else {
      expandIcon.style.display = 'inline-block';
      hideMinimap.style.display = 'none';
      this.toggleMinimap = false;
    }
  }

  public detached(): void {
    window.removeEventListener('resize', this.resizeEventHandler);
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

  public togglePanel(): void {
    if (this.toggled === true) {
      this.panel.style.display = 'inline';
      this.toggleButton.style.right = `${this.toggleButtonRight}px`;
      this.resizeButton.style.right = `${this.resizeButtonRight}px`;
      this.canvasModel.style.right = `${this.canvasRight}px`;
      this.toggled = false;
    } else {
      this.panel.style.display = 'none';
      this.toggleButton.style.right = '-16px';
      this.resizeButton.style.right = '-18px';
      this.canvasModel.style.right = '1px';
      this.toggled = true;
    }
  }

  public resize(): void {
    this.isResizeClicked = true;
    document.addEventListener('mousemove', (event: any) => {
      if (this.isResizeClicked === false) {
        return;
      }
      let currentWidth: number = document.body.clientWidth - event.clientX;

      if (currentWidth < this.minWidth) {
        currentWidth = this.minWidth;
      } else if (currentWidth > this.maxWidth) {
        currentWidth = this.maxWidth;
      }

      this.toggleButtonRight = currentWidth - toggleButtonWidth;
      this.resizeButtonRight = currentWidth - resizeButtonWidth;
      this.canvasRight = currentWidth;

      this.panel.style.width = `${currentWidth}px`;
      this.toggleButton.style.right = `${this.toggleButtonRight}px`;
      this.resizeButton.style.right = `${this.resizeButtonRight}px`;
      this.canvasModel.style.right = `${this.canvasRight}px`;
    });

    document.addEventListener('click', (event: any) => {
      this.isResizeClicked = false;
    }, {once: true});

  }

  private resizeEventHandler = (event: any): void => {
    this.maxWidth = document.body.clientWidth - environment.propertyPanel.maxWidth;
  }
}
