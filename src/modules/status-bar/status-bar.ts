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
  public showChangeList: boolean = false;
  public isEncryptedCommunication: boolean = false;

  public DiffMode: typeof DiffMode = DiffMode;

  private _eventAggregator: EventAggregator;
  private _router: Router;

  constructor(eventAggregator: EventAggregator, router: Router) {
    this._eventAggregator = eventAggregator;
    this._router = router;
    this._setProcessEngineRoute(environment.bpmnStudioClient.baseRoute);
  }

  public attached(): void {
    this._eventAggregator.subscribe(environment.events.statusBar.showDiagramViewButtons, () => {
      this.showDiagramViewButtons = true;
    });

    this._eventAggregator.subscribe(environment.events.statusBar.hideDiagramViewButtons, () => {
      this.showDiagramViewButtons = false;
      this.xmlIsShown = false;
      this.diffIsShown = false;
      this.showChangeList = false;
      this.currentDiffMode = undefined;
    });

    this._eventAggregator.subscribe(environment.events.configPanel.processEngineRouteChanged, (newProcessEngineRoute: string) => {
      this._setProcessEngineRoute(newProcessEngineRoute);
    });
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

  public navigateToSettings(): void {
    this._router.navigate('/configuration');
  }

  private _setProcessEngineRoute(processEngineRoute: string): void {
    // This Regex returns the protocol and the route from the processEngineRoute string
    const [, protocol, route]: RegExpExecArray = /^([^\:]+:\/\/)?(.*)$/i.exec(processEngineRoute);
    this.isEncryptedCommunication = protocol === 'https://';
    this.processEngineRoute = route;
  }
}
