import {bindable, inject} from 'aurelia-framework';
import * as spectrum from 'spectrum-colorpicker';
import {ElementDistributeOptions,
        IBpmnFunction,
        IBpmnModeler,
        IColorPickerSettings,
        IModdleElement,
        IModeling,
        IShape,
        NotificationType} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

@inject('NotificationService')
export class DiagrammToolsRight {

  @bindable()
  public modeler: IBpmnModeler;

  public colorPickerBorder: HTMLInputElement;
  public colorPickerFill: HTMLInputElement;
  public colorPickerLoaded: boolean = false;

  private fillColor: string;
  private borderColor: string;
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  public detached(): void {
    $(this.colorPickerBorder).spectrum('destroy');
    $(this.colorPickerFill).spectrum('destroy');
  }

  public setColor(fillColor: string, strokeColor: string): void {
    const modeling: IModeling = this.modeler.get('modeling');

    const selectedElements: Array<IShape> = this._getSelectedElements();

    if (selectedElements.length < 1 || selectedElements.length === 1 && selectedElements[0].$type === 'bpmn:Collaboration') {
      this.notificationService.showNotification(NotificationType.ERROR, 'Error while changing the color: No valid element was selected.');
      return;
    }

    modeling.setColor(selectedElements, {
      fill: fillColor,
      stroke: strokeColor,
    });
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

  public getColors(): Array<string> {
    const selectedElements: Array<IShape> = this._getSelectedElements();

    if (!selectedElements || !selectedElements[0] || !selectedElements[0].businessObject) {
      return [undefined, undefined];
    }

    const firstElement: IModdleElement = selectedElements[0].businessObject;
    const fillColor: string = firstElement.di.fill;
    const borderColor: string = firstElement.di.stroke;

    return [fillColor, borderColor];
  }

  public updateCustomColors(): void {
    if (!this.colorPickerLoaded) {
      this._activateColorPicker();
    }

    [this.fillColor, this.borderColor] = this.getColors();

    $(this.colorPickerFill).spectrum('set', this.fillColor);
    $(this.colorPickerBorder).spectrum('set', this.borderColor);
  }

  public distributeElementsVertical(): void {
    this._distributeElements(ElementDistributeOptions.VERTICAL);
  }

  private _distributeElements(option: ElementDistributeOptions): void {
    const distribute: IBpmnFunction = this.modeler.get('distributeElements');

    const selectedElements: Array<IShape> = this._getSelectedElements();

    distribute.trigger(selectedElements, option);
  }

  private _activateColorPicker(): void {
    const borderMoveSetting: spectrum.Options = {
      move: (borderColor: spectrum.tinycolorInstance): void => {
        this.updateBorderColor(borderColor);
      },
    };

    const colorPickerBorderSettings: IColorPickerSettings = Object.assign({}, environment.colorPickerSettings, borderMoveSetting);
    $(this.colorPickerBorder).spectrum(colorPickerBorderSettings);

    const fillMoveSetting: spectrum.Options = {
      move: (fillColor: spectrum.tinycolorInstance): void => {
        this.updateFillColor(fillColor);
      },
    };

    const colorPickerFillSettings: IColorPickerSettings = Object.assign({}, environment.colorPickerSettings, fillMoveSetting);
    $(this.colorPickerFill).spectrum(colorPickerFillSettings);

    this.colorPickerLoaded = true;
  }

  private updateFillColor(fillColor: any): void {
    if (fillColor) {
      this.fillColor = fillColor.toHexString();
    } else {
      this.fillColor = undefined;
    }

    this.setColorPicked();
  }

  private updateBorderColor(borderColor: any): void {
    if (borderColor) {
      this.borderColor = borderColor.toHexString();
    } else {
      this.borderColor = undefined;
    }

    this.setColorPicked();
  }

  private _getSelectedElements(): Array<IShape> {
    return this.modeler.get('selection')._selectedElements;
  }
}
