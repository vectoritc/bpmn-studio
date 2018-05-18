import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import environment from '../../environment';

@inject(EventAggregator)
export class StatusBar {

  public processEngineRoute: string = environment.bpmnStudioClient.baseRoute;
  public showXMLButton: boolean = false;
  public xmlIsShown: boolean = false;

  private _eventAggregator: EventAggregator;

  constructor(eventAggregator: EventAggregator) {
    this._eventAggregator = eventAggregator;
  }

  public attached(): void {
    this._eventAggregator.subscribe(environment.events.statusBar.showXMLButton, () => {
      this.showXMLButton = true;
    });

    this._eventAggregator.subscribe(environment.events.statusBar.hideXMLButton, () => {
      this.showXMLButton = false;
    });

    this._eventAggregator.subscribe(environment.events.statusBar.updateProcessEngineRoute, (newProcessEngineRoute: string) => {
      this.processEngineRoute = newProcessEngineRoute;
    });
  }

  public toggleXMLView(): void {
    this._eventAggregator.publish(environment.events.processDefDetail.toggleXMLView);
    this.xmlIsShown = !this.xmlIsShown;
  }
}
