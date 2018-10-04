import {bindable, inject} from 'aurelia-framework';

import * as bundle from '@process-engine/bpmn-js-custom-bundle';
import {Correlation} from '@process-engine/management_api_contracts';
import {CorrelationProcessModel} from '@process-engine/management_api_contracts';

import {IBpmnModeler, IEvent, NotificationType} from '../../../../contracts/index';
import {NotificationService} from '../../../notification/notification.service';

@inject('NotificationService', 'ManagementApiClientService', 'AuthenticationService')
export class DiagramViewer {
  @bindable() public correlation: Correlation;
  @bindable() public xml: string;
  @bindable() public processModelId: string;
  @bindable() public selectedFlowNodeId: string;
  public xmlIsNotSelected: boolean = true;
  public canvasModel: HTMLElement;
  public showDiagram: boolean = true;

  private _notificationService: NotificationService;
  private _diagramViewer: IBpmnModeler;

  constructor(notificationService: NotificationService) {
    this._notificationService = notificationService;
  }

  public attached(): void {
    this._diagramViewer = new bundle.viewer({
      additionalModules:
      [
        bundle.ZoomScrollModule,
        bundle.MoveCanvasModule,
      ],
    });

    this._diagramViewer.attachTo(this.canvasModel);

    this._diagramViewer.on('element.click', (event: IEvent) => {
      this.selectedFlowNodeId = event.element.id;
    });

  }

  public async correlationChanged(): Promise<void> {
    this.xml = await this._getXmlByCorrelation(this.correlation);

    this._importXml();
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

  private async _importXml(): Promise<void> {
    const xmlIsNotLoaded: boolean = (this.xml === undefined || this.xml === null);

    if (xmlIsNotLoaded) {
      const notificationMessage: string = 'The xml could not be loaded. Please try to reopen the Diff View or reload the Detail View.';
      this._notificationService.showNotification(NotificationType.ERROR, notificationMessage);

      return;
    }

    const xmlImportPromise: Promise<void> = new Promise((resolve: Function, reject: Function): void => {
      this._diagramViewer.importXML(this.xml, (importXmlError: Error) => {
        if (importXmlError) {
          reject(importXmlError);

          return;
        }
        resolve();
      });
    });

    return xmlImportPromise;
  }
}
