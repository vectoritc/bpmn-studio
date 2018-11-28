import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';

import {IDiagram} from '@process-engine/solutionexplorer.contracts';

import {IActiveSolutionAndDiagramService, ISolutionEntry} from '../../contracts';
import environment from '../../environment';
import {Dashboard} from './dashboard/dashboard';

export interface IInspectRouteParameters {
  processModelId?: string;
  view?: string;
  latestSource?: string;
}

@inject(EventAggregator, 'ActiveSolutionAndDiagramService')
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
  private _activeSolutionAndDiagramService: IActiveSolutionAndDiagramService;
  private _activeSolutionEntry: ISolutionEntry;

  constructor(eventAggregator: EventAggregator, activateSolutionAndDiagramService: IActiveSolutionAndDiagramService) {
    this._eventAggregator = eventAggregator;
    this._activeSolutionAndDiagramService = activateSolutionAndDiagramService;
  }

  public activate(routeParameters: IInspectRouteParameters): void {
    this.activeDiagram = this._activeSolutionAndDiagramService.getActiveDiagram();
    this._activeSolutionEntry = this._activeSolutionAndDiagramService.getActiveSolutionEntry();

    const routeViewIsDashboard: boolean = routeParameters.view === 'dashboard';
    const routeViewIsHeatmap: boolean = routeParameters.view === 'heatmap';
    const routeViewIsInspectCorrelation: boolean = routeParameters.view === 'inspect-correlation';

    const latestSourceIsPE: boolean = this._activeSolutionEntry.uri.startsWith('http');

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

      if (latestSourceIsPE) {
        this._eventAggregator.publish(environment.events.navBar.showInspectButtons);
        this._eventAggregator.publish(environment.events.navBar.toggleDashboardView);
      }
    } else if (routeViewIsHeatmap) {
      this._eventAggregator.publish(environment.events.navBar.showInspectButtons);
      this._eventAggregator.publish(environment.events.navBar.toggleHeatmapView);

      this.showDashboard = false;
      this.showHeatmap = true;
      this.showInspectCorrelation = false;
    } else if (routeViewIsInspectCorrelation) {
      this._eventAggregator.publish(environment.events.navBar.showInspectButtons);
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

    this._eventAggregator.publish(environment.events.processSolutionPanel.navigateToInspect);

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
    this._eventAggregator.publish(environment.events.navBar.hideProcessName);

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
