import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';

import {IDiagram} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';

import environment from '../../environment';
import {BpmnIo} from '../bpmn-io/bpmn-io';

interface RouteParameters {
  diagramName: string;
}

@inject('SolutionExplorerServiceFileSystem', EventAggregator)
export class DiagramDetail {

  public diagram: IDiagram;
  public bpmnio: BpmnIo;

  private _solutionExplorerService: ISolutionExplorerService;
  private _eventAggregator: EventAggregator;
  private _subscriptions: Array<Subscription>;
  private _diagramHasChanged: boolean;

  constructor(solutionExplorerService: ISolutionExplorerService, eventAggregator: EventAggregator) {
    this._solutionExplorerService = solutionExplorerService;
    this._eventAggregator = eventAggregator;
  }

  public async activate(routeParameters: RouteParameters): Promise<void> {
    this.diagram = await this._solutionExplorerService.loadDiagram(routeParameters.diagramName);

    this._diagramHasChanged = false;
  }

  public attached(): void {
    this._eventAggregator.publish(environment.events.navBar.showTools, this.diagram);
    this._eventAggregator.publish(environment.events.statusBar.showXMLButton);

    this._subscriptions = [
      this._eventAggregator.subscribe(environment.events.processDefDetail.saveDiagram, () => {
        this._saveDiagram();
      }),
    ];
  }

  public detached(): void {
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }

    this._eventAggregator.publish(environment.events.navBar.hideTools);
    this._eventAggregator.publish(environment.events.statusBar.hideXMLButton);
  }

  private async _saveDiagram(): Promise<void> {
    this.diagram.xml = await this.bpmnio.getXML();
    this._solutionExplorerService.saveDiagram(this.diagram);
  }
}
