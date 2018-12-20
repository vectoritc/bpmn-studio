import {EventAggregator} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';

import {IDiagram} from '@process-engine/solutionexplorer.contracts';

import {ISolutionEntry, ISolutionService} from '../../contracts';
export interface IDesignRouteParameters {
  view?: string;
  diagramName?: string;
  solutionUri?: string;
}

@inject(EventAggregator, 'SolutionService')
export class Deisgn {

  @bindable() public activeDiagram: IDiagram;
  @bindable() public activeSolutionEntry: ISolutionEntry;
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

  }

  public detached(): void {
    this._eventAggregator.publish(environment.events.statusBar.hideDiagramViewButtons);
  }

}
