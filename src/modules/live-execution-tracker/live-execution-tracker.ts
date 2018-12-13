import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {IIdentity} from '@essential-projects/iam_contracts';
import * as bundle from '@process-engine/bpmn-js-custom-bundle';

import {
  Correlation,
  CorrelationProcessModel,
  IManagementApi,
  TokenHistoryGroup,
} from '@process-engine/management_api_contracts';

import {ActiveToken} from '@process-engine/kpi_api_contracts';
import {ProcessModel} from '@process-engine/management_api_contracts/dist/data_models';
import {IDiagram} from '@process-engine/solutionexplorer.contracts';
import {
  defaultBpmnColors,
  IAuthenticationService,
  IBpmnModeler,
  IBpmnXmlSaveOptions,
  ICanvas,
  IColorPickerColor,
  IElementRegistry,
  IEvent,
  IModdleElement,
  IModeling,
  IOverlayManager,
  IShape,
  ISolutionEntry,
  ISolutionService,
  NotificationType,
} from '../../contracts/index';
import environment from '../../environment';
import {NotificationService} from '../notification/notification.service';

type RouteParameters = {
  correlationId: string;
  processModelId: string;
};

@inject(Router, 'NotificationService', 'AuthenticationService', 'ManagementApiClientService', 'SolutionService')
export class LiveExecutionTracker {
  public canvasModel: HTMLElement;

  private _diagramModeler: IBpmnModeler;
  private _diagramViewer: IBpmnModeler;
  private _modeling: IModeling;
  private _elementRegistry: IElementRegistry;
  private _viewerCanvas: ICanvas;
  private _overlays: IOverlayManager;

  private _router: Router;
  private _notificationService: NotificationService;
  private _authenticationService: IAuthenticationService;
  private _managementApiClient: IManagementApi;
  private _solutionService: ISolutionService;

  private _correlationId: string;
  private _processModelId: string;

  private _pollingTimer: NodeJS.Timer;
  private _attached: boolean;
  private _previousElementIdsWithActiveToken: Array<string> = [];
  private _activeTokens: Array<ActiveToken>;
  private _retryCount: number = 5;

  private _elementsWithEventListeners: Array<string> = [];

  constructor(router: Router,
              notificationService: NotificationService,
              authenticationService: IAuthenticationService,
              managementApiClient: IManagementApi,
              solutionService: ISolutionService) {

    this._router = router;
    this._notificationService = notificationService;
    this._authenticationService = authenticationService;
    this._managementApiClient = managementApiClient;
    this._solutionService = solutionService;
  }

  public async activate(routeParameters: RouteParameters): Promise<void> {
    this._correlationId = routeParameters.correlationId;
    this._processModelId = routeParameters.processModelId;

    const processEngineRoute: string = window.localStorage.getItem('processEngineRoute');
    const internalProcessEngineRoute: string = window.localStorage.getItem('InternalProcessEngineRoute');
    const processEngineRouteIsSet: boolean = processEngineRoute !== '';

    const connectedProcessEngineRoute: string = processEngineRouteIsSet
                                              ? processEngineRoute
                                              : internalProcessEngineRoute;

    const processEngineSolution: ISolutionEntry = await this._solutionService.getSolutionEntryForUri(connectedProcessEngineRoute);
    const activeDiagram: IDiagram = await this._getProcessModelAndConvertToDiagram(this._processModelId, processEngineSolution);

    this._solutionService.setActiveSolutionEntry(processEngineSolution);
    this._solutionService.setActiveDiagram(activeDiagram);
  }

  public async attached(): Promise<void> {
    this._attached = true;
    this._diagramModeler = new bundle.modeler();
    this._diagramViewer = new bundle.viewer({
      additionalModules:
      [
        bundle.ZoomScrollModule,
        bundle.MoveCanvasModule,
        bundle.MiniMap,
      ],
    });

    this._modeling = this._diagramModeler.get('modeling');
    this._elementRegistry = this._diagramModeler.get('elementRegistry');
    this._viewerCanvas = this._diagramViewer.get('canvas');
    this._overlays = this._diagramViewer.get('overlays');

    this._diagramViewer.attachTo(this.canvasModel);

    const xml: string = await this._getXml();

    const couldNotGetXml: boolean = xml === undefined;
    if (couldNotGetXml) {
      return;
    }

    const colorizedXml: string = await this._colorizeXml(xml);

    await this._importXmlIntoDiagramViewer(colorizedXml);

    this._diagramViewer.on('element.click', this._elementClickHandler);

    this._viewerCanvas.zoom('fit-viewport');

    this._startPolling();
  }

  public detached(): void {
    this._attached = false;
    this._stopPolling();
  }

  /**
   *
   * @param processModelId: string | The ID of a ProcessModel.
   * @param processEngineSolution: ISolutionEntry | The SolutionEntry of the connected ProcessEngine.
   *
   * This method fetches the ProcessModel of an ID and returns the matching diagram as IDiagram.
   * The ProcessEngine Solution is needed to get the correct URI of the diagram.
   */
  private async _getProcessModelAndConvertToDiagram(processModelId: string, processEngineSolution: ISolutionEntry): Promise<IDiagram> {
    const identity: IIdentity = this._getIdentity();

    const processModel: ProcessModel = await this._managementApiClient.getProcessModelById(identity, processModelId);

    const diagram: IDiagram = {
      id: processModel.id,
      xml: processModel.xml,
      uri: `${processEngineSolution.uri}/api/management/v1/${processModel.id}`,
      name: processModelId,
    };

    return diagram;
  }

  private async _colorizeXml(xml: string): Promise<string | null> {
    // Import the xml to the modeler to add colors to it
    await this._importXmlIntoDiagramModeler(xml);

    // Get all elements that can have a token
    const allElements: Array<IShape> = this._elementRegistry.filter((element: IShape): boolean => {
      const elementCanHaveAToken: boolean = element.type !== 'bpmn:SequenceFlow'
                                         && element.type !== 'bpmn:Collaboration'
                                         && element.type !== 'bpmn:Participant'
                                         && element.type !== 'bpmn:Lane'
                                         && element.type !== 'label';

      return elementCanHaveAToken;
    });

    // Get all elements that already have an active token.
    const elementsWithActiveToken: Array<IShape> = await this._getElementsWithActiveToken(allElements);

    // If the backend returned an error the diagram should not be rendered.
    const couldNotGetActiveTokens: boolean = elementsWithActiveToken === null;
    if (couldNotGetActiveTokens) {
      return null;
    }

    // Get all elements that already have a token.
    const elementsWithTokenHistory: Array<IShape> = await this._getElementsWithTokenHistory(allElements);

    // If the backend returned an error the diagram should not be rendered.
    const couldNotGetTokenHistory: boolean = elementsWithTokenHistory === null;
    if (couldNotGetTokenHistory) {
      return null;
    }

    /*
     * Remove all colors if the diagram has already colored elements.
     * For example, if the user has some elements colored orange and is running
     * the diagram, one would think in LiveExecutionTracker that the element is
     * active although it is not active.
    */
    this._clearColors();

    // Colorize the found elements and add overlay to those that can be started.
    this._colorizeElements(elementsWithTokenHistory, defaultBpmnColors.green);
    this._colorizeElements(elementsWithActiveToken, defaultBpmnColors.orange);
    this._addOverlaysToUserAndManualTasks(elementsWithActiveToken);

    // Get the elementIds of the elements with an active token and sort them alphabetically
    this._previousElementIdsWithActiveToken = elementsWithActiveToken.map((element: IShape) => element.id).sort();

    // Export the colored xml from the modeler
    const colorizedXml: string = await this._exportXmlFromDiagramModeler();
    return colorizedXml;
  }

  private _addOverlaysToUserAndManualTasks(elements: Array<IShape>): void {
    const liveExecutionTrackerIsNotAttached: boolean = !this._attached;
    if (liveExecutionTrackerIsNotAttached) {
      return;
    }

    const activeManualAndUserTasks: Array<IShape> = elements.filter((element: IShape) => {
      const elementIsAUserOrManualTask: boolean = element.type === 'bpmn:UserTask'
                                               || element.type === 'bpmn:ManualTask';

      return elementIsAUserOrManualTask;
    });

    const activeManualAndUserTaskIds: Array<string> =  activeManualAndUserTasks.map((element: IShape) => element.id).sort();

    const elementsWithActiveTokenDidNotChange: boolean = activeManualAndUserTaskIds.toString() === this._previousElementIdsWithActiveToken.toString();
    const allActiveElementsHaveAnOverlay: boolean = activeManualAndUserTaskIds.length === Object.keys(this._overlays._overlays).length;

    if (elementsWithActiveTokenDidNotChange && allActiveElementsHaveAnOverlay) {
      return;
    }

    for (const elementId of this._elementsWithEventListeners) {
      document.getElementById(elementId).removeEventListener('click', this._handleElementClick);
    }

    this._elementsWithEventListeners = [];
    this._overlays.clear();

    for (const element of activeManualAndUserTasks) {
      this._overlays.add(element, {
        position: {
          left: -1,
          top: -1,
        },
        html: `<div class="play-task-button-container" id="${element.id}"><i class="fas fa-play play-task-button"></i></div>`,
      });

      document.getElementById(element.id).addEventListener('click', this._handleElementClick);

      this._elementsWithEventListeners.push(element.id);
    }
  }

  private _handleElementClick: (event: MouseEvent) => void =
    (event: MouseEvent): void => {
      const elementId: string = (event.target as HTMLDivElement).id;

      this._router.navigateToRoute('task-dynamic-ui', {
        correlationId: this._correlationId,
        processModelId: this._processModelId,
        taskId: elementId,
      });
    }

  private _elementClickHandler: (event: IEvent) => Promise<void> = async(event: IEvent) => {
    const clickedElement: IShape = event.element;
    const clickedElementIsNotAUserOrManualTask: boolean = clickedElement.type !== 'bpmn:UserTask'
                                                       && clickedElement.type !== 'bpmn:ManualTask';
    if (clickedElementIsNotAUserOrManualTask) {
      return;
    }

    const elementHasNoActiveToken: boolean = !this._hasElementActiveToken(clickedElement.id);
    if (elementHasNoActiveToken) {
      return;
    }

    this._router.navigateToRoute('task-dynamic-ui', {
      correlationId: this._correlationId,
      processModelId: this._processModelId,
      taskId: clickedElement.id,
    });
  }

  private async _getElementsWithActiveToken(elements: Array<IShape>): Promise<Array<IShape> | null> {
    const identity: IIdentity = this._getIdentity();

    const getActiveTokens: Function = async(): Promise<Array<ActiveToken> | null> => {
      for (let retries: number = 0; retries < this._retryCount; retries++) {
        try {
          return await this._managementApiClient.getActiveTokensForCorrelationAndProcessModel(identity,
                                                                                              this._correlationId,
                                                                                              this._processModelId);
        } catch (error) {
          // Do nothing
        }
      }

      return null;
    };

    const activeTokens: Array<ActiveToken> | null = await getActiveTokens();

    const couldNotGetActiveTokens: boolean = activeTokens === null;
    if (couldNotGetActiveTokens) {
      return null;
    }

    this._activeTokens = activeTokens;
    const elementsWithActiveToken: Array<IShape> = this._activeTokens.map((activeToken: ActiveToken): IShape => {
      const elementWithActiveToken: IShape = elements.find((element: IShape) => {
        return element.id === activeToken.flowNodeId;
      });

      return elementWithActiveToken;
    });

    return elementsWithActiveToken;
  }

  private async _getElementsWithTokenHistory(elements: Array<IShape>): Promise<Array<IShape> | null> {
    const identity: IIdentity = this._getIdentity();

    const getTokenHistoryGroup: Function = async(): Promise<TokenHistoryGroup | null> => {
      for (let retries: number = 0; retries < this._retryCount; retries++) {
        try {
          return await this._managementApiClient.getTokensForCorrelationAndProcessModel(identity,
                                                                                        this._correlationId,
                                                                                        this._processModelId);
        } catch {
          // Do nothing
        }
      }

      return null;
    };

    const tokenHistoryGroups: TokenHistoryGroup =  await getTokenHistoryGroup();

    const couldNotGetTokenHistory: boolean = tokenHistoryGroups === null;
    if (couldNotGetTokenHistory) {
      return null;
    }

    const elementsWithTokenHistory: Array<IShape> = [];

    for (const flowNodeId in tokenHistoryGroups) {
      const elementFromTokenHistory: IShape = elements.find((element: IShape) => {
        return element.id === flowNodeId;
      });

      const elementWithIncomingElements: Array<IShape> = this._getElementWithIncomingElements(elementFromTokenHistory, tokenHistoryGroups);

      elementsWithTokenHistory.push(...elementWithIncomingElements);
    }

    return elementsWithTokenHistory;
  }

  private _getElementWithIncomingElements(element: IShape,
                                          tokenHistoryGroups: TokenHistoryGroup): Array<IShape> {

    const elementWithIncomingElements: Array<IShape> = [];

    const elementHasNoTokenHistory: boolean = !this._hasElementTokenHistory(element.id, tokenHistoryGroups);

    if (elementHasNoTokenHistory) {
      return [];
    }

    elementWithIncomingElements.push(element);

    const incomingElementsAsIModdleElement: Array<IModdleElement> = element.businessObject.incoming;

    const elementHasIncomingElements: boolean = incomingElementsAsIModdleElement === undefined;
    if (elementHasIncomingElements) {
      return elementWithIncomingElements;
    }

    for (const incomingElement of incomingElementsAsIModdleElement) {
      const incomingElementAsShape: IShape = this._elementRegistry.get(incomingElement.id);
      const sourceOfIncomingElement: IShape = incomingElementAsShape.source;

      const incomignElementHasNoSource: boolean = sourceOfIncomingElement === undefined;
      if (incomignElementHasNoSource) {
        continue;
      }

      const previousElementIsTask: boolean = sourceOfIncomingElement.type.includes('Task');

      if (previousElementIsTask) {
        const elementHasActiveToken: boolean = this._hasElementActiveToken(sourceOfIncomingElement.id);

        if (elementHasActiveToken) {
          continue;
        }

        elementWithIncomingElements.push(incomingElementAsShape);

      } else {
        elementWithIncomingElements.push(incomingElementAsShape);

        const sourceHasNoTokenHistory: boolean = !this._hasElementTokenHistory(sourceOfIncomingElement.id, tokenHistoryGroups);
        if (sourceHasNoTokenHistory) {
          elementWithIncomingElements.push(sourceOfIncomingElement);
        }

        continue;
      }
    }

    return elementWithIncomingElements;
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

  private _hasElementTokenHistory(elementId: string, tokenHistoryGroups: TokenHistoryGroup): boolean {

    const tokenHistoryFromFlowNodeInstanceFound: boolean = tokenHistoryGroups[elementId] !== undefined;

    return tokenHistoryFromFlowNodeInstanceFound;
  }

  private _hasElementActiveToken(elementId: string): boolean {
    const activeTokenForFlowNodeInstance: ActiveToken = this._activeTokens.find((activeToken: ActiveToken) => {
      const activeTokenIsFromFlowNodeInstance: boolean = activeToken.flowNodeId === elementId;

      return activeTokenIsFromFlowNodeInstance;
    });

    return activeTokenForFlowNodeInstance !== undefined;
  }

  private async _getXml(): Promise<string> {
    const identity: IIdentity = this._getIdentity();

    // This is necessary because the managementApi sometimes throws an error when the correlation is not yet existing.
    const getCorrelation: () => Promise<Correlation> = async(): Promise<Correlation> => {
      // tslint:disable-next-line no-magic-numbers
      for (let retries: number = 0; retries < this._retryCount; retries++) {
        try {
          return await this._managementApiClient.getCorrelationById(identity, this._correlationId);
        } catch {
          // Do nothing;
        }
      }

      this._notificationService.showNotification(NotificationType.ERROR, 'Could not get correlation. Please try to start the process again.');

      return undefined;
    };

    const correlation: Correlation = await getCorrelation();

    const errorGettingCorrelation: boolean = correlation === undefined;
    if (errorGettingCorrelation) {
      return;
    }

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

  private async _importXmlIntoDiagramViewer(xml: string): Promise<void> {
    const xmlIsNotLoaded: boolean = (xml === undefined || xml === null);

    if (xmlIsNotLoaded) {
      const notificationMessage: string = 'The xml could not be loaded. Please try to start the process again.';
      this._notificationService.showNotification(NotificationType.ERROR, notificationMessage);

      return;
    }

    const xmlImportPromise: Promise<void> = new Promise((resolve: Function, reject: Function): void => {
      this._diagramViewer.importXML(xml, (importXmlError: Error) => {
        if (importXmlError) {
          reject(importXmlError);

          return;
        }
        resolve();
      });
    });

    return xmlImportPromise;
  }

  private async _importXmlIntoDiagramModeler(xml: string): Promise<void> {
    const xmlIsNotLoaded: boolean = (xml === undefined || xml === null);

    if (xmlIsNotLoaded) {
      const notificationMessage: string = 'The xml could not be loaded. Please try to start the process again.';
      this._notificationService.showNotification(NotificationType.ERROR, notificationMessage);

      return;
    }

    const xmlImportPromise: Promise<void> = new Promise((resolve: Function, reject: Function): void => {
      this._diagramModeler.importXML(xml, (importXmlError: Error) => {
        if (importXmlError) {
          reject(importXmlError);

          return;
        }
        resolve();
      });
    });

    return xmlImportPromise;
  }

  private async _exportXmlFromDiagramModeler(): Promise<string> {
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

  private async _exportXmlFromDiagramViewer(): Promise<string> {
    const saveXmlPromise: Promise<string> = new Promise((resolve: Function, reject: Function): void =>  {
      const xmlSaveOptions: IBpmnXmlSaveOptions = {
        format: true,
      };

      this._diagramViewer.saveXML(xmlSaveOptions, async(saveXmlError: Error, xml: string) => {
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
      const correlationIsStillActive: boolean = await this._isCorrelationStillActive();

      const previousXml: string = await this._exportXmlFromDiagramViewer();
      const xml: string = await this._getXml();

      const couldNotGetXml: boolean = xml === undefined;
      if (couldNotGetXml) {
        return;
      }

      const colorizedXml: string | null = await this._colorizeXml(xml);

      const colorizingFailed: boolean = colorizedXml === null;
      if (colorizingFailed) {
        const notificationMessage: string = 'Could not get tokens. Please try to reopen the Live Execution Tracker or start the process again.';
        this._notificationService.showNotification(NotificationType.ERROR, notificationMessage);

        return;
      }

      const xmlChanged: boolean = previousXml !== colorizedXml;
      if (xmlChanged) {
        await this._importXmlIntoDiagramViewer(colorizedXml);
      }

      if (correlationIsStillActive && this._attached) {
        this._startPolling();
      }
    }, environment.processengine.liveExecutionTrackerPollingIntervalInMs);
  }

  private _stopPolling(): void {
    clearTimeout(this._pollingTimer);
  }

  private async _isCorrelationStillActive(): Promise<boolean> {
    const identity: IIdentity = this._getIdentity();

    const getActiveCorrelations: Function = async(): Promise<Array<Correlation> | null> => {
      for (let retries: number = 0; retries < this._retryCount; retries++) {
        try {
          return await this._managementApiClient.getActiveCorrelations(identity);
        } catch {
          // Do nothing
        }
      }

      const notificationMessage: string = 'Could not get active correlations. Please try to start the process again.';
      this._notificationService.showNotification(NotificationType.ERROR, notificationMessage);
    };

    const allActiveCorrelations: Array<Correlation> = await getActiveCorrelations();

    const couldNotGetActiveCorrelations: boolean = allActiveCorrelations === null;
    if (couldNotGetActiveCorrelations) {
      return false;
    }

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
  }

  private _getIdentity(): IIdentity {
    const accessToken: string = this._authenticationService.getAccessToken();
    const identity: IIdentity = {
      token: accessToken,
    };

    return identity;
  }
}
