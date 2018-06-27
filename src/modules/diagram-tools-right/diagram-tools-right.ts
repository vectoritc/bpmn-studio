import {bindable, inject} from 'aurelia-framework';
import environment from '../../environment';

import * as spectrum from 'spectrum-colorpicker';
import 'spectrum-colorpicker/spectrum';

import {ElementDistributeOptions,
        IBpmnFunction,
        IBpmnModeler,
        IColorPickerColor,
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

  private _red: IColorPickerColor = {
    fill: '#FFCDD2',
    border: '#E53935',
  };
  private _blue: IColorPickerColor = {
    fill: '#BBDEFB',
    border: '#1E88E5',
  };
  private _green: IColorPickerColor = {
    fill: '#C8E6C9',
    border: '#43A047',
  };
  private _purple: IColorPickerColor = {
    fill: '#E1BEE7',
    border: '#8E24AA',
  };
  private _orange: IColorPickerColor = {
    fill: '#FFE0B2',
    border: '#FB8C00',
  };
  private _none: IColorPickerColor = {
    fill: null,
    border: null,
  };

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
    this._setColor(this._red);
  }

  public setColorBlue(): void {
    this._setColor(this._blue);
  }

  public setColorGreen(): void {
    this._setColor(this._green);
  }

  public setColorPurple(): void {
    this._setColor(this._purple);
  }

  public setColorOrange(): void {
    this._setColor(this._orange);
  }

  public removeColor(): void {
    this._setColor(this._none);
  }

  public setPickedColor(): void {
    const customColor: IColorPickerColor = {fill: this.fillColor, border: this.borderColor};

    this._setColor(customColor);
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

  private _setColor(color: IColorPickerColor): void {
    const modeling: IModeling = this.modeler.get('modeling');

    const selectedElements: Array<IShape> = this._getSelectedElements();

    const elementIsNotValid: boolean = selectedElements.length < 1
                                    || selectedElements.length === 1
                                    && selectedElements[0].$type === 'bpmn:Collaboration';

    if (elementIsNotValid) {
      const notificationMessage: string = 'Unable to apply color. Please select an element and use the color picker again.';
      this._notificationService.showNotification(NotificationType.INFO, notificationMessage);

      return;
    }

    modeling.setColor(selectedElements, {
      fill: color.fill,
      stroke: color.border,
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

    const borderDefaultColors: Array<string> = [this._red.border, this._blue.border, this._green.border, this._purple.border, this._orange.border];
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

    const fillDefaultColors: Array<string> = [this._red.fill, this._blue.fill, this._green.fill, this._purple.fill, this._orange.fill];
    const fillDefaultPalette: spectrum.Options = { palette: fillDefaultColors };

    const colorPickerFillSettings: IColorPickerSettings = Object.assign(
      {},
      environment.colorPickerSettings,
      fillDefaultPalette,
      fillLocalStorageKey,
      fillMoveSetting,
    );

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
