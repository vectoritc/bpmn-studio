import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import environment from '../../environment';

@inject(EventAggregator, Router)
export class StatusBar {

  public processEngineRoute: string;
  public showXMLButton: boolean = false;
  public xmlIsShown: boolean = false;
  public isRouteHttps: boolean = false;

  private _eventAggregator: EventAggregator;
  private _router: Router;

  constructor(eventAggregator: EventAggregator, router: Router) {
    this._eventAggregator = eventAggregator;
    this._router = router;
    this._setProcessEngineRoute(environment.bpmnStudioClient.baseRoute);
  }

  public attached(): void {
    this._eventAggregator.subscribe(environment.events.statusBar.showXMLButton, () => {
      this.showXMLButton = true;
    });

    this._eventAggregator.subscribe(environment.events.statusBar.hideXMLButton, () => {
      this.showXMLButton = false;
      this.xmlIsShown = false;
    });

    this._eventAggregator.subscribe(environment.events.statusBar.updateProcessEngineRoute, (newProcessEngineRoute: string) => {
      this._setProcessEngineRoute(newProcessEngineRoute);
    });
  }

  private _setProcessEngineRoute(processEngineRoute: string): void {
    const [, protocol, route]: any = /^([^\:]+:\/\/)?(.*)$/i.exec(processEngineRoute);
    this.isRouteHttps = protocol === 'https://';
    this.processEngineRoute = route;
  }

  public toggleXMLView(): void {
    this._eventAggregator.publish(environment.events.processDefDetail.toggleXMLView);
    this.xmlIsShown = !this.xmlIsShown;
  }

  public navigateToSettings(): void {
    this._router.navigate('/configuration');
  }
}
