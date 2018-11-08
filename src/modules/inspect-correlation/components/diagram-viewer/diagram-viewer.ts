import {bindable, inject} from 'aurelia-framework';

import * as bundle from '@process-engine/bpmn-js-custom-bundle';
import {Correlation} from '@process-engine/management_api_contracts';
import {CorrelationProcessModel} from '@process-engine/management_api_contracts';

import {
  defaultBpmnColors,
  IBpmnModeler,
  IBpmnXmlSaveOptions,
  IColorPickerColor,
  IElementRegistry,
  IEvent,
  IModeling,
  IShape,
  NotificationType,
} from '../../../../contracts/index';
import {NotificationService} from '../../../notification/notification.service';

@inject('NotificationService', 'ManagementApiClientService', 'AuthenticationService')
export class DiagramViewer {
  @bindable() public correlation: Correlation;
  @bindable() public xml: string;
  @bindable() public processModelId: string;
  @bindable() public selectedFlowNode: IShape;
  public xmlIsNotSelected: boolean = true;
  public canvasModel: HTMLElement;

  private _notificationService: NotificationService;
  private _elementRegistry: IElementRegistry;
  private _diagramModeler: IBpmnModeler;
  private _diagramViewer: IBpmnModeler;
  private _modeling: IModeling;
  private _uncoloredXml: string;

  constructor(notificationService: NotificationService) {
    this._notificationService = notificationService;
  }

  public attached(): void {
    this._diagramModeler = new bundle.modeler();
    this._diagramViewer = new bundle.viewer({
      additionalModules:
      [
        bundle.ZoomScrollModule,
        bundle.MoveCanvasModule,
      ],
    });

    this._modeling = this._diagramModeler.get('modeling');
    this._elementRegistry = this._diagramModeler.get('elementRegistry');

    this._diagramViewer.attachTo(this.canvasModel);

    this._diagramViewer.on('element.click', async(event: IEvent) => {
      await this._colorizeSelection(event.element);

      this.selectedFlowNode = event.element;
    });

  }

  public detached(): void {
    const bjsContainer: Element = this.canvasModel.getElementsByClassName('bjs-container')[0];

    const bjsContainerIsExisting: boolean = this.canvasModel !== undefined
                                            && this.canvasModel !== null
                                            && this.canvasModel.childElementCount > 1
                                            && bjsContainer !== undefined
                                            && bjsContainer !== null;

    if (bjsContainerIsExisting) {
      this.canvasModel.removeChild(bjsContainer);
    }

    const diagramViewerIsExisting: boolean = this._diagramViewer !== undefined;

    if (diagramViewerIsExisting) {
      this._diagramViewer.detach();
      this._diagramViewer.destroy();

      this._diagramViewer = undefined;
      this.xml = undefined;
      this.xmlIsNotSelected = true;
    }
  }

  public async correlationChanged(newValue: Correlation): Promise<void> {
    const noCorrelation: boolean = newValue === undefined;
    if (noCorrelation) {
      return;
    }

    this.xml = await this._getXmlByCorrelation(this.correlation);

    await this._importXml(this._diagramModeler, this.xml);
    this._clearColors();
    this._uncoloredXml = await this._getXmlFromModeler();

    await this._importXml(this._diagramViewer, this._uncoloredXml);
  }

  public processModelIdChanged(): void {
    if (this._diagramViewer === undefined) {
      return;
    }

    this._diagramViewer.clear();
    this.xmlIsNotSelected = true;
  }

  public xmlChanged(): void {
    this.xmlIsNotSelected = this.xml === undefined;
  }

  private async _getXmlByCorrelation(correlation: Correlation): Promise<string> {
    const processModelForCorrelation: CorrelationProcessModel = correlation.processModels.find((processModel: CorrelationProcessModel) => {
      return processModel.name === this.processModelId;
    });

    const xmlForCorrelation: string = processModelForCorrelation.xml;

    return xmlForCorrelation;
  }

  private async _colorizeSelection(selectedElement: IShape): Promise<void> {
    await this._importXml(this._diagramModeler, this._uncoloredXml);

    const elementToColorize: IShape = this._elementRegistry.filter((element: IShape): boolean => {
      return element.id === selectedElement.id;
    })[0];
    this._colorElement(elementToColorize, defaultBpmnColors.grey);

    const colorizedXml: string = await this._getXmlFromModeler();
    this._importXml(this._diagramViewer, colorizedXml);
  }

  private _clearColors(): void {
    const elementsWithColor: Array<IShape> = this._elementRegistry.filter((element: IShape): boolean => {
      const elementHasFillColor: boolean = element.businessObject.di.fill !== undefined;
      const elementHasBorderColor: boolean = element.businessObject.di.stroke !== undefined;

      const elementHasColor: boolean = elementHasFillColor || elementHasBorderColor;

      return elementHasColor;
    });

    const noElementsWithColor: boolean = elementsWithColor.length === 0;
    if (noElementsWithColor) {
      return;
    }

    this._modeling.setColor(elementsWithColor, {
      stroke: defaultBpmnColors.none.border,
      fill: defaultBpmnColors.none.fill,
    });
  }

  private _colorElements(elementToColor: IShape, color: IColorPickerColor): void {
    const noElementsToColorize: boolean = elementToColor === undefined;

    if (noElementsToColorize) {
      return;
    }

    this._modeling.setColor(elementToColor, {
      stroke: color.border,
      fill: color.fill,
    });
  }

  private async _importXml(modeler: IBpmnModeler, xml: string): Promise<void> {
    const xmlIsNotLoaded: boolean = (this.xml === undefined || this.xml === null);

    if (xmlIsNotLoaded) {
      const notificationMessage: string = 'The xml could not be loaded. Please try to reopen the Diff View or reload the Detail View.';
      this._notificationService.showNotification(NotificationType.ERROR, notificationMessage);

      return;
    }

    const xmlImportPromise: Promise<void> = new Promise((resolve: Function, reject: Function): void => {
      modeler.importXML(xml, (importXmlError: Error) => {
        if (importXmlError) {
          reject(importXmlError);

          return;
        }
        resolve();
      });
    });

    return xmlImportPromise;
  }

  private async _getXmlFromModeler(): Promise<string> {
    const saveXmlPromise: Promise<string> = new Promise((resolve: Function, reject: Function): void =>  {
      const xmlSaveOptions: IBpmnXmlSaveOptions = {
        format: true,
      };

      this._diagramModeler.saveXML(xmlSaveOptions, async(saveXmlError: Error, xml: string) => {
        if (saveXmlError) {
          reject(saveXmlError);

          return;
        }

        resolve(xml);
      });
    });

    return saveXmlPromise;
  }
}
