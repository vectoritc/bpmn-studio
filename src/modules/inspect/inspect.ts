import {EventAggregator} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';

import {IDiagram} from '@process-engine/solutionexplorer.contracts';

import environment from '../../environment';
import {Dashboard} from '../dashboard/dashboard';

export interface IInspectRouteParameters {
  processModelId?: string;
  view?: string;
  latestSource?: string;
}

@inject(EventAggregator)
export class Inspect {

  @bindable() public processModelId: string;
  public showHeatmap: boolean = false;
  @bindable() public showDashboard: boolean = true;
  public showInspectCorrelation: boolean = false;
  public dashboard: Dashboard;

  private _eventAggregator: EventAggregator;

  constructor(eventAggregator: EventAggregator) {
    this._eventAggregator = eventAggregator;
  }

  public activate(routeParameters: IInspectRouteParameters): void {

    const noRouteParameters: boolean = routeParameters.processModelId === undefined || routeParameters.view === undefined;
    if (noRouteParameters) {
      return;
    }

    this.processModelId = routeParameters.processModelId;
    const process: IDiagram = {
      name: this.processModelId,
      xml: '',
      uri: '',
      id: this.processModelId,
    };

    const routeViewIsDashboard: boolean = routeParameters.view === 'dashboard';
    const routeViewIsHeatmap: boolean = routeParameters.view === 'heatmap';
    const routeViewIsInspectCorrelation: boolean = routeParameters.view === 'inspect-correlation';
    const latestSourceIsPE: boolean = routeParameters.latestSource === 'process-engine';

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
        this._eventAggregator.publish(environment.events.navBar.showProcessName, process);
      }
    } else if (routeViewIsHeatmap) {
      this._eventAggregator.publish(environment.events.navBar.showInspectButtons);
      this._eventAggregator.publish(environment.events.navBar.toggleHeatmapView);
      this._eventAggregator.publish(environment.events.navBar.showProcessName, process);

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

    this._eventAggregator.publish(environment.events.processSolutionPanel.navigateToHeatmap);
  }

  public detached(): void {
    this._eventAggregator.publish(environment.events.navBar.inspectNavigateToDashboard);
    this._eventAggregator.publish(environment.events.processSolutionPanel.navigateToDesigner);
    this._eventAggregator.publish(environment.events.navBar.hideInspectButtons);
    this._eventAggregator.publish(environment.events.navBar.hideProcessName);
  }
}
