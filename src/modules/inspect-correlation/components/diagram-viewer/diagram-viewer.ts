import {bindable, inject} from 'aurelia-framework';

import * as bundle from '@process-engine/bpmn-js-custom-bundle';

import {Correlation, IManagementApi, ManagementContext, ProcessModelExecution} from '@process-engine/management_api_contracts';
import {IAuthenticationService, IBpmnModeler, NotificationType} from '../../../../contracts/index';
import {NotificationService} from '../../../notification/notification.service';

@inject('NotificationService', 'ManagementApiClientService', 'AuthenticationService')
export class DiagramViewer {
  @bindable({ changeHandler: 'correlationChanged' }) public correlation: Correlation;
  @bindable() public xml: string;
  public canvasModel: HTMLElement;
  public showDiagram: boolean = true;

  private _managementApiService: IManagementApi;
  private _authenticationService: IAuthenticationService;
  private _notificationService: NotificationService;
  private _diagramViewer: IBpmnModeler;

  constructor(notificationService: NotificationService, managementApi: IManagementApi, authenticationService: IAuthenticationService) {
    this._notificationService = notificationService;
    this._managementApiService = managementApi;
    this._authenticationService = authenticationService;
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
  }

  public async correlationChanged(): Promise<void> {
    const correlationId: string = this.correlation.id;
    this.xml = await this.getXmlByCorrelationId(correlationId);

    this._importXml();
  }

  public async getXmlByCorrelationId(correlationId: string): Promise<string> {
    const managementContext: ManagementContext = this._getManagementContext();
    const processModel: ProcessModelExecution.ProcessModel = await this._managementApiService.getProcessModelForCorrelation(managementContext,
                                                                                                                            correlationId);

    return processModel.xml;
  }

  private async _importXml(): Promise <void> {
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

  private _getManagementContext(): ManagementContext {
    const accessToken: string = this._authenticationService.getAccessToken();
    const context: ManagementContext = {
      identity: accessToken,
    };

    return context;
  }
}
