import {EventAggregator} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';

import * as bundle from '@process-engine/bpmn-js-custom-bundle';
import {FlowNodeRuntimeInformation} from '@process-engine/kpi_api_contracts';
import {ProcessModelExecution} from '@process-engine/management_api_contracts';

import {IBpmnModeler, IElementRegistry, IOverlay} from '../../contracts/index';
import environment from '../../environment';
import {IFlowNodeAssociation, IHeatmapService} from './contracts';

interface RouteParameters {
  processModelId: string;
}

@inject('HeatmapService', EventAggregator)
export class Heatmap {
  public viewerContainer: HTMLDivElement;
  @bindable() public processModelId: string;
  @bindable() public dashboardIsShown: string;

  private _processModel: ProcessModelExecution.ProcessModel;
  private _heatmapService: IHeatmapService;
  private _modeler: IBpmnModeler;
  private _viewer: IBpmnModeler;
  private _eventAggregator: EventAggregator;

  constructor(heatmapService: IHeatmapService, eventAggregator: EventAggregator) {
    this._heatmapService = heatmapService;
    this._eventAggregator = eventAggregator;
  }

  /**
   * This method gets called if the processModelId was changed.
   * It removes the bpmn-js container from the DOM and destroys the viewer.
   *
   * After that the heatmap will be attached again for the new
   * processModelId.
   *
   * Info: The used processModelId is binded by the inspect view.
   */
  public processModelIdChanged(): void {
    const noProcessModelId: boolean = this.processModelId === undefined || this.processModelId === null;
    if (noProcessModelId) {
      return;
    }

    const attachedViewer: Element = document.getElementsByClassName('bjs-container')[0];

    const viewerContainerIsAttached: boolean = this.viewerContainer !== undefined
                                            && this.viewerContainer !== null
                                            && this.viewerContainer.childElementCount > 1
                                            && attachedViewer !== undefined
                                            && attachedViewer !== null;

    if (viewerContainerIsAttached) {
      this.viewerContainer.removeChild(attachedViewer);
    }

    const viewerIsInitialized: boolean = this._viewer !== undefined;
    if (viewerIsInitialized) {
      this._viewer.detach();
      this._viewer.destroy();
    }

    this.attached();
  }

  public async attached(): Promise<void> {
    const noProcessModelId: boolean = this.processModelId === undefined || this.processModelId === null;
    if (noProcessModelId) {
      return;
    }

    this._modeler = new bundle.modeler({
      moddleExtensions: {
        camunda: bundle.camundaModdleDescriptor,
      },
    });

    this._processModel = await this._heatmapService.getProcess(this.processModelId);

    this._eventAggregator.publish(environment.events.navBar.updateProcess, this._processModel);

    await this._pushXmlToBpmnModeler(this._processModel.xml, this._modeler);

    const elementRegistry: IElementRegistry  = this._modeler.get('elementRegistry');

    /*
     * TODO: Refactoring opportunity; HeatmapService could use a fluent API; This is how it would look like:
     * this._heatmapService
     *   .setFlowNodeAssociations(elementRegistry) // -> associations
     *   .setRuntimeInformationForProcessModel(this.processmodelid) // -> flowNodeRuntimeInformation
     *   .getColoredXML(this._modeler) // <- associations, flowNodeRuntimeInformation
     */

    const associations: Array<IFlowNodeAssociation> = await this._heatmapService.getFlowNodeAssociations(elementRegistry);

    const flowNodeRuntimeInformation: Array<FlowNodeRuntimeInformation> = await this
      ._heatmapService
      .getRuntimeInformationForProcessModel(this.processModelId);

    const xml: string = await this._heatmapService.getColoredXML(associations, flowNodeRuntimeInformation, this._modeler);

    this._viewer = new bundle.viewer({
      additionalModules:
      [
        bundle.ZoomScrollModule,
        bundle.MoveCanvasModule,
      ],
    });

    await this._pushXmlToBpmnModeler(xml, this._viewer);

    const overlays: IOverlay = this._viewer.get('overlays');

    this._heatmapService.addOverlays(overlays, elementRegistry);

    const dashboardIsNotShown: boolean = !this.dashboardIsShown;
    if (dashboardIsNotShown) {
      this._eventAggregator.publish(environment.events.navBar.showProcessName, this._processModel);
    }

    this._viewer.attachTo(this.viewerContainer);
  }

  private _pushXmlToBpmnModeler(xml: string, modeler: IBpmnModeler): Promise<void> {
    return new Promise((resolve: Function, reject: Function): void => {
      modeler.importXML(xml, (importXmlError: Error) => {
        if (importXmlError) {
          reject(importXmlError);
          return;
        }
        resolve();
      });
    });
  }

}
