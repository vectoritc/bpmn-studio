import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import { ISolutionService } from '../../contracts';

export interface IThinkRouteParameters {
  view?: string;
  diagramName?: string;
  solutionUri?: string;
}

@inject('SolutionService', Router, EventAggregator)
export class Think {
  public showDiagramList: boolean = false;

  private _solutionService: ISolutionService;

  constructor(solutionService: ISolutionService) {
    this._solutionService = solutionService;
  }

  public activate(routeParameters: IThinkRouteParameters): void {
    this.showDiagramList = true;
  }
}
