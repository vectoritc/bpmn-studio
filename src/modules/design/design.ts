import {EventAggregator, Subscription} from 'aurelia-event-aggregator';
import {bindable, inject} from 'aurelia-framework';

import {IDiagram} from '@process-engine/solutionexplorer.contracts';

import {Redirect, Router} from 'aurelia-router';
import {ISolutionEntry, ISolutionService} from '../../contracts';
import environment from '../../environment';
import {DiagramDetail} from './diagram-detail/diagram-detail';

export interface IDesignRouteParameters {
  view?: string;
  diagramName?: string;
  solutionUri?: string;
}

@inject(EventAggregator, 'SolutionService', Router)
export class Design {

  @bindable() public activeDiagram: IDiagram;
  @bindable() public activeSolutionEntry: ISolutionEntry;

  public showDetail: boolean = true;
  public showXML: boolean;
  public showDiff: boolean;
  public xmlForDiff: string;
  public propertyPanelShown: boolean;
  public showPropertyPanelButton: boolean = true;
  public showDiffDestinationButton: boolean = false;
  public diffDestinationIsLocal: boolean = true;
  public diagramDetail: DiagramDetail;

  private _eventAggregator: EventAggregator;
  private _solutionService: ISolutionService;
  private _subscriptions: Array<Subscription>;
  private _router: Router;

  constructor(eventAggregator: EventAggregator, solutionService: ISolutionService, router: Router) {
    this._eventAggregator = eventAggregator;
    this._solutionService = solutionService;
    this._router = router;
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
      this.showPropertyPanelButton = true;
      this.showDiffDestinationButton = false;
    } else if (routeViewIsXML) {
      this.showDetail = false;
      this.showXML = true;
      this.showDiff = false;
      this.showDiffDestinationButton = false;
      this.showPropertyPanelButton = false;
    } else if (routeViewIsDiff) {
      this.xmlForDiff = await this.diagramDetail.getXML();
      this._showDiff();
    }
  }

  public async attached(): Promise<void> {

    this._subscriptions = [
      this._eventAggregator.subscribe(environment.events.bpmnio.propertyPanelActive, (showPanel: boolean) => {
        this.propertyPanelShown = showPanel;
      }),
    ];
  }

  public detached(): void {
    this._eventAggregator.publish(environment.events.statusBar.hideDiagramViewButtons);
    this._subscriptions.forEach((subscription: Subscription) => subscription.dispose());
  }

  public toggleDiffDestination(): void {
    this.diffDestinationIsLocal = !this.diffDestinationIsLocal;
    const diffDestination: string = this.diffDestinationIsLocal ? 'local' : 'deployed';

    this._eventAggregator.publish(environment.events.diffView.setDiffDestination, diffDestination);
  }

  public togglePanel(): void {
    this._eventAggregator.publish(environment.events.bpmnio.togglePropertyPanel);
  }

  public async canDeactivate(): Promise<Redirect> {
    const modalResult: boolean = await this.diagramDetail.canDeactivate();
    if (!modalResult) {
      /*
      * As suggested in https://github.com/aurelia/router/issues/302, we use
      * the router directly to navigate back, which results in staying on this
      * component-- and this is the desired behaviour.
      */
      return new Redirect(this._router.currentInstruction.fragment, {trigger: false, replace: false});
    }
  }

  public deactivate(): void {
    this.diagramDetail.deactivate();
  }

  private _showDiff(): void {
    this.showDiff = true;
    this.showDetail = false;
    this.showXML = false;
    this.showPropertyPanelButton = false;
    this.showDiffDestinationButton = true;
  }
}
