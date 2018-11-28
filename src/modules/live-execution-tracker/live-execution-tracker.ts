
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {IIdentity} from '@essential-projects/iam_contracts';
import * as bundle from '@process-engine/bpmn-js-custom-bundle';

import {Correlation, CorrelationProcessModel, IManagementApi, TokenHistoryEntry} from '@process-engine/management_api_contracts';

import { ActiveToken } from '@process-engine/kpi_api_contracts';
import {
  defaultBpmnColors,
  IAuthenticationService,
  IBpmnModeler,
  IBpmnXmlSaveOptions,
  IColorPickerColor,
  IElementRegistry,
  IEvent,
  IModdleElement,
  IModeling,
  IShape,
  NotificationType,
} from '../../contracts/index';
import environment from '../../environment';
import {IInspectCorrelationService} from '../inspect/inspect-correlation/contracts';
import {NotificationService} from '../notification/notification.service';

interface RouteParameters {
  correlationId: string;
  processModelId: string;
}

@inject(Router, 'NotificationService', 'AuthenticationService', 'ManagementApiClientService', 'InspectCorrelationService')
export class LiveExecutionTracker {
  public canvasModel: HTMLElement;

  private _diagramModeler: IBpmnModeler;
  private _diagramViewer: IBpmnModeler;
  private _modeling: IModeling;
  private _elementRegistry: IElementRegistry;

  private _router: Router;
  private _notificationService: NotificationService;
  private _authenticationService: IAuthenticationService;
  private _managementApiClient: IManagementApi;
  private _inspectCorrelationService: IInspectCorrelationService;

  private _correlationId: string;
  private _processModelId: string;

  private _pollingTimer: NodeJS.Timer;
  private _activeTokens: Array<ActiveToken>;

  constructor(router: Router,
              notificationService: NotificationService,
              authenticationService: IAuthenticationService,
              managementApiClient: IManagementApi,
              inspectCorrelationService: IInspectCorrelationService) {

    this._router = router;
    this._notificationService = notificationService;
    this._authenticationService = authenticationService;
    this._managementApiClient = managementApiClient;
    this._inspectCorrelationService = inspectCorrelationService;
  }

  public activate(routeParameters: RouteParameters): void {
    this._correlationId = routeParameters.correlationId;
    this._processModelId = routeParameters.processModelId;
  }

  public async attached(): Promise<void> {
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

    const xml: string = await this._getXml();
    const colorizedXml: string = await this._colorizeXml(xml);
    this._activeTokens = await this._getActiveTokensForProcessInstance();

    this._importXml(this._diagramViewer, colorizedXml);

    this._diagramViewer.on('element.click', async(event: IEvent) => {
      const element: IShape = event.element;

      const elementIsNotAUserOrManualTask: boolean = element.type !== 'bpmn:UserTask'
                                              && element.type !== 'bpmn:ManualTask';

      if (elementIsNotAUserOrManualTask) {
        return;
      }

      const elementHasNoActiveToken: boolean = !(await this._hasElementActiveToken(element.id));
      if (elementHasNoActiveToken) {
        return;
      }

      this._router.navigateToRoute('task-dynamic-ui', {
        correlationId: this._correlationId,
        processModelId: this._processModelId,
        taskId: element.id,
      });
    });
  }

  private async _colorizeXml(xml: string): Promise<string> {
    await this._importXml(this._diagramModeler, xml);

    this._clearColors();

    const allElements: Array<IShape> = this._elementRegistry.getAll();

    const elementsWithActiveToken: Array<IShape> = [];
    const elementsWithTokenHistory: Array<IShape> = [];

    for (const element of allElements) {
      const elementHasActiveToken: boolean = await this._hasElementActiveToken(element.id);

      if (elementHasActiveToken) {
        elementsWithActiveToken.push(element);

        const incomignElementsAsIModdleElement: Array<IModdleElement> = element.businessObject.incoming;

        const elementHasIncomingElements: boolean = incomignElementsAsIModdleElement === undefined;
        if (elementHasIncomingElements) {
          continue;
        }

        for (const incomingElement of incomignElementsAsIModdleElement) {
          const incomingElemenAsShape: IShape = this._elementRegistry.get(incomingElement.id);

          elementsWithTokenHistory.push(incomingElemenAsShape);
        }

        continue;
      }

      const elementHasTokenHistory: boolean = await this._hasElementTokenHistory(element.id);

      if (elementHasTokenHistory) {
        elementsWithTokenHistory.push(element);

        const incomignElementsAsIModdleElement: Array<IModdleElement> = element.businessObject.incoming;

        const elementHasIncomingElements: boolean = incomignElementsAsIModdleElement === undefined;
        if (elementHasIncomingElements) {
          continue;
        }

        for (const incomingElement of incomignElementsAsIModdleElement) {
          const incomingElemenAsShape: IShape = this._elementRegistry.get(incomingElement.id);

          elementsWithTokenHistory.push(incomingElemenAsShape);
        }
      }
    }

    this._colorizeElements(elementsWithActiveToken, defaultBpmnColors.orange);
    this._colorizeElements(elementsWithTokenHistory, defaultBpmnColors.green);

    const colorizedXml: string = await this._exportXml(this._diagramModeler);

    return colorizedXml;
  }

  private async _getActiveTokensForProcessInstance(): Promise<Array<ActiveToken>> {
    const identity: IIdentity = this._getIdentity();

    const activeTokensForProcessModel: Array<ActiveToken> = await this._managementApiClient
      .getActiveTokensForProcessModel(identity, this._processModelId);

    const activeTokensForProcessInstance: Array<ActiveToken> = activeTokensForProcessModel.filter((activeToken: ActiveToken) => {
      const activeTokenIsFromCorrectCorrelation: boolean = activeToken.correlationId === this._correlationId;

      return activeTokenIsFromCorrectCorrelation;
    });

    return activeTokensForProcessInstance;
  }

  private _colorizeElements(elements: Array<IShape>, color: IColorPickerColor): void {
    const noElementsToColorize: boolean = elements.length === 0;
    if (noElementsToColorize) {
      return;
    }

    this._modeling.setColor(elements, {
      stroke: color.border,
      fill: color.fill,
    });
  }

  private async _hasElementTokenHistory(elementId: string): Promise<boolean> {
    const token: Array<TokenHistoryEntry> = await this._inspectCorrelationService
      .getTokenForFlowNodeInstance(this._processModelId, this._correlationId, elementId);

    return token !== undefined && token.length > 0;
  }

  private async _hasElementActiveToken(elementId: string): Promise<boolean> {
    const identity: IIdentity = this._getIdentity();

    const activeTokensForFlowNode: Array<ActiveToken> = await this._managementApiClient.getActiveTokensForFlowNode(identity, elementId);

    const activeTokenForFlowNodeInstance: ActiveToken = activeTokensForFlowNode.find((token: ActiveToken) => {
      const activeTokenIsFromCorrectInstance: boolean = token.correlationId === this._correlationId
                                                     && token.processModelId === this._processModelId;
      return activeTokenIsFromCorrectInstance;
    });

    return activeTokenForFlowNodeInstance !== undefined;
  }

  private async _getXml(): Promise<string> {
    const identity: IIdentity = this._getIdentity();

    const correlation: Correlation = await this._managementApiClient.getCorrelationById(identity, this._correlationId);
    const processModelFromCorrelation: CorrelationProcessModel = correlation.processModels.find((processModel: CorrelationProcessModel) => {
      const processModelIsSearchedProcessModel: boolean = processModel.name === this._processModelId;

      return processModelIsSearchedProcessModel;
    });

    const xmlFromProcessModel: string = processModelFromCorrelation.xml;

    return xmlFromProcessModel;
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

  private async _importXml(modeler: IBpmnModeler, xml: string): Promise<void> {
    const xmlIsNotLoaded: boolean = (xml === undefined || xml === null);

    if (xmlIsNotLoaded) {
      const notificationMessage: string = 'The xml could not be loaded. Please try to reopen the Inspect Correlation View.';
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

  private async _exportXml(modeler: IBpmnModeler): Promise<string> {
    const saveXmlPromise: Promise<string> = new Promise((resolve: Function, reject: Function): void =>  {
      const xmlSaveOptions: IBpmnXmlSaveOptions = {
        format: true,
      };

      modeler.saveXML(xmlSaveOptions, async(saveXmlError: Error, xml: string) => {
        if (saveXmlError) {
          reject(saveXmlError);

          return;
        }

        resolve(xml);
      });
    });

    return saveXmlPromise;
  }

  private async _startPolling(): Promise<void> {
    this._pollingTimer = setTimeout(async() => {
      const activeTokensForProcessInstance: Array<ActiveToken> = await this._getActiveTokensForProcessInstance();

      const activeTokensChanged: boolean = this._activeTokens !== activeTokensForProcessInstance;
      if (activeTokensChanged) {
        const xml: string = await this._getXml();
        const colorizedXml: string = await this._colorizeXml(xml);
        this._activeTokens = await this._getActiveTokensForProcessInstance();

        this._importXml(this._diagramViewer, colorizedXml);
      }

      const correlationIsStillActive: boolean = await this._isCorrelationStillActive();

      if (correlationIsStillActive) {
        this._startPolling();
      }
    }, environment.processengine.liveExecutionTrackerPollingIntervalInMs);
  }

  private async _isCorrelationStillActive(): Promise<boolean> {
    const identity: IIdentity = this._getIdentity();

    const allActiveCorrelations: Array<Correlation> = await this._managementApiClient.getActiveCorrelations(identity);

    const correlationIsNotActive: boolean = !allActiveCorrelations.some((activeCorrelation: Correlation) => {
      return activeCorrelation.id === this._correlationId;
    });

    if (correlationIsNotActive) {
      this._correlationEnded();
    }

    return !correlationIsNotActive;
 }

  private _correlationEnded(): void {
    this._notificationService.showNotification(NotificationType.INFO, 'Process stopped.');

    this._router.navigateToRoute('inspect');
  }

  private _getIdentity(): IIdentity {
    const accessToken: string = this._authenticationService.getAccessToken();
    const identity: IIdentity = {
      token: accessToken,
    };

    return identity;
  }
}
