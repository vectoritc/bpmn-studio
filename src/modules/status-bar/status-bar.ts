import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

import {DiffMode} from '../../contracts/index';
import environment from '../../environment';

@inject(EventAggregator, Router)
export class StatusBar {

  public processEngineRoute: string = '';
  public showDiagramViewButtons: boolean = false;
  public diffIsShown: boolean = false;
  public currentDiffMode: DiffMode;
  public xmlIsShown: boolean = false;
  public showInspectCorrelationButtons: boolean = false;
  public showChangeList: boolean = false;
  public isEncryptedCommunication: boolean = false;
  public currentXmlIdentifier: string;
  public previousXmlIdentifier: string;
  public showInspectPanel: boolean = true;

  public DiffMode: typeof DiffMode = DiffMode;

  private _eventAggregator: EventAggregator;
  private _router: Router;
  private _subscriptions: Array<Subscription>;

  constructor(eventAggregator: EventAggregator, router: Router) {
    this._eventAggregator = eventAggregator;
    this._router = router;

    const customProcessEngineRoute: string = window.localStorage.getItem('processEngineRoute');
    const isCustomProcessEngineRouteSet: boolean = customProcessEngineRoute !== ''
                                                && customProcessEngineRoute !== null;

    const processEngineRoute: string = isCustomProcessEngineRouteSet
    ? customProcessEngineRoute
    : window.localStorage.getItem('InternalProcessEngineRoute');

    this._setProcessEngineRoute(processEngineRoute);
  }

  public attached(): void {
    this._subscriptions = [
      this._eventAggregator.subscribe(environment.events.statusBar.showDiagramViewButtons, () => {
        this.showDiagramViewButtons = true;
      }),

      this._eventAggregator.subscribe(environment.events.statusBar.hideDiagramViewButtons, () => {
        this.showDiagramViewButtons = false;
        this.xmlIsShown = false;
        this.diffIsShown = false;
        this.showChangeList = false;
        this.currentDiffMode = DiffMode.NewVsOld;
      }),

      this._eventAggregator.subscribe(environment.events.configPanel.processEngineRouteChanged, (newProcessEngineRoute: string) => {
        this._setProcessEngineRoute(newProcessEngineRoute);
      }),

      this._eventAggregator.subscribe(environment.events.statusBar.setXmlIdentifier, (xmlIdentifier: Array<string>) => {
        [this.previousXmlIdentifier, this.currentXmlIdentifier] = xmlIdentifier;
      }),

      this._eventAggregator.subscribe(environment.events.statusBar.showInspectCorrelationButtons, (showInspectCorrelation: boolean) => {
        this.showInspectCorrelationButtons = showInspectCorrelation;
      }),

      this._eventAggregator.subscribe('router:navigation:success', async(response: IAureliaRouterResponse) => {
        const queryObject: IQueryObject = this._queryStringToObject(response.instruction.queryString);
        const noSultionUriSpecified: boolean = queryObject.solutionUri === undefined;

        if (noSultionUriSpecified) {
          const remoteSolutionUri: string = window.localStorage.getItem('processEngineRoute');
          this.activeSolutionEntry = this._solutionService.getSolutionEntryForUri(remoteSolutionUri);
        } else {
          this.activeSolutionEntry = this._solutionService.getSolutionEntryForUri(queryObject.solutionUri);
        }

        const solutionIsSet: boolean = this.activeSolutionEntry !== undefined;
        if (solutionIsSet) {
          this.activeDiagram = await this.activeSolutionEntry.service.loadDiagram(response.instruction.params.diagramName);
        }
      }),
    ];

    this.currentDiffMode = DiffMode.NewVsOld;
  }

  public detached(): void {
    this._disposeAllSubscriptions();
  }

  public toggleXMLView(): void {
    if (this.diffIsShown) {
      this.toggleDiffView();
    }

    this._eventAggregator.publish(environment.events.bpmnio.toggleXMLView);
    this.xmlIsShown = !this.xmlIsShown;
  }

  public changeDiffMode(mode: DiffMode): void {
    this.currentDiffMode = mode;
    this._eventAggregator.publish(environment.events.diffView.changeDiffMode, mode);
  }

  public toggleChangeList(): void {
    this.showChangeList = !this.showChangeList;
    this._eventAggregator.publish(environment.events.diffView.toggleChangeList);
  }

  public toggleDiffView(): void {
    if (this.xmlIsShown) {
      this.toggleXMLView();
    }

    this._eventAggregator.publish(environment.events.bpmnio.toggleDiffView);
    this.diffIsShown = !this.diffIsShown;
  }

  public toggleInspectPanel(): void {
    this.showInspectPanel = !this.showInspectPanel;

    this._eventAggregator.publish(environment.events.inspectCorrelation.showInspectPanel, this.showInspectPanel);
  }

  public navigateToSettings(): void {
    this._router.navigateToRoute('configuration');
  }

  private _setProcessEngineRoute(processEngineRoute: string): void {
    // This Regex returns the protocol and the route from the processEngineRoute string
    const [, protocol, route]: RegExpExecArray = /^([^\:]+:\/\/)?(.*)$/i.exec(processEngineRoute);
    this.isEncryptedCommunication = protocol === 'https://';
    this.processEngineRoute = route;
  }
  private _disposeAllSubscriptions(): void {
    this._subscriptions.forEach((subscription: Subscription) => {
      subscription.dispose();
    });
  }
}
