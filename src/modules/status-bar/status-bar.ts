import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import environment from '../../environment';

@inject(EventAggregator, Router)
export class StatusBar {

  public baseRoute: string = environment.bpmnStudioClient.baseRoute;
  public showXMLButton: boolean = false;
  public xmlIsShown: boolean = false;

  private _eventAggregator: EventAggregator;
  private _router: Router;

  constructor(eventAggregator: EventAggregator, router: Router) {
    this._eventAggregator = eventAggregator;
    this._router = router;
  }

  public attached(): void {
    this._eventAggregator.subscribe(environment.events.statusBar.showXMLButton, () => {
      this.showXMLButton = true;
    });

    this._eventAggregator.subscribe(environment.events.statusBar.hideXMLButton, () => {
      this.showXMLButton = false;
    });

    this._eventAggregator.subscribe(environment.events.statusBar.updateBaseRoute, (newBaseRoute: string) => {
      this.baseRoute = newBaseRoute;
    });
  }

  public toggleXMLView(): void {
    this._eventAggregator.publish(environment.events.processDefDetail.toggleXMLView);
    this.xmlIsShown = !this.xmlIsShown;
  }

  public navigateToSettings(): void {
    this._router.navigate('/configuration');
  }
}
