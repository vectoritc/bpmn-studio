// TODO: Refactor the Process Definition List entirely
//       The big issue with this file is: it is the main
//       anchor for the studio; but it is not apparent why.
import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';

import {AuthenticationStateEvent, ISolutionEntry, ISolutionService} from '../../../contracts/index';
import environment from '../../../environment';

interface RouteParameters {
  diagramName?: string;
  solutionUri?: string;
}

@inject(EventAggregator, Router, 'SolutionService')
export class ProcessDefList {

  public allDiagrams: Array<IDiagram>;
  @bindable() public activeSolutionEntry: ISolutionEntry;

  private _eventAggregator: EventAggregator;
  private _router: Router;
  private _subscriptions: Array<Subscription>;
  private _getProcessesIntervalId: number;
  private _solutionService: ISolutionService;

  constructor(eventAggregator: EventAggregator,
              router: Router,
              solutionService: ISolutionService) {
    this._eventAggregator = eventAggregator;
    this._router = router;
    this._solutionService = solutionService;

    this._eventAggregator.publish(environment.events.refreshProcessDefs);
  }

  public async activate(routeParameters: RouteParameters): Promise<void> {
    const solutionUriIsSet: boolean = routeParameters.solutionUri !== undefined;

    const solutionUri: string = solutionUriIsSet
                              ? routeParameters.solutionUri
                              : window.localStorage.getItem('InternalProcessEngineRoute');

    this._activeSolutionEntry = this._solutionService.getSolutionEntryForUri(solutionUri);
    await this._activeSolutionEntry.service.openSolution(this._activeSolutionEntry.uri, this._activeSolutionEntry.identity);

    await this._updateDiagramList();
  }

  public attached(): void {

    this._updateDiagramList();

    this._getProcessesIntervalId = window.setInterval(() => {
      this._updateDiagramList();
      this._eventAggregator.publish(environment.events.refreshProcessDefs);
      // tslint:disable-next-line
    }, environment.processengine.processDefListPollingIntervalInMs);

    this._subscriptions = [
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGIN, () => {
        this._updateDiagramList();
      }),
      this._eventAggregator.subscribe(AuthenticationStateEvent.LOGOUT, () => {
        this._updateDiagramList();
      }),
    ];
  }

  public detached(): void {
    clearInterval(this._getProcessesIntervalId);
    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  public showDetails(diagramName: string): void {

    this._router.navigateToRoute('design', {
      diagramName: diagramName,
      solutionUri: this._activeSolutionEntry.uri,
      view: 'detail',
    });
  }

  private async _updateDiagramList(): Promise<void> {
    const solution: ISolution = await this._activeSolutionEntry.service.loadSolution();
    this.allDiagrams = solution.diagrams;
  }
}
