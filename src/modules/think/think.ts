import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {ISolutionEntry, ISolutionService} from '../../contracts';

export interface IThinkRouteParameters {
  view?: string;
  diagramName?: string;
  solutionUri?: string;
}

@inject('SolutionService', Router, EventAggregator)
export class Think {
  public showDiagramList: boolean = false;

  public activeSolutionEntry: ISolutionEntry;

  private _solutionService: ISolutionService;

  constructor(solutionService: ISolutionService) {
    this._solutionService = solutionService;
  }

  public async activate(routeParameters: IThinkRouteParameters): Promise<void> {
    const solutionUriIsSet: boolean = routeParameters.solutionUri !== undefined;

    const solutionUri: string = solutionUriIsSet
                              ? routeParameters.solutionUri
                              : window.localStorage.getItem('InternalProcessEngineRoute');

    this.activeSolutionEntry = this._solutionService.getSolutionEntryForUri(solutionUri);
    await this.activeSolutionEntry.service.openSolution(this.activeSolutionEntry.uri, this.activeSolutionEntry.identity);

    this.showDiagramList = true;
  }
}
