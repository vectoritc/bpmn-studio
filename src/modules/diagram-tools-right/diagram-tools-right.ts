import {bindable, inject} from 'aurelia-framework';
import environment from '../../environment';

import * as spectrum from 'spectrum-colorpicker';
import 'spectrum-colorpicker/spectrum';

import {ElementDistributeOptions,
        IBpmnFunction,
        IBpmnModeler,
        IColorPickerSettings,
        IModdleElement,
        IModeling,
        IShape,
        NotificationType} from '../../contracts/index';
import {NotificationService} from '../notification/notification.service';

@inject('NotificationService')
export class DiagramToolsRight {

  @bindable()
  public modeler: IBpmnModeler;

  public colorPickerBorder: HTMLInputElement;
  public colorPickerFill: HTMLInputElement;
  public colorPickerLoaded: boolean = false;
  public fillColor: string;
  public borderColor: string;
  
  private _notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this._notificationService = notificationService;
  }

  public detached(): void {
    $(this.colorPickerBorder).spectrum('destroy');
    $(this.colorPickerFill).spectrum('destroy');

    window.localStorage.removeItem('borderColors');
    window.localStorage.removeItem('fillColors');
  }

  public setColorRed(): void {
    this._setColor('#FFCDD2', '#E53935');
  }

  public setColorBlue(): void {
    this._setColor('#BBDEFB', '#1E88E5');
  }

  public setColorGreen(): void {
    this._setColor('#C8E6C9', '#43A047');
  }

  public setColorPurple(): void {
    this._setColor('#E1BEE7', '#8E24AA');
  }

  public setColorOrange(): void {
    this._setColor('#FFE0B2', '#FB8C00');
  }

  public removeColor(): void {
    this._setColor(null, null);
  }

  public setPickedColor(): void {
    this._setColor(this.fillColor, this.borderColor);
  }

  public updateCustomColors(): void {
    if (!this.colorPickerLoaded) {
      this._activateColorPicker();
    }

    [this.fillColor, this.borderColor] = this._getColors();

    $(this.colorPickerFill).spectrum('set', this.fillColor);
    $(this.colorPickerBorder).spectrum('set', this.borderColor);
  }

  public distributeElementsVertically(): void {
    this._distributeElementsVertically();
  }

  public distributeElementsHorizontally(): void {
    this._distributeElementsHorizontally();
  }

  private _setColor(fillColor: string, strokeColor: string): void {
    const modeling: IModeling = this.modeler.get('modeling');

    const selectedElements: Array<IShape> = this._getSelectedElements();

    const isNoValidElement: boolean = selectedElements.length < 1
                                    || selectedElements.length === 1
                                    && selectedElements[0].$type === 'bpmn:Collaboration';

    if (isNoValidElement) {
      this._notificationService.showNotification(NotificationType.ERROR, 'Error while changing the color: No valid element was selected.');
      return;
    }

    modeling.setColor(selectedElements, {
      fill: fillColor,
      stroke: strokeColor,
    });
  }

  private _getColors(): Array<string> {
    const selectedElements: Array<IShape> = this._getSelectedElements();

    const noElementSelected: boolean = !selectedElements || !selectedElements[0] || !selectedElements[0].businessObject;

    if (noElementSelected) {
      const undefinedFillColorUndefinedBorderColor: Array<string> = [undefined, undefined];
      return undefinedFillColorUndefinedBorderColor;
    }

    const firstElement: IModdleElement = selectedElements[0].businessObject;
    const fillColor: string = firstElement.di.fill;
    const borderColor: string = firstElement.di.stroke;

    return [fillColor, borderColor];
  }

  private _distributeElementsVertically(): void {
    const distributor: IBpmnFunction = this.modeler.get('distributeElements');

    const elements: Array<IShape> = this._getSelectedElements();

    distributor
      .trigger(
        elements,
        ElementDistributeOptions.VERTICAL,
      );
  }

  private _distributeElementsHorizontally(): void {
    const distributor: IBpmnFunction = this.modeler.get('distributeElements');

    const elements: Array<IShape> = this._getSelectedElements();

    distributor
      .trigger(
        elements,
        ElementDistributeOptions.HORIZONTAL,
      );
  }

  private _activateColorPicker(): void {
    window.localStorage.removeItem('borderColors');
    window.localStorage.removeItem('fillColors');

    // Colorpicker bordercolor
    const borderMoveSetting: spectrum.Options = {
      move: (borderColor: spectrum.tinycolorInstance): void => {
        this._updateBorderColor(borderColor);
      },
    };

    const borderLocalStorageKey: spectrum.Options = { localStorageKey: 'borderColors' };

    const borderDefaultColors: Array<string> = ['#E53935', '#1E88E5', '#43A047', '#8E24AA', '#FB8C00'];
    const borderDefaultPalette: spectrum.Options = { palette: borderDefaultColors };

    const colorPickerBorderSettings: IColorPickerSettings = Object.assign({},
      environment.colorPickerSettings,
      borderDefaultPalette,
      borderLocalStorageKey,
      borderMoveSetting);

    $(this.colorPickerBorder).spectrum(colorPickerBorderSettings);

    // Colorpicker fillcolor
    const fillMoveSetting: spectrum.Options = {
      move: (fillColor: spectrum.tinycolorInstance): void => {
        this._updateFillColor(fillColor);
      },
    };

    const fillLocalStorageKey: spectrum.Options = { localStorageKey: 'fillColors' };

    const fillDefaultColors: Array<string> = ['#FFCDD2', '#BBDEFB', '#C8E6C9', '#E1BEE7', '#FFE0B2'];
    const fillDefaultPalette: spectrum.Options = { palette: fillDefaultColors };

    const colorPickerFillSettings: IColorPickerSettings = Object.assign({},
      environment.colorPickerSettings,
      fillDefaultPalette,
      fillLocalStorageKey,
      fillMoveSetting);

    $(this.colorPickerFill).spectrum(colorPickerFillSettings);

    this.colorPickerLoaded = true;
  }

  private _updateFillColor(fillColor: spectrum.tinycolorInstance): void {
    if (fillColor) {
      this.fillColor = fillColor.toHexString();
    } else {
      this.fillColor = undefined;
    }

    this.setPickedColor();
  }

  private _updateBorderColor(borderColor: spectrum.tinycolorInstance): void {
    if (borderColor) {
      this.borderColor = borderColor.toHexString();
    } else {
      this.borderColor = undefined;
    }

    this.setPickedColor();
  }

  private _getSelectedElements(): Array<IShape> {
    return this.modeler.get('selection')._selectedElements;
  }
}
