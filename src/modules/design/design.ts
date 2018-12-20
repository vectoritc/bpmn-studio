import {EventAggregator} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';

import {IDiagram} from '@process-engine/solutionexplorer.contracts';

import {ISolutionEntry, ISolutionService} from '../../contracts';
import environment from '../../environment';
import {DiagramDetail} from './diagram-detail/diagram-detail';

export interface IDesignRouteParameters {
  view?: string;
  diagramName?: string;
  solutionUri?: string;
}

@inject(EventAggregator, 'SolutionService')
export class Deisgn {

  @bindable() public activeDiagram: IDiagram;
  @bindable() public activeSolutionEntry: ISolutionEntry;
  public showDetail: boolean = true;
  public showXML: boolean;
  public showDiff: boolean;
  public xmlForDiff: string;
  public diagramDetail: DiagramDetail;

  private _eventAggregator: EventAggregator;
  private _solutionService: ISolutionService;

  constructor(eventAggregator: EventAggregator, solutionService: ISolutionService) {
    this._eventAggregator = eventAggregator;
    this._solutionService = solutionService;
  }

  public async activate(routeParameters: IDesignRouteParameters): Promise<void> {
    const solutionIsSet: boolean = routeParameters.solutionUri !== undefined;
    const diagramNameIsSet: boolean = routeParameters.diagramName !== undefined;

    if (solutionIsSet) {
      this.activeSolutionEntry = this._solutionService.getSolutionEntryForUri(routeParameters.solutionUri);
      /**
       * We have to open the solution here again since if we come here after a
       * reload the solution might not be opened yet.
       */
      await this.activeSolutionEntry.service.openSolution(this.activeSolutionEntry.uri, this.activeSolutionEntry.identity);

      this.activeDiagram = diagramNameIsSet ? await this.activeSolutionEntry.service.loadDiagram(routeParameters.diagramName) : undefined;
    }

    const routeViewIsDetail: boolean = routeParameters.view === 'detail';
    const routeViewIsXML: boolean = routeParameters.view === 'xml';
    const routeViewIsDiff: boolean = routeParameters.view === 'diff';

    if (routeViewIsDetail) {
      this.showDetail = true;
      this.showXML = false;
      this.showDiff = false;

    } else if (routeViewIsXML) {

      this.showDetail = false;
      this.showXML = true;
      this.showDiff = false;
    } else if (routeViewIsDiff) {
      this.xmlForDiff = await this.diagramDetail.getXML();
      this.showDetail = false;
      this.showXML = false;
      this.showDiff = true;
    }
  }

  public detached(): void {
    this._eventAggregator.publish(environment.events.statusBar.hideDiagramViewButtons);
  }

}
