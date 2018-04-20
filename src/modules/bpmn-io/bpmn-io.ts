import * as bundle from '@process-engine/bpmn-js-custom-bundle';
import {bindable, observable} from 'aurelia-framework';
import * as spectrum from 'spectrum-colorpicker';
import { setTimeout } from 'timers';
import * as toastr from 'toastr';
import {ElementDistributeOptions,
        IBpmnFunction,
        IBpmnModeler,
        IDefinition,
        IModdleElement,
        IModeling,
        IProcessDefEntity,
        IShape} from '../../contracts/index';
import environment from '../../environment';

const toggleButtonWidth: number = 13;
const resizeButtonWidth: number = 19;
const sideBarRightSize: number = 45;

interface BpmnStudioColorPickerSettings {
  clickoutFiresChange: boolean;
  showPalette: boolean;
  palette: Array<Array<string>>;
  localStorageKey: string;
  showInitial: boolean;
  showInput: boolean;
  allowEmpty: boolean;
  showButtons: boolean;
  showPaletteOnly: boolean;
  togglePaletteOnly: boolean;

  move?(color: spectrum.tinycolorInstance): void;
}

export class BpmnIo {
  private fillColor: string;
  private borderColor: string;

  private toggled: boolean = false;
  private toggleButton: HTMLButtonElement;
  private resizeButton: HTMLButtonElement;
  private panel: HTMLElement;
  private canvasModel: HTMLDivElement;
  private refresh: boolean = true;
  private isResizeClicked: boolean = false;
  private showXMLView: boolean = false;

  private toggleButtonRight: number = 282;
  private resizeButtonRight: number = 276;
  private canvasRight: number = 350;
  private minWidth: number = environment.propertyPanel.minWidth;
  private maxWidth: number = document.body.clientWidth - environment.propertyPanel.maxWidth;

  private toggleMinimap: boolean = false;
  private minimapToggle: any;
  private expandIcon: HTMLElement;
  private hideMinimap: HTMLElement;

  @bindable({changeHandler: 'xmlChanged'}) public xml: string;

  public initialLoadingFinished: boolean;
  public modeler: IBpmnModeler;
  public colorPickerBorder: HTMLInputElement;
  public colorPickerFill: HTMLInputElement;
  public colorPickerLoaded: boolean = false;
  public env: any;

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
    this.modeler.attachTo(this.canvasModel);
    const minimapViewport: any = this.canvasModel.getElementsByClassName('djs-minimap-viewport')[0];
    const minimapArea: any = this.canvasModel.getElementsByClassName('djs-minimap-map')[0];
    this.minimapToggle = this.canvasModel.getElementsByClassName('djs-minimap-toggle')[0];

    minimapArea.style.width = '350px';
    minimapArea.style.height = '200px';
    minimapViewport.style.fill = 'rgba(0, 208, 255, 0.13)';

    this.expandIcon = document.createElement('i');
    this.expandIcon.className = 'glyphicon glyphicon-resize-full expandIcon';
    this.minimapToggle.appendChild(this.expandIcon);

    this.hideMinimap = document.createElement('p');
    this.hideMinimap.className = 'hideMinimap';
    this.hideMinimap.textContent = 'Hide Minimap';
    this.minimapToggle.appendChild(this.hideMinimap);
    this.minimapToggle.addEventListener('click', this.toggleMinimapFunction);

    window.addEventListener('resize', this.resizeEventHandler);

    const camundaIcon: any = this.canvasModel.getElementsByClassName('bjs-powered-by')[0];
    camundaIcon.style = 'display: none';

    this.env = environment;

    this.initialLoadingFinished = true;
  }

  public detached(): void {
    this.modeler.detach();
    window.removeEventListener('resize', this.resizeEventHandler);
    $(this.colorPickerBorder).spectrum('destroy');
    $(this.colorPickerFill).spectrum('destroy');
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
      this.toggleButton.style.right = '27px';
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
      currentWidth = currentWidth - sideBarRightSize;

      if (currentWidth < this.minWidth) {
        currentWidth = this.minWidth;
      } else if (currentWidth > this.maxWidth) {
        currentWidth = this.maxWidth;
      }

      this.toggleButtonRight = currentWidth - toggleButtonWidth + sideBarRightSize;
      this.resizeButtonRight = currentWidth - resizeButtonWidth + sideBarRightSize;
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

  public setColorRed(): void {
    this.setColor('#FFCDD2', '#E53935');
  }

  public setColorBlue(): void {
    this.setColor('#BBDEFB', '#1E88E5');
  }

  public setColorOrange(): void {
    this.setColor('#FFE0B2', '#FB8C00');
  }

  public setColorGreen(): void {
    this.setColor('#C8E6C9', '#43A047');
  }

  public setColorPurple(): void {
    this.setColor('#E1BEE7', '#8E24AA');
  }

  public removeColor(): void {
    this.setColor(null, null);
  }

  public setColorPicked(): void {
    this.setColor(this.fillColor, this.borderColor);
  }

  public updateCustomColors(): void {
    if (!this.colorPickerLoaded) {
      this._activateColorPicker();
    }

    [this.fillColor, this.borderColor] = this.getColors();

    $(this.colorPickerFill).spectrum('set', this.fillColor);
    $(this.colorPickerBorder).spectrum('set', this.borderColor);
  }

  public async toggleXMLView(): Promise<void> {
    if (!this.showXMLView) {
      this.xml = await this.getXML();
      this.showXMLView = true;
    } else {
      this.showXMLView = false;
    }
  }

  public distributeElementsHorizontal(): void {
    this.distributeElements(ElementDistributeOptions.HORIZONTAL);
  }

  public distributeElementsVertical(): void {
    this.distributeElements(ElementDistributeOptions.VERTICAL);
  }

  private resizeEventHandler = (event: any): void => {
    this.maxWidth = document.body.clientWidth - environment.propertyPanel.maxWidth;
  }

  private _activateColorPicker(): void {
    const borderMoveSetting: spectrum.Options = {
      move: (borderColor: spectrum.tinycolorInstance): void => {
        this.updateBorderColor(borderColor);
      },
    };

    const colorPickerBorderSettings: BpmnStudioColorPickerSettings = Object.assign({}, environment.colorPickerSettings, borderMoveSetting);
    $(this.colorPickerBorder).spectrum(colorPickerBorderSettings);

    const fillMoveSetting: spectrum.Options = {
      move: (fillColor: spectrum.tinycolorInstance): void => {
        this.updateFillColor(fillColor);
      },
    };

    const colorPickerFillSettings: BpmnStudioColorPickerSettings = Object.assign({}, environment.colorPickerSettings, fillMoveSetting);
    $(this.colorPickerFill).spectrum(colorPickerFillSettings);

    this.colorPickerLoaded = true;
  }

  private toggleMinimapFunction = (): void => {
    if (this.toggleMinimap === false) {
      this.expandIcon.style.display = 'none';
      this.hideMinimap.style.display = 'inline';
      this.minimapToggle.style.height = '20px';
      this.toggleMinimap = true;
    } else {
      this.expandIcon.style.display = 'inline-block';
      this.hideMinimap.style.display = 'none';
      this.toggleMinimap = false;
    }
  }

  private updateFillColor(fillColor: any): void {
    if (fillColor) {
      this.fillColor = fillColor.toHexString();
    } else {
      this.fillColor = null;
    }

    this.setColorPicked();
  }

  private updateBorderColor(borderColor: any): void {
    if (borderColor) {
      this.borderColor = borderColor.toHexString();
    } else {
      this.borderColor = null;
    }

    this.setColorPicked();
  }

}
