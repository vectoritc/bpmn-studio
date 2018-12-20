import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';

import {IDiagram} from '@process-engine/solutionexplorer.contracts';

import {ISolutionEntry, ISolutionService} from '../../contracts';
import environment from '../../environment';
import {Dashboard} from './dashboard/dashboard';

export interface IInspectRouteParameters {
  view?: string;
  diagramName?: string;
  solutionUri?: string;
}

@inject(EventAggregator, 'SolutionService')
export class Inspect {

  @bindable() public processModelId: string;
  @bindable() public showDashboard: boolean = true;
  @bindable() public activeDiagram: IDiagram;
  public showHeatmap: boolean = false;
  public showInspectCorrelation: boolean = false;
  public dashboard: Dashboard;
  public showTokenViewer: boolean = false;
  public tokenViewerButtonDisabled: boolean = false;

  private _eventAggregator: EventAggregator;
  private _subscriptions: Array<Subscription>;
  private _solutionService: ISolutionService;
  private _activeSolutionEntry: ISolutionEntry;

  constructor(eventAggregator: EventAggregator,
              solutionService: ISolutionService) {
    this._eventAggregator = eventAggregator;
    this._solutionService = solutionService;
  }

  public async activate(routeParameters: IInspectRouteParameters): Promise<void> {
    const solutionIsSet: boolean = routeParameters.solutionUri !== undefined;
    const diagramNameIsSet: boolean = routeParameters.diagramName !== undefined;

    if (solutionIsSet) {
      this._activeSolutionEntry = this._solutionService.getSolutionEntryForUri(routeParameters.solutionUri);
      /**
       * We have to open the solution here again since if we come here after a
       * reload the solution might not be opened yet.
       */
      await this._activeSolutionEntry.service.openSolution(this._activeSolutionEntry.uri, this._activeSolutionEntry.identity);

      if (diagramNameIsSet) {
        this.activeDiagram = await this._activeSolutionEntry.service.loadDiagram(routeParameters.diagramName);
      }
    }

    const routeViewIsDashboard: boolean = routeParameters.view === 'dashboard';
    const routeViewIsHeatmap: boolean = routeParameters.view === 'heatmap';
    const routeViewIsInspectCorrelation: boolean = routeParameters.view === 'inspect-correlation';

    if (routeViewIsDashboard) {
      this.showHeatmap = false;
      this.showDashboard = true;
      this.showInspectCorrelation = false;

      setTimeout(() => {
        const dashboardIsAttached: boolean = this.dashboard !== undefined;

        if (dashboardIsAttached) {
          this.dashboard.canActivate();
        }
      }, 0);

      this._eventAggregator.publish(environment.events.navBar.toggleDashboardView);
    } else if (routeViewIsHeatmap) {
      this._eventAggregator.publish(environment.events.navBar.toggleHeatmapView);

      this.showDashboard = false;
      this.showHeatmap = true;
      this.showInspectCorrelation = false;
    } else if (routeViewIsInspectCorrelation) {
      this._eventAggregator.publish(environment.events.navBar.toggleInspectCorrelationView);

      this.showDashboard = false;
      this.showHeatmap = false;
      this.showInspectCorrelation = true;
    }
  }

  public attached(): void {
    const dashboardIsAttached: boolean = this.dashboard !== undefined;

    if (dashboardIsAttached) {
      this.dashboard.canActivate();
    }

    this._subscriptions = [
      this._eventAggregator.subscribe(environment.events.inspect.shouldDisableTokenViewerButton, (tokenViewerButtonDisabled: boolean) => {
        this.tokenViewerButtonDisabled = tokenViewerButtonDisabled;
      }),
    ];
  }

  public detached(): void {
    this._eventAggregator.publish(environment.events.navBar.inspectNavigateToDashboard);
    this._eventAggregator.publish(environment.events.processSolutionPanel.navigateToDesigner);
    this._eventAggregator.publish(environment.events.navBar.hideInspectButtons);

    for (const subscription of this._subscriptions) {
      subscription.dispose();
    }
  }

  public toggleShowTokenViewer(): void {
    if (this.tokenViewerButtonDisabled) {
      return;
    }

    this.showTokenViewer = !this.showTokenViewer;

    this._eventAggregator.publish(environment.events.inspectCorrelation.showTokenViewer, this.showTokenViewer);
  }
}
