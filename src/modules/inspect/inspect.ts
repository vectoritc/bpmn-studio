import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';

import {IDiagram} from '@process-engine/solutionexplorer.contracts';

import {AureliaNavigationObject, ISolutionEntry, ISolutionService} from '../../contracts';
import environment from '../../environment';
import {Dashboard} from './dashboard/dashboard';

interface IInspectRouteParameters {
  view?: string;
  diagramName?: string;
  solutionUri?: string;
}

@inject(EventAggregator, 'SolutionService')
export class Inspect {

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
    const solutionUri: string = routeParameters.solutionUri;
    const diagramName: string = routeParameters.diagramName;

    await this._updateInspectView(diagramName, solutionUri);

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
      this._eventAggregator.subscribe('router:navigation:success', async(navigationResult: AureliaNavigationObject) => {
        const solutionUri: string = navigationResult.instruction.queryParams.solutionUri;
        const diagramName: string =  navigationResult.instruction.params.diagramName;

        await this._updateInspectView(diagramName, solutionUri);
      }),
    ];
  }

  public detached(): void {
    this._eventAggregator.publish(environment.events.navBar.inspectNavigateToDashboard);
    this._eventAggregator.publish(environment.events.processSolutionPanel.navigateToDesigner);

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

  private async _updateInspectView(diagramName: string, solutionUri: string): Promise<void> {
    const solutionUriIsNotSet: boolean = solutionUri === undefined;
    if (solutionUriIsNotSet) {
      solutionUri = window.localStorage.getItem('InternalProcessEngineRoute');
    }

    this._activeSolutionEntry = this._solutionService.getSolutionEntryForUri(solutionUri);
    await this._activeSolutionEntry.service.openSolution(this._activeSolutionEntry.uri, this._activeSolutionEntry.identity);

    const solutionIsRemote: boolean = solutionUri.startsWith('http');
    if (solutionIsRemote) {
      this._eventAggregator.publish(environment.events.configPanel.processEngineRouteChanged, solutionUri);
    }

    const diagramIsSet: boolean = diagramName !== undefined;
    if (diagramIsSet) {

      const activeSolutionIsSingleDiagramSolution: boolean = solutionUri === 'Single Diagrams';
      if (activeSolutionIsSingleDiagramSolution) {
        const persistedDiagrams: Array<IDiagram> = this._solutionService.getSingleDiagrams();

        this.activeDiagram = persistedDiagrams.find((diagram: IDiagram) => {
          return diagram.name === diagramName;
        });
      } else {

        this.activeDiagram = await this._activeSolutionEntry.service.loadDiagram(diagramName);
      }
    }
  }

  public exportDiagram(exportAs: string): void {
    if (this.tokenViewerButtonDisabled) {
      return;
    }

    this._eventAggregator.publish(`${environment.events.inspect.exportDiagramAs}:${exportAs}`);
  }
}
