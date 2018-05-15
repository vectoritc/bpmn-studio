import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import environment from '../../environment';

@inject(EventAggregator)
export class StatusBar {

  public baseRoute: string = environment.bpmnStudioClient.baseRoute;
  public showXMLButton: boolean = false;
  public xmlIsShown: boolean = false;

  private eventAggregator: EventAggregator;

  constructor(eventAggregator: EventAggregator) {
    this.eventAggregator = eventAggregator;
  }

  public attached(): void {
    this.eventAggregator.subscribe(environment.events.statusBar.showXMLButton, () => {
      this.showXMLButton = true;
    });

    this.eventAggregator.subscribe(environment.events.statusBar.hideXMLButton, () => {
      this.showXMLButton = false;
    });

    this.eventAggregator.subscribe(environment.events.statusBar.updateBaseRoute, (newBaseRoute: string) => {
      this.baseRoute = newBaseRoute;
    });
  }

  public toggleXMLView(): void {
    this.eventAggregator.publish(environment.events.processDefDetail.toggleXMLView);
    this.xmlIsShown = !this.xmlIsShown; ,
  }
}
